/**
 * scoring.ts
 *
 * Front-end recommendation engine.
 * All computation runs in the browser over ~50-200 ModelSnapshot records.
 */

import type {
  ModelSnapshot,
  RecommendationInput,
  RecommendationResult,
  DimensionScores,
} from '../types';

import {
  QUALITY_CONFIG,
  PROFILE_WEIGHTS,
  CN_PROVIDERS,
  type QualityMetric,
  type QualityWeights,
} from './qualityConfig';

// USD → CNY conversion rate (approx)
const USD_TO_CNY = 7.25;

// ---------------------------------------------------------------------------
// Step 1: Filter candidates
// ---------------------------------------------------------------------------

export function filterCandidates(
  models: ModelSnapshot[],
  input: RecommendationInput,
): ModelSnapshot[] {
  return models.filter((m) => {
    // Must have both sources
    if (!m.has_aa || !m.has_or) return false;

    // Must have intelligence_index (minimum quality signal)
    if (m.aa_intelligence_index == null) return false;

    // Region filter: CN = only cn providers
    if (input.region === 'cn' && !m.is_cn_provider) return false;

    return true;
  });
}

// ---------------------------------------------------------------------------
// Step 2: Compute raw quality score for a model given metric weights
// ---------------------------------------------------------------------------

export function computeQualityRaw(
  model: ModelSnapshot,
  weights: QualityWeights,
): number {
  const entries = Object.entries(weights) as [QualityMetric, number][];
  let weightedSum = 0;
  let usedWeight = 0;

  for (const [metric, w] of entries) {
    const val = model[metric];
    if (val != null && w > 0) {
      weightedSum += val * w;
      usedWeight += w;
    }
  }

  // If all metrics are missing, fall back to intelligence_index
  if (usedWeight === 0) {
    return model.aa_intelligence_index ?? 0;
  }

  return weightedSum / usedWeight;
}

// ---------------------------------------------------------------------------
// Step 3: Percentile normalisation (P10–P90 clipping → 0-100)
// ---------------------------------------------------------------------------

export function normalizeP10P90(vals: number[], lowerBetter: boolean): number[] {
  if (vals.length === 0) return [];
  const sorted = [...vals].sort((a, b) => a - b);
  const n = sorted.length;
  const p10 = sorted[Math.max(0, Math.floor(n * 0.1))];
  const p90 = sorted[Math.min(n - 1, Math.floor(n * 0.9))];
  const range = p90 - p10;

  return vals.map((v) => {
    if (range === 0) return 50;
    const clipped = Math.max(p10, Math.min(p90, v));
    const normalised = (clipped - p10) / range; // 0-1, higher=better raw
    return lowerBetter
      ? (1 - normalised) * 100
      : normalised * 100;
  });
}

// ---------------------------------------------------------------------------
// Step 4: Compute all 4 dimensions for each candidate, then normalise
// ---------------------------------------------------------------------------

interface RawScores {
  quality: number;
  cost: number;      // raw cost (blended USD price, lower = better raw)
  latency: number;   // raw TTFT seconds, lower = better
  throughput: number;// raw TPS, higher = better
}

