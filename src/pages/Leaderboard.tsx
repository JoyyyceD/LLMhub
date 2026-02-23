import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Info,
  Zap,
  ShieldCheck,
  LayoutGrid,
  Filter,
  ArrowUpRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ModelSnapshot } from '../types';

const USD_TO_CNY = 7.25;
const PAGE_SIZE = 20;

function fmtCny(usd: number | null | undefined): string {
  if (usd == null) return '—';
  return `¥${(usd * USD_TO_CNY).toFixed(2)}`;
}

function fmtNum(n: number | null | undefined, decimals = 1): string {
  if (n == null) return '—';
  return n.toFixed(decimals);
}

function fmtTtft(s: number | null | undefined): string {
  if (s == null) return '—';
  return `${(s * 1000).toFixed(0)} ms`;
}

type TabKey = 'global' | 'cn';

export const Leaderboard = () => {
  const [models, setModels] = useState<ModelSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<TabKey>('cn');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      setPage(1);

      let query = supabase
        .from('model_snapshots')
        .select('*', { count: 'exact' })
        .eq('has_aa', true)
        .eq('has_or', true)
        .order('aa_intelligence_index', { ascending: false, nullsFirst: false });

      if (tab === 'cn') query = query.eq('is_cn_provider', true);

      if (search.trim()) {
        query = query.ilike('aa_name', `%${search.trim()}%`);
      }

      const { data, count, error: err } = await query.range(0, PAGE_SIZE - 1);

      if (err) {
        setError('数据加载失败，请刷新重试。');
        setLoading(false);
        return;
      }

      setModels((data ?? []) as ModelSnapshot[]);
      setTotalCount(count ?? 0);
      setLoading(false);
    };
    fetch();
  }, [tab, search]);

  const loadPage = async (targetPage: number) => {
    setLoading(true);
    const from = (targetPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('model_snapshots')
      .select('*', { count: 'exact' })
      .eq('has_aa', true)
      .eq('has_or', true)
      .order('aa_intelligence_index', { ascending: false, nullsFirst: false });

    if (tab === 'cn') query = query.eq('is_cn_provider', true);
    if (search.trim()) query = query.ilike('aa_name', `%${search.trim()}%`);

    const { data, count } = await query.range(from, to);
    setModels((data ?? []) as ModelSnapshot[]);
    setTotalCount(count ?? 0);
    setPage(targetPage);
    setLoading(false);
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const topModel = models[0];
  const topScore = topModel?.aa_intelligence_index;

  const STATS = [
    {
      label: '收录模型',
      value: loading ? '...' : String(totalCount),
      change: tab === 'cn' ? '国内优化' : '全球视图',
      icon: LayoutGrid,
    },
    {
      label: '最高智力指数',
      value: loading ? '...' : topScore != null ? topScore.toFixed(1) : '—',
      icon: Zap,
    },
    {
      label: '数据更新',
      value: topModel?.record_date ?? '—',
      icon: Zap,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Tabs */}
      <div className="flex items-center justify-between mb-10">
        <div className="flex p-1.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <button
            onClick={() => setTab('global')}
            className={`px-8 py-2.5 text-sm font-black transition-colors rounded-xl ${
              tab === 'global'
                ? 'bg-slate-100 dark:bg-slate-700 text-primary shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            全球模型
          </button>
          <button
            onClick={() => setTab('cn')}
            className={`px-8 py-2.5 text-sm font-black transition-colors rounded-xl ${
              tab === 'cn'
                ? 'bg-slate-100 dark:bg-slate-700 text-primary shadow-sm'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            国内优化
          </button>
        </div>
        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          当前视图: <span className="text-primary">{tab === 'cn' ? '中国内地市场优化版' : '全球模型'}</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none flex items-start gap-6 group hover:scale-[1.02] transition-all"
          >
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl group-hover:bg-primary/5 transition-colors">
              <stat.icon className="w-8 h-8 text-slate-300 group-hover:text-primary transition-colors" />
            </div>
            <div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-slate-900 dark:text-white font-display tracking-tighter">
                  {stat.value}
                </span>
                {stat.change && (
                  <span className="text-xs font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">
                    {stat.change}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none mb-10 overflow-hidden">
        {/* Filter bar */}
        <div className="px-8 py-6 flex flex-wrap items-center justify-between gap-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索模型名称..."
              className="pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 ring-primary/20"
            />
          </div>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:border-primary hover:text-primary transition-all">
              <Filter className="w-4 h-4" /> 高级筛选
            </button>
            <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-black uppercase tracking-widest text-slate-500 hover:border-primary hover:text-primary transition-all">
              <Download className="w-4 h-4" /> 导出数据
            </button>
          </div>
        </div>

        {error && (
          <div className="mx-8 mb-4 flex items-center gap-2 text-rose-500 text-sm font-medium">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/30 dark:bg-slate-800/30 border-y border-slate-100 dark:border-slate-800">
                <th className="px-8 py-5">#</th>
                <th className="px-8 py-5">模型名称</th>
                <th className="px-8 py-5">厂商</th>
                <th className="px-8 py-5">发布日期</th>
                <th className="px-8 py-5 text-center">首字延迟</th>
                <th className="px-8 py-5 text-center">吞吐 (tps)</th>
                <th className="px-8 py-5 text-center">输入价 (¥/1M)</th>
                <th className="px-8 py-5 text-center">输出价 (¥/1M)</th>
                <th className="px-8 py-5 text-center">智力指数</th>
                <th className="px-8 py-5 text-center">代码指数</th>
                <th className="px-8 py-5 text-center">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={11} className="text-center py-16">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : models.length === 0 ? (
                <tr>
                  <td colSpan={11} className="text-center py-16 text-slate-400 font-bold">
                    暂无符合条件的模型
                  </td>
                </tr>
              ) : (
                models.map((m, i) => {
                  const rank = (page - 1) * PAGE_SIZE + i + 1;
                  const colorClass =
                    rank === 1 ? 'bg-amber-400' :
                    rank === 2 ? 'bg-slate-400' :
                    rank === 3 ? 'bg-orange-400' :
                    'bg-primary';
                  return (
                    <tr key={m.aa_slug} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                      <td className="px-8 py-6 text-sm font-black text-slate-400 font-display">{rank}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-[11px] font-black text-white shadow-lg ${colorClass}`}>
                            {m.aa_name.substring(0, 2)}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-sm font-black text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                              {m.aa_name}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 tracking-tight">{m.aa_slug}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-600 dark:text-slate-400">
                        {m.aa_model_creator_name ?? '—'}
                      </td>
                      <td className="px-8 py-6 text-sm font-bold text-slate-400">
                        {m.aa_release_date ?? '—'}
                      </td>
                      <td className="px-8 py-6 text-center text-sm font-black text-primary font-display">
                        {fmtTtft(m.aa_ttft_seconds)}
                      </td>
                      <td className="px-8 py-6 text-center text-sm font-black text-primary font-display">
                        {fmtNum(m.aa_tps)}
                      </td>
                      <td className="px-8 py-6 text-center text-sm font-black text-emerald-600 font-display">
                        {fmtCny(m.aa_price_input_usd)}
                      </td>
                      <td className="px-8 py-6 text-center text-sm font-black text-emerald-600 font-display">
                        {fmtCny(m.aa_price_output_usd)}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className="text-sm font-black text-indigo-600 dark:text-indigo-400 font-display">
                          {fmtNum(m.aa_intelligence_index)}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center text-sm font-black text-slate-600 dark:text-slate-300 font-display">
                        {fmtNum(m.aa_coding_index)}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <Link
                          to={`/model/${m.aa_slug}`}
                          className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/10 transition-all inline-block"
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-8 py-6 bg-slate-50/30 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            显示第 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} 个（共 {totalCount} 个）
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => loadPage(page - 1)}
              disabled={page === 1 || loading}
              className="p-2.5 rounded-xl text-slate-300 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => loadPage(p)}
                className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${
                  p === page
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'hover:bg-white dark:hover:bg-slate-700 text-slate-500'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => loadPage(page + 1)}
              disabled={page === totalPages || loading}
              className="p-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-400 transition-all disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mt-12">
        <div className="space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Info className="w-4 h-4 text-primary" /> 指标说明
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700 dark:text-slate-300">智力指数:</span> Artificial Analysis 综合评估指数。<br />
            <span className="font-bold text-slate-700 dark:text-slate-300">价格数据:</span> 单位均为人民币 (¥)，基于 1M Token 标准，汇率 ¥{(7.25).toFixed(2)}/USD。
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <Zap className="w-4 h-4 text-primary" /> 本地化优势
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            国内优化标签模型均由国内厂商（DeepSeek、Alibaba、Baidu 等）提供，支持中国大陆直接接入。
          </p>
        </div>
        <div className="space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
            <ShieldCheck className="w-4 h-4 text-primary" /> 数据来源
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            数据由 Artificial Analysis + OpenRouter 每日自动更新，存储于 Supabase，保障实时性与准确性。
          </p>
        </div>
      </div>
    </div>
  );
};
