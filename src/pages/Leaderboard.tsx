import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, MessageSquarePlus, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ModelSnapshot } from '../types';

const USD_TO_CNY = 7.25;
const PAGE_SIZE = 20;

function fmtCny(usd: number | null | undefined): string {
  if (usd == null) return '—';
  return `¥${(usd * USD_TO_CNY).toFixed(1)}`;
}

function fmtNum(n: number | null | undefined, decimals = 1): string {
  if (n == null) return '—';
  return n.toFixed(decimals);
}

function fmtTtft(s: number | null | undefined): string {
  if (s == null) return '—';
  return `${(s * 1000).toFixed(0)} ms`;
}

type TabKey =
  | 'global'
  | 'cn'
  | 'text_to_image'
  | 'image_editing'
  | 'text_to_speech'
  | 'text_to_video'
  | 'image_to_video';

const TAB_LABEL: Record<TabKey, string> = {
  global: '全球模型',
  cn: '中国大陆直连',
  text_to_image: 'Text to Image',
  image_editing: 'Image Editing',
  text_to_speech: 'Text to Speech',
  text_to_video: 'Text to Video',
  image_to_video: 'Image to Video',
};

const LLM_SORT_DEFAULT = { field: 'aa_release_date', order: 'desc' as const };
const MEDIA_SORT_DEFAULT = { field: 'aa_elo', order: 'desc' as const };

const MEDIA_ADV_FIELDS: Record<TabKey, Array<{ key: keyof ModelSnapshot; label: string }>> = {
  global: [],
  cn: [],
  text_to_image: [
    { key: 'category_style_anime_elo', label: 'Anime' },
    { key: 'category_style_cartoon_illustration_elo', label: 'Cartoon/Illustration' },
    { key: 'category_style_general_photorealistic_elo', label: 'General & Photorealistic' },
    { key: 'category_style_graphic_design_digital_rendering_elo', label: 'Graphic Design' },
    { key: 'category_style_traditional_art_elo', label: 'Traditional Art' },
    { key: 'category_subject_commercial_elo', label: 'Commercial' },
  ],
  image_editing: [],
  text_to_speech: [],
  text_to_video: [
    { key: 'category_format_short_prompt_elo', label: 'Short Prompt' },
    { key: 'category_format_long_prompt_elo', label: 'Long Prompt' },
    { key: 'category_format_moving_camera_elo', label: 'Moving Camera' },
    { key: 'category_format_multi_scene_elo', label: 'Multi-Scene' },
    { key: 'category_style_photorealistic_elo', label: 'Photorealistic' },
    { key: 'category_style_cartoon_and_anime_elo', label: 'Cartoon & Anime' },
    { key: 'category_style_3d_animation_elo', label: '3D Animation' },
  ],
  image_to_video: [
    { key: 'category_format_short_prompt_elo', label: 'Short Prompt' },
    { key: 'category_format_long_prompt_elo', label: 'Long Prompt' },
    { key: 'category_format_moving_camera_elo', label: 'Moving Camera' },
    { key: 'category_format_multi_scene_elo', label: 'Multi-Scene' },
    { key: 'category_style_photorealistic_elo', label: 'Photorealistic' },
    { key: 'category_style_cartoon_and_anime_elo', label: 'Cartoon & Anime' },
    { key: 'category_style_3d_animation_elo', label: '3D Animation' },
  ],
};

function isLlmTab(tab: TabKey): boolean {
  return tab === 'global' || tab === 'cn';
}