export function computeScores(
  candidates: ModelSnapshot[],
  input: RecommendationInput,
): DimensionScores[] {
  const subKey = input.sub_scenario;
  const scenarioWeights =
    QUALITY_CONFIG[input.scenario]?.[subKey] ??
    QUALITY_CONFIG[input.scenario]?.['general'] ??
    { aa_intelligence_index: 1 };

  const dimWeights = PROFILE_WEIGHTS[input.profile];

  // ── Compute raw dimension values for each candidate ──
  const rawList: RawScores[] = candidates.map((m) => ({
    quality:    computeQualityRaw(m, scenarioWeights),
    cost:       m.aa_price_blended_usd ?? (
                  m.aa_price_input_usd != null && m.aa_price_output_usd != null
                    ? (m.aa_price_input_usd + m.aa_price_output_usd * 3) / 4
                    : 999
                ),
    latency:    m.aa_ttft_seconds ?? 99,
    throughput: m.aa_tps ?? 0,
  }));

  // ── Normalise each dimension P10-P90 → 0-100 ──
  const qualNorm   = normalizeP10P90(rawList.map((r) => r.quality),    false);
  const costNorm   = normalizeP10P90(rawList.map((r) => r.cost),       true);  // lower cost = higher score
  const latNorm    = normalizeP10P90(rawList.map((r) => r.latency),    true);  // lower TTFT = higher score
  const thruNorm   = normalizeP10P90(rawList.map((r) => r.throughput), false);

  // ── Apply speed_profile bias ──
  const speedMod = (i: number) => {
    if (input.speed_profile === 'low_latency') return { lat: latNorm[i] * 1.3, thru: thruNorm[i] * 0.7 };
    if (input.speed_profile === 'high_throughput') return { lat: latNorm[i] * 0.7, thru: thruNorm[i] * 1.3 };
    return { lat: latNorm[i], thru: thruNorm[i] };
  };

  return candidates.map((_, i) => {
    const { lat, thru } = speedMod(i);
    const q = qualNorm[i];
    const c = costNorm[i];
    const latClamped  = Math.min(100, lat);
    const thruClamped = Math.min(100, thru);

    const total =
      q   * dimWeights.quality   +
      c   * dimWeights.cost      +
      latClamped  * dimWeights.latency   +
      thruClamped * dimWeights.throughput;

    return {
      quality:    Math.round(q),
      cost:       Math.round(c),
      latency:    Math.round(latClamped),
      throughput: Math.round(thruClamped),
      total:      Math.round(total),
    };
  });
}

// ---------------------------------------------------------------------------
// Step 5: Generate rule-based explanations
// ---------------------------------------------------------------------------

function fmt(n: number | null | undefined, decimals = 2): string {
  if (n == null) return 'N/A';
  return n.toFixed(decimals);
}

function fmtPrice(usd: number | null | undefined): string {
  if (usd == null) return 'N/A';
  const cny = usd * USD_TO_CNY;
  return `¥${cny.toFixed(2)} (≈$${usd.toFixed(3)})`;
}

