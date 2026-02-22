#!/usr/bin/env python3
"""
pipeline.py  –  Daily LLM data pipeline for LLMhub
Fetches from Artificial Analysis + OpenRouter APIs, merges, and upserts
into Supabase model_snapshots table.

Required env vars:
  AA_API_KEY               – Artificial Analysis API key
  SUPABASE_URL             – e.g. https://xxx.supabase.co
  SUPABASE_SERVICE_ROLE_KEY – Supabase service-role JWT
"""

import datetime
import json
import os
import re
import sys
from collections import defaultdict
from difflib import SequenceMatcher

import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
AA_API_KEY        = os.environ.get("AA_API_KEY", "")
AA_API_BASE_URL   = "https://artificialanalysis.ai/api/v2/data"
OR_API_URL        = "https://openrouter.ai/api/v1/models"
SUPABASE_URL      = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_ROLE_KEY  = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
REQUEST_TIMEOUT   = 30
BATCH_SIZE        = 50

CN_PROVIDERS = {
    "deepseek", "alibaba", "baidu", "bytedance", "zhipu",
    "moonshot", "minimax", "tencent", "01ai",
}

# ---------------------------------------------------------------------------
# HTTP session with retries
# ---------------------------------------------------------------------------

def build_session():
    session = requests.Session()
    retry = Retry(
        total=3, connect=3, read=3,
        backoff_factor=0.5,
        status_forcelist=(429, 500, 502, 503, 504),
        allowed_methods=("GET",),
    )
    session.mount("https://", HTTPAdapter(max_retries=retry))
    return session

# ---------------------------------------------------------------------------
# Name normalisation helpers (mirrors fetch_model_data_v4.py)
# ---------------------------------------------------------------------------

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


def split_tokens(key):
    if not isinstance(key, str) or key == "":
        return set()
    return set(t for t in re.split(r"[-_/]+", key) if t)

# ---------------------------------------------------------------------------
# Data fetching
# ---------------------------------------------------------------------------

