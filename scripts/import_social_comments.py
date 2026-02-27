#!/usr/bin/env python3
"""
import_social_comments.py

Two-phase import for third-party social posts:

  Phase 1 – Seed model_series
    • Fetch all model_snapshots from Supabase
    • Strip size/date/variant suffixes from aa_name to derive series names
    • Upsert new series into model_series (skip existing by slug)
    • Update model_snapshots.series_id FK

  Phase 2 – Import social_posts
    • Read all CSVs from Comment/
    • Match each row's `query` field to a model_series (fuzzy, 0.8 threshold)
    • Unknown queries auto-create a new series entry
    • Upsert rows into social_posts, skipping duplicate uid

Usage:
    SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... python scripts/import_social_comments.py
"""

import csv
import os
import re
import sys
from difflib import get_close_matches
from pathlib import Path

import requests

# ── Config ────────────────────────────────────────────────────────────────────

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
BATCH_SIZE = 50
COMMENT_DIR = Path(__file__).parent.parent / "Comment"

PROVIDER_PREFIXES = {
    "qwen": "alibaba",
    "glm": "zhipu",
    "kimi": "moonshot",
    "minimax": "minimax",
    "gemini": "google",
    "gemma": "google",
    "claude": "anthropic",
    "gpt": "openai",
    "o1": "openai",
    "o3": "openai",
    "o4": "openai",
    "o5": "openai",
    "deepseek": "deepseek",
    "llama": "meta",
    "mistral": "mistral",
    "grok": "xai",
    "doubao": "bytedance",
    "ernie": "baidu",
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def api_headers(prefer: str = "") -> dict:
    h = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        h["Prefer"] = prefer
    return h


def _normalize_spaces(text: str) -> str:
    return re.sub(r"\s+", " ", text).strip()


def _extract_version_token(text: str) -> str | None:
    """
    Extract versions like 4.5, 3.1, 3n from strings such as:
    - GLM 4.5V
    - GPT-4.1 mini
    - Gemma 3n E4B
    """
    lowered = text.lower()

    # Decimal versions first: 4.5, 3.1 (also supports trailing letter: 4.5v)
    m = re.search(r"\b(\d+(?:\.\d+)+)(?=[a-z]?\b)", lowered)
    if m:
        return m.group(1)

    # n-suffixed versions: 3n
    m = re.search(r"\b(\d+n)\b", lowered)
    if m:
        return m.group(1)

    # Integer versions: 4, 5
    m = re.search(r"\b(\d+)\b", lowered)
    if m:
        return m.group(1)

    return None


def _extract_prefixed_version(text: str, prefixes: tuple[str, ...]) -> str | None:
    """Extract prefixed versions like V3.2 / R1 / K2.5 / M2.5."""
    prefix_group = "|".join(re.escape(p.lower()) for p in prefixes)
    m = re.search(
        rf"\b({prefix_group})\s*([0-9]+(?:\.[0-9]+)?)(?=[a-z]?\b)",
        text.lower(),
    )
    if not m:
        return None
    return f"{m.group(1).upper()}{m.group(2)}"


def _extract_version_after_brand(text: str, brand: str) -> str | None:
    """
    Extract version when attached to brand token:
    - qwen3.5 -> 3.5
    - lfm2.5 -> 2.5
    - olmo3.1 -> 3.1
    """
    m = re.search(rf"{re.escape(brand.lower())}\s*[-_ ]*([0-9]+(?:\.[0-9]+)?)", text.lower())
    if m:
        return m.group(1)
    return None


def _has_brand(text: str, brands: tuple[str, ...]) -> bool:
    low = text.lower()
    return any(b in low for b in brands)


def _canonicalize_by_family(name: str) -> str:
    """Collapse model variants into user-facing families (provider-specific)."""
    low = name.lower()

    # Claude: keep major/minor version + family (Sonnet/Opus/Haiku)
    if "claude" in low:
        family = None
        for fam in ("sonnet", "opus", "haiku"):
            if re.search(rf"\b{fam}\b", low):
                family = fam.title()
                break
        version = re.search(r"\b(\d+(?:\.\d+)?)\b", low)
        if version:
            return _normalize_spaces(f"Claude {version.group(1)} {family or ''}")
        return _normalize_spaces(f"Claude {family or ''}")

    # DeepSeek: collapse to DeepSeek Vx.y (or Rx when present)
    if "deepseek" in low:
        vr = _extract_prefixed_version(low, ("v", "r"))
        if vr:
            return f"DeepSeek {vr}"
        return "DeepSeek"

    # Gemini: collapse to Gemini x.y
    if "gemini" in low:
        version = _extract_version_token(low)
        if version:
            return f"Gemini {version}"
        return "Gemini"

    # Gemma: collapse to Gemma 3n / 3 / etc.
    if "gemma" in low:
        version = _extract_version_token(low)
        if version:
            return f"Gemma {version}"
        return "Gemma"

    # GLM: collapse to GLM x.y
    if "glm" in low:
        version = _extract_version_token(low)
        if version:
            return f"GLM {version}"
        return "GLM"

    # GPT: collapse to GPT x.y
    if "gpt" in low:
        version = _extract_version_token(low)
        if version:
            return f"GPT {version}"
        return "GPT"

    # Granite: collapse to Granite x.y
    if "granite" in low:
        version = _extract_version_token(low)
        if version:
            return f"Granite {version}"
        return "Granite"

    # Qwen family: Qwen 3 / Qwen 3.5 / Qwen 2.5
    if "qwen" in low:
        version = _extract_version_after_brand(low, "qwen") or _extract_version_token(low)
        if version:
            return f"Qwen {version}"
        return "Qwen"

    # Kimi family: keep K prefix when available (K2 / K2.5)
    if "kimi" in low:
        k = _extract_prefixed_version(low, ("k",))
        if k:
            return f"Kimi {k}"
        version = _extract_version_token(low)
        if version:
            return f"Kimi {version}"
        return "Kimi"

    # MiniMax family: keep M prefix when available (M1 / M2.5)
    if "minimax" in low or "mini max" in low:
        m = _extract_prefixed_version(low, ("m",))
        if m:
            return f"MiniMax {m}"
        version = _extract_version_token(low)
        if version:
            return f"MiniMax {version}"
        return "MiniMax"

    # Llama
    if "llama" in low:
        version = _extract_version_token(low)
        if version:
            return f"Llama {version}"
        return "Llama"

    # Grok
    if "grok" in low:
        version = _extract_version_token(low)
        if version:
            return f"Grok {version}"
        return "Grok"

    # Mistral variants
    if _has_brand(low, ("mistral", "ministral", "magistral")):
        if "ministral" in low:
            brand = "Ministral"
        elif "magistral" in low:
            brand = "Magistral"
        else:
            brand = "Mistral"
        version = _extract_version_token(low)
        if version:
            return f"{brand} {version}"
        return brand

    # OpenAI o-series (o1/o3/o4/o5), collapse mini/pro/preview
    m = re.search(r"\bo([1345](?:\.\d+)?)\b", low)
    if m:
        return f"O{m.group(1)}"

    # K2 family (e.g. K2 V2 / K2 Think V2)
    if re.search(r"\bk2\b", low):
        v = _extract_prefixed_version(low, ("v",))
        if v:
            return f"K2 {v}"
        return "K2"

    # Other major brands, collapsed by principal version
    generic_versioned_brands: list[tuple[str, tuple[str, ...]]] = [
        ("ERNIE", ("ernie",)),
        ("Doubao", ("doubao",)),
        ("EXAONE", ("exaone",)),
        ("Devstral", ("devstral",)),
        ("Jamba", ("jamba",)),
        ("Nova", ("nova",)),
        ("Phi", ("phi",)),
        ("LFM", ("lfm",)),
        ("Solar", ("solar",)),
        ("Sonar", ("sonar",)),
        ("Ling", ("ling",)),
        ("OpenChat", ("openchat",)),
    ]
    for display, keys in generic_versioned_brands:
        if _has_brand(low, keys):
            key = keys[0]
            version = _extract_version_after_brand(low, key) or _extract_version_token(low)
            if version:
                return f"{display} {version}"
            return display

    # OLMo family with stable casing
    if _has_brand(low, ("olmo",)):
        version = _extract_version_after_brand(low, "olmo") or _extract_version_token(low)
        if version:
            return f"OLMo {version}"
        return "OLMo"

    # Command family (Cohere)
    if _has_brand(low, ("command",)):
        version = _extract_version_token(low)
        if version:
            return f"Command {version}"
        if "r" in low:
            return "Command R"
        if "a" in low:
            return "Command A"
        return "Command"

    # NVIDIA Nemotron family
    if _has_brand(low, ("nemotron", "nvidia")):
        version = _extract_version_token(low)
        if version:
            return f"NVIDIA Nemotron {version}"
        return "NVIDIA Nemotron"

    # Tri family: normalize case variants like "Tri 21B think/Think"
    if re.search(r"\btri\b", low):
        size = re.search(r"\b(\d+(?:\.\d+)?)b\b", low)
        think = " Think" if re.search(r"\bthink\b", low) else ""
        if size:
            return f"Tri {size.group(1)}B{think}"
        return f"Tri{think}".strip()

    return name


def extract_series_name(aa_name: str) -> str:
    """Strip suffixes and collapse model variants into canonical series families."""
    name = aa_name

    # 1. Strip reasoning/effort modes
    name = re.sub(
        r"\s*\((Non-reasoning|Reasoning|Adaptive Reasoning|"
        r"high|low|medium|minimal|xhigh|ChatGPT|experimental|preview|"
        r"high effort|low effort)\)",
        "", name, flags=re.IGNORECASE,
    )

    # 2. Strip date stamps in parens: (Feb '25), (Mar' 25), (June '24)
    name = re.sub(r"\s*\([A-Za-z]{3,9}\s*'?\s*\d{2}\)", "", name)
    # 2b. Strip numeric parenthetical stamps: (1210), (2025)
    name = re.sub(r"\s*\(\d{4}\)", "", name)

    # 3. Strip model size params: "235B A22B", "32B A3B", "8B", "1.7B", "0.6B"
    name = re.sub(r"\s+\d+(\.\d+)?[Bb]\s+[Aa]\d+(\.\d+)?[Bb]", "", name)
    name = re.sub(r"\s+[Aa]\d+(\.\d+)?[Bb]", "", name)
    name = re.sub(r"\s+\d+(\.\d+)?[Bb]", "", name)

    # 4. Strip trailing qualifier words
    name = re.sub(
        r"\s+(Instruct|Preview|Experimental|Thinking|Exp|Speciale)\s*$",
        "", name, flags=re.IGNORECASE,
    )

    # 5. Strip trailing 4-digit date codes: 0905, 2507, 0528
    name = re.sub(r"\s+\d{4}\s*$", "", name)

    # 6. Normalize punctuation before family collapsing
    name = re.sub(r"\s*-\s*", " ", name)
    name = _normalize_spaces(name)

    return _canonicalize_by_family(name)


def make_slug(name: str) -> str:
    """Convert display name to a URL-safe slug."""
    slug = name.lower()
    slug = re.sub(r"[^a-z0-9.]+", "-", slug)
    return slug.strip("-")


def normalize_for_match(name: str) -> str:
    """Lowercase and strip all non-alphanumerics for fuzzy comparison."""
    return re.sub(r"[^a-z0-9]", "", name.lower())


def get_provider(series_name: str) -> str | None:
    low = series_name.lower()
    for prefix, provider in PROVIDER_PREFIXES.items():
        if low.startswith(prefix):
            return provider
    return None


# ── Phase 1: Seed model_series from model_snapshots ──────────────────────────

def load_snapshots() -> list[dict]:
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/model_snapshots",
        headers=api_headers(),
        params={"select": "aa_slug,aa_name,series_id", "limit": "10000"},
    )
    resp.raise_for_status()
    return resp.json()


