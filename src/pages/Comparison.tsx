import React from 'react';
import { motion } from 'motion/react';
import { 
  TrendingUp, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  List,
  Check,
  RefreshCcw
} from 'lucide-react';
import { MODELS } from '../constants';

export const Comparison = () => {
  return (
    <div className="max-w-[1600px] mx-auto px-6 py-8 flex gap-8">
      {/* Sidebar Filters */}
      <aside className="w-72 flex-shrink-0 flex flex-col gap-8 sticky top-24 h-fit">
        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">开源/闭源</h3>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="w-5 h-5 rounded border border-slate-300 dark:border-slate-700 flex items-center justify-center group-hover:border-primary transition-colors">
                <Check className="w-3 h-3 text-primary opacity-0 group-hover:opacity-100" />
              </div>
              <span className="text-sm font-medium">开源模型</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="w-5 h-5 rounded border border-primary bg-primary/10 flex items-center justify-center">
                <Check className="w-3 h-3 text-primary" />
              </div>
              <span className="text-sm font-medium">闭源模型</span>
            </label>
          </div>
        </section>

        <section>
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">厂商选择</h3>
          <div className="space-y-3">
            {[
              { label: '国内大厂', desc: '阿里, 腾讯, 百度等' },
              { label: '新锐创业公司', desc: 'DeepSeek, 智谱等' },
              { label: '国际巨头', desc: 'OpenAI, Google等' }
            ].map((vendor) => (
              <label key={vendor.label} className="flex items-center justify-between text-sm group cursor-pointer">
                <div className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded border-slate-300 text-primary focus:ring-primary" />
                  <span>{vendor.label}</span>
                </div>
                <span className="text-slate-400 text-xs text-right">{vendor.desc}</span>
              </label>
            ))}
          </div>
        </section>

        <div className="mt-auto pt-8 border-t border-slate-200 dark:border-slate-800">
          <button className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-3 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center justify-center gap-2">
            <RefreshCcw className="w-4 h-4" />
            重置所有筛选
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6">
        {/* Stats & Radar Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Top 3 模型多维度对比</h2>
                <p className="text-sm text-slate-500">综合能力雷达分布图</p>
              </div>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-primary"></span>
                  <span className="text-xs font-bold">GPT-4o</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold">DeepSeek-V3</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                  <span className="text-xs font-bold">Claude 3.5</span>
                </div>
              </div>
            </div>
            {/* Radar Mockup */}
            <div className="flex-1 min-h-[220px] flex items-center justify-center relative">
              <svg className="w-full h-full max-h-[250px]" viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg">
                <polygon className="text-slate-200 dark:text-slate-800" fill="none" points="200,30 350,110 350,220 200,280 50,220 50,110" stroke="currentColor" strokeWidth="1"></polygon>
                <polygon className="text-slate-200 dark:text-slate-800" fill="none" points="200,80 300,133 300,206 200,246 100,206 100,133" stroke="currentColor" strokeWidth="1"></polygon>
                <line className="text-slate-200 dark:text-slate-800" stroke="currentColor" strokeWidth="1" x1="200" x2="200" y1="30" y2="280"></line>
                <line className="text-slate-200 dark:text-slate-800" stroke="currentColor" strokeWidth="1" x1="350" x2="50" y1="110" y2="220"></line>
                <line className="text-slate-200 dark:text-slate-800" stroke="currentColor" strokeWidth="1" x1="350" x2="50" y1="220" y2="110"></line>
                <text className="text-[10px] font-bold fill-slate-400" textAnchor="middle" x="200" y="20">逻辑推理</text>
                <text className="text-[10px] font-bold fill-slate-400" textAnchor="start" x="365" y="110">代码能力</text>
                <text className="text-[10px] font-bold fill-slate-400" textAnchor="start" x="365" y="225">数学能力</text>
                <text className="text-[10px] font-bold fill-slate-400" textAnchor="middle" x="200" y="295">响应速度</text>
                <text className="text-[10px] font-bold fill-slate-400" textAnchor="end" x="35" y="225">创意写作</text>
                <text className="text-[10px] font-bold fill-slate-400" textAnchor="end" x="35" y="110">通用能力</text>
                <polygon fill="rgba(19, 127, 236, 0.2)" points="200,50 330,120 310,210 200,200 80,180 90,125" stroke="#137fec" strokeWidth="2"></polygon>
                <polygon fill="rgba(16, 185, 129, 0.2)" points="200,70 340,115 340,215 200,240 70,210 120,135" stroke="#10b981" strokeWidth="2"></polygon>
              </svg>
            </div>
          </div>

          <div className="bg-primary text-white rounded-2xl p-6 flex flex-col justify-between overflow-hidden relative">
            <div className="relative z-10">
              <p className="text-sm font-medium opacity-80">全网大模型平均性能</p>
              <h3 className="text-4xl font-bold mt-2">84.2<span className="text-lg font-medium opacity-60">/100</span></h3>
              <div className="mt-6 flex items-center gap-2 text-sm">
                <TrendingUp className="w-4 h-4 text-emerald-300" />
                <span className="font-bold">提升 5.2%</span>
                <span className="opacity-70">较上月</span>
              </div>
            </div>
            <div className="mt-8 relative z-10">
              <button className="w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm py-3 rounded-xl text-sm font-bold transition-colors">
                生成完整评测报告
              </button>
            </div>
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -mr-24 -mt-24 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-sky-400/20 rounded-full -ml-16 -mb-16 blur-2xl"></div>
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100">
              <List className="w-5 h-5 text-primary" />
              模型性能实时排名
            </h3>
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <Download className="w-4 h-4" />
                导出 CSV
              </button>
              <span className="text-xs text-slate-400 font-medium italic">更新于: 45分钟前</span>
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[11px] font-black uppercase tracking-widest text-slate-500 bg-slate-50 dark:bg-slate-800/50">
                  <th className="px-6 py-4 w-16">排名</th>
                  <th className="px-6 py-4 min-w-[200px]">模型名称</th>
                  <th className="px-6 py-4">厂商</th>
                  <th className="px-6 py-4 text-center">综合得分</th>
                  <th className="px-6 py-4 text-center">代码能力</th>
                  <th className="px-6 py-4 text-center">数学能力</th>
                  <th className="px-6 py-4 text-center">速度 (TPS)</th>
                  <th className="px-6 py-4 text-right">价格 (百万元)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {MODELS.map((model, idx) => (
                  <tr key={model.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                    <td className="px-6 py-5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border ${
                        idx === 0 
                          ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 border-amber-200' 
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200'
                      }`}>
                        {idx + 1}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-sm group-hover:text-primary transition-colors">{model.name}</span>
                        <span className="text-[10px] font-bold text-slate-400">发布于: {model.releaseDate}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{model.vendor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-center">
                      <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                        {model.benchmarks.mmlu.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-center text-sm font-medium">{model.benchmarks.humanEval.toFixed(1)}</td>
                    <td className="px-6 py-5 text-center text-sm font-medium">{model.benchmarks.gsm8k.toFixed(1)}</td>
                    <td className="px-6 py-5 text-center text-sm font-medium">{model.performance.throughput}</td>
                    <td className="px-6 py-5 text-right font-mono text-xs font-bold text-slate-500">{model.pricing.input}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
