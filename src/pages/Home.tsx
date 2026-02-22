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
  ArrowRightLeft,
  Rocket,
  BarChart3,
  Loader2,
  AlertCircle,
  TrendingUp,
  Clock,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { recommend } from '../lib/scoring';
import {
  SCENARIO_LABELS,
  SUB_SCENARIO_LABELS,
  SCENARIO_SUB_SCENARIOS,
} from '../lib/qualityConfig';
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
  math:       Calculator,
  copy:       Edit3,
  rag:        Database,
  agent:      Bot,
  multimodal: ImageIcon,
  translate:  Languages,
};

const SCENARIOS = Object.entries(SCENARIO_LABELS) as [ScenarioKey, string][];

const USD_TO_CNY = 7.25;

function fmtPrice(usd: number | null | undefined): string {
  if (usd == null) return 'N/A';
  const cny = usd * USD_TO_CNY;
  return `¥${cny.toFixed(2)}`;
}

function fmtTtft(s: number | null | undefined): string {
  if (s == null) return 'N/A';
  return `${s.toFixed(2)}s`;
}

function fmtTps(t: number | null | undefined): string {
  if (t == null) return 'N/A';
  return `${t.toFixed(1)} t/s`;
}

// ---------------------------------------------------------------------------
// Score bar component
// ---------------------------------------------------------------------------

