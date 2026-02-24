import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, ExternalLink, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const AboutMethodology = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <Link to="/about" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> 返回关于我们
        </Link>
      </div>

      <div className="mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold tracking-wide mb-4">
          <BookOpen className="w-3 h-3" /> Methodology
        </div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">方法学说明（中文）</h1>
        <p className="text-slate-500">
          本页用于解释我们如何理解并落地公开评测方法。口径参考 Artificial Analysis 公开方法页面，截至 2026 年 2 月 24 日。
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-white border border-slate-200 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-4">0) 当前引用版本</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            我们当前说明对应 Artificial Analysis Intelligence Index v4.0.2（2026 年 1 月）。在你看到本页时，如上游方法更新，我们会同步修订中文说明并标注日期。
          </p>
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-4">1) 评测原则（四条）</h2>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li>标准化（Standardized）：尽量用一致条件测不同模型，降低横向比较噪声。</li>
            <li>无偏（Unbiased）：减少对“等价正确答案”的误惩罚，避免抽取规则偏差。</li>
            <li>零样本指令（Zero-shot Instruction Prompted）：不喂示例，直接测试模型指令理解能力。</li>
            <li>透明（Transparent）：公开提示模板、评测流程、限制项与版本历史。</li>
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-4">2) 评测对象的定义</h2>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5" /> Model：具体模型版本，是能力比较的基础单位。</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5" /> Model Creator：模型开发者/厂商，用于聚合品牌层视角。</li>
            <li className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-primary mt-0.5" /> Provider / Endpoint：同一模型在不同 API 提供商下可能出现性能差异。</li>
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-4">3) 指标口径与可比性</h2>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li>Intelligence Index：综合多个评测维度的能力指标，适合做横向筛选。</li>
            <li>Coding Index：代码相关能力指标，适合代码助手、工程场景。</li>
            <li>TTFT（首字延迟）与 TPS（吞吐）：反映交互响应和单位时间输出能力。</li>
            <li>Blended Price：用于同口径对比价格，不能简单替代总拥有成本（TCO）。</li>
          </ul>
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-4">4) Intelligence Index 覆盖维度</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
            按公开说明，v4.0 系列聚合 10 项评测，覆盖通用推理、科学推理、代码、工具调用与代理任务能力。你可以把它理解为“综合能力仪表盘”，而不是单任务最优保证。
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            代表性评测包括：GDPval-AA、2-Bench Telecom、Terminal-Bench Hard、SciCode、AA-LCR、AA-Omniscience、IFBench、HLE、GPQA Diamond、CritPt。
          </p>
        </section>

        <section className="bg-white border border-slate-200 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-4">5) 方法边界与使用建议</h2>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li>公开榜单适合做“候选集收敛”，不直接等于生产结果。</li>
            <li>不同模型的长板和短板并存，必须结合业务任务分层验证。</li>
            <li>推荐你先用 20-50 条高价值样本做小流量 A/B，再决定全量上线。</li>
          </ul>
        </section>

        <section className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-2">核心数据计算方法与来源链接</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            我们当前产品中涉及 Intelligence Index 等核心指标的解释与口径，主要参考以下公开页面。
          </p>
          <div className="space-y-3 text-sm">
            <a href="https://artificialanalysis.ai/methodology" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
              Artificial Analysis Methodology（总方法框架） <ExternalLink className="w-3 h-3" />
            </a>
            <br />
            <a href="https://artificialanalysis.ai/methodology/intelligence-benchmarking" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
              Intelligence Benchmarking（核心计算口径） <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
