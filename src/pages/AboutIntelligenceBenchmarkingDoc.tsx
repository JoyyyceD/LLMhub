import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, BookOpenText } from 'lucide-react';

const REF = {
  aaMethodology: 'https://artificialanalysis.ai/methodology',
  aaIntelligence: 'https://artificialanalysis.ai/methodology/intelligence-benchmarking',
  gpqaPaper: 'https://arxiv.org/abs/2311.12022',
  gpqaDataset: 'https://github.com/openai/simple-evals/blob/main/gpqa_eval.py',
  hlePaper: 'https://arxiv.org/abs/2501.14249v2',
  hleDataset: 'https://huggingface.co/datasets/cais/hle',
  ifbenchPaper: 'https://arxiv.org/abs/2507.02833',
  ifbenchDataset: 'https://huggingface.co/datasets/allenai/IFBench_test',
  ifbenchGithub: 'https://github.com/allenai/IFBench',
  scicodePaper: 'https://arxiv.org/abs/2407.13168',
  scicodeDataset: 'https://scicode-bench.github.io/',
  tau2Paper: 'https://arxiv.org/abs/2506.07982',
  tau2Dataset: 'https://github.com/sierra-research/tau2-bench',
  terminalBenchPage: 'https://www.tbench.ai/',
  terminalBenchRegistry: 'https://www.tbench.ai/registry',
  omniscienceDataset: 'https://huggingface.co/datasets/ArtificialAnalysis/AA-Omniscience-Public',
  critptPaper: 'https://arxiv.org/abs/2509.26574',
  critptSite: 'https://critpt.com/',
  critptGithub: 'https://github.com/CritPt-Benchmark/CritPt',
  gdpvalPaper: 'https://arxiv.org/abs/2510.04374',
  gdpvalHarness: 'https://github.com/ArtificialAnalysis/Stirrup',
  gdpvalDataset: 'https://huggingface.co/datasets/openai/gdpval',
};

function RefLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
      {label} <ExternalLink className="w-3 h-3" />
    </a>
  );
}

