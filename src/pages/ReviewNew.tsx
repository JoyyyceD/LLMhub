import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AlertCircle, CheckCircle2, Loader2, Search, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { ModelSnapshot } from '../types';

type ModalityKey =
  | 'llm'
  | 'text_to_image'
  | 'text_to_video'
  | 'image_editing'
  | 'image_to_video'
  | 'text_to_speech';

interface ModelSeries {
  id: string;
  slug: string;
  display_name: string;
  provider: string | null;
  is_visible: boolean;
  query_aliases?: string[] | null;
}

const PROVIDERS = [
  'OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral',
  'DeepSeek', 'Alibaba', 'Baidu', 'ByteDance', 'Zhipu',
  'Moonshot', 'MiniMax', 'Tencent', '01AI', 'SiliconFlow',
  'OpenRouter', 'Together AI', 'Other',
];

const MODALITY_OPTIONS: Array<{ key: ModalityKey; label: string; shortLabel: string }> = [
  { key: 'llm', label: 'LLM模型', shortLabel: 'LLM' },
  { key: 'text_to_image', label: '文生图模型', shortLabel: '文生图' },
  { key: 'text_to_video', label: '文生视频模型', shortLabel: '文生视频' },
  { key: 'image_editing', label: '图像编辑模型', shortLabel: '图像编辑' },
  { key: 'image_to_video', label: '图生视频模型', shortLabel: '图生视频' },
  { key: 'text_to_speech', label: '语音合成 / TTS模型', shortLabel: 'TTS' },
];

function cleanName(name: string): string {
  return name.replace(/\s*\(.*?\)\s*/g, '');
}

function toTimestamp(dateStr: string | null | undefined): number {
  if (!dateStr) return 0;
  const t = new Date(dateStr).getTime();
  return Number.isNaN(t) ? 0 : t;
}

function isModalityKey(v: string | null): v is ModalityKey {
  return !!v && MODALITY_OPTIONS.some((m) => m.key === v);
}

