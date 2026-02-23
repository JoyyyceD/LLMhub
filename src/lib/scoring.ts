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
  type QualityMetric,
} from './qualityConfig';

// USD → CNY conversion rate (approx)
const USD_TO_CNY = 7.25;

// Standardization config
const RECENT_WINDOW_DAYS = 180;
const MIN_SAMPLE_SIZE = 30;
const QUALITY_K = 15;
const COST_K = 10;
const LATENCY_K = 10;
const THROUGHPUT_K = 12;

// ---------------------------------------------------------------------------
// Step 1: Filter candidates
// ---------------------------------------------------------------------------

export function filterCandidates(
  models: ModelSnapshot[],
  input: RecommendationInput,
): ModelSnapshot[] {
  return models.filter((m) => {
    if (!m.has_aa || !m.has_or) return false;
    if (m.aa_intelligence_index == null) return false;
    if (input.region === 'cn' && !m.is_cn_provider) return false;

    const af = input.advanced_filters;
    if (af) {
      const modalities = parseInputModalities(m.or_architecture_input_modalities);
      if (af.require_image && !modalities.has('image')) return false;
      if (af.require_pdf && !modalities.has('file')) return false;

      if (af.min_context_tokens != null) {
        const ctx = m.or_context_length ?? m.aa_context_length ?? 0;
        if (!(ctx > af.min_context_tokens)) return false;
      }
    }

    return true;
  });
}

function parseInputModalities(raw: ModelSnapshot['or_architecture_input_modalities']): Set<string> {
  if (!raw) return new Set();
  if (Array.isArray(raw)) {
    return new Set(raw.map((v) => String(v).toLowerCase()));
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.map((v) => String(v).toLowerCase()));
      }
    } catch {
      return new Set();
    }
  }
  return new Set();
}

function filterBaseCandidates(models: ModelSnapshot[]): ModelSnapshot[] {
  return models.filter((m) => m.has_aa && m.has_or && m.aa_intelligence_index != null);
}

function pickReferencePool(models: ModelSnapshot[], fallback: ModelSnapshot[]): ModelSnapshot[] {
  const base = filterBaseCandidates(models);
  if (base.length === 0) return fallback;

  const now = new Date();
  const cutoff = new Date(now.getTime() - RECENT_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const recent = base.filter((m) => {
    if (!m.record_date) return false;
    const d = new Date(m.record_date);
    return Number.isFinite(d.getTime()) && d >= cutoff;
  });

  if (recent.length >= MIN_SAMPLE_SIZE) return recent;
  if (base.length >= MIN_SAMPLE_SIZE) return base;
  return fallback;
}

// ---------------------------------------------------------------------------
// Step 2: Robust z-score helpers
// ---------------------------------------------------------------------------

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function quantile(sorted: number[], q: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.floor((sorted.length - 1) * q);
  return sorted[clamp(idx, 0, sorted.length - 1)];
}

function median(vals: number[]): number {
  if (vals.length === 0) return 0;
  const sorted = [...vals].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid];
  return (sorted[mid - 1] + sorted[mid]) / 2;
}

interface RobustStats {
  med: number;
  mad: number;
}

function buildRobustStats(vals: number[]): RobustStats | null {
  if (vals.length === 0) return null;
  const sorted = [...vals].sort((a, b) => a - b);
  const p5 = quantile(sorted, 0.05);
  const p95 = quantile(sorted, 0.95);
  const winsorized = vals.map((v) => clamp(v, p5, p95));
  const med = median(winsorized);
  const absDevs = winsorized.map((v) => Math.abs(v - med));
  const mad = median(absDevs);
  return { med, mad };
}

function robustScore(
  value: number | null | undefined,
  stats: RobustStats | null,
  k: number,
  lowerBetter: boolean,
): number | null {
  if (value == null || Number.isNaN(value)) return null;
  if (!stats) return 50;

  const scale = 1.4826 * stats.mad;
  if (scale === 0) return 50;

  const z = (value - stats.med) / scale;
  const directed = lowerBetter ? -z : z;
  return clamp(50 + k * directed, 0, 100);
}

// ---------------------------------------------------------------------------
// Step 3: Compute all 4 dimensions with robust standardization
// ---------------------------------------------------------------------------

function costRaw(m: ModelSnapshot): number | null {
  if (m.aa_price_blended_usd != null) return m.aa_price_blended_usd;
  if (m.aa_price_input_usd != null && m.aa_price_output_usd != null) {
    return (m.aa_price_input_usd + m.aa_price_output_usd * 3) / 4;
  }
  return null;
}