def load_all_series() -> list[dict]:
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/model_series",
        headers=api_headers(),
        params={"select": "id,slug,display_name,query_aliases", "limit": "10000"},
    )
    resp.raise_for_status()
    return resp.json()


def upsert_series_batch(records: list[dict]) -> list[dict]:
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/model_series",
        headers=api_headers("resolution=ignore-duplicates,return=representation"),
        json=records,
    )
    resp.raise_for_status()
    return resp.json()


def seed_model_series(snapshots: list[dict], existing_slugs: set[str]) -> int:
    """Derive unique series from snapshots and upsert any new ones."""
    # Collect unique (series_name, slug) pairs
    seen: dict[str, str] = {}  # slug -> display_name
    for snap in snapshots:
        series_name = extract_series_name(snap["aa_name"])
        if not series_name:
            continue
        slug = make_slug(series_name)
        if slug not in seen:
            seen[slug] = series_name

    new_records = [
        {
            "slug": slug,
            "display_name": name,
            "provider": get_provider(name),
            "query_aliases": [],
        }
        for slug, name in sorted(seen.items())
        if slug not in existing_slugs
    ]

    inserted = 0
    for i in range(0, len(new_records), BATCH_SIZE):
        batch = new_records[i : i + BATCH_SIZE]
        result = upsert_series_batch(batch)
        inserted += len(result)

    print(f"  model_series: {inserted} new rows inserted (of {len(new_records)} new slugs derived)")
    return inserted