function normalizeForMatch(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function deriveSeriesName(rawName: string): string {
  let name = rawName;
  name = name.replace(
    /\s*\((Non-reasoning|Reasoning|Adaptive Reasoning|high|low|medium|minimal|xhigh|ChatGPT|experimental|preview|high effort|low effort)\)/gi,
    ''
  );
  name = name.replace(/\s+\d+(\.\d+)?[Bb]\s+[Aa]\d+(\.\d+)?[Bb]/g, '');
  name = name.replace(/\s+[Aa]\d+(\.\d+)?[Bb]/g, '');
  name = name.replace(/\s+\d+(\.\d+)?[Bb]/g, '');
  name = name.replace(/\s+(Instruct|Preview|Experimental|Thinking|Exp)\s*$/i, '');
  name = name.replace(/\s+\d{4}\s*$/g, '');
  name = name.replace(/\s*-\s*/g, ' ');
  return name.replace(/\s+/g, ' ').trim();
}

function buildSeriesMatchMap(seriesRows: ModelSeries[]): Map<string, string> {
  const map = new Map<string, string>();
  for (const row of seriesRows) {
    const candidates = [row.display_name, row.slug, ...(row.query_aliases ?? [])];
    for (const candidate of candidates) {
      const norm = normalizeForMatch(deriveSeriesName(candidate));
      if (norm) map.set(norm, row.id);
    }
  }
  return map;
}

function resolveModelSeriesId(
  model: ModelSnapshot,
  seriesMap: Map<string, string>
): string | null {
  if (model.series_id) return model.series_id;
  const derived = deriveSeriesName(model.aa_name ?? '');
  const norm = normalizeForMatch(derived);
  return norm ? (seriesMap.get(norm) ?? null) : null;
}

const StarSelector = ({
  value,
  onChange,
  allowClear = false,
}: {
  value: number | null;
  onChange: (v: number | null) => void;
  allowClear?: boolean;
}) => (
  <div className="flex items-center gap-2">
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onChange(i)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star
            className={`w-5 h-5 ${value != null && i <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
          />
        </button>
      ))}
    </div>
    {allowClear && value != null && (
      <button
        type="button"
        onClick={() => onChange(null)}
        className="text-[11px] font-black text-slate-400 hover:text-primary"
      >
        清除
      </button>
    )}
  </div>
);

export const ReviewNew = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [loadingModels, setLoadingModels] = useState(true);
  const [models, setModels] = useState<ModelSnapshot[]>([]);
  const [seriesOptions, setSeriesOptions] = useState<ModelSeries[]>([]);
  const [searchText, setSearchText] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    modality: 'llm' as ModalityKey,
    series_id: '',
    model_id: '',
    rating_overall: null as number | null,
    rating_quality: null as number | null,
    rating_price: null as number | null,
    rating_latency: null as number | null,
    rating_throughput: null as number | null,
    rating_stability: null as number | null,
    provider_name: '',
    pros: '',
    cons: '',
    comment: '',
  });

  useEffect(() => {
    Promise.all([
      supabase
        .from('model_snapshots')
        .select('aa_slug, aa_name, aa_modality, aa_model_creator_name, aa_release_date, has_aa, series_id')
        .eq('has_aa', true),
      supabase
        .from('model_series')
        .select('id, slug, display_name, provider, is_visible, query_aliases')
        .order('display_name'),
    ]).then(([snapResp, seriesResp]) => {
      const { data: snapData, error: snapErr } = snapResp;
      const { data: seriesData, error: seriesErr } = seriesResp;
      if (snapErr || seriesErr) {
        setError(`模型列表加载失败：${snapErr?.message ?? seriesErr?.message}`);
        setLoadingModels(false);
        return;
      }

      const all = (snapData ?? []) as ModelSnapshot[];
      const allSeries = (seriesData ?? []) as ModelSeries[];
      const matchMap = buildSeriesMatchMap(allSeries);
      const resolvedModels = all.map((m) => ({
        ...m,
        series_id: resolveModelSeriesId(m, matchMap),
      }));

      setModels(resolvedModels);
      setSeriesOptions(allSeries);

      const q = new URLSearchParams(location.search);
      const seriesFromUrl = q.get('series');
      const modelFromUrl = q.get('model');
      const modalityFromUrl = q.get('modality');
      const matchedModel = modelFromUrl ? resolvedModels.find((m) => m.aa_slug === modelFromUrl) : null;
      const initSeriesId = seriesFromUrl ?? matchedModel?.series_id ?? '';
      const matchedModality = matchedModel?.aa_modality ?? (isModalityKey(modalityFromUrl) ? modalityFromUrl : null);
      const initModality = (matchedModality ?? 'llm') as ModalityKey;

      // Pre-fill search text if series known
      if (initSeriesId) {
        const matchedSeries = allSeries.find(s => s.id === initSeriesId);
        if (matchedSeries) setSearchText(matchedSeries.display_name);
      }

      setForm((prev) => ({
        ...prev,
        modality: initModality,
        series_id: initSeriesId,
        model_id: matchedModel?.aa_slug ?? '',
      }));
      setLoadingModels(false);
    });
  }, [location.search]);

  // Map: series_id -> Set of modalities it contains
  const seriesModalityMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const m of models) {
      const modality = m.aa_modality ?? 'llm';
      const sid = m.series_id;
      if (!sid) continue;
      if (!map.has(sid)) map.set(sid, new Set());
      map.get(sid)!.add(modality);
    }
    return map;
  }, [models]);

  // When modality changes, reset series if it no longer matches
  useEffect(() => {
    if (!form.series_id) return;
    const mods = seriesModalityMap.get(form.series_id);
    if (mods && !mods.has(form.modality)) {
      setForm((prev) => ({ ...prev, series_id: '', model_id: '' }));
      setSearchText('');
    }
  }, [form.modality, seriesModalityMap]);

  // Series filtered to only those containing at least one model of the selected modality
  const filteredSeriesOptions = useMemo(() => {
    return seriesOptions.filter((s) => {
      const mods = seriesModalityMap.get(s.id);
      return mods?.has(form.modality) ?? false;
    });
  }, [seriesOptions, seriesModalityMap, form.modality]);

  const modelsInSeries = useMemo(
    () => models.filter((m) => m.series_id === form.series_id),
    [models, form.series_id]
  );

  const modelsInSeriesAndModality = useMemo(
    () => modelsInSeries.filter((m) => (m.aa_modality ?? 'llm') === form.modality),
    [modelsInSeries, form.modality]
  );

  const specificModelOptions = useMemo(() => {
    const dedup = new Map<string, ModelSnapshot>();
    for (const model of modelsInSeriesAndModality) {
      const label = cleanName(model.aa_name ?? '').trim();
      if (!label) continue;
      const prev = dedup.get(label);
      if (!prev) {
        dedup.set(label, model);
        continue;
      }
      const currTs = toTimestamp(model.aa_release_date);
      const prevTs = toTimestamp(prev.aa_release_date);
      if (currTs > prevTs) {
        dedup.set(label, model);
      }
    }
    return Array.from(dedup.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([, model]) => model);
  }, [modelsInSeriesAndModality]);

  useEffect(() => {
    if (!form.series_id || !form.model_id) return;
    if (modelsInSeries.some((m) => m.aa_slug === form.model_id)) return;
    setForm((prev) => ({ ...prev, model_id: '' }));
  }, [modelsInSeries, form.series_id, form.model_id]);

  useEffect(() => {
    if (!form.series_id) return;
    if (!form.model_id) return;
    if (specificModelOptions.some((m) => m.aa_slug === form.model_id)) return;
    setForm((prev) => ({ ...prev, model_id: specificModelOptions[0]?.aa_slug ?? '' }));
  }, [form.series_id, form.model_id, specificModelOptions]);

  // Enhanced search: search series names + model names, deduplicate by series_id
  const searchMatches = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return [];

    const seen = new Set<string>();
    const results: Array<{ series: ModelSeries; modalities: Set<string> }> = [];

    // Search by series display name first
    for (const s of seriesOptions) {
      if (results.length >= 8) break;
      if (!seen.has(s.id) && s.display_name.toLowerCase().includes(q)) {
        seen.add(s.id);
        results.push({ series: s, modalities: seriesModalityMap.get(s.id) ?? new Set() });
      }
    }

    // Also search by model name (resolves to series)
    for (const m of models) {
      if (results.length >= 8) break;
      const sid = m.series_id;
      if (!sid || seen.has(sid)) continue;
      const series = seriesOptions.find((s) => s.id === sid);
      if (!series) continue;
      if (cleanName(m.aa_name ?? '').toLowerCase().includes(q)) {
        seen.add(sid);
        results.push({ series, modalities: seriesModalityMap.get(sid) ?? new Set() });
      }
    }

    return results;
  }, [seriesOptions, models, searchText, seriesModalityMap]);

  useEffect(() => {
    if (!user || !form.series_id) return;
    let canceled = false;
    setLoadingExisting(true);

    let query = supabase
      .from('model_review_posts')
      .select('id, rating_overall, rating_quality, rating_price, rating_latency, rating_throughput, rating_stability, provider_name, pros, cons, comment')
      .eq('user_id', user.id)
      .eq('series_id', form.series_id);
    query = form.model_id ? query.eq('model_id', form.model_id) : query.is('model_id', null);

    query.maybeSingle().then(({ data }) => {
      if (canceled) return;
      if (data) {
        setForm((prev) => ({
          ...prev,
          rating_overall: data.rating_overall ?? null,
          rating_quality: data.rating_quality ?? null,
          rating_price: data.rating_price ?? null,
          rating_latency: data.rating_latency ?? null,
          rating_throughput: data.rating_throughput ?? null,
          rating_stability: data.rating_stability ?? null,
          provider_name: data.provider_name ?? '',
          pros: data.pros ?? '',
          cons: data.cons ?? '',
          comment: data.comment ?? '',
        }));
      } else {
        setForm((prev) => ({
          ...prev,
          rating_overall: null,
          rating_quality: null,
          rating_price: null,
          rating_latency: null,
          rating_throughput: null,
          rating_stability: null,
          provider_name: '',
          pros: '',
          cons: '',
          comment: '',
        }));
      }
      setLoadingExisting(false);
    });

    return () => { canceled = true; };
  }, [user, form.series_id, form.model_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) { navigate('/login'); return; }
    if (!form.series_id) { setError('请先选择模型系列。'); return; }
    if (form.rating_overall == null) { setError('总体评分是必填项。'); return; }

    setSubmitting(true);
    setError('');
    setSuccess('');

    let existingQuery = supabase
      .from('model_review_posts')
      .select('id')
      .eq('user_id', user.id)
      .eq('series_id', form.series_id);
    existingQuery = form.model_id ? existingQuery.eq('model_id', form.model_id) : existingQuery.is('model_id', null);

    const { data: existing } = await existingQuery.maybeSingle();

    const payload = {
      user_id: user.id,
      series_id: form.series_id,
      model_id: form.model_id || null,
      rating_overall: form.rating_overall,
      rating_quality: form.rating_quality,
      rating_price: form.rating_price,
      rating_latency: form.rating_latency,
      rating_throughput: form.rating_throughput,
      rating_stability: form.rating_stability,
      provider_name: form.provider_name || null,
      pros: form.pros.trim().slice(0, 100) || null,
      cons: form.cons.trim().slice(0, 100) || null,
      comment: form.comment.trim().slice(0, 200) || null,
      status: 'published',
    };

    const result = existing?.id
      ? await supabase.from('model_review_posts').update(payload).eq('id', existing.id).eq('user_id', user.id)
      : await supabase.from('model_review_posts').insert(payload);

    setSubmitting(false);
    if (result.error) { setError(`发布失败：${result.error.message}`); return; }

    setSuccess('点评已发布。');
    setTimeout(() => navigate('/community'), 700);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-xl font-black">发表模型点评</h1>
          <p className="text-sm text-slate-500 mt-0.5">搜索并选择模型系列，再选具体型号；总体评分必填。</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />{error}
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />{success}
            </div>
          )}
          {!user && (
            <div className="px-4 py-3 bg-amber-50 text-amber-700 rounded-2xl text-sm font-medium">
              发布点评需要登录。<Link to="/login" className="font-black underline ml-1">去登录</Link>
            </div>
          )}

          {/* Step 1: Search */}
          <section>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">搜索模型</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => { setSearchText(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                placeholder="输入模型名称关键词，如 Claude、GPT、Gemini..."
                className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 placeholder:text-slate-400 focus:ring-2 ring-primary/20"
              />
              {showDropdown && searchText.trim() && (
                <div className="absolute z-20 top-full mt-1 w-full border border-slate-200 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-slate-900">
                  {searchMatches.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-400">没有匹配的模型系列</div>
                  ) : (
                    searchMatches.map(({ series: s, modalities }) => (
                      <button
                        key={s.id}
                        type="button"
                        onMouseDown={() => {
                          const autoModality = modalities.size === 1
                            ? ([...modalities][0] as ModalityKey)
                            : form.modality;
                          setForm((prev) => ({ ...prev, series_id: s.id, model_id: '', modality: autoModality }));
                          setSearchText(s.display_name);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800 border-b last:border-b-0 border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                      >
                        <span className="font-semibold text-slate-500">{s.display_name}</span>
                        <div className="flex gap-1 shrink-0">
                          {[...modalities].map((mod) => (
                            <span key={mod} className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500 font-semibold">
                              {MODALITY_OPTIONS.find(o => o.key === mod)?.shortLabel ?? mod}
                            </span>
                          ))}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </section>

          {/* Step 2: Modality + Series (linked) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">模型类别</label>
              <select
                value={form.modality}
                onChange={(e) => setForm((prev) => ({ ...prev, modality: e.target.value as ModalityKey, model_id: '' }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 focus:ring-2 ring-primary/20"
              >
                {MODALITY_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
            </section>
            <section>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                模型系列（必选）
                {loadingExisting && <span className="ml-2 text-[11px] text-slate-400 font-bold normal-case tracking-normal">加载历史点评...</span>}
              </label>
              {loadingModels ? (
                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> 加载中...
                </div>
              ) : (
                <select
                  value={form.series_id}
                  onChange={(e) => {
                    const sid = e.target.value;
                    const series = seriesOptions.find(s => s.id === sid);
                    const mods = sid ? seriesModalityMap.get(sid) : undefined;
                    const autoModality = mods?.size === 1 ? ([...mods][0] as ModalityKey) : form.modality;
                    if (series) setSearchText(series.display_name);
                    setForm((prev) => ({ ...prev, series_id: sid, model_id: '', modality: autoModality }));
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 focus:ring-2 ring-primary/20"
                  required
                >
                  <option value="">— 请选择模型系列 —</option>
                  {filteredSeriesOptions.map((s) => (
                    <option key={s.id} value={s.id}>{s.display_name}</option>
                  ))}
                </select>
              )}
            </section>
          </div>

          {/* Step 3: Specific model + Provider (same row) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                具体型号（可选）
                {!form.series_id && <span className="ml-2 text-[11px] text-slate-300 font-bold normal-case tracking-normal">请先选择系列</span>}
              </label>
              <select
                value={form.model_id}
                onChange={(e) => setForm((prev) => ({ ...prev, model_id: e.target.value }))}
                disabled={!form.series_id}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 focus:ring-2 ring-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <option value="">不指定（系列级评论）</option>
                {specificModelOptions.map((m) => (
                  <option key={m.aa_slug} value={m.aa_slug}>{cleanName(m.aa_name)}</option>
                ))}
              </select>
            </section>
            <section>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">使用的 Provider（可选）</label>
              <select
                value={form.provider_name}
                onChange={(e) => setForm((prev) => ({ ...prev, provider_name: e.target.value }))}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 focus:ring-2 ring-primary/20"
              >
                <option value="">未指定</option>
                {PROVIDERS.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </section>
          </div>

          <section>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">总体评分（必填）</label>
            <div className="flex items-center gap-3">
              <StarSelector value={form.rating_overall} onChange={(v) => setForm((prev) => ({ ...prev, rating_overall: v }))} />
              <span className="text-sm font-black text-primary">{form.rating_overall ?? '未评分'}</span>
            </div>
          </section>

          <section>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">维度评分（可选，独立）</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { key: 'rating_quality', label: '质量' },
                { key: 'rating_price', label: '性价比' },
                { key: 'rating_latency', label: '延迟' },
                { key: 'rating_throughput', label: '吞吐量' },
                { key: 'rating_stability', label: '稳定性' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">{label}</span>
                    <span className="text-xs font-black text-primary">
                      {form[key as keyof typeof form] == null ? '未评分' : String(form[key as keyof typeof form])}
                    </span>
                  </div>
                  <StarSelector
                    allowClear
                    value={form[key as keyof typeof form] as number | null}
                    onChange={(v) => setForm((prev) => ({ ...prev, [key]: v }))}
                  />
                </div>
              ))}
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section>
              <label className="block text-xs font-black uppercase tracking-widest text-emerald-500 mb-2">优点（可选，≤100）</label>
              <textarea
                value={form.pros}
                onChange={(e) => setForm((prev) => ({ ...prev, pros: e.target.value.slice(0, 100) }))}
                className="w-full h-20 px-4 py-2.5 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-slate-500 resize-none"
              />
            </section>
            <section>
              <label className="block text-xs font-black uppercase tracking-widest text-rose-500 mb-2">缺点（可选，≤100）</label>
              <textarea
                value={form.cons}
                onChange={(e) => setForm((prev) => ({ ...prev, cons: e.target.value.slice(0, 100) }))}
                className="w-full h-20 px-4 py-2.5 bg-rose-50 border border-rose-100 rounded-xl text-sm text-slate-500 resize-none"
              />
            </section>
          </div>

          <section>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">详细评价（可选，≤200）</label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value.slice(0, 200) }))}
              className="w-full h-24 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-500 resize-none"
            />
          </section>

          <div className="pt-1">
            <button
              type="submit"
              disabled={submitting || loadingModels || !form.series_id}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold hover:bg-primary/90 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> 发布中...</> : '发布点评'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
