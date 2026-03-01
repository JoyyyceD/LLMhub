#!/usr/bin/env python3
"""
pipeline.py  –  Daily AA full-data pipeline for LLMhub
Fetches AA (LLM + 5 media categories) and OpenRouter (for LLM context matching),
then upserts into Supabase model_snapshots.

Required env vars:
  AA_API_KEY
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
"""

import datetime
import json
import os
import re
import sys
import subprocess
from collections import defaultdict
from pathlib import Path

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

AA_API_KEY = os.environ.get("AA_API_KEY", "")
AA_API_BASE_URL = "https://artificialanalysis.ai/api/v2/data"
OR_API_URL = "https://openrouter.ai/api/v1/models"
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
REQUEST_TIMEOUT = 30
BATCH_SIZE = 50

AA_ENDPOINTS = {
    "llm": "llms/models",
    "text_to_image": "media/text-to-image",
    "image_editing": "media/image-editing",
    "text_to_speech": "media/text-to-speech",
    "text_to_video": "media/text-to-video",
    "image_to_video": "media/image-to-video",
}

CN_PROVIDERS = {
    "deepseek", "alibaba", "baidu", "bytedance", "zhipu",
    "moonshot", "minimax", "tencent", "01ai", "kimi", "z ai", "xiaomi", "seed",
    "vidu", "klingai", "pixverse", "stepfun",
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

MISSING_COLUMN_PATTERNS = [
    re.compile(r"Could not find the '([a-zA-Z0-9_]+)' column", re.IGNORECASE),
    re.compile(r'column "?([a-zA-Z0-9_]+)"? of relation', re.IGNORECASE),
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
    return session


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


def make_aliases(slug: str, name: str, canonical: str = ""):
    candidates = [slug, name, strip_provider_prefix(name), canonical]
    aliases = set()
    for c in candidates:
        aliases.add(normalize_name(c))
        aliases.add(model_core_key(c))
    aliases.discard("")
    return aliases


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


def fetch_aa_data(session, endpoint: str):
    url = f"{AA_API_BASE_URL}/{endpoint}"
    params = {}
    if endpoint in {"media/text-to-image", "media/text-to-video", "media/image-to-video"}:
        params["include_categories"] = "true"
    try:
        resp = session.get(url, headers={"x-api-key": AA_API_KEY}, params=params, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        records = resp.json().get("data", [])
        print(f"AA {endpoint}: {len(records)}")
        return records
    except Exception as e:
        print(f"AA fetch error {endpoint}: {e}", file=sys.stderr)
        return []


def fetch_or_data(session):
    try:
        resp = session.get(OR_API_URL, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        records = resp.json().get("data", [])
        print(f"OR models: {len(records)}")
        return records
    except Exception as e:
        print(f"OR fetch error: {e}", file=sys.stderr)
        return []


def build_or_context_map(or_records):
    out = {}
    for rec in or_records:
        model_id = rec.get("id") or ""
        model_name = rec.get("name") or ""
        canonical = rec.get("canonical_slug") or ""
        context = rec.get("context_length")
        modalities = (rec.get("architecture") or {}).get("input_modalities")
        aliases = make_aliases(model_id, model_name, canonical)
        for a in aliases:
            if a not in out:
                out[a] = {
                    "context_length": context,
                    "input_modalities": modalities,
                }
    return out


def match_or(aa_slug: str, aa_name: str, or_map):
    primary = normalize_name(aa_slug)
    if primary in or_map:
        return or_map[primary]
    for a in make_aliases(aa_slug, aa_name):
        if a in or_map:
            return or_map[a]
    return {"context_length": None, "input_modalities": None}


def get_category_elo(categories, style=None, subject=None, fmt=None):
    def norm(text):
        if not isinstance(text, str):
            return ""
        t = text.strip().lower()
        t = t.replace("&", "and")
        t = re.sub(r"\s+", " ", t)
        return t

    style_norm = norm(style)
    subject_norm = norm(subject)
    fmt_norm = norm(fmt)

    for item in categories or []:
        item_style = norm(item.get("style_category") or "")
        item_subject = norm(item.get("subject_matter_category") or "")
        item_format = norm(item.get("format_category") or "")
        if style_norm and item_style == style_norm:
            return item.get("elo")
        if subject_norm and item_subject == subject_norm:
            return item.get("elo")
        if fmt_norm and item_format == fmt_norm:
            return item.get("elo")
    return None


def build_llm_rows(llm_records, or_map):
    rows = []
    today = datetime.date.today().isoformat()
    for rec in llm_records:
        evals = rec.get("evaluations") or {}
        pricing = rec.get("pricing") or {}
        creator = rec.get("model_creator") or {}
        creator_name = (creator.get("name") or "").strip()
        cn = is_cn_provider(creator_name)
        or_match = match_or(rec.get("slug") or "", rec.get("name") or "", or_map)

        rows.append({
            "aa_slug": rec.get("slug") or "",
            "aa_id": rec.get("id"),
            "aa_name": rec.get("name") or "",
            "aa_modality": "llm",
            "aa_model_creator_id": creator.get("id"),
            "aa_model_creator_name": creator_name,
            "aa_model_creator_name_cn": CN_NAME_MAP.get(creator_name, "") if cn else None,
            "is_cn_provider": cn,
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
            "aa_context_length": or_match.get("context_length"),
            "or_context_length": or_match.get("context_length"),
            "or_architecture_input_modalities": or_match.get("input_modalities"),
            "aa_release_date": rec.get("release_date") or None,
            "aa_elo": None,
            "has_aa": True,
            "has_or": or_match.get("context_length") is not None,
            "match_confidence": "medium" if or_match.get("context_length") is not None else None,
            "record_date": today,
        })
    return rows


def build_media_rows(records, modality):
    rows = []
    today = datetime.date.today().isoformat()
    for rec in records:
        creator = rec.get("model_creator") or {}
        creator_name = (creator.get("name") or "").strip()
        cn = is_cn_provider(creator_name)
        categories = rec.get("categories") or []

        source_slug = rec.get("slug") or ""
        row = {
            # Prefix non-LLM slug to avoid PK collision with LLM aa_slug.
            "aa_slug": f"{modality}::{source_slug}" if source_slug else "",
            "aa_id": rec.get("id"),
            "aa_name": rec.get("name") or "",
            "aa_modality": modality,
            "aa_model_creator_id": creator.get("id"),
            "aa_model_creator_name": creator_name,
            "aa_model_creator_name_cn": CN_NAME_MAP.get(creator_name, "") if cn else None,
            "is_cn_provider": cn,
            "reasoning_type": None,
            "aa_release_date": rec.get("release_date") or None,
            "aa_elo": rec.get("elo"),
            "has_aa": True,
            "has_or": False,
            "match_confidence": None,
            "record_date": today,

            "category_style_anime_elo": get_category_elo(categories, style="Anime"),
            "category_style_cartoon_illustration_elo": get_category_elo(categories, style="Cartoon & Illustration"),
            "category_style_general_photorealistic_elo": get_category_elo(categories, style="General & Photorealistic"),
            "category_style_graphic_design_digital_rendering_elo": get_category_elo(categories, style="Graphic Design & Digital Rendering"),
            "category_style_traditional_art_elo": get_category_elo(categories, style="Traditional Art"),
            "category_subject_commercial_elo": get_category_elo(categories, subject="Commercial"),

            "category_format_short_prompt_elo": get_category_elo(categories, fmt="Short Prompt"),
            "category_format_long_prompt_elo": get_category_elo(categories, fmt="Long Prompt"),
            "category_format_moving_camera_elo": get_category_elo(categories, fmt="Moving Camera"),
            "category_format_multi_scene_elo": get_category_elo(categories, fmt="Multi-Scene"),
            "category_style_photorealistic_elo": get_category_elo(categories, style="Photorealistic"),
            "category_style_cartoon_and_anime_elo": get_category_elo(categories, style="Cartoon and Anime"),
            "category_style_3d_animation_elo": get_category_elo(categories, style="3D Animation"),
        }
        rows.append(row)
    return rows


def log_media_coverage(rows, modality):
    if not rows:
        print(f"{modality}: no rows for coverage report")
        return
    keys = [
        "aa_elo",
        "category_format_short_prompt_elo",
        "category_format_long_prompt_elo",
        "category_format_moving_camera_elo",
        "category_format_multi_scene_elo",
        "category_style_photorealistic_elo",
        "category_style_cartoon_and_anime_elo",
        "category_style_3d_animation_elo",
    ]
    total = len(rows)
    stats = []
    for key in keys:
        non_null = sum(1 for r in rows if r.get(key) is not None)
        pct = (non_null / total) * 100 if total else 0.0
        stats.append(f"{key}={non_null}/{total} ({pct:.1f}%)")
    print(f"{modality} coverage: " + ", ".join(stats))


def upsert_batch(records):
    if not SUPABASE_URL or not SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
    url = f"{SUPABASE_URL}/rest/v1/model_snapshots"
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    resp = requests.post(url, headers=headers, json=records, timeout=60)
    return resp


def call_rpc(function_name, payload=None):
    url = f"{SUPABASE_URL}/rest/v1/rpc/{function_name}"
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    resp = requests.post(url, headers=headers, json=(payload or {}), timeout=60)
    return resp


def extract_missing_columns(error_text: str):
    missing = set()
    if not error_text:
        return missing
    for pattern in MISSING_COLUMN_PATTERNS:
        for match in pattern.findall(error_text):
            col = (match or "").strip()
            if col:
                missing.add(col)
    return missing


def prune_columns(records, ignored_columns):
    if not ignored_columns:
        return records
    return [{k: v for k, v in row.items() if k not in ignored_columns} for row in records]


def normalize_record_keys(records):
    if not records:
        return records
    all_keys = set()
    for row in records:
        all_keys.update(row.keys())
    ordered_keys = sorted(all_keys)
    normalized = []
    for row in records:
        normalized.append({k: row.get(k, None) for k in ordered_keys})
    return normalized


def upsert_all(records):
    total = len(records)
    ignored_columns = set()
    for i in range(0, total, BATCH_SIZE):
        batch = records[i:i + BATCH_SIZE]
        batch_num = i // BATCH_SIZE + 1
        attempt = 0

        while True:
            attempt += 1
            batch_payload = prune_columns(batch, ignored_columns)
            batch_payload = normalize_record_keys(batch_payload)
            print(f"Upserting batch {batch_num} ({len(batch_payload)} rows), attempt {attempt}")
            resp = upsert_batch(batch_payload)

            if resp.ok:
                break

            text = resp.text or ""
            missing = extract_missing_columns(text)
            newly_missing = missing - ignored_columns
            if newly_missing:
                ignored_columns.update(newly_missing)
                print(
                    f"Schema drift detected; dropping missing columns and retrying: {sorted(newly_missing)}",
                    file=sys.stderr,
                )
                continue

            print(f"Upsert ERROR {resp.status_code}: {text[:400]}", file=sys.stderr)
            resp.raise_for_status()

    if ignored_columns:
        print(f"Upsert completed with schema fallback. Ignored columns: {sorted(ignored_columns)}")
    print(f"Done. {total} rows upserted.")


def main():
    if not AA_API_KEY:
        print("ERROR: AA_API_KEY must be set.", file=sys.stderr)
        sys.exit(1)
    if not SUPABASE_URL or not SERVICE_ROLE_KEY:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.", file=sys.stderr)
        sys.exit(1)

    session = build_session()
    aa_data = {name: fetch_aa_data(session, ep) for name, ep in AA_ENDPOINTS.items()}
    or_data = fetch_or_data(session)

    if not aa_data["llm"]:
        print("No AA LLM data fetched; aborting.", file=sys.stderr)
        sys.exit(1)

    or_map = build_or_context_map(or_data)

    all_rows = []
    all_rows.extend(build_llm_rows(aa_data["llm"], or_map))
    all_rows.extend(build_media_rows(aa_data["text_to_image"], "text_to_image"))
    all_rows.extend(build_media_rows(aa_data["image_editing"], "image_editing"))
    all_rows.extend(build_media_rows(aa_data["text_to_speech"], "text_to_speech"))
    all_rows.extend(build_media_rows(aa_data["text_to_video"], "text_to_video"))
    all_rows.extend(build_media_rows(aa_data["image_to_video"], "image_to_video"))

    # Emit visibility for category coverage to catch upstream schema/category-label drift.
    log_media_coverage([r for r in all_rows if r.get("aa_modality") == "text_to_video"], "text_to_video")
    log_media_coverage([r for r in all_rows if r.get("aa_modality") == "image_to_video"], "image_to_video")

    # Skip rows without slug; slug is PK.
    all_rows = [r for r in all_rows if r.get("aa_slug")]
    print(f"Total rows prepared: {len(all_rows)}")

    upsert_all(all_rows)

    # Keep product->provider model coverage in sync with latest daily snapshot data.
    refresh_resp = call_rpc("refresh_product_supported_models")
    if refresh_resp.ok:
        print(f"refresh_product_supported_models OK: {refresh_resp.text[:200]}")
    else:
        print(
            f"refresh_product_supported_models ERROR {refresh_resp.status_code}: {refresh_resp.text[:400]}",
            file=sys.stderr,
        )
        refresh_resp.raise_for_status()

    run_series_sync = os.environ.get("RUN_MODEL_SERIES_SYNC", "").strip().lower() in {
        "1", "true", "yes", "on",
    }
    series_sync_dry_run = os.environ.get("RUN_MODEL_SERIES_SYNC_DRY_RUN", "").strip().lower() in {
        "1", "true", "yes", "on",
    }
    if run_series_sync:
        sync_script = Path(__file__).with_name("sync_model_series_all_modalities.py")
        cmd = [sys.executable, str(sync_script)]
        if series_sync_dry_run:
            cmd.append("--dry-run")
        print(f"Running model series sync: {' '.join(cmd)}")
        subprocess.run(cmd, check=True)


if __name__ == "__main__":
    main()
