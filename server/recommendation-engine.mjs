const DEFAULT_WEIGHTS = {
  quality: 0.35,
  cost: 0.2,
  latency: 0.2,
  reliability: 0.15,
  integration_fit: 0.1,
};

const DIMENSIONS = Object.keys(DEFAULT_WEIGHTS);

function clamp0To10(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(10, n));
}

function normalizeWeights(rawWeights) {
  if (!rawWeights || typeof rawWeights !== "object") {
    return { ...DEFAULT_WEIGHTS };
  }

  const weights = {};
  let total = 0;

  for (const dim of DIMENSIONS) {
    const v = Number(rawWeights[dim] ?? 0);
    weights[dim] = Number.isFinite(v) ? v : 0;
    total += weights[dim];
  }

  if (total <= 0) {
    return { ...DEFAULT_WEIGHTS };
  }

  const normalized = {};
  for (const dim of DIMENSIONS) {
    normalized[dim] = weights[dim] / total;
  }
  return normalized;
}

function blendedCostPer1K(pricing, scenario) {
  const inputCost = Number(pricing?.input_per_1k_usd ?? 0);
  const outputCost = Number(pricing?.output_per_1k_usd ?? 0);
  const inputTokens = Math.max(0, Number(scenario?.input_tokens_p50 ?? 0));
  const outputTokens = Math.max(0, Number(scenario?.output_tokens_p50 ?? 0));
  const totalTokens = inputTokens + outputTokens;

  if (totalTokens <= 0) return inputCost;
  const inputRatio = inputTokens / totalTokens;
  const outputRatio = outputTokens / totalTokens;
  return inputRatio * inputCost + outputRatio * outputCost;
}

function hardRejectionReasons(candidate, scenario) {
  const reasons = [];
  const limits = candidate?.limits ?? {};
  const capabilities = candidate?.capabilities ?? {};
  const perf = candidate?.performance ?? {};
  const pricing = candidate?.pricing ?? {};

  if (
    scenario?.context_window_min_tokens != null &&
    Number(limits.context_window_tokens ?? 0) < Number(scenario.context_window_min_tokens)
  ) {
    reasons.push("context_window_too_small");
  }

  if (scenario?.must_support_tools && !capabilities.tools) {
    reasons.push("missing_tool_support");
  }
  if (scenario?.must_support_json_schema && !capabilities.json_schema) {
    reasons.push("missing_json_schema_support");
  }
  if (scenario?.must_support_multimodal && !capabilities.multimodal) {
    reasons.push("missing_multimodal_support");
  }

  if (
    scenario?.p95_latency_ms_target != null &&
    Number(perf.p95_latency_ms ?? Number.POSITIVE_INFINITY) > Number(scenario.p95_latency_ms_target)
  ) {
    reasons.push("latency_above_target");
  }

  if (scenario?.max_cost_per_1k_tokens_usd != null) {
    const estCost = blendedCostPer1K(pricing, scenario);
    if (estCost > Number(scenario.max_cost_per_1k_tokens_usd)) {
      reasons.push("cost_above_limit");
    }
  }

  return reasons;
}

function withDimensionScores(feasible, scenario) {
  const costs = feasible.map((item) => item.estimated_cost_per_1k_usd);
  const latencies = feasible.map((item) => item.p95_latency_ms);

  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);
  const minLatency = Math.min(...latencies);
  const maxLatency = Math.max(...latencies);

  return feasible.map((item) => {
    const quality = clamp0To10(item.quality_0_10);
    const reliability = clamp0To10(item.reliability_0_10);
    const integrationFit = clamp0To10(item.integration_fit_0_10);

    const costScore =
      maxCost === minCost ? 10 : 10 * (maxCost - item.estimated_cost_per_1k_usd) / (maxCost - minCost);

    let latencyScore =
      maxLatency === minLatency ? 10 : 10 * (maxLatency - item.p95_latency_ms) / (maxLatency - minLatency);

    if (
      scenario?.p95_latency_ms_target != null &&
      item.p95_latency_ms <= Number(scenario.p95_latency_ms_target)
    ) {
      latencyScore = Math.min(10, latencyScore + 0.5);
    }

    return {
      ...item,
      dimension_scores_0_10: {
        quality: Number(quality.toFixed(4)),
        cost: Number(clamp0To10(costScore).toFixed(4)),
        latency: Number(clamp0To10(latencyScore).toFixed(4)),
        reliability: Number(reliability.toFixed(4)),
        integration_fit: Number(integrationFit.toFixed(4)),
      },
    };
  });
}

function weightedRank(feasible, weights) {
  const ranking = feasible.map((item) => {
    let total = 0;
    for (const dim of DIMENSIONS) {
      total += item.dimension_scores_0_10[dim] * weights[dim];
    }
    return {
      name: item.name,
      provider: item.provider ?? "",
      weighted_score_0_10: Number(total.toFixed(4)),
      dimension_scores_0_10: item.dimension_scores_0_10,
      estimated_cost_per_1k_usd: Number(item.estimated_cost_per_1k_usd.toFixed(6)),
    };
  });

  ranking.sort((a, b) => b.weighted_score_0_10 - a.weighted_score_0_10);
  return ranking;
}

export function evaluateModelRecommendation(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Payload must be a JSON object.");
  }

  const scenario = payload.scenario ?? {};
  const weights = normalizeWeights(payload.weights);
  const candidates = Array.isArray(payload.candidates) ? payload.candidates : [];
  const assumptions = [];
  const rejected = [];
  const feasible = [];

  if (candidates.length === 0) {
    throw new Error("Payload must include non-empty 'candidates'.");
  }

  if (scenario.output_tokens_p50 == null) {
    assumptions.push(
      "output token estimate defaults to input-token-weighted pricing behavior."
    );
  }

  for (const candidate of candidates) {
    const name = candidate?.name;
    if (!name) {
      throw new Error("Each candidate must include non-empty 'name'.");
    }

    const reasons = hardRejectionReasons(candidate, scenario);
    if (reasons.length > 0) {
      rejected.push({ name, reasons });
      continue;
    }

    feasible.push({
      name,
      provider: candidate.provider ?? "",
      quality_0_10: Number(candidate?.performance?.quality_0_10 ?? 0),
      reliability_0_10: Number(candidate?.performance?.reliability_0_10 ?? 0),
      p95_latency_ms: Number(candidate?.performance?.p95_latency_ms ?? Number.POSITIVE_INFINITY),
      integration_fit_0_10: Number(candidate.integration_fit_0_10 ?? 0),
      estimated_cost_per_1k_usd: blendedCostPer1K(candidate.pricing ?? {}, scenario),
    });
  }

  if (feasible.length === 0) {
    return {
      weights_normalized: weights,
      ranking: [],
      rejected,
      assumptions,
      error: "no_feasible_candidates",
    };
  }

  const scored = withDimensionScores(feasible, scenario);
  const ranking = weightedRank(scored, weights);

  return {
    weights_normalized: weights,
    ranking,
    rejected,
    assumptions,
  };
}
