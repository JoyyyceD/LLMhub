#!/usr/bin/env python3
"""
Fetch AA data only and split outputs by category for local CSV generation.

Outputs under docs/python/aa_split_outputs:
- aa_llm_models_processed.csv                (LLM-only, processed schema)
- aa_llm_models_raw.csv                      (raw normalized payload)
- aa_text_to_image_raw.csv
- aa_image_editing_raw.csv
- aa_text_to_speech_raw.csv
- aa_text_to_video_raw.csv                   (if endpoint available)
- aa_image_to_video_raw.csv                  (if endpoint available)
- aa_fetch_summary.json
"""

import datetime as dt
import json
import os
import re
from pathlib import Path

import pandas as pd
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

AA_API_BASE_URL = "https://artificialanalysis.ai/api/v2/data"
OPENROUTER_API_URL = "https://openrouter.ai/api/v1/models"
DEFAULT_AA_KEY = "aa_UVcVfuiZkbPQIaQxPZkvaMiIgkihaWzF"
REQUEST_TIMEOUT = 30

ENDPOINTS = {
    "llm_models": "llms/models",
    "text_to_image": "media/text-to-image",
    "image_editing": "media/image-editing",
    "text_to_speech": "media/text-to-speech",
    "text_to_video": "media/text-to-video",
    "image_to_video": "media/image-to-video",
}

INCLUDE_CATEGORIES_ENDPOINTS = {
    "text_to_image",
    "text_to_video",
    "image_to_video",
}

MEDIA_BASE_COLUMNS = [
    "id",
    "name",
    "slug",
    "release_date",
    "model_creator_id",
    "model_creator_name",
    "elo",
]

MEDIA_ADV_COLUMNS_VIDEO = [
    "category_format_short_prompt_elo",
    "category_format_long_prompt_elo",
    "category_format_moving_camera_elo",
    "category_format_multi_scene_elo",
    "category_style_photorealistic_elo",
    "category_style_cartoon_and_anime_elo",
    "category_style_3d_animation_elo",
]

MEDIA_ADV_COLUMNS_TEXT_TO_IMAGE = [
    "category_style_anime_elo",
    "category_style_cartoon_illustration_elo",
    "category_style_general_photorealistic_elo",
    "category_style_graphic_design_digital_rendering_elo",
    "category_style_traditional_art_elo",
    "category_subject_commercial_elo",
]

CN_PROVIDERS = {
    "deepseek", "alibaba", "baidu", "bytedance", "zhipu",
    "moonshot", "minimax", "tencent", "01ai", "kimi", "z ai", "xiaomi",
    "seed", "vidu", "klingai", "pixverse", "stepfun",
}

CN_NAME_MAP = {
    "Kimi": "月之暗面Kimi",
    "DeepSeek": "深度求索Deepseek",
    "Z AI": "智谱",
    "Alibaba": "阿里巴巴",
    "MiniMax": "Minimax",
    "Xiaomi": "小米",
    "Baidu": "百度",
    "ByteDance Seed": "字节跳动",
    "Seed": "字节跳动",
    "ByteDance": "字节跳动",
    "Tencent": "腾讯",
    "Vidu": "生数Vidu",
    "KlingAI": "快手可灵",
    "PixVerse": "爱诗PixVerse",
    "StepFun": "阶跃星辰Stepfun",
    "Stepfun": "阶跃星辰Stepfun",
}


def build_session() -> requests.Session:
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
    if isinstance(value, (dict, list)):
        return json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    return value


def normalize_name(name):
    if not isinstance(name, str):
        return ""
    text = name.lower().strip()
    text = text.replace("gpt-4o", "gpt4o").replace("gpt-4-omni", "gpt4o")
    text = re.sub(r"[\s_]+", "-", text)
    text = re.sub(r"[^a-z0-9\-/]", "", text)
    return text.strip("-/")


def strip_provider_prefix(text):
    if not isinstance(text, str):
        return ""
    return re.sub(r"^[^:]{1,40}:\s*", "", text).strip()


def remove_date_noise(text):
    if not isinstance(text, str):
        return ""
    t = text.lower()
    t = re.sub(r"\([^)]*\)", " ", t)
    t = re.sub(r"\b(19|20)\d{2}\b", " ", t)
    t = re.sub(r"\b\d{8}\b|\b\d{6}\b|\b\d{4}\b", " ", t)
    t = re.sub(r"\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*[-\s']?\d{2,4}\b", " ", t)
    t = re.sub(r"\b(?:preview|latest|stable|release|experimental|exp)\b", " ", t)
    return re.sub(r"\s+", " ", t).strip()