def build_series_lookup(all_series: list[dict]) -> dict[str, dict]:
    """
    Returns a dict: normalized_name -> series record.
    Indexed by both display_name and all query_aliases.
    """
    lookup: dict[str, dict] = {}
    for s in all_series:
        names = {s["display_name"], extract_series_name(s["display_name"])}
        for alias in (s.get("query_aliases") or []):
            names.add(alias)
            names.add(extract_series_name(alias))
        for name in names:
            norm = normalize_for_match(name)
            if norm:
                lookup[norm] = s
    return lookup


def match_query_to_series(
    query: str,
    lookup: dict[str, dict],
    all_series: list[dict],
) -> dict | None:
    """
    Try to find a matching model_series for a raw CSV query string.
    1. Exact normalized match
    2. difflib fuzzy match (cutoff=0.80)
    Returns the series record or None.
    """
    canonical_query = extract_series_name(query)
    norm = normalize_for_match(canonical_query or query)
    if not norm:
        return None

    # 1. Exact
    if norm in lookup:
        return lookup[norm]

    # 2. Fuzzy against all normalized keys
    candidates = list(lookup.keys())
    matches = get_close_matches(norm, candidates, n=1, cutoff=0.80)
    if matches:
        return lookup[matches[0]]

    return None


def get_or_create_series(
    query: str,
    lookup: dict[str, dict],
    all_series: list[dict],
) -> str | None:
    """Return series_id for query, auto-creating a new series if needed."""
    series = match_query_to_series(query, lookup, all_series)
    if series:
        return series["id"]

    # Auto-create
    canonical_query = extract_series_name(query)
    name_for_create = canonical_query or query
    slug = make_slug(name_for_create)
    print(
        f"    ⚠ No match for query '{query}' — creating series "
        f"'{name_for_create}' (slug: {slug})"
    )
    resp = requests.post(
        f"{SUPABASE_URL}/rest/v1/model_series",
        headers=api_headers("resolution=ignore-duplicates,return=representation"),
        json=[{
            "slug": slug,
            "display_name": name_for_create,
            "provider": get_provider(name_for_create),
            "query_aliases": [query],
        }],
    )
    resp.raise_for_status()
    data = resp.json()
    if data:
        new_series = data[0]
        # Add to local structures so subsequent rows in same file reuse it
        lookup[normalize_for_match(query)] = new_series
        lookup[normalize_for_match(name_for_create)] = new_series
        all_series.append(new_series)
        return new_series["id"]

    return None