function latencyRaw(m: ModelSnapshot): number | null {
  return m.aa_ttft_seconds;
}

function throughputRaw(m: ModelSnapshot): number | null {
  return m.aa_tps;
}

export function computeScores(
  candidates: ModelSnapshot[],
  referencePool: ModelSnapshot[],
  input: RecommendationInput,
): DimensionScores[] {
  const scenarioWeights = getScenarioWeights(input);

  const baseWeights = PROFILE_WEIGHTS[input.profile];

  const qualityMetrics = Object.keys(scenarioWeights) as QualityMetric[];
  if (!qualityMetrics.includes('aa_intelligence_index')) {
    qualityMetrics.push('aa_intelligence_index');
  }

  const metricStats = new Map<QualityMetric, RobustStats | null>();
  for (const metric of qualityMetrics) {
    const vals = referencePool
      .map((m) => m[metric])
      .filter((v): v is number => v != null && !Number.isNaN(v));
    metricStats.set(metric, buildRobustStats(vals));
  }

  const costStats = buildRobustStats(referencePool
    .map((m) => costRaw(m))
    .filter((v): v is number => v != null && !Number.isNaN(v)));

  const latencyStats = buildRobustStats(referencePool
    .map((m) => latencyRaw(m))
    .filter((v): v is number => v != null && !Number.isNaN(v)));

  const throughputStats = buildRobustStats(referencePool
    .map((m) => throughputRaw(m))
    .filter((v): v is number => v != null && !Number.isNaN(v)));

  const effectiveWeights = (() => {
    if (input.speed_profile === 'low_latency') {
      const moveFromQ = baseWeights.quality * 0.2;
      const moveFromC = baseWeights.cost * 0.2;
      return {
        quality: baseWeights.quality - moveFromQ,
        cost: baseWeights.cost - moveFromC,
        latency: baseWeights.latency + moveFromQ + moveFromC,
        throughput: baseWeights.throughput,
      };
    }
    if (input.speed_profile === 'high_throughput') {
      const moveFromQ = baseWeights.quality * 0.2;
      const moveFromC = baseWeights.cost * 0.2;
      return {
        quality: baseWeights.quality - moveFromQ,
        cost: baseWeights.cost - moveFromC,
        latency: baseWeights.latency,
        throughput: baseWeights.throughput + moveFromQ + moveFromC,
      };
    }
    return baseWeights;
  })();

  return candidates.map((m) => {
    let qualityWeightedSum = 0;
    let qualityUsedWeight = 0;

    for (const [metric, weight] of Object.entries(scenarioWeights) as [QualityMetric, number][]) {
      if (weight <= 0) continue;
      const metricScore = robustScore(m[metric], metricStats.get(metric) ?? null, QUALITY_K, false);
      if (metricScore == null) continue;
      qualityWeightedSum += metricScore * weight;
      qualityUsedWeight += weight;
    }

    let quality = 50;
    if (qualityUsedWeight > 0) {
      quality = qualityWeightedSum / qualityUsedWeight;
    } else {
      quality = robustScore(
        m.aa_intelligence_index,
        metricStats.get('aa_intelligence_index') ?? null,
        QUALITY_K,
        false,
      ) ?? 50;
    }

    const cost = robustScore(costRaw(m), costStats, COST_K, true) ?? 50;
    const latencyBase = robustScore(latencyRaw(m), latencyStats, LATENCY_K, true) ?? 50;
    const throughputBase = robustScore(throughputRaw(m), throughputStats, THROUGHPUT_K, false) ?? 50;

    const latency = clamp(latencyBase, 0, 100);
    const throughput = clamp(throughputBase, 0, 100);

    const total =
      quality * effectiveWeights.quality +
      cost * effectiveWeights.cost +
      latency * effectiveWeights.latency +
      throughput * effectiveWeights.throughput;

    return {
      quality: Math.round(quality),
      cost: Math.round(cost),
      latency: Math.round(latency),
      throughput: Math.round(throughput),
      total: Math.round(total),
    };
  });
}

