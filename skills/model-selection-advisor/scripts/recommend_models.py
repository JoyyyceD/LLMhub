#!/usr/bin/env python3
"""Filter and rank model candidates from a structured recommendation request."""

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


def clamp_0_10(value):
    return max(0.0, min(10.0, float(value)))


def normalize_weights(raw_weights):
    if not raw_weights:
        return DEFAULT_WEIGHTS.copy()

    weights = {dim: float(raw_weights.get(dim, 0)) for dim in DIMENSIONS}
    total = sum(weights.values())
    if total <= 0:
        raise ValueError("Weight total must be > 0.")
    return {dim: w / total for dim, w in weights.items()}


def blended_cost_per_1k(pricing, scenario):
    input_cost = float(pricing.get("input_per_1k_usd", 0))
    output_cost = float(pricing.get("output_per_1k_usd", 0))
    in_tokens = max(0.0, float(scenario.get("input_tokens_p50", 0)))
    out_tokens = max(0.0, float(scenario.get("output_tokens_p50", 0)))
    total = in_tokens + out_tokens
    if total <= 0:
        return input_cost
    in_ratio = in_tokens / total
    out_ratio = out_tokens / total
    return in_ratio * input_cost + out_ratio * output_cost


def hard_rejection_reasons(candidate, scenario):
    reasons = []
    limits = candidate.get("limits", {})
    capabilities = candidate.get("capabilities", {})
    perf = candidate.get("performance", {})
    pricing = candidate.get("pricing", {})

    context_min = scenario.get("context_window_min_tokens")
    if context_min is not None:
        if int(limits.get("context_window_tokens", 0)) < int(context_min):
            reasons.append("context_window_too_small")

    if scenario.get("must_support_tools") and not capabilities.get("tools", False):
        reasons.append("missing_tool_support")
    if scenario.get("must_support_json_schema") and not capabilities.get("json_schema", False):
        reasons.append("missing_json_schema_support")
    if scenario.get("must_support_multimodal") and not capabilities.get("multimodal", False):
        reasons.append("missing_multimodal_support")

    latency_target = scenario.get("p95_latency_ms_target")
    if latency_target is not None and float(perf.get("p95_latency_ms", 10**9)) > float(latency_target):
        reasons.append("latency_above_target")

    max_cost = scenario.get("max_cost_per_1k_tokens_usd")
    if max_cost is not None:
        est = blended_cost_per_1k(pricing, scenario)
        if est > float(max_cost):
            reasons.append("cost_above_limit")

    return reasons


def to_dimension_scores(feasible, scenario):
    costs = [item["estimated_cost_per_1k_usd"] for item in feasible]
    lats = [item["p95_latency_ms"] for item in feasible]

    min_cost, max_cost = min(costs), max(costs)
    min_lat, max_lat = min(lats), max(lats)

    for item in feasible:
        quality = clamp_0_10(item["quality_0_10"])
        reliability = clamp_0_10(item["reliability_0_10"])
        integration_fit = clamp_0_10(item["integration_fit_0_10"])

        if max_cost == min_cost:
            cost_score = 10.0
        else:
            cost_score = 10.0 * (max_cost - item["estimated_cost_per_1k_usd"]) / (max_cost - min_cost)

        if max_lat == min_lat:
            latency_score = 10.0
        else:
            latency_score = 10.0 * (max_lat - item["p95_latency_ms"]) / (max_lat - min_lat)

        # Reward models that meet strict latency target by a margin.
        latency_target = scenario.get("p95_latency_ms_target")
        if latency_target is not None and item["p95_latency_ms"] <= float(latency_target):
            latency_score = min(10.0, latency_score + 0.5)

        item["dimension_scores_0_10"] = {
            "quality": round(quality, 4),
            "cost": round(clamp_0_10(cost_score), 4),
            "latency": round(clamp_0_10(latency_score), 4),
            "reliability": round(reliability, 4),
            "integration_fit": round(integration_fit, 4),
        }


def weighted_rank(feasible, weights):
    ranking = []
    for item in feasible:
        total = 0.0
        for dim in DIMENSIONS:
            total += item["dimension_scores_0_10"][dim] * weights[dim]
        ranking.append(
            {
                "name": item["name"],
                "provider": item.get("provider", ""),
                "weighted_score_0_10": round(total, 4),
                "dimension_scores_0_10": item["dimension_scores_0_10"],
                "estimated_cost_per_1k_usd": round(item["estimated_cost_per_1k_usd"], 6),
            }
        )
    ranking.sort(key=lambda x: x["weighted_score_0_10"], reverse=True)
    return ranking


def evaluate(payload):
    scenario = payload.get("scenario", {})
    weights = normalize_weights(payload.get("weights"))
    candidates = payload.get("candidates", [])
    if not candidates:
        raise ValueError("Payload must include non-empty 'candidates'.")

    rejected = []
    feasible = []
    assumptions = []

    if "output_tokens_p50" not in scenario:
        assumptions.append("output token estimate defaults to input-token-weighted pricing behavior.")

    for candidate in candidates:
        name = candidate.get("name")
        if not name:
            raise ValueError("Each candidate must include non-empty 'name'.")

        reasons = hard_rejection_reasons(candidate, scenario)
        if reasons:
            rejected.append({"name": name, "reasons": reasons})
            continue

        perf = candidate.get("performance", {})
        pricing = candidate.get("pricing", {})
        feasible.append(
            {
                "name": name,
                "provider": candidate.get("provider", ""),
                "quality_0_10": float(perf.get("quality_0_10", 0)),
                "reliability_0_10": float(perf.get("reliability_0_10", 0)),
                "p95_latency_ms": float(perf.get("p95_latency_ms", 10**9)),
                "integration_fit_0_10": float(candidate.get("integration_fit_0_10", 0)),
                "estimated_cost_per_1k_usd": blended_cost_per_1k(pricing, scenario),
            }
        )

    if not feasible:
        return {
            "weights_normalized": weights,
            "ranking": [],
            "rejected": rejected,
            "assumptions": assumptions,
            "error": "no_feasible_candidates",
        }

    to_dimension_scores(feasible, scenario)
    ranking = weighted_rank(feasible, weights)

    return {
        "weights_normalized": weights,
        "ranking": ranking,
        "rejected": rejected,
        "assumptions": assumptions,
    }


def parse_args():
    parser = argparse.ArgumentParser(description="Recommend and rank model candidates.")
    parser.add_argument("--input", required=True, help="Path to request JSON file.")
    parser.add_argument("--top-k", type=int, default=3, help="Return top k ranked candidates.")
    return parser.parse_args()


def main():
    args = parse_args()
    payload = json.loads(Path(args.input).read_text(encoding="utf-8"))
    result = evaluate(payload)
    if args.top_k > 0:
        result["ranking"] = result["ranking"][: args.top_k]
    print(json.dumps(result, ensure_ascii=True, indent=2))


if __name__ == "__main__":
    main()
