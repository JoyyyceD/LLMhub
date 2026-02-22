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
    latency: string; // TTFT
    throughput: string; // tokens/s
  };
  pricing: {
    input: string; // per 1M tokens
    output: string;
  };
  tags: string[];
  recommendationReason?: string;
  verified?: boolean;
}

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
    value: number; // 性价比
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
