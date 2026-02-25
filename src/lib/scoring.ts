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
  SCENARIO_LABELS,
  type QualityMetric,
} from './qualityConfig';

// Standardization config
const RECENT_WINDOW_DAYS = 180;
const MIN_SAMPLE_SIZE = 30;
const QUALITY_K = 15;
const COST_K = 10;
const LATENCY_K = 10;
const THROUGHPUT_K = 12;

const MULTIMODAL_SUB_TO_MODALITY: Record<string, string> = {
  mm_text_to_image: 'text_to_image',
  mm_text_to_video: 'text_to_video',
  mm_image_editing: 'image_editing',
  mm_image_to_video: 'image_to_video',
  mm_text_to_speech: 'text_to_speech',
};

// ---------------------------------------------------------------------------
// Step 1: Filter candidates
// ---------------------------------------------------------------------------

export function filterCandidates(
  models: ModelSnapshot[],
  input: RecommendationInput,
): ModelSnapshot[] {
  return models.filter((m) => {
    if (!m.has_aa) return false;

    if (input.scenario === 'multimodal') {
      const modality = getSelectedMultimodalModality(input);
      const modelModality = (m.aa_modality ?? 'llm').toString();
      if (modality && modelModality !== modality) return false;
      if (input.region === 'cn' && !m.is_cn_provider) return false;
      if (m.aa_elo == null || Number.isNaN(m.aa_elo) || m.aa_elo <= 0) return false;
      return true;
    }

    // Hard requirements: key fields must be present and > 0.
    const price = costRaw(m);
    if (price == null || Number.isNaN(price) || price <= 0) return false;
    if (m.aa_intelligence_index == null || Number.isNaN(m.aa_intelligence_index) || m.aa_intelligence_index <= 0) return false;
    if (m.aa_coding_index == null || Number.isNaN(m.aa_coding_index) || m.aa_coding_index <= 0) return false;

    // Non-multimodal scenarios: only LLM + Reasoning/unknown.
    if (input.scenario !== 'multimodal') {
      if ((m.aa_modality ?? 'llm') !== 'llm') return false;
      const rt = (m.reasoning_type ?? 'unknown').toString().trim().toLowerCase();
      if (rt === 'non reasoning' || rt === 'non-reasoning') return false;
    }

    if (input.region === 'cn' && !m.is_cn_provider) return false;

    const af = input.advanced_filters;
    if (af) {
      const modalities = parseInputModalitiesOrNull(m.or_architecture_input_modalities);
      // Field missing => pass. Field present but not containing required modality => filter out.
      if (af.require_image && modalities && !modalities.has('image')) return false;
      if (af.require_pdf && modalities && !modalities.has('file')) return false;

      if (af.min_context_tokens != null) {
        const ctx = m.or_context_length ?? m.aa_context_length;
        // Field missing => pass. Field present and lower than threshold => filter out.
        if (ctx != null && Number.isFinite(ctx) && ctx < af.min_context_tokens) return false;
      }
    }

    return true;
  });
}

function getSelectedMultimodalModality(input: RecommendationInput): string | null {
  const selected = input.sub_scenarios?.[0] ?? input.sub_scenario;
  if (!selected) return null;
  return MULTIMODAL_SUB_TO_MODALITY[selected] ?? null;
}

function parseInputModalitiesOrNull(raw: ModelSnapshot['or_architecture_input_modalities']): Set<string> | null {
  if (raw == null) return null;
  if (Array.isArray(raw)) {
    return new Set(raw.map((v) => String(v).toLowerCase()));
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.map((v) => String(v).toLowerCase()));
      }
      return null;
    } catch {
      return null;
    }
  }
  return null;
}

