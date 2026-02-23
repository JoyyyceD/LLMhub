# 字段与模型规范（V1）

## 1. 推荐对象主键

- 业务主键：`aa_slug`
- 展示名称：`aa_name`

V1 以模型版本作为推荐粒度，不区分 provider endpoint。

## 2. 核心字段（严格模式）

以下字段缺失时，模型不进入推荐候选：

- `aa_slug`
- `aa_name`
- `aa_pricing_price_1m_input_tokens`
- `aa_pricing_price_1m_output_tokens`
- `aa_median_time_to_first_token_seconds`
- `aa_median_output_tokens_per_second`
- `aa_evaluations_artificial_analysis_intelligence_index`

## 3. 推荐相关字段映射

- 成本输入价：`aa_pricing_price_1m_input_tokens`
- 成本输出价：`aa_pricing_price_1m_output_tokens`
- 成本混合价（可选）：`aa_pricing_price_1m_blended_3_to_1`
- 首 token 延迟（TTFT）：`aa_median_time_to_first_token_seconds`
- 吞吐（TPS）：`aa_median_output_tokens_per_second`
- 编码质量：`aa_evaluations_artificial_analysis_coding_index`
- 综合智能：`aa_evaluations_artificial_analysis_intelligence_index`

## 4. 补充质量字段（按 use_case 选用）

- `aa_evaluations_math_500`
- `aa_evaluations_aime`
- `aa_evaluations_gpqa`
- `aa_evaluations_hle`
- `aa_evaluations_ifbench`
- `aa_evaluations_lcr`
- `aa_evaluations_scicode`
- `aa_evaluations_terminalbench_hard`
- `aa_evaluations_tau2`

## 5. 数据来源字段

- 是否来自 AA：`has_aa`
- 是否来自 OR：`has_or`
- 匹配置信度：`match_confidence`
- 快照日期：`record_date`

## 6. 地区偏好映射（V1 业务规则）

- 当用户选择 `cn_mainland`：剔除全部“海外模型”，仅保留中国大陆可用模型
- 当用户选择 `overseas`：保留“海外模型”集合
- 当用户选择 `no_preference`：不做该过滤

注：本规则为业务映射，后续可在数据层补充明确地域可用性字段后替换。

补充口径：

- 非中国大陆厂商统一归为“海外模型”
- 未识别厂商默认归为“海外模型”
