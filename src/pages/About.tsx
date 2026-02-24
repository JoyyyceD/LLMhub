import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { Link, useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  Mail, 
  BookOpen,
  Database,
  Target,
  CheckCircle2, 
  ArrowRight,
  Globe,
  ExternalLink,
} from 'lucide-react';

export const About = () => {
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
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">关于 Token Galaxy</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          我们把公开评测数据做中文化、结构化整理，帮助团队更快完成模型选型。核心目标是可追溯、可解释、可复核。
        </p>
      </motion.div>

      <div className="space-y-24">
        {/* Positioning */}
        <section id="positioning" className="scroll-mt-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">我们的定位</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-4">
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              我们不是模型官方发布方，而是面向中文用户的公开数据整理与决策辅助平台。平台展示的指标、排序和推荐，用于缩短筛选时间，不等同于你在线上业务中的最终效果。
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              平台核心数据来源于 <a href="https://artificialanalysis.ai/" target="_blank" rel="noreferrer" className="text-primary hover:underline">Artificial Analysis</a> 的公开页面与方法文档，我们在引用基础上做中文化解释和字段映射。
            </p>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              截至 2026 年 2 月 24 日，关于方法口径的核心参考来自 Artificial Analysis 的公开方法页和 Intelligence Benchmarking 页面。我们在保留来源的前提下做中文解释与产品化呈现。
            </p>
          </div>
        </section>

        {/* Evaluation Logic */}
        <section id="evaluation" className="scroll-mt-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <BookOpen className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">方法学摘要</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              我们在中文页面中沿用公开方法学的关键原则：统一测试参数、尽量降低偏差、零样本指令评测、方法透明披露。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: '统一定义', desc: '区分 Model、Model Creator、Provider、Endpoint，并将 TTFT、TPS、Blended Price 等指标口径统一。', icon: CheckCircle2 },
                { title: '端到端性能', desc: '性能指标以用户实际调用体验为目标，不等同于某一硬件平台的理论峰值吞吐。', icon: Globe },
                { title: '综合智力指数', desc: 'Intelligence Index 由多个评测维度组合而成，可用于横向比较，但不能替代业务实测。', icon: CheckCircle2 },
                { title: '版本可追溯', desc: '页面中明确标注口径版本与更新时间，避免“不同版本分数直接比较”的误用。', icon: CheckCircle2 },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="mt-1">
                    <item.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-1">{item.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                ))}
              </div>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/about/methodology"
                className="flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span className="font-bold text-slate-800 dark:text-slate-100">查看完整方法学说明</span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </Link>
              <Link
                to="/about/data-sources"
                className="flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all"
              >
                <span className="font-bold text-slate-800 dark:text-slate-100">查看数据来源与更新机制</span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </Link>
              <Link
                to="/about/data-sources/intelligence-benchmarking"
                className="flex items-center justify-between px-5 py-4 rounded-2xl border border-slate-200 hover:border-primary hover:bg-primary/5 transition-all md:col-span-2"
              >
                <span className="font-bold text-slate-800 dark:text-slate-100">人工智能分析基准测试方法（细化文档）</span>
                <ArrowRight className="w-4 h-4 text-primary" />
              </Link>
            </div>
            <div className="mt-8 text-xs text-slate-500 space-y-2">
              <p className="font-bold text-slate-700 dark:text-slate-300">核心数据计算方法与来源链接</p>
              <a
                href="https://artificialanalysis.ai/methodology"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary"
              >
                Artificial Analysis Methodology（总方法框架） <ExternalLink className="w-3 h-3" />
              </a>
              <br />
              <a
                href="https://artificialanalysis.ai/methodology/intelligence-benchmarking"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-primary"
              >
                Intelligence Benchmarking（核心计算口径） <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </section>

        <section id="data" className="scroll-mt-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl text-indigo-600">
              <Database className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">数据来源与边界</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <ul className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <li>1. 我们优先使用公开可追溯的数据源，保留原始字段并做中文字段映射。</li>
              <li>2. 同一模型在不同提供商可能表现不同，页面展示的是当前口径下的可比视图，不代表全部部署形态。</li>
              <li>3. 对于缺失、0 值或统计不稳定字段，我们在前端展示时会标记为 N/A 或不参与统计。</li>
              <li>4. 推荐结果是辅助决策，不是线上 SLA 承诺；上线前建议使用你的真实样本做 A/B 验证。</li>
            </ul>
          </div>
        </section>

        {/* Privacy Policy */}
        <section id="privacy" className="scroll-mt-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl text-emerald-600">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">隐私政策</h2>
          </div>
          <div className="prose prose-slate dark:prose-invert max-w-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              我们深知隐私对您的重要性。Token Galaxy 承诺：
            </p>
            <ul className="space-y-4 mt-4">
              <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span><b>数据最小化：</b> 我们仅收集为您提供模型推荐所必需的基础信息，绝不收集您的业务敏感数据。</span>
              </li>
              <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span><b>透明处理：</b> 所有的 API 测试数据均匿名化处理，仅用于生成聚合性能报告。</span>
              </li>
              <li className="flex gap-3 text-sm text-slate-600 dark:text-slate-400">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span><b>安全保障：</b> 采用行业领先的加密技术保护您的账户信息与偏好设置。</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Terms of Service */}
        <section id="terms" className="scroll-mt-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl text-blue-600">
              <FileText className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">服务条款</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">1. 服务内容</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  本平台提供的模型数据、评分及推荐仅供参考。由于模型版本更新频繁，实际效果请以厂商官方文档为准。
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">2. 用户行为</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  用户不得利用本平台进行任何非法活动，包括但不限于恶意爬取数据、发布虚假评测等。
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-2">3. 免责声明</h4>
                <p className="text-sm text-slate-500 leading-relaxed">
                  平台不对因使用本平台推荐的模型而导致的任何直接或间接损失负责。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Us */}
        <section id="contact" className="scroll-mt-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-600">
              <Mail className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">联系我们</h2>
          </div>
          <div className="bg-primary rounded-3xl p-10 text-white shadow-xl shadow-primary/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">有任何疑问或合作意向？</h3>
                <p className="text-primary-foreground/80 mb-8">
                  无论是模型入驻、数据纠错还是商务合作，我们的团队都随时准备为您提供支持。
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5" />
                    <span className="font-medium">support@tokengalaxy.cn</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5" />
                    <span className="font-medium">www.tokengalaxy.cn</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <input 
                    type="text" 
                    placeholder="您的姓名" 
                    className="w-full bg-white/10 border-white/20 rounded-xl px-4 py-3 text-sm placeholder:text-white/50 focus:ring-2 ring-white/30 border-none"
                  />
                  <input 
                    type="email" 
                    placeholder="电子邮箱" 
                    className="w-full bg-white/10 border-white/20 rounded-xl px-4 py-3 text-sm placeholder:text-white/50 focus:ring-2 ring-white/30 border-none"
                  />
                  <textarea 
                    placeholder="您的留言..." 
                    className="w-full bg-white/10 border-white/20 rounded-xl px-4 py-3 text-sm placeholder:text-white/50 focus:ring-2 ring-white/30 border-none h-24 resize-none"
                  />
                  <button className="w-full py-3 bg-white text-primary rounded-xl font-bold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2">
                    发送消息 <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
