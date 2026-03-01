import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Share2,
  MoreHorizontal,
  Star,
  Plus,
  Zap,
  X,
  Send,
  CheckCircle2,
  LogIn,
  Loader2,
  AlertCircle,
  Trash2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { ModelSnapshot } from '../types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DbPost {
  id: string;
  user_id: string | null;
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
  status: string;
  created_at: string;
  source_platform: string | null;
  display_name: string | null;
  post_date: string | null;
  profiles: {
    username: string;
    avatar_url: string | null;
    level: number;
  } | null;
}

interface SeriesRow {
  id: string;
  slug: string;
  display_name: string;
  query_aliases?: string[] | null;
}

interface DbReply {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  } | null;
}

interface UIPost {
  id: string;
  userId: string | null;
  user: string;
  avatar: string;
  level: string;
  time: string;
  seriesId: string;
  seriesName: string;
  modelId: string | null;
  modelName: string;
  ratingOverall: number;
  ratingQuality: number | null;
  ratingPrice: number | null;
  ratingLatency: number | null;
  ratingThroughput: number | null;
  ratingStability: number | null;
  providerName: string | null;
  pros: string | null;
  cons: string | null;
  comment: string | null;
  upCount: number;
  downCount: number;
  myReaction: 'up' | 'down' | null;
  replies: DbReply[];
  sourcePlatform: string | null;
}

function timeAgo(dateStr: string): string {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return '刚刚';
  if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
  return `${Math.floor(diff / 86400)}天前`;
}

function formatPostDate(dateStr: string): string {
  const [, month, day] = dateStr.split('-');
  return `${parseInt(month)}月${parseInt(day)}日`;
}

const SOURCE_PLATFORM_LABELS: Record<string, string> = {
  xhs: '小红书',
  zhihu: '知乎',
  weibo: '微博',
  bilibili: 'B站',
};

const PROVIDERS = [
  'OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral',
  'DeepSeek', 'Alibaba', 'Baidu', 'ByteDance', 'Zhipu',
  'Moonshot', 'MiniMax', 'Tencent', '01AI', 'SiliconFlow',
  'OpenRouter', 'Together AI', 'Other',
];

const SORT_OPTIONS = ['最新发布', '最多点赞', '最高评分'] as const;
type SortOption = typeof SORT_OPTIONS[number];

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

function buildSeriesMatchMap(seriesRows: SeriesRow[]): Map<string, string> {
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
  const norm = normalizeForMatch(deriveSeriesName(model.aa_name ?? ''));
  return norm ? (seriesMap.get(norm) ?? null) : null;
}

// ---------------------------------------------------------------------------
// Star rating component
// ---------------------------------------------------------------------------

