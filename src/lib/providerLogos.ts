const PROVIDER_LOGO_MAP: Array<{ patterns: string[]; file: string }> = [
  { patterns: ['openai'], file: 'openai.svg' },
  { patterns: ['anthropic'], file: 'anthropic.svg' },
  { patterns: ['google', 'gemini'], file: 'google.svg' },
  { patterns: ['meta', 'llama'], file: 'meta.svg' },
  { patterns: ['xai', 'x ai'], file: 'x.svg' },
  { patterns: ['microsoft azure', 'microsoft'], file: 'microsoft.svg' },
  { patterns: ['amazon web services', 'aws'], file: 'amazonwebservices.svg' },
  { patterns: ['amazon'], file: 'amazon.svg' },
  { patterns: ['nvidia'], file: 'nvidia.svg' },
  { patterns: ['mistral', 'mistralai'], file: 'mistralai.svg' },
  { patterns: ['alibaba', 'qwen'], file: 'alibabacloud.svg' },
  { patterns: ['tencent'], file: 'tencentqq.svg' },
  { patterns: ['baidu', 'ernie'], file: 'baidu.svg' },
  { patterns: ['ibm'], file: 'ibm.svg' },
  { patterns: ['perplexity'], file: 'perplexity.svg' },
  { patterns: ['hugging face', 'huggingface'], file: 'huggingface.svg' },
  { patterns: ['bytedance', 'byte dance'], file: 'bytedance.svg' },
  { patterns: ['minimax'], file: 'minimax.svg' },
  { patterns: ['cohere'], file: 'cohere.ico' },
  { patterns: ['stability', 'stability.ai'], file: 'stabilityai.ico' },
  { patterns: ['stepfun', 'step fun'], file: 'stepfun.ico' },
  { patterns: ['siliconflow', 'silicon flow', '硅基流动'], file: 'siliconflow.ico' },
  { patterns: ['moonshot', 'kimi'], file: 'moonshot.ico' },
  { patterns: ['zhipu', 'chatglm', 'z ai', 'z.ai'], file: 'zhipu.ico' },
  { patterns: ['deepseek', 'deep seek'], file: 'deepseek.jpeg' },
  { patterns: ['xiaomi', 'mimo'], file: 'xiaomi.svg' },
  { patterns: ['kuaishou', 'kwai', 'kling', 'klingai', 'kwaikat'], file: 'kuaishou.svg' },
  { patterns: ['black forest labs', 'blackforestlabs'], file: 'stabilityai.ico' },
  { patterns: ['ai21 labs', 'ai21'], file: 'cohere.ico' },
  { patterns: ['liquid ai', 'liquidai'], file: 'cohere.ico' },
  { patterns: ['nous research', 'nousresearch'], file: 'openrouter.svg' },
  { patterns: ['inclusionai', 'inclusion ai'], file: 'openrouter.svg' },
  { patterns: ['leonardo.ai', 'leonardo ai'], file: 'stabilityai.ico' },
  { patterns: ['lg ai research', 'lgairesearch'], file: 'google.svg' },
  { patterns: ['allen institute for ai', 'ai2'], file: 'huggingface.svg' },
  { patterns: ['z ai', 'z.ai'], file: 'zhipu.ico' },
  { patterns: ['byte dance seed', 'bytedance seed'], file: 'bytedance.svg' },
  { patterns: ['databricks'], file: 'databricks.svg' },
  { patterns: ['adobe'], file: 'adobe.ico' },
  { patterns: ['hume ai', 'humeai'], file: 'humeai.ico' },
  { patterns: ['hidream', 'hi dream'], file: 'hidream.ico' },
  { patterns: ['upstage'], file: 'upstage.svg' },
  { patterns: ['bria'], file: 'bria.ico' },
  { patterns: ['fish audio', 'fishaudio'], file: 'fishaudio.ico' },
  { patterns: ['inworld'], file: 'inworld.ico' },
  { patterns: ['fal'], file: 'fal.png' },
  { patterns: ['luma labs', 'lumalabs'], file: 'lumalabs.ico' },
  { patterns: ['murf ai', 'murfai'], file: 'murfai.ico' },
  { patterns: ['playground ai', 'playgroundai'], file: 'playgroundai.ico' },
  { patterns: ['pruna ai', 'prunaai'], file: 'prunaai.png' },
  { patterns: ['recraft'], file: 'recraft.png' },
  { patterns: ['reka ai', 'rekaai'], file: 'rekaai.jpg' },
  { patterns: ['resemble ai', 'resembleai'], file: 'resembleai.jpg' },
  { patterns: ['sourceful'], file: 'sourceful.ico' },
  { patterns: ['openrouter', 'open router'], file: 'openrouter.svg' },
  { patterns: ['elevenlabs', 'eleven labs'], file: 'elevenlabs.svg' },
];

