import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { 
  BookOpen, 
  Activity, 
  FileCode, 
  ChevronRight, 
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock
} from 'lucide-react';

export const Resources = () => {
  const { hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.getElementById(hash.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [hash]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">开发者资源中心</h1>
        <p className="text-slate-500 max-w-2xl mx-auto">
          为开发者提供最全面的模型接入指南、实时状态监控以及行业评测标准。
        </p>
      </div>

      <div className="space-y-20">
        {/* Industry Benchmarks */}
        <section id="benchmarks" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
              <BookOpen className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">行业评测基准</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'MMLU', desc: '大规模多任务语言理解，衡量模型在 57 个学科上的综合知识。', score: '行业标准' },
              { name: 'HumanEval', desc: '由 OpenAI 发布，专门用于衡量模型生成 Python 代码的能力。', score: '代码核心' },
              { name: 'GSM8K', desc: '包含 8.5k 高质量小学数学应用题，测试模型的多步推理能力。', score: '逻辑基石' },
            ].map((item, i) => (
              <div key={i} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all">
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/5 px-2 py-1 rounded mb-4 inline-block">{item.score}</span>
                <h4 className="text-lg font-bold mb-2">{item.name}</h4>
                <p className="text-sm text-slate-500 leading-relaxed mb-4">{item.desc}</p>
                <button className="text-xs font-bold text-primary flex items-center gap-1 hover:gap-2 transition-all">
                  查看详细标准 <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* API Status */}
        <section id="status" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
              <Activity className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">厂商 API 状态</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500">实时监控 (每 60s 更新)</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-emerald-500 uppercase">所有服务正常</span>
              </div>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {[
                { vendor: 'DeepSeek', status: 'Operational', latency: '120ms', uptime: '99.98%' },
                { vendor: 'Alibaba Cloud (Qwen)', status: 'Operational', latency: '150ms', uptime: '99.95%' },
                { vendor: 'Zhipu AI', status: 'Operational', latency: '180ms', uptime: '99.90%' },
                { vendor: 'OpenAI', status: 'Degraded', latency: '450ms', uptime: '98.50%' },
              ].map((item, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="font-bold text-sm">{item.vendor}</span>
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded uppercase ${
                      item.status === 'Operational' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="flex gap-8 text-xs font-bold">
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <Clock className="w-3 h-3" /> {item.latency}
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-400">
                      <CheckCircle2 className="w-3 h-3" /> {item.uptime}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Documentation */}
        <section id="docs" className="scroll-mt-24">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600">
              <FileCode className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">接入文档指南</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-slate-900 rounded-3xl p-8 text-white">
              <div className="flex justify-between items-center mb-6">
                <h4 className="font-bold">快速开始 (Python)</h4>
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
              </div>
              <pre className="font-mono text-sm text-slate-300 leading-relaxed overflow-x-auto">
{`import openai

client = openai.OpenAI(
    base_url="https://api.deepseek.com",
    api_key="YOUR_API_KEY"
)

response = client.chat.completions.create(
    model="deepseek-chat",
    messages=[
        {"role": "system", "content": "You are a helpful assistant"},
        {"role": "user", "content": "Hello!"},
    ],
    stream=False
)

print(response.choices[0].message.content)`}
              </pre>
            </div>
            <div className="space-y-4">
              {[
                { title: 'API 认证流程', desc: '了解如何获取 API Key 以及如何安全地在您的应用中使用它。' },
                { title: '流式输出处理', desc: '学习如何处理 Server-Sent Events (SSE) 以实现打字机效果。' },
                { title: '错误码对照表', desc: '详细列出了各厂商常见的错误代码及其解决方案。' },
                { title: '多模态接入', desc: '集成视觉、语音等能力的详细参数说明与示例代码。' },
              ].map((item, i) => (
                <div key={i} className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-between group hover:border-primary transition-all cursor-pointer">
                  <div>
                    <h5 className="font-bold text-sm mb-1 group-hover:text-primary transition-colors">{item.title}</h5>
                    <p className="text-xs text-slate-500">{item.desc}</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-slate-300 group-hover:text-primary transition-all" />
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
