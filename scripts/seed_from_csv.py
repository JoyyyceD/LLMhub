#!/usr/bin/env python3
"""
seed_from_csv.py
Reads docs/python/comprehensive_merged_data_v3.csv, filters rows where
has_aa=True AND has_or=True, maps fields to model_snapshots schema, and
upserts via Supabase REST API.

Usage:
  SUPABASE_URL=https://xxx.supabase.co \
  SUPABASE_SERVICE_ROLE_KEY=eyJ... \
  python scripts/seed_from_csv.py
"""

import csv
import json
import os
import sys
from pathlib import Path

import requests

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
CSV_PATH = Path(__file__).parent.parent / "docs" / "python" / "comprehensive_merged_data_v3.csv"
BATCH_SIZE = 50

CN_PROVIDERS = {
    "deepseek", "alibaba", "baidu", "bytedance", "zhipu",
    "moonshot", "minimax", "tencent", "01ai",
}

# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def is_cn_provider(creator_name: str) -> bool:
    """Return True if creator_name contains a known Chinese provider keyword."""
    if not creator_name:
        return False
    lower = creator_name.lower()
    return any(kw in lower for kw in CN_PROVIDERS)


def safe_float(val: str):
    """Convert CSV string to float, return None if empty/invalid."""
    try:
        stripped = str(val).strip()
        if stripped in ("", "nan", "None", "NaN"):
            return None
        return float(stripped)
    except (ValueError, TypeError):
        return None


def safe_int(val: str):
    """Convert CSV string to int, return None if empty/invalid."""
    f = safe_float(val)
    if f is None:
        return None
    return int(f)


def safe_bool(val: str) -> bool:
    return str(val).strip().lower() in ("true", "1", "yes")

def safe_json_string_array(val: str):
    """Parse JSON string array, fallback to None."""
    if val is None:
        return None
    text = str(val).strip()
    if text in ("", "nan", "None", "NaN"):
        return None
    try:
        parsed = json.loads(text)
        if isinstance(parsed, list):
            return [str(x) for x in parsed]
    except json.JSONDecodeError:
        return None
    return None


def map_row(row: dict) -> dict:
    """Map CSV row to model_snapshots schema."""
    creator = row.get("aa_model_creator_name", "") or ""
    return {
        "aa_slug":               row.get("aa_slug", "").strip(),
        "aa_name":               row.get("aa_name", "").strip(),
        "aa_model_creator_name": creator.strip(),
        "is_cn_provider":        is_cn_provider(creator),

        # Quality benchmarks
        "aa_intelligence_index":    safe_float(row.get("aa_evaluations_artificial_analysis_intelligence_index")),
        "aa_coding_index":          safe_float(row.get("aa_evaluations_artificial_analysis_coding_index")),
        "aa_gpqa":                  safe_float(row.get("aa_evaluations_gpqa")),
        "aa_hle":                   safe_float(row.get("aa_evaluations_hle")),
        "aa_ifbench":               safe_float(row.get("aa_evaluations_ifbench")),
        "aa_lcr":                   safe_float(row.get("aa_evaluations_lcr")),
        "aa_scicode":               safe_float(row.get("aa_evaluations_scicode")),
        "aa_terminalbench_hard":    safe_float(row.get("aa_evaluations_terminalbench_hard")),
        "aa_tau2":                  safe_float(row.get("aa_evaluations_tau2")),

        # Speed
        "aa_ttft_seconds":  safe_float(row.get("aa_median_time_to_first_token_seconds")),
        "aa_tps":           safe_float(row.get("aa_median_output_tokens_per_second")),

        # Pricing (USD per 1M tokens)
        "aa_price_input_usd":    safe_float(row.get("aa_pricing_price_1m_input_tokens")),
        "aa_price_output_usd":   safe_float(row.get("aa_pricing_price_1m_output_tokens")),
        "aa_price_blended_usd":  safe_float(row.get("aa_pricing_price_1m_blended_3_to_1")),

        # Context & metadata
        "aa_context_length":                safe_int(row.get("or_context_length")),
        "or_context_length":                safe_int(row.get("or_context_length")),
        "or_architecture_input_modalities": safe_json_string_array(row.get("or_architecture_input_modalities")),
        "aa_release_date":    row.get("aa_release_date", "").strip() or None,

        # Source flags
        "has_aa":            safe_bool(row.get("has_aa")),
        "has_or":            safe_bool(row.get("has_or")),
        "match_confidence":  row.get("match_confidence", "").strip() or None,
        "record_date":       row.get("record_date", "").strip() or None,
    }


def upsert_batch(records: list[dict]) -> None:
    """Upsert a batch of records into model_snapshots via Supabase REST API."""
    if not SUPABASE_URL or not SERVICE_ROLE_KEY:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars must be set."
        )

    url = f"{SUPABASE_URL}/rest/v1/model_snapshots"
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "resolution=merge-duplicates,return=minimal",
    }
    resp = requests.post(url, headers=headers, json=records, timeout=60)
    if not resp.ok:
        print(f"  ERROR {resp.status_code}: {resp.text[:400]}", file=sys.stderr)
        resp.raise_for_status()


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if not CSV_PATH.exists():
        print(f"CSV not found: {CSV_PATH}", file=sys.stderr)
        sys.exit(1)

    records = []
    skipped = 0

    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if not (safe_bool(row.get("has_aa")) and safe_bool(row.get("has_or"))):
                skipped += 1
                continue
            slug = row.get("aa_slug", "").strip()
            if not slug:
                skipped += 1
                continue
            records.append(map_row(row))

    print(f"Loaded {len(records)} records (skipped {skipped} without has_aa+has_or).")

    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i : i + BATCH_SIZE]
        print(f"  Upserting batch {i // BATCH_SIZE + 1} ({len(batch)} rows)...")
        upsert_batch(batch)

    print(f"Done. {len(records)} rows upserted to model_snapshots.")


if __name__ == "__main__":
    main()
