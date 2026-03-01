# 数据处理规则

## LLM 数据去重

同一模型系列可能有多条记录（如 reasoning/non-reasoning 变体），**只保留 intelligence_index 最高的那条**。

判断"同系列"的方式：去掉名称中括号内容后相同，即视为同系列。

```python
# 去重逻辑示例
from collections import defaultdict
groups = defaultdict(list)
for r in llm_rows:
    base_name = re.sub(r'\s*\(.*?\)', '', r['aa_name']).strip()
    groups[base_name].append(r)

deduped = []
for base_name, variants in groups.items():
    best = max(variants, key=lambda r: float(r['aa_intelligence_index'] or 0))
    deduped.append(best)
```

## 模型名称清洗

去掉括号及括号内内容（与排行榜一致）：
- `Claude Sonnet 4.6 (Adaptive Reasoning, Max Effort)` → `Claude Sonnet 4.6`
- `GLM-5 (Reasoning)` → `GLM-5`
- `Qwen3.5 27B (Non-reasoning)` → `Qwen3.5 27B`

**绝不显示** "推理"、"非推理"、"Reasoning"、"Non-reasoning" 等标签。

## 定价换算

**人民币 = USD × 当前汇率**（默认 6.86，以用户确认的汇率为准）

- 定价为 $0 的模型：可能是数据缺失，在表格中显示 `¥—`，**不要显示为"免费"**
- 性价比分析章节：过滤掉 inputCny === 0 的模型，只对比有定价的模型

```typescript
function cnyFmt(cny: number | null): string {
  if (cny === null || cny === 0) return '—';
  if (cny < 1) return `¥${cny.toFixed(2)}`;
  return `¥${cny.toFixed(1)}`;
}
```

## 多模态数据

- 多模态的 `aa_release_date` 通常只有月份精度（如 `"2026-03"`），用 `startsWith` 过滤
- LLM 的 `aa_release_date` 是完整日期（如 `"2026-03-15"`）
- 多模态性能指标用 **ELO 分**（`aa_elo` 字段），不用 intelligence_index
- 多模态 slug 格式：`modality::model-slug`（如 `image_to_video::kling-3-0-pro`）
  - 链接时需 `encodeURIComponent(slug)` 处理 `::` 字符

## 字段映射

| 用途 | Supabase 字段 |
|------|--------------|
| 模型名 | `aa_name` |
| 页面链接 slug | `aa_slug` |
| 厂商英文名 | `aa_model_creator_name` |
| 厂商中文名 | `aa_model_creator_name_cn` |
| 是否中国厂商 | `is_cn_provider` |
| 发布日期 | `aa_release_date` |
| 模态类型 | `aa_modality` |
| 智能指数 | `aa_intelligence_index` |
| 代码指数 | `aa_coding_index` |
| GPQA | `aa_gpqa` |
| 输入定价(USD) | `aa_price_input_usd` |
| 输出定价(USD) | `aa_price_output_usd` |
| 上下文长度(K) | `aa_context_length` |
| ELO（多模态） | `aa_elo` |
