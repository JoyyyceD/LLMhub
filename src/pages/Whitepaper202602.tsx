import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  Home as HomeIcon,
  BookOpen,
  TrendingUp,
  Cpu,
  Globe,
  Zap,
  BarChart3,
  ExternalLink,
  Brain,
  Code2,
  DollarSign,
  ArrowUpRight,
  Film,
  Image as ImageIcon,
  Share2,
} from 'lucide-react';

function ShareButton() {
  const [copied, setCopied] = useState(false);
  const onShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // no-op
    }
  };
  return (
    <button
      onClick={onShare}
      type="button"
      className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-primary transition-colors"
    >
      <Share2 className="w-4 h-4" />
      {copied ? '已复制链接' : '分享'}
    </button>
  );
}

// ─── LLM 数据（Token Galaxy Supabase，2026-02，已去重，名称已去括号）────────

const CN_MODELS = [
  { slug: 'glm-5', name: 'GLM-5', provider: 'Z AI', providerCn: '智谱', date: '2026-02-11', intel: 49.8, coding: 44.2, gpqa: 0.820, inputCny: 6.86, outputCny: 21.95, contextK: 200 },
  { slug: 'qwen3-5-397b-a17b', name: 'Qwen3.5 397B A17B', provider: 'Alibaba', providerCn: '阿里巴巴', date: '2026-02-16', intel: 45.0, coding: 41.3, gpqa: 0.893, inputCny: 4.12, outputCny: 24.70, contextK: 256 },
  { slug: 'qwen3-5-27b', name: 'Qwen3.5 27B', provider: 'Alibaba', providerCn: '阿里巴巴', date: '2026-02-24', intel: 42.1, coding: 34.9, gpqa: 0.858, inputCny: 2.06, outputCny: 16.46, contextK: 256 },
  { slug: 'minimax-m2-5', name: 'MiniMax-M2.5', provider: 'MiniMax', providerCn: 'MiniMax', date: '2026-02-12', intel: 41.9, coding: 37.4, gpqa: 0.848, inputCny: 2.06, outputCny: 8.23, contextK: 192 },
  { slug: 'qwen3-5-122b-a10b', name: 'Qwen3.5 122B A10B', provider: 'Alibaba', providerCn: '阿里巴巴', date: '2026-02-24', intel: 41.6, coding: 34.7, gpqa: 0.857, inputCny: 2.74, outputCny: 21.95, contextK: 256 },
  { slug: 'qwen3-5-35b-a3b', name: 'Qwen3.5 35B A3B', provider: 'Alibaba', providerCn: '阿里巴巴', date: '2026-02-24', intel: 37.1, coding: 30.3, gpqa: 0.845, inputCny: 1.715, outputCny: 13.72, contextK: 256 },
  { slug: 'doubao-seed-2-0-lite', name: 'Doubao Seed 2.0 lite', provider: 'ByteDance Seed', providerCn: '字节跳动', date: '2026-02-15', intel: 36.3, coding: 21.4, gpqa: 0.656, inputCny: 0, outputCny: 0, contextK: null },
  { slug: 'qwen3-coder-next', name: 'Qwen3 Coder Next', provider: 'Alibaba', providerCn: '阿里巴巴', date: '2026-02-03', intel: 28.3, coding: 22.9, gpqa: 0.737, inputCny: 1.372, outputCny: 8.23, contextK: 256 },
];

