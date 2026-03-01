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
  { patterns: ['inception'], file: 'openrouter.svg' },
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
  // Video generation
  { patterns: ['pixverse', 'pix verse', '爱诗'], file: 'lumalabs.ico' },
  { patterns: ['runway', 'runwayml'], file: 'lumalabs.ico' },
  { patterns: ['pika art', 'pika labs', 'pika'], file: 'lumalabs.ico' },
  { patterns: ['vidu'], file: 'lumalabs.ico' },
  { patterns: ['haiper'], file: 'lumalabs.ico' },
  { patterns: ['lightricks'], file: 'lumalabs.ico' },
  { patterns: ['genmo'], file: 'lumalabs.ico' },
  { patterns: ['moonvalley'], file: 'lumalabs.ico' },
  { patterns: ['video rebirth'], file: 'lumalabs.ico' },
  // Image generation
  { patterns: ['midjourney'], file: 'stabilityai.ico' },
  { patterns: ['ideogram'], file: 'recraft.png' },
  { patterns: ['krea'], file: 'recraft.png' },
  { patterns: ['imagineart', 'imagine art'], file: 'stabilityai.ico' },
  { patterns: ['reve'], file: 'recraft.png' },
  // TTS / Voice
  { patterns: ['cartesia'], file: 'elevenlabs.svg' },
  { patterns: ['coqui'], file: 'fishaudio.ico' },
  { patterns: ['lmnt'], file: 'fishaudio.ico' },
  { patterns: ['kokoro'], file: 'fishaudio.ico' },
  { patterns: ['metavoice', 'meta voice'], file: 'fishaudio.ico' },
  { patterns: ['neuphonic'], file: 'fishaudio.ico' },
  { patterns: ['speechify'], file: 'fishaudio.ico' },
  { patterns: ['zyphra'], file: 'fishaudio.ico' },
  { patterns: ['styletts', 'style tts'], file: 'fishaudio.ico' },
  { patterns: ['openvoice', 'open voice'], file: 'fishaudio.ico' },
  // Other
  { patterns: ['meituan', '美团'], file: 'openrouter.svg' },
  { patterns: ['opengvlab'], file: 'huggingface.svg' },
  { patterns: ['teleai', 'tele ai'], file: 'openrouter.svg' },
  { patterns: ['vectorspacelab', 'vector space lab'], file: 'openrouter.svg' },
  { patterns: ['eigen ai', 'eigenai'], file: 'openrouter.svg' },
  { patterns: ['maya research', 'mayaresearch'], file: 'fishaudio.ico' },
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
  { patterns: ['amazon'], desc: 'Amazon旗下AI业务团队，Nova系列多模态大模型开发者，深度整合AWS云服务生态' },
  { patterns: ['ibm'], desc: '全球企业级IT巨头，Granite系列开源大模型开发者，专注企业AI合规与可信应用' },
  { patterns: ['hugging face', 'huggingface'], desc: '全球最大开源AI社区与模型托管平台，聚合数十万模型，推动AI民主化发展' },
  { patterns: ['stability', 'stability.ai'], desc: '开源图像生成模型先驱，Stable Diffusion系列模型开发者，引领AI绘图生态' },
  { patterns: ['black forest labs', 'blackforestlabs'], desc: 'Stability AI核心团队创立，FLUX系列高质量图像生成模型开发者' },
  { patterns: ['ai21 labs', 'ai21'], desc: '以色列AI公司，Jamba系列混合SSM-Transformer架构大语言模型开发者' },
  { patterns: ['liquid ai', 'liquidai'], desc: '专注高效序列模型架构的美国AI公司，Liquid Foundation Models系列开发者' },
  { patterns: ['inception'], desc: '专注扩散式语言模型的美国AI公司，Mercury系列高速推理大模型开发者' },
  { patterns: ['nous research', 'nousresearch'], desc: '开源大模型研究社区，以高质量指令微调与模型增强技术著称' },
  { patterns: ['inclusionai', 'inclusion ai'], desc: '专注普惠AI的研究团队，致力于推动大模型技术在更广泛场景中的落地应用' },
  { patterns: ['leonardo.ai', 'leonardo ai'], desc: '专注游戏与创意设计的AI图像生成平台，提供高质量可商用视觉AI工具' },
  { patterns: ['lg ai research', 'lgairesearch'], desc: 'LG电子旗下AI研究院，EXAONE系列大语言模型开发者，专注产业AI应用' },
  { patterns: ['allen institute for ai', 'ai2'], desc: '保罗·艾伦创立的非营利AI研究机构，OLMo系列完全开源大模型开发者' },
  { patterns: ['byte dance seed', 'bytedance seed'], desc: '字节跳动Seed基础模型团队，专注前沿大模型基础研究与突破性技术探索' },
  { patterns: ['adobe'], desc: '全球创意软件领导者，Firefly系列AI图像生成模型开发者，深耕创意设计AI工具' },
  { patterns: ['hume ai', 'humeai'], desc: '专注情感智能与表达性AI的研究公司，EVI情感语音交互大模型开发者' },
  { patterns: ['hidream', 'hi dream'], desc: '专注高质量图像生成的AI公司，HiDream系列扩散模型开发者' },
  { patterns: ['upstage'], desc: '韩国AI公司，Solar系列高效大语言模型开发者，专注文档理解与企业AI落地' },
  { patterns: ['bria'], desc: '专注商业图像生成与编辑的AI公司，提供版权合规的视觉AI创作解决方案' },
  { patterns: ['fish audio', 'fishaudio'], desc: '专注高质量语音合成与声音克隆的AI公司，以自然逼真的语音效果著称' },
  { patterns: ['inworld'], desc: '专注游戏与虚拟世界AI角色的美国公司，提供实时交互NPC智能对话解决方案' },
  { patterns: ['fal'], desc: 'AI模型快速推理与部署平台，专注图像视频生成模型的高性能云端推理服务' },
  { patterns: ['luma labs', 'lumalabs'], desc: '专注视频与3D生成AI的美国公司，Dream Machine视频生成模型开发者' },
  { patterns: ['murf ai', 'murfai'], desc: '专业AI语音合成平台，提供多语言高质量配音，广泛用于视频与内容创作' },
  { patterns: ['playground ai', 'playgroundai'], desc: '面向创意设计师的AI图像生成平台，以简洁易用的工作流和高质量输出著称' },
  { patterns: ['pruna ai', 'prunaai'], desc: '专注大模型压缩与加速推理的AI技术公司，致力于降低AI部署成本' },
  { patterns: ['recraft'], desc: '专注矢量图形与品牌视觉设计的AI生成公司，Recraft V3图像模型开发者' },
  { patterns: ['reka ai', 'rekaai'], desc: '多模态AI研究公司，Reka系列视觉语言大模型开发者，擅长长上下文多模态理解' },
  { patterns: ['resemble ai', 'resembleai'], desc: '专注语音克隆与实时语音合成技术的AI公司，提供高真实度语音AI服务' },
  { patterns: ['sourceful'], desc: '专注供应链与采购领域的AI解决方案公司，以垂直行业大模型应用见长' },
  { patterns: ['openrouter', 'open router'], desc: '统一多模型API调用平台，聚合数百个大模型的路由中转服务商' },
  { patterns: ['elevenlabs', 'eleven labs'], desc: '全球领先的AI语音合成公司，以高度逼真的声音克隆与多语言配音技术著称' },
  // Video generation
  { patterns: ['pixverse', 'pix verse', '爱诗'], desc: '爱诗科技，专注AI视频生成的中国公司，PixVerse系列高质量视频生成模型开发者' },
  { patterns: ['runway', 'runwayml'], desc: '全球领先的创意AI公司，Gen系列视频生成模型开发者，深耕影视级AI视频编辑与生成' },
  { patterns: ['pika art', 'pika labs', 'pika'], desc: '专注高质量AI视频创作的美国公司，Pika系列视频生成模型开发者，以创意表达见长' },
  { patterns: ['vidu'], desc: '生数科技，专注长时序高一致性视频生成的中国AI公司，Vidu系列视频模型开发者' },
  { patterns: ['haiper'], desc: '专注视频生成的英国AI公司，以高质量、高速度的视频生成能力著称' },
  { patterns: ['lightricks'], desc: '以色列创意AI公司，LTX-Video系列开源视频生成模型开发者，深耕创意影像AI工具' },
  { patterns: ['genmo'], desc: '专注开源视频生成模型的美国AI公司，Mochi系列高保真视频生成模型开发者' },
  { patterns: ['moonvalley'], desc: '专注影视级视频生成的AI公司，以高保真度、高一致性的视频生成能力著称' },
  { patterns: ['video rebirth'], desc: '专注AI视频生成与影像风格化的创作团队，提供高质量视频AI创作解决方案' },
  // Image generation
  { patterns: ['midjourney'], desc: '独立AI研究实验室，以极高艺术质量图像生成著称，是AI图像创作领域的标杆产品' },
  { patterns: ['ideogram'], desc: '专注文字渲染准确性的AI图像生成公司，擅长将文本精确、美观地融入图像创作' },
  { patterns: ['krea'], desc: '面向创意工作者的AI实时生成平台，支持图像与视频的交互式实时AI创作' },
  { patterns: ['imagineart', 'imagine art'], desc: '面向创意用户的AI图像生成平台，提供多种艺术风格的高质量图像创作工具' },
  { patterns: ['reve'], desc: '专注AI图像生成的新兴公司，Reve Image以高质量艺术风格图像生成能力见长' },
  // TTS / Voice
  { patterns: ['cartesia'], desc: '专注高效实时语音合成的美国AI公司，Sonic系列超低延迟TTS模型开发者' },
  { patterns: ['coqui'], desc: '开源语音合成技术社区，XTTS系列多语言声音克隆模型开发者，推动TTS技术开放发展' },
  { patterns: ['lmnt'], desc: '专注超低延迟语音合成的美国AI公司，提供面向实时对话场景的语音AI基础设施' },
  { patterns: ['kokoro'], desc: '开源高质量语音合成模型，以轻量高效著称，广泛用于本地与边缘端TTS部署' },
  { patterns: ['metavoice', 'meta voice'], desc: '专注个性化语音克隆的英国AI公司，MetaVoice-1B开源TTS大模型开发者' },
  { patterns: ['neuphonic'], desc: '专注超低延迟多语言语音合成的AI公司，提供适合实时对话场景的流式TTS服务' },
  { patterns: ['speechify'], desc: '全球领先的AI朗读与语音合成平台，专注无障碍阅读体验与内容有声化服务' },
  { patterns: ['zyphra'], desc: '专注高效AI模型研究的公司，Zonos系列高表现力开源语音合成模型开发者' },
  { patterns: ['styletts', 'style tts'], desc: '开源风格迁移语音合成项目，StyleTTS2以接近真人音色的高质量TTS能力著称' },
  { patterns: ['openvoice', 'open voice'], desc: 'MyShell团队开发的开源即时声音克隆技术，支持多语言跨语种声音复刻与风格迁移' },
  // Other
  { patterns: ['meituan', '美团'], desc: '美团旗下AI研究团队，深耕本地生活服务场景的大模型与视觉AI应用研发' },
  { patterns: ['opengvlab'], desc: '上海AI实验室旗下视觉研究团队，InternVL系列多模态大模型开发者' },
  { patterns: ['teleai', 'tele ai'], desc: '中国电信旗下AI研究院，专注电信垂直领域的大模型应用与基础AI能力建设' },
  { patterns: ['vectorspacelab', 'vector space lab'], desc: '专注向量语义表示学习的AI研究团队，深耕文本嵌入、检索与语义理解技术' },
  { patterns: ['eigen ai', 'eigenai'], desc: '专注企业级安全AI部署的公司，提供私有化大模型推理加速与合规部署解决方案' },
  { patterns: ['maya research', 'mayaresearch'], desc: '专注语音与多模态理解技术的AI研究团队，致力于自然交互AI系统的前沿探索' },
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