def update_snapshot_series_ids(
    snapshots: list[dict],
    lookup: dict[str, dict],
    all_series: list[dict],
) -> None:
    """Patch model_snapshots.series_id for any snapshot that still has null."""
    updates: list[tuple[str, str]] = []  # (aa_slug, series_id)
    for snap in snapshots:
        if snap.get("series_id"):
            continue
        series_name = extract_series_name(snap["aa_name"])
        if not series_name:
            continue
        series = match_query_to_series(series_name, lookup, all_series)
        if series:
            updates.append((snap["aa_slug"], series["id"]))

    patched = 0
    for aa_slug, series_id in updates:
        resp = requests.patch(
            f"{SUPABASE_URL}/rest/v1/model_snapshots",
            headers=api_headers("return=minimal"),
            params={"aa_slug": f"eq.{aa_slug}"},
            json={"series_id": series_id},
        )
        resp.raise_for_status()
        patched += 1

    print(f"  model_snapshots.series_id: {patched} rows updated")


# ── Phase 2: Import social_posts from CSVs ────────────────────────────────────

def parse_int(val: str, default: int = 0) -> int:
    try:
        return int(val)
    except (ValueError, TypeError):
        return default


def parse_score(val: str) -> int | None:
    try:
        v = int(val)
        return v if 0 <= v <= 5 else None
    except (ValueError, TypeError):
        return None


def parse_date(val: str) -> str | None:
    """Accept YYYY/MM/DD or YYYY-MM-DD, return ISO date string or None."""
    if not val:
        return None
    val = val.strip().replace("/", "-")
    if re.match(r"^\d{4}-\d{2}-\d{2}$", val):
        return val
    return None


def parse_timestamp(val: str) -> str | None:
    if not val:
        return None
    # "2026/02/26 18:37" -> "2026-02-26 18:37:00"
    val = val.strip().replace("/", "-")
    if re.match(r"^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$", val):
        return val + ":00"
    return val if val else None


