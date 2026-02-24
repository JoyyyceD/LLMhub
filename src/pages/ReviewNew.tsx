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

const PROVIDERS = [
  'OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral',
  'DeepSeek', 'Alibaba', 'Baidu', 'ByteDance', 'Zhipu',
  'Moonshot', 'MiniMax', 'Tencent', '01AI', 'SiliconFlow',
  'OpenRouter', 'Together AI', 'Other',
];

const MODALITY_OPTIONS: Array<{ key: ModalityKey; label: string }> = [
  { key: 'llm', label: 'LLM模型' },
  { key: 'text_to_image', label: '文生图模型' },
  { key: 'text_to_video', label: '文生视频模型' },
  { key: 'image_editing', label: '图像编辑模型' },
  { key: 'image_to_video', label: '图生视频模型' },
  { key: 'text_to_speech', label: '语音合成 / TTS模型' },
];

function cleanName(name: string): string {
  return name.replace(/\s*\(.*?\)\s*/g, '');
}

function pickLatestModelInModality(models: ModelSnapshot[], modality: ModalityKey): ModelSnapshot | null {
  const inModality = models.filter((m) => (m.aa_modality ?? 'llm') === modality);
  if (inModality.length === 0) return null;
  const sorted = [...inModality].sort((a, b) => {
    const ta = a.aa_release_date ? new Date(a.aa_release_date).getTime() : 0;
    const tb = b.aa_release_date ? new Date(b.aa_release_date).getTime() : 0;
    if (tb !== ta) return tb - ta;
    return (a.aa_name ?? '').localeCompare(b.aa_name ?? '');
  });
  return sorted[0] ?? null;
}

