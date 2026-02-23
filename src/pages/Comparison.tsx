import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  List,
  RefreshCcw,
  Search,
  Info,
  Loader2,
} from 'lucide-react';
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
import type { ModelSnapshot } from '../types';

const USD_TO_CNY = 7.25;

function fmtCny(usd: number | null | undefined): string {
  if (usd == null) return '—';
  return `¥${(usd * USD_TO_CNY).toFixed(1)}`;
}

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
  | 'aa_tps';

interface MetricDef {
  code: string;
  label: string;
  key: MetricKey;
  lowerBetter?: boolean;
  kDiv?: number;
}

const METRIC_DEFS: MetricDef[] = [
  { code: 'I', label: '智力能力', key: 'aa_intelligence_index' },
  { code: 'C', label: '代码能力', key: 'aa_coding_index' },
  { code: 'G', label: '科学问答能力', key: 'aa_gpqa' },
  { code: 'F', label: '指令遵循能力', key: 'aa_ifbench' },
  { code: 'L', label: '长上下文能力', key: 'aa_lcr' },
  { code: 'S', label: '科学编程能力', key: 'aa_scicode' },
  { code: 'T', label: '终端任务能力', key: 'aa_terminalbench_hard' },
  { code: 'U', label: '工具调用能力', key: 'aa_tau2' },
  { code: 'P', label: '低成本', key: 'aa_price_blended_usd', lowerBetter: true, kDiv: 1.1 },
  { code: 'D', label: '低延迟', key: 'aa_ttft_seconds', lowerBetter: true, kDiv: 1.1 },
  { code: 'R', label: '高吞吐', key: 'aa_tps', kDiv: 1.3 },
];

interface RobustStats {
  med: number;
  mad: number;
}

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
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function buildRobustStats(vals: number[]): RobustStats | null {
  if (vals.length === 0) return null;
  const sorted = [...vals].sort((a, b) => a - b);
  const p5 = quantile(sorted, 0.05);
  const p95 = quantile(sorted, 0.95);
  const winsorized = vals.map((v) => clamp(v, p5, p95));
  const med = median(winsorized);
  const mad = median(winsorized.map((v) => Math.abs(v - med)));
  return { med, mad };
}

function robustScore(
  value: number | null | undefined,
  stats: RobustStats | null,
  opts?: { lowerBetter?: boolean; kDiv?: number },
): number {
  if (value == null || Number.isNaN(value) || !stats) return 50;
  const scale = 1.4826 * stats.mad;
  if (scale === 0) return 50;
  const zRaw = (value - stats.med) / scale;
  const z = (opts?.lowerBetter ? -zRaw : zRaw) / (opts?.kDiv ?? 1.6);
  // Logistic mapping keeps 0-100 semantics without artificial soft caps.
  const score = 100 / (1 + Math.exp(-z));
  return clamp(score, 0, 100);
}

