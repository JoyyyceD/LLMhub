# 数据字典（V1）

## 1. 说明

本文给出推荐系统 V1 的关键字段字典，统一字段类型、单位、缺失策略与使用场景。

## 2. 字段清单

| 字段名 | 类型 | 单位/枚举 | 角色 | 是否核心 | 缺失策略 | 说明 |
|---|---|---|---|---|---|---|
| `record_date` | string | `YYYY-MM-DD` | 快照 | 否 | 可空 | 数据快照日期 |
| `merge_key` | string | - | 匹配 | 否 | 可空 | AA/OR 合并匹配键 |
| `match_confidence` | string | `high/medium/low` | 匹配 | 否 | 可空 | 合并匹配置信度 |
| `has_aa` | boolean | `true/false` | 过滤 | 是 | 不可空 | 是否存在 AA 记录 |
| `has_or` | boolean | `true/false` | 过滤 | 是 | 不可空 | 是否存在 OR 记录 |
| `aa_slug` | string | - | 主键 | 是 | 缺失剔除 | 模型版本业务主键 |
| `aa_name` | string | - | 展示 | 是 | 缺失剔除 | 模型展示名称 |
| `aa_release_date` | string | date | 展示 | 否 | 可空 | 模型发布日期 |
| `aa_pricing_price_1m_input_tokens` | number | USD/1M tokens | 成本 | 是 | 缺失剔除 | 输入 token 原始单价（USD） |
| `aa_pricing_price_1m_output_tokens` | number | USD/1M tokens | 成本 | 是 | 缺失剔除 | 输出 token 原始单价（USD） |
| `aa_pricing_price_1m_blended_3_to_1` | number | USD/1M tokens | 成本 | 否 | 可空回退 | 混合成本价（回退用，USD） |
| `aa_median_time_to_first_token_seconds` | number | 秒 | 延迟 | 是 | 缺失剔除 | TTFT，中位数 |
| `aa_median_output_tokens_per_second` | number | token/s | 吞吐 | 是 | 缺失剔除 | TPS，中位数 |
| `aa_evaluations_artificial_analysis_intelligence_index` | number | 0-100 | 质量 | 是 | 缺失剔除 | 综合智能分 |
| `aa_evaluations_artificial_analysis_coding_index` | number | 0-100 | 质量 | 否 | 公式重分配 | 编码能力分 |
| `aa_evaluations_math_500` | number | 0-100 | 质量 | 否 | 公式重分配 | 数学补充指标 |
| `aa_evaluations_aime` | number | 0-100 | 质量 | 否 | 公式重分配 | 数学补充指标 |
| `aa_evaluations_gpqa` | number | 0-100 | 质量 | 否 | 公式重分配 | 推理补充指标 |
| `aa_evaluations_hle` | number | 0-100 | 质量 | 否 | 公式重分配 | 推理补充指标 |
| `aa_evaluations_ifbench` | number | 0-100 | 质量 | 否 | 公式重分配 | 工具/结构化任务能力指标 |
| `aa_evaluations_lcr` | number | 0-100 | 质量 | 否 | 公式重分配 | 代码相关补充指标 |
| `aa_evaluations_scicode` | number | 0-100 | 质量 | 否 | 公式重分配 | 科学/代码硬任务补充指标 |
| `aa_evaluations_terminalbench_hard` | number | 0-100 | 质量 | 否 | 公式重分配 | Agent/工具硬任务补充指标 |
| `aa_evaluations_tau2` | number | 0-100 | 质量 | 否 | 公式重分配 | 复杂任务补充指标 |
| `fx_usd_cny` | number | 汇率 | 展示 | 否 | 失败回退上次值 | USD 到 CNY 汇率快照值 |
| `fx_provider` | string | - | 审计 | 否 | 可空 | 汇率提供方 |
| `fx_last_update_utc` | string | ISO 8601 | 审计 | 否 | 可空 | 汇率源上次更新时间 |
| `fx_stale` | boolean | `true/false` | 质量 | 否 | 默认 false | 当日汇率失败后回退标记 |

## 3. 核心字段定义

V1 核心字段：

- `has_aa`
- `has_or`
- `aa_slug`
- `aa_name`
- `aa_pricing_price_1m_input_tokens`
- `aa_pricing_price_1m_output_tokens`
- `aa_median_time_to_first_token_seconds`
- `aa_median_output_tokens_per_second`
- `aa_evaluations_artificial_analysis_intelligence_index`

核心字段缺失时，该模型直接不进入候选池。

## 4. 使用口径

- 推荐主键：`aa_slug`
- 展示名称：`aa_name`
- 候选集入口：`has_aa = true AND has_or = true`
- 成本计算优先使用 input/output 价格，必要时回退 blended

货币展示口径（V1）：

- 存储与计算基准货币：USD
- 前端展示货币：CNY
- 建议在响应中携带 `fx_usd_cny` 及换算后的 CNY 字段，保证展示一致