def fetch_aa_data(session):
    """Fetch LLM models from Artificial Analysis API (llms/models endpoint only)."""
    url = f"{AA_API_BASE_URL}/llms/models"
    print(f"Fetching AA: {url}")
    try:
        resp = session.get(url, headers={"x-api-key": AA_API_KEY}, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        records = resp.json().get("data", [])
        print(f"  AA: {len(records)} models fetched.")
        return records
    except Exception as e:
        print(f"  AA fetch error: {e}", file=sys.stderr)
        return []


def fetch_or_data(session):
    """Fetch models from OpenRouter API (no auth required)."""
    print(f"Fetching OR: {OR_API_URL}")
    try:
        resp = session.get(OR_API_URL, timeout=REQUEST_TIMEOUT)
        resp.raise_for_status()
        records = resp.json().get("data", [])
        print(f"  OR: {len(records)} models fetched.")
        return records
    except Exception as e:
        print(f"  OR fetch error: {e}", file=sys.stderr)
        return []

# ---------------------------------------------------------------------------
# Build normalised index dicts from raw JSON
# ---------------------------------------------------------------------------

def _safe_get(d, *keys, default=None):
    for k in keys:
        if isinstance(d, dict):
            d = d.get(k, default)
        else:
            return default
    return d


def flatten_aa(record: dict) -> dict:
    """Extract relevant fields from a raw AA model record."""
    evals = record.get("evaluations", {}) or {}
    pricing = record.get("pricing", {}) or {}
    creator = record.get("model_creator", {}) or {}
    return {
        "slug":               record.get("slug", ""),
        "name":               record.get("name", ""),
        "creator_name":       creator.get("name", ""),
        "release_date":       record.get("release_date", ""),
        "ttft":               record.get("median_time_to_first_token_seconds"),
        "tps":                record.get("median_output_tokens_per_second"),
        "price_input":        pricing.get("price_1m_input_tokens"),
        "price_output":       pricing.get("price_1m_output_tokens"),
        "price_blended":      pricing.get("price_1m_blended_3_to_1"),
        "intelligence_index": evals.get("artificial_analysis_intelligence_index"),
        "coding_index":       evals.get("artificial_analysis_coding_index"),
        "gpqa":               evals.get("gpqa"),
        "hle":                evals.get("hle"),
        "ifbench":            evals.get("ifbench"),
        "lcr":                evals.get("lcr"),
        "scicode":            evals.get("scicode"),
        "terminalbench_hard": evals.get("terminalbench_hard"),
        "tau2":               evals.get("tau2"),
    }


def flatten_or(record: dict) -> dict:
    """Extract relevant fields from a raw OpenRouter model record."""
    arch = record.get("architecture", {}) or {}
    top_prov = record.get("top_provider", {}) or {}
    return {
        "id":             record.get("id", ""),
        "name":           record.get("name", ""),
        "context_length": record.get("context_length"),
    }

# ---------------------------------------------------------------------------
# Matching (simplified alias-based merge, mirrors v4 logic)
# ---------------------------------------------------------------------------

def make_aliases(slug: str, name: str) -> set:
    candidates = [slug, name, strip_provider_prefix(name)]
    aliases = set()
    for c in candidates:
        aliases.add(normalize_name(c))
        aliases.add(model_core_key(c))
    aliases.discard("")
    return aliases


def score_pair(aa_aliases: set, or_aliases: set, aa_slug: str, or_canonical: str) -> int:
    shared = aa_aliases & or_aliases
    s = len(shared)
    aa_core = model_core_key(aa_slug)
    or_core = model_core_key(or_canonical)
    if aa_core and aa_core == or_core:
        s += 8
    elif aa_core and or_core:
        aa_t = split_tokens(aa_core)
        or_t = split_tokens(or_core)
        if aa_t and or_t:
            j = len(aa_t & or_t) / len(aa_t | or_t)
            if j >= 0.8:
                s += 4
        if SequenceMatcher(None, aa_core, or_core).ratio() >= 0.92:
            s += 3
    return s


def build_or_index(or_flat: list[dict]) -> dict:
    """Build alias->index mapping for OR records."""
    idx: dict[str, list[int]] = defaultdict(list)
    for i, rec in enumerate(or_flat):
        for alias in make_aliases(rec["id"], rec["name"]):
            idx[alias].append(i)
    return idx


def merge_aa_or(aa_records: list[dict], or_records: list[dict]) -> list[dict]:
    """Match AA records to OR records and produce merged rows."""
    aa_flat = [flatten_aa(r) for r in aa_records]
    or_flat = [flatten_or(r) for r in or_records]
    or_index = build_or_index(or_flat)
    used_or: set[int] = set()
    merged: list[dict] = []
    today = datetime.date.today().isoformat()

    for aa in aa_flat:
        if not aa["slug"]:
            continue
        aa_aliases = make_aliases(aa["slug"], aa["name"])
        candidate_idxs: set[int] = set()
        for alias in aa_aliases:
            for idx in or_index.get(alias, []):
                candidate_idxs.add(idx)
        candidate_idxs -= used_or

        best_or = None
        best_score = 0
        for idx in candidate_idxs:
            or_rec = or_flat[idx]
            s = score_pair(aa_aliases, make_aliases(or_rec["id"], or_rec["name"]),
                           aa["slug"], or_rec["id"])
            if s > best_score:
                best_score = s
                best_or = (idx, or_rec)

        # Determine confidence
        if best_score >= 10:
            confidence = "high"
        elif best_score >= 4:
            confidence = "medium"
        else:
            confidence = "low"

        creator = aa.get("creator_name", "")
        has_or = best_or is not None and best_score >= 4

        row = {
            "aa_slug":               aa["slug"],
            "aa_name":               aa["name"],
            "aa_model_creator_name": creator,
            "is_cn_provider":        _is_cn(creator),
            "aa_intelligence_index": aa.get("intelligence_index"),
            "aa_coding_index":       aa.get("coding_index"),
            "aa_gpqa":               aa.get("gpqa"),
            "aa_hle":                aa.get("hle"),
            "aa_ifbench":            aa.get("ifbench"),
            "aa_lcr":                aa.get("lcr"),
            "aa_scicode":            aa.get("scicode"),
            "aa_terminalbench_hard": aa.get("terminalbench_hard"),
            "aa_tau2":               aa.get("tau2"),
            "aa_ttft_seconds":       aa.get("ttft"),
            "aa_tps":                aa.get("tps"),
            "aa_price_input_usd":    aa.get("price_input"),
            "aa_price_output_usd":   aa.get("price_output"),
            "aa_price_blended_usd":  aa.get("price_blended"),
            "aa_release_date":       aa.get("release_date") or None,
            "aa_context_length":     best_or[1].get("context_length") if best_or else None,
            "has_aa":                True,
            "has_or":                has_or,
            "match_confidence":      confidence if has_or else None,
            "record_date":           today,
        }

        if best_or:
            used_or.add(best_or[0])

        # Only include rows that have both AA and OR data
        if row["has_aa"] and row["has_or"]:
            merged.append(row)

    print(f"Merged: {len(merged)} rows with has_aa=True AND has_or=True")
    return merged


def _is_cn(creator_name: str) -> bool:
    if not creator_name:
        return False
    lower = creator_name.lower()
    return any(kw in lower for kw in CN_PROVIDERS)

# ---------------------------------------------------------------------------
# Supabase upsert
# ---------------------------------------------------------------------------

def upsert_batch(records: list[dict]) -> None:
    if not SUPABASE_URL or not SERVICE_ROLE_KEY:
        raise RuntimeError("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.")
    url = f"{SUPABASE_URL}/rest/v1/model_snapshots"
    headers = {
        "apikey":        SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type":  "application/json",
        "Prefer":        "resolution=merge-duplicates,return=minimal",
    }
    resp = requests.post(url, headers=headers, json=records, timeout=60)
    if not resp.ok:
        print(f"  Upsert ERROR {resp.status_code}: {resp.text[:400]}", file=sys.stderr)
        resp.raise_for_status()


def upsert_all(records: list[dict]) -> None:
    total = len(records)
    for i in range(0, total, BATCH_SIZE):
        batch = records[i : i + BATCH_SIZE]
        print(f"  Upserting batch {i // BATCH_SIZE + 1} ({len(batch)} rows)...")
        upsert_batch(batch)
    print(f"Done. {total} rows upserted.")

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    if not AA_API_KEY:
        print("WARNING: AA_API_KEY not set – AA fetch will likely fail.", file=sys.stderr)
    if not SUPABASE_URL or not SERVICE_ROLE_KEY:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.", file=sys.stderr)
        sys.exit(1)

    session = build_session()
    aa_raw = fetch_aa_data(session)
    or_raw = fetch_or_data(session)

    if not aa_raw:
        print("No AA data fetched – aborting to avoid data loss.", file=sys.stderr)
        sys.exit(1)

    merged = merge_aa_or(aa_raw, or_raw)

    if not merged:
        print("No merged rows produced – check API responses.", file=sys.stderr)
        sys.exit(1)

    upsert_all(merged)


if __name__ == "__main__":
    main()