def import_csv(
    csv_path: Path,
    lookup: dict[str, dict],
    all_series: list[dict],
) -> tuple[int, int]:
    """Import one CSV file. Returns (inserted, skipped)."""
    rows_to_insert: list[dict] = []
    query_cache: dict[str, str | None] = {}

    with open(csv_path, newline="", encoding="utf-8-sig") as f:
        reader = csv.DictReader(f)
        for row in reader:
            uid = row.get("uid", "").strip()
            if not uid:
                continue

            query = row.get("query", "").strip()
            if query not in query_cache:
                query_cache[query] = get_or_create_series(query, lookup, all_series)
            series_id = query_cache[query]

            rows_to_insert.append({
                "uid": uid,
                "series_id": series_id,
                "platform": row.get("platform", "").strip() or None,
                "query": query or None,
                "post_date": parse_date(row.get("post_date", "")),
                "source_url": row.get("source_url", "").strip() or None,
                "title": row.get("title", "").strip() or None,
                "author": row.get("author", "").strip() or None,
                "like_count": parse_int(row.get("like_count", "0")),
                "comment_count": parse_int(row.get("comment_count", "0")),
                "collect_count": parse_int(row.get("collect_count", "0")),
                "overall_score": parse_score(row.get("overall_score", "")),
                "score_quality": parse_score(row.get("score_quality", "")),
                "score_value": parse_score(row.get("score_value", "")),
                "score_latency": parse_score(row.get("score_latency", "")),
                "score_throughput": parse_score(row.get("score_throughput", "")),
                "score_stability": parse_score(row.get("score_stability", "")),
                "pros_summary": row.get("pros_summary", "").strip() or None,
                "cons_summary": row.get("cons_summary", "").strip() or None,
                "overall_summary": row.get("overall_summary", "").strip() or None,
                "evidence": row.get("evidence", "").strip() or None,
                "tag": row.get("tag", "").strip() or None,
                "fetched_at": parse_timestamp(row.get("fetched_at", "")),
                "run_id": row.get("run_id", "").strip() or None,
            })

    if not rows_to_insert:
        return 0, 0

    inserted = 0
    for i in range(0, len(rows_to_insert), BATCH_SIZE):
        batch = rows_to_insert[i : i + BATCH_SIZE]
        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/social_posts",
            headers=api_headers("resolution=ignore-duplicates,return=minimal"),
            json=batch,
        )
        if resp.status_code not in (200, 201):
            print(f"  ERROR batch {i//BATCH_SIZE + 1}: {resp.status_code} {resp.text[:200]}")
            resp.raise_for_status()
        # Supabase returns 200 with empty body when all rows were ignored,
        # 201 when rows were inserted. We can't easily distinguish without
        # return=representation, so just count what we sent.
        inserted += len(batch)

    total = len(rows_to_insert)
    return inserted, 0  # actual skips counted server-side via ignore-duplicates


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    if not SUPABASE_URL or not SERVICE_ROLE_KEY:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY", file=sys.stderr)
        sys.exit(1)

    csv_files = sorted(COMMENT_DIR.glob("*.csv"))
    if not csv_files:
        print(f"No CSV files found in {COMMENT_DIR}")
        sys.exit(0)

    print(f"Found {len(csv_files)} CSV file(s): {[f.name for f in csv_files]}")

    # ── Phase 1 ──────────────────────────────────────────────────────────────
    print("\n── Phase 1: Seeding model_series ────────────────────────────────")

    snapshots = load_snapshots()
    print(f"  Loaded {len(snapshots)} model_snapshots")

    existing_series = load_all_series()
    existing_slugs = {s["slug"] for s in existing_series}
    print(f"  Existing model_series: {len(existing_series)}")

    seed_model_series(snapshots, existing_slugs)

    # Reload after insert
    all_series = load_all_series()
    lookup = build_series_lookup(all_series)
    print(f"  Total model_series after seed: {len(all_series)}")

    print("\n  Updating model_snapshots.series_id …")
    update_snapshot_series_ids(snapshots, lookup, all_series)

    # ── Phase 2 ──────────────────────────────────────────────────────────────
    print("\n── Phase 2: Importing social_posts ──────────────────────────────")

    total_sent = 0
    for csv_path in csv_files:
        print(f"\n  {csv_path.name}")
        sent, _ = import_csv(csv_path, lookup, all_series)
        print(f"    → {sent} rows sent (duplicates silently skipped by DB)")
        total_sent += sent

    print(f"\n✓ Done — {total_sent} rows sent across {len(csv_files)} file(s)")


if __name__ == "__main__":
    main()
