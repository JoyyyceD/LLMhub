import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Star,
  Plus,
  Filter,
  ArrowUpRight,
  X,
  Send,
  CheckCircle2
} from 'lucide-react';
import { MODELS } from '../constants';

const INITIAL_REVIEWS = [
  {
    id: '1',
    user: '架构师老王',
    avatar: 'https://picsum.photos/seed/user1/100/100',
    level: 'LV.4',
    time: '2小时前',
    model: 'DeepSeek-V3',
    rating: 4.5,
    content: '在最近的生产环境测试中，DeepSeek-V3 展现出了惊人的性价比。对于日常的代码辅助和基础逻辑处理，它几乎能达到 GPT-4 的 90% 以上水平，但在处理超过 32k 的长文本时，逻辑的一致性会有所下降。特别是在处理 Python 复杂嵌套逻辑时，表现非常出色。强烈推荐作为小型企业的首选基础模型。',
    scores: { value: 5.0, code: 4.5, logic: 4.2, stability: 3.8 },
    pros: ['API 响应极快', '开源可私有化', '推理成本极低'],
    cons: ['长文本偶发幻觉', '中文语义理解略逊于 GPT-4o'],
    likes: 128,
    isLiked: false,
    replies: [
      { id: 'r1', user: 'AI开发者', content: '确实，DeepSeek在代码生成上非常稳。', time: '1小时前' },
      { id: 'r2', user: '全栈工程师', content: '请问长文本幻觉具体表现在哪里？', time: '30分钟前' }
    ]
  }
];

