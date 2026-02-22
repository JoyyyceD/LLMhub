/**
 * qualityConfig.ts
 *
 * 8 × 6 quality-metric weight table for the recommendation engine.
 * Each weight is a non-negative number; they will be renormalised to sum=1
 * inside scoring.ts (so values are relative, not absolute).
 *
 * Metrics available in ModelSnapshot:
 *   aa_intelligence_index  – general intelligence composite
 *   aa_coding_index        – coding ability
 *   aa_gpqa                – graduate-level science Q&A
 *   aa_hle                 – hard logic evaluation
 *   aa_ifbench             – instruction-following benchmark
 *   aa_lcr                 – long-context recall
 *   aa_scicode             – science coding
 *   aa_terminalbench_hard  – terminal / agentic tasks (hard)
 *   aa_tau2                – tool-use / agent capability
 */

import type { ScenarioKey, SubScenarioKey, ProfileKey } from '../types';

export type QualityMetric =
  | 'aa_intelligence_index'
  | 'aa_coding_index'
  | 'aa_gpqa'
  | 'aa_hle'
  | 'aa_ifbench'
  | 'aa_lcr'
  | 'aa_scicode'
  | 'aa_terminalbench_hard'
  | 'aa_tau2';

export type QualityWeights = Partial<Record<QualityMetric, number>>;

// ---------------------------------------------------------------------------
// 8 × 6 weight table
// ---------------------------------------------------------------------------

export const QUALITY_CONFIG: Record<ScenarioKey, Record<string, QualityWeights>> = {
  // ── CHAT ────────────────────────────────────────────────────────────────
  chat: {
    general:              { aa_intelligence_index: 3, aa_ifbench: 2 },
    creative:             { aa_intelligence_index: 2, aa_ifbench: 3 },
    customer_service:     { aa_intelligence_index: 2, aa_ifbench: 3 },
    instruction_following:{ aa_ifbench: 4, aa_intelligence_index: 2 },
    long_context:         { aa_lcr: 4, aa_intelligence_index: 2, aa_ifbench: 1 },
    multilingual:         { aa_intelligence_index: 3, aa_ifbench: 3 },
  },

  // ── CODE ────────────────────────────────────────────────────────────────
  code: {
    generation:   { aa_coding_index: 4, aa_intelligence_index: 2, aa_ifbench: 1 },
    debugging:    { aa_coding_index: 3, aa_intelligence_index: 2, aa_hle: 1 },
    refactoring:  { aa_coding_index: 3, aa_intelligence_index: 2, aa_ifbench: 1 },
    sql:          { aa_coding_index: 3, aa_ifbench: 2, aa_intelligence_index: 1 },
    testing:      { aa_coding_index: 4, aa_ifbench: 2 },
    explanation:  { aa_intelligence_index: 3, aa_coding_index: 2, aa_ifbench: 2 },
  },

  // ── MATH ────────────────────────────────────────────────────────────────
  math: {
    basic:      { aa_intelligence_index: 3, aa_ifbench: 2 },
    advanced:   { aa_hle: 4, aa_gpqa: 2, aa_intelligence_index: 2 },
    statistics: { aa_intelligence_index: 3, aa_hle: 2, aa_gpqa: 1 },
    logic:      { aa_hle: 4, aa_intelligence_index: 2 },
    proof:      { aa_hle: 3, aa_gpqa: 3, aa_intelligence_index: 2 },
    aime:       { aa_hle: 4, aa_gpqa: 3, aa_intelligence_index: 1 },
  },

  // ── COPY (文案创作) ──────────────────────────────────────────────────────
  copy: {
    marketing:      { aa_ifbench: 3, aa_intelligence_index: 2 },
    social_media:   { aa_ifbench: 3, aa_intelligence_index: 2 },
    technical_docs: { aa_ifbench: 2, aa_intelligence_index: 3, aa_coding_index: 1 },
    story:          { aa_intelligence_index: 3, aa_ifbench: 2 },
    seo:            { aa_ifbench: 3, aa_intelligence_index: 2 },
    email:          { aa_ifbench: 3, aa_intelligence_index: 2 },
  },

  // ── RAG ──────────────────────────────────────────────────────────────────
  rag: {
    document_qa:      { aa_lcr: 3, aa_intelligence_index: 2, aa_ifbench: 2 },
    summarization:    { aa_intelligence_index: 3, aa_lcr: 2, aa_ifbench: 2 },
    extraction:       { aa_ifbench: 3, aa_lcr: 2, aa_intelligence_index: 2 },
    citation:         { aa_lcr: 4, aa_intelligence_index: 2 },
    multilingual_doc: { aa_intelligence_index: 3, aa_lcr: 2, aa_ifbench: 2 },
    long_doc:         { aa_lcr: 5, aa_intelligence_index: 2 },
  },

  // ── AGENT ────────────────────────────────────────────────────────────────
  agent: {
    planning:       { aa_intelligence_index: 3, aa_tau2: 2, aa_ifbench: 2 },
    tool_use:       { aa_tau2: 4, aa_intelligence_index: 2, aa_ifbench: 1 },
    multi_step:     { aa_tau2: 3, aa_terminalbench_hard: 3, aa_intelligence_index: 2 },
    self_correction:{ aa_intelligence_index: 3, aa_hle: 2, aa_tau2: 2 },
    browser:        { aa_tau2: 3, aa_terminalbench_hard: 3, aa_ifbench: 2 },
    code_agent:     { aa_terminalbench_hard: 4, aa_coding_index: 3, aa_tau2: 2 },
  },

  // ── MULTIMODAL ───────────────────────────────────────────────────────────
  multimodal: {
    image_understanding:{ aa_intelligence_index: 3, aa_ifbench: 2 },
    chart_analysis:     { aa_intelligence_index: 3, aa_gpqa: 2, aa_coding_index: 1 },
    ocr:                { aa_intelligence_index: 3, aa_ifbench: 2 },
    vision_qa:          { aa_intelligence_index: 3, aa_hle: 2, aa_gpqa: 1 },
    image_code:         { aa_coding_index: 3, aa_intelligence_index: 2 },
    mm_general:         { aa_intelligence_index: 4, aa_ifbench: 2 },
  },

  // ── TRANSLATE ────────────────────────────────────────────────────────────
  translate: {
    zh_en:                 { aa_intelligence_index: 3, aa_ifbench: 2 },
    en_zh:                 { aa_intelligence_index: 3, aa_ifbench: 2 },
    multilingual_translate:{ aa_intelligence_index: 3, aa_ifbench: 3 },
    technical_translate:   { aa_intelligence_index: 3, aa_ifbench: 2, aa_coding_index: 1 },
    literary:              { aa_intelligence_index: 3, aa_ifbench: 3 },
    localization:          { aa_intelligence_index: 2, aa_ifbench: 4 },
  },
};

