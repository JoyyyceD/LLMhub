import React from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  ThumbsUp, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Star,
  Plus,
  Filter,
  ArrowUpRight
} from 'lucide-react';

const REVIEWS_DATA = [
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
    replies: 14
  }
];

export const Community = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <button className="w-full md:w-auto px-8 py-3.5 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> 发表点评
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-8">
          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">排序方式</h3>
            <div className="space-y-2">
              {['最新发布', '最多点赞', '最高评分', '争议最大'].map((item, i) => (
                <button key={item} className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  i === 0 ? 'bg-primary/10 text-primary' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}>
                  {item}
                </button>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-4">模型筛选</h3>
            <div className="space-y-3">
              {['DeepSeek 系列', '通义千问 Qwen', '智谱 GLM', 'OpenAI GPT'].map((item) => (
                <label key={item} className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-primary focus:ring-primary" />
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-primary transition-colors">{item}</span>
                </label>
              ))}
            </div>
          </section>
        </aside>

        {/* Reviews Feed */}
        <div className="lg:col-span-3 space-y-6">
          {REVIEWS_DATA.map((review) => (
            <motion.div 
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <img src={review.avatar} alt={review.user} className="w-12 h-12 rounded-full border border-slate-100 dark:border-slate-800" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">{review.user}</span>
                      <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[10px] font-black rounded uppercase">{review.level}</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">{review.time} · 评测了 <span className="text-primary font-bold">{review.model}</span></p>
                  </div>
                </div>
                <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-1.5 mb-4">
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className={`w-4 h-4 ${i <= Math.floor(review.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                  ))}
                </div>
                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-2">{review.rating.toFixed(1)}</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">性价比</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{review.scores.value.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">代码能力</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{review.scores.code.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">逻辑推理</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{review.scores.logic.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">稳定性</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{review.scores.stability.toFixed(1)}</p>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-6">
                {review.content}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {review.pros.map(pro => (
                  <span key={pro} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-100 dark:border-emerald-800">
                    + {pro}
                  </span>
                ))}
                {review.cons.map(con => (
                  <span key={con} className="px-3 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-full border border-rose-100 dark:border-rose-800">
                    - {con}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="flex gap-6">
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors">
                    <ThumbsUp className="w-4 h-4" /> {review.likes}
                  </button>
                  <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors">
                    <MessageCircle className="w-4 h-4" /> {review.replies}
                  </button>
                </div>
                <button className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-primary transition-colors">
                  <Share2 className="w-4 h-4" /> 分享
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

