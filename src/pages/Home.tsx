import React, { useState } from 'react';
import { motion } from 'motion/react';
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
  Verified
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero & Filters Section */}
      <section className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 mb-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">为您的业务寻找最强 LLM</h1>
          <p className="text-slate-500 dark:text-slate-400">基于 4 个核心维度，快速匹配最适合您的模型方案。</p>
        </div>

        {/* 1. Scenario Selection */}
        <div className="mb-10">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-5 flex items-center gap-2">
            <Star className="w-4 h-4" /> 1. 主场景选择
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario.id)}
                className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all group ${
                  selectedScenario === scenario.id
                    ? 'border-2 border-primary bg-primary/5 text-primary'
                    : 'border-slate-200 dark:border-slate-800 hover:border-primary/50'
                }`}
              >
                <scenario.icon className={`w-8 h-8 mb-2 ${
                  selectedScenario === scenario.id ? 'text-primary' : 'text-slate-400 group-hover:text-primary'
                }`} />
                <span className={`text-sm ${selectedScenario === scenario.id ? 'font-bold' : 'font-medium'}`}>
                  {scenario.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2-4. Other Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" /> 2. 地区可用性
            </h2>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button className="flex-1 py-1.5 text-sm font-medium bg-white dark:bg-slate-700 shadow-sm rounded-md">中国大陆直连</button>
              <button className="flex-1 py-1.5 text-sm font-medium text-slate-500">海外可用</button>
            </div>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> 3. 预算偏好
            </h2>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button className="flex-1 py-1.5 text-sm font-medium text-slate-500">省钱优先</button>
              <button className="flex-1 py-1.5 text-sm font-medium bg-white dark:bg-slate-700 shadow-sm rounded-md">性能均衡</button>
              <button className="flex-1 py-1.5 text-sm font-medium text-slate-500">质量优先</button>
            </div>
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" /> 4. 速度偏好
            </h2>
            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              <button className="flex-1 py-1.5 text-sm font-medium text-slate-500">低延迟</button>
              <button className="flex-1 py-1.5 text-sm font-medium bg-white dark:bg-slate-700 shadow-sm rounded-md">高吞吐</button>
              <button className="flex-1 py-1.5 text-sm font-medium text-slate-500">均衡</button>
            </div>
          </div>
        </div>
      </section>

      {/* Sub-scenario Tags */}
      <section className="mb-8">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 custom-scrollbar">
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 whitespace-nowrap uppercase tracking-widest">代码助手细分:</span>
          <button className="px-5 py-1.5 bg-primary text-white rounded-full text-sm font-medium whitespace-nowrap shadow-sm">代码生成</button>
          <button className="px-5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium whitespace-nowrap hover:border-primary transition-colors">Bug 纠错</button>
          <button className="px-5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium whitespace-nowrap hover:border-primary transition-colors">代码重构</button>
          <button className="px-5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium whitespace-nowrap hover:border-primary transition-colors">SQL 查询</button>
          <button className="px-5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-sm font-medium whitespace-nowrap hover:border-primary transition-colors">单元测试</button>
        </div>
      </section>

      {/* Advanced Filters */}
      <section className="mb-8">
        <button className="flex items-center gap-2 text-sm font-bold text-primary group">
          <span className="material-symbols-outlined text-lg">tune</span>
          <span>高级筛选与约束</span>
          <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
        </button>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-6 p-5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800">
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">输入类型支持</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                <input type="checkbox" checked className="rounded text-primary border-slate-300 dark:border-slate-700 focus:ring-primary" /> PDF/文档
              </label>
              <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                <input type="checkbox" className="rounded text-primary border-slate-300 dark:border-slate-700 focus:ring-primary" /> 图像
              </label>
            </div>
          </div>
          <div className="md:col-span-2 space-y-3">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">上下文长度: <span className="text-primary font-bold">128k Tokens</span></label>
            <input type="range" className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-primary" />
            <div className="flex justify-between text-[10px] text-slate-400 uppercase font-bold">
              <span>4k</span>
              <span>32k</span>
              <span>128k</span>
              <span>1M+</span>
            </div>
          </div>
          <div className="space-y-3">
            <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">隐私合规</label>
            <div className="flex items-center gap-3">
              <div className="w-10 h-5 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-0.5 top-0.5 w-4 h-4 bg-white rounded-full"></div>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">数据零保留 API</span>
            </div>
          </div>
        </div>
      </section>

      {/* Recommended Models */}
      <section>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">推荐模型</h2>
            <p className="text-slate-500 text-sm mt-1">基于您的 <b>代码助手</b>, <b>大陆直连</b> 以及 <b>高吞吐</b> 偏好筛选。</p>
          </div>
          <button className="flex items-center gap-2 text-sm font-medium px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-primary transition-colors shadow-sm">
            <span className="material-symbols-outlined text-lg">sort</span> 按准确率排序
          </button>
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
