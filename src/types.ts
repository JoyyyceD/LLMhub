// ============================================================
// LLMhub types – v2 (real data from model_snapshots)
// ============================================================

/** Row from the model_snapshots Supabase table */
export interface ModelSnapshot {
  aa_slug: string;
  aa_name: string;
  aa_model_creator_name: string | null;
  is_cn_provider: boolean;

  // Quality benchmarks
  aa_intelligence_index: number | null;
  aa_coding_index: number | null;
  aa_gpqa: number | null;
  aa_hle: number | null;
  aa_ifbench: number | null;
  aa_lcr: number | null;
  aa_scicode: number | null;
  aa_terminalbench_hard: number | null;
  aa_tau2: number | null;

  // Speed
  aa_ttft_seconds: number | null;
  aa_tps: number | null;

  // Pricing (USD per 1M tokens)
  aa_price_input_usd: number | null;
  aa_price_output_usd: number | null;
  aa_price_blended_usd: number | null;

  // Context & meta
  aa_context_length: number | null;
  aa_release_date: string | null;

  // Source flags
  has_aa: boolean;
  has_or: boolean;
  match_confidence: string | null;
  record_date: string | null;
  updated_at?: string;
}

// ── Scenario / sub-scenario keys ──────────────────────────────────────────

export type ScenarioKey =
  | 'chat'
  | 'code'
  | 'science'
  | 'copy'
  | 'rag'
  | 'agent'
  | 'multimodal'
  | 'translate';

export type SubScenarioKey =
  // chat
  | 'general' | 'creative' | 'customer_service' | 'instruction_following' | 'long_context' | 'multilingual'
  // code
  | 'generation' | 'debugging' | 'refactoring' | 'sql' | 'testing' | 'explanation'
  // science
  | 'basic' | 'advanced' | 'statistics' | 'logic' | 'proof' | 'aime'
  // copy
  | 'marketing' | 'social_media' | 'technical_docs' | 'story' | 'seo' | 'email'
  // rag
  | 'document_qa' | 'summarization' | 'extraction' | 'citation' | 'multilingual_doc' | 'long_doc'
  // agent
  | 'planning' | 'tool_use' | 'multi_step' | 'self_correction' | 'browser' | 'code_agent'
  // multimodal
  | 'image_understanding' | 'chart_analysis' | 'ocr' | 'vision_qa' | 'image_code' | 'mm_general'
  // translate
  | 'zh_en' | 'en_zh' | 'multilingual_translate' | 'technical_translate' | 'literary' | 'localization';

export type ProfileKey = 'balanced' | 'best_quality' | 'best_value' | 'cheapest' | 'fastest';
export type RegionKey = 'cn' | 'global';
export type SpeedProfileKey = 'low_latency' | 'high_throughput' | 'balanced_speed';

// ── Recommendation input ──────────────────────────────────────────────────

export interface RecommendationInput {
  scenario: ScenarioKey;
  sub_scenario: SubScenarioKey;
  region: RegionKey;
  profile: ProfileKey;
  speed_profile: SpeedProfileKey;
  /** Monthly token budget in USD (optional, used for cost normalisation) */
  monthly_budget_usd?: number;
}

// ── Recommendation output ─────────────────────────────────────────────────

export interface DimensionScores {
  quality: number;   // 0-100
  cost: number;      // 0-100 (higher = cheaper)
  latency: number;   // 0-100 (higher = faster)
  throughput: number;// 0-100 (higher = more tps)
  total: number;     // 0-100 weighted sum
}

export interface RecommendationResult {
  rank: number;
  model: ModelSnapshot;
  scores: DimensionScores;
  explanations: string[];   // ≥3 rule-based sentences
  tradeoffs: string[];      // ≥1 tradeoff note
  confidence: 'high' | 'medium' | 'low';
}

// ── Legacy types (kept for backward compat during migration) ──────────────

/** @deprecated Use ModelSnapshot instead */
export interface Model {
  id: string;
  name: string;
  vendor: string;
  vendorLogo?: string;
  releaseDate: string;
  type: 'open' | 'closed';
  parameters?: string;
  description: string;
  benchmarks: {
    mmlu: number;
    humanEval: number;
    gsm8k: number;
    math: number;
  };
  performance: {
    latency: string;
    throughput: string;
  };
  pricing: {
    input: string;
    output: string;
  };
  tags: string[];
  recommendationReason?: string;
  verified?: boolean;
}

/** @deprecated Use model_review_posts table instead */
export interface Review {
  id: string;
  userName: string;
  userAvatar: string;
  userLevel: string;
  modelId: string;
  modelName: string;
  time: string;
  rating: number;
  scores: {
    value: number;
    code: number;
    logic: number;
    stability: number;
  };
  pros: string[];
  cons: string[];
  content: string;
  likes: number;
  replies: number;
}
