import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Blocks, Code2, TerminalSquare, PlugZap, ArrowRight, Copy, BookOpen, TrendingUp } from 'lucide-react';

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
  const repoUrl = (import.meta.env.VITE_REPO_URL as string | undefined)?.trim() || 'https://github.com/your-org/LLMhub.git';
  const oneClickInstall = `tmpdir="$(mktemp -d)" && git clone --depth=1 ${repoUrl} "$tmpdir/repo" && mkdir -p "$CODEX_HOME/skills" && cp -R "$tmpdir/repo/skills/model-selection-advisor" "$CODEX_HOME/skills/model-selection-advisor" && echo "Installed: $CODEX_HOME/skills/model-selection-advisor"`;
  const verifyInstall = `ls -la "$CODEX_HOME/skills/model-selection-advisor" && echo '$model-selection-advisor 帮我按预算和延迟目标推荐模型'`;

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

      {/* 白皮书入口 */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <Link
          to="/whitepaper/2026-02"
          className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-primary to-indigo-500 rounded-3xl px-8 py-6 hover:opacity-95 transition-opacity mb-3"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/15 rounded-2xl shrink-0">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest">行业白皮书</span>
                <span className="text-[10px] font-black text-white bg-white/20 px-2 py-0.5 rounded-full">最新</span>
              </div>
              <p className="text-lg font-black text-white">2026年2月 大模型行业月报</p>
              <p className="text-sm text-white/70 mt-0.5">16个重点LLM发布 · 视频生成爆发 · 中美格局对比 · 开发者选型指南</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-white font-black text-sm shrink-0 group-hover:gap-3 transition-all">
            <TrendingUp className="w-4 h-4" /> 阅读白皮书 <ArrowRight className="w-4 h-4" />
          </div>
        </Link>
        <Link
          to="/whitepaper/2026-01"
          className="group flex items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 hover:border-primary/30 hover:bg-white transition-all"
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-slate-400 shrink-0" />
            <div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">往期</span>
              <p className="text-sm font-black text-slate-700 group-hover:text-primary transition-colors">2026年1月 大模型行业月报</p>
              <p className="text-xs text-slate-400 mt-0.5">9个LLM发布 · xAI视频夺冠 · 多模态23款新品 · Kimi K2.5领跑</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
        </Link>
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
    "https://www.tokengalaxy.cn/v1/model-recommendation",
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