const GLOBAL_MODELS = [
  { slug: 'gemini-3-1-pro-preview', name: 'Gemini 3.1 Pro Preview', provider: 'Google', providerCn: null, date: '2026-02-19', intel: 57.2, coding: 55.5, gpqa: 0.941, inputCny: 13.72, outputCny: 82.32, contextK: 1048 },
  { slug: 'gpt-5-3-codex', name: 'GPT-5.3 Codex', provider: 'OpenAI', providerCn: null, date: '2026-02-05', intel: 54.0, coding: 53.1, gpqa: 0.915, inputCny: 12.005, outputCny: 96.04, contextK: 400 },
  { slug: 'claude-opus-4-6-adaptive', name: 'Claude Opus 4.6', provider: 'Anthropic', providerCn: null, date: '2026-02-05', intel: 53.0, coding: 48.1, gpqa: 0.896, inputCny: 34.30, outputCny: 171.50, contextK: 1000 },
  { slug: 'claude-sonnet-4-6-adaptive', name: 'Claude Sonnet 4.6', provider: 'Anthropic', providerCn: null, date: '2026-02-17', intel: 51.7, coding: 50.9, gpqa: 0.875, inputCny: 20.58, outputCny: 102.90, contextK: 1000 },
  { slug: 'mercury-2', name: 'Mercury 2', provider: 'Inception', providerCn: null, date: '2026-02-20', intel: 32.8, coding: 30.6, gpqa: 0.770, inputCny: 1.715, outputCny: 5.145, contextK: null },
  { slug: 'tri-21b-think-preview', name: 'Tri-21B-Think', provider: 'Trillion Labs', providerCn: null, date: '2026-02-10', intel: 20.0, coding: 7.4, gpqa: 0.538, inputCny: 0, outputCny: 0, contextK: null },
  { slug: 'lfm2-24b-a2b', name: 'LFM2 24B A2B', provider: 'Liquid AI', providerCn: null, date: '2026-02-25', intel: 10.5, coding: 3.6, gpqa: 0.474, inputCny: 0.2058, outputCny: 0.8232, contextK: 32 },
  { slug: 'tiny-aya-global', name: 'Tiny Aya Global', provider: 'Cohere', providerCn: null, date: '2026-02-17', intel: null, coding: 1.2, gpqa: 0.305, inputCny: 0, outputCny: 0, contextK: null },
];

const ALL_LLM = [...CN_MODELS, ...GLOBAL_MODELS];
const TOP5 = ALL_LLM.filter(m => m.intel !== null).sort((a, b) => (b.intel ?? 0) - (a.intel ?? 0)).slice(0, 5);

// ─── 多模态数据（Token Galaxy Supabase，2026-02 发布）────────────────────────

const IMAGE_MODELS = [
  { slug: 'image_editing::sourceful_riverflow-2', name: 'Riverflow 2.0', provider: 'Sourceful', elo: 1283, isCn: false },
  { slug: 'image_editing::nano-banana-2', name: 'Nano Banana 2', provider: 'Google', elo: 1232, isCn: false },
  { slug: 'image_editing::grok-imagine-image-pro', name: 'Grok Imagine Image Pro', provider: 'xAI', elo: 1210, isCn: false },
  { slug: 'text_to_image::recraft-v4-pro', name: 'Recraft V4 Pro', provider: 'Recraft', elo: 1113, isCn: false },
  { slug: 'text_to_image::recraft-v4', name: 'Recraft V4', provider: 'Recraft', elo: 1109, isCn: false },
];

const VIDEO_MODELS = [
  { slug: 'image_to_video::pixverse-v5-6', name: 'PixVerse V5.6', provider: 'PixVerse', elo: 1301, isCn: true },
  { slug: 'image_to_video::kling-o3-pro', name: 'Kling 3.0 Omni 1080p', provider: 'KlingAI', elo: 1298, isCn: true },
  { slug: 'image_to_video::kling-3-0-pro', name: 'Kling 3.0 1080p', provider: 'KlingAI', elo: 1289, isCn: true },
  { slug: 'image_to_video::kling-3-0-standard', name: 'Kling 3.0 720p', provider: 'KlingAI', elo: 1265, isCn: true },
  { slug: 'image_to_video::kling-o3-standard', name: 'Kling 3.0 Omni 720p', provider: 'KlingAI', elo: 1262, isCn: true },
];

// ─── 关键洞察 ─────────────────────────────────────────────────────────────────

