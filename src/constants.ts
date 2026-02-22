import { Model, Review } from './types';

export const MODELS: Model[] = [
  {
    id: 'deepseek-coder-v2',
    name: 'DeepSeek-Coder-V2',
    vendor: '深度求索 (DeepSeek)',
    releaseDate: '2024-06-17',
    type: 'open',
    parameters: '236B',
    description: 'DeepSeek-Coder-V2 是全球首个在代码能力上超越 GPT-4-Turbo 的开源模型。',
    benchmarks: {
      mmlu: 78.5,
      humanEval: 81.1,
      gsm8k: 84.2,
      math: 75.4
    },
    performance: {
      latency: '0.12s',
      throughput: '120 t/s'
    },
    pricing: {
      input: '¥1.00',
      output: '¥2.00'
    },
    tags: ['逻辑: 95', '代码: 96', '直连可用'],
    recommendationReason: '针对您的代码纠错需求，该模型在低延迟下表现最优。国产模型背景使其在理解中文注释和大陆网络访问上具备天然优势。',
    verified: true
  },
  {
    id: 'qwen2.5-coder-72b',
    name: 'Qwen2.5-Coder-72B',
    vendor: '通义千问 (Alibaba)',
    releaseDate: '2024-09-20',
    type: 'open',
    parameters: '72B',
    description: 'Qwen2.5-Coder 是阿里巴巴开源的旗舰级代码大模型。',
    benchmarks: {
      mmlu: 86.1,
      humanEval: 84.8,
      gsm8k: 91.6,
      math: 78.4
    },
    performance: {
      latency: '0.18s',
      throughput: '95 t/s'
    },
    pricing: {
      input: '¥0.80',
      output: '¥1.50'
    },
    tags: ['高性能', '多语言支持', '128k'],
    recommendationReason: 'Qwen2.5 在多编程语言代码生成上极具竞争力，且生态兼容性极佳，是替换海外主流模型的性价比之选。',
    verified: true
  },
  {
    id: 'glm-4-plus',
    name: 'GLM-4-Plus',
    vendor: '智谱 AI (Zhipu AI)',
    releaseDate: '2024-08-16',
    type: 'closed',
    description: '智谱 AI 推出的新一代旗舰模型，在长文本和 Agent 编排方面具有极强优势。',
    benchmarks: {
      mmlu: 85.0,
      humanEval: 78.0,
      gsm8k: 88.2,
      math: 72.5
    },
    performance: {
      latency: '0.25s',
      throughput: '55 t/s'
    },
    pricing: {
      input: '¥5.00',
      output: '¥10.00'
    },
    tags: ['长文本', 'Agent 框架', '复杂指令'],
    recommendationReason: '如果您需要将代码助手与内部文档系统 (RAG) 结合，GLM-4 的长文本理解及 Agent 编排能力更具优势。',
    verified: true
  },
  {
    id: 'yi-large',
    name: 'Yi-Large',
    vendor: '零一万物 (01.AI)',
    releaseDate: '2024-05-13',
    type: 'closed',
    description: '李开复创办的零一万物推出的旗舰模型，在中文语境下表现极其精准。',
    benchmarks: {
      mmlu: 82.5,
      humanEval: 75.0,
      gsm8k: 85.4,
      math: 70.2
    },
    performance: {
      latency: '0.32s',
      throughput: '42 t/s'
    },
    pricing: {
      input: '¥20.00',
      output: '¥20.00'
    },
    tags: ['全球性能领先', '通用能力强', '高精度'],
    recommendationReason: 'Yi-Large 在中文语境下的代码逻辑推理极其精准，尤其适合对代码生成质量有极高要求的专业级开发场景。',
    verified: true
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o (Omni)',
    vendor: 'OpenAI',
    releaseDate: '2024-05-13',
    type: 'closed',
    description: 'OpenAI 的旗舰全能模型，支持音频、视觉和文本的实时推理。',
    benchmarks: {
      mmlu: 88.7,
      humanEval: 87.1,
      gsm8k: 93.2,
      math: 76.6
    },
    performance: {
      latency: '0.15s',
      throughput: '102 t/s'
    },
    pricing: {
      input: '$5.00',
      output: '$15.00'
    },
    tags: ['全能型', '国际领先', '多模态'],
    verified: true
  }
];

export const REVIEWS: Review[] = [
  {
    id: 'rev-1',
    userName: 'TechArchitect_Wang',
    userAvatar: 'https://picsum.photos/seed/user1/100/100',
    userLevel: 'LV.4',
    modelId: 'deepseek-coder-v2',
    modelName: 'DeepSeek-V3',
    time: '2小时前',
    rating: 4.0,
    scores: {
      value: 5.0,
      code: 4.5,
      logic: 4.2,
      stability: 3.8
    },
    pros: ['API响应极快', '开源可私有化', '推理成本几乎可以忽略不计'],
    cons: ['长文本偶发幻觉', '中文语义理解略逊于 GPT-4o'],
    content: '在最近的生产环境测试中，DeepSeek-V3 展现出了惊人的性价比。对于日常的代码辅助和基础逻辑处理，它几乎能达到 GPT-4 的 90% 以上水平，但在处理超过 32k 的长文本时，逻辑的一致性会有所下降。特别是在处理 Python 复杂嵌套逻辑时，表现非常出色。强烈推荐作为小型企业的首选基础模型...',
    likes: 128,
    replies: 14
  }
];
