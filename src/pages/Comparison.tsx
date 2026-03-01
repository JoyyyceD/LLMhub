import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { TrendingUp, List, RefreshCcw, Search, Info, Loader2 } from 'lucide-react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from 'recharts';
import { supabase } from '../lib/supabase';
import { buildRobustStats, metricValueForScoring, robustScore, type RobustStats } from '../lib/scoring';
import { useAuth } from '../context/AuthContext';
import type { ModelSnapshot } from '../types';

type ComparisonModality = 'llm_global' | 'llm_cn' | 'text_to_image' | 'text_to_video' | 'image_to_video';
type MetricKey =
  | 'aa_intelligence_index'
  | 'aa_coding_index'
  | 'aa_gpqa'
  | 'aa_ifbench'
  | 'aa_lcr'
  | 'aa_scicode'
  | 'aa_terminalbench_hard'
  | 'aa_tau2'
  | 'aa_price_blended_usd'
  | 'aa_ttft_seconds'
  | 'aa_tps'
  | 'aa_elo'
  | 'category_style_anime_elo'
  | 'category_style_cartoon_illustration_elo'
  | 'category_style_general_photorealistic_elo'
  | 'category_style_graphic_design_digital_rendering_elo'
  | 'category_style_traditional_art_elo'
  | 'category_subject_commercial_elo'
  | 'category_format_short_prompt_elo'
  | 'category_format_long_prompt_elo'
  | 'category_format_moving_camera_elo'
  | 'category_format_multi_scene_elo'
  | 'category_style_photorealistic_elo'
  | 'category_style_cartoon_and_anime_elo'
  | 'category_style_3d_animation_elo';

interface MetricDef {
  code: string;
  label: string;
  key: MetricKey;
  lowerBetter?: boolean;
  k?: number;
}

const MODALITY_LABEL: Record<ComparisonModality, string> = {
  llm_global: '全球LLM',
  llm_cn: '中国直连LLM',
  text_to_image: '文生图',
  text_to_video: '文生视频',
  image_to_video: '图生视频',
};

const METRIC_DEFS_BY_MODALITY: Record<ComparisonModality, MetricDef[]> = {
  llm_global: [
    { code: 'I', label: '智力能力', key: 'aa_intelligence_index' },
    { code: 'C', label: '代码能力', key: 'aa_coding_index' },
    { code: 'G', label: '科学问答能力', key: 'aa_gpqa' },
    { code: 'F', label: '指令遵循能力', key: 'aa_ifbench' },
    { code: 'L', label: '长上下文能力', key: 'aa_lcr' },
    { code: 'S', label: '科学编程能力', key: 'aa_scicode' },
    { code: 'T', label: '终端任务能力', key: 'aa_terminalbench_hard' },
    { code: 'U', label: '工具调用能力', key: 'aa_tau2' },
    { code: 'P', label: '价格得分', key: 'aa_price_blended_usd', lowerBetter: true, k: 10 },
    { code: 'D', label: '低延迟', key: 'aa_ttft_seconds', lowerBetter: true, k: 10 },
    { code: 'R', label: '高吞吐', key: 'aa_tps', k: 12 },
  ],
  llm_cn: [
    { code: 'I', label: '智力能力', key: 'aa_intelligence_index' },
    { code: 'C', label: '代码能力', key: 'aa_coding_index' },
    { code: 'G', label: '科学问答能力', key: 'aa_gpqa' },
    { code: 'F', label: '指令遵循能力', key: 'aa_ifbench' },
    { code: 'L', label: '长上下文能力', key: 'aa_lcr' },
    { code: 'S', label: '科学编程能力', key: 'aa_scicode' },
    { code: 'T', label: '终端任务能力', key: 'aa_terminalbench_hard' },
    { code: 'U', label: '工具调用能力', key: 'aa_tau2' },
    { code: 'P', label: '价格得分', key: 'aa_price_blended_usd', lowerBetter: true, k: 10 },
    { code: 'D', label: '低延迟', key: 'aa_ttft_seconds', lowerBetter: true, k: 10 },
    { code: 'R', label: '高吞吐', key: 'aa_tps', k: 12 },
  ],
  text_to_image: [
    { code: 'E', label: '综合 ELO', key: 'aa_elo' },
    { code: 'A', label: 'Anime', key: 'category_style_anime_elo' },
    { code: 'C', label: 'Cartoon/Illustration', key: 'category_style_cartoon_illustration_elo' },
    { code: 'P', label: 'General & Photorealistic', key: 'category_style_general_photorealistic_elo' },
    { code: 'G', label: 'Graphic Design', key: 'category_style_graphic_design_digital_rendering_elo' },
    { code: 'T', label: 'Traditional Art', key: 'category_style_traditional_art_elo' },
    { code: 'M', label: 'Commercial', key: 'category_subject_commercial_elo' },
  ],
  text_to_video: [
    { code: 'E', label: '综合 ELO', key: 'aa_elo' },
    { code: 'S', label: 'Short Prompt', key: 'category_format_short_prompt_elo' },
    { code: 'L', label: 'Long Prompt', key: 'category_format_long_prompt_elo' },
    { code: 'M', label: 'Moving Camera', key: 'category_format_moving_camera_elo' },
    { code: 'U', label: 'Multi-Scene', key: 'category_format_multi_scene_elo' },
    { code: 'P', label: 'Photorealistic', key: 'category_style_photorealistic_elo' },
    { code: 'C', label: 'Cartoon & Anime', key: 'category_style_cartoon_and_anime_elo' },
    { code: '3', label: '3D Animation', key: 'category_style_3d_animation_elo' },
  ],
  image_to_video: [
    { code: 'E', label: '综合 ELO', key: 'aa_elo' },
    { code: 'S', label: 'Short Prompt', key: 'category_format_short_prompt_elo' },
    { code: 'L', label: 'Long Prompt', key: 'category_format_long_prompt_elo' },
    { code: 'M', label: 'Moving Camera', key: 'category_format_moving_camera_elo' },
    { code: 'U', label: 'Multi-Scene', key: 'category_format_multi_scene_elo' },
    { code: 'P', label: 'Photorealistic', key: 'category_style_photorealistic_elo' },
    { code: 'C', label: 'Cartoon & Anime', key: 'category_style_cartoon_and_anime_elo' },
    { code: '3', label: '3D Animation', key: 'category_style_3d_animation_elo' },
  ],
};

