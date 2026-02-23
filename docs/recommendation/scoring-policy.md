# 打分与排序策略（V1）

## 1. 目标

在候选模型上完成多目标排序，平衡：

- 质量（Quality）
- 成本（Cost）
- 延迟（Latency）
- 吞吐（Throughput）

## 2. 候选集

- 仅从 `has_aa = true AND has_or = true` 记录中选取
- 通过核心字段严格校验后进入打分阶段

## 3. 计算链路（固定顺序）

1. 解析用户输入并确定 `use_case`、`profile`、有效权重
2. 构建候选集并执行硬过滤
3. 计算四个维度的原始值（质量/成本/延迟/吞吐）
4. 对每个维度做归一化（0-100）
5. 计算总分并排序
6. 生成解释、tradeoff、缺失标记、置信度
7. 返回 Top4（可不足 4）

## 4. 维度定义

- Quality：按 use_case 选取对应质量字段
- Cost：基于输入/输出价格估算成本
- Latency：基于 TTFT（越低越好）
- Throughput：基于 TPS（越高越好）

## 5. Quality 公式（V1 默认）

质量公式来源：

- 一级/二级场景的 Q 权重配置见 `docs/recommendation/quality-config-8x6.md`。
- 本节仅给出示例基线；实际以配置文件映射为准。

### 5.1 coding

- `Q_raw = 0.55*coding_index + 0.25*lcr + 0.10*ifbench + 0.10*intelligence_index`

字段：

- `aa_evaluations_artificial_analysis_coding_index`
- `aa_evaluations_lcr`
- `aa_evaluations_ifbench`
- `aa_evaluations_artificial_analysis_intelligence_index`

### 5.2 science_reasoning

- `Q_raw = 0.45*intelligence_index + 0.20*gpqa + 0.15*hle + 0.20*scicode`

字段：

- `aa_evaluations_artificial_analysis_intelligence_index`
- `aa_evaluations_gpqa`
- `aa_evaluations_hle`
- `aa_evaluations_scicode`

### 5.3 general_reasoning

- `Q_raw = 0.50*intelligence_index + 0.20*gpqa + 0.15*hle + 0.15*ifbench`

字段：

- `aa_evaluations_artificial_analysis_intelligence_index`
- `aa_evaluations_gpqa`
- `aa_evaluations_hle`
- `aa_evaluations_ifbench`

## 6. Cost 计算（V1 默认）

当请求提供 token 假设时：

- `request_cost = (in_tokens/1e6)*price_input + (out_tokens/1e6)*price_output`

字段：

- `aa_pricing_price_1m_input_tokens`
- `aa_pricing_price_1m_output_tokens`

当 token 假设缺失时，回退：

- `aa_pricing_price_1m_blended_3_to_1`

## 7. 归一化（0-100）

- 默认使用候选集内 `P10-P90` 截断
- `higher_better`：值越大分越高
- `lower_better`：值越小分越高
- 若 `hi == lo`，该指标统一给 50 分并标记无区分度

## 8. 总分

默认加权和：

- `TotalScore = wq*Q + wc*C + wl*L + wt*T`

V1 暂不启用复杂惩罚项，仅保留缺失披露与置信度降级。

## 9. 模板权重（V1）

- `balanced`: `Q 0.45, C 0.25, L 0.15, T 0.15`
- `best_quality`: `Q 0.70, C 0.10, L 0.10, T 0.10`
- `best_value`: `Q 0.50, C 0.40, L 0.05, T 0.05`
- `cheapest`: `Q 0.20, C 0.70, L 0.05, T 0.05`
- `fastest`: `Q 0.10, C 0.05, L 0.60, T 0.25`

## 10. 缺失处理

- 核心字段缺失：模型直接不进入候选
- 非核心字段缺失：从该公式中移除该项并对剩余权重归一化
- 禁止将缺失值视为 0 分

## 11. 置信度（confidence）

- 取参与本次打分关键字段覆盖率 `coverage`
- `confidence = coverage`（简化版）
- 当用户偏好高度依赖某维度但该维度缺失时，额外下调 confidence

## 12. 排序输出

- 输出总分与分项分
- 保证同一快照、同一输入条件下排序稳定
- 返回 Top4（不足 4 返回实际数量）

## 13. 二级用途扩展约束

- 二级用途通过新增 `sub_scenario -> 公式/权重` 配置实现
- 主流程和接口结构不变
- 新增二级用途不得破坏现有一级模板排序行为