export const Community = () => {
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState('');

  // Post Review Form State
  const [postForm, setPostForm] = useState<{
    model: string;
    rating: number;
    content: string;
    scores: Record<string, number>;
  }>({
    model: MODELS[0].name,
    rating: 5,
    content: '',
    scores: { value: 5, code: 5, logic: 5, stability: 5 }
  });

  const handleLike = (id: string) => {
    setReviews(prev => prev.map(review => {
      if (review.id === id) {
        return {
          ...review,
          likes: review.isLiked ? review.likes - 1 : review.likes + 1,
          isLiked: !review.isLiked
        };
      }
      return review;
    }));
  };

  const handleShare = () => {
    setShowShareToast(true);
    setTimeout(() => setShowShareToast(false), 2000);
  };

  const handlePostReview = (e: React.FormEvent) => {
    e.preventDefault();
    const newReview = {
      id: Date.now().toString(),
      user: '当前用户',
      avatar: 'https://picsum.photos/seed/me/100/100',
      level: 'LV.1',
      time: '刚刚',
      model: postForm.model,
      rating: postForm.rating,
      content: postForm.content,
      scores: postForm.scores,
      pros: ['新发布'],
      cons: [],
      likes: 0,
      isLiked: false,
      replies: []
    };
    setReviews([newReview, ...reviews]);
    setIsPostModalOpen(false);
    setPostForm({
      model: MODELS[0].name,
      rating: 5,
      content: '',
      scores: { value: 5, code: 5, logic: 5, stability: 5 }
    });
  };

  const handleAddComment = (reviewId: string) => {
    if (!newComment.trim()) return;
    setReviews(prev => prev.map(review => {
      if (review.id === reviewId) {
        return {
          ...review,
          replies: [...review.replies, {
            id: Date.now().toString(),
            user: '当前用户',
            content: newComment,
            time: '刚刚'
          }]
        };
      }
      return review;
    }));
    setNewComment('');
  };

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
              onClick={() => setIsPostModalOpen(false)}
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
                <button onClick={() => setIsPostModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handlePostReview} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <section>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">选择模型</label>
                    <select 
                      value={postForm.model}
                      onChange={(e) => setPostForm({...postForm, model: e.target.value})}
                      className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 ring-primary/20"
                    >
                      {MODELS.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}
                    </select>
                  </section>
                  <section>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">总体评分</label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map(i => (
                        <button 
                          key={i} 
                          type="button"
                          onClick={() => setPostForm({...postForm, rating: i})}
                          className="focus:outline-none"
                        >
                          <Star className={`w-6 h-6 ${i <= postForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                        </button>
                      ))}
                    </div>
                  </section>
                </div>

                <section>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">详细评价</label>
                  <textarea 
                    required
                    value={postForm.content}
                    onChange={(e) => setPostForm({...postForm, content: e.target.value})}
                    placeholder="分享您的使用心得、优缺点以及适用场景..."
                    className="w-full h-32 px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-sm focus:ring-2 ring-primary/20 resize-none"
                  />
                </section>

                <section>
                  <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-4">维度打分</label>
                  <div className="grid grid-cols-2 gap-6">
                    {Object.entries(postForm.scores).map(([key, val]) => {
                      const scoreVal = val as number;
                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{key === 'value' ? '性价比' : key === 'code' ? '代码能力' : key === 'logic' ? '逻辑推理' : '稳定性'}</span>
                            <span className="text-xs font-black text-primary">{scoreVal.toFixed(1)}</span>
                          </div>
                          <input 
                            type="range" min="1" max="5" step="0.1" 
                            value={scoreVal}
                            onChange={(e) => setPostForm({
                              ...postForm, 
                              scores: {...postForm.scores, [key]: parseFloat(e.target.value)}
                            })}
                            className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary"
                          />
                        </div>
                      );
                    })}
                  </div>
                </section>

                <div className="pt-4">
                  <button type="submit" className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all">
                    发布点评
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
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 ring-primary/20 transition-all text-sm"
          />
        </div>
        <button 
          onClick={() => setIsPostModalOpen(true)}
          className="w-full md:w-auto px-8 py-3.5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" /> 发表点评
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-10">
          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
              <Star className="w-4 h-4 text-primary" /> 排序方式
            </h3>
            <div className="space-y-2">
              {['最新发布', '最多点赞', '最高评分', '争议最大'].map((item, i) => (
                <button key={item} className={`w-full text-left px-5 py-3 rounded-2xl text-sm font-black transition-all uppercase tracking-tight ${
                  i === 0 ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700'
                }`}>
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> 模型筛选
            </h3>
            <div className="space-y-4 mb-6">
              {['DeepSeek 系列', '通义千问 Qwen', '智谱 GLM', 'OpenAI GPT'].map((item) => (
                <label key={item} className="flex items-center gap-4 cursor-pointer group p-1">
                  <input type="checkbox" className="w-5 h-5 rounded-lg border-slate-300 dark:border-slate-700 text-primary focus:ring-primary" onChange={() => {}} />
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">{item}</span>
                </label>
              ))}
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="搜索更多模型..." 
                className="w-full pl-11 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-xs focus:ring-4 ring-primary/10 transition-all font-bold"
              />
            </div>
          </section>
        </aside>

        {/* Reviews Feed */}
        <div className="lg:col-span-3 space-y-6">
          {reviews.map((review) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 p-10 shadow-xl shadow-slate-200/50 dark:shadow-none group hover:border-primary/30 transition-all"
            >
              <div className="flex justify-between items-start mb-8">
                <div className="flex items-center gap-5">
                  <img src={review.avatar} alt={review.user} className="w-14 h-14 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm" />
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-black text-slate-900 dark:text-white">{review.user}</span>
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-black rounded-lg uppercase tracking-tighter">{review.level}</span>
                    </div>
                    <p className="text-[11px] font-black text-slate-400 mt-1 uppercase tracking-widest">{review.time} · 评测了 <span className="text-primary">{review.model}</span></p>
                  </div>
                </div>
                <button className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2 mb-6">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`w-5 h-5 ${i <= Math.floor(review.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                  ))}
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white ml-2 font-display">{review.rating.toFixed(1)}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8 bg-slate-50/50 dark:bg-slate-800/30 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">性价比</p>
                  <p className="text-base font-black text-slate-900 dark:text-white font-display">{review.scores.value.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">代码能力</p>
                  <p className="text-base font-black text-slate-900 dark:text-white font-display">{review.scores.code.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">逻辑推理</p>
                  <p className="text-base font-black text-slate-900 dark:text-white font-display">{review.scores.logic.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">稳定性</p>
                  <p className="text-base font-black text-slate-900 dark:text-white font-display">{review.scores.stability.toFixed(1)}</p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6 font-medium">
                {review.content}
              </p>

              <div className="flex flex-wrap gap-3 mb-8">
                {review.pros.map(pro => (
                  <span key={pro} className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black rounded-full border border-emerald-100 dark:border-emerald-800 uppercase tracking-tight">
                    + {pro}
                  </span>
                ))}
                {review.cons.map(con => (
                  <span key={con} className="px-4 py-1.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-black rounded-full border border-rose-100 dark:border-rose-800 uppercase tracking-tight">
                    - {con}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-8 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-8">
                  <button 
                    onClick={() => handleLike(review.id)}
                    className={`flex items-center gap-2.5 text-xs font-black transition-all ${review.isLiked ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${review.isLiked ? 'fill-primary' : ''}`} /> {review.likes}
                  </button>
                  <button 
                    onClick={() => setActiveCommentId(activeCommentId === review.id ? null : review.id)}
                    className={`flex items-center gap-2.5 text-xs font-black transition-all ${activeCommentId === review.id ? 'text-primary' : 'text-slate-400 hover:text-primary'}`}
                  >
                    <MessageCircle className="w-4 h-4" /> {review.replies.length}
                  </button>
                </div>
                <button 
                  onClick={handleShare}
                  className="flex items-center gap-2.5 text-xs font-black text-slate-400 hover:text-primary transition-all"
                >
                  <Share2 className="w-4 h-4" /> 分享
                </button>
              </div>

              {/* Comments Section */}
              <AnimatePresence>
                {activeCommentId === review.id && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 space-y-6">
                      {review.replies.map(reply => (
                        <div key={reply.id} className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex-shrink-0 flex items-center justify-center text-sm font-black text-slate-400">
                            {reply.user[0]}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <span className="text-sm font-black text-slate-900 dark:text-white">{reply.user}</span>
                              <span className="text-[10px] font-bold text-slate-400">{reply.time}</span>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                      <div className="flex gap-4 mt-8">
                        <input 
                          type="text" 
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="写下您的评论..."
                          className="flex-1 px-6 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-4 ring-primary/10 font-medium"
                          onKeyDown={(e) => e.key === 'Enter' && handleAddComment(review.id)}
                        />
                        <button 
                          onClick={() => handleAddComment(review.id)}
                          className="p-3 bg-primary text-white rounded-2xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                        >
                          <Send className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

