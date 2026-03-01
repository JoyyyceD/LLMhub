#!/usr/bin/env python3
import csv
from pathlib import Path

from series_rules import extract_series_name, make_slug

INPUTS = {
    'text_to_image': Path('docs/python/aa_split_outputs/aa_text_to_image_raw.csv'),
    'text_to_video': Path('docs/python/aa_split_outputs/aa_text_to_video_raw.csv'),
    'image_editing': Path('docs/python/aa_split_outputs/aa_image_editing_raw.csv'),
    'image_to_video': Path('docs/python/aa_split_outputs/aa_image_to_video_raw.csv'),
    'text_to_speech': Path('docs/python/aa_split_outputs/aa_text_to_speech_raw.csv'),
}

OUT = Path("Comment/multimodal_series_model_mapping_preview_v2.csv")


def generate() -> None:
    rows = []
    for modality, path in INPUTS.items():
        with path.open('r', encoding='utf-8-sig', newline='') as f:
            reader = csv.DictReader(f)
            for r in reader:
                model_name = (r.get('name') or '').strip()
                model_slug = (r.get('slug') or '').strip()
                if not model_name or not model_slug:
                    continue

                base_series_name = extract_series_name(model_name)
                series_name = extract_series_name(model_name, modality)
                series_slug = make_slug(series_name)
                modality_series_slug = f'{modality}::{series_slug}'

                rows.append({
                    'modality': modality,
                    'modality_series_slug': modality_series_slug,
                    'series_slug': series_slug,
                    'series_name': series_name,
                    'base_series_name': base_series_name,
                    'model_name': model_name,
                    'model_slug': model_slug,
                    'snapshot_aa_slug': f'{modality}::{model_slug}',
                    'model_creator_name': (r.get('model_creator_name') or '').strip(),
                })

    rows.sort(key=lambda x: (x['modality'], x['series_name'].lower(), x['model_name'].lower()))

    with OUT.open('w', encoding='utf-8', newline='') as f:
        writer = csv.DictWriter(
            f,
            fieldnames=[
                'modality', 'modality_series_slug', 'series_slug', 'series_name', 'base_series_name',
                'model_name', 'model_slug', 'snapshot_aa_slug', 'model_creator_name',
            ],
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f'written={OUT} rows={len(rows)}')


if __name__ == '__main__':
    generate()