// ---------------------------------------------------------------------------
// Profile weights: how to combine the 4 scored dimensions
//   quality, cost (higher=cheaper), latency (higher=faster ttft), throughput
// ---------------------------------------------------------------------------

export interface DimensionWeights {
  quality: number;
  cost: number;
  latency: number;
  throughput: number;
}

export const PROFILE_WEIGHTS: Record<ProfileKey, DimensionWeights> = {
  balanced:     { quality: 0.35, cost: 0.25, latency: 0.20, throughput: 0.20 },
  best_quality: { quality: 0.60, cost: 0.10, latency: 0.15, throughput: 0.15 },
  best_value:   { quality: 0.35, cost: 0.40, latency: 0.15, throughput: 0.10 },
  cheapest:     { quality: 0.15, cost: 0.60, latency: 0.15, throughput: 0.10 },
  fastest:      { quality: 0.25, cost: 0.10, latency: 0.40, throughput: 0.25 },
};

// ---------------------------------------------------------------------------
// Known Chinese providers (for region filtering)
// ---------------------------------------------------------------------------

export const CN_PROVIDERS = new Set([
  'deepseek', 'alibaba', 'baidu', 'bytedance', 'zhipu',
  'moonshot', 'minimax', 'tencent', '01ai',
  'qwen', 'kimi', 'doubao', 'baichuan', 'sensenova', 'spark',
]);

// ---------------------------------------------------------------------------
// Sub-scenario labels (for UI rendering)
// ---------------------------------------------------------------------------

export const SCENARIO_LABELS: Record<ScenarioKey, string> = {
  chat:       '通用对话',
  code:       '代码助手',
  math:       '数学推理',
  copy:       '文案创作',
  rag:        '长文档 RAG',
  agent:      '智能体 Agent',
  multimodal: '多模态',
  translate:  '翻译',
};

export const SUB_SCENARIO_LABELS: Record<string, string> = {
  // chat
  general: '通用闲聊', creative: '创意写作', customer_service: '客服场景',
  instruction_following: '指令遵循', long_context: '长上下文', multilingual: '多语言',
  // code
  generation: '代码生成', debugging: 'Bug 纠错', refactoring: '代码重构',
  sql: 'SQL 查询', testing: '单元测试', explanation: '代码解释',
  // math
  basic: '基础数学', advanced: '高级数学', statistics: '统计分析',
  logic: '逻辑推理', proof: '数学证明', aime: 'AIME竞赛级',
  // copy
  marketing: '营销文案', social_media: '社媒内容', technical_docs: '技术文档',
  story: '故事创作', seo: 'SEO优化', email: '邮件写作',
  // rag
  document_qa: '文档问答', summarization: '长文摘要', extraction: '信息抽取',
  citation: '引用溯源', multilingual_doc: '多语言文档', long_doc: '超长文档',
  // agent
  planning: '任务规划', tool_use: '工具调用', multi_step: '多步骤推理',
  self_correction: '自我纠错', browser: '浏览器操作', code_agent: '代码执行体',
  // multimodal
  image_understanding: '图像理解', chart_analysis: '图表分析', ocr: 'OCR识别',
  vision_qa: '视觉问答', image_code: '图生代码', mm_general: '通用多模态',
  // translate
  zh_en: '中译英', en_zh: '英译中', multilingual_translate: '多语互译',
  technical_translate: '专业术语', literary: '文学翻译', localization: '本地化',
};

export const SCENARIO_SUB_SCENARIOS: Record<ScenarioKey, SubScenarioKey[]> = {
  chat:       ['general', 'creative', 'customer_service', 'instruction_following', 'long_context', 'multilingual'],
  code:       ['generation', 'debugging', 'refactoring', 'sql', 'testing', 'explanation'],
  math:       ['basic', 'advanced', 'statistics', 'logic', 'proof', 'aime'],
  copy:       ['marketing', 'social_media', 'technical_docs', 'story', 'seo', 'email'],
  rag:        ['document_qa', 'summarization', 'extraction', 'citation', 'multilingual_doc', 'long_doc'],
  agent:      ['planning', 'tool_use', 'multi_step', 'self_correction', 'browser', 'code_agent'],
  multimodal: ['image_understanding', 'chart_analysis', 'ocr', 'vision_qa', 'image_code', 'mm_general'],
  translate:  ['zh_en', 'en_zh', 'multilingual_translate', 'technical_translate', 'literary', 'localization'],
};
