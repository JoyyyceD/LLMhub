import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Terminal,
  MessageSquare,
  Calculator,
  Edit3,
  Database,
  Bot,
  Image as ImageIcon,
  Languages,
  Globe,
  CreditCard,
  Zap,
  ChevronDown,
  Star,
  Rocket,
  BarChart3,
  Loader2,
  AlertCircle,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { recommend } from '../lib/scoring';
import { useAuth } from '../context/AuthContext';
import {
  SCENARIO_LABELS,
  SUB_SCENARIO_LABELS,
  SCENARIO_SUB_SCENARIOS,
} from '../lib/qualityConfig';
import { ProviderLogo } from '../components/ProviderLogo';
import type {
  ModelSnapshot,
  ScenarioKey,
  SubScenarioKey,
  ProfileKey,
  RegionKey,
  SpeedProfileKey,
  RecommendationInput,
  RecommendationResult,
} from '../types';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SCENARIO_ICONS: Record<ScenarioKey, React.FC<{ className?: string }>> = {
  chat:       MessageSquare,
  code:       Terminal,
  science:    Calculator,
  copy:       Edit3,
  rag:        Database,
  agent:      Bot,
  multimodal: ImageIcon,
  translate:  Languages,
};

const SCENARIOS = Object.entries(SCENARIO_LABELS) as [ScenarioKey, string][];
const CONTEXT_OPTIONS = [4096, 32768, 131072, 1000000] as const;

const USD_TO_CNY = 7.25;

function fmtPrice(usd: number | null | undefined): string {
    if (usd == null) return 'N/A';
    const cny = usd * USD_TO_CNY;
    return `¥${cny.toFixed(1)}`;
  }

function fmtTtft(s: number | null | undefined): string {
  if (s == null) return 'N/A';
  return `${s.toFixed(2)}s`;
}

function fmtTps(t: number | null | undefined): string {
  if (t == null) return 'N/A';
  return `${t.toFixed(1)} t/s`;
}

type MultimodalMetricDef = { key: keyof ModelSnapshot; label: string };
const MULTIMODAL_METRICS: Record<string, MultimodalMetricDef[]> = {
  text_to_image: [
    { key: 'aa_elo', label: '综合 ELO评分' },
    { key: 'category_style_anime_elo', label: '动漫风评分' },
    { key: 'category_style_cartoon_illustration_elo', label: '卡通/插画评分' },
    { key: 'category_style_general_photorealistic_elo', label: '通用 & 写实评分' },
    { key: 'category_style_graphic_design_digital_rendering_elo', label: '平面设计评分' },
    { key: 'category_style_traditional_art_elo', label: '传统艺术评分' },
    { key: 'category_subject_commercial_elo', label: '商业视觉评分' },
  ],
  text_to_video: [
    { key: 'aa_elo', label: '综合 ELO评分' },
    { key: 'category_format_short_prompt_elo', label: '短提示词评分' },
    { key: 'category_format_long_prompt_elo', label: '长提示词评分' },
    { key: 'category_format_moving_camera_elo', label: '运镜评分' },
    { key: 'category_format_multi_scene_elo', label: '多场景评分' },
    { key: 'category_style_photorealistic_elo', label: '写实/照片级真实评分' },
    { key: 'category_style_cartoon_and_anime_elo', label: '卡通/动漫评分' },
    { key: 'category_style_3d_animation_elo', label: '3D 动画/CG 风评分' },
  ],
  image_to_video: [
    { key: 'aa_elo', label: '综合 ELO评分' },
    { key: 'category_format_short_prompt_elo', label: '短提示词评分' },
    { key: 'category_format_long_prompt_elo', label: '长提示词评分' },
    { key: 'category_format_moving_camera_elo', label: '运镜评分' },
    { key: 'category_format_multi_scene_elo', label: '多场景评分' },
    { key: 'category_style_photorealistic_elo', label: '写实/照片级真实评分' },
    { key: 'category_style_cartoon_and_anime_elo', label: '卡通/动漫评分' },
    { key: 'category_style_3d_animation_elo', label: '3D 动画/CG 风评分' },
  ],
  image_editing: [{ key: 'aa_elo', label: '综合 ELO评分' }],
  text_to_speech: [{ key: 'aa_elo', label: '综合 ELO评分' }],
};