function normalize(value: string): string {
  return value.toLowerCase().trim();
}

function compact(value: string): string {
  return value.replace(/[^a-z0-9\u4e00-\u9fa5]/g, '');
}

export function getProviderLogoUrl(providerName: string | null | undefined): string | null {
  const normalized = normalize(providerName ?? '');
  if (!normalized) return null;
  const normalizedCompact = compact(normalized);

  const hit = PROVIDER_LOGO_MAP.find((entry) =>
    entry.patterns.some((pattern) => {
      const p = normalize(pattern);
      return normalized.includes(p) || normalizedCompact.includes(compact(p));
    })
  );

  if (!hit) return null;
  return `/provider-logos/${hit.file}`;
}

const PROVIDER_DESCRIPTIONS: Array<{ patterns: string[]; desc: string }> = [
  { patterns: ['google', 'gemini'], desc: '全球顶尖科技公司，深耕AI、搜索与云计算' },
  { patterns: ['openai'], desc: '引领生成式AI浪潮的美国人工智能研究公司' },
  { patterns: ['anthropic'], desc: '专注AI安全的研究公司，Claude系列模型开发者' },
  { patterns: ['meta', 'llama'], desc: '社交媒体巨头，推动开源大模型生态发展' },
  { patterns: ['xai', 'x ai'], desc: '马斯克创立的AI公司，致力于理解宇宙本质' },
  { patterns: ['microsoft'], desc: '全球最大软件公司，深度投资OpenAI并布局AI' },
  { patterns: ['amazon web services', 'aws'], desc: '全球最大云计算平台，提供完整AI基础设施' },
  { patterns: ['nvidia'], desc: 'AI芯片领导者，GPU生态赋能大模型训练与推理' },
  { patterns: ['mistral', 'mistralai'], desc: '欧洲领先AI公司，专注高效开源大语言模型' },
  { patterns: ['alibaba', 'qwen'], desc: '阿里巴巴旗下AI团队，通义千问系列模型开发者' },
  { patterns: ['deepseek'], desc: '深度求索，低成本高性能推理模型的中国黑马' },
  { patterns: ['bytedance'], desc: '字节跳动旗下AI团队，豆包大模型开发者' },
  { patterns: ['baidu', 'ernie'], desc: '中国最大搜索公司，文心一言大模型开发者' },
  { patterns: ['moonshot', 'kimi'], desc: '月之暗面，长上下文理解能力领先的中国AI公司' },
  { patterns: ['zhipu', 'chatglm'], desc: '智谱AI，清华系公司，GLM系列大模型开发者' },
  { patterns: ['minimax'], desc: 'MiniMax，多模态AIGC领域的中国明星创业公司' },
  { patterns: ['tencent'], desc: '腾讯混元大模型，中国互联网巨头旗下AI研究团队' },
  { patterns: ['cohere'], desc: '专注企业级NLP应用的加拿大AI公司' },
  { patterns: ['perplexity'], desc: '基于AI的新一代搜索引擎，实时联网问答' },
  { patterns: ['databricks'], desc: '数据+AI平台公司，开源大模型生态重要贡献者' },
];

export function getProviderDescription(providerName: string | null | undefined): string | null {
  const normalized = normalize(providerName ?? '');
  if (!normalized) return null;
  const normalizedCompact = compact(normalized);
  const hit = PROVIDER_DESCRIPTIONS.find((entry) =>
    entry.patterns.some((pattern) => {
      const p = normalize(pattern);
      return normalized.includes(p) || normalizedCompact.includes(compact(p));
    })
  );
  return hit?.desc ?? null;
}

export function getProviderInitials(providerName: string | null | undefined): string {
  const value = (providerName ?? '').trim();
  if (!value) return 'AI';
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
}
