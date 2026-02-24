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
  { patterns: ['deepseek', 'deep seek'], file: 'deepseek.svg' },
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

export function getProviderInitials(providerName: string | null | undefined): string {
  const value = (providerName ?? '').trim();
  if (!value) return 'AI';
  const words = value.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? ''}${words[1][0] ?? ''}`.toUpperCase();
}
