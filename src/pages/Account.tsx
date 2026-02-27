import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, Loader2, Save, Trash2, UserCircle2, X, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { ModelSnapshot } from '../types';

interface ProfileRow {
  id: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  level: number | null;
}

interface MyReview {
  id: string;
  series_id: string;
  model_id: string | null;
  rating_overall: number;
  rating_quality: number | null;
  rating_price: number | null;
  rating_latency: number | null;
  rating_throughput: number | null;
  rating_stability: number | null;
  provider_name: string | null;
  pros: string | null;
  cons: string | null;
  comment: string | null;
  created_at: string;
}

function cleanName(name: string): string {
  return name.replace(/\s*\(.*?\)\s*/g, '');
}

function formatModelIdDisplay(modelId: string): string {
  const idx = modelId.indexOf('::');
  if (idx < 0) return modelId;
  const modality = modelId.slice(0, idx);
  const slug = modelId.slice(idx + 2);
  const labelMap: Record<string, string> = {
    llm: 'LLM模型',
    text_to_image: '文生图模型',
    text_to_video: '文生视频模型',
    image_editing: '图像编辑模型',
    image_to_video: '图生视频模型',
    text_to_speech: '语音合成 / TTS模型',
  };
  return `${labelMap[modality] ?? modality}：${slug}`;
}