const ScoreBar = ({ label, value }: { label: string; value: number }) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
      <span className="text-[10px] font-black text-primary">{value}</span>
    </div>
    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-700"
        style={{ width: `${value}%` }}
      />
    </div>
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const Home = () => {
  // Filter state
  const [scenario, setScenario] = useState<ScenarioKey>('code');
  const [subScenario, setSubScenario] = useState<SubScenarioKey>('generation');
  const [region, setRegion] = useState<RegionKey>('cn');
  const [profile, setProfile] = useState<ProfileKey>('balanced');
  const [speedProfile, setSpeedProfile] = useState<SpeedProfileKey>('balanced_speed');
  const [isAdvancedExpanded, setIsAdvancedExpanded] = useState(false);

  // Data state
  const [allModels, setAllModels] = useState<ModelSnapshot[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [fetchError, setFetchError] = useState('');

  // Results state
  const [results, setResults] = useState<RecommendationResult[]>([]);
  const [hasRecommended, setHasRecommended] = useState(false);
  const [computing, setComputing] = useState(false);

  // Load all models on mount
  useEffect(() => {
    const load = async () => {
      setLoadingModels(true);
      const { data, error } = await supabase
        .from('model_snapshots')
        .select('*')
        .eq('has_aa', true)
        .eq('has_or', true);

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
    if (subs.length > 0) setSubScenario(subs[0]);
  }, [scenario]);

  const handleRecommend = useCallback(() => {
    setComputing(true);
    const input: RecommendationInput = {
      scenario,
      sub_scenario: subScenario,
      region,
      profile,
      speed_profile: speedProfile,
    };
    // Async tick to let spinner render
    setTimeout(() => {
      const top4 = recommend(allModels, input);
      setResults(top4);
      setHasRecommended(true);
      setComputing(false);
    }, 50);
  }, [allModels, scenario, subScenario, region, profile, speedProfile]);

  const subScenarios = SCENARIO_SUB_SCENARIOS[scenario] ?? [];
  const currentScenarioLabel = SCENARIO_LABELS[scenario];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* ── Hero & Filters ─────────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 p-10 mb-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4 tracking-tight">
            为您的业务寻找最强 LLM
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg">
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
          {!loadingModels && !fetchError && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2">
              已加载 {allModels.length} 个模型
            </p>
          )}
        </div>

        {/* 1. Scenario */}
        <div className="mb-12">
          <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-6 flex items-center gap-2">
            <Star className="w-4 h-4" /> 1. 主场景选择
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {SCENARIOS.map(([id, label]) => {
              const Icon = SCENARIO_ICONS[id];
              return (
                <button
                  key={id}
                  onClick={() => setScenario(id)}
                  className={`flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all group h-32 ${
                    scenario === id
                      ? 'border-primary bg-primary/5 text-primary shadow-lg shadow-primary/10'
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-primary/30'
                  }`}
                >
                  <Icon className={`w-10 h-10 mb-3 transition-colors ${
                    scenario === id ? 'text-primary' : 'text-slate-300 group-hover:text-primary/50'
                  }`} />
                  <span className={`text-xs ${scenario === id ? 'font-black' : 'font-bold text-slate-500'}`}>
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
            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" /> 2. 地区可用性
            </h2>
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              <button
                onClick={() => setRegion('cn')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  region === 'cn'
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                中国大陆直连
              </button>
              <button
                onClick={() => setRegion('global')}
                className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                  region === 'global'
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                海外可用
              </button>
            </div>
          </div>

          {/* Budget profile */}
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
              <CreditCard className="w-4 h-4" /> 3. 预算偏好
            </h2>
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              {([['cheapest', '省钱'], ['best_value', '性价比'], ['best_quality', '质量优先']] as [ProfileKey, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setProfile(key)}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                    profile === key
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Speed profile */}
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4" /> 4. 速度偏好
            </h2>
            <div className="flex p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl">
              {([['low_latency', '低延迟'], ['balanced_speed', '均衡'], ['high_throughput', '高吞吐']] as [SpeedProfileKey, string][]).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setSpeedProfile(key)}
                  className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${
                    speedProfile === key
                      ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
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
            <span className="text-[11px] font-black text-slate-400 dark:text-slate-500 whitespace-nowrap uppercase tracking-widest">
              {currentScenarioLabel}细分:
            </span>
            {subScenarios.map((sub) => (
              <button
                key={sub}
                onClick={() => setSubScenario(sub)}
                className={`px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  subScenario === sub
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-primary'
                }`}
              >
                {SUB_SCENARIO_LABELS[sub] ?? sub}
              </button>
            ))}
          </div>
          <button
            onClick={handleRecommend}
            disabled={loadingModels || computing}
            className="w-full md:w-auto bg-gradient-to-r from-primary to-indigo-600 text-white px-12 py-3 rounded-full font-black text-sm shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 ring-4 ring-primary/10 disabled:opacity-60 disabled:cursor-not-allowed"
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
          onClick={() => setIsAdvancedExpanded(!isAdvancedExpanded)}
          className="flex items-center gap-2 text-xs font-black text-primary group uppercase tracking-widest"
        >
          <span className="material-symbols-outlined text-lg">tune</span>
          <span>高级筛选与约束</span>
          <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isAdvancedExpanded ? 'rotate-180' : ''}`} />
        </button>

        <AnimatePresence>
          {isAdvancedExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-8 p-8 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">综合偏好</label>
                  <div className="space-y-2">
                    {([['balanced', '均衡推荐'], ['best_quality', '最强性能'], ['best_value', '最高性价比'], ['cheapest', '最低成本'], ['fastest', '最快速度']] as [ProfileKey, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setProfile(key)}
                        className={`w-full text-left px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                          profile === key
                            ? 'bg-primary/10 text-primary border border-primary/20'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">隐私合规</label>
                  <div className="flex items-center gap-4 mt-4">
                    <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer">
                      <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm" />
                    </div>
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-400">数据零保留 API</span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">说明</label>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    推荐引擎基于 Artificial Analysis 真实测评数据，在浏览器本地计算，无需服务端。评分覆盖智力、代码、速度、成本四维度。
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* ── Recommended Models ───────────────────────────────────────────── */}
      {hasRecommended && (
        <section>
          <div className="flex justify-between items-end mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">推荐模型</h2>
              <p className="text-slate-500 text-sm mt-1">
                基于 <b>{currentScenarioLabel}</b> · <b>{SUB_SCENARIO_LABELS[subScenario]}</b> ·{' '}
                <b>{region === 'cn' ? '大陆直连' : '海外可用'}</b> 偏好筛选。
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                to="/leaderboard"
                className="flex items-center gap-2 text-sm font-bold px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary hover:text-primary transition-all shadow-sm text-slate-600 dark:text-slate-300"
              >
                <BarChart3 className="w-4 h-4" /> 完整排行榜
              </Link>
            </div>
          </div>

          {results.length === 0 ? (
            <div className="text-center py-16 text-slate-400 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <AlertCircle className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <p className="font-bold">暂无符合条件的模型</p>
              <p className="text-sm mt-1">请尝试调整地区或偏好设置</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {results.map((result, idx) => (
                <motion.div
                  key={result.model.aa_slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className={`relative group bg-white dark:bg-slate-900 border-2 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all ${
                    idx === 0 ? 'border-primary' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {idx === 0 && (
                    <div className="absolute top-0 right-0 bg-primary text-white text-[11px] font-black uppercase px-4 py-1.5 rounded-bl-xl tracking-widest flex items-center gap-1">
                      <Star className="w-3 h-3 fill-white" /> 最优匹配
                    </div>
                  )}

                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start gap-4 mb-5">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-lg font-black ${
                        idx % 2 === 0
                          ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600'
                          : 'bg-orange-50 dark:bg-orange-900/30 text-orange-600'
                      }`}>
                        {result.model.aa_name.substring(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">
                          {result.model.aa_name}
                        </h3>
                        <p className="text-xs font-medium text-slate-500 mt-0.5">
                          {result.model.aa_model_creator_name ?? '—'} ·{' '}
                          <span className={`font-bold ${
                            result.confidence === 'high' ? 'text-emerald-500' :
                            result.confidence === 'medium' ? 'text-amber-500' : 'text-slate-400'
                          }`}>
                            {result.confidence === 'high' ? '高置信' : result.confidence === 'medium' ? '中置信' : '低置信'}
                          </span>
                        </p>
                      </div>
                      <span className="text-2xl font-black text-primary font-display">#{result.rank}</span>
                    </div>

                    {/* Key metrics */}
                    <div className="grid grid-cols-3 gap-3 py-4 border-y border-slate-100 dark:border-slate-800 mb-5">
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1">价格 (混合/1M)</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 font-display">
                          {fmtPrice(result.model.aa_price_blended_usd)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" /> TTFT
                        </p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-display">
                          {fmtTtft(result.model.aa_ttft_seconds)}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-slate-400 uppercase font-black mb-1 flex items-center gap-1">
                          <TrendingUp className="w-2.5 h-2.5" /> TPS
                        </p>
                        <p className="text-sm font-bold text-slate-700 dark:text-slate-300 font-display">
                          {fmtTps(result.model.aa_tps)}
                        </p>
                      </div>
                    </div>

                    {/* Score bars */}
                    <div className="space-y-2 mb-5">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">综合评分</span>
                        <span className="text-lg font-black text-primary font-display">{result.scores.total}</span>
                      </div>
                      <ScoreBar label="质量" value={result.scores.quality} />
                      <ScoreBar label="成本" value={result.scores.cost} />
                      <ScoreBar label="延迟" value={result.scores.latency} />
                      <ScoreBar label="吞吐" value={result.scores.throughput} />
                    </div>

                    {/* Explanations */}
                    <div className="bg-primary/5 dark:bg-primary/10 p-4 rounded-xl border border-primary/10 mb-4">
                      <div className="text-[11px] font-bold text-primary uppercase tracking-widest mb-2 flex items-center gap-1">
                        <Star className="w-3 h-3 fill-primary" /> 推荐理由
                      </div>
                      <ul className="space-y-1.5">
                        {result.explanations.slice(0, 3).map((exp, i) => (
                          <li key={i} className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed flex items-start gap-1.5">
                            <span className="text-primary font-black mt-0.5">·</span> {exp}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tradeoff */}
                    {result.tradeoffs[0] && (
                      <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-3 py-2 rounded-lg mb-4 leading-relaxed">
                        {result.tradeoffs[0]}
                      </p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <Link
                        to={`/model/${result.model.aa_slug}`}
                        className={`flex-1 flex items-center justify-center font-bold py-2.5 rounded-lg text-sm transition-all ${
                          idx === 0
                            ? 'bg-primary text-white hover:shadow-lg hover:shadow-primary/20'
                            : 'bg-slate-900 dark:bg-white dark:text-slate-900 text-white hover:opacity-90'
                        }`}
                      >
                        查看详情
                      </Link>
                      <button className="px-3 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <ArrowRightLeft className="w-5 h-5" />
                      </button>
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
        <section className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 border-dashed">
          <Rocket className="w-12 h-12 mx-auto mb-4 text-slate-200 dark:text-slate-700" />
          <p className="font-bold text-slate-500">选择场景和偏好后，点击「立即推荐最优模型」</p>
          <p className="text-sm text-slate-400 mt-1">基于 {allModels.length} 个真实测评模型计算</p>
        </section>
      )}
    </div>
  );
};
