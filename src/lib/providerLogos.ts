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
  { patterns: ['google', 'gemini'], desc: 'Alphabet旗下全球领先科技公司，深耕AI、搜索与云计算，Gemini系列大模型开发者' },
  { patterns: ['openai'], desc: '全球最具影响力的AI研究公司，GPT与o系列模型开发者，引领生成式AI技术发展' },
  { patterns: ['anthropic'], desc: '专注前沿AI安全研究的美国公司，Claude系列大模型开发者，致力于构建可信赖的AI系统' },
  { patterns: ['meta', 'llama'], desc: '全球最大社交媒体公司，开源Llama系列大模型，积极推动AI开放生态发展' },
  { patterns: ['xai', 'x ai'], desc: '马斯克创立的AI公司，Grok系列模型开发者，致力于探索真实、有益的人工智能' },
  { patterns: ['microsoft'], desc: '全球最大软件公司，深度投资OpenAI，Azure AI平台覆盖企业级大模型应用' },
  { patterns: ['amazon web services', 'aws'], desc: '全球最大云计算平台，提供完整AI基础设施与模型服务，Bedrock平台运营者' },
  { patterns: ['nvidia'], desc: 'AI芯片与算力领导者，GPU生态赋能全球大模型训练与推理，Nemotron系列模型开发者' },
  { patterns: ['mistral', 'mistralai'], desc: '欧洲领先AI公司，以高效开源大语言模型闻名，专注推理性能与部署友好性' },
  { patterns: ['alibaba', 'qwen'], desc: '阿里巴巴集团旗下AI研究团队，通义千问（Qwen）系列多模态大模型开发者' },
  { patterns: ['deepseek'], desc: '深度求索，以极低成本打造高性能推理模型的中国AI公司，震撼全球AI产业格局' },
  { patterns: ['bytedance'], desc: '字节跳动旗下AI研究团队，豆包及Doubao系列大模型开发者，深耕多模态AI能力' },
  { patterns: ['baidu', 'ernie'], desc: '中国最大搜索引擎公司，文心一言（ERNIE）系列大模型开发者，深耕AI搜索与云服务' },
  { patterns: ['moonshot', 'kimi'], desc: '月之暗面，以超长上下文处理能力著称的中国AI公司，Kimi系列大模型开发者' },
  { patterns: ['zhipu', 'chatglm'], desc: '智谱AI，清华大学系AI公司，GLM系列大模型及CodeGeeX代码模型开发者' },
  { patterns: ['minimax'], desc: 'MiniMax，多模态AIGC领域的中国明星创业公司，MiniMax-Text及视频生成模型开发者' },
  { patterns: ['tencent'], desc: '腾讯旗下AI研究团队，混元大模型开发者，深度融合社交、游戏与企业AI应用场景' },
  { patterns: ['cohere'], desc: '专注企业级大语言模型与RAG应用的加拿大AI公司，Command系列模型开发者' },
  { patterns: ['perplexity'], desc: '基于大模型的新一代AI搜索引擎，实时联网问答，重新定义信息获取方式' },
  { patterns: ['databricks'], desc: '数据与AI一体化平台公司，DBRX开源模型开发者，赋能企业构建大模型应用' },
  { patterns: ['stepfun'], desc: '阶跃星辰，专注大模型基础研究的中国AI公司，Step系列多模态大模型开发者' },
  { patterns: ['siliconflow', '硅基流动'], desc: '硅基流动，提供高性价比大模型API推理服务的中国AI基础设施公司' },
  { patterns: ['xiaomi', 'mimo'], desc: '小米集团旗下AI团队，MiMo系列大模型开发者，深度融合消费电子与AI能力' },
  { patterns: ['kuaishou', 'kwai', 'kling'], desc: '快手旗下AI研究团队，可灵（Kling）视频生成模型开发者，深耕视频AI创作领域' },
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