// ---------------------------------------------------------------------------
// Step 4: Generate rule-based explanations
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
  rankAmongTop: number,
  secondScore: number,
): { explanations: string[]; tradeoffs: string[] } {
  const exps: string[] = [];
  const tradeoffs: string[] = [];
  const selectedSubs = getSelectedSubScenarios(input);
  const primarySub = selectedSubs[0];

  if (model.aa_intelligence_index != null) {
    exps.push(
      `综合智力指数 ${fmt(model.aa_intelligence_index)} — 在同场景候选集中` +
      (scores.quality >= 75 ? '处于顶尖水平' : scores.quality >= 50 ? '表现中等偏上' : '具有一定基础能力') + '。'
    );
  }
  if (input.scenario === 'code' && model.aa_coding_index != null) {
    exps.push(`代码专项指数 ${fmt(model.aa_coding_index)}，尤其适合${primarySub === 'generation' ? '代码生成' : primarySub === 'debugging' ? 'Bug 调试' : '代码相关任务'}。`);
  }
  if ((input.scenario === 'rag' || selectedSubs.includes('long_context') || selectedSubs.includes('long_doc')) && model.aa_lcr != null) {
    exps.push(`长上下文召回率 ${fmt(model.aa_lcr * 100, 1)}%，适合处理大量文档内容。`);
  }
  if (input.scenario === 'agent' && model.aa_tau2 != null) {
    exps.push(`工具调用能力评分 ${fmt(model.aa_tau2 * 100, 1)}%，在 Agent 工作流中表现${model.aa_tau2 > 0.5 ? '优秀' : '尚可'}。`);
  }
  if (input.scenario === 'science' && model.aa_hle != null) {
    exps.push(`硬逻辑评估得分 ${fmt(model.aa_hle * 100, 1)}%，适合${primarySub === 'aime' ? 'AIME竞赛级' : '高难度科学'}推理任务。`);
  }

  if (model.aa_ttft_seconds != null && model.aa_tps != null) {
    exps.push(
      `首字延迟 ${fmt(model.aa_ttft_seconds, 3)}s，吞吐速度 ${fmt(model.aa_tps, 1)} token/s — ` +
      (scores.latency >= 70 ? '响应速度较快' : scores.latency >= 40 ? '速度中等' : '延迟偏高') + '。'
    );
  } else if (model.aa_ttft_seconds != null) {
    exps.push(`首字延迟 ${fmt(model.aa_ttft_seconds, 3)}s。`);
  }

  if (model.aa_price_blended_usd != null) {
    exps.push(
      `综合单价约 ${fmtPrice(model.aa_price_blended_usd)} / 百万 Token — ` +
      (scores.cost >= 75 ? '在候选集中具有显著价格优势' : scores.cost >= 50 ? '价格适中' : '价格偏高，需结合质量综合考量') + '。'
    );
  }

  if (input.region === 'cn' && model.is_cn_provider) {
    exps.push(`由国内厂商 ${model.aa_model_creator_name ?? '提供'}，支持中国大陆直接接入，无需代理。`);
  }

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

  if (exps.length < 3) {
    if (selectedSubs.length > 1) {
      exps.push(`在 ${input.scenario} 场景下（已聚合 ${selectedSubs.length} 个细分任务），综合得分 ${scores.total} / 100。`);
    } else {
      exps.push(`在 ${input.scenario} 场景的 ${primarySub ?? '默认'} 子类下，综合得分 ${scores.total} / 100。`);
    }
  }

  return { explanations: exps.slice(0, 6), tradeoffs: tradeoffs.slice(0, 2) };
}

function getSelectedSubScenarios(input: RecommendationInput): string[] {
  if (input.sub_scenarios && input.sub_scenarios.length > 0) return input.sub_scenarios;
  if (input.sub_scenario) return [input.sub_scenario];
  return [];
}

function getScenarioWeights(input: RecommendationInput): Record<QualityMetric, number> {
  const scenarioConfig = QUALITY_CONFIG[input.scenario] ?? {};
  const selected = getSelectedSubScenarios(input).filter((k) => scenarioConfig[k]);

  if (selected.length === 0) {
    return (scenarioConfig['general'] ?? { aa_intelligence_index: 1 }) as Record<QualityMetric, number>;
  }

  if (selected.length === 1) {
    return (scenarioConfig[selected[0]] ?? { aa_intelligence_index: 1 }) as Record<QualityMetric, number>;
  }

  const merged: Partial<Record<QualityMetric, number>> = {};
  for (const sub of selected) {
    const w = scenarioConfig[sub] ?? {};
    for (const [metric, weight] of Object.entries(w) as [QualityMetric, number][]) {
      merged[metric] = (merged[metric] ?? 0) + weight / selected.length;
    }
  }

  return merged as Record<QualityMetric, number>;
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

  const referencePool = pickReferencePool(models, candidates);
  const scores = computeScores(candidates, referencePool, input);

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
