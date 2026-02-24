#!/usr/bin/env python3
"""Compute weighted model ranking from structured JSON input."""

import argparse
import json
from pathlib import Path

DEFAULT_WEIGHTS = {
    "quality": 0.35,
    "cost": 0.20,
    "latency": 0.20,
    "reliability": 0.15,
    "integration_fit": 0.10,
}

DIMENSIONS = tuple(DEFAULT_WEIGHTS.keys())


def normalize_weights(raw_weights):
    if not raw_weights:
        return DEFAULT_WEIGHTS.copy()

    weights = {}
    for dim in DIMENSIONS:
        weights[dim] = float(raw_weights.get(dim, 0))

    total = sum(weights.values())
    if total <= 0:
        raise ValueError("Weight total must be > 0.")

    return {k: v / total for k, v in weights.items()}


def score_model(model, weights):
    scores = model.get("scores", {})
    total = 0.0
    for dim in DIMENSIONS:
        value = float(scores.get(dim, 0))
        if value < 0 or value > 10:
            raise ValueError(
                f"Invalid score for '{model.get('name', 'unknown')}', dimension '{dim}': {value}. "
                "Each score must be in [0, 10]."
            )
        total += value * weights[dim]
    return round(total, 4)


def rank_models(payload):
    weights = normalize_weights(payload.get("weights"))
    models = payload.get("models", [])
    if not models:
        raise ValueError("Input JSON must include non-empty 'models'.")

    ranked = []
    for model in models:
        name = model.get("name")
        if not name:
            raise ValueError("Each model must include a non-empty 'name'.")
        ranked.append(
            {
                "name": name,
                "score": score_model(model, weights),
                "notes": model.get("notes", ""),
            }
        )

    ranked.sort(key=lambda x: x["score"], reverse=True)
    return {"weights": weights, "ranking": ranked}


def parse_args():
    parser = argparse.ArgumentParser(description="Rank models with weighted scores.")
    parser.add_argument(
        "--input",
        required=True,
        help="Path to JSON input containing weights and models.",
    )
    parser.add_argument(
        "--top-k",
        type=int,
        default=3,
        help="Limit output ranking count (default: 3).",
    )
    return parser.parse_args()


def main():
    args = parse_args()
    payload = json.loads(Path(args.input).read_text(encoding="utf-8"))
    result = rank_models(payload)
    if args.top_k > 0:
        result["ranking"] = result["ranking"][: args.top_k]
    print(json.dumps(result, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