export function generateExplanations(
  model: ModelSnapshot,
  scores: DimensionScores,
  input: RecommendationInput,
  rankAmongTop: number, // 0-indexed rank among top 4
  secondScore: number,  // total score of #2 (for gap commentary)
): { explanations: string[]; tradeoffs: string[] } {
  const exps: string[] = [];
  const tradeoffs: string[] = [];

  // --- Quality explanations ---
  if (model.aa_intelligence_index != null) {
    exps.push(
      `综合智力指数 ${fmt(model.aa_intelligence_index)} — 在同场景候选集中` +
      (scores.quality >= 75 ? '处于顶尖水平' : scores.quality >= 50 ? '表现中等偏上' : '具有一定基础能力') + '。'
    );
  }
  if (input.scenario === 'code' && model.aa_coding_index != null) {
    exps.push(`代码专项指数 ${fmt(model.aa_coding_index)}，尤其适合${input.sub_scenario === 'generation' ? '代码生成' : input.sub_scenario === 'debugging' ? 'Bug 调试' : '代码相关任务'}。`);
  }
  if ((input.scenario === 'rag' || input.sub_scenario === 'long_context' || input.sub_scenario === 'long_doc') && model.aa_lcr != null) {
    exps.push(`长上下文召回率 ${fmt(model.aa_lcr * 100, 1)}%，适合处理大量文档内容。`);
  }
  if ((input.scenario === 'agent') && model.aa_tau2 != null) {
    exps.push(`工具调用能力评分 ${fmt(model.aa_tau2 * 100, 1)}%，在 Agent 工作流中表现${model.aa_tau2 > 0.5 ? '优秀' : '尚可'}。`);
  }
  if (input.scenario === 'math' && model.aa_hle != null) {
    exps.push(`硬逻辑评估得分 ${fmt(model.aa_hle * 100, 1)}%，适合${input.sub_scenario === 'aime' ? 'AIME竞赛级' : '高难度数学'}推理任务。`);
  }

  // --- Speed explanation ---
  if (model.aa_ttft_seconds != null && model.aa_tps != null) {
    exps.push(
      `首字延迟 ${fmt(model.aa_ttft_seconds, 3)}s，吞吐速度 ${fmt(model.aa_tps, 1)} token/s — ` +
      (scores.latency >= 70 ? '响应速度较快' : scores.latency >= 40 ? '速度中等' : '延迟偏高') + '。'
    );
  } else if (model.aa_ttft_seconds != null) {
    exps.push(`首字延迟 ${fmt(model.aa_ttft_seconds, 3)}s。`);
  }

  // --- Cost explanation ---
  if (model.aa_price_blended_usd != null) {
    exps.push(
      `综合单价约 ${fmtPrice(model.aa_price_blended_usd)} / 百万 Token — ` +
      (scores.cost >= 75 ? '在候选集中具有显著价格优势' : scores.cost >= 50 ? '价格适中' : '价格偏高，需结合质量综合考量') + '。'
    );
  }

  // --- Region explanation ---
  if (input.region === 'cn' && model.is_cn_provider) {
    exps.push(`由国内厂商 ${model.aa_model_creator_name ?? '提供'}，支持中国大陆直接接入，无需代理。`);
  }

  // --- Tradeoffs ---
  if (scores.cost < 40 && scores.quality > 70) {
    tradeoffs.push('注意：此模型质量较高但价格偏贵，建议评估实际 token 用量后再选用。');
  } else if (scores.cost > 70 && scores.quality < 50) {
    tradeoffs.push('注意：此模型价格较低但综合能力一般，适合低复杂度高频率任务。');
  } else if (scores.latency < 40) {
    tradeoffs.push('注意：该模型首字延迟较高，不适合对实时性要求严格的交互场景。');
  } else if (rankAmongTop === 0 && secondScore > 0 && scores.total - secondScore < 5) {
    tradeoffs.push('提示：第二名模型综合得分接近，建议结合实际业务需求进一步比较。');
  } else {
    tradeoffs.push('建议在生产环境中进行小批量 A/B 测试，以验证模型在实际数据分布下的表现。');
  }

  // Ensure at least 3 explanations
  if (exps.length < 3) {
    exps.push(`在 ${input.scenario} 场景的 ${input.sub_scenario} 子类下，综合得分 ${scores.total} / 100。`);
  }

  return { explanations: exps.slice(0, 6), tradeoffs: tradeoffs.slice(0, 2) };
}

// ---------------------------------------------------------------------------
// Main export: recommend()
// ---------------------------------------------------------------------------

export function recommend(
  models: ModelSnapshot[],
  input: RecommendationInput,
): RecommendationResult[] {
  const candidates = filterCandidates(models, input);
  if (candidates.length === 0) return [];

  const scores = computeScores(candidates, input);

  // Sort by total score descending
  const indexed = candidates.map((m, i) => ({ m, s: scores[i] }));
  indexed.sort((a, b) => b.s.total - a.s.total);

  const top4 = indexed.slice(0, 4);
  const secondTotal = top4[1]?.s.total ?? 0;

  return top4.map(({ m, s }, i) => {
    const { explanations, tradeoffs } = generateExplanations(m, s, input, i, secondTotal);
    const confidence: 'high' | 'medium' | 'low' =
      m.match_confidence === 'high' ? 'high'
      : m.match_confidence === 'medium' ? 'medium'
      : 'low';

    return {
      rank: i + 1,
      model: m,
      scores: s,
      explanations,
      tradeoffs,
      confidence,
    };
  });
}