export const AboutIntelligenceBenchmarkingDoc = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="mb-8">
        <Link to="/about/data-sources" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-primary">
          <ArrowLeft className="w-4 h-4" /> 返回数据来源与边界
        </Link>
      </div>

      <div className="mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-black uppercase tracking-widest mb-4">
          <BookOpenText className="w-3 h-3" /> Intelligence Benchmarking Doc
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-3">人工智能分析基准测试方法（中文细化文档）</h1>
        <p className="text-slate-500">
          本文档用于说明我们在平台中使用的核心测算口径、字段映射和来源引用。方法基线来自 Artificial Analysis Intelligence Benchmarking 页面（截至 2026 年 2 月 24 日）。
        </p>
      </div>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-8">
        <h2 className="text-xl font-bold mb-4">A. 总体计算框架（Intelligence Index）</h2>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>1. Intelligence Index 由 4 个能力域组成，每个能力域权重 25%。</li>
          <li>2. 共聚合 10 项评测：GDPval-AA、τ²-Bench Telecom、Terminal-Bench Hard、SciCode、AA-LCR、AA-Omniscience、IFBench、HLE、GPQA Diamond、CritPt。</li>
          <li>3. 评分以 pass@1 为主，对多次重复评测取聚合平均。</li>
          <li>4. 对 GDPval-AA 采用 ELO 归一化后纳入总指数（按公开口径做冻结与缩放）。</li>
        </ul>
        <div className="mt-4 text-sm">
          <RefLink href={REF.aaIntelligence} label="Artificial Analysis: Intelligence Benchmarking" />
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-8">
        <h2 className="text-xl font-bold mb-4">B. 通用测试参数（我们按公开口径解释）</h2>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>1. 温度：non-reasoning 常用 0，reasoning 常用 0.6（若模型方建议不同则按其建议）。</li>
          <li>2. 输出长度：non-reasoning 默认上限约 16,384；reasoning 按模型公开最大输出长度。</li>
          <li>3. 代码评测环境：Ubuntu 22.04 + Python 3.12。</li>
          <li>4. 错误处理：API 失败自动重试；持续失败样本会人工复核并按公开规则处理。</li>
        </ul>
        <div className="mt-4 text-sm">
          <RefLink href={REF.aaMethodology} label="Artificial Analysis: Methodology 总页面" />
        </div>
      </section>

      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 mb-8">
        <h2 className="text-xl font-bold mb-6">C. 各评测项来源与我们字段映射（详细）</h2>
        <div className="space-y-6 text-sm text-slate-600 dark:text-slate-400">
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">1) GPQA Diamond → `aa_gpqa`</p>
            <p>科学推理选择题（Diamond 子集），4 选 1，按正则抽取答案并用 pass@1 聚合。</p>
            <p>来源：<RefLink href={REF.gpqaPaper} label="Paper" /> · <RefLink href={REF.gpqaDataset} label="Dataset/GitHub" /></p>
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">2) HLE (Humanity's Last Exam) → `aa_hle`</p>
            <p>文本题子集，开放式答案，使用等价性判分流程，按 pass@1 统计。</p>
            <p>来源：<RefLink href={REF.hlePaper} label="Paper" /> · <RefLink href={REF.hleDataset} label="Dataset" /></p>
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">3) IFBench → `aa_ifbench`</p>
            <p>单轮指令遵循评测，5 次重复，采用官方评测代码与宽松评估模式。</p>
            <p>来源：<RefLink href={REF.ifbenchPaper} label="Paper" /> · <RefLink href={REF.ifbenchDataset} label="Dataset" /> · <RefLink href={REF.ifbenchGithub} label="GitHub" /></p>
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">4) AA-LCR → `aa_lcr`</p>
            <p>长上下文推理（单题约 100k token），开放式答案，使用等价判分并按 pass@1 聚合。</p>
            <p>来源：<RefLink href={REF.aaIntelligence} label="AA 方法页面说明（该项为 AA 自建评测）" /></p>
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">5) SciCode → `aa_scicode`</p>
            <p>科学编程任务，代码执行与单测通过判分，子题粒度汇总。</p>
            <p>来源：<RefLink href={REF.scicodePaper} label="Paper" /> · <RefLink href={REF.scicodeDataset} label="Dataset" /></p>
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">6) Terminal-Bench Hard → `aa_terminalbench_hard`</p>
            <p>终端代理高难任务子集，成功标准为测试集通过，按 pass@1 与多次重复聚合。</p>
            <p>来源：<RefLink href={REF.terminalBenchPage} label="Benchmark Page" /> · <RefLink href={REF.terminalBenchRegistry} label="Registry" /></p>
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">7) τ²-Bench Telecom → `aa_tau2`</p>
            <p>双控制（agent/user）电信任务，按 world-state 成功与 pass@1 聚合。</p>
            <p>来源：<RefLink href={REF.tau2Paper} label="Paper" /> · <RefLink href={REF.tau2Dataset} label="Dataset/GitHub" /></p>
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">8) AA-Omniscience（纳入总指数）</p>
            <p>知识与幻觉评测，公开口径为 Accuracy 与 Non-Hallucination Rate 的加权组合（各 50%）纳入总指数。</p>
            <p>来源：<RefLink href={REF.omniscienceDataset} label="Dataset" /> · <RefLink href={REF.aaIntelligence} label="Method Detail" /></p>
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">9) CritPt（纳入总指数）</p>
            <p>研究级物理推理任务，采用官方评分服务校验结果，按 pass@1 聚合。</p>
            <p>来源：<RefLink href={REF.critptPaper} label="Paper" /> · <RefLink href={REF.critptSite} label="Website" /> · <RefLink href={REF.critptGithub} label="GitHub" /></p>
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">10) GDPval-AA（纳入总指数）</p>
            <p>真实经济任务集，双提交盲评后计算 ELO，再按公开公式归一化进入 Intelligence Index。</p>
            <p>来源：<RefLink href={REF.gdpvalPaper} label="Paper" /> · <RefLink href={REF.gdpvalHarness} label="Agent Harness (GitHub)" /> · <RefLink href={REF.gdpvalDataset} label="Dataset" /></p>
          </div>
        </div>
      </section>

      <section className="bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 rounded-3xl p-8">
        <h2 className="text-xl font-bold mb-3">D. 说明与边界</h2>
        <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
          <li>1. 本文为“公开方法口径”的中文技术整理，不替代原始英文文档。</li>
          <li>2. 我们对字段映射做了工程化命名，便于在榜单、详情页、推荐页保持一致口径。</li>
          <li>3. 如果上游方法更新，本页会同步更新并保留更新日期。</li>
        </ul>
      </section>
    </div>
  );
};

