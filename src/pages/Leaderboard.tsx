import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight, Loader2, MessageSquarePlus, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ModelSnapshot } from '../types';

const USD_TO_CNY = 7.25;
const PAGE_SIZE = 20;

function isZeroOrInvalid(n: number | null | undefined): boolean {
  if (n == null || Number.isNaN(n)) return true;
  return Math.abs(n) < 1e-12;
}

function fmtCny(usd: number | null | undefined): string {
  if (isZeroOrInvalid(usd)) return 'N/A';
  return `¥${(usd * USD_TO_CNY).toFixed(1)}`;
}

function fmtNum(n: number | null | undefined, decimals = 1): string {
  if (isZeroOrInvalid(n)) return 'N/A';
  return n.toFixed(decimals);
}

function fmtPct(n: number | null | undefined): string {
  if (isZeroOrInvalid(n)) return 'N/A';
  return (n * 100).toFixed(1);
}

function fmtTtft(s: number | null | undefined): string {
  if (isZeroOrInvalid(s) || (s ?? 0) < 0) return 'N/A';
  return `${s.toFixed(2)} s`;
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
  global: '全球LLM模型',
  cn: '中国直连LLM模型',
  text_to_image: '文生图模型',
  text_to_video: '文生视频模型',
  image_editing: '图像编辑模型',
  image_to_video: '图生视频模型',
  text_to_speech: '语音合成 / TTS模型',
};

const LLM_SORT_DEFAULT = { field: 'aa_release_date', order: 'desc' as const };
const MEDIA_SORT_DEFAULT = { field: 'aa_elo', order: 'desc' as const };

type LlmFieldDef = {
  key: keyof ModelSnapshot | 'aa_release_date' | 'aa_price_input_usd' | 'aa_price_output_usd';
  label: string;
  subLabel?: string;
  lowerBetter: boolean;
  format: 'num' | 'pct' | 'cny' | 'ttft' | 'text';
};

const MEDIA_ADV_FIELDS: Record<TabKey, Array<{ key: keyof ModelSnapshot; label: string; subLabel?: string }>> = {
  global: [],
  cn: [],
  text_to_image: [
    { key: 'category_style_anime_elo', label: 'Anime', subLabel: '动漫风评分' },
    { key: 'category_style_cartoon_illustration_elo', label: 'Cartoon/Illustration', subLabel: '卡通/插画评分' },
    { key: 'category_style_general_photorealistic_elo', label: 'General & Photorealistic', subLabel: '通用 & 写实评分' },
    { key: 'category_style_graphic_design_digital_rendering_elo', label: 'Graphic Design', subLabel: '平面设计评分' },
    { key: 'category_style_traditional_art_elo', label: 'Traditional Art', subLabel: '传统艺术评分' },
    { key: 'category_subject_commercial_elo', label: 'Commercial', subLabel: '商业视觉评分' },
  ],
  image_editing: [],
  text_to_speech: [],
  text_to_video: [
    { key: 'category_format_short_prompt_elo', label: 'Short Prompt', subLabel: '短提示词评分' },
    { key: 'category_format_long_prompt_elo', label: 'Long Prompt', subLabel: '长提示词评分' },
    { key: 'category_format_moving_camera_elo', label: 'Moving Camera', subLabel: '运镜评分' },
    { key: 'category_format_multi_scene_elo', label: 'Multi-Scene', subLabel: '多场景评分' },
    { key: 'category_style_photorealistic_elo', label: 'Photorealistic', subLabel: '写实/照片级真实评分' },
    { key: 'category_style_cartoon_and_anime_elo', label: 'Cartoon & Anime', subLabel: '卡通/动漫评分' },
    { key: 'category_style_3d_animation_elo', label: '3D Animation', subLabel: '3D 动画/CG 风评分' },
  ],
  image_to_video: [
    { key: 'category_format_short_prompt_elo', label: 'Short Prompt', subLabel: '短提示词评分' },
    { key: 'category_format_long_prompt_elo', label: 'Long Prompt', subLabel: '长提示词评分' },
    { key: 'category_format_moving_camera_elo', label: 'Moving Camera', subLabel: '运镜评分' },
    { key: 'category_format_multi_scene_elo', label: 'Multi-Scene', subLabel: '多场景评分' },
    { key: 'category_style_photorealistic_elo', label: 'Photorealistic', subLabel: '写实/照片级真实评分' },
    { key: 'category_style_cartoon_and_anime_elo', label: 'Cartoon & Anime', subLabel: '卡通/动漫评分' },
    { key: 'category_style_3d_animation_elo', label: '3D Animation', subLabel: '3D 动画/CG 风评分' },
  ],
};