def model_core_key(value):
    if not isinstance(value, str):
        return ""
    text = strip_provider_prefix(value)
    text = remove_date_noise(text)
    text = normalize_name(text)
    text = re.sub(r"(?:[-_/](?:free|beta|alpha|chat|instruct|latest))+$", "", text)
    return re.sub(r"-{2,}", "-", text).strip("-/")


def make_aliases(slug: str, name: str, canonical: str = "") -> set[str]:
    candidates = [slug, name, strip_provider_prefix(name), canonical]
    aliases = set()
    for c in candidates:
        aliases.add(normalize_name(c))
        aliases.add(model_core_key(c))
    aliases.discard("")
    return aliases


def fetch_endpoint(session: requests.Session, aa_key: str, endpoint: str):
    url = f"{AA_API_BASE_URL}/{endpoint}"
    headers = {"x-api-key": aa_key}
    params = {}
    if endpoint in {
        "media/text-to-image",
        "media/text-to-video",
        "media/image-to-video",
    }:
        params["include_categories"] = "true"
    try:
        resp = session.get(url, headers=headers, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        payload = resp.json().get("data", [])
        return payload, None
    except Exception as e:
        return [], str(e)


def fetch_openrouter_models(session: requests.Session):
    try:
        resp = session.get(OPENROUTER_API_URL, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        return resp.json().get("data", []), None
    except Exception as e:
        return [], str(e)


def to_raw_df(records):
    if not records:
        return pd.DataFrame()
    return pd.json_normalize(records, sep="_").map(safe_json)


def is_cn_provider(creator_name: str) -> bool:
    if not creator_name:
        return False
    lower = creator_name.lower()
    return any(k in lower for k in CN_PROVIDERS)


def infer_reasoning_type(name: str) -> str:
    t = (name or "").lower()
    if not t:
        return "unknown"
    if "non-reasoning" in t or "non reasoning" in t:
        return "Non Reasoning"
    if "reasoning" in t or "think" in t or "thinking" in t:
        return "Reasoning"
    return "unknown"


def build_or_context_map(or_records):
    or_index = {}
    for rec in or_records:
        model_id = rec.get("id") or ""
        model_name = rec.get("name") or ""
        canonical = rec.get("canonical_slug") or ""
        aliases = make_aliases(model_id, model_name, canonical)
        context_length = rec.get("context_length")
        for alias in aliases:
            if alias not in or_index:
                or_index[alias] = context_length
    return or_index


def match_context_length(aa_slug: str, aa_name: str, or_index: dict):
    aliases = list(make_aliases(aa_slug, aa_name))
    # Prefer exact normalized slug alias, then fallback to other aliases.
    primary = normalize_name(aa_slug)
    if primary in or_index:
        return or_index.get(primary)
    for alias in aliases:
        if alias in or_index:
            return or_index.get(alias)
    return None


def build_llm_processed(records, or_context_map):
    rows = []
    today = dt.date.today().isoformat()
    now_utc = dt.datetime.now(dt.timezone.utc).isoformat()

    for rec in records:
        evals = rec.get("evaluations") or {}
        pricing = rec.get("pricing") or {}
        creator = rec.get("model_creator") or {}

        creator_name = (creator.get("name") or "").strip()
        is_cn = is_cn_provider(creator_name)

        rows.append(
            {
                "aa_slug": rec.get("slug") or "",
                "aa_name": rec.get("name") or "",
                "aa_model_creator_name": creator_name,
                "aa_model_creator_name_CN": CN_NAME_MAP.get(creator_name, "") if is_cn else "",
                "is_cn_provider": str(is_cn).lower(),
                "reasoning_type": infer_reasoning_type(rec.get("name") or ""),
                "aa_intelligence_index": evals.get("artificial_analysis_intelligence_index"),
                "aa_coding_index": evals.get("artificial_analysis_coding_index"),
                "aa_gpqa": evals.get("gpqa"),
                "aa_hle": evals.get("hle"),
                "aa_ifbench": evals.get("ifbench"),
                "aa_lcr": evals.get("lcr"),
                "aa_scicode": evals.get("scicode"),
                "aa_terminalbench_hard": evals.get("terminalbench_hard"),
                "aa_tau2": evals.get("tau2"),
                "aa_ttft_seconds": rec.get("median_time_to_first_token_seconds"),
                "aa_tps": rec.get("median_output_tokens_per_second"),
                "aa_price_input_usd": pricing.get("price_1m_input_tokens"),
                "aa_price_output_usd": pricing.get("price_1m_output_tokens"),
                "aa_price_blended_usd": pricing.get("price_1m_blended_3_to_1"),
                "aa_context_length": match_context_length(
                    rec.get("slug") or "",
                    rec.get("name") or "",
                    or_context_map,
                ),
                "aa_release_date": rec.get("release_date") or "",
                "has_aa": "true",
                "record_date": today,
                "updated_at": now_utc,
            }
        )

    df = pd.DataFrame(rows)
    if not df.empty and "aa_slug" in df.columns:
        df = df.sort_values(by=["aa_slug"], kind="stable").reset_index(drop=True)
    return df


def slugify_text(value: str) -> str:
    text = (value or "").strip().lower()
    text = re.sub(r"\s+", "_", text)
    text = re.sub(r"[^a-z0-9_]+", "_", text)
    text = re.sub(r"_+", "_", text).strip("_")
    return text or "unknown"


def category_label(item: dict) -> str:
    style = (item.get("style_category") or "").strip()
    subject = (item.get("subject_matter_category") or "").strip()
    fmt = (item.get("format_category") or "").strip()
    parts = []
    if style:
        parts.append(f"Style: {style}")
    if subject:
        parts.append(f"Subject: {subject}")
    if fmt:
        parts.append(f"Format: {fmt}")
    if not parts:
        parts.append("Category: Unspecified")
    return " | ".join(parts)


def parse_categories(value):
    if isinstance(value, list):
        return value
    if isinstance(value, str):
        text = value.strip()
        if not text or text == "[]":
            return []
        try:
            parsed = json.loads(text)
            return parsed if isinstance(parsed, list) else []
        except json.JSONDecodeError:
            return []
    return []


def build_categories_wide_df(records):
    base_rows = []
    all_labels = set()
    for rec in records:
        categories = parse_categories(rec.get("categories"))
        row = {
            "id": rec.get("id"),
            "name": rec.get("name"),
            "slug": rec.get("slug"),
            "release_date": rec.get("release_date"),
            "model_creator_id": (rec.get("model_creator") or {}).get("id"),
            "model_creator_name": (rec.get("model_creator") or {}).get("name"),
            "elo": rec.get("elo"),
            "rank": rec.get("rank"),
            "ci95": rec.get("ci95"),
            "appearances": rec.get("appearances"),
        }
        for item in categories:
            label = category_label(item)
            all_labels.add(label)
            key_base = f"category_{slugify_text(label)}"
            row[f"{key_base}_elo"] = item.get("elo")
            row[f"{key_base}_ci95"] = item.get("ci95")
            row[f"{key_base}_appearances"] = item.get("appearances")
        base_rows.append(row)

    if not base_rows:
        return pd.DataFrame()

    df = pd.DataFrame(base_rows)
    category_cols = []
    for label in sorted(all_labels):
        key_base = f"category_{slugify_text(label)}"
        category_cols.extend(
            [
                f"{key_base}_elo",
                f"{key_base}_ci95",
                f"{key_base}_appearances",
            ]
        )

    fixed_cols = [
        "id",
        "name",
        "slug",
        "release_date",
        "model_creator_id",
        "model_creator_name",
        "elo",
    ]
    ordered_cols = [c for c in fixed_cols if c in df.columns] + [c for c in category_cols if c in df.columns]
    return df.reindex(columns=ordered_cols)


def drop_non_llm_unwanted_cols(df: pd.DataFrame) -> pd.DataFrame:
    """For non-LLM outputs, drop any columns containing ci95/appearances/rank."""
    if df.empty:
        return df
    bad_tokens = ("ci95", "appearances", "rank")
    keep_cols = [c for c in df.columns if not any(t in c.lower() for t in bad_tokens)]
    return df.reindex(columns=keep_cols)


def first_non_null(row: pd.Series, columns: list[str]):
    for col in columns:
        if col in row.index:
            val = row[col]
            if pd.notna(val) and str(val).strip() != "":
                return val
    return None


def build_media_selected_df(wide_df: pd.DataFrame, endpoint_name: str) -> pd.DataFrame:
    """Keep only base + requested advanced fields for media category datasets."""
    adv_cols = (
        MEDIA_ADV_COLUMNS_TEXT_TO_IMAGE
        if endpoint_name == "text_to_image"
        else MEDIA_ADV_COLUMNS_VIDEO
    )
    if wide_df.empty:
        return pd.DataFrame(columns=MEDIA_BASE_COLUMNS + adv_cols)

    out = pd.DataFrame()
    for col in MEDIA_BASE_COLUMNS:
        out[col] = wide_df[col] if col in wide_df.columns else None

    if endpoint_name == "text_to_image":
        for col in adv_cols:
            out[col] = wide_df[col] if col in wide_df.columns else None
    else:
        for col in [
            "category_format_short_prompt_elo",
            "category_format_long_prompt_elo",
            "category_format_moving_camera_elo",
            "category_format_multi_scene_elo",
            "category_style_3d_animation_elo",
        ]:
            out[col] = wide_df[col] if col in wide_df.columns else None

        # Normalize style naming differences across endpoints.
        out["category_style_photorealistic_elo"] = wide_df.apply(
            lambda r: first_non_null(
                r,
                [
                    "category_style_photorealistic_elo",
                    "category_style_general_photorealistic_elo",
                ],
            ),
            axis=1,
        )
        out["category_style_cartoon_and_anime_elo"] = wide_df.apply(
            lambda r: first_non_null(
                r,
                [
                    "category_style_cartoon_and_anime_elo",
                    "category_style_cartoon_illustration_elo",
                    "category_style_anime_elo",
                ],
            ),
            axis=1,
        )

    return out.reindex(columns=MEDIA_BASE_COLUMNS + adv_cols)


def main():
    aa_key = os.getenv("AA_API_KEY", DEFAULT_AA_KEY)

    project_root = Path(__file__).resolve().parent
    out_dir = project_root / "aa_split_outputs"
    out_dir.mkdir(parents=True, exist_ok=True)

    session = build_session()
    or_models, or_error = fetch_openrouter_models(session)
    or_context_map = build_or_context_map(or_models)

    summary = {
        "generated_at": dt.datetime.now(dt.timezone.utc).isoformat(),
        "endpoints": {},
        "outputs": {},
    }

    fetched = {}
    for name, endpoint in ENDPOINTS.items():
        records, error = fetch_endpoint(session, aa_key, endpoint)
        fetched[name] = records
        summary["endpoints"][name] = {
            "endpoint": endpoint,
            "count": len(records),
            "error": error,
        }
    summary["endpoints"]["openrouter_models"] = {
        "endpoint": OPENROUTER_API_URL,
        "count": len(or_models),
        "error": or_error,
    }

    for name in ENDPOINTS:
        records = fetched[name]

        raw_df = to_raw_df(records)
        if name != "llm_models":
            raw_df = drop_non_llm_unwanted_cols(raw_df)
        raw_file = out_dir / f"aa_{name}_raw.csv"
        if name in INCLUDE_CATEGORIES_ENDPOINTS:
            # For these three categories, "raw" output is also constrained
            # to base + requested advanced fields.
            wide_df_for_raw = build_categories_wide_df(records)
            selected_df_for_raw = build_media_selected_df(wide_df_for_raw, name)
            selected_df_for_raw.to_csv(raw_file, index=False, encoding="utf-8")
            summary["outputs"][raw_file.name] = {
                "rows": int(len(selected_df_for_raw)),
                "cols": int(len(selected_df_for_raw.columns)),
            }
        else:
            raw_df.to_csv(raw_file, index=False, encoding="utf-8")
            summary["outputs"][raw_file.name] = {
                "rows": int(len(raw_df)),
                "cols": int(len(raw_df.columns)),
            }

        if name in INCLUDE_CATEGORIES_ENDPOINTS:
            wide_df = build_categories_wide_df(records)
            wide_df = drop_non_llm_unwanted_cols(wide_df)
            wide_df = build_media_selected_df(wide_df, name)
            wide_file = out_dir / f"aa_{name}_categories_wide.csv"
            wide_df.to_csv(wide_file, index=False, encoding="utf-8")
            summary["outputs"][wide_file.name] = {
                "rows": int(len(wide_df)),
                "cols": int(len(wide_df.columns)),
            }

    llm_processed_df = build_llm_processed(fetched.get("llm_models", []), or_context_map)
    llm_file = out_dir / "aa_llm_models_processed.csv"
    llm_processed_df.to_csv(llm_file, index=False, encoding="utf-8")
    summary["outputs"][llm_file.name] = {
        "rows": int(len(llm_processed_df)),
        "cols": int(len(llm_processed_df.columns)),
    }

    llm_current_file = out_dir / "aa_llm_models_processed_current.csv"
    llm_processed_df.to_csv(llm_current_file, index=False, encoding="utf-8")
    summary["outputs"][llm_current_file.name] = {
        "rows": int(len(llm_processed_df)),
        "cols": int(len(llm_processed_df.columns)),
    }

    summary_file = out_dir / "aa_fetch_summary.json"
    with summary_file.open("w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)

    print("Output directory:", out_dir)
    for filename, info in summary["outputs"].items():
        print(f"{filename}: rows={info['rows']} cols={info['cols']}")


if __name__ == "__main__":
    main()