export const Leaderboard = () => {
  const [models, setModels] = useState<ModelSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<TabKey>('global');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState(LLM_SORT_DEFAULT.field);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(LLM_SORT_DEFAULT.order);

  const isLlm = isLlmTab(tab);
  const mediaAdvFields = MEDIA_ADV_FIELDS[tab];

  const setTabAndDefaultSort = (nextTab: TabKey) => {
    setTab(nextTab);
    if (isLlmTab(nextTab)) {
      setSortField(LLM_SORT_DEFAULT.field);
      setSortOrder(LLM_SORT_DEFAULT.order);
    } else {
      setSortField(MEDIA_SORT_DEFAULT.field);
      setSortOrder(MEDIA_SORT_DEFAULT.order);
    }
  };

  const fetchModels = async (currentPage: number, isNewFilter = false) => {
    setLoading(true);
    if (isNewFilter) {
      setError('');
      setPage(1);
    }

    const targetPage = isNewFilter ? 1 : currentPage;
    const from = (targetPage - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;

    let query = supabase
      .from('model_snapshots')
      .select('*', { count: 'exact' })
      .eq('has_aa', true)
      .order(sortField, { ascending: sortOrder === 'asc', nullsFirst: false });

    if (tab === 'global') {
      query = query.eq('aa_modality', 'llm');
    } else if (tab === 'cn') {
      query = query.eq('aa_modality', 'llm').eq('is_cn_provider', true);
    } else {
      query = query.eq('aa_modality', tab);
    }

    if (search.trim()) {
      query = query.ilike('aa_name', `%${search.trim()}%`);
    }

    const { data, count, error: err } = await query.range(from, to);

    if (err) {
      setError('数据加载失败，请刷新重试。');
      setLoading(false);
      return;
    }

    setModels((data ?? []) as ModelSnapshot[]);
    setTotalCount(count ?? 0);
    if (isNewFilter) setPage(1);
    else setPage(targetPage);
    setLoading(false);
  };

  useEffect(() => {
    fetchModels(1, true);
  }, [tab, search, sortField, sortOrder]);

  const loadPage = (p: number) => fetchModels(p, false);

  const handleSort = (field: string, lowerBetter = false) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder(lowerBetter ? 'asc' : 'desc');
    }
  };

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));

  const llmColSpan = 11;
  const mediaColSpan = 9 + mediaAdvFields.length;

  const llmHeaders = useMemo(
    () => [
      { key: 'aa_release_date', label: '发布日期', lowerBetter: false },
      { key: 'aa_price_input_usd', label: '输入价 (¥/1M)', lowerBetter: true },
      { key: 'aa_price_output_usd', label: '输出价 (¥/1M)', lowerBetter: true },
      { key: 'aa_intelligence_index', label: 'Intelligence', lowerBetter: false },
      { key: 'aa_coding_index', label: 'Coding', lowerBetter: false },
      { key: 'aa_ttft_seconds', label: '首字延迟', lowerBetter: true },
      { key: 'aa_tps', label: '吞吐 (tps)', lowerBetter: false },
    ],
    []
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-10 gap-4 flex-wrap">
        <div className="flex p-1.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-wrap">
          {(Object.keys(TAB_LABEL) as TabKey[]).map((k) => (
            <button
              key={k}
              onClick={() => setTabAndDefaultSort(k)}
              className={`px-5 py-2.5 text-sm font-black transition-colors rounded-xl ${
                tab === k
                  ? 'bg-slate-100 dark:bg-slate-700 text-primary shadow-sm'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              {TAB_LABEL[k]}
            </button>
          ))}
        </div>
        <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
          当前视图: <span className="text-primary">{TAB_LABEL[tab]}</span>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none mb-10 overflow-hidden">
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
          <Link
            to="/community"
            className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white border border-primary rounded-xl text-xs font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-primary/20"
          >
            <MessageSquarePlus className="w-4 h-4" /> 发表点评
          </Link>
        </div>

        {error && <div className="mx-8 mb-4 text-rose-500 text-sm font-medium">{error}</div>}

        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              {isLlm ? (
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/30 border-y border-slate-100">
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">模型名称</th>
                  <th className="px-6 py-4">厂商</th>
                  {llmHeaders.map((h) => (
                    <th key={h.key} className="px-6 py-4 text-center cursor-pointer hover:text-primary" onClick={() => handleSort(h.key, h.lowerBetter)}>
                      <div className="flex items-center justify-center gap-1">
                        {h.label}
                        {sortField === h.key ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                      </div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center">操作</th>
                </tr>
              ) : (
                <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/30 border-y border-slate-100">
                  <th className="px-6 py-4">#</th>
                  <th className="px-6 py-4">模型名称</th>
                  <th className="px-6 py-4">厂商</th>
                  <th className="px-6 py-4 text-center cursor-pointer hover:text-primary" onClick={() => handleSort('aa_release_date')}>
                    <div className="flex items-center justify-center gap-1">发布日期{sortField === 'aa_release_date' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}</div>
                  </th>
                  <th className="px-6 py-4 text-center cursor-pointer hover:text-primary" onClick={() => handleSort('aa_elo')}>
                    <div className="flex items-center justify-center gap-1">ELO{sortField === 'aa_elo' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}</div>
                  </th>
                  {mediaAdvFields.map((f) => (
                    <th key={String(f.key)} className="px-6 py-4 text-center cursor-pointer hover:text-primary" onClick={() => handleSort(String(f.key))}>
                      <div className="flex items-center justify-center gap-1">{f.label}{sortField === f.key ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}</div>
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center">操作</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan={isLlm ? llmColSpan : mediaColSpan} className="text-center py-16">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : models.length === 0 ? (
                <tr>
                  <td colSpan={isLlm ? llmColSpan : mediaColSpan} className="text-center py-16 text-slate-400 font-bold">
                    暂无符合条件的模型
                  </td>
                </tr>
              ) : (
                models.map((m, i) => {
                  const rank = (page - 1) * PAGE_SIZE + i + 1;
                  return (
                    <tr key={`${m.aa_modality || 'llm'}:${m.aa_slug}`} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 text-sm font-black text-slate-400">{rank}</td>
                      <td className="px-6 py-5">
                        <Link to={`/model/${m.aa_slug}`} className="font-black text-sm text-slate-900 group-hover:text-primary transition-colors">
                          {m.aa_name?.replace(/\s*\(.*?\)\s*/g, '')}
                        </Link>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-600">{m.aa_model_creator_name ?? '—'}</td>

                      {isLlm ? (
                        <>
                          <td className="px-6 py-5 text-center text-sm font-bold text-slate-500">{m.aa_release_date ?? '—'}</td>
                          <td className="px-6 py-5 text-center text-sm font-black text-emerald-600">{fmtCny(m.aa_price_input_usd)}</td>
                          <td className="px-6 py-5 text-center text-sm font-black text-emerald-600">{fmtCny(m.aa_price_output_usd)}</td>
                          <td className="px-6 py-5 text-center text-sm font-black text-indigo-600">{fmtNum(m.aa_intelligence_index)}</td>
                          <td className="px-6 py-5 text-center text-sm font-black text-slate-600">{fmtNum(m.aa_coding_index)}</td>
                          <td className="px-6 py-5 text-center text-sm font-black text-slate-600">{fmtTtft(m.aa_ttft_seconds)}</td>
                          <td className="px-6 py-5 text-center text-sm font-black text-primary">{fmtNum(m.aa_tps)}</td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-5 text-center text-sm font-bold text-slate-500">{m.aa_release_date ?? '—'}</td>
                          <td className="px-6 py-5 text-center text-sm font-black text-indigo-600">{fmtNum(m.aa_elo)}</td>
                          {mediaAdvFields.map((f) => (
                            <td key={`${m.aa_slug}:${String(f.key)}`} className="px-6 py-5 text-center text-sm font-black text-slate-600">
                              {fmtNum(m[f.key] as number | null | undefined)}
                            </td>
                          ))}
                        </>
                      )}

                      <td className="px-6 py-5 text-center">
                        <Link to={`/model/${m.aa_slug}`} className="text-primary text-sm font-black hover:underline">
                          详情
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="px-8 py-6 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            显示第 {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} 个（共 {totalCount} 个）
          </p>
          <div className="flex items-center gap-2">
            <button onClick={() => loadPage(page - 1)} disabled={page === 1 || loading} className="p-2.5 rounded-xl text-slate-300 disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 6) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => loadPage(p)}
                className={`w-10 h-10 rounded-xl font-black text-sm transition-all ${
                  p === page ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'hover:bg-white text-slate-500'
                }`}
              >
                {p}
              </button>
            ))}
            <button onClick={() => loadPage(page + 1)} disabled={page === totalPages || loading} className="p-2.5 rounded-xl text-slate-400 disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
