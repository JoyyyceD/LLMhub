import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Verified,
  Database,
  Globe,
  Star,
  Rocket,
  BarChart3,
  CreditCard,
  Network,
  HelpCircle,
  ChevronRight,
  Home as HomeIcon,
  Terminal,
  Cpu,
  ShieldCheck,
  TrendingUp,
  Zap,
  ExternalLink,
  Clock,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { ModelSnapshot } from '../types';

const USD_TO_CNY = 7.25;

function fmtCny(usd: number | null | undefined): string {
  if (usd == null) return 'N/A';
  return `¥${(usd * USD_TO_CNY).toFixed(1)}`;
}

function fmtUsd(usd: number | null | undefined): string {
  if (usd == null) return 'N/A';
  return `$${usd.toFixed(1)}`;
}

function fmtNum(n: number | null | undefined, decimals = 2): string {
  if (n == null) return 'N/A';
  return n.toFixed(decimals);
}

function fmtPct(n: number | null | undefined): string {
  if (n == null) return 'N/A';
  return (n * 100).toFixed(1);
}

function fmtTtft(s: number | null | undefined): string {
  if (s == null) return 'N/A';
  return `${s.toFixed(3)}s`;
}

function fmtTps(t: number | null | undefined): string {
  if (t == null) return 'N/A';
  return `${t.toFixed(1)} t/s`;
}

function fmtCtx(n: number | null | undefined): string {
  if (n == null) return 'N/A';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return String(n);
}

const STATIC_PROVIDERS = [
  {
    id: 'openrouter',
    name: 'OpenRouter',
    logo: 'OR',
    pricing: null as null | string,
    features: ['聚合网关', '多模型支持', '按量计费'],
    status: 'stable',
    latency: '~350ms',
    isOfficial: false,
  },
  {
    id: 'siliconflow',
    name: 'SiliconFlow (硅基流动)',
    logo: 'SF',
    pricing: null,
    features: ['高并发', '大陆直连', '赠送额度'],
    status: 'stable',
    latency: '~120ms',
    isOfficial: false,
  },
];

