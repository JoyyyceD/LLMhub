import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileText, 
  Mail, 
  Target, 
  CheckCircle2, 
  ArrowRight,
  Globe,
  Zap,
  BarChart3
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
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">关于 LLM 智能筛选</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          我们致力于构建全球最专业、最客观的大模型评测与选型平台，帮助开发者在海量模型中找到最适合的方案。
        </p>
      </motion.div>

      <div className="space-y-24">
        {/* Evaluation Logic */}
        <section id="evaluation" className="scroll-mt-24">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-primary/10 rounded-2xl text-primary">
              <Target className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold">测评逻辑</h2>
          </div>
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm">
            <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              我们的测评体系基于多维度、全自动化的实时测试框架，确保每一项数据都真实可信。
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: '多维基准测试', desc: '包含 MMLU, HumanEval, GSM8K 等国际主流基准，覆盖通用能力、代码、数学。', icon: BarChart3 },
                { title: '实时性能监测', desc: '通过全球分布式节点，实时测试各厂商 API 的响应延迟（Latency）与吞吐量（TPS）。', icon: Zap },
                { title: '真实场景模拟', desc: '引入 1000+ 真实业务 Prompt，模拟长文本理解、复杂逻辑推理等实际应用场景。', icon: Globe },
                { title: '动态权重算法', desc: '根据用户选择的业务场景（如代码助手、创意写作），动态计算模型推荐分数。', icon: CheckCircle2 },
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
              我们深知隐私对您的重要性。LLM 智能筛选承诺：
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
                    <span className="font-medium">support@llm-selector.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5" />
                    <span className="font-medium">www.llm-selector.com</span>
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
