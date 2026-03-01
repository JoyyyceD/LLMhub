# 白皮书页面结构模板

## 文件约定

- 路径：`src/pages/Whitepaper{YYYYMM}.tsx`
- 路由：`/whitepaper/{YYYY}-{MM}`
- 不使用 `useState`（无 filter tabs）

## 页面章节顺序

```
01 执行摘要    — 5 条关键洞察（KEY_FINDINGS）
02 性能排行    — LLM Top 5（按 intelligence_index）
03 全量发布    — 两张固定表格：中国厂商 / 国际厂商，无 filter tabs
04 多模态发布  — 视频生成（按 ELO 降序）+ 图像生成（按 ELO 降序）
05 厂商分析    — 按发布数量排列的厂商卡片，含 Alibaba spotlight（如适用）
06 性价比分析  — 定价 vs 智能指数横向对比，仅含有定价数据的模型
07 选型指南    — 4 个场景卡片（综合/代码/成本/超长上下文）
Footer CTA    — 链接到完整榜单和智能选型
```

## 禁止事项

- **不显示** 推理/非推理标签（badge、filter tab、section 标题均不出现）
- **不使用** emoji（🇨🇳、🧠 等）
- **不使用** USD 定价展示，全部换算为 CNY
- **不编造** 任何数据，所有数值来自查询结果

## 数据结构（TypeScript）

```typescript
// LLM 模型
const CN_MODELS = [
  {
    slug: string,           // aa_slug（直接用于 /model/:slug 路由）
    name: string,           // 去括号后的清洁名称
    provider: string,       // aa_model_creator_name（英文，用于 /provider/:name 路由）
    providerCn: string | null, // aa_model_creator_name_cn
    date: string,           // aa_release_date
    intel: number,          // aa_intelligence_index
    coding: number,         // aa_coding_index
    gpqa: number,           // aa_gpqa（小数，0~1）
    inputCny: number,       // aa_price_input_usd × 汇率（0 表示数据缺失）
    outputCny: number,      // aa_price_output_usd × 汇率
    contextK: number | null,// aa_context_length（单位 K）
  },
  // ...
];

// 多模态模型
const VIDEO_MODELS = [
  {
    slug: string,   // 完整 slug（含 modality:: 前缀，链接时需 encodeURIComponent）
    name: string,
    provider: string,
    elo: number,
    isCn: boolean,
  },
];
```

## 关键辅助组件

```typescript
// 模型详情链接（LLM 直接用 slug；多模态需 encodeURIComponent）
function ModelLink({ slug, children }) {
  return <Link to={`/model/${encodeURIComponent(slug)}`}>...</Link>;
}

// 厂商详情链接
function ProviderLink({ name, children }) {
  return <Link to={`/provider/${encodeURIComponent(name)}`}>...</Link>;
}

// CNY 格式化
function cnyFmt(cny: number | null): string {
  if (cny === null || cny === 0) return '—';
  if (cny < 1) return `¥${cny.toFixed(2)}`;
  return `¥${cny.toFixed(1)}`;
}
```

## 选型指南的 4 个场景

每次生成时，根据当月数据选择适合的模型填入：

| 场景 | 图标 | 选择逻辑 |
|------|------|---------|
| 综合能力最强 | Brain | intelligence_index 前 3 |
| 代码 / Agent | Code2 | coding_index 前 3 |
| 成本敏感 / 高并发 | DollarSign | inputCny 最低且 intel 较高的 3 个 |
| 超长上下文 (≥200K) | Zap | contextK ≥ 200 的前 3（按 contextK 降序） |

## 入口卡片（DeveloperEcosystem.tsx）

更新 `to`、标题行、副标题描述：

```tsx
<Link to="/whitepaper/2026-03" ...>
  <p>2026年3月 大模型行业月报</p>
  <p>XX个重点LLM发布 · 多模态新品 · 中美格局对比 · 开发者选型指南</p>
</Link>
```
