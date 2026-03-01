#!/usr/bin/env python3
"""
Sync model_series + model_snapshots.series_id using shared series rules.

This script:
1) Loads all snapshots (LLM + multimodal) from Supabase
2) Derives canonical series per snapshot with shared rules
3) Upserts missing series into model_series
4) Updates model_snapshots.series_id to mapped series
5) Writes a local audit CSV for review

Required env vars:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
"""

import csv
import os
import sys
import argparse
from collections import defaultdict
from pathlib import Path

import requests

from import_social_comments import (
    extract_series_name as llm_extract_series_name,
    get_provider as llm_get_provider,
    make_slug as llm_make_slug,
)
from series_rules import extract_series_name as multimodal_extract_series_name

SUPABASE_URL = os.environ.get("SUPABASE_URL", "").rstrip("/")
SERVICE_ROLE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "")
BATCH_SIZE = 100
AUDIT_CSV = Path("Comment/model_series_mapping_sync_audit.csv")


def api_headers(prefer: str = "") -> dict:
    headers = {
        "apikey": SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SERVICE_ROLE_KEY}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer
    return headers


def require_env() -> None:
    if not SUPABASE_URL or not SERVICE_ROLE_KEY:
        print("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required.", file=sys.stderr)
        sys.exit(1)


def load_snapshots() -> list[dict]:
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/model_snapshots",
        headers=api_headers(),
        params={
            "select": "aa_slug,aa_name,aa_modality,series_id,aa_model_creator_name",
            "limit": "10000",
        },
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()


def load_series() -> list[dict]:
    resp = requests.get(
        f"{SUPABASE_URL}/rest/v1/model_series",
        headers=api_headers(),
        params={"select": "id,slug,display_name,provider", "limit": "10000"},
        timeout=60,
    )
    resp.raise_for_status()
    return resp.json()


def build_series_slug(modality: str, series_name: str) -> str:
    base = llm_make_slug(series_name)
    # Keep LLM legacy slug format unchanged; split non-LLM by modality.
    if (modality or "llm") == "llm":
        return base
    return f"{modality}--{base}"


def upsert_series(records: list[dict]) -> None:
    if not records:
        return
    for i in range(0, len(records), BATCH_SIZE):
        batch = records[i : i + BATCH_SIZE]
        resp = requests.post(
            f"{SUPABASE_URL}/rest/v1/model_series",
            headers=api_headers("resolution=ignore-duplicates,return=minimal"),
            json=batch,
            timeout=60,
        )
        resp.raise_for_status()


def patch_snapshot_series(aa_slug: str, series_id: str) -> None:
    resp = requests.patch(
        f"{SUPABASE_URL}/rest/v1/model_snapshots",
        headers=api_headers("return=minimal"),
        params={"aa_slug": f"eq.{aa_slug}"},
        json={"series_id": series_id},
        timeout=60,
    )
    resp.raise_for_status()


def write_audit(rows: list[dict]) -> None:
    AUDIT_CSV.parent.mkdir(parents=True, exist_ok=True)
    with AUDIT_CSV.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                "modality",
                "series_slug",
                "series_name",
                "aa_slug",
                "aa_name",
                "creator_name",
                "current_series_id",
                "target_series_id",
                "needs_update",
            ],
        )
        writer.writeheader()
        writer.writerows(rows)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Sync model_series and model_snapshots.series_id across all modalities."
    )
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Only generate audit mapping CSV; do not upsert model_series or patch snapshots.",
    )
    parser.add_argument(
        "--progress-every",
        type=int,
        default=100,
        help="Print progress every N updated rows during apply mode (default: 100).",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    require_env()

    snapshots = load_snapshots()
    print(f"Loaded snapshots: {len(snapshots)}")

    existing_series = load_series()
    slug_to_series = {row["slug"]: row for row in existing_series}
    print(f"Loaded model_series: {len(existing_series)}")

    # Build expected mapping and series candidates.
    audit_rows: list[dict] = []
    missing_series_records: dict[str, dict] = {}
    for snap in snapshots:
        modality = (snap.get("aa_modality") or "llm").strip()
        aa_name = snap.get("aa_name") or ""
        aa_slug = snap.get("aa_slug") or ""
        current_series_id = snap.get("series_id")
        if modality == "llm":
            series_name = llm_extract_series_name(aa_name)
        else:
            series_name = multimodal_extract_series_name(aa_name, modality)
        if not series_name:
            continue

        series_slug = build_series_slug(modality, series_name)
        audit_rows.append(
            {
                "modality": modality,
                "series_slug": series_slug,
                "series_name": series_name,
                "aa_slug": aa_slug,
                "aa_name": aa_name,
                "creator_name": snap.get("aa_model_creator_name") or "",
                "current_series_id": current_series_id or "",
                "target_series_id": "",
                "needs_update": "",
            }
        )

        if series_slug not in slug_to_series:
            missing_series_records[series_slug] = {
                "slug": series_slug,
                "display_name": series_name,
                "provider": llm_get_provider(series_name),
                "query_aliases": [],
            }

    upsert_records = list(missing_series_records.values())
    if args.dry_run:
        print(f"Dry-run: would upsert new series rows: {len(upsert_records)}")
    else:
        upsert_series(upsert_records)
        print(f"Upserted new series rows: {len(upsert_records)}")

    # Reload series map to include newly inserted rows.
    if not args.dry_run:
        existing_series = load_series()
        slug_to_series = {row["slug"]: row for row in existing_series}

    # Resolve target series_id and patch only changed rows.
    updates_to_apply: list[tuple[str, str, str]] = []  # (aa_slug, target_series_id, modality)
    unresolved = 0
    per_modality = defaultdict(int)
    for row in audit_rows:
        mapped = slug_to_series.get(row["series_slug"])
        if not mapped:
            unresolved += 1
            row["target_series_id"] = ""
            row["needs_update"] = "true"
            continue

        target_series_id = mapped["id"]
        row["target_series_id"] = target_series_id
        needs_update = (row["current_series_id"] or "") != target_series_id
        row["needs_update"] = "true" if needs_update else "false"
        if needs_update:
            updates_to_apply.append((row["aa_slug"], target_series_id, row["modality"]))

    total_updates = len(updates_to_apply)
    if args.dry_run:
        print(f"Dry-run: rows requiring series_id update: {total_updates}")
    else:
        for idx, (aa_slug, target_series_id, modality) in enumerate(updates_to_apply, start=1):
            patch_snapshot_series(aa_slug, target_series_id)
            per_modality[modality] += 1
            if args.progress_every > 0 and idx % args.progress_every == 0:
                print(f"Progress: patched {idx}/{total_updates}")

    write_audit(sorted(audit_rows, key=lambda r: (r["modality"], r["series_name"].lower(), r["aa_name"].lower())))
    if args.dry_run:
        print(f"Dry-run: would update snapshot series_id rows: {total_updates}")
    else:
        print(f"Updated snapshot series_id rows: {total_updates}")
    if unresolved:
        print(f"Unresolved rows (missing target series): {unresolved}")
    if per_modality:
        print("Updated by modality:", dict(sorted(per_modality.items())))
    print(f"Audit CSV: {AUDIT_CSV}")


if __name__ == "__main__":
    main()
