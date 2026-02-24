import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Blocks, Code2, TerminalSquare, PlugZap, ArrowRight, Copy } from 'lucide-react';

function CopyButton({ text }: { text: string }) {
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      // no-op
    }
  };

  return (
    <button
      onClick={onCopy}
      className="inline-flex items-center gap-1 text-xs font-black px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-500 hover:text-primary hover:border-primary transition-colors"
      type="button"
    >
      <Copy className="w-3.5 h-3.5" /> 复制
    </button>
  );
}

export const DeveloperEcosystem = () => {
  const [installLog, setInstallLog] = React.useState('');
  const repoUrl = (import.meta.env.VITE_REPO_URL as string | undefined)?.trim() || 'https://github.com/your-org/LLMhub.git';
  const oneClickInstall = `tmpdir="$(mktemp -d)" && git clone --depth=1 ${repoUrl} "$tmpdir/repo" && mkdir -p "$CODEX_HOME/skills" && cp -R "$tmpdir/repo/skills/model-selection-advisor" "$CODEX_HOME/skills/model-selection-advisor" && echo "Installed: $CODEX_HOME/skills/model-selection-advisor"`;
  const verifyInstall = `ls -la "$CODEX_HOME/skills/model-selection-advisor" && echo '$model-selection-advisor 帮我按预算和延迟目标推荐模型'`;
  const logText = installLog.toLowerCase();
  const installed = logText.includes('model-selection-advisor') && (logText.includes('installed:') || logText.includes('skill.md'));
  const hasError = logText.includes('no such file') || logText.includes('permission denied') || logText.includes('not found');
  const triggerReady = logText.includes('$model-selection-advisor') || logText.includes('帮我按预算和延迟目标推荐模型');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-14"
      >
        <p className="text-xs font-black tracking-[0.2em] text-primary mb-4">DEVELOPER ECOSYSTEM</p>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-5">
          开发者生态
        </h1>
        <p className="text-lg text-slate-500 max-w-3xl">
          给定预算、延迟和质量目标，输出可执行的模型推荐与验证计划。
        </p>
      </motion.div>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <Code2 className="w-6 h-6 text-primary mb-4" />
          <h2 className="text-lg font-black text-slate-900 mb-2">API 文档</h2>
          <p className="text-sm text-slate-500 mb-5">调用模型推荐 API，自动加载候选模型并返回结构化 Top-K 结果。</p>
          <a href="#api-contract" className="inline-flex items-center gap-2 text-sm font-black text-primary hover:underline">
            立即查看 API <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <Blocks className="w-6 h-6 text-primary mb-4" />
          <h2 className="text-lg font-black text-slate-900 mb-2">Skill 安装</h2>
          <p className="text-sm text-slate-500 mb-5">安装 `model-selection-advisor` 到 Agent，让选型流程标准化、可复盘。</p>
          <a href="#skill-install" className="inline-flex items-center gap-2 text-sm font-black text-primary hover:underline">
            一键安装 Skill <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6">
          <PlugZap className="w-6 h-6 text-primary mb-4" />
          <h2 className="text-lg font-black text-slate-900 mb-2">集成示例</h2>
          <p className="text-sm text-slate-500 mb-5">TypeScript / Python 最小示例，10 分钟跑通推荐链路。</p>
          <a href="#integration" className="inline-flex items-center gap-2 text-sm font-black text-primary hover:underline">
            复制示例代码 <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      <section id="api-contract" className="rounded-3xl border border-slate-200 bg-slate-950 text-white p-7 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <h3 className="text-xl font-black">推荐 API Endpoint</h3>
          <CopyButton text="POST /v1/model-recommendation" />
        </div>
        <div className="bg-black/30 border border-white/10 rounded-2xl p-4 font-mono text-sm overflow-x-auto">
          POST /v1/model-recommendation
        </div>
        <div className="bg-black/20 border border-white/10 rounded-2xl p-4 font-mono text-xs overflow-x-auto mt-3">
{`{
  "scenario": {
    "task_type": "rag_qa",
    "p95_latency_ms_target": 2000
  },
  "weights": {
    "quality": 35,
    "cost": 25,
    "latency": 20,
    "reliability": 10,
    "integration_fit": 10
  }
}`}
        </div>
        <p className="text-xs text-slate-300 mt-3">
          兼容入口：`POST /api/recommendations`
        </p>
      </section>

      <section id="skill-install" className="rounded-3xl border border-slate-200 bg-white p-7 mb-8">
        <div className="flex items-center gap-3 mb-4">
          <TerminalSquare className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-black text-slate-900">在 Agent 侧安装 Skill</h3>
        </div>
        <p className="text-sm text-slate-500 mb-5">
          当前 Skill 路径：`skills/model-selection-advisor`。可复制到 Agent 的 `skills` 目录，并在对话中触发调用。
        </p>
        <div className="space-y-4">
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black uppercase tracking-widest text-emerald-700">One Click</p>
              <CopyButton text={oneClickInstall} />
            </div>
            <code className="text-sm text-emerald-900 break-all">{oneClickInstall}</code>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Step 1</p>
              <CopyButton text="cp -R skills/model-selection-advisor $CODEX_HOME/skills/model-selection-advisor" />
            </div>
            <code className="text-sm text-slate-700 break-all">cp -R skills/model-selection-advisor $CODEX_HOME/skills/model-selection-advisor</code>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Step 2</p>
              <CopyButton text="$model-selection-advisor 帮我按预算和延迟目标推荐模型" />
            </div>
            <code className="text-sm text-slate-700 break-all">$model-selection-advisor 帮我按预算和延迟目标推荐模型</code>
          </div>
          <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-black uppercase tracking-widest text-slate-500">Step 3</p>
              <CopyButton text={verifyInstall} />
            </div>
            <code className="text-sm text-slate-700 break-all">{verifyInstall}</code>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-4">
          可通过设置 `VITE_REPO_URL` 指向你的公开仓库，页面会自动生成对应一键安装命令。
        </p>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-7 mb-8">
        <h3 className="text-xl font-black text-slate-900 mb-4">安装结果检测器</h3>
        <p className="text-sm text-slate-500 mb-4">
          粘贴终端输出，页面会自动判断是否安装成功、是否可触发 Skill。
        </p>
        <textarea
          value={installLog}
          onChange={(e) => setInstallLog(e.target.value)}
          placeholder="粘贴安装命令输出，例如：Installed: $CODEX_HOME/skills/model-selection-advisor ..."
          className="w-full h-36 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
        />
        <div className="mt-4 flex flex-wrap gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-black ${installed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
            {installed ? '安装路径已识别' : '未识别安装完成'}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-xs font-black ${triggerReady ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
            {triggerReady ? '触发命令已检测' : '未检测到触发命令'}
          </span>
          <span className={`px-3 py-1.5 rounded-full text-xs font-black ${hasError ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-500'}`}>
            {hasError ? '检测到错误，请重试' : '未检测到明显错误'}
          </span>
        </div>
      </section>

      <section id="integration" className="rounded-3xl border border-slate-200 bg-white p-7">
        <h3 className="text-xl font-black text-slate-900 mb-5">快速接入示例</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-black tracking-widest text-slate-500">TYPESCRIPT</div>
            <pre className="text-xs text-slate-700 p-4 overflow-x-auto">{`const res = await fetch("/v1/model-recommendation", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    scenario: {
      task_type: "rag_qa",
      p95_latency_ms_target: 2000
    }
  })
});
const data = await res.json();`}</pre>
          </div>
          <div className="rounded-2xl border border-slate-200 overflow-hidden">
            <div className="px-4 py-2 border-b border-slate-200 bg-slate-50 text-xs font-black tracking-widest text-slate-500">PYTHON</div>
            <pre className="text-xs text-slate-700 p-4 overflow-x-auto">{`import requests

resp = requests.post(
    "https://YOUR_DOMAIN/v1/model-recommendation",
    json={"scenario": {"task_type": "rag_qa"}},
    timeout=30,
)
print(resp.json()["ranking"][:3])`}</pre>
          </div>
        </div>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <a href="#api-contract" className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-primary text-white font-black hover:bg-primary/90 transition-colors">
          开始接入推荐 API <ArrowRight className="w-4 h-4" />
        </a>
        <a href="#skill-install" className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 font-black hover:border-primary hover:text-primary transition-colors">
          安装 Skill 到 Agent <ArrowRight className="w-4 h-4" />
        </a>
        <Link to="/about" className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-200 text-slate-700 font-black hover:border-primary hover:text-primary transition-colors">
          查看方法论来源 <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};
