import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Database, ArrowLeft, ExternalLink, RefreshCw } from 'lucide-react';

export const AboutDataSources = () => {
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
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-600 text-xs font-black uppercase tracking-widest mb-4">
          <Database className="w-3 h-3" /> Data Sources
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">数据来源与更新机制</h1>
        <p className="text-slate-500">
          本页解释平台的数据来自哪里、如何更新、以及哪些字段不应被过度解读。更新时间基准：2026 年 2 月 24 日。
        </p>
      </div>

      <div className="space-y-8">
        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-4">1) 数据来源</h2>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li>平台核心评测字段基于公开接口数据做结构化整理。</li>
            <li>我们保留原始字段（如 ELO、Index、TTFT、TPS、价格）并提供中文解释。</li>
            <li>模型详情页和榜单页尽量保持同一字段口径，避免页面间分数不一致。</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-4">2) 更新与快照</h2>
          <div className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-400">
            <RefreshCw className="w-4 h-4 text-primary mt-0.5" />
            <p>
              数据按抓取任务定期更新。由于厂商会频繁改版本、改定价、改可用区，同一模型在不同日期可能出现明显变化。我们建议将发布时间、记录日期与分数一起看。
            </p>
          </div>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-4">3) 缺失值与 0 值处理原则</h2>
          <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
            <li>当字段缺失或为 0（在该字段语义下表示不可用）时，页面显示 N/A，不参与对比计算。</li>
            <li>多模态数据字段覆盖不完整时，页面只展示该模型实际有值的指标。</li>
            <li>推荐页与对比页尽量共用同一评分口径，降低“同模型不同页分数不一致”问题。</li>
          </ul>
        </section>

        <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-4">4) 人工智能分析基准测试方法（引用）</h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            以下是我们当前用到的 Intelligence 相关核心口径的中文整理（基于公开方法页）。其中字段映射为我们的实现口径：`aa_intelligence_index`、`aa_gpqa`、`aa_hle`、`aa_ifbench`、`aa_lcr`、`aa_scicode`、`aa_terminalbench_hard`、`aa_tau2`。
          </p>
          <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
            <p><b>Intelligence Index（v4.0.2）总合成方式：</b> 四个能力域等权（各 25%）：General Intelligence、Coding、Instruction Following、Math。在该版本中，10 项评测的权重为：GDPval-AA 16.7%、τ² Bench 8.3%、Terminal-Bench Hard 16.7%、SciCode 8.3%、AA-LCR 6.25%、AA-Omniscience 12.5%、IFBench 6.25%、HLE 12.5%、GPQA Diamond 6.25%、CritPt 6.25%。</p>
            <p><b>通用统计规则：</b> 默认以 pass@1 统计，并对重复测次取平均。温度口径区分 reasoning / non-reasoning（reasoning 常用 1.0，non-reasoning 常用 0.0），max output tokens 约 32k。若某模型缺失评测项，会按公开规则做缺失归一化处理。</p>
            <p><b>GPQA Diamond（映射 `aa_gpqa`）：</b> 198 道高难科学选择题，正则抽取最终选项，按多次运行的 pass@1 平均。</p>
            <p><b>HLE（映射 `aa_hle`）：</b> 2158 题文本子集，使用等价性判断流程（含模型校验）判定答案正确性，按 pass@1 统计。</p>
            <p><b>IFBench（映射 `aa_ifbench`）：</b> 指令遵循评测，按官方评测代码执行（含 prompt-level 宽松判分），多次运行后取平均。</p>
            <p><b>AA-LCR（映射 `aa_lcr`）：</b> 长上下文检索与引用任务，文档上下文可达约 100k token，要求较大上下文窗口；使用等价性判定并按 pass@1 聚合。</p>
            <p><b>SciCode（映射 `aa_scicode`）：</b> 科学编程子任务集合，代码通过单元测试判定得分，按子任务层级与重复测次聚合。</p>
            <p><b>Terminal-Bench Hard（映射 `aa_terminalbench_hard`）：</b> 终端代理高难任务子集，任务成功定义为全部测试通过；多次运行后取 pass@1 平均。</p>
            <p><b>τ² Bench Telecom（映射 `aa_tau2`）：</b> 工具调用/代理多步任务，按世界状态判分与最终成功率统计，按重复测次聚合。</p>
            <p><b>AA-Omniscience（纳入 `aa_intelligence_index`）：</b> 大规模事实问答，综合准确率与幻觉惩罚，公开口径为 accuracy 与 (1 - hallucination rate) 的组合分数。</p>
            <p><b>GDPval-AA 与 CritPt（纳入 `aa_intelligence_index`）：</b> 分别偏向通用对话偏好评分与批判性思考能力测评，按公开流程计算后参与总指数加权。</p>
          </div>
          <p className="text-xs text-slate-500 mt-4">
            说明：上面“字段映射”是我们基于公开定义与字段名做的工程化对齐，用于保证前端展示口径一致。
          </p>
          <Link
            to="/about/data-sources/intelligence-benchmarking"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 hover:border-primary hover:text-primary transition-all text-sm font-bold text-slate-700 dark:text-slate-200"
          >
            查看单独文档（含论文 / GitHub / Dataset 全引用）
          </Link>
        </section>

        <section className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
          <h2 className="text-xl font-bold mb-4">5) 公开方法参考</h2>
          <div className="space-y-3 text-sm">
            <a href="https://artificialanalysis.ai/methodology" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
              Artificial Analysis Methodology <ExternalLink className="w-3 h-3" />
            </a>
            <br />
            <a href="https://artificialanalysis.ai/methodology/intelligence-benchmarking" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
              人工智能分析基准测试方法（Intelligence Benchmarking） <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
