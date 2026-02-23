/**
 * qualityConfig.ts
 *
 * 8 × 6 quality-metric weight table for the recommendation engine.
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
// 8 × 6 quality weight table
// ---------------------------------------------------------------------------

export const QUALITY_CONFIG: Record<ScenarioKey, Record<string, QualityWeights>> = {
  chat: {
    general:               { aa_intelligence_index: 0.36, aa_ifbench: 0.24, aa_hle: 0.14, aa_gpqa: 0.12, aa_tau2: 0.08, aa_lcr: 0.06 },
    creative:              { aa_intelligence_index: 0.42, aa_ifbench: 0.32, aa_hle: 0.08, aa_gpqa: 0.06, aa_tau2: 0.07, aa_lcr: 0.05 },
    customer_service:      { aa_ifbench: 0.38, aa_intelligence_index: 0.30, aa_hle: 0.10, aa_tau2: 0.10, aa_gpqa: 0.07, aa_lcr: 0.05 },
    instruction_following: { aa_ifbench: 0.44, aa_intelligence_index: 0.28, aa_hle: 0.10, aa_tau2: 0.08, aa_gpqa: 0.05, aa_lcr: 0.05 },
    long_context:          { aa_lcr: 0.30, aa_intelligence_index: 0.26, aa_ifbench: 0.20, aa_hle: 0.10, aa_gpqa: 0.08, aa_tau2: 0.06 },
    multilingual:          { aa_intelligence_index: 0.34, aa_ifbench: 0.34, aa_hle: 0.10, aa_gpqa: 0.10, aa_tau2: 0.07, aa_lcr: 0.05 },
  },

  code: {
    generation:  { aa_coding_index: 0.46, aa_intelligence_index: 0.15, aa_ifbench: 0.13, aa_lcr: 0.10, aa_scicode: 0.10, aa_hle: 0.04, aa_terminalbench_hard: 0.02 },
    debugging:   { aa_coding_index: 0.34, aa_hle: 0.18, aa_intelligence_index: 0.14, aa_ifbench: 0.12, aa_lcr: 0.08, aa_scicode: 0.08, aa_terminalbench_hard: 0.04, aa_tau2: 0.02 },
    refactoring: { aa_coding_index: 0.30, aa_ifbench: 0.20, aa_intelligence_index: 0.17, aa_hle: 0.10, aa_lcr: 0.10, aa_scicode: 0.08, aa_terminalbench_hard: 0.03, aa_tau2: 0.02 },
    sql:         { aa_coding_index: 0.24, aa_ifbench: 0.24, aa_hle: 0.16, aa_intelligence_index: 0.14, aa_gpqa: 0.08, aa_lcr: 0.06, aa_scicode: 0.06, aa_tau2: 0.02 },
    testing:     { aa_coding_index: 0.30, aa_ifbench: 0.24, aa_hle: 0.14, aa_intelligence_index: 0.12, aa_scicode: 0.10, aa_lcr: 0.06, aa_terminalbench_hard: 0.02, aa_tau2: 0.02 },
    explanation: { aa_intelligence_index: 0.28, aa_ifbench: 0.24, aa_coding_index: 0.20, aa_hle: 0.12, aa_gpqa: 0.06, aa_lcr: 0.06, aa_scicode: 0.02, aa_tau2: 0.02 },
  },

  science: {
    basic:      { aa_hle: 0.28, aa_intelligence_index: 0.24, aa_gpqa: 0.20, aa_ifbench: 0.12, aa_scicode: 0.10, aa_tau2: 0.06 },
    advanced:   { aa_hle: 0.34, aa_gpqa: 0.24, aa_intelligence_index: 0.16, aa_scicode: 0.14, aa_ifbench: 0.07, aa_tau2: 0.05 },
    statistics: { aa_gpqa: 0.28, aa_hle: 0.24, aa_intelligence_index: 0.20, aa_scicode: 0.12, aa_ifbench: 0.10, aa_tau2: 0.06 },
    logic:      { aa_hle: 0.40, aa_intelligence_index: 0.24, aa_gpqa: 0.14, aa_ifbench: 0.10, aa_tau2: 0.07, aa_scicode: 0.05 },
    proof:      { aa_hle: 0.34, aa_gpqa: 0.24, aa_intelligence_index: 0.18, aa_ifbench: 0.10, aa_scicode: 0.08, aa_tau2: 0.06 },
    aime:       { aa_hle: 0.38, aa_gpqa: 0.28, aa_intelligence_index: 0.14, aa_scicode: 0.10, aa_ifbench: 0.06, aa_tau2: 0.04 },
  },

  copy: {
    marketing:      { aa_intelligence_index: 0.44, aa_ifbench: 0.34, aa_hle: 0.08, aa_gpqa: 0.06, aa_tau2: 0.05, aa_lcr: 0.03 },
    social_media:   { aa_intelligence_index: 0.40, aa_ifbench: 0.36, aa_hle: 0.08, aa_tau2: 0.07, aa_gpqa: 0.05, aa_lcr: 0.04 },
    technical_docs: { aa_intelligence_index: 0.28, aa_ifbench: 0.24, aa_coding_index: 0.20, aa_hle: 0.12, aa_gpqa: 0.08, aa_lcr: 0.05, aa_tau2: 0.03 },
    story:          { aa_intelligence_index: 0.46, aa_ifbench: 0.30, aa_hle: 0.08, aa_gpqa: 0.05, aa_tau2: 0.06, aa_lcr: 0.05 },
    seo:            { aa_ifbench: 0.40, aa_intelligence_index: 0.34, aa_hle: 0.08, aa_gpqa: 0.06, aa_tau2: 0.07, aa_lcr: 0.05 },
    email:          { aa_ifbench: 0.38, aa_intelligence_index: 0.36, aa_hle: 0.09, aa_tau2: 0.08, aa_gpqa: 0.05, aa_lcr: 0.04 },
  },

  rag: {
    document_qa:      { aa_lcr: 0.32, aa_ifbench: 0.24, aa_intelligence_index: 0.20, aa_hle: 0.10, aa_gpqa: 0.08, aa_tau2: 0.06 },
    summarization:    { aa_lcr: 0.26, aa_intelligence_index: 0.26, aa_ifbench: 0.24, aa_hle: 0.10, aa_gpqa: 0.08, aa_tau2: 0.06 },
    extraction:       { aa_ifbench: 0.34, aa_lcr: 0.24, aa_intelligence_index: 0.18, aa_hle: 0.10, aa_gpqa: 0.08, aa_tau2: 0.06 },
    citation:         { aa_lcr: 0.36, aa_ifbench: 0.24, aa_intelligence_index: 0.16, aa_hle: 0.10, aa_gpqa: 0.08, aa_tau2: 0.06 },
    multilingual_doc: { aa_lcr: 0.28, aa_intelligence_index: 0.24, aa_ifbench: 0.24, aa_hle: 0.10, aa_gpqa: 0.08, aa_tau2: 0.06 },
    long_doc:         { aa_lcr: 0.40, aa_intelligence_index: 0.22, aa_ifbench: 0.16, aa_hle: 0.09, aa_gpqa: 0.07, aa_tau2: 0.06 },
  },

  agent: {
    planning:        { aa_tau2: 0.28, aa_intelligence_index: 0.24, aa_hle: 0.16, aa_ifbench: 0.14, aa_terminalbench_hard: 0.10, aa_gpqa: 0.05, aa_coding_index: 0.03 },
    tool_use:        { aa_tau2: 0.38, aa_terminalbench_hard: 0.22, aa_ifbench: 0.16, aa_intelligence_index: 0.12, aa_hle: 0.06, aa_coding_index: 0.04, aa_lcr: 0.02 },
    multi_step:      { aa_tau2: 0.28, aa_terminalbench_hard: 0.24, aa_hle: 0.18, aa_intelligence_index: 0.14, aa_ifbench: 0.08, aa_gpqa: 0.05, aa_coding_index: 0.03 },
    self_correction: { aa_hle: 0.24, aa_tau2: 0.22, aa_intelligence_index: 0.20, aa_ifbench: 0.14, aa_terminalbench_hard: 0.10, aa_coding_index: 0.06, aa_gpqa: 0.04 },
    browser:         { aa_tau2: 0.30, aa_terminalbench_hard: 0.24, aa_ifbench: 0.18, aa_intelligence_index: 0.14, aa_hle: 0.08, aa_lcr: 0.04, aa_coding_index: 0.02 },
    code_agent:      { aa_terminalbench_hard: 0.28, aa_tau2: 0.24, aa_coding_index: 0.20, aa_ifbench: 0.10, aa_intelligence_index: 0.08, aa_hle: 0.06, aa_scicode: 0.03, aa_lcr: 0.01 },
  },

  multimodal: {
    image_understanding: { aa_intelligence_index: 0.34, aa_ifbench: 0.24, aa_hle: 0.16, aa_gpqa: 0.14, aa_lcr: 0.07, aa_tau2: 0.05 },
    chart_analysis:      { aa_intelligence_index: 0.28, aa_hle: 0.22, aa_gpqa: 0.20, aa_ifbench: 0.14, aa_coding_index: 0.10, aa_lcr: 0.04, aa_tau2: 0.02 },
    ocr:                 { aa_ifbench: 0.30, aa_intelligence_index: 0.26, aa_hle: 0.14, aa_gpqa: 0.10, aa_lcr: 0.10, aa_tau2: 0.06, aa_coding_index: 0.04 },
    vision_qa:           { aa_intelligence_index: 0.30, aa_hle: 0.20, aa_ifbench: 0.20, aa_gpqa: 0.16, aa_lcr: 0.08, aa_tau2: 0.06 },
    image_code:          { aa_coding_index: 0.30, aa_intelligence_index: 0.24, aa_ifbench: 0.16, aa_hle: 0.10, aa_gpqa: 0.08, aa_lcr: 0.07, aa_tau2: 0.05 },
    mm_general:          { aa_intelligence_index: 0.34, aa_ifbench: 0.24, aa_hle: 0.16, aa_gpqa: 0.14, aa_lcr: 0.07, aa_tau2: 0.05 },
  },

  translate: {
    zh_en:                  { aa_ifbench: 0.40, aa_intelligence_index: 0.30, aa_hle: 0.10, aa_gpqa: 0.10, aa_lcr: 0.06, aa_tau2: 0.04 },
    en_zh:                  { aa_ifbench: 0.40, aa_intelligence_index: 0.30, aa_hle: 0.10, aa_gpqa: 0.10, aa_lcr: 0.06, aa_tau2: 0.04 },
    multilingual_translate: { aa_ifbench: 0.40, aa_intelligence_index: 0.30, aa_hle: 0.10, aa_gpqa: 0.10, aa_lcr: 0.06, aa_tau2: 0.04 },
    technical_translate:    { aa_ifbench: 0.30, aa_intelligence_index: 0.26, aa_coding_index: 0.20, aa_hle: 0.10, aa_gpqa: 0.08, aa_lcr: 0.04, aa_tau2: 0.02 },
    literary:               { aa_intelligence_index: 0.38, aa_ifbench: 0.34, aa_hle: 0.10, aa_gpqa: 0.08, aa_tau2: 0.06, aa_lcr: 0.04 },
    localization:           { aa_ifbench: 0.42, aa_intelligence_index: 0.30, aa_hle: 0.10, aa_tau2: 0.08, aa_gpqa: 0.06, aa_lcr: 0.04 },
  },
};

// ---------------------------------------------------------------------------
// Profile weights: how to combine 4 dimensions
// ---------------------------------------------------------------------------

export interface DimensionWeights {
  quality: number;
  cost: number;
  latency: number;
  throughput: number;
}

export const PROFILE_WEIGHTS: Record<ProfileKey, DimensionWeights> = {
  balanced:     { quality: 0.75, cost: 0.25, latency: 0.00, throughput: 0.00 },
  best_quality: { quality: 1.00, cost: 0.00, latency: 0.00, throughput: 0.00 },
  best_value:   { quality: 0.50, cost: 0.50, latency: 0.00, throughput: 0.00 },
  cheapest:     { quality: 0.30, cost: 0.70, latency: 0.00, throughput: 0.00 },
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
// Labels for UI
// ---------------------------------------------------------------------------

export const SCENARIO_LABELS: Record<ScenarioKey, string> = {
  chat:       '通用对话',
  code:       '代码助手',
  science:    '科学推理',
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
  // science
  basic: '基础科学推理', advanced: '高级科学推理', statistics: '统计分析',
  logic: '逻辑推理', proof: '科学证明', aime: 'AIME竞赛级',
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
  science:    ['basic', 'advanced', 'statistics', 'logic', 'proof', 'aime'],
  copy:       ['marketing', 'social_media', 'technical_docs', 'story', 'seo', 'email'],
  rag:        ['document_qa', 'summarization', 'extraction', 'citation', 'multilingual_doc', 'long_doc'],
  agent:      ['planning', 'tool_use', 'multi_step', 'self_correction', 'browser', 'code_agent'],
  multimodal: ['image_understanding', 'chart_analysis', 'ocr', 'vision_qa', 'image_code', 'mm_general'],
  translate:  ['zh_en', 'en_zh', 'multilingual_translate', 'technical_translate', 'literary', 'localization'],
};
