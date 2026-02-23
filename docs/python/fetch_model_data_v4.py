import datetime as dt
import json
import os
import re
from collections import defaultdict
from difflib import SequenceMatcher

import pandas as pd
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# --- 配置信息 ---
AA_API_KEY = os.getenv("AA_API_KEY", "aa_UVcVfuiZkbPQIaQxPZkvaMiIgkihaWzF")
AA_API_BASE_URL = "https://artificialanalysis.ai/api/v2/data"
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/models"
OUTPUT_CSV_FILE = "comprehensive_merged_data_v3.csv"
REQUEST_TIMEOUT = 30

# 可按需扩展端点。脚本会自动跳过失败端点，保证整体产出。
AA_ENDPOINTS = [
    "llms/models",
    "media/text-to-image",
    "media/image-editing",
    "media/text-to-speech",
]


def build_session():
    session = requests.Session()
    retry = Retry(
        total=3,
        connect=3,
        read=3,
        backoff_factor=0.5,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=("GET",),
    )
    session.mount("https://", HTTPAdapter(max_retries=retry))
    session.mount("http://", HTTPAdapter(max_retries=retry))
    return session


def safe_json(value):
    if isinstance(value, (list, dict)):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return value


def normalize_name(name):
    if not isinstance(name, str):
        return ""
    text = name.lower().strip()
    text = text.replace("gpt-4o", "gpt4o").replace("gpt-4-omni", "gpt4o")
    text = text.replace("claude-3-opus-20240229", "claude-3-opus")
    text = text.replace("claude-3-sonnet-20240229", "claude-3-sonnet")
    text = text.replace("claude-3-haiku-20240307", "claude-3-haiku")
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"[^a-z0-9\-/]", "", text)
    text = text.strip("-/")
    return text


def strip_provider_prefix(text):
    if not isinstance(text, str):
        return ""
    # OpenRouter 常见展示名: "Anthropic: Claude 3.5 Haiku"
    return re.sub(r"^[^:]{1,40}:\s*", "", text).strip()


