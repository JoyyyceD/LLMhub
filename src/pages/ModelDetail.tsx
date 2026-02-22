import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { 
  Verified, 
  Database, 
  Globe, 
  Star, 
  Rocket, 
  MessageSquareText, 
  FileText, 
  BarChart3, 
  Settings2, 
  CreditCard, 
  Network, 
  HelpCircle,
  ChevronRight,
  Home as HomeIcon,
  Terminal,
  Cpu,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { MODELS } from '../constants';

export const ModelDetail = () => {
  const { id } = useParams();
  const model = MODELS.find(m => m.id === id) || MODELS[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <HomeIcon className="w-4 h-4" /> 首页
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/leaderboard" className="hover:text-primary transition-colors">模型库</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 dark:text-white font-medium">{model.name}</span>
      </nav>

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
            <div className="text-white font-bold text-2xl">{model.name.substring(0, 2)}</div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{model.name}</h1>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  通用增强
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  代码/数学
                </span>
              </div>
            </div>
            <div className="flex items-center gap-5 text-slate-500 dark:text-slate-400 text-sm">
              <span className="flex items-center gap-1.5"><Verified className="w-4 h-4 text-blue-500" /> {model.vendor}</span>
              <span className="flex items-center gap-1.5"><Database className="w-4 h-4" /> {model.parameters || 'Dense'} Parameters</span>
              <span className="flex items-center gap-1.5"><Globe className="w-4 h-4" /> 多语言支持</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end gap-1 mr-2">
            <div className="flex items-center gap-1.5 text-amber-400">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} className={`w-4 h-4 ${i <= 4 ? 'fill-amber-400' : 'fill-amber-400/50'}`} />
                ))}
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white leading-none">4.8</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">1.2k+ 人已评价</span>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
              <Star className="w-5 h-5 text-primary" /> 点评
            </button>
            <button className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none">
              <Rocket className="w-5 h-5" /> 快速接入
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 mb-8">
        <nav className="flex gap-10">
          <button className="pb-4 px-1 border-b-2 border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-semibold text-[15px] transition-all">
            API 供应商
          </button>
          <button className="pb-4 px-1 border-b-2 border-primary text-primary font-bold text-[15px]">
            模型详情
          </button>
        </nav>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2.5">
              <Cpu className="w-6 h-6 text-primary" /> 模型简介
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-6">
                {model.description}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <Star className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <span className="block font-bold text-slate-900 dark:text-white mb-0.5">逻辑推理</span>
                    <span className="text-sm text-slate-500">在数学解题和复杂指令遵循方面表现卓越，MMLU 评分超过 {model.benchmarks.mmlu} 分。</span>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <Terminal className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <span className="block font-bold text-slate-900 dark:text-white mb-0.5">代码能力</span>
                    <span className="text-sm text-slate-500">针对多种编程语言进行了专项优化，HumanEval 成绩达到 {model.benchmarks.humanEval}。</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" /> 性能跑分 (Benchmarks)
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500">
                  <tr>
                    <th className="px-8 py-4 font-semibold">评估基准</th>
                    <th className="px-8 py-4 font-bold text-primary">{model.name}</th>
                    <th className="px-8 py-4 font-semibold">行业平均</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr>
                    <td className="px-8 py-5 font-medium">MMLU (五选一)</td>
                    <td className="px-8 py-5 font-bold text-primary">{model.benchmarks.mmlu}</td>
                    <td className="px-8 py-5">72.3</td>
                  </tr>
                  <tr>
                    <td className="px-8 py-5 font-medium">HumanEval (代码)</td>
                    <td className="px-8 py-5 font-bold text-primary">{model.benchmarks.humanEval}</td>
                    <td className="px-8 py-5">65.1</td>
                  </tr>
                  <tr>
                    <td className="px-8 py-5 font-medium">GSM8K (数学)</td>
                    <td className="px-8 py-5 font-bold text-primary">{model.benchmarks.gsm8k}</td>
                    <td className="px-8 py-5">78.4</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
              <CreditCard className="w-5 h-5 text-primary" /> 计费明细
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">输入 (Input)</span>
                <span className="font-bold text-slate-800 dark:text-white">{model.pricing.input} / 1M tokens</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">输出 (Output)</span>
                <span className="font-bold text-slate-800 dark:text-white">{model.pricing.output} / 1M tokens</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-950 dark:bg-indigo-900/40 text-white p-6 rounded-xl border border-indigo-900/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-indigo-300" />
              </div>
              <span className="font-bold text-sm">如何评价此模型？</span>
            </div>
            <p className="text-[12px] text-indigo-100/70 leading-relaxed mb-5">
              {model.name} 在多数基准测试中表现优异，特别是在涉及中文环境和代码生成的场景下表现更加稳定。
            </p>
            <button className="w-full flex items-center justify-center gap-2 text-xs bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg transition-all font-semibold">
              发表您的点评
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