function isModalityKey(v: string | null): v is ModalityKey {
  return !!v && MODALITY_OPTIONS.some((m) => m.key === v);
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
  const [searchText, setSearchText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [form, setForm] = useState({
    modality: 'llm' as ModalityKey,
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
    supabase
      .from('model_snapshots')
      .select('aa_slug, aa_name, aa_modality, aa_model_creator_name, aa_release_date, has_aa')
      .eq('has_aa', true)
      .then(({ data, error: err }) => {
        if (err) {
          setError(`模型列表加载失败：${err.message}`);
          setLoadingModels(false);
          return;
        }
        const all = (data ?? []) as ModelSnapshot[];
        setModels(all);

        const q = new URLSearchParams(location.search);
        const modelFromUrl = q.get('model');
        const modalityFromUrl = q.get('modality');
        const matchedModel = modelFromUrl ? all.find((m) => m.aa_slug === modelFromUrl) : null;
        const matchedModality = matchedModel?.aa_modality ?? (isModalityKey(modalityFromUrl) ? modalityFromUrl : null);
        const initModality = (matchedModality ?? 'llm') as ModalityKey;
        const latestInModality = pickLatestModelInModality(all, initModality);

        setForm((prev) => ({
          ...prev,
          modality: initModality,
          model_id: matchedModel?.aa_slug ?? latestInModality?.aa_slug ?? '',
        }));
        setLoadingModels(false);
      });
  }, [location.search]);

  const modelsInModality = useMemo(
    () => models.filter((m) => (m.aa_modality ?? 'llm') === form.modality),
    [models, form.modality]
  );

  useEffect(() => {
    if (!modelsInModality.length) return;
    if (modelsInModality.some((m) => m.aa_slug === form.model_id)) return;
    const latestInModality = pickLatestModelInModality(models, form.modality);
    setForm((prev) => ({ ...prev, model_id: latestInModality?.aa_slug ?? modelsInModality[0].aa_slug }));
  }, [modelsInModality, form.model_id, models, form.modality]);

  const searchMatches = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    if (!q) return [];
    return models
      .filter((m) => cleanName(m.aa_name).toLowerCase().includes(q))
      .slice(0, 8);
  }, [models, searchText]);

  useEffect(() => {
    if (!user || !form.model_id) return;
    let canceled = false;
    setLoadingExisting(true);
    supabase
      .from('model_review_posts')
      .select('rating_overall, rating_quality, rating_price, rating_latency, rating_throughput, rating_stability, provider_name, pros, cons, comment')
      .eq('user_id', user.id)
      .eq('model_id', form.model_id)
      .maybeSingle()
      .then(({ data }) => {
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
    return () => {
      canceled = true;
    };
  }, [user, form.model_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    if (!form.model_id) {
      setError('请先选择模型。');
      return;
    }
    if (form.rating_overall == null) {
      setError('总体评分是必填项。');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    const { error: upsertError } = await supabase.from('model_review_posts').upsert(
      {
        user_id: user.id,
        model_id: form.model_id,
        rating_overall: form.rating_overall,
        rating_quality: form.rating_quality,
        rating_price: form.rating_price,
        rating_latency: form.rating_latency,
        rating_throughput: form.rating_throughput,
        rating_stability: form.rating_stability,
        provider_name: form.provider_name || null,
        pros: form.pros.trim().slice(0, 200) || null,
        cons: form.cons.trim().slice(0, 200) || null,
        comment: form.comment.trim().slice(0, 800) || null,
        status: 'published',
      },
      { onConflict: 'user_id,model_id' }
    );

    setSubmitting(false);
    if (upsertError) {
      setError(`发布失败：${upsertError.message}`);
      return;
    }

    setSuccess('点评已发布。');
    setTimeout(() => navigate('/community'), 700);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-lg overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-2xl font-black">发表模型点评</h1>
          <p className="text-sm text-slate-500 mt-1">总体评分必填，其他维度与优缺点均可选。</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-7">
          {error && (
            <div className="flex items-start gap-3 px-4 py-3 bg-rose-50 text-rose-600 rounded-2xl text-sm font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-start gap-3 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-2xl text-sm font-medium">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {success}
            </div>
          )}

          {!user && (
            <div className="px-4 py-3 bg-amber-50 text-amber-700 rounded-2xl text-sm font-medium">
              发布点评需要登录。<Link to="/login" className="font-black underline ml-1">去登录</Link>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">模型类别</label>
              <select
                value={form.modality}
                onChange={(e) => setForm((prev) => ({ ...prev, modality: e.target.value as ModalityKey }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 ring-primary/20"
              >
                {MODALITY_OPTIONS.map((o) => (
                  <option key={o.key} value={o.key}>{o.label}</option>
                ))}
              </select>
            </section>
            <section>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">模型名称</label>
              {loadingModels ? (
                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-400 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" /> 加载中...
                </div>
              ) : (
                <select
                  value={form.model_id}
                  onChange={(e) => setForm((prev) => ({ ...prev, model_id: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 ring-primary/20"
                  required
                >
                  {modelsInModality.map((m) => (
                    <option key={m.aa_slug} value={m.aa_slug}>{cleanName(m.aa_name)}</option>
                  ))}
                </select>
              )}
              {loadingExisting && (
                <p className="mt-2 text-[11px] text-slate-400 font-bold">正在加载你之前的点评...</p>
              )}
            </section>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">搜索模型（自动匹配类别）</label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="输入模型名称关键词..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 ring-primary/20"
                />
              </div>
              {searchText.trim() && (
                <div className="mt-2 border border-slate-200 rounded-xl overflow-hidden">
                  {searchMatches.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-slate-400">没有匹配模型</div>
                  ) : (
                    searchMatches.map((m) => (
                      <button
                        key={m.aa_slug}
                        type="button"
                        onClick={() => {
                          const nextModality = (m.aa_modality ?? 'llm') as ModalityKey;
                          setForm((prev) => ({ ...prev, modality: nextModality, model_id: m.aa_slug }));
                          setSearchText(cleanName(m.aa_name));
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 border-b last:border-b-0 border-slate-100"
                      >
                        <span className="font-bold text-slate-800">{cleanName(m.aa_name)}</span>
                        <span className="ml-2 text-xs text-slate-400">
                          {MODALITY_OPTIONS.find((x) => x.key === (m.aa_modality ?? 'llm'))?.label ?? (m.aa_modality ?? 'LLM')}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </section>
            <section>
              <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">使用的 Provider（可选）</label>
              <select
                value={form.provider_name}
                onChange={(e) => setForm((prev) => ({ ...prev, provider_name: e.target.value }))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 ring-primary/20"
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
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">维度评分（可选，独立）</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              {[
                { key: 'rating_quality', label: '质量' },
                { key: 'rating_price', label: '性价比' },
                { key: 'rating_latency', label: '延迟' },
                { key: 'rating_throughput', label: '吞吐量' },
                { key: 'rating_stability', label: '稳定性' },
              ].map(({ key, label }) => (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-600">{label}</span>
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

          

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section>
              <label className="block text-xs font-black uppercase tracking-widest text-emerald-500 mb-2">优点（可选，≤200）</label>
              <textarea
                value={form.pros}
                onChange={(e) => setForm((prev) => ({ ...prev, pros: e.target.value.slice(0, 200) }))}
                className="w-full h-28 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-slate-900 resize-none"
              />
            </section>
            <section>
              <label className="block text-xs font-black uppercase tracking-widest text-rose-500 mb-2">缺点（可选，≤200）</label>
              <textarea
                value={form.cons}
                onChange={(e) => setForm((prev) => ({ ...prev, cons: e.target.value.slice(0, 200) }))}
                className="w-full h-28 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-slate-900 resize-none"
              />
            </section>
          </div>

          <section>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">详细评价（可选，≤800）</label>
            <textarea
              value={form.comment}
              onChange={(e) => setForm((prev) => ({ ...prev, comment: e.target.value.slice(0, 800) }))}
              className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 resize-none"
            />
          </section>

          <div className="pt-1">
            <button
              type="submit"
              disabled={submitting || loadingModels || !form.model_id}
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