function isLlmTab(tab: TabKey): boolean {
  return tab === 'global' || tab === 'cn';
}

const TAB_ORDER: TabKey[] = [
  'global',
  'cn',
  'text_to_image',
  'text_to_video',
  'image_editing',
  'image_to_video',
  'text_to_speech',
];

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
  const showMediaReleaseDate = tab !== 'text_to_speech';

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
      query = query
        .eq('aa_modality', 'llm')
        .or('reasoning_type.is.null,reasoning_type.neq.Non Reasoning');
    } else if (tab === 'cn') {
      query = query
        .eq('aa_modality', 'llm')
        .eq('is_cn_provider', true)
        .or('reasoning_type.is.null,reasoning_type.neq.Non Reasoning');
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

  const llmHeaders = useMemo<LlmFieldDef[]>(
    () => [
      { key: 'aa_release_date', label: '发布日期', lowerBetter: false, format: 'text' },
      { key: 'aa_price_input_usd', label: '输入价 (¥/1M)', lowerBetter: true, format: 'cny' },
      { key: 'aa_price_output_usd', label: '输出价 (¥/1M)', lowerBetter: true, format: 'cny' },
      { key: 'aa_intelligence_index', label: 'Intelligence Index', subLabel: '综合智力', lowerBetter: false, format: 'num' },
      { key: 'aa_coding_index', label: 'Coding Index', subLabel: '代码', lowerBetter: false, format: 'num' },
      { key: 'aa_gpqa', label: 'GQPA Diamond Benchmark', subLabel: '研究生科学', lowerBetter: false, format: 'pct' },
      { key: 'aa_hle', label: "Humanity's Last Exam Benchmark", subLabel: '硬逻辑', lowerBetter: false, format: 'pct' },
      { key: 'aa_ifbench', label: 'IFBench Benchmark', subLabel: '指令遵循', lowerBetter: false, format: 'pct' },
      { key: 'aa_lcr', label: 'LiveCodeBench Benchmark', subLabel: '长文召回', lowerBetter: false, format: 'pct' },
      { key: 'aa_scicode', label: 'SciCode Benchmark', subLabel: '科学计算', lowerBetter: false, format: 'pct' },
      { key: 'aa_terminalbench_hard', label: 'Terminal-Bench Hard Benchmark', subLabel: '命令行', lowerBetter: false, format: 'pct' },
      { key: 'aa_tau2', label: 'tau2 Bench Telecom Benchmark', subLabel: '工具调用', lowerBetter: false, format: 'num' },
      { key: 'aa_ttft_seconds', label: '首字延迟', lowerBetter: true, format: 'ttft' },
      { key: 'aa_tps', label: '吞吐 (tps)', lowerBetter: false, format: 'num' },
    ],
    []
  );

  const llmColSpan = 4 + llmHeaders.length;
  const mediaColSpan = 8 + mediaAdvFields.length + (showMediaReleaseDate ? 1 : 0);

  const renderLlmValue = (model: ModelSnapshot, field: LlmFieldDef): string => {
    const raw = model[field.key as keyof ModelSnapshot] as number | string | null | undefined;
    if (field.format === 'text') return (raw as string | null | undefined) ?? '—';
    if (field.format === 'cny') return fmtCny(raw as number | null | undefined);
    if (field.format === 'ttft') return fmtTtft(raw as number | null | undefined);
    if (field.format === 'pct') return fmtPct(raw as number | null | undefined);
    return fmtNum(raw as number | null | undefined);
  };

  const displayCreatorName = (model: ModelSnapshot): string => {
    if (model.is_cn_provider) {
      return (model.aa_model_creator_name_cn ?? model.aa_model_creator_name ?? '—') as string;
    }
    return (model.aa_model_creator_name ?? '—') as string;
  };

  const currentReviewModality: string = isLlm ? 'llm' : tab;

  const providerLink = (model: ModelSnapshot): string | null => {
    if (!model.aa_model_creator_name) return null;
    return `/provider/${encodeURIComponent(model.aa_model_creator_name)}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-10 gap-4 flex-wrap">
        <div className="flex p-1.5 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-wrap">
          {TAB_ORDER.map((k) => (
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
            to={`/review/new?modality=${encodeURIComponent(currentReviewModality)}`}
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
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <div className="flex items-center justify-center gap-1">
                          {h.label}
                          {sortField === h.key ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                        </div>
                        {h.subLabel ? <span className="text-[9px] font-normal text-slate-400 normal-case">{h.subLabel}</span> : null}
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
                  {showMediaReleaseDate ? (
                    <th className="px-6 py-4 text-center cursor-pointer hover:text-primary" onClick={() => handleSort('aa_release_date')}>
                      <div className="flex items-center justify-center gap-1">发布日期{sortField === 'aa_release_date' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}</div>
                    </th>
                  ) : null}
                  <th className="px-6 py-4 text-center cursor-pointer hover:text-primary" onClick={() => handleSort('aa_elo')}>
                    <div className="flex flex-col items-center justify-center gap-0.5">
                      <div className="flex items-center justify-center gap-1">
                        ELO{sortField === 'aa_elo' ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                      </div>
                      <span className="text-[9px] font-normal text-slate-400 normal-case">综合 ELO评分</span>
                    </div>
                  </th>
                  {mediaAdvFields.map((f) => (
                    <th key={String(f.key)} className="px-6 py-4 text-center cursor-pointer hover:text-primary" onClick={() => handleSort(String(f.key))}>
                      <div className="flex flex-col items-center justify-center gap-0.5">
                        <div className="flex items-center justify-center gap-1">
                          {f.label}{sortField === f.key ? (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />) : <ArrowUpDown className="w-3 h-3 opacity-40" />}
                        </div>
                        {f.subLabel ? <span className="text-[9px] font-normal text-slate-400 normal-case">{f.subLabel}</span> : null}
                      </div>
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
                  const link = providerLink(m);
                  return (
                    <tr key={`${m.aa_modality || 'llm'}:${m.aa_slug}`} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-6 py-5 text-sm font-black text-slate-400">{rank}</td>
                      <td className="px-6 py-5">
                        <Link to={`/model/${m.aa_slug}`} className="font-black text-sm text-slate-900 group-hover:text-primary transition-colors">
                          {m.aa_name?.replace(/\s*\(.*?\)\s*/g, '')}
                        </Link>
                      </td>
                      <td className="px-6 py-5 text-sm font-bold text-slate-600">
                        {link ? (
                          <Link to={link} className="hover:text-primary hover:underline transition-colors">
                            {displayCreatorName(m)}
                          </Link>
                        ) : (
                          displayCreatorName(m)
                        )}
                      </td>

                      {isLlm ? (
                        <>
                          {llmHeaders.map((h) => (
                            <td key={`${m.aa_slug}:${String(h.key)}`} className="px-6 py-5 text-center text-sm font-black text-slate-600">
                              {renderLlmValue(m, h)}
                            </td>
                          ))}
                        </>
                      ) : (
                        <>
                          {showMediaReleaseDate ? (
                            <td className="px-6 py-5 text-center text-sm font-bold text-slate-500">{m.aa_release_date ?? '—'}</td>
                          ) : null}
                          <td className="px-6 py-5 text-center text-sm font-black text-indigo-600">{fmtNum(m.aa_elo, 0)}</td>
                          {mediaAdvFields.map((f) => (
                            <td key={`${m.aa_slug}:${String(f.key)}`} className="px-6 py-5 text-center text-sm font-black text-slate-600">
                              {fmtNum(m[f.key] as number | null | undefined, 0)}
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