const KEY_FINDINGS = [
  {
    icon: Globe,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    title: 'Gemini 3.1 Pro Preview 摘得本月智能指数桂冠',
    body: 'Google 发布的 Gemini 3.1 Pro Preview 以智能指数 57.2、GPQA 94.1% 位居 2 月所有新发布 LLM 第一，支持 1M Token 超长上下文，并原生支持音频、视频、图像、文档等五种输入模态。',
  },
  {
    icon: Code2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    title: 'OpenAI 发布代码专项旗舰 GPT-5.3 Codex',
    body: 'GPT-5.3 Codex 以编程指数 53.1 跻身本月代码能力第二，智能指数 54.0，定价 ¥12.0/¥96.0（输入/输出，百万 tokens），支持 400K 上下文，专为高强度代码生成与 Agent 工作流设计。',
  },
  {
    icon: Zap,
    color: 'text-orange-600',
    bg: 'bg-orange-50 border-orange-200',
    title: 'Anthropic Claude 4.6 双旗舰同步发布',
    body: 'Anthropic 本月同步发布 Sonnet 4.6 与 Opus 4.6。Opus 4.6 以智能指数 53.0 位列本月第三，Sonnet 4.6 以 51.7 紧随，两者均支持 1M Token 上下文，兼顾综合性能与性价比。',
  },
  {
    icon: TrendingUp,
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-200',
    title: '阿里巴巴 Qwen3.5 系列规模化扩展，覆盖全参数段',
    body: '阿里巴巴本月发布量最大：Qwen3.5 在 27B、35B、122B、397B 四个参数量上全面发布，全系支持文本+图像+视频多模态输入，256K 上下文，定价 ¥1.7~¥4.1/M，远低于国际同级。',
  },
  {
    icon: Film,
    color: 'text-rose-600',
    bg: 'bg-rose-50 border-rose-200',
    title: '视频生成爆发：KlingAI 与 PixVerse 双雄刷新榜单',
    body: '中国厂商主导本月视频生成赛道。KlingAI 发布 Kling 3.0 系列四款，ELO 分位于 1262~1298；PixVerse V5.6 以 ELO 1301 夺本月视频榜首。图像生成方面，Sourceful Riverflow 2.0 以 ELO 1283 领跑图像编辑赛道。',
  },
];

// ─── 辅助组件 ─────────────────────────────────────────────────────────────────

function ModelLink({ slug, children }: { slug: string; children: React.ReactNode }) {
  return (
    <Link to={`/model/${encodeURIComponent(slug)}`} className="hover:text-primary hover:underline transition-colors inline-flex items-center gap-0.5">
      {children}
    </Link>
  );
}

function ProviderLink({ name, children }: { name: string; children: React.ReactNode }) {
  return (
    <Link to={`/provider/${encodeURIComponent(name)}`} className="hover:text-primary hover:underline transition-colors font-medium">
      {children}
    </Link>
  );
}

function cnyFmt(cny: number | null): string {
  if (cny === null || cny === 0) return '—';
  if (cny < 1) return `¥${cny.toFixed(2)}`;
  return `¥${cny.toFixed(1)}`;
}

function contextFmt(k: number | null) {
  if (!k) return '—';
  if (k >= 1000) return `${(k / 1000).toFixed(0)}M`;
  return `${k}K`;
}

function IntelBar({ value, max = 60 }: { value: number | null; max?: number }) {
  if (value === null) return <span className="text-slate-300 text-xs">—</span>;
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 bg-slate-100 rounded-full h-1.5 min-w-[60px]">
        <div className="h-1.5 rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-bold text-slate-700 tabular-nums w-8">{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="border-t border-slate-100 my-14" />;
}

function SectionLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <span className="text-xs font-black text-white bg-primary px-2.5 py-1 rounded-lg">{n}</span>
      <p className="text-xs font-black tracking-[0.15em] text-slate-400 uppercase">{children}</p>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-2">{children}</h2>;
}