def remove_date_and_release_noise(text):
    if not isinstance(text, str):
        return ""
    t = text.lower()
    # 去括号标注，如 "(Oct '24)" / "(May '25)"
    t = re.sub(r"\([^)]*\)", " ", t)
    # 去常见日期/发布尾巴
    t = re.sub(r"\b(19|20)\d{2}\b", " ", t)
    t = re.sub(r"\b\d{8}\b", " ", t)  # yyyymmdd
    t = re.sub(r"\b\d{6}\b", " ", t)  # yymmdd
    t = re.sub(r"\b\d{4}\b", " ", t)  # mmdd / yymm
    t = re.sub(r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[-\s']?\d{2,4}\b", " ", t)
    t = re.sub(r"\b(?:preview|latest|stable|release|experimental|exp)\b", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t


def model_core_key(value):
    if not isinstance(value, str):
        return ""
    text = strip_provider_prefix(value)
    text = remove_date_and_release_noise(text)
    text = normalize_name(text)
    # 去常见渠道尾巴
    text = re.sub(r"(?:[-_/](?:free|beta|alpha|chat|instruct|latest))+$", "", text)
    text = re.sub(r"-{2,}", "-", text).strip("-/")
    return text


def split_tokens(key):
    if not isinstance(key, str) or key == "":
        return set()
    tokens = [t for t in re.split(r"[-_/]+", key) if t]
    return set(tokens)


def first_non_empty(values):
    for value in values:
        if value is None:
            continue
        if isinstance(value, float) and pd.isna(value):
            continue
        if isinstance(value, str) and value.strip() == "":
            continue
        return value
    return None


def collapse_group(df):
    if df.empty:
        return pd.Series(dtype="object")
    result = {}
    for col in df.columns:
        result[col] = first_non_empty(df[col].tolist())
    return pd.Series(result)


def fetch_aa_data(session, endpoint):
    url = f"{AA_API_BASE_URL}/{endpoint}"
    print(f"正在从 {url} 获取数据...")
    headers = {"x-api-key": AA_API_KEY}
    try:
        response = session.get(url, headers=headers, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        payload = response.json().get("data", [])
        print(f"成功获取 {endpoint} 数据，共 {len(payload)} 条。")
        for item in payload:
            item["source_endpoint"] = endpoint
        return payload
    except requests.exceptions.RequestException as error:
        print(f"从 {url} 获取数据时出错: {error}")
        return []


def fetch_openrouter_data(session):
    print(f"正在从 {OPENROUTER_API_URL} 获取数据...")
    try:
        response = session.get(OPENROUTER_API_URL, timeout=REQUEST_TIMEOUT)
        response.raise_for_status()
        payload = response.json().get("data", [])
        print(f"成功获取 OpenRouter 数据，共 {len(payload)} 条。")
        return payload
    except requests.exceptions.RequestException as error:
        print(f"从 OpenRouter 获取数据时出错: {error}")
        return []


def build_aa_df(raw_records):
    if not raw_records:
        return pd.DataFrame(columns=["aa_primary_key", "aa_aliases"])

    df = pd.json_normalize(raw_records, sep="_").map(safe_json).add_prefix("aa_")
    for required_col in ("aa_id", "aa_name", "aa_slug"):
        if required_col not in df.columns:
            df[required_col] = None

    df["aa_primary_key"] = (
        df["aa_slug"].map(normalize_name)
        .where(df["aa_slug"].notna(), "")
        .replace("", pd.NA)
        .fillna(df["aa_name"].map(normalize_name))
        .replace("", pd.NA)
        .fillna(df["aa_id"].map(normalize_name))
        .fillna("")
    )

    def build_aliases(row):
        slug = row.get("aa_slug")
        name = row.get("aa_name")
        model_id = row.get("aa_id")
        aliases = {
            normalize_name(slug),
            normalize_name(name),
            normalize_name(model_id),
            model_core_key(slug),
            model_core_key(name),
            model_core_key(model_id),
        }
        aliases.discard("")
        return sorted(aliases)

    df["aa_aliases"] = df.apply(build_aliases, axis=1)
    df["aa_core_key"] = (
        df["aa_name"].apply(model_core_key).replace("", pd.NA).fillna(df["aa_slug"].apply(model_core_key)).fillna("")
    )

    grouped = (
        df.groupby("aa_primary_key", dropna=False, as_index=False)
        .apply(collapse_group, include_groups=False)
        .reset_index(drop=True)
    )
    grouped["aa_aliases"] = grouped["aa_aliases"].apply(
        lambda x: x if isinstance(x, list) else []
    )
    return grouped


def build_or_df(raw_records):
    if not raw_records:
        return pd.DataFrame(columns=["or_primary_key", "or_aliases"])

    df = pd.json_normalize(raw_records, sep="_").map(safe_json).add_prefix("or_")
    for required_col in ("or_id", "or_name", "or_canonical_slug"):
        if required_col not in df.columns:
            df[required_col] = None

    def id_variants(or_id):
        if not isinstance(or_id, str):
            return []
        parts = or_id.split("/")
        variants = [or_id]
        if len(parts) > 1:
            variants.append("/".join(parts[1:]))
            variants.append(parts[-1])
        return variants

    def build_aliases(row):
        clean_name = strip_provider_prefix(row.get("or_name"))
        values = [row.get("or_name"), clean_name, row.get("or_canonical_slug")] + id_variants(
            row.get("or_id")
        )
        aliases = {normalize_name(v) for v in values}
        aliases.update({model_core_key(v) for v in values})
        aliases.discard("")
        return sorted(aliases)

    df["or_aliases"] = df.apply(build_aliases, axis=1)

    def choose_primary(row):
        ordered = [
            normalize_name(row.get("or_canonical_slug")),
            normalize_name(row.get("or_name")),
        ]
        ordered.extend(normalize_name(v) for v in id_variants(row.get("or_id")))
        return first_non_empty(ordered) or ""

    df["or_primary_key"] = df.apply(choose_primary, axis=1)
    df["or_core_key"] = (
        df["or_name"]
        .apply(lambda x: model_core_key(strip_provider_prefix(x)))
        .replace("", pd.NA)
        .fillna(df["or_canonical_slug"].apply(model_core_key))
        .fillna(df["or_id"].apply(model_core_key))
        .fillna("")
    )

    grouped = (
        df.groupby("or_primary_key", dropna=False, as_index=False)
        .apply(collapse_group, include_groups=False)
        .reset_index(drop=True)
    )
    grouped["or_aliases"] = grouped["or_aliases"].apply(
        lambda x: x if isinstance(x, list) else []
    )
    return grouped


def score_pair(aa_row, or_row, shared_aliases):
    score = len(shared_aliases)
    aa_key = aa_row.get("aa_primary_key", "")
    or_key = or_row.get("or_primary_key", "")
    if aa_key and aa_key == or_key:
        score += 5
    aa_name = normalize_name(aa_row.get("aa_name"))
    or_name = normalize_name(strip_provider_prefix(or_row.get("or_name")))
    if aa_name and aa_name == or_name:
        score += 2
    aa_core = model_core_key(aa_row.get("aa_name")) or model_core_key(aa_row.get("aa_slug"))
    or_core = model_core_key(or_row.get("or_name")) or model_core_key(or_row.get("or_canonical_slug"))
    if aa_core and or_core:
        if aa_core == or_core:
            score += 8
        else:
            aa_tokens = split_tokens(aa_core)
            or_tokens = split_tokens(or_core)
            if aa_tokens and or_tokens:
                jaccard = len(aa_tokens & or_tokens) / len(aa_tokens | or_tokens)
                if jaccard >= 0.8:
                    score += 4
            ratio = SequenceMatcher(None, aa_core, or_core).ratio()
            if ratio >= 0.92:
                score += 3
    return score


def match_and_merge(df_aa, df_or):
    aa = df_aa.reset_index(drop=True).copy()
    aa["aa_idx"] = aa.index
    or_df = df_or.reset_index(drop=True).copy()
    or_df["or_idx"] = or_df.index

    alias_to_or_indices = defaultdict(set)
    core_to_or_indices = defaultdict(set)
    for _, row in or_df.iterrows():
        for alias in row.get("or_aliases", []):
            alias_to_or_indices[alias].add(row["or_idx"])
        core = row.get("or_core_key", "")
        if isinstance(core, str) and core:
            core_to_or_indices[core].add(row["or_idx"])

    used_or = set()
    pairs = []
    for _, aa_row in aa.iterrows():
        aa_aliases = set(aa_row.get("aa_aliases", []))
        candidate_indices = set()
        for alias in aa_aliases:
            candidate_indices |= alias_to_or_indices.get(alias, set())
        aa_core = aa_row.get("aa_core_key", "")
        if isinstance(aa_core, str) and aa_core:
            candidate_indices |= core_to_or_indices.get(aa_core, set())
        candidate_indices -= used_or

        if not candidate_indices:
            continue

        best = None
        for or_idx in candidate_indices:
            or_row = or_df.loc[or_df["or_idx"] == or_idx].iloc[0]
            shared = aa_aliases & set(or_row.get("or_aliases", []))
            pair_score = score_pair(aa_row, or_row, shared)
            aa_core = model_core_key(aa_row.get("aa_name")) or model_core_key(aa_row.get("aa_slug"))
            or_core = model_core_key(or_row.get("or_name")) or model_core_key(or_row.get("or_canonical_slug"))
            if aa_core and or_core and aa_core == or_core:
                reason = "core_name_exact"
            elif shared:
                reason = "alias_overlap"
            else:
                reason = "fuzzy"
            if best is None or pair_score > best["score"]:
                best = {
                    "aa_idx": aa_row["aa_idx"],
                    "or_idx": or_idx,
                    "score": pair_score,
                    "match_key": first_non_empty(sorted(shared)) or "",
                    "match_reason": reason,
                }
        if best is not None:
            used_or.add(best["or_idx"])
            pairs.append(best)

    pair_df = pd.DataFrame(pairs)
    if pair_df.empty:
        pair_df = pd.DataFrame(
            columns=["aa_idx", "or_idx", "score", "match_key", "match_reason"]
        )

    matched = (
        pair_df.merge(aa, on="aa_idx", how="left")
        .merge(or_df, on="or_idx", how="left")
        .rename(columns={"score": "match_score"})
    )

    unmatched_aa = aa.loc[~aa["aa_idx"].isin(pair_df["aa_idx"])].copy()
    unmatched_aa["match_score"] = 0
    unmatched_aa["match_key"] = unmatched_aa["aa_primary_key"]
    unmatched_aa["match_reason"] = "aa_only"

    unmatched_or = or_df.loc[~or_df["or_idx"].isin(pair_df["or_idx"])].copy()
    unmatched_or["match_score"] = 0
    unmatched_or["match_key"] = unmatched_or["or_primary_key"]
    unmatched_or["match_reason"] = "or_only"

    frames = [frame for frame in (matched, unmatched_aa, unmatched_or) if not frame.empty]
    if frames:
        combined = pd.concat(frames, ignore_index=True, sort=False)
    else:
        combined = pd.DataFrame(columns=["match_key", "aa_primary_key", "or_primary_key", "aa_idx", "or_idx", "match_score", "match_reason"])
    combined["merge_key"] = (
        combined["match_key"]
        .fillna("")
        .replace("", pd.NA)
        .fillna(combined.get("aa_primary_key"))
        .fillna(combined.get("or_primary_key"))
        .fillna("")
    )
    combined["has_aa"] = combined["aa_idx"].notna()
    combined["has_or"] = combined["or_idx"].notna()
    combined["match_confidence"] = combined["match_score"].apply(
        lambda x: "high" if x >= 10 else ("medium" if x >= 4 else "low")
    )
    combined["record_date"] = dt.date.today().isoformat()

    for col in ("aa_aliases", "or_aliases"):
        if col in combined.columns:
            combined[col] = combined[col].apply(
                lambda x: "|".join(x) if isinstance(x, list) else x
            )

    return combined


def main():
    if not AA_API_KEY:
        raise ValueError("AA_API_KEY 为空，请设置环境变量 AA_API_KEY 或在脚本中填写。")

    session = build_session()

    aa_all = []
    for endpoint in AA_ENDPOINTS:
        aa_all.extend(fetch_aa_data(session, endpoint))
    openrouter_data = fetch_openrouter_data(session)

    df_aa = build_aa_df(aa_all)
    print(f"处理并聚合了 {len(df_aa)} 条 Artificial Analysis 模型记录。")

    df_or = build_or_df(openrouter_data)
    print(f"处理并聚合了 {len(df_or)} 条 OpenRouter 模型记录。")

    print("正在进行多别名匹配并合并为单张大表...")
    merged_df = match_and_merge(df_aa, df_or)

    key_cols = [
        "record_date",
        "merge_key",
        "match_confidence",
        "has_aa",
        "has_or",
        "aa_name",
        "aa_slug",
        "or_name",
        "or_id",
        "or_canonical_slug",
    ]
    key_cols = [col for col in key_cols if col in merged_df.columns]
    other_cols = [col for col in merged_df.columns if col not in key_cols]
    merged_df = merged_df[key_cols + other_cols]

    output_path = os.path.abspath(OUTPUT_CSV_FILE)
    if merged_df.empty and os.path.exists(output_path) and os.path.getsize(output_path) > 0:
        print(f"\n本次抓取为空，跳过覆盖已有文件: {output_path}")
        return
    merged_df.to_csv(output_path, index=False, encoding="utf-8-sig")
    print(f"\n数据合并完成，结果已保存到: {output_path}")
    print(f"总记录数: {len(merged_df)}")
    print(f"AA来源记录: {int(merged_df['has_aa'].sum())}")
    print(f"OpenRouter来源记录: {int(merged_df['has_or'].sum())}")


if __name__ == "__main__":
    main()