const StarSelector = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <button
        key={i}
        type="button"
        onClick={() => onChange(i)}
        className="focus:outline-none transition-transform hover:scale-110"
      >
        <Star
          className={`w-5 h-5 ${i <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
        />
      </button>
    ))}
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const Community = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<UIPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [newReply, setNewReply] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [postError, setPostError] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('最新发布');
  const [modelOptions, setModelOptions] = useState<ModelSnapshot[]>([]);
  const [seriesOptions, setSeriesOptions] = useState<SeriesRow[]>([]);
  const [seriesMap, setSeriesMap] = useState<Record<string, string>>({});

  // Post form state
  const [postForm, setPostForm] = useState({
    series_id: '',
    model_id: '',
    rating_overall: 5,
    rating_quality: 5,
    rating_price: 5,
    rating_latency: 5,
    rating_throughput: 5,
    rating_stability: 5,
    provider_name: '',
    pros: '',
    cons: '',
    comment: '',
  });

  // Calculate average rating whenever scores change
  useEffect(() => {
    const scores = [
      postForm.rating_quality,
      postForm.rating_price,
      postForm.rating_latency,
      postForm.rating_throughput,
      postForm.rating_stability
    ];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    setPostForm(prev => {
        // Prevent infinite loop if rating hasn't changed
        const newRating = Math.round(avg); // Use integer for star selector compatibility or keep float?
        // The previous implementation used float for display. The current schema uses integer for rating_overall?
        // Looking at DbPost interface: rating_overall: number. It can be float?
        // But StarSelector takes integer.
        // Let's stick to float for display but maybe round for the state if required.
        // Actually, let's keep it consistent with the previous logic: 1 decimal place.
        // BUT StarSelector expects value to be 1-5.
        // Let's verify StarSelector: i <= value. So it handles floats fine (e.g. 4.5 >= 4).
        
        const newRatingFloat = parseFloat(avg.toFixed(1));
        if (prev.rating_overall === newRatingFloat) return prev;
        return { ...prev, rating_overall: newRatingFloat };
    });
  }, [
    postForm.rating_quality,
    postForm.rating_price,
    postForm.rating_latency,
    postForm.rating_throughput,
    postForm.rating_stability
  ]);

  // Load model options for the selector
  useEffect(() => {
    Promise.all([
      supabase
        .from('model_snapshots')
        .select('aa_slug, aa_name, aa_model_creator_name, series_id')
        .eq('has_aa', true)
        .order('aa_name'),
      supabase
        .from('model_series')
        .select('id, slug, display_name, query_aliases')
        .order('display_name'),
    ]).then(([modelResp, seriesResp]) => {
      const modelsData = (modelResp.data ?? []) as ModelSnapshot[];
      const seriesData = (seriesResp.data ?? []) as SeriesRow[];
      const matchMap = buildSeriesMatchMap(seriesData);
      const resolvedModels = modelsData.map((m) => ({
        ...m,
        series_id: resolveModelSeriesId(m, matchMap),
      }));

      setModelOptions(resolvedModels);
      setSeriesOptions(seriesData);
      const nextSeriesMap: Record<string, string> = {};
      seriesData.forEach((s) => {
        nextSeriesMap[s.id] = s.display_name;
      });
      setSeriesMap(nextSeriesMap);
      if (seriesData.length > 0) {
        const firstSeriesId = seriesData[0].id;
        const firstModel = resolvedModels.find((m) => m.series_id === firstSeriesId);
        setPostForm((prev) => ({ ...prev, series_id: firstSeriesId, model_id: firstModel?.aa_slug ?? '' }));
      }
    });
  }, []);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    setLoading(true);

    let query = supabase
      .from('model_review_posts')
      .select('*, profiles!model_review_posts_user_id_fkey(username, avatar_url, level)')
      .eq('status', 'published');

    if (sortBy === '最新发布') query = query.order('created_at', { ascending: false });
    else if (sortBy === '最高评分') query = query.order('rating_overall', { ascending: false });

    const { data: postsData, error } = await query;
    if (error) {
      console.error('获取评价失败:', error.message);
      setLoading(false);
      return;
    }

    // Fetch reactions
    let myReactions: Record<string, 'up' | 'down'> = {};
    const { data: allReactions } = await supabase
      .from('review_post_reactions')
      .select('post_id, reaction, user_id');

    // Count per post
    const upCounts: Record<string, number> = {};
    const downCounts: Record<string, number> = {};
    for (const r of allReactions ?? []) {
      if (r.reaction === 'up') upCounts[r.post_id] = (upCounts[r.post_id] ?? 0) + 1;
      else downCounts[r.post_id] = (downCounts[r.post_id] ?? 0) + 1;
      if (user && r.user_id === user.id) myReactions[r.post_id] = r.reaction as 'up' | 'down';
    }

    // Build UI posts
    const dbPosts = (postsData ?? []) as DbPost[];
    let mapped: UIPost[] = dbPosts.map((p) => {
      // Try to find model name from options (may not be loaded yet)
      const matchedModel = p.model_id ? modelOptions.find((m) => m.aa_slug === p.model_id) : null;
      const seriesName = seriesMap[p.series_id] ?? '未命名系列';
      const displayName = p.display_name ?? p.profiles?.username ?? '匿名用户';
      const avatarSeed = p.display_name ?? p.user_id ?? p.id;
      const isImported = !!p.source_platform;
      return {
        id: p.id,
        userId: p.user_id,
        user: displayName,
        avatar: p.profiles?.avatar_url ?? `https://picsum.photos/seed/${encodeURIComponent(avatarSeed)}/100/100`,
        level: isImported ? '' : `LV.${p.profiles?.level ?? 1}`,
        time: p.post_date ? formatPostDate(p.post_date) : timeAgo(p.created_at),
        seriesId: p.series_id,
        seriesName,
        modelId: p.model_id,
        modelName: matchedModel
          ? matchedModel.aa_name.replace(/\s*\(.*?\)\s*/g, '')
          : seriesName,
        ratingOverall: p.rating_overall,
        ratingQuality: p.rating_quality,
        ratingPrice: p.rating_price,
        ratingLatency: p.rating_latency,
        ratingThroughput: p.rating_throughput,
        ratingStability: p.rating_stability,
        providerName: p.provider_name,
        pros: p.pros,
        cons: p.cons,
        comment: p.comment,
        upCount: upCounts[p.id] ?? 0,
        downCount: downCounts[p.id] ?? 0,
        myReaction: myReactions[p.id] ?? null,
        replies: [],
        sourcePlatform: p.source_platform,
      };
    });

    // Sort by most liked
    if (sortBy === '最多点赞') {
      mapped = mapped.sort((a, b) => b.upCount - a.upCount);
    }

    setPosts(mapped);
    setLoading(false);
  }, [user, sortBy, modelOptions, seriesMap]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // React (up/down)
  const handleReact = async (postId: string, reaction: 'up' | 'down') => {
    if (!user) return;
    const post = posts.find((p) => p.id === postId);
    if (!post) return;
    const currentReaction = post.myReaction;

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        let up = p.upCount;
        let down = p.downCount;
        let myR: 'up' | 'down' | null = reaction;

        if (currentReaction === reaction) {
          // toggle off
          if (reaction === 'up') up--;
          else down--;
          myR = null;
        } else {
          if (currentReaction === 'up') up--;
          if (currentReaction === 'down') down--;
          if (reaction === 'up') up++;
          else down++;
        }
        return { ...p, upCount: up, downCount: down, myReaction: myR };
      })
    );

    if (currentReaction === reaction) {
      // Remove reaction
      await supabase
        .from('review_post_reactions')
        .delete()
        .match({ post_id: postId, user_id: user.id });
    } else {
      // Upsert reaction
      await supabase
        .from('review_post_reactions')
        .upsert(
          { post_id: postId, user_id: user.id, reaction },
          { onConflict: 'post_id,user_id' }
        );
    }
  };

  // Submit reply
  const handleSubmitReply = async (postId: string) => {
    if (!user || !newReply.trim()) return;
    const { error } = await supabase.from('review_post_replies').insert({
      post_id: postId,
      user_id: user.id,
      content: newReply.trim().slice(0, 300),
    });
    if (!error) {
      setNewReply('');
      setActiveReplyId(null);
      // Refresh to get the new reply
      fetchPosts();
    }
  };

  // Post review
  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!postForm.series_id) {
      setPostError('请先选择模型系列');
      return;
    }
    setSubmitting(true);
    setPostError('');

    let existingQuery = supabase
      .from('model_review_posts')
      .select('id')
      .eq('user_id', user.id)
      .eq('series_id', postForm.series_id);
    existingQuery = postForm.model_id ? existingQuery.eq('model_id', postForm.model_id) : existingQuery.is('model_id', null);
    const { data: existing } = await existingQuery.maybeSingle();

    const payload = {
      user_id: user.id,
      series_id: postForm.series_id,
      model_id: postForm.model_id || null,
      rating_overall: postForm.rating_overall,
      rating_quality: postForm.rating_quality,
      rating_price: postForm.rating_price,
      rating_latency: postForm.rating_latency,
      rating_throughput: postForm.rating_throughput,
      rating_stability: postForm.rating_stability,
      provider_name: postForm.provider_name || null,
      pros: postForm.pros.trim().slice(0, 200) || null,
      cons: postForm.cons.trim().slice(0, 200) || null,
      comment: postForm.comment.trim().slice(0, 800) || null,
      status: 'published',
    };
    const { error } = existing?.id
      ? await supabase.from('model_review_posts').update(payload).eq('id', existing.id).eq('user_id', user.id)
      : await supabase.from('model_review_posts').insert(payload);

    setSubmitting(false);
    if (error) {
      setPostError(`发布失败：${error.message}`);
      return;
    }
    setIsPostModalOpen(false);
    setPostError('');
    fetchPosts();
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const handleDeletePost = async (postId: string) => {
    if (!user) return;
    const ok = window.confirm('确认删除这条点评吗？删除后不可恢复。');
    if (!ok) return;

    const { error } = await supabase
      .from('model_review_posts')
      .delete()
      .eq('id', postId)
      .eq('user_id', user.id);
    if (error) {
      setPostError(`删除失败：${error.message}`);
      return;
    }
    fetchPosts();
  };

  const ratingDims = [
    { key: 'rating_quality', label: '质量' },
    { key: 'rating_price', label: '性价比' },
    { key: 'rating_latency', label: '延迟' },
    { key: 'rating_throughput', label: '吞吐量' },
    { key: 'rating_stability', label: '稳定性' },
  ] as const;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative">
      {/* Share Toast */}
      <AnimatePresence>
        {showShareToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-bold">链接已复制到剪贴板</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Post Review Modal */}
      <AnimatePresence>
        {isPostModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsPostModalOpen(false); setPostError(''); }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
            >
              <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h2 className="text-xl font-bold">发表模型点评</h2>
                <button
                  onClick={() => { setIsPostModalOpen(false); setPostError(''); }}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handlePostReview} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto custom-scrollbar">
                {postError && (
                  <div className="flex items-start gap-3 px-4 py-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 rounded-2xl text-sm font-medium">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    {postError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Series selector */}
                  <section>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">选择模型系列</label>
                    <select
                      value={postForm.series_id}
                      onChange={(e) => {
                        const seriesId = e.target.value;
                        const firstModel = modelOptions.find((m) => m.series_id === seriesId);
                        setPostForm({ ...postForm, series_id: seriesId, model_id: firstModel?.aa_slug ?? '' });
                      }}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 ring-primary/20"
                      required
                    >
                      {seriesOptions.map((s) => (
                        <option key={s.id} value={s.id}>{s.display_name}</option>
                      ))}
                    </select>
                  </section>

                  {/* Provider selector */}
                  <section>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">具体型号（可选）</label>
                    <select
                      value={postForm.model_id}
                      onChange={(e) => setPostForm({ ...postForm, model_id: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 ring-primary/20"
                    >
                      <option value="">不指定具体型号（系列级评论）</option>
                      {modelOptions
                        .filter((m) => m.series_id === postForm.series_id)
                        .map((m) => (
                          <option key={m.aa_slug} value={m.aa_slug}>
                            {m.aa_name.replace(/\s*\(.*?\)\s*/g, '')}
                          </option>
                        ))}
                    </select>
                  </section>

                  <section>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">使用的 Provider（可选）</label>
                    <select
                      value={postForm.provider_name}
                      onChange={(e) => setPostForm({ ...postForm, provider_name: e.target.value })}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:ring-2 ring-primary/20"
                    >
                      <option value="">未指定</option>
                      {PROVIDERS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </section>
                </div>

                {/* Overall rating */}
                <section>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-3">
                    总体评分（自动计算）
                  </label>
                  <div className="flex items-center gap-3">
                    <span className="text-3xl font-black text-primary font-display">{postForm.rating_overall}</span>
                    <div className="flex gap-1 pointer-events-none opacity-80">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${i <= Math.round(postForm.rating_overall) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                        />
                      ))}
                    </div>
                  </div>
                </section>

                {/* Dimension ratings */}
                <section>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">
                    维度评分 (点击星星进行评分)
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                    {ratingDims.map(({ key, label }) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{label}</span>
                          <span className="text-xs font-black text-primary">{postForm[key]}</span>
                        </div>
                        <StarSelector
                          value={postForm[key] as number}
                          onChange={(v) => setPostForm({ ...postForm, [key]: v })}
                        />
                      </div>
                    ))}
                  </div>
                </section>

                {/* Pros/Cons */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <section>
                    <label className="block text-xs font-black uppercase tracking-widest text-emerald-500 mb-2 flex items-center gap-1">
                      <Plus className="w-4 h-4" /> 优点（≤200字）
                    </label>
                    <textarea
                      value={postForm.pros}
                      onChange={(e) => setPostForm({ ...postForm, pros: e.target.value.slice(0, 200) })}
                      placeholder="值得推荐的地方..."
                      className="w-full h-28 px-4 py-3 bg-emerald-50 border border-emerald-100 rounded-xl text-sm text-slate-900 focus:ring-2 ring-emerald-500/20 resize-none placeholder:text-emerald-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 text-right">{postForm.pros.length}/200</p>
                  </section>
                  <section>
                    <label className="block text-xs font-black uppercase tracking-widest text-rose-500 mb-2 flex items-center gap-1">
                      <div className="w-4 h-4 flex items-center justify-center font-bold bg-rose-100 dark:bg-rose-900/30 rounded-full text-[10px]">-</div> 缺点（≤200字）
                    </label>
                    <textarea
                      value={postForm.cons}
                      onChange={(e) => setPostForm({ ...postForm, cons: e.target.value.slice(0, 200) })}
                      placeholder="待改进地方..."
                      className="w-full h-28 px-4 py-3 bg-rose-50 border border-rose-100 rounded-xl text-sm text-slate-900 focus:ring-2 ring-rose-500/20 resize-none placeholder:text-rose-400"
                    />
                    <p className="text-[10px] text-slate-400 mt-1 text-right">{postForm.cons.length}/200</p>
                  </section>
                </div>

                {/* Comment */}
                <section>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">
                    详细评价（≤800字，可选）
                  </label>
                  <textarea
                    value={postForm.comment}
                    onChange={(e) => setPostForm({ ...postForm, comment: e.target.value.slice(0, 800) })}
                    placeholder="分享您的使用体验..."
                    className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-2 ring-primary/20 resize-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 text-right">{postForm.comment.length}/800</p>
                </section>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting || !postForm.series_id}
                    className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {submitting
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> 发布中...</>
                      : '发布点评（同一系列/型号再次提交将更新）'
                    }
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Search & Action Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
        <div className="relative w-full md:w-2/3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="搜索模型评测、使用心得或开发者讨论..."
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-2 ring-primary/20 transition-all text-sm text-slate-900 placeholder:text-slate-400"
          />
        </div>
        {user ? (
          <Link
            to="/review/new"
            className="w-full md:w-auto px-8 py-3.5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> 发表点评
          </Link>
        ) : (
          <Link
            to="/login"
            className="w-full md:w-auto px-8 py-3.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5" /> 登录后发评
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 space-y-10">
          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" /> 排序方式
            </h3>
            <div className="space-y-2">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setSortBy(opt)}
                  className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-black transition-all uppercase tracking-tight ${
                    sortBy === opt
                      ? 'bg-primary text-white shadow-lg shadow-primary/20'
                      : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> 数据来源
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              评价数据由用户真实提交，每位用户对同一模型仅保留最新评价（UPSERT）。
            </p>
          </section>
        </aside>

        {/* Reviews Feed */}
        <div className="lg:col-span-3 space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-24 text-slate-400">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-bold">暂无评价，成为第一个发表点评的人吧！</p>
            </div>
          ) : (
            posts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <img
                      src={post.avatar}
                      alt={post.user}
                      className="w-14 h-14 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm"
                    />
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-lg font-black text-slate-900 dark:text-white">{post.user}</span>
                        {post.level && (
                          <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-black rounded-lg uppercase tracking-tighter">
                            {post.level}
                          </span>
                        )}
                        {post.sourcePlatform && (
                          <span className="px-2.5 py-1 bg-rose-50 text-rose-500 dark:bg-rose-900/20 dark:text-rose-400 text-[10px] font-black rounded-lg">
                            来自{SOURCE_PLATFORM_LABELS[post.sourcePlatform] ?? post.sourcePlatform}
                          </span>
                        )}
                        {post.providerName && (
                          <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-black rounded-lg">
                            via {post.providerName}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-black text-slate-400 mt-1 uppercase tracking-widest">
                        {post.time} · 评测了 {post.seriesName}
                        {post.modelId ? (
                          <>
                            {' '}·{' '}
                            <Link to={`/model/${post.modelId}`} className="text-primary hover:underline">
                              {post.modelName}
                            </Link>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <button className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>

                {/* Overall rating */}
                <div className="flex items-center gap-2 mb-6">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${i <= post.ratingOverall ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`}
                    />
                  ))}
                  <span className="text-sm font-black text-slate-900 dark:text-white ml-2 font-display">
                    {post.ratingOverall}.0
                  </span>
                </div>

                {/* Dimension ratings */}
                {(post.ratingQuality || post.ratingPrice || post.ratingLatency || post.ratingThroughput || post.ratingStability) && (
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 mb-8 bg-slate-50/50 dark:bg-slate-800/30 p-5 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                    {[
                      { label: '质量', val: post.ratingQuality },
                      { label: '性价比', val: post.ratingPrice },
                      { label: '延迟', val: post.ratingLatency },
                      { label: '吞吐', val: post.ratingThroughput },
                      { label: '稳定性', val: post.ratingStability },
                    ].filter(({ val }) => val != null).map(({ label, val }) => (
                      <div key={label}>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                        <div className="flex items-center gap-1">
                          <span className="text-base font-black text-slate-900 dark:text-white font-display">{val}</span>
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Comment */}
                {post.comment && (
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                    {post.comment}
                  </p>
                )}

                {/* Pros / Cons */}
                {(post.pros || post.cons) && (
                  <div className="flex flex-wrap gap-3 mb-8">
                    {post.pros && (
                      <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-black rounded-full border border-emerald-100 dark:border-emerald-800">
                        + {post.pros}
                      </span>
                    )}
                    {post.cons && (
                      <span className="px-4 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[11px] font-black rounded-full border border-rose-100 dark:border-rose-800">
                        − {post.cons}
                      </span>
                    )}
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex gap-6">
                    {/* Up */}
                    <button
                      onClick={() => handleReact(post.id, 'up')}
                      disabled={!user}
                      className={`flex items-center gap-2 text-xs font-black transition-all disabled:cursor-not-allowed ${
                        post.myReaction === 'up' ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${post.myReaction === 'up' ? 'fill-emerald-500' : ''}`} />
                      {post.upCount}
                    </button>
                    {/* Down */}
                    <button
                      onClick={() => handleReact(post.id, 'down')}
                      disabled={!user}
                      className={`flex items-center gap-2 text-xs font-black transition-all disabled:cursor-not-allowed ${
                        post.myReaction === 'down' ? 'text-rose-500' : 'text-slate-400 hover:text-rose-500'
                      }`}
                    >
                      <ThumbsDown className={`w-4 h-4 ${post.myReaction === 'down' ? 'fill-rose-500' : ''}`} />
                      {post.downCount}
                    </button>
                    {/* Reply */}
                    <button
                      onClick={() => setActiveReplyId(activeReplyId === post.id ? null : post.id)}
                      className={`flex items-center gap-2 text-xs font-black transition-all ${
                        activeReplyId === post.id ? 'text-primary' : 'text-slate-400 hover:text-primary'
                      }`}
                    >
                      <MessageCircle className="w-4 h-4" /> 回复
                    </button>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={handleShare}
                      className="flex items-center gap-2 text-xs font-black text-slate-400 hover:text-primary transition-all"
                    >
                      <Share2 className="w-4 h-4" /> 分享
                    </button>
                    {user && post.userId === user.id && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="flex items-center gap-2 text-xs font-black text-rose-400 hover:text-rose-600 transition-all"
                      >
                        <Trash2 className="w-4 h-4" /> 删除
                      </button>
                    )}
                  </div>
                </div>

                {/* Reply area */}
                <AnimatePresence>
                  {activeReplyId === post.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
                        {user ? (
                          <div className="flex gap-4">
                            <input
                              type="text"
                              value={newReply}
                              onChange={(e) => setNewReply(e.target.value.slice(0, 300))}
                              placeholder="写下您的回复（≤300字）..."
                              className="flex-1 px-6 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:ring-4 ring-primary/10 font-medium"
                              onKeyDown={(e) => e.key === 'Enter' && handleSubmitReply(post.id)}
                            />
                            <button
                              onClick={() => handleSubmitReply(post.id)}
                              disabled={!newReply.trim()}
                              className="p-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                            >
                              <Send className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <Link to="/login" className="flex items-center gap-2 text-sm text-primary font-bold hover:underline">
                            <LogIn className="w-4 h-4" /> 登录后参与讨论
                          </Link>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