function ModelTable({ models }: { models: typeof CN_MODELS }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-400">
            <th className="text-left px-4 py-3">模型</th>
            <th className="text-left px-4 py-3 hidden md:table-cell">厂商</th>
            <th className="text-left px-4 py-3 hidden lg:table-cell">发布日</th>
            <th className="text-right px-4 py-3">智能指数</th>
            <th className="text-right px-4 py-3 hidden sm:table-cell">代码</th>
            <th className="text-right px-4 py-3 hidden md:table-cell">上下文</th>
            <th className="text-right px-4 py-3">定价(输入)</th>
          </tr>
        </thead>
        <tbody>
          {models.map((m, i) => (
            <tr
              key={m.slug}
              className={`border-t border-slate-100 hover:bg-slate-50 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}
            >
              <td className="px-4 py-3">
                <ModelLink slug={m.slug}>
                  <span className="font-bold text-slate-900 text-xs leading-snug">{m.name}</span>
                </ModelLink>
                <p className="text-[11px] text-slate-400 mt-0.5 md:hidden">
                  <ProviderLink name={m.provider}>{m.providerCn ?? m.provider}</ProviderLink>
                </p>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <ProviderLink name={m.provider}>
                  <span className="text-xs text-slate-600">{m.providerCn ?? m.provider}</span>
                </ProviderLink>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell text-xs text-slate-400">{m.date}</td>
              <td className="px-4 py-3 text-right">
                <span className={`text-xs font-black tabular-nums ${m.intel && m.intel >= 50 ? 'text-primary' : m.intel && m.intel >= 40 ? 'text-slate-700' : 'text-slate-400'}`}>
                  {m.intel ?? '—'}
                </span>
              </td>
              <td className="px-4 py-3 text-right hidden sm:table-cell text-xs text-slate-500 tabular-nums">{m.coding}</td>
              <td className="px-4 py-3 text-right hidden md:table-cell text-xs text-slate-500">{contextFmt(m.contextK)}</td>
              <td className="px-4 py-3 text-right">
                <span className="text-xs font-bold tabular-nums text-slate-600">{cnyFmt(m.inputCny)}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────

export const Whitepaper202602 = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 mb-10">
        <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <HomeIcon className="w-4 h-4" /> 首页
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/ecosystem" className="hover:text-primary transition-colors">开发者生态</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 font-medium">2026年2月白皮书</span>
      </nav>

      {/* Hero */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-black tracking-widest text-white bg-primary px-3 py-1 rounded-full uppercase">月度白皮书</span>
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Feb 2026</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-5">
          大模型行业月报<br />
          <span className="text-primary">2026 年 2 月</span>
        </h1>
        <p className="text-base text-slate-500 max-w-2xl leading-relaxed mb-8">
          本报告数据来自 Token Galaxy 实时追踪数据库，覆盖 2026 年 2 月 1 日至 28 日所有已收录新发布大语言模型及多模态模型，
          含智能指数、代码能力、定价及视频/图像生成 ELO 分。所有指标均为实测数据。
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-primary" />发布：2026年2月28日</span>
          <span className="flex items-center gap-1.5"><BarChart3 className="w-4 h-4 text-primary" />数据来源：Token Galaxy</span>
          <Link to="/leaderboard" className="flex items-center gap-1.5 text-primary font-semibold hover:underline">
            <ExternalLink className="w-4 h-4" />查看完整榜单
          </Link>
          <ShareButton />
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
        {[
          { label: 'LLM 新发布', value: '16', sub: '已去重 · 9 家厂商' },
          { label: '多模态新发布', value: '10', sub: '5 图像 · 5 视频' },
          { label: '参与厂商合计', value: '15', sub: '含 LLM + 多模态' },
          { label: '超长上下文 ≥200K', value: '10', sub: 'Gemini · Claude · Qwen' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-200 rounded-2xl p-4 text-center">
            <p className="text-3xl font-black text-primary mb-0.5">{s.value}</p>
            <p className="text-xs font-bold text-slate-900 mb-0.5">{s.label}</p>
            <p className="text-[11px] text-slate-400">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* 01 执行摘要 */}
      <section>
        <SectionLabel n="01">执行摘要</SectionLabel>
        <SectionTitle>本月五大关键结论</SectionTitle>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">以下洞察均基于 Token Galaxy 2月实测数据，非估算。</p>
        <div className="space-y-3">
          {KEY_FINDINGS.map(f => (
            <div key={f.title} className={`border rounded-2xl p-4 flex gap-4 ${f.bg}`}>
              <div className="shrink-0 mt-0.5">
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <div>
                <p className="font-black text-slate-900 text-sm mb-1">{f.title}</p>
                <p className="text-sm text-slate-600 leading-relaxed">{f.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* 02 性能排行 Top 5 */}
      <section>
        <SectionLabel n="02">性能排行</SectionLabel>
        <SectionTitle>2月新发布模型：智能指数 Top 5</SectionTitle>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          智能指数为 Token Galaxy 综合多项评测的加权得分。点击模型名称查看完整详情页。
        </p>
        <div className="space-y-3">
          {TOP5.map((m, i) => (
            <Link
              key={m.slug}
              to={`/model/${m.slug}`}
              className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-5 py-4 hover:border-primary/40 hover:shadow-sm transition-all group"
            >
              <span className={`text-2xl font-black w-8 shrink-0 ${i === 0 ? 'text-amber-400' : 'text-slate-200'}`}>
                {i + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-black text-slate-900 text-sm group-hover:text-primary transition-colors truncate">{m.name}</span>
                  {CN_MODELS.some(x => x.slug === m.slug) && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">国内</span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{m.providerCn ?? m.provider} · {m.date} · GPQA {(m.gpqa * 100).toFixed(1)}%</p>
              </div>
              <div className="shrink-0 w-36 hidden sm:block">
                <IntelBar value={m.intel} />
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link to="/leaderboard" className="inline-flex items-center gap-2 text-sm font-black text-primary hover:underline">
            查看所有模型完整排行榜 <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Divider />

      {/* 03 LLM 全量发布 */}
      <section>
        <SectionLabel n="03">全量发布</SectionLabel>
        <SectionTitle>2 月所有新发布 LLM（16 个，已去重）</SectionTitle>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          每个模型系列只保留最优变体。点击模型名称跳转详情页，点击厂商名跳转厂商页面。定价单位：人民币 / 百万 tokens，¥— 表示数据待确认。
        </p>

        <h3 className="text-sm font-black text-slate-700 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          中国厂商（{CN_MODELS.length} 个）
        </h3>
        <ModelTable models={CN_MODELS} />

        <h3 className="text-sm font-black text-slate-700 mt-6 mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary inline-block" />
          国际厂商（{GLOBAL_MODELS.length} 个）
        </h3>
        <ModelTable models={GLOBAL_MODELS} />

        <p className="text-[11px] text-slate-400 mt-2 text-right">定价已按 1 USD = 6.86 CNY 换算 · 数据来源：Token Galaxy</p>
      </section>

      <Divider />

      {/* 04 多模态发布 */}
      <section>
        <SectionLabel n="04">多模态发布</SectionLabel>
        <SectionTitle>图像 &amp; 视频生成：2 月新品一览</SectionTitle>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          多模态模型以 ELO 竞技场分衡量生成质量，数据来自 Token Galaxy 多模态排行榜。
        </p>

        {/* 视频生成 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Film className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-black text-slate-900">视频生成（5 款）</h3>
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-rose-100 text-rose-600">中国厂商主导</span>
          </div>
          <div className="space-y-2">
            {VIDEO_MODELS.map((m, i) => (
              <Link
                key={m.slug}
                to={`/model/${encodeURIComponent(m.slug)}`}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-rose-200 hover:shadow-sm transition-all group"
              >
                <span className={`text-xl font-black w-6 shrink-0 ${i === 0 ? 'text-amber-400' : 'text-slate-200'}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors">{m.name}</span>
                    {m.isCn && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600 shrink-0">国内</span>}
                  </div>
                  <p className="text-xs text-slate-400">
                    <ProviderLink name={m.provider}>{m.provider}</ProviderLink>
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <span className="text-sm font-black text-rose-600 tabular-nums">ELO {m.elo}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>
          <div className="mt-3 bg-rose-50 border border-rose-200 rounded-2xl p-4">
            <p className="text-sm text-rose-800 leading-relaxed">
              KlingAI 本月一次性发布 Kling 3.0 系列四款，覆盖 Omni（全模态）与标准版、1080p 与 720p 四个规格。
              PixVerse V5.6 以 ELO 1301 夺本月视频生成榜首，两家均为中国厂商。
            </p>
          </div>
        </div>

        {/* 图像生成 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-black text-slate-900">图像生成（5 款）</h3>
          </div>
          <div className="space-y-2">
            {IMAGE_MODELS.map((m, i) => (
              <Link
                key={m.slug}
                to={`/model/${encodeURIComponent(m.slug)}`}
                className="flex items-center gap-4 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-blue-200 hover:shadow-sm transition-all group"
              >
                <span className={`text-xl font-black w-6 shrink-0 ${i === 0 ? 'text-amber-400' : 'text-slate-200'}`}>{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors">{m.name}</span>
                  <p className="text-xs text-slate-400">
                    <ProviderLink name={m.provider}>{m.provider}</ProviderLink>
                  </p>
                </div>
                <span className="text-sm font-black text-blue-600 tabular-nums shrink-0">ELO {m.elo}</span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>
          <div className="mt-3 bg-blue-50 border border-blue-200 rounded-2xl p-4">
            <p className="text-sm text-blue-800 leading-relaxed">
              图像生成赛道本月由国际厂商主导：Sourceful Riverflow 2.0 以 ELO 1283 领跑图像编辑，
              Google Nano Banana 2（Gemini 3.1 Flash 图像版）以 ELO 1232 紧随，Recraft 同时发布 V4 与 V4 Pro 两款商业级模型。
            </p>
          </div>
        </div>
      </section>

      <Divider />

      {/* 05 厂商分析 */}
      <section>
        <SectionLabel n="05">厂商分析</SectionLabel>
        <SectionTitle>谁在 2 月最活跃？</SectionTitle>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">按本月 LLM 发布数量排列，点击厂商名跳转厂商详情页。</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {Object.entries(
            ALL_LLM.reduce<Record<string, typeof ALL_LLM>>((acc, m) => {
              if (!acc[m.provider]) acc[m.provider] = [];
              acc[m.provider].push(m);
              return acc;
            }, {})
          )
            .sort((a, b) => b[1].length - a[1].length)
            .map(([provider, providerModels]) => {
              const bestIntel = Math.max(...providerModels.map(m => m.intel ?? 0));
              const providerCn = providerModels[0]?.providerCn;
              const isCn = CN_MODELS.some(m => m.provider === provider);
              return (
                <Link
                  key={provider}
                  to={`/provider/${encodeURIComponent(provider)}`}
                  className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-primary/40 hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-black text-slate-900 group-hover:text-primary transition-colors text-sm">
                          {providerCn ?? provider}
                        </span>
                        {isCn && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600">国内</span>}
                      </div>
                      <p className="text-xs text-slate-400">{provider}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-2xl font-black text-primary">{providerModels.length}</p>
                      <p className="text-[10px] text-slate-400">个发布</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                    <span>最高智能指数：<strong className="text-slate-700">{bestIntel > 0 ? bestIntel : '—'}</strong></span>
                    <span className="flex items-center gap-1 text-primary font-bold">查看厂商 <ChevronRight className="w-3 h-3" /></span>
                  </div>
                </Link>
              );
            })}
        </div>

        {/* Alibaba spotlight */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
          <p className="font-black text-amber-900 text-sm mb-2">阿里巴巴本月发布量领先：5 款型号全面覆盖</p>
          <p className="text-sm text-amber-800 leading-relaxed mb-3">
            Qwen3.5 系列以 MoE 架构覆盖 27B、35B、122B、397B 四个参数规模，另附代码专项模型 Qwen3 Coder Next，共计 5 款。
            全系 Qwen3.5 支持 256K 上下文及文本 + 图像 + 视频三模态输入，定价 ¥1.7~¥4.1/M。
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['qwen3-5-27b', 'qwen3-5-35b-a3b', 'qwen3-5-122b-a10b', 'qwen3-5-397b-a17b'] as const).map(slug => {
              const m = CN_MODELS.find(x => x.slug === slug)!;
              return (
                <Link key={slug} to={`/model/${slug}`} className="bg-white/60 rounded-xl px-3 py-2 text-center hover:bg-white transition-colors">
                  <p className="text-xs font-black text-amber-900 mb-0.5">{m.name.replace('Qwen3.5 ', '')}</p>
                  <p className="text-[11px] text-amber-700">智能 {m.intel} · {cnyFmt(m.inputCny)}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Divider />

      {/* 06 性价比分析 */}
      <section>
        <SectionLabel n="06">性价比分析</SectionLabel>
        <SectionTitle>定价 vs 智能指数：真实对比</SectionTitle>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          仅含有定价信息的付费模型（定价数据待确认的模型已排除）。输入价格单位：人民币 / 百万 tokens。
        </p>
        <div className="space-y-2">
          {ALL_LLM
            .filter(m => m.intel !== null && m.inputCny > 0)
            .sort((a, b) => (b.intel ?? 0) - (a.intel ?? 0))
            .map(m => {
              const pct = Math.min(((m.intel ?? 0) / 60) * 100, 100);
              const isCn = CN_MODELS.some(x => x.slug === m.slug);
              return (
                <Link key={m.slug} to={`/model/${m.slug}`} className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-primary/30 transition-colors group">
                  <div className="w-36 shrink-0 hidden sm:block">
                    <p className="text-xs font-bold text-slate-700 group-hover:text-primary truncate">{m.name}</p>
                    <p className="text-[10px] text-slate-400">
                      <ProviderLink name={m.provider}>{m.providerCn ?? m.provider}</ProviderLink>
                    </p>
                  </div>
                  <div className="flex-1 bg-slate-100 rounded-full h-2 min-w-0">
                    <div
                      className={`h-2 rounded-full transition-all ${isCn ? 'bg-emerald-500' : 'bg-primary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-slate-700 w-8 tabular-nums shrink-0">{m.intel}</span>
                  <span className="text-xs font-bold w-20 text-right tabular-nums shrink-0 text-slate-500">
                    {cnyFmt(m.inputCny)}/M
                  </span>
                </Link>
              );
            })}
        </div>
        <div className="mt-4 flex items-center gap-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-primary inline-block" />国际厂商</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-2 rounded-full bg-emerald-500 inline-block" />中国厂商</span>
        </div>

        <div className="mt-5 bg-primary/5 border border-primary/15 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <DollarSign className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-sm text-slate-900 mb-1">价格洼地：中国厂商的竞争力</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                本月最高智能指数模型 Gemini 3.1 Pro Preview 定价 ¥13.7/M（输入），
                同档次的 Qwen3.5 27B 仅需 ¥2.1/M，GLM-5 为 ¥6.9/M，MiniMax-M2.5 为 ¥2.1/M。
                中国头部模型在价格上具有 2x–7x 的显著优势。
              </p>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* 07 选型指南 */}
      <section>
        <SectionLabel n="07">选型指南</SectionLabel>
        <SectionTitle>按场景推荐：基于 2 月真实数据</SectionTitle>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">以下推荐均基于本月实测指标，点击模型名查看详情。</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              scene: '综合能力最强',
              icon: Brain,
              models: [
                { slug: 'gemini-3-1-pro-preview', label: 'Gemini 3.1 Pro Preview', note: '智能指数 57.2，本月第一' },
                { slug: 'gpt-5-3-codex', label: 'GPT-5.3 Codex', note: '智能指数 54.0，代码极强' },
                { slug: 'claude-opus-4-6-adaptive', label: 'Claude Opus 4.6', note: '智能指数 53.0，1M 上下文' },
              ],
              tip: '追求极致综合性能、预算充足，选 Gemini 3.1 Pro Preview',
            },
            {
              scene: '代码 / Agent 开发',
              icon: Code2,
              models: [
                { slug: 'gpt-5-3-codex', label: 'GPT-5.3 Codex', note: '编程指数 53.1，代码专项旗舰' },
                { slug: 'claude-sonnet-4-6-adaptive', label: 'Claude Sonnet 4.6', note: '编程指数 50.9，性价比更高' },
                { slug: 'claude-opus-4-6-adaptive', label: 'Claude Opus 4.6', note: '编程指数 48.1，长上下文' },
              ],
              tip: 'GPT-5.3 Codex 专为代码优化，Claude Sonnet 4.6 兼顾性价比',
            },
            {
              scene: '成本敏感 / 高并发',
              icon: DollarSign,
              models: [
                { slug: 'qwen3-5-27b', label: 'Qwen3.5 27B', note: '¥2.1/M，智能指数 42.1' },
                { slug: 'minimax-m2-5', label: 'MiniMax-M2.5', note: '¥2.1/M，智能指数 41.9' },
                { slug: 'mercury-2', label: 'Mercury 2', note: '¥1.7/M，编程指数 30.6' },
              ],
              tip: 'Qwen3.5 27B 和 MiniMax-M2.5 在低价位提供优秀性能',
            },
            {
              scene: '超长上下文 (≥200K)',
              icon: Zap,
              models: [
                { slug: 'gemini-3-1-pro-preview', label: 'Gemini 3.1 Pro Preview', note: '1M Token，五模态超长上下文' },
                { slug: 'claude-opus-4-6-adaptive', label: 'Claude Opus 4.6', note: '1M Token，长文档综合理解' },
                { slug: 'gpt-5-3-codex', label: 'GPT-5.3 Codex', note: '400K，代码库全量分析' },
              ],
              tip: 'Gemini 3.1 Pro Preview 与 Claude 4.6 支持 1M Token，适合超大代码库、长文档全量输入',
            },
          ].map(r => (
            <div key={r.scene} className="bg-white border border-slate-200 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-primary/10 rounded-lg">
                  <r.icon className="w-4 h-4 text-primary" />
                </div>
                <h4 className="font-black text-sm text-slate-900">{r.scene}</h4>
              </div>
              <div className="space-y-2 mb-4">
                {r.models.map((m, i) => (
                  <div key={m.slug} className="flex items-start gap-2">
                    <span className="text-[10px] font-black text-primary w-4 mt-0.5">{i + 1}</span>
                    <div>
                      <Link to={`/model/${m.slug}`} className="text-sm font-bold text-slate-800 hover:text-primary transition-colors">
                        {m.label}
                      </Link>
                      <p className="text-[11px] text-slate-400">{m.note}</p>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">{r.tip}</p>
            </div>
          ))}
        </div>
      </section>

      <Divider />

      {/* Footer CTA */}
      <div className="bg-slate-900 rounded-3xl p-8 text-center">
        <Cpu className="w-8 h-8 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-black text-white mb-3">深入研究某个模型？</h3>
        <p className="text-slate-400 text-sm mb-6 max-w-md mx-auto">
          Token Galaxy 提供全部 2 月发布模型的完整性能数据、API 定价与开发者评测。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/leaderboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-black hover:bg-indigo-700 transition-all"
          >
            <BarChart3 className="w-4 h-4" /> 查看完整榜单
          </Link>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-black hover:bg-white/20 transition-all"
          >
            <Brain className="w-4 h-4" /> 智能选型
          </Link>
        </div>
        <p className="text-slate-600 text-xs mt-6">
          数据来源：Token Galaxy 实测数据库 · 统计周期：2026-02-01 至 2026-02-28 · 转载请注明来源
        </p>
      </div>
    </div>
  );
};
