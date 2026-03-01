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

// ─── LLM 数据（Token Galaxy Supabase，2026-01，已去重，名称已去括号）────────
// 原始 11 条 → 去重后 9 款

const CN_MODELS = [
  { slug: 'kimi-k2-5', name: 'Kimi K2.5', provider: 'Kimi', providerCn: '月之暗面', date: '2026-01-27', intel: 46.8, coding: 39.5, gpqa: 0.879, inputCny: 4.12, outputCny: 20.58, contextK: 256 },
  { slug: 'qwen3-max-thinking', name: 'Qwen3 Max Thinking', provider: 'Alibaba', providerCn: '阿里巴巴', date: '2026-01-26', intel: 39.9, coding: 30.5, gpqa: 0.861, inputCny: 8.23, outputCny: 41.16, contextK: 256 },
  { slug: 'glm-4-7-flash', name: 'GLM-4.7-Flash', provider: 'Z AI', providerCn: '智谱', date: '2026-01-19', intel: 30.1, coding: 25.9, gpqa: 0.581, inputCny: 0.4459, outputCny: 2.744, contextK: 198 },
];

const GLOBAL_MODELS = [
  { slug: 'falcon-h1r-7b', name: 'Falcon-H1R-7B', provider: 'TII UAE', providerCn: null, date: '2026-01-04', intel: 15.8, coding: 9.8, gpqa: 0.661, inputCny: 0, outputCny: 0, contextK: null },
  { slug: 'step3-vl-10b', name: 'Step3 VL 10B', provider: 'StepFun', providerCn: null, date: '2026-01-20', intel: 15.4, coding: 13.9, gpqa: 0.690, inputCny: 0, outputCny: 0, contextK: null },
  { slug: 'olmo-3-1-32b-instruct', name: 'Olmo 3.1 32B Instruct', provider: 'Allen Institute for AI', providerCn: null, date: '2026-01-13', intel: null, coding: 5.6, gpqa: 0.539, inputCny: 1.372, outputCny: 4.116, contextK: 64 },
  { slug: 'lfm2-5-1-2b-instruct', name: 'LFM2.5-1.2B-Instruct', provider: 'Liquid AI', providerCn: null, date: '2026-01-05', intel: null, coding: 0.8, gpqa: 0.326, inputCny: 0, outputCny: 0, contextK: 32 },
  { slug: 'lfm2-5-1-2b-thinking', name: 'LFM2.5-1.2B-Thinking', provider: 'Liquid AI', providerCn: null, date: '2026-01-20', intel: null, coding: 1.4, gpqa: 0.339, inputCny: 0, outputCny: 0, contextK: 32 },
  { slug: 'lfm2-5-vl-1-6b', name: 'LFM2.5-VL-1.6B', provider: 'Liquid AI', providerCn: null, date: '2026-01-05', intel: null, coding: 1.0, gpqa: 0.289, inputCny: 0, outputCny: 0, contextK: null },
];

const ALL_LLM = [...CN_MODELS, ...GLOBAL_MODELS];
const TOP5 = ALL_LLM.filter(m => m.intel !== null).sort((a, b) => (b.intel ?? 0) - (a.intel ?? 0)).slice(0, 5);

// ─── 多模态数据（Token Galaxy Supabase，2026-01 发布）────────────────────────

const VIDEO_MODELS = [
  { slug: 'image_to_video::grok-imagine-video', name: 'Grok Imagine Video', provider: 'xAI', elo: 1336, isCn: false },
  { slug: 'image_to_video::vidu-q3-pro', name: 'Vidu Q3 Pro', provider: 'Vidu', elo: 1292, isCn: true },
  { slug: 'image_to_video::kling-2-6-standard-january-no-audio', name: 'Kling 2.6 Standard', provider: 'KlingAI', elo: 1275, isCn: true },
  { slug: 'image_to_video::tele-video', name: 'TeleVideo 2.0', provider: 'TeleAI', elo: 1271, isCn: false },
  { slug: 'image_to_video::veo-3-1-fast', name: 'Veo 3.1 Fast', provider: 'Google', elo: 1271, isCn: false },
];