export const Comparison = () => {
  const location = useLocation();

  const [allModels, setAllModels] = useState<ModelSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load models from Supabase
  useEffect(() => {
    supabase
      .from('model_snapshots')
      .select('*')
      .eq('has_aa', true)
      .eq('has_or', true)
      .order('aa_intelligence_index', { ascending: false, nullsFirst: false })
      .then(({ data }) => {
        const models = (data ?? []) as ModelSnapshot[];
        setAllModels(models);
        setLoading(false);
        // Default selection: top 4 by intelligence index
        const defaultSlugs = models.slice(0, 4).map((m) => m.aa_slug);
        if (location.state?.selectedModelIds) {
          setSelectedSlugs(location.state.selectedModelIds.slice(0, 4));
        } else {
          setSelectedSlugs(defaultSlugs);
        }
      });
  }, [location.state]);

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
    setSelectedSlugs((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= 4) return prev;
      return [...prev, slug];
    });
  };

  const metricStats = useMemo(() => {
    const stats = new Map<MetricKey, RobustStats | null>();
    METRIC_DEFS.forEach((m) => {
      const vals = allModels
        .map((model) => model[m.key])
        .filter((v): v is number => v != null && !Number.isNaN(v));
      stats.set(m.key, buildRobustStats(vals));
    });
    return stats;
  }, [allModels]);

  const normalizedBySlug = useMemo(() => {
    const map = new Map<string, Record<MetricKey, number>>();
    allModels.forEach((model) => {
      const row = {} as Record<MetricKey, number>;
      METRIC_DEFS.forEach((m) => {
        row[m.key] = robustScore(model[m.key], metricStats.get(m.key) ?? null, {
          lowerBetter: m.lowerBetter,
          kDiv: m.kDiv,
        });
      });
      map.set(model.aa_slug, row);
    });
    return map;
  }, [allModels, metricStats]);

  const radarData = METRIC_DEFS.map((item) => {
    const point: Record<string, number | string> = { subject: item.label };
    selectedModels.forEach((model) => {
      const modelName = model.aa_name.replace(/\s*\(.*?\)\s*/g, '');
      point[modelName] = Math.round(normalizedBySlug.get(model.aa_slug)?.[item.key] ?? 50);
    });
    return point;
  });

  const selectedModelsSorted = useMemo(() => {
    return [...selectedModels].sort((a, b) => {
      const aScores = normalizedBySlug.get(a.aa_slug);
      const bScores = normalizedBySlug.get(b.aa_slug);
      const aAvg = METRIC_DEFS.reduce((sum, m) => sum + (aScores?.[m.key] ?? 50), 0) / METRIC_DEFS.length;
      const bAvg = METRIC_DEFS.reduce((sum, m) => sum + (bScores?.[m.key] ?? 50), 0) / METRIC_DEFS.length;
      return bAvg - aAvg;
    });
  }, [selectedModels, normalizedBySlug]);

  const colors = ['#137fec', '#10b981', '#8b5cf6', '#f59e0b'];

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 flex gap-8">
      {/* Sidebar */}
      <aside className="w-80 flex-shrink-0 flex flex-col gap-6 sticky top-24 h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar pr-2">
        <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">选择对比模型</h3>
            <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {selectedSlugs.length}/4
            </span>
          </div>

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
                    <span className="text-sm font-bold truncate">{model.aa_name.replace(/\s*\(.*?\)\s*/g, '')}</span>
                    <span className="text-[10px] text-slate-400 truncate">
                      {model.aa_model_creator_name ?? '—'}
                    </span>
                  </div>
                </label>
              ))}
              {filteredModels.length === 0 && (
                <div className="py-8 text-center text-slate-400 text-xs">未找到匹配的模型</div>
              )}
            </div>
          )}
        </div>

        <div className="mt-auto pt-6 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedSlugs(allModels.slice(0, 4).map((m) => m.aa_slug));
            }}
            className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-3 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2"
          >
            <RefreshCcw className="w-4 h-4" />
            重置所有选项
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col gap-6 min-w-0">
        {/* Radar + Summary */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">模型多维度对比</h2>
                <p className="text-sm text-slate-500">与性能榜单同源字段（model_snapshots），此处展示为均一化后的 0-100 分（最多对比 4 个）</p>
              </div>
              <div className="flex flex-wrap gap-4 justify-end">
                {selectedModels.map((model, idx) => (
                  <div key={model.aa_slug} className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[idx] }} />
                    <span className="text-xs font-bold">{model.aa_name.replace(/\s*\(.*?\)\s*/g, '')}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="h-[350px] w-full">
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
                      formatter={(value) => [Math.round(Number(value) || 0), '分数']}
                      labelFormatter={(label) => String(label)}
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '12px', color: '#fff' }}
                      itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
                    />
                  )}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-primary text-white rounded-2xl p-8 flex flex-col justify-between overflow-hidden relative shadow-xl shadow-primary/20">
            <div className="relative z-10">
              <div className="flex items-center gap-2 opacity-80 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">对比分析概览</span>
              </div>
              <h3 className="text-3xl font-bold leading-tight">
                {selectedModelsSorted.length > 0 ? selectedModelsSorted[0].aa_name.replace(/\s*\(.*?\)\s*/g, '') : 'N/A'}
                <span className="block text-lg font-medium opacity-70 mt-1">在当前选择中综合指数最高</span>
              </h3>
              {selectedModelsSorted[0] && (
                <div className="mt-8 space-y-4">
                  <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="w-4 h-4 text-sky-300" />
                      <span className="text-xs font-bold uppercase tracking-wider">标准化核心数据</span>
                    </div>
                    <p className="text-sm opacity-90 leading-relaxed">
                      智力能力 {Math.round(normalizedBySlug.get(selectedModelsSorted[0].aa_slug)?.aa_intelligence_index ?? 50)} ·{' '}
                      代码能力 {Math.round(normalizedBySlug.get(selectedModelsSorted[0].aa_slug)?.aa_coding_index ?? 50)} ·{' '}
                      终端任务能力 {Math.round(normalizedBySlug.get(selectedModelsSorted[0].aa_slug)?.aa_terminalbench_hard ?? 50)}
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-8 relative z-10">
              <button className="w-full bg-white text-primary py-3.5 rounded-xl text-sm font-black transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg">
                生成详细对比报告
              </button>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-400/20 rounded-full -ml-24 -mb-24 blur-2xl" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <List className="w-5 h-5 text-primary" />
              对比模型详细数据
            </h3>
          </div>
          <div className="px-6 py-3 text-xs text-slate-500 border-b border-slate-100 dark:border-slate-800">
            说明：智力能力、代码能力、科学问答能力、指令遵循能力、长上下文能力、科学编程能力、终端任务能力、工具调用能力、低成本、低延迟、高吞吐与性能榜单使用同一原始指标；本页为便于横向对比，已做均一化处理（0-100）。
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-black tracking-widest text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 min-w-[200px]">模型名称</th>
                  <th className="px-6 py-4">厂商</th>
                  {METRIC_DEFS.map((m) => (
                    <th key={m.code} className="px-4 py-4 text-center">{m.label}</th>
                  ))}
                  <th className="px-6 py-4 text-right">混合价格 (¥/1M)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {selectedModels.map((model, idx) => (
                  <tr key={model.aa_slug} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group">
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors[idx] }} />
                        <div className="flex flex-col">
                          <Link to={`/model/${model.aa_slug}`} className="font-bold text-sm group-hover:text-primary transition-colors hover:underline">
                            {model.aa_name.replace(/\s*\(.*?\)\s*/g, '')}
                          </Link>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {model.is_cn_provider ? '国内' : '海外'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-xs font-medium text-slate-600 dark:text-slate-400">
                      {model.aa_model_creator_name ?? '—'}
                    </td>
                    {METRIC_DEFS.map((m) => (
                      <td key={m.code} className="px-4 py-5 text-center text-sm font-bold text-slate-700 dark:text-slate-300">
                        {Math.round(normalizedBySlug.get(model.aa_slug)?.[m.key] ?? 50)}
                      </td>
                    ))}
                    <td className="px-6 py-5 text-right font-mono text-sm font-bold text-emerald-600">
                      {fmtCny(model.aa_price_blended_usd)}
                    </td>
                  </tr>
                ))}
                {selectedModels.length === 0 && (
                  <tr>
                    <td colSpan={METRIC_DEFS.length + 3} className="px-6 py-12 text-center text-slate-400 text-sm italic">
                      请在左侧侧边栏选择模型进行对比
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