function filterBaseCandidates(models: ModelSnapshot[]): ModelSnapshot[] {
  return models.filter((m) => {
    const price = costRaw(m);
    return (
      m.has_aa &&
      price != null &&
      !Number.isNaN(price) &&
      price > 0 &&
      m.aa_intelligence_index != null &&
      !Number.isNaN(m.aa_intelligence_index) &&
      m.aa_intelligence_index > 0 &&
      m.aa_coding_index != null &&
      !Number.isNaN(m.aa_coding_index) &&
      m.aa_coding_index > 0
    );
  });
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

function reasoningPriority(reasoningType: ModelSnapshot['reasoning_type']): number {
  const rt = (reasoningType ?? 'unknown').toString().trim().toLowerCase();
  if (rt === 'reasoning') return 2;
  if (rt === 'unknown' || rt === '') return 1;
  return 0;
}

function reasoningFamilyKey(m: ModelSnapshot): string {
  const creator = (m.aa_model_creator_name ?? '').toLowerCase().trim();
  const baseName = (m.aa_name ?? '')
    .toLowerCase()
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return `${creator}::${baseName}`;
}

function dedupeReasoningPreferred(models: ModelSnapshot[]): ModelSnapshot[] {
  const grouped = new Map<string, ModelSnapshot>();
  for (const m of models) {
    if ((m.aa_modality ?? 'llm') !== 'llm') {
      grouped.set(`nonllm::${m.aa_slug}`, m);
      continue;
    }
    const key = reasoningFamilyKey(m);
    const prev = grouped.get(key);
    if (!prev) {
      grouped.set(key, m);
      continue;
    }
    const pCur = reasoningPriority(m.reasoning_type);
    const pPrev = reasoningPriority(prev.reasoning_type);
    if (pCur > pPrev) {
      grouped.set(key, m);
      continue;
    }
    if (pCur < pPrev) continue;

    const curIntel = m.aa_intelligence_index ?? -1;
    const prevIntel = prev.aa_intelligence_index ?? -1;
    if (curIntel > prevIntel) {
      grouped.set(key, m);
      continue;
    }
    if (curIntel < prevIntel) continue;

    const curDate = m.aa_release_date ? new Date(m.aa_release_date).getTime() : 0;
    const prevDate = prev.aa_release_date ? new Date(prev.aa_release_date).getTime() : 0;
    if (curDate >= prevDate) grouped.set(key, m);
  }
  return Array.from(grouped.values());
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

export interface RobustStats {
  med: number;
  mad: number;
}

export function buildRobustStats(vals: number[]): RobustStats | null {
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

export function robustScore(
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

export function costForScoring(m: ModelSnapshot): number | null {
  const raw = costRaw(m);
  if (raw == null || Number.isNaN(raw) || raw <= 0) return null;
  // Compress long-tail price differences so ultra-cheap models don't dominate.
  return Math.log1p(raw);
}

export function metricValueForScoring(
  model: ModelSnapshot,
  key: keyof ModelSnapshot,
  opts?: { treatZeroAsMissing?: boolean },
): number | null {
  if (key === 'aa_price_blended_usd') {
    return costForScoring(model);
  }
  const raw = model[key] as unknown as number | null | undefined;
  if (raw == null || Number.isNaN(raw)) return null;
  if (opts?.treatZeroAsMissing ?? false) {
    if (raw === 0) return null;
  }
  return raw;
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
    .map((m) => costForScoring(m))
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

  const normalizedWeights = (() => {
    const sum =
      effectiveWeights.quality +
      effectiveWeights.cost +
      effectiveWeights.latency +
      effectiveWeights.throughput;
    if (sum <= 0) return { quality: 1, cost: 0, latency: 0, throughput: 0 };
    return {
      quality: effectiveWeights.quality / sum,
      cost: effectiveWeights.cost / sum,
      latency: effectiveWeights.latency / sum,
      throughput: effectiveWeights.throughput / sum,
    };
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

    const cost = robustScore(costForScoring(m), costStats, COST_K, true) ?? 50;
    const latencyBase = robustScore(latencyRaw(m), latencyStats, LATENCY_K, true) ?? 50;
    const throughputBase = robustScore(throughputRaw(m), throughputStats, THROUGHPUT_K, false) ?? 50;

    const latency = clamp(latencyBase, 0, 100);
    const throughput = clamp(throughputBase, 0, 100);

    const total =
      quality * normalizedWeights.quality +
      cost * normalizedWeights.cost +
      latency * normalizedWeights.latency +
      throughput * normalizedWeights.throughput;

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

export function generateExplanations(
  model: ModelSnapshot,
  scores: DimensionScores,
  input: RecommendationInput,
  rankAmongTop: number,
  secondScore: number,
): { explanations: string[]; tradeoffs: string[] } {
  const selectedSubs = getSelectedSubScenarios(input);
  const scenarioLabel = SCENARIO_LABELS[input.scenario] ?? input.scenario;
  const scenarioWeights = getScenarioWeights(input);

  const metricLabel: Record<QualityMetric, string> = {
    aa_intelligence_index: '综合智力',
    aa_coding_index: '代码能力',
    aa_gpqa: '科学问答',
    aa_hle: '硬逻辑',
    aa_ifbench: '指令遵循',
    aa_lcr: '长上下文',
    aa_scicode: '科学编程',
    aa_terminalbench_hard: '终端任务',
    aa_tau2: '工具调用',
  };
  const primaryMetric = (Object.entries(scenarioWeights) as [QualityMetric, number][])
    .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'aa_intelligence_index';
  const primaryRaw = model[primaryMetric];
  const isPctMetric = ['aa_gpqa', 'aa_hle', 'aa_ifbench', 'aa_lcr', 'aa_scicode', 'aa_terminalbench_hard', 'aa_tau2'].includes(primaryMetric);
  const primaryVal = primaryRaw == null
    ? 'N/A'
    : (isPctMetric
      ? `${(Number(primaryRaw) * 100).toFixed(1)}`
      : Number(primaryRaw).toFixed(1));
  const metricMeaning: Record<QualityMetric, string> = {
    aa_intelligence_index: '综合智力',
    aa_coding_index: '代码任务',
    aa_gpqa: '科学问答',
    aa_hle: '硬逻辑推理',
    aa_ifbench: '指令遵循',
    aa_lcr: '长上下文',
    aa_scicode: '科学编程',
    aa_terminalbench_hard: '终端任务执行',
    aa_tau2: '工具调用',
  };
  const metricTestName: Record<QualityMetric, string> = {
    aa_intelligence_index: 'Intelligence Index',
    aa_coding_index: 'Coding Index',
    aa_gpqa: 'GPQA Diamond Benchmark',
    aa_hle: "Humanity's Last Exam Benchmark",
    aa_ifbench: 'IFBench Benchmark',
    aa_lcr: 'LiveCodeBench Benchmark',
    aa_scicode: 'SciCode Benchmark',
    aa_terminalbench_hard: 'Terminal-Bench Hard Benchmark',
    aa_tau2: 'tau2 Bench Telecom Benchmark',
  };

  const recommendVerb = rankAmongTop <= 1 ? '优先试用' : '试用';
  const conclusion = `${scenarioLabel}场景综合评分为${scores.total}，推荐${recommendVerb}。`;
  const evidence1 = primaryMetric === 'aa_intelligence_index' || primaryMetric === 'aa_coding_index'
    ? `该模型${metricTestName[primaryMetric]}得分为${primaryVal}，${metricMeaning[primaryMetric]}较强。`
    : `该模型在代表${metricMeaning[primaryMetric]}的${metricTestName[primaryMetric]}测试中得到了${primaryVal}分，${metricMeaning[primaryMetric]}较强。`;

  const weakness = [
    { key: 'quality', label: '场景质量', score: scores.quality },
    { key: 'cost', label: '成本控制', score: scores.cost },
    { key: 'latency', label: '响应速度', score: scores.latency },
    { key: 'throughput', label: '吞吐能力', score: scores.throughput },
  ].sort((a, b) => a.score - b.score)[0];
  let reminder = `该模型当前最大短板是${weakness.label}，建议按业务重点做针对性验证。`;
  if (weakness.key === 'cost') {
    reminder = '该模型当前最大短板是成本控制，建议先评估单次请求成本与月度预算。';
  } else if (weakness.key === 'latency') {
    reminder = '该模型当前最大短板是响应速度，建议用于非强实时交互场景。';
  } else if (weakness.key === 'throughput') {
    reminder = '该模型当前最大短板是吞吐能力，建议先压测并发上限。';
  } else if (weakness.key === 'quality') {
    reminder = '该模型当前最大短板是场景质量，建议先用核心样本集做效果验收。';
  }
  if (rankAmongTop === 0 && secondScore > 0 && scores.total - secondScore < 3) {
    reminder = '与次优模型分差较小，建议结合成本与延迟进一步比较。';
  }
  if (input.region === 'cn' && model.is_cn_provider) {
    reminder = `${reminder} 支持中国直连。`;
  }
  if (selectedSubs.length > 1) {
    reminder = `${reminder} 已聚合${selectedSubs.length}个细分任务。`;
  }

  return { explanations: [conclusion, evidence1], tradeoffs: [reminder] };
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
  if (input.scenario === 'multimodal') {
    const candidates = filterCandidates(models, input)
      .sort((a, b) => (b.aa_elo ?? 0) - (a.aa_elo ?? 0))
      .slice(0, 6);
    return candidates.map((m, i) => ({
      rank: i + 1,
      model: m,
      scores: {
        quality: Math.round(m.aa_elo ?? 0),
        cost: 0,
        latency: 0,
        throughput: 0,
        total: Math.round(m.aa_elo ?? 0),
      },
      explanations: [`该模型综合ELO评分为${fmt(m.aa_elo, 1)}，在同类模型中排名靠前。`],
      tradeoffs: ['多模态评测字段不完整，建议结合你的样本做实测验证。'],
      confidence: 'high',
    }));
  }

  const candidates = dedupeReasoningPreferred(filterCandidates(models, input));
  if (candidates.length === 0) return [];

  const referencePool = pickReferencePool(candidates, candidates);
  const scores = computeScores(candidates, referencePool, input);

  const indexed = candidates.map((m, i) => ({ m, s: scores[i] }));
  indexed.sort((a, b) => b.s.total - a.s.total);
  const uniqueByCreator: typeof indexed = [];
  const seenCreator = new Set<string>();
  for (const item of indexed) {
    const creatorKey = (item.m.aa_model_creator_name ?? item.m.aa_model_creator_id ?? item.m.aa_slug)
      .toString()
      .trim()
      .toLowerCase();
    if (seenCreator.has(creatorKey)) continue;
    seenCreator.add(creatorKey);
    uniqueByCreator.push(item);
    if (uniqueByCreator.length >= 6) break;
  }

  const topN = uniqueByCreator;
  const secondTotal = topN[1]?.s.total ?? 0;

  return topN.map(({ m, s }, i) => {
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