export const ModelDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [model, setModel] = useState<ModelSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'details' | 'providers'>('details');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    supabase
      .from('model_snapshots')
      .select('*')
      .eq('aa_slug', id)
      .single()
      .then(({ data, error: err }) => {
        if (err || !data) {
          setError('模型数据未找到，请确认 URL 是否正确。');
        } else {
          setModel(data as ModelSnapshot);
        }
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !model) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-12 h-12 mx-auto mb-4 text-rose-400" />
        <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{error || '模型未找到'}</p>
        <Link to="/leaderboard" className="mt-4 inline-block text-primary font-bold hover:underline">
          ← 返回排行榜
        </Link>
      </div>
    );
  }

  const isLlm = (model.aa_modality ?? 'llm') === 'llm';
  const isTts = model.aa_modality === 'text_to_speech';
  const modalityLabelMap: Record<string, string> = {
    llm: 'LLM模型',
    text_to_image: '文生图模型',
    image_editing: '图像编辑模型',
    text_to_speech: '语音合成 / TTS模型',
    text_to_video: '文生视频模型',
    image_to_video: '图生视频模型',
  };
  const modalityLabel = modalityLabelMap[model.aa_modality ?? 'llm'] ?? (model.aa_modality ?? 'LLM模型');
  const creatorDisplay = model.is_cn_provider
    ? (model.aa_model_creator_name_cn ?? model.aa_model_creator_name ?? 'N/A')
    : (model.aa_model_creator_name ?? 'N/A');
  const providerLink = model.aa_model_creator_name
    ? `/provider/${encodeURIComponent(model.aa_model_creator_name)}`
    : null;
  const reviewLink = `/review/new?model=${encodeURIComponent(model.aa_slug)}&modality=${encodeURIComponent(model.aa_modality ?? 'llm')}`;
  const hasPricing =
    model.aa_price_input_usd != null ||
    model.aa_price_output_usd != null ||
    model.aa_price_blended_usd != null;

  const benchmarks = [
    { name: 'Intelligence Index', desc: '综合智力', value: fmtNum(model.aa_intelligence_index) },
    { name: 'Coding Index', desc: '代码', value: fmtNum(model.aa_coding_index) },
    { name: 'GQPA Diamond Benchmark', desc: '研究生科学', value: fmtPct(model.aa_gpqa) },
    { name: "Humanity's Last Exam Benchmark", desc: '硬逻辑', value: fmtPct(model.aa_hle) },
    { name: 'IFBench Benchmark', desc: '指令遵循', value: fmtPct(model.aa_ifbench) },
    { name: 'LiveCodeBench Benchmark', desc: '长文召回', value: fmtPct(model.aa_lcr) },
    { name: 'SciCode Benchmark', desc: '科学计算', value: fmtPct(model.aa_scicode) },
    { name: 'Terminal-Bench Hard Benchmark', desc: '命令行', value: fmtPct(model.aa_terminalbench_hard) },
    { name: 'tau2 Bench Telecom Benchmark', desc: '工具调用', value: fmtNum(model.aa_tau2) },
  ].filter(({ value }) => value !== 'N/A');

  const multimodalMetrics: Array<{ name: string; desc: string; value: string }> = (() => {
    const rows: Array<{ key: keyof ModelSnapshot; name: string; desc: string }> = [{ key: 'aa_elo', name: 'ELO', desc: '综合 ELO评分' }];
    if (model.aa_modality === 'text_to_image') {
      rows.push(
        { key: 'category_style_anime_elo', name: 'Anime', desc: '动漫风评分' },
        { key: 'category_style_cartoon_illustration_elo', name: 'Cartoon/Illustration', desc: '卡通/插画评分' },
        { key: 'category_style_general_photorealistic_elo', name: 'General & Photorealistic', desc: '通用 & 写实评分' },
        { key: 'category_style_graphic_design_digital_rendering_elo', name: 'Graphic Design', desc: '平面设计评分' },
        { key: 'category_style_traditional_art_elo', name: 'Traditional Art', desc: '传统艺术评分' },
        { key: 'category_subject_commercial_elo', name: 'Commercial', desc: '商业视觉评分' }
      );
    }
    if (model.aa_modality === 'text_to_video' || model.aa_modality === 'image_to_video') {
      rows.push(
        { key: 'category_format_short_prompt_elo', name: 'Short Prompt', desc: '短提示词评分' },
        { key: 'category_format_long_prompt_elo', name: 'Long Prompt', desc: '长提示词评分' },
        { key: 'category_format_moving_camera_elo', name: 'Moving Camera', desc: '运镜评分' },
        { key: 'category_format_multi_scene_elo', name: 'Multi-Scene', desc: '多场景评分' },
        { key: 'category_style_photorealistic_elo', name: 'Photorealistic', desc: '写实/照片级真实评分' },
        { key: 'category_style_cartoon_and_anime_elo', name: 'Cartoon & Anime', desc: '卡通/动漫评分' },
        { key: 'category_style_3d_animation_elo', name: '3D Animation', desc: '3D 动画/CG 风评分' }
      );
    }
    return rows
      .map((r) => ({ name: r.name, desc: r.desc, value: fmtNum(model[r.key] as number | null | undefined) }))
      .filter((r) => r.value !== 'N/A');
  })();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-8">
        <Link to="/" className="hover:text-primary transition-colors flex items-center gap-1">
          <HomeIcon className="w-4 h-4" /> 首页
        </Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/leaderboard" className="hover:text-primary transition-colors">模型库</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 dark:text-white font-medium">{model.aa_name.replace(/\s*\(.*?\)\s*/g, '')}</span>
      </nav>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-2xl bg-slate-900 flex items-center justify-center shadow-xl overflow-hidden ring-1 ring-slate-200 dark:ring-slate-700">
            <div className="text-white font-bold text-2xl">{model.aa_name.replace(/\s*\(.*?\)\s*/g, '').substring(0, 2)}</div>
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                {model.aa_name.replace(/\s*\(.*?\)\s*/g, '')}
              </h1>
              {model.is_cn_provider && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  国内可用
                </span>
              )}
            </div>
            <div className="flex items-center gap-5 text-slate-500 dark:text-slate-400 text-sm flex-wrap">
              {creatorDisplay && (
                <span className="flex items-center gap-1.5">
                  <Verified className="w-4 h-4 text-blue-500" />
                  {providerLink ? (
                    <Link to={providerLink} className="hover:text-primary hover:underline transition-colors">
                      {creatorDisplay}
                    </Link>
                  ) : (
                    creatorDisplay
                  )}
                </span>
              )}
              {model.aa_context_length && (
                <span className="flex items-center gap-1.5">
                  <Database className="w-4 h-4" /> {fmtCtx(model.aa_context_length)} 上下文
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4" /> {model.has_or ? 'OpenRouter 可用' : 'AA 数据'}
              </span>
              {model.aa_release_date && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> {model.aa_release_date}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link
            to={reviewLink}
            className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
          >
            <Star className="w-5 h-5 text-primary" /> 点评
          </Link>
          <button
            onClick={() => setActiveTab('details')}
            className="flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 dark:shadow-none"
          >
            <Rocket className="w-5 h-5" /> 查看模型
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 mb-8">
        <nav className="flex gap-10">
          {[
            { key: 'details', label: '模型详情' },
            { key: 'providers', label: 'API 供应商' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as 'details' | 'providers')}
              className={`pb-4 px-1 border-b-2 font-semibold text-[15px] transition-all ${
                activeTab === key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3 space-y-8">
          {activeTab === 'details' ? (
            <>
              {!isLlm && (
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2.5">
                    <Cpu className="w-6 h-6 text-primary" /> 模型信息
                  </h2>
                  <div className={`grid grid-cols-1 ${isTts ? 'md:grid-cols-2' : 'md:grid-cols-3'} gap-6`}>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">厂商</p>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100">
                        {providerLink ? (
                          <Link to={providerLink} className="hover:text-primary hover:underline transition-colors">
                            {creatorDisplay}
                          </Link>
                        ) : (
                          creatorDisplay
                        )}
                      </p>
                    </div>
                    {!isTts && (
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">更新日期</p>
                        <p className="text-lg font-black text-slate-800 dark:text-slate-100">{model.aa_release_date ?? 'N/A'}</p>
                      </div>
                    )}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">模型类型</p>
                      <p className="text-lg font-black text-slate-800 dark:text-slate-100">{modalityLabel}</p>
                    </div>
                  </div>
                </section>
              )}

              {isLlm && (
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2.5">
                    <Cpu className="w-6 h-6 text-primary" /> 性能指标
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> 首字延迟
                      </p>
                      <p className="text-2xl font-black text-primary font-display">{fmtTtft(model.aa_ttft_seconds)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" /> 吞吐量
                      </p>
                      <p className="text-2xl font-black text-primary font-display">{fmtTps(model.aa_tps)}</p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Terminal className="w-3 h-3" /> 智力指数
                      </p>
                      <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-display">
                        {fmtNum(model.aa_intelligence_index)}
                      </p>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Zap className="w-3 h-3" /> 代码指数
                      </p>
                      <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 font-display">
                        {fmtNum(model.aa_coding_index)}
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Benchmarks table */}
              {isLlm && benchmarks.length > 0 && (
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" /> 评测跑分
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500">
                        <tr>
                          <th className="px-8 py-4 font-semibold">评估基准</th>
                          <th className="px-8 py-4 font-bold text-primary">{model.aa_name.replace(/\s*\(.*?\)\s*/g, '')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {benchmarks.map(({ name, desc, value }) => (
                          <tr key={name}>
                            <td className="px-8 py-5">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700 dark:text-slate-200">{name}</span>
                                <span className="text-xs text-slate-400 font-normal mt-0.5">{desc}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5 font-bold text-primary">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}

              {!isLlm && multimodalMetrics.length > 0 && (
                <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                  <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" /> 品类性能指标
                    </h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500">
                        <tr>
                          <th className="px-8 py-4 font-semibold">指标</th>
                          <th className="px-8 py-4 font-bold text-primary">{model.aa_name.replace(/\s*\(.*?\)\s*/g, '')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {multimodalMetrics.map(({ name, desc, value }) => (
                          <tr key={name}>
                            <td className="px-8 py-5">
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-700 dark:text-slate-200">{name}</span>
                                <span className="text-xs text-slate-400 font-normal mt-0.5">{desc}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5 font-bold text-primary">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}
            </>
          ) : (
            <section className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-xl font-bold flex items-center gap-2.5">
                  <Network className="w-6 h-6 text-primary" /> 可用 API 供应商
                </h2>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  示例供应商（详情请前往各平台确认）
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {STATIC_PROVIDERS.map((provider) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:shadow-lg transition-all group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xl font-black text-slate-400 group-hover:text-primary transition-colors">
                          {provider.logo}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{provider.name}</h3>
                            {provider.isOfficial && (
                              <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black rounded uppercase tracking-widest">官方</span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-3">
                            {provider.features.map((f) => (
                              <span key={f} className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                <Zap className="w-3 h-3 text-amber-400" /> {f}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-8 md:gap-12">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">平均延迟</span>
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300 font-display">{provider.latency}</span>
                        </div>
                        <button className="px-6 py-2.5 bg-slate-900 dark:bg-white dark:text-slate-900 text-white rounded-xl text-sm font-bold hover:opacity-90 transition-all flex items-center gap-2">
                          立即接入 <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/30 p-6 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center text-center">
                <HelpCircle className="w-8 h-8 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-1">没有找到合适的供应商？</h4>
                <p className="text-xs text-slate-500 max-w-md">
                  我们正在持续收录更多优质 API 供应商。如果您是供应商，欢迎提交您的 API 端点进行评测。
                </p>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Pricing */}
          {hasPricing && (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <h3 className="font-bold mb-4 flex items-center gap-2 text-slate-800 dark:text-white">
                <CreditCard className="w-5 h-5 text-primary" /> 计费明细
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">输入 (Input)</span>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 dark:text-white">{fmtCny(model.aa_price_input_usd)} / 1M</p>
                    <p className="text-[10px] text-slate-400">{fmtUsd(model.aa_price_input_usd)}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">输出 (Output)</span>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 dark:text-white">{fmtCny(model.aa_price_output_usd)} / 1M</p>
                    <p className="text-[10px] text-slate-400">{fmtUsd(model.aa_price_output_usd)}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">混合 (Blended)</span>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{fmtCny(model.aa_price_blended_usd)} / 1M</p>
                    <p className="text-[10px] text-slate-400">{fmtUsd(model.aa_price_blended_usd)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="bg-indigo-950 dark:bg-indigo-900/40 text-white p-6 rounded-xl border border-indigo-900/50 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-1.5 bg-indigo-500/20 rounded-lg">
                <ShieldCheck className="w-5 h-5 text-indigo-300" />
              </div>
              <span className="font-bold text-sm">如何评价此模型？</span>
            </div>
            <p className="text-[12px] text-indigo-100/70 leading-relaxed mb-5">
              在社区发表您的真实使用体验，帮助其他开发者做出更好的决策。
            </p>
            <Link
              to={reviewLink}
              className="w-full flex items-center justify-center gap-2 text-xs bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-lg transition-all font-semibold"
            >
              发表您的点评
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