const IMAGE_MODELS = [
  { slug: 'image_editing::grok-imagine-image', name: 'Grok Imagine Image', provider: 'xAI', elo: 1220, isCn: false },
  { slug: 'image_editing::tencent_hunyuanimage-3-0-instruct--fal', name: 'HunyuanImage 3.0 Instruct', provider: 'Tencent', elo: 1219, isCn: true },
  { slug: 'image_editing::flux_flux-2-klein-9b', name: 'FLUX.2 [klein] 9B', provider: 'Black Forest Labs', elo: 1163, isCn: false },
  { slug: 'image_editing::eigenai_eigen-image', name: 'Eigen Image', provider: 'Eigen AI', elo: 1159, isCn: false },
  { slug: 'image_editing::qwen-image-edit-max-2601', name: 'Qwen Image Edit Max', provider: 'Alibaba', elo: 1148, isCn: true },
];

// ─── 关键洞察 ─────────────────────────────────────────────────────────────────

const KEY_FINDINGS = [
  {
    icon: TrendingUp,
    color: 'text-violet-600',
    bg: 'bg-violet-50 border-violet-200',
    title: '月之暗面 Kimi K2.5 以智能指数 46.8 领跑本月所有新发布 LLM',
    body: 'Kimi K2.5 于 2026-01-27 发布，智能指数 46.8、GPQA 87.9%、256K 超长上下文，定价 ¥4.1/M，是本月综合表现最强的新发布 LLM，也是中国厂商连续月份领跑的延续。',
  },
  {
    icon: Globe,
    color: 'text-slate-600',
    bg: 'bg-slate-50 border-slate-200',
    title: '本月 LLM 发布偏少，中国厂商包揽前三强',
    body: '1 月仅 9 款新 LLM 发布，为近几个月最少。TOP 3（Kimi K2.5、Qwen3 Max Thinking、GLM-4.7-Flash）均来自中国厂商，国际侧以 Liquid AI 轻量实验性模型为主，缺乏旗舰级发布。',
  },
  {
    icon: Film,
    color: 'text-rose-600',
    bg: 'bg-rose-50 border-rose-200',
    title: 'xAI 双线出击：视频 + 图像生成双榜夺冠',
    body: 'xAI 本月同步发布 Grok Imagine Video（ELO 1336，视频榜首）和 Grok Imagine Image（ELO 1220，图像榜首），标志其全面进军多模态赛道，成为 1 月多模态领域最大黑马。',
  },
  {
    icon: ImageIcon,
    color: 'text-blue-600',
    bg: 'bg-blue-50 border-blue-200',
    title: '腾讯 HunyuanImage 3.0 & 阿里巴巴图像系列密集发布',
    body: '腾讯 HunyuanImage 3.0 Instruct 以 ELO 1219 紧追 xAI 位居图像榜第二；阿里巴巴本月在图像赛道发布 Qwen Image Edit Max、Qwen Image Plus、Wan2.6 T2I、Z-Image Base 共 4 款模型，显示中国图像生成实力持续扩张。',
  },
  {
    icon: DollarSign,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50 border-emerald-200',
    title: 'GLM-4.7-Flash 以 ¥0.45/M 的极低定价入市',
    body: '智谱 GLM-4.7-Flash 以 ¥0.45/M（输入）的极低定价发布，智能指数 30.1，支持约 200K 上下文，是本月成本性价比最突出的新发布 LLM，适合中低复杂度场景的规模化部署。',
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

function IntelBar({ value, max = 50 }: { value: number | null; max?: number }) {
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
                <span className={`text-xs font-black tabular-nums ${m.intel && m.intel >= 40 ? 'text-primary' : m.intel && m.intel >= 25 ? 'text-slate-700' : 'text-slate-400'}`}>
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

export const Whitepaper202601 = () => {
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
        <span className="text-slate-900 font-medium">2026年1月白皮书</span>
      </nav>

      {/* Hero */}
      <div className="mb-12">
        <div className="flex items-center gap-2 mb-5">
          <span className="text-[10px] font-black tracking-widest text-white bg-primary px-3 py-1 rounded-full uppercase">月度白皮书</span>
          <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Jan 2026</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 leading-tight mb-5">
          大模型行业月报<br />
          <span className="text-primary">2026 年 1 月</span>
        </h1>
        <p className="text-base text-slate-500 max-w-2xl leading-relaxed mb-8">
          本报告数据来自 Token Galaxy 实时追踪数据库，覆盖 2026 年 1 月 1 日至 31 日所有已收录新发布大语言模型及多模态模型，
          含智能指数、代码能力、定价及视频/图像生成 ELO 分。所有指标均为实测数据。
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
          <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-primary" />发布：2026年1月31日</span>
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
          { label: 'LLM 新发布', value: '9', sub: '已去重 · 7 家厂商' },
          { label: '多模态新发布', value: '23', sub: '10 视频 · 13 图像' },
          { label: '参与厂商合计', value: '15', sub: '含 LLM + 多模态' },
          { label: '超长上下文 ≥128K', value: '3', sub: 'Kimi · Qwen3 · GLM' },
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
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">以下洞察均基于 Token Galaxy 1月实测数据，非估算。</p>
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
        <SectionTitle>1月新发布模型：智能指数 Top 5</SectionTitle>
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
        <SectionTitle>1 月所有新发布 LLM（9 个，已去重）</SectionTitle>
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
        <SectionTitle>图像 &amp; 视频生成：1 月新品一览</SectionTitle>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          多模态模型以 ELO 竞技场分衡量生成质量，数据来自 Token Galaxy 多模态排行榜。展示各类别 ELO Top 5。
        </p>

        {/* 视频生成 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Film className="w-4 h-4 text-rose-500" />
            <h3 className="text-sm font-black text-slate-900">视频生成 Top 5</h3>
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
                <span className="text-sm font-black text-rose-600 tabular-nums shrink-0">ELO {m.elo}</span>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>
          <div className="mt-3 bg-rose-50 border border-rose-200 rounded-2xl p-4">
            <p className="text-sm text-rose-800 leading-relaxed">
              xAI Grok Imagine Video 以 ELO 1336 夺得本月视频生成榜首，是该赛道首款进入 1300+ 的模型。
              中国厂商 Vidu Q3 Pro（ELO 1292）、KlingAI Kling 2.6（ELO 1275）分列二、三位；
              Google Veo 3.1 Fast 同步发布，国际与国内厂商竞争进一步白热化。
            </p>
          </div>
        </div>

        {/* 图像生成 */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ImageIcon className="w-4 h-4 text-blue-500" />
            <h3 className="text-sm font-black text-slate-900">图像生成 Top 5</h3>
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
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors">{m.name}</span>
                    {m.isCn && <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-600 shrink-0">国内</span>}
                  </div>
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
              图像生成赛道本月竞争激烈：xAI Grok Imagine Image（ELO 1220）与腾讯 HunyuanImage 3.0（ELO 1219）几乎并列，
              差距仅 1 分。Black Forest Labs 发布 FLUX.2 [klein] 系列多款尺寸，阿里巴巴一次性投入 4 款图像模型，
              中国厂商在图像赛道正快速缩小与国际的差距。
            </p>
          </div>
        </div>
      </section>

      <Divider />

      {/* 05 厂商分析 */}
      <section>
        <SectionLabel n="05">厂商分析</SectionLabel>
        <SectionTitle>LLM 厂商：1 月发布情况</SectionTitle>
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

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">
          <p className="font-black text-slate-900 text-sm mb-2">月度观察：国际厂商 1 月相对沉寂</p>
          <p className="text-sm text-slate-600 leading-relaxed">
            本月国际厂商 LLM 发布以 Liquid AI 轻量实验性模型（1.2B/1.6B）为主，缺乏旗舰级产品。
            TII UAE（阿联酋）Falcon-H1R-7B 是本月唯一来自非中美阵营的具备一定性能的新品（智能指数 15.8）。
            多模态赛道则完全相反——xAI、Google 均有重磅发布，形成 LLM 与多模态的鲜明反差。
          </p>
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
              const pct = Math.min(((m.intel ?? 0) / 50) * 100, 100);
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
              <p className="font-black text-sm text-slate-900 mb-1">本月最佳性价比：GLM-4.7-Flash</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                GLM-4.7-Flash 以 ¥0.45/M 的极低输入定价发布，智能指数 30.1，支持约 200K 上下文。
                相比同档次的 Kimi K2.5（¥4.1/M，智能 46.8），GLM-4.7-Flash 适合对成本极度敏感、任务复杂度中等的场景。
                Qwen3 Max Thinking 定价 ¥8.2/M，智能指数 39.9，适合需要深度思考的任务但预算有限时可作中档选择。
              </p>
            </div>
          </div>
        </div>
      </section>

      <Divider />

      {/* 07 选型指南 */}
      <section>
        <SectionLabel n="07">选型指南</SectionLabel>
        <SectionTitle>按场景推荐：基于 1 月真实数据</SectionTitle>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">以下推荐均基于本月实测指标，点击模型名查看详情。</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              scene: '综合能力最强',
              icon: Brain,
              models: [
                { slug: 'kimi-k2-5', label: 'Kimi K2.5', note: '智能指数 46.8，本月第一' },
                { slug: 'qwen3-max-thinking', label: 'Qwen3 Max Thinking', note: '智能指数 39.9，256K 上下文' },
                { slug: 'glm-4-7-flash', label: 'GLM-4.7-Flash', note: '智能指数 30.1，性价比极高' },
              ],
              tip: '本月 LLM 整体发布偏少，Kimi K2.5 是唯一明显拉开差距的旗舰选择',
            },
            {
              scene: '代码 / Agent 开发',
              icon: Code2,
              models: [
                { slug: 'kimi-k2-5', label: 'Kimi K2.5', note: '编程指数 39.5，本月代码最强' },
                { slug: 'qwen3-max-thinking', label: 'Qwen3 Max Thinking', note: '编程指数 30.5，深度推理' },
                { slug: 'glm-4-7-flash', label: 'GLM-4.7-Flash', note: '编程指数 25.9，¥0.45/M' },
              ],
              tip: '代码场景首选 Kimi K2.5，成本敏感场景可用 GLM-4.7-Flash 替代',
            },
            {
              scene: '成本敏感 / 高并发',
              icon: DollarSign,
              models: [
                { slug: 'glm-4-7-flash', label: 'GLM-4.7-Flash', note: '¥0.45/M，本月最低价有效模型' },
                { slug: 'kimi-k2-5', label: 'Kimi K2.5', note: '¥4.1/M，性价比均衡' },
                { slug: 'olmo-3-1-32b-instruct', label: 'Olmo 3.1 32B', note: '¥1.4/M，开源架构' },
              ],
              tip: 'GLM-4.7-Flash 是本月成本最优选择，比 Kimi K2.5 便宜约 9 倍',
            },
            {
              scene: '超长上下文 (≥128K)',
              icon: Zap,
              models: [
                { slug: 'kimi-k2-5', label: 'Kimi K2.5', note: '256K Token，综合能力最强' },
                { slug: 'qwen3-max-thinking', label: 'Qwen3 Max Thinking', note: '256K Token，深度思考场景' },
                { slug: 'glm-4-7-flash', label: 'GLM-4.7-Flash', note: '约 200K Token，极低成本' },
              ],
              tip: '本月 LLM 中仅 3 款支持 128K+ 上下文，且均来自中国厂商',
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
          Token Galaxy 提供全部 1 月发布模型的完整性能数据、API 定价与开发者评测。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/leaderboard"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-black hover:bg-indigo-700 transition-all"
          >
            <BarChart3 className="w-4 h-4" /> 查看完整榜单
          </Link>
          <Link
            to="/whitepaper/2026-02"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-xl font-black hover:bg-white/20 transition-all"
          >
            <Brain className="w-4 h-4" /> 阅读 2 月白皮书
          </Link>
        </div>
        <p className="text-slate-600 text-xs mt-6">
          数据来源：Token Galaxy 实测数据库 · 统计周期：2026-01-01 至 2026-01-31 · 转载请注明来源
        </p>
      </div>
    </div>
  );
};
