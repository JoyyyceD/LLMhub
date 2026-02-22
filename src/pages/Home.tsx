import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Terminal, 
  MessageSquare, 
  Calculator, 
  Edit3, 
  Database, 
  Bot, 
  Image as ImageIcon, 
  Languages,
  Globe,
  CreditCard,
  Zap,
  ChevronDown,
  Star,
  ArrowRightLeft,
  Verified,
  Rocket,
  BarChart3,
  ArrowUpDown
} from 'lucide-react';
import { MODELS } from '../constants';
import { Link } from 'react-router-dom';

const SCENARIOS = [
  { id: 'chat', name: '通用对话', icon: MessageSquare },
  { id: 'code', name: '代码助手', icon: Terminal, active: true },
  { id: 'math', name: '数学推理', icon: Calculator },
  { id: 'copy', name: '文案创作', icon: Edit3 },
  { id: 'rag', name: '长文档 RAG', icon: Database },
  { id: 'agent', name: '智能体 Agent', icon: Bot },
  { id: 'multimodal', name: '多模态', icon: ImageIcon },
  { id: 'translate', name: '翻译', icon: Languages },
];

export const Home = () => {
  const [selectedScenario, setSelectedScenario] = useState('code');
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero & Filters Section */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-10 mb-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">为您的业务寻找最强 LLM</h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">基于 4 个核心维度，快速匹配最适合您的模型方案。</p>
        </div>

        {/* 1. Scenario Selection */}
        <div className="mb-12">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
            <Star className="w-4 h-4" /> 1. 主场景选择
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all group h-32 ${
                  selectedScenario === scenario.id
                    ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10'
                    : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/30'
                }`}
              >
                <scenario.icon className={`w-10 h-10 mb-3 transition-colors ${
                  selectedScenario === scenario.id ? 'text-primary' : 'text-slate-300 group-hover:text-primary/50'
                }`} />
                <span className={`text-xs ${selectedScenario === scenario.id ? 'font-black' : 'font-bold text-slate-500'}`}>
                  {scenario.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2-4. Other Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" /> 2. 地区可用性
            </h2>
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button className="flex-1 py-2.5 text-sm font-bold bg-white dark:bg-slate-700 shadow-sm rounded-xl text-slate-900 dark:text-white">中国大陆直连</button>
              <button className="flex-1 py-2.5 text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">海外可用</button>
            </div>
          </div>
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> 3. 预算偏好
            </h2>
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button className="flex-1 py-2.5 text-sm font-bold text-slate-400">省钱优先</button>
              <button className="flex-1 py-2.5 text-sm font-bold bg-white dark:bg-slate-700 shadow-sm rounded-xl text-slate-900 dark:text-white">性能均衡</button>
              <button className="flex-1 py-2.5 text-sm font-bold text-slate-400">质量优先</button>
            </div>
          </div>
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" /> 4. 速度偏好
            </h2>
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button className="flex-1 py-2.5 text-sm font-bold text-slate-400">低延迟</button>
              <button className="flex-1 py-2.5 text-sm font-bold bg-white dark:bg-slate-700 shadow-sm rounded-xl text-slate-900 dark:text-white">高吞吐</button>
              <button className="flex-1 py-2.5 text-sm font-bold text-slate-400">均衡</button>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-scenario Tags & Action */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 custom-scrollbar w-full md:w-auto">
            <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 whitespace-nowrap uppercase tracking-widest">代码助手细分:</span>
            <button className="px-6 py-2 bg-primary text-white rounded-full text-xs font-bold whitespace-nowrap shadow-lg shadow-primary/20">代码生成</button>
            <button className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-xs font-bold whitespace-nowrap hover:border-primary transition-all">Bug 纠错</button>
            <button className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-xs font-bold whitespace-nowrap hover:border-primary transition-all">代码重构</button>
            <button className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-xs font-bold whitespace-nowrap hover:border-primary transition-all">SQL 查询</button>
            <button className="px-6 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 rounded-full text-xs font-bold whitespace-nowrap hover:border-primary transition-all">单元测试</button>
          </div>
          <button className="w-full md:w-auto bg-gradient-to-r from-primary to-indigo-600 text-white px-12 py-3 rounded-full font-black text-sm shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 ring-4 ring-primary/10">
            <Rocket className="w-5 h-5" /> 一键推荐最优模型
          </button>
        </div>
      </section>

      {/* Advanced Filters Toggle */}
      <section className="mb-12">
        <button 
          onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
          className="flex items-center gap-2 text-xs font-black text-primary group uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-lg">tune</span>
          <span>高级筛选与约束</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isAdvancedExpanded ? 'rotate-180' : ''}`} />
        </button>
        
        <AnimatePresence>
          {isAdvancedExpanded && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-8 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">输入类型支持</label>
                  <div className="flex flex-wrap gap-6">
                    <label className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer group">
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary" /> 
                      <span className="group-hover:text-primary transition-colors">PDF/文档</span>
                    </label>
                    <label className="flex items-center gap-3 text-sm font-bold text-slate-600 dark:text-slate-400 cursor-pointer group">
                      <input type="checkbox" className="w-5 h-5 rounded border-slate-300 dark:border-slate-700 text-primary focus:ring-primary" /> 
                      <span className="group-hover:text-primary transition-colors">图像</span>
                    </label>
                  </div>
                </div>
                <div className="md:col-span-2 space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">上下文长度: <span className="text-primary font-black">128k Tokens</span></label>
                  <input type="range" className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-primary" />
                  <div className="flex justify-between text-[9px] text-slate-400 uppercase font-black tracking-tighter">
                    <span>4k</span>
                    <span>32k</span>
                    <span>128k</span>
                    <span>1M+</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">隐私合规</label>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">数据零保留 API</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Recommended Models */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">推荐模型</h2>
            <p className="text-slate-500 text-sm mt-1">基于您的 <b>代码助手</b>, <b>大陆直连</b> 以及 <b>高吞吐</b> 偏好筛选。</p>
          </div>
          <div className="flex gap-3">
            <Link 
              to="/compare"
              state={{ selectedModelIds: MODELS.slice(0, 4).map(m => m.id) }}
              className="flex items-center gap-2 text-sm font-bold px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary hover:text-primary transition-all shadow-sm text-slate-600 dark:text-slate-300"
            >
              <BarChart3 className="w-4 h-4" /> 性能对比
            </Link>
            <button className="flex items-center gap-2 text-sm font-bold px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary hover:text-primary transition-all shadow-sm text-slate-600 dark:text-slate-300">
              <ArrowUpDown className="w-4 h-4" /> 按准确率排序
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {MODELS.slice(0, 4).map((model, idx) => (
            <motion.div
              key={model.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative group bg-white dark:bg-slate-900 border-2 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all ${
                idx === 0 ? 'border-primary' : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {idx === 0 && (
                <div className="absolute top-0 right-0 bg-primary text-white text-[11px] font-black uppercase px-4 py-1.5 rounded-bl-xl tracking-widest flex items-center gap-1">
                  <Star className="w-3 h-3 fill-white" /> 最优匹配
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                    idx % 2 === 0 ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600'
                  }`}>
                    {idx % 2 === 0 ? <Terminal className="w-8 h-8" /> : <Bot className="w-8 h-8" />}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      {model.name}
                    </h3>
                    <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1">
                      {model.vendor} {model.verified && <Verified className="w-3.5 h-3.5 text-green-500" />}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 py-5 border-y border-slate-100 dark:border-slate-800 mb-5">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1">价格 (每百万 Token)</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-display">{model.pricing.input} / {model.pricing.output}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1">首字延迟 (TTFT)</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-display">{model.performance.latency}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-black mb-1">吞吐量</p>
                    <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-display">{model.performance.throughput}</p>
                  </div>
                </div>

                <div className="mb-5">
                  <div className="flex flex-wrap gap-2">
                    {model.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[11px] font-bold rounded uppercase">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {model.recommendationReason && (
                  <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/10 mb-6">
                    <div className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1.5 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-primary" /> 推荐理由
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {model.recommendationReason}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Link 
                    to={`/model/${model.id}`}
                    className={`flex-1 flex items-center justify-center font-bold py-2.5 rounded-lg text-sm transition-all ${
                      idx === 0 
                        ? 'bg-primary text-white hover:shadow-lg hover:shadow-primary/20' 
                        : 'bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:opacity-90'
                    }`}
                  >
                    立即接入
                  </Link>
                  <button className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <ArrowRightLeft className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