// ---------------------------------------------------------------------------
// Score bar component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  // Filter state
  const [scenario, setScenario] = useState<ScenarioKey>('chat');
  const [selectedSubScenarios, setSelectedSubScenarios] = useState<SubScenarioKey[]>(['generation']);
  const [region, setRegion] = useState<RegionKey>('global');
  const [profile, setProfile] = useState<ProfileKey>('best_value');
  const [speedProfile, setSpeedProfile] = useState<SpeedProfileKey>('balanced_speed');
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);
  const [requirePdfInput, setRequirePdfInput] = useState(false);
  const [requireImageInput, setRequireImageInput] = useState(false);
  const [minContextTokens, setMinContextTokens] = useState<number>(32768);

  // Data state
  const [allModels, setAllModels] = useState<ModelSnapshot[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Results state
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [hasRecommended, setHasRecommended] = useState(false);
  const [computing, setComputing] = useState(false);
  const [recommendGateError, setRecommendGateError] = useState('');

  // Load all models on mount
  useEffect(() => {
    const load = async () => {
      setLoadingModels(true);
      const { data, error } = await supabase
        .from('model_snapshots')
        .select('*')
        .eq('has_aa', true);

      if (error) {
        setFetchError('模型数据加载失败，请刷新重试。');
        setLoadingModels(false);
        return;
      }
      setAllModels((data ?? []) as ModelSnapshot[]);
      setLoadingModels(false);
    };
    load();
  }, []);

  // When scenario changes, reset sub-scenario to first option
  useEffect(() => {
    const subs = SCENARIO_SUB_SCENARIOS[scenario];
    if (subs.length > 0) setSelectedSubScenarios([subs[0]]);
  }, [scenario]);

  const handleRecommend = useCallback(() => {
    setRecommendGateError('');
    const key = 'llmhub_recommend_query_count';
    const used = Number(localStorage.getItem(key) ?? '0');
    if (!user && used >= 3) {
      setRecommendGateError('已达到匿名试用次数上限，请登录后继续查询。');
      navigate('/login');
      return;
    }
    if (!user) {
      localStorage.setItem(key, String(used + 1));
    }

    setComputing(true);
    const input: RecommendationInput = {
      scenario,
      sub_scenarios: selectedSubScenarios,
      sub_scenario: selectedSubScenarios[0],
      region,
      profile,
      speed_profile: speedProfile,
      advanced_filters: {
        require_pdf: requirePdfInput,
        require_image: requireImageInput,
        min_context_tokens: minContextTokens,
      },
    };
    // Async tick to let spinner render
    setTimeout(() => {
      const top4 = recommend(allModels, input);
      setResults(top4);
      setHasRecommended(true);
      setComputing(false);
    }, 50);
  }, [allModels, scenario, selectedSubScenarios, region, profile, speedProfile, requirePdfInput, requireImageInput, minContextTokens, user, navigate]);

  const subScenarios = SCENARIO_SUB_SCENARIOS[scenario] ?? [];
  const currentScenarioLabel = SCENARIO_LABELS[scenario];
  const contextIndex = Math.max(0, CONTEXT_OPTIONS.indexOf(minContextTokens as (typeof CONTEXT_OPTIONS)[number]));
  const contextThresholdPct = (contextIndex / (CONTEXT_OPTIONS.length - 1)) * 100;
  const isMultimodal = scenario === 'multimodal';
  const latestDataDate = allModels.reduce<string | null>((latest, model) => {
    const candidate = model.record_date ?? (model.updated_at ? model.updated_at.split('T')[0] : null);
    if (!candidate) return latest;
    if (!latest) return candidate;
    return candidate > latest ? candidate : latest;
  }, null);

  const getMultimodalRows = (model: ModelSnapshot): Array<{ label: string; value: number }> => {
    const modality = (model.aa_modality ?? 'llm').toString();
    const defs = MULTIMODAL_METRICS[modality] ?? [{ key: 'aa_elo', label: '综合 ELO评分' }];
    return defs
      .map((d) => ({ label: d.label, value: Number(model[d.key] ?? 0) }))
      .filter((r) => Number.isFinite(r.value) && r.value > 0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* ── Hero & Filters ─────────────────────────────────────────────── */}
      <section className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-10 mb-8 sm:mb-10">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            为您的业务寻找最强 LLM
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-base sm:text-lg">
            基于真实测评数据，按场景、地区和偏好精准匹配最优模型。
          </p>
          {loadingModels && (
            <p className="text-xs text-slate-400 mt-2 flex items-center justify-center gap-1">
              <Loader2 className="w-3 h-3 animate-spin" /> 正在加载模型数据...
            </p>
          )}
          {fetchError && (
            <p className="text-xs text-rose-500 mt-2 flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" /> {fetchError}
            </p>
          )}
          {recommendGateError && (
            <p className="text-xs text-amber-600 mt-2 flex items-center justify-center gap-1">
              <AlertCircle className="w-3 h-3" /> {recommendGateError}
            </p>
          )}
          {!loadingModels && !fetchError && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
              最新更新时间: {latestDataDate ?? '未知'}
            </p>
          )}
        </div>

        {/* 1. Scenario */}
        <div className="mb-12">
          <h2 className="text-xs font-semibold tracking-wide text-slate-500 mb-6 flex items-center gap-2">
            <Star className="w-4 h-4" /> 1. 主场景选择
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
            {SCENARIOS.map(([id, label]) => {
              const Icon = SCENARIO_ICONS[id];
              return (
                <button
                  key={id}
                  onClick={() => setScenario(id)}
                  className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border transition-all group h-28 sm:h-32 ${
                    scenario === id
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-slate-200 bg-white hover:border-primary/30'
                  }`}
                >
                  <Icon className={`w-8 h-8 sm:w-10 sm:h-10 mb-2 sm:mb-3 transition-colors ${
                    scenario === id ? 'text-primary' : 'text-slate-300 group-hover:text-primary/50'
                  }`} />
                  <span className={`text-xs ${scenario === id ? 'font-semibold' : 'font-medium text-slate-500'}`}>
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2-4. Other Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Region */}
          <div>
            <h2 className="text-xs font-semibold tracking-wide text-slate-500 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" /> 2. 地区可用性
            </h2>
            <div className="flex flex-col sm:flex-row p-1.5 bg-slate-100 rounded-2xl gap-1 sm:gap-0">
              <button
                onClick={() => setRegion('cn')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  region === 'cn'
                    ? 'bg-white text-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                中国大陆直连
              </button>
              <button
                onClick={() => setRegion('global')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  region === 'global'
                    ? 'bg-white text-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                全球模型
              </button>
            </div>
          </div>

          {/* Budget profile */}
          <div>
            <h2 className="text-xs font-semibold tracking-wide text-slate-500 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> 3. 预算偏好
            </h2>
            <div className="flex flex-col sm:flex-row p-1.5 bg-slate-100 rounded-2xl gap-1 sm:gap-0">
              {([['best_value', '性价比'], ['cheapest', '省钱'], ['best_quality', '质量优先']] as [ProfileKey, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setProfile(key)}
                  disabled={isMultimodal}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                    profile === key
                    ? 'bg-white text-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                  } ${isMultimodal ? 'opacity-40 cursor-not-allowed hover:text-slate-400' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed profile */}
          <div>
            <h2 className="text-xs font-semibold tracking-wide text-slate-500 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" /> 4. 速度偏好
            </h2>
            <div className="flex flex-col sm:flex-row p-1.5 bg-slate-100 rounded-2xl gap-1 sm:gap-0">
              {([['low_latency', '低延迟'], ['balanced_speed', '均衡'], ['high_throughput', '高吞吐']] as [SpeedProfileKey, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSpeedProfile(key)}
                  disabled={isMultimodal}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                    speedProfile === key
                    ? 'bg-white text-slate-900'
                    : 'text-slate-400 hover:text-slate-600'
                  } ${isMultimodal ? 'opacity-40 cursor-not-allowed hover:text-slate-400' : ''}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Sub-scenario Tags & Action ──────────────────────────────────── */}
      <section className="mb-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 overflow-x-auto pb-2 w-full md:w-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap tracking-wide">
              {isMultimodal ? '多模态类别:' : `${currentScenarioLabel}细分:`}
            </span>
            {subScenarios.map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  if (isMultimodal) {
                    setSelectedSubScenarios([sub]);
                    return;
                  }
                  setSelectedSubScenarios((prev) => {
                    if (prev.includes(sub)) {
                      if (prev.length === 1) return prev;
                      return prev.filter((s) => s !== sub);
                    }
                    return [...prev, sub];
                  });
                }}
                className={`px-6 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedSubScenarios.includes(sub)
                    ? 'bg-primary text-white'
                    : 'bg-white border border-slate-200 text-slate-500 hover:border-primary'
                }`}
              >
                {SUB_SCENARIO_LABELS[sub] ?? sub}
              </button>
            ))}
          </div>
          <button
            onClick={handleRecommend}
            disabled={loadingModels || computing}
            className="w-full md:w-auto bg-primary text-white px-10 py-3 rounded-2xl font-semibold text-sm transition-colors hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {computing
              ? <><Loader2 className="w-5 h-5 animate-spin" /> 计算中...</>
              : <><Rocket className="w-5 h-5" /> 立即推荐最优模型</>
            }
          </button>
        </div>
      </section>

      {/* ── Advanced Filters ─────────────────────────────────────────────── */}
      <section className="mb-12">
        <button
          onClick={() => {
            if (isMultimodal) return;
            setIsAdvancedExpanded(!isAdvancedExpanded);
          }}
          className={`flex items-center gap-2 text-xs font-semibold group tracking-wide ${isMultimodal ? 'text-slate-400 cursor-not-allowed' : 'text-primary'}`}
        >
          <span className="material-symbols-outlined text-lg">tune</span>
          <span>高级筛选与约束</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isAdvancedExpanded ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isAdvancedExpanded && !isMultimodal && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 p-5 sm:p-8 bg-white rounded-3xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-4">输入类型支持</label>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={requirePdfInput}
                        onChange={(e) => setRequirePdfInput(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      PDF/文档
                    </label>
                    <label className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700">
                      <input
                        type="checkbox"
                        checked={requireImageInput}
                        onChange={(e) => setRequireImageInput(e.target.checked)}
                        className="h-4 w-4 rounded border-slate-300 text-primary focus:ring-primary"
                      />
                      图像
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 tracking-wide mb-3">
                    上下文长度: <span className="text-primary">&gt; {Math.round(minContextTokens / 1024)}K TOKENS</span>
                  </label>
                  <input
                    type="range"
                    min={0}
                    max={CONTEXT_OPTIONS.length - 1}
                    step={1}
                    value={contextIndex}
                    onChange={(e) => setMinContextTokens(CONTEXT_OPTIONS[Number(e.target.value)] ?? 32768)}
                    className="context-slider w-full"
                    style={{
                      background: `linear-gradient(to right, #e2e8f0 0%, #e2e8f0 ${contextThresholdPct}%, #137fec ${contextThresholdPct}%, #137fec 100%)`,
                    }}
                  />
                  <div className="mt-3 flex justify-between text-[11px] font-bold text-slate-400">
                    <span>4K</span>
                    <span>32K</span>
                    <span>128K</span>
                    <span>1M+</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Recommended Models ───────────────────────────────────────────── */}
      {hasRecommended && (
        <section>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-6 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">推荐模型</h2>
              <p className="text-slate-500 text-sm mt-1">
                基于 <b>{currentScenarioLabel}</b> · <b>{selectedSubScenarios.map((s) => SUB_SCENARIO_LABELS[s] ?? s).join(' / ')}</b> ·{' '}
                <b>{region === 'cn' ? '大陆直连' : '全球模型'}</b> 偏好筛选。
              </p>
            </div>
          <div className="flex gap-3">
              <Link
                to={`/leaderboard?scenario=${encodeURIComponent(scenario)}&subs=${encodeURIComponent(selectedSubScenarios.join(','))}&region=${encodeURIComponent(region)}&profile=${encodeURIComponent(profile)}&speed=${encodeURIComponent(speedProfile)}`}
                className="w-full sm:w-auto justify-center flex items-center gap-2 text-sm font-semibold px-4 py-2 bg-white border border-slate-200 rounded-xl hover:border-primary hover:text-primary transition-colors text-slate-600"
              >
                <BarChart3 className="w-4 h-4" /> 查看排行榜
              </Link>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-white rounded-3xl border border-slate-200">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-bold">暂无符合条件的模型</p>
              <p className="text-sm mt-1">请尝试调整地区或偏好设置</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {results.map((result, idx) => (
                <motion.div
                  key={result.model.aa_slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`relative group bg-white border rounded-2xl overflow-hidden transition-colors ${
                    idx === 0 ? 'border-primary' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-[11px] font-semibold px-4 py-1.5 rounded-bl-xl tracking-wide flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" /> 最优匹配
                    </div>
                  )}

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-5">
                      <ProviderLogo
                        name={result.model.aa_model_creator_name ?? result.model.aa_model_creator_name_cn ?? result.model.aa_name}
                        sizeClassName="w-14 h-14"
                        textClassName="text-lg font-semibold"
                        roundedClassName="rounded-xl"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                          {result.model.aa_name.replace(/\s*\(.*?\)\s*/g, '')}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                          {result.model.is_cn_provider
                            ? (result.model.aa_model_creator_name_cn ?? result.model.aa_model_creator_name ?? '—')
                            : (result.model.aa_model_creator_name ?? '—')}
                        </p>
                      </div>
                          <span className="text-2xl font-bold text-primary font-display">#{result.rank}</span>
                    </div>

                    {/* Key metrics */}
                    {isMultimodal ? (
                      <div className="grid grid-cols-2 gap-3 py-4 border-y border-slate-100 dark:border-slate-800 mb-5">
                        {getMultimodalRows(result.model).slice(0, 8).map((row) => (
                          <div key={row.label}>
                            <p className="text-[10px] text-slate-400 font-semibold mb-1">{row.label}</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-display">{Math.round(row.value)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <>
                        <div className="grid grid-cols-3 gap-3 py-4 border-y border-slate-100 dark:border-slate-800 mb-5">
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold mb-1">价格 (混合/1M)</p>
                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-display">
                              {fmtPrice(result.model.aa_price_blended_usd)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" /> TTFT
                            </p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-display">
                              {fmtTtft(result.model.aa_ttft_seconds)}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold mb-1 flex items-center gap-1">
                              <TrendingUp className="w-2.5 h-2.5" /> TPS
                            </p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-display">
                              {fmtTps(result.model.aa_tps)}
                            </p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-3 py-4 border-b border-slate-100 dark:border-slate-800 mb-5">
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold mb-1">综合评分</p>
                            <p className="text-sm font-bold text-primary font-display">{result.scores.total}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold mb-1">场景质量评分</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-display">{result.scores.quality}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-400 font-semibold mb-1">综合智力评分</p>
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-display">
                              {result.model.aa_intelligence_index == null ? 'N/A' : result.model.aa_intelligence_index.toFixed(1)}
                            </p>
                          </div>
                        </div>
                      </>
                    )}

                    {/* Explanations */}
                    <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/10 mb-4">
                      <div className="text-[11px] font-semibold text-primary tracking-wide mb-2 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-primary" /> 推荐理由
                      </div>
                      <ul className="space-y-1.5">
                        {result.explanations.slice(0, 3).map((exp, i) => (
                          <li key={i} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-1.5">
                            <span className="text-primary font-semibold mt-0.5">·</span> {exp}
                          </li>
                        ))}
                        {result.tradeoffs[0] && (
                          <li className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-1.5">
                            <span className="text-primary font-semibold mt-0.5">·</span> {result.tradeoffs[0]}
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link
                        to={`/model/${result.model.aa_slug}`}
                        className={`w-full flex items-center justify-center font-semibold py-2.5 rounded-lg text-sm transition-colors ${
                          idx === 0
                            ? 'bg-primary text-white hover:bg-primary/90'
                            : 'bg-slate-900 text-white hover:opacity-90'
                        }`}
                      >
                        查看详情
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Empty state before first recommendation */}
      {!hasRecommended && !loadingModels && (
        <section className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed">
          <Rocket className="w-12 h-12 mx-auto mb-4 text-slate-200 dark:text-slate-700" />
          <p className="font-bold text-slate-500">选择场景和偏好后，点击「立即推荐最优模型」</p>
          <p className="text-sm text-slate-400 mt-1">基于 {allModels.length} 个真实测评模型计算</p>
        </section>
      )}
    </div>
  );
};
