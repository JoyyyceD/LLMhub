import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import {
  TrendingUp,
  Download,
  List,
  Check,
  RefreshCcw,
  Search,
  Info,
  Zap,
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

  // Build radar data from real metrics
  const radarData = [
    { subject: '综合智力', key: 'aa_intelligence_index', max: 100 },
    { subject: '代码能力', key: 'aa_coding_index', max: 100 },
    { subject: '逻辑推理', key: 'aa_hle', max: 1, scale: 100 },
    { subject: '指令遵循', key: 'aa_ifbench', max: 1, scale: 100 },
    { subject: '吞吐速度', key: 'aa_tps', max: 200 },
    { subject: '长上下文', key: 'aa_lcr', max: 1, scale: 100 },
  ].map((item) => {
    const point: Record<string, number | string> = { subject: item.subject };
    selectedModels.forEach((model) => {
      const raw = model[item.key as keyof ModelSnapshot] as number | null;
      // Clean model name for display in chart
      const modelName = model.aa_name.replace(/\s*\(.*?\)\s*/g, '');
      if (raw == null) {
        point[modelName] = 0;
      } else {
        const scale = (item as { scale?: number }).scale ?? 1;
        const max = item.max;
        point[modelName] = Math.min(100, ((raw * scale) / max) * 100);
      }
    });
    return point;
  });

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
                <p className="text-sm text-slate-500">基于真实测评数据的能力雷达分布图（最多对比 4 个）</p>
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
                {selectedModels.length > 0 ? selectedModels[0].aa_name.replace(/\s*\(.*?\)\s*/g, '') : 'N/A'}
                <span className="block text-lg font-medium opacity-70 mt-1">在当前选择中综合指数最高</span>
              </h3>
              {selectedModels[0] && (
                <div className="mt-8 space-y-4">
                  <div className="p-4 bg-white/10 rounded-xl backdrop-blur-sm border border-white/10">
                    <div className="flex items-center gap-2 mb-1">
                      <Info className="w-4 h-4 text-sky-300" />
                      <span className="text-xs font-bold uppercase tracking-wider">核心数据</span>
                    </div>
                    <p className="text-sm opacity-90 leading-relaxed">
                      智力指数 {selectedModels[0].aa_intelligence_index?.toFixed(1) ?? 'N/A'} ·{' '}
                      代码 {selectedModels[0].aa_coding_index?.toFixed(1) ?? 'N/A'} ·{' '}
                      混合价格 {fmtCny(selectedModels[0].aa_price_blended_usd)}/1M
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
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm">
              <Download className="w-4 h-4" />
              导出对比数据
            </button>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 min-w-[200px]">模型名称</th>
                  <th className="px-6 py-4">厂商</th>
                  <th className="px-6 py-4 text-center">智力指数</th>
                  <th className="px-6 py-4 text-center">代码指数</th>
                  <th className="px-6 py-4 text-center">TTFT</th>
                  <th className="px-6 py-4 text-center">吞吐量</th>
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
                    <td className="px-6 py-5 text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                        {model.aa_intelligence_index?.toFixed(1) ?? '—'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center text-sm font-bold text-slate-700 dark:text-slate-300">
                      {model.aa_coding_index?.toFixed(1) ?? '—'}
                    </td>
                    <td className="px-6 py-5 text-center text-sm font-bold text-primary">
                      {model.aa_ttft_seconds != null ? `${model.aa_ttft_seconds.toFixed(2)}s` : '—'}
                    </td>
                    <td className="px-6 py-5 text-center text-sm font-bold text-slate-700 dark:text-slate-300">
                      {model.aa_tps?.toFixed(1) ?? '—'} t/s
                    </td>
                    <td className="px-6 py-5 text-right font-mono text-sm font-bold text-emerald-600">
                      {fmtCny(model.aa_price_blended_usd)}
                    </td>
                  </tr>
                ))}
                {selectedModels.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 text-sm italic">
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