export const Comparison = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [allModels, setAllModels] = useState<ModelSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [modality, setModality] = useState<ComparisonModality>('llm_global');
  const [compareGateError, setCompareGateError] = useState('');

  const metricDefs = METRIC_DEFS_BY_MODALITY[modality];
  const showRawTailCol = modality !== 'llm_global' && modality !== 'llm_cn';

  const pickDefaultSlugs = (models: ModelSnapshot[], currentModality: ComparisonModality): string[] => {
    const sortByRecent = (arr: ModelSnapshot[]) => [...arr].sort((a, b) => {
      const ta = a.aa_release_date ? new Date(a.aa_release_date).getTime() : 0;
      const tb = b.aa_release_date ? new Date(b.aa_release_date).getTime() : 0;
      if (tb !== ta) return tb - ta;
      return (b.aa_intelligence_index ?? 0) - (a.aa_intelligence_index ?? 0);
    });

    const pickUnique = (arr: ModelSnapshot[], out: string[], seen: Set<string>) => {
      for (const m of arr) {
        const creator = (m.aa_model_creator_name ?? '').trim().toLowerCase() || m.aa_slug;
        if (seen.has(creator)) continue;
        seen.add(creator);
        out.push(m.aa_slug);
        if (out.length >= 4) break;
      }
    };

    const prioritized = (currentModality === 'llm_global' || currentModality === 'llm_cn')
      ? sortByRecent(models.filter((m) => (m.aa_intelligence_index ?? 0) > 40))
      : sortByRecent(models);
    const fallback = sortByRecent(models);

    const seen = new Set<string>();
    const out: string[] = [];
    pickUnique(prioritized, out, seen);
    if (out.length < 4) {
      pickUnique(fallback, out, seen);
    }
    if (out.length === 0) {
      for (const m of fallback.slice(0, 4)) out.push(m.aa_slug);
    }
    return out;
  };

  useEffect(() => {
    setLoading(true);
    let query = supabase
      .from('model_snapshots')
      .select('*')
      .eq('has_aa', true)
      .eq('aa_modality', modality === 'llm_global' || modality === 'llm_cn' ? 'llm' : modality)
      .order('aa_release_date', { ascending: false, nullsFirst: false });

    if (modality === 'llm_global' || modality === 'llm_cn') {
      query = query.or('reasoning_type.is.null,reasoning_type.neq.Non Reasoning');
      if (modality === 'llm_cn') {
        query = query.eq('is_cn_provider', true);
      }
    }

    query.then(({ data }) => {
      const models = (data ?? []) as ModelSnapshot[];
      setAllModels(models);
      setLoading(false);

      const defaultSlugs = pickDefaultSlugs(models, modality);
      if ((modality === 'llm_global' || modality === 'llm_cn') && location.state?.selectedModelIds) {
        const allowed = new Set(models.map((m) => m.aa_slug));
        const selected = (location.state.selectedModelIds as string[]).filter((s) => allowed.has(s)).slice(0, 4);
        setSelectedSlugs(selected.length > 0 ? selected : defaultSlugs);
      } else {
        setSelectedSlugs(defaultSlugs);
      }
    });
  }, [modality, location.state]);

  const selectedModels = useMemo(
    () => allModels.filter((m) => selectedSlugs.includes(m.aa_slug)),
    [allModels, selectedSlugs]
  );

  const filteredModels = useMemo(() => {
    if (!searchQuery.trim()) return allModels;
    const q = searchQuery.toLowerCase();
    return allModels.filter(
      (m) =>
        m.aa_name.toLowerCase().includes(q) ||
        (m.aa_model_creator_name ?? '').toLowerCase().includes(q)
    );
  }, [allModels, searchQuery]);

  const toggleModel = (slug: string) => {
    if (!user) {
      setCompareGateError('更换对比模型需要登录后使用。');
      navigate('/login');
      return;
    }
    setCompareGateError('');
    setSelectedSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 4) return prev;
      return [...prev, slug];
    });
  };

  const metricStats = useMemo(() => {
    const stats = new Map<MetricKey, RobustStats | null>();
    metricDefs.forEach((m) => {
      const vals = allModels
        .map((model) => metricValueForScoring(model, m.key, { treatZeroAsMissing: true }))
        .filter((v): v is number => v != null);
      stats.set(m.key, buildRobustStats(vals));
    });
    return stats;
  }, [allModels, metricDefs]);

  const normalizedBySlug = useMemo(() => {
    const map = new Map<string, Partial<Record<MetricKey, number>>>();
    allModels.forEach((model) => {
      const row: Partial<Record<MetricKey, number>> = {};
      metricDefs.forEach((m) => {
        const transformed = metricValueForScoring(model, m.key, { treatZeroAsMissing: true });
        if (transformed == null) {
          return;
        }
        const score = robustScore(transformed, metricStats.get(m.key) ?? null, m.k ?? 15, !!m.lowerBetter);
        if (score == null) return;
        row[m.key] = score;
      });
      map.set(model.aa_slug, row);
    });
    return map;
  }, [allModels, metricDefs, metricStats]);

  const visibleMetricDefs = useMemo(() => {
    return metricDefs.filter((m) =>
      selectedModels.some((model) => normalizedBySlug.get(model.aa_slug)?.[m.key] != null)
    );
  }, [metricDefs, selectedModels, normalizedBySlug]);

  const radarMetricDefs = useMemo(() => {
    if (modality !== 'llm_global' && modality !== 'llm_cn') return visibleMetricDefs;
    return visibleMetricDefs.filter(
      (m) => m.key !== 'aa_ttft_seconds' && m.key !== 'aa_tps' && m.key !== 'aa_price_blended_usd'
    );
  }, [modality, visibleMetricDefs]);

  const radarData = radarMetricDefs.map((item) => {
    const point: Record<string, number | string | null> = { subject: item.label };
    selectedModels.forEach((model) => {
      const modelName = model.aa_name.replace(/\s*\(.*?\)\s*/g, '');
      const score = normalizedBySlug.get(model.aa_slug)?.[item.key];
      point[modelName] = score == null ? null : Math.round(score);
    });
    return point;
  });

  const selectedModelsSorted = useMemo(() => {
    return [...selectedModels].sort((a, b) => {
      const aScores = normalizedBySlug.get(a.aa_slug);
      const bScores = normalizedBySlug.get(b.aa_slug);
      const anchorKeys: MetricKey[] =
        modality === 'llm_global' || modality === 'llm_cn'
          ? ['aa_intelligence_index', 'aa_coding_index', 'aa_gpqa']
          : radarMetricDefs.map((m) => m.key);
      const aVals = anchorKeys
        .map((k) => aScores?.[k])
        .filter((v): v is number => v != null);
      const bVals = anchorKeys
        .map((k) => bScores?.[k])
        .filter((v): v is number => v != null);
      const aAvg = aVals.length ? aVals.reduce((s, v) => s + v, 0) / aVals.length : 0;
      const bAvg = bVals.length ? bVals.reduce((s, v) => s + v, 0) / bVals.length : 0;
      return bAvg - aAvg;
    });
  }, [selectedModels, normalizedBySlug, radarMetricDefs, modality]);

  const colors = ['#137fec', '#10b981', '#8b5cf6', '#f59e0b'];
  const displayCreatorName = (model: ModelSnapshot): string => {
    if (model.is_cn_provider) {
      return (model.aa_model_creator_name_cn ?? model.aa_model_creator_name ?? '—') as string;
    }
    return (model.aa_model_creator_name ?? '—') as string;
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col xl:flex-row gap-6 xl:gap-8">
      <aside className="w-full xl:w-80 flex-shrink-0 flex flex-col gap-6 xl:sticky xl:top-24 xl:h-[calc(100vh-120px)] xl:overflow-y-auto custom-scrollbar xl:pr-2">
        <div className="border-t border-slate-200 pt-6">
          <h3 className="text-xs font-semibold tracking-wide text-slate-500 mb-3">模型种类</h3>
          <div className="grid grid-cols-2 gap-2 mb-5">
            {(Object.keys(MODALITY_LABEL) as ComparisonModality[]).map((m) => (
              <button
                key={m}
                onClick={() => {
                  setModality(m);
                  setSearchQuery('');
                }}
                className={`px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
                  modality === m
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {MODALITY_LABEL[m]}
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-semibold tracking-wide text-slate-500">选择对比模型</h3>
            <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded-full">{selectedSlugs.length}/4</span>
          </div>
          {compareGateError && (
            <p className="text-[11px] text-amber-600 font-semibold mb-3">{compareGateError}</p>
          )}

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="搜索模型或厂商..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : (
            <div className="space-y-1 max-h-[500px] overflow-y-auto custom-scrollbar pr-1">
              {filteredModels.map((model) => (
                <label
                  key={model.aa_slug}
                  className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all ${
                    selectedSlugs.includes(model.aa_slug)
                      ? 'bg-primary/5 border-primary/20 border'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedSlugs.includes(model.aa_slug)}
                    onChange={() => toggleModel(model.aa_slug)}
                    disabled={!selectedSlugs.includes(model.aa_slug) && selectedSlugs.length >= 4}
                    className="rounded border-slate-300 text-primary focus:ring-primary disabled:opacity-30"
                  />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold truncate">{model.aa_name.replace(/\s*\(.*?\)\s*/g, '')}</span>
                    <span className="text-[10px] text-slate-400 truncate">{displayCreatorName(model)}</span>
                  </div>
                </label>
              ))}
              {filteredModels.length === 0 && <div className="py-8 text-center text-slate-400 text-xs">未找到匹配的模型</div>}
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-200">
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSlugs(allModels.slice(0, 4).map((m) => m.aa_slug));
            }}
            className="w-full bg-slate-100 text-slate-600 py-3 rounded-lg text-sm font-semibold hover:bg-slate-200 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            重置所有选项
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col gap-6 min-w-0">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold">模型多维度对比</h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  当前种类：{MODALITY_LABEL[modality]}。按同类指标做鲁棒归一化（0-100），最多对比 4 个模型。
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-4 sm:justify-end">
                {selectedModels.map((model, idx) => (
                  <div key={model.aa_slug} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx] }} />
                    <span className="text-[11px] sm:text-xs font-semibold">{model.aa_name.replace(/\s*\(.*?\)\s*/g, '')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-[300px] sm:h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  {selectedModels.map((model, idx) => (
                    <Radar
                      key={model.aa_slug}
                      name={model.aa_name.replace(/\s*\(.*?\)\s*/g, '')}
                      dataKey={model.aa_name.replace(/\s*\(.*?\)\s*/g, '')}
                      stroke={colors[idx]}
                      fill={colors[idx]}
                      fillOpacity={0.2}
                      strokeWidth={3}
                    />
                  ))}
                  {selectedModels.length > 0 && (
                    <RechartsTooltip
                      formatter={(value, name) => {
                        if (value == null || Number.isNaN(Number(value))) return ['N/A', String(name)];
                        return [Math.round(Number(value)), String(name)];
                      }}
                      labelFormatter={(label) => String(label)}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                  )}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-8 flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
              <div className="flex items-center gap-2 opacity-80 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium text-slate-300">对比分析概览</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold leading-tight">
                {selectedModelsSorted.length > 0 ? selectedModelsSorted[0].aa_name.replace(/\s*\(.*?\)\s*/g, '') : 'N/A'}
                <span className="block text-lg font-medium opacity-70 mt-1">在当前选择中综合指数最高</span>
              </h3>
              {selectedModelsSorted[0] && (
                <div className="mt-8 space-y-4">
                  <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="w-4 h-4 text-slate-300" />
                      <span className="text-xs font-semibold tracking-wide">标准化核心数据</span>
                    </div>
                    <p className="text-sm opacity-90 leading-relaxed">
                      {visibleMetricDefs.slice(0, 3).map((m, i) => (
                        <span key={m.code}>
                          {m.label}{' '}
                          {(() => {
                            const v = normalizedBySlug.get(selectedModelsSorted[0].aa_slug)?.[m.key];
                            return v == null ? 'N/A' : Math.round(v);
                          })()}
                          {i < 2 ? ' · ' : ''}
                        </span>
                      ))}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 relative z-10">
              <button className="w-full bg-white text-slate-900 py-3.5 rounded-xl text-sm font-semibold transition-colors hover:bg-slate-100">
                生成详细对比报告
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-slate-200/10 rounded-full -ml-24 -mb-24 blur-2xl" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <h3 className="font-semibold flex items-center gap-2 text-slate-800">
              <List className="w-5 h-5 text-primary" />
              对比模型详细数据
            </h3>
          </div>
          <div className="px-4 sm:px-6 py-3 text-xs text-slate-500 border-b border-slate-100">
            说明：当前按{MODALITY_LABEL[modality]}指标做均一化（0-100），用于同类模型横向对比。
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[780px]">
              <thead>
                <tr className="text-[11px] font-semibold tracking-wide text-slate-500 bg-slate-50">
                  <th className="px-6 py-4 min-w-[220px]">模型名称</th>
                  <th className="px-6 py-4">厂商</th>
                  {visibleMetricDefs.map((m) => (
                    <th key={m.code} className="px-4 py-4 text-center">{m.label}</th>
                  ))}
                  {showRawTailCol ? (
                    <th className="px-6 py-4 text-right">原始 ELO</th>
                  ) : null}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedModels.map((model, idx) => (
                  <tr key={model.aa_slug} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[idx] }} />
                        <div className="flex flex-col">
                          <Link to={`/model/${model.aa_slug}`} className="font-semibold text-sm group-hover:text-primary transition-colors hover:underline">
                            {model.aa_name.replace(/\s*\(.*?\)\s*/g, '')}
                          </Link>
                          <span className="text-[10px] font-semibold text-slate-400 tracking-wide">
                            {(model.aa_modality ?? 'llm').replaceAll('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-medium text-slate-600">
                      {model.aa_model_creator_name ? (
                        <Link to={`/provider/${encodeURIComponent(model.aa_model_creator_name)}`} className="hover:text-primary hover:underline transition-colors">
                          {displayCreatorName(model)}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    {visibleMetricDefs.map((m) => (
                      <td key={m.code} className="px-4 py-5 text-center text-sm font-semibold text-slate-700">
                        {(() => {
                          const v = normalizedBySlug.get(model.aa_slug)?.[m.key];
                          return v == null ? 'N/A' : Math.round(v);
                        })()}
                      </td>
                    ))}
                    {showRawTailCol ? (
                      <td className="px-6 py-5 text-right font-mono text-sm font-bold text-emerald-600">
                        {model.aa_elo == null ? '—' : model.aa_elo.toFixed(1)}
                      </td>
                    ) : null}
                  </tr>
                ))}
                {selectedModels.length === 0 && (
                  <tr>
                    <td colSpan={visibleMetricDefs.length + (showRawTailCol ? 3 : 2)} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                      请先选择模型种类，然后在左侧选择模型进行对比
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