export const Account = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [form, setForm] = useState({ username: '', avatar_url: '', bio: '' });
  const [reviews, setReviews] = useState<MyReview[]>([]);
  const [modelMap, setModelMap] = useState<Record<string, ModelSnapshot>>({});
  const [seriesMap, setSeriesMap] = useState<Record<string, string>>({});
  const [detailReviewId, setDetailReviewId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const load = async () => {
      setLoading(true);
      setError('');

      const [{ data: pData, error: pErr }, { data: rData, error: rErr }] = await Promise.all([
        supabase.from('profiles').select('id, username, avatar_url, bio, level').eq('id', user.id).maybeSingle(),
        supabase
          .from('model_review_posts')
          .select('id, series_id, model_id, rating_overall, rating_quality, rating_price, rating_latency, rating_throughput, rating_stability, provider_name, pros, cons, comment, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
      ]);

      if (pErr || rErr) {
        setError(pErr?.message || rErr?.message || '加载失败');
        setLoading(false);
        return;
      }

      const profileRow = (pData ?? null) as ProfileRow | null;
      setProfile(profileRow);
      setForm({
        username: profileRow?.username ?? (user.email?.split('@')[0] ?? ''),
        avatar_url: profileRow?.avatar_url ?? '',
        bio: profileRow?.bio ?? '',
      });

      const myReviews = (rData ?? []) as MyReview[];
      setReviews(myReviews);
      setDetailReviewId(null);

      const modelIds = Array.from(new Set(myReviews.map((x) => x.model_id).filter(Boolean))) as string[];
      const seriesIds = Array.from(new Set(myReviews.map((x) => x.series_id)));
      if (modelIds.length > 0) {
        const { data: modelsData } = await supabase
          .from('model_snapshots')
          .select('aa_slug, aa_name, aa_modality, aa_release_date')
          .in('aa_slug', modelIds);
        const map: Record<string, ModelSnapshot> = {};
        (modelsData ?? []).forEach((m) => {
          map[m.aa_slug] = m as ModelSnapshot;
        });
        setModelMap(map);
      } else {
        setModelMap({});
      }

      if (seriesIds.length > 0) {
        const { data: seriesData } = await supabase
          .from('model_series')
          .select('id, display_name')
          .in('id', seriesIds);
        const nextSeriesMap: Record<string, string> = {};
        (seriesData ?? []).forEach((s) => {
          nextSeriesMap[s.id] = s.display_name;
        });
        setSeriesMap(nextSeriesMap);
      } else {
        setSeriesMap({});
      }

      setLoading(false);
    };

    load();
  }, [user]);

  const levelText = useMemo(() => `LV.${profile?.level ?? 1}`, [profile?.level]);
  const detailReview = useMemo(
    () => reviews.find((r) => r.id === detailReviewId) ?? null,
    [reviews, detailReviewId]
  );

  const saveProfile = async () => {
    if (!user) return;
    if (!form.username.trim()) {
      setError('用户名不能为空。');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');

    const { error: upsertErr } = await supabase.from('profiles').upsert({
      id: user.id,
      username: form.username.trim(),
      avatar_url: form.avatar_url.trim() || null,
      bio: form.bio.trim() || null,
    });

    setSaving(false);
    if (upsertErr) {
      setError(`保存失败：${upsertErr.message}`);
      return;
    }
    setSuccess('账号信息已更新。');
  };

  const deleteReview = async (reviewId: string) => {
    if (!user) return;
    const ok = window.confirm('确认删除这条评分吗？删除后不可恢复。');
    if (!ok) return;

    setDeletingId(reviewId);
    setError('');
    const { error: delErr } = await supabase
      .from('model_review_posts')
      .delete()
      .eq('id', reviewId)
      .eq('user_id', user.id);
    setDeletingId(null);

    if (delErr) {
      setError(`删除失败：${delErr.message}`);
      return;
    }
    setReviews((prev) => prev.filter((x) => x.id !== reviewId));
    setSuccess('评分已删除。');
  };

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <UserCircle2 className="w-12 h-12 mx-auto mb-4 text-slate-400" />
        <p className="text-lg font-bold text-slate-700">请先登录后查看个人详情页。</p>
        <Link to="/login" className="mt-4 inline-block text-primary font-bold hover:underline">去登录</Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <section className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 h-fit">
        <h1 className="text-xl font-black mb-1">个人信息</h1>
        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">{levelText}</p>

        {error && (
          <div className="mb-4 flex items-start gap-2 px-3 py-2 bg-rose-50 text-rose-600 rounded-xl text-xs font-medium">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            {error}
          </div>
        )}
        {success && <div className="mb-4 px-3 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-medium">{success}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">用户名</label>
            <input
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">头像 URL</label>
            <input
              value={form.avatar_url}
              onChange={(e) => setForm((prev) => ({ ...prev, avatar_url: e.target.value }))}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">个人简介</label>
            <textarea
              value={form.bio}
              onChange={(e) => setForm((prev) => ({ ...prev, bio: e.target.value.slice(0, 200) }))}
              className="w-full h-24 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm resize-none"
            />
          </div>
          <button
            onClick={saveProfile}
            disabled={saving}
            className="w-full py-2.5 bg-primary text-white rounded-xl text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            保存信息
          </button>
        </div>
      </section>

      <section className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100">
          <h2 className="text-lg font-black">我的评分</h2>
        </div>
        {reviews.length === 0 ? (
          <div className="px-6 py-14 text-sm text-slate-400 text-center">暂无评分记录</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[760px]">
              <thead className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-50/70">
                <tr>
                  <th className="px-6 py-3">模型名称</th>
                  <th className="px-6 py-3 text-center">总体评分</th>
                  <th className="px-6 py-3 text-center">发布时间</th>
                  <th className="px-6 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reviews.map((r) => {
                  const m = r.model_id ? modelMap[r.model_id] : undefined;
                  const seriesName = seriesMap[r.series_id] ?? '未命名系列';
                  const modality = m?.aa_modality ?? 'llm';
                  const updateLink = r.model_id
                    ? `/review/new?series=${encodeURIComponent(r.series_id)}&model=${encodeURIComponent(r.model_id)}&modality=${encodeURIComponent(modality)}`
                    : `/review/new?series=${encodeURIComponent(r.series_id)}&modality=${encodeURIComponent(modality)}`;
                  return (
                    <tr key={r.id}>
                      <td className="px-6 py-4 text-sm font-bold">
                        {r.model_id ? (
                          <Link to={`/model/${r.model_id}`} className="hover:text-primary hover:underline">
                            {seriesName} · {m ? cleanName(m.aa_name) : formatModelIdDisplay(r.model_id)}
                          </Link>
                        ) : (
                          <span>{seriesName}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-sm font-black text-primary">{r.rating_overall}</td>
                      <td className="px-6 py-4 text-center text-sm text-slate-500">{new Date(r.created_at).toLocaleString()}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="inline-flex items-center gap-4">
                          <button
                            onClick={() => setDetailReviewId(r.id)}
                            className="text-xs font-black text-slate-500 hover:text-primary hover:underline"
                          >
                            详情
                          </button>
                          <Link to={updateLink} className="text-xs font-black text-primary hover:underline">
                            更新
                          </Link>
                          <button
                            onClick={() => deleteReview(r.id)}
                            disabled={deletingId === r.id}
                            className="text-xs font-black text-rose-500 hover:text-rose-600 disabled:opacity-50 inline-flex items-center gap-1"
                          >
                            {deletingId === r.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {detailReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            aria-label="关闭"
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setDetailReviewId(null)}
          />
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black">评分详情（只读）</h2>
              <button onClick={() => setDetailReviewId(null)} className="p-2 rounded-full hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">系列 / 型号</label>
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800">
                    {(() => {
                      const seriesName = seriesMap[detailReview.series_id] ?? '未命名系列';
                      if (!detailReview.model_id) return seriesName;
                      const m = modelMap[detailReview.model_id];
                      return `${seriesName} · ${m ? cleanName(m.aa_name) : formatModelIdDisplay(detailReview.model_id)}`;
                    })()}
                  </div>
                </section>
                <section>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">发布时间</label>
                  <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800">
                    {new Date(detailReview.created_at).toLocaleString()}
                  </div>
                </section>
              </div>

              <section>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">总体评分</label>
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className={`w-5 h-5 ${i <= detailReview.rating_overall ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-black text-primary">{detailReview.rating_overall}</span>
                </div>
              </section>

              <section>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">维度评分</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    { label: '质量', val: detailReview.rating_quality },
                    { label: '性价比', val: detailReview.rating_price },
                    { label: '延迟', val: detailReview.rating_latency },
                    { label: '吞吐量', val: detailReview.rating_throughput },
                    { label: '稳定性', val: detailReview.rating_stability },
                  ].map(({ label, val }) => (
                    <div key={label} className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <p className="text-[11px] font-black text-slate-400 mb-1">{label}</p>
                      <p className="text-sm font-black text-slate-800">{val == null ? 'N/A' : val}</p>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Provider</label>
                <div className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800">
                  {detailReview.provider_name ?? '未指定'}
                </div>
              </section>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section>
                  <label className="block text-xs font-black uppercase tracking-widest text-emerald-500 mb-2">优点</label>
                  <div className="w-full min-h-[84px] px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-slate-800">
                    {detailReview.pros || '—'}
                  </div>
                </section>
                <section>
                  <label className="block text-xs font-black uppercase tracking-widest text-rose-500 mb-2">缺点</label>
                  <div className="w-full min-h-[84px] px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-slate-800">
                    {detailReview.cons || '—'}
                  </div>
                </section>
              </div>

              <section>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">详细评价</label>
                <div className="w-full min-h-[110px] px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 whitespace-pre-wrap">
                  {detailReview.comment || '—'}
                </div>
              </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
