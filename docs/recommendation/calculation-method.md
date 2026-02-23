# 推荐计算方法（V1 详细）

## 1. 目标

本文定义推荐引擎在 V1 的计算细节，确保：

- 可复现（同输入同快照输出一致）
- 可解释（规则化理由）
- 可扩展（后续支持二级用途）

## 2. 输入与前置条件

### 2.1 快照输入

- 来源：AA + OR 合并快照
- 候选前置：`has_aa = true AND has_or = true`
- 推荐主键：`aa_slug`

### 2.2 用户输入

- `use_case`（一级用途）
- `sub_scenario`（二级用途，可选）
- `priority_profile`
- 偏好条件与高级筛选
- 可选 token 假设（输入/输出 token）

## 3. 计算步骤

1. 过滤候选集（硬过滤）
2. 计算四维原始值
3. 分位数归一化（0-100）
4. 加权求总分
5. 生成解释、tradeoff、缺失标记、confidence
6. 排序并返回 Top4（可不足 4）

## 4. 硬过滤规则

- 仅保留 `has_aa && has_or`
- 核心字段缺失直接剔除
- 业务筛选条件不满足则剔除（如地区/预算偏好映射出的约束）

## 5. 四维原始值

### 5.1 Quality

按 use_case 选择公式：

- coding: `0.55*coding + 0.25*lcr + 0.10*ifbench + 0.10*intelligence`
- science_reasoning: `0.45*intelligence + 0.20*gpqa + 0.15*hle + 0.20*scicode`
- general_reasoning: `0.50*intelligence + 0.20*gpqa + 0.15*hle + 0.15*ifbench`

缺失处理：

- 公式内缺失项移除
- 剩余项权重重归一化

### 5.2 Cost

- 优先：`request_cost = (in/1e6)*price_in + (out/1e6)*price_out`
- 回退：`blended_price_3_to_1`
- 方向：越低越好

### 5.3 Latency

- 使用 TTFT（`aa_median_time_to_first_token_seconds`）
- 方向：越低越好

### 5.4 Throughput

- 使用 TPS（`aa_median_output_tokens_per_second`）
- 方向：越高越好

## 6. 归一化

- 默认使用 `P10-P90` 对每个指标做 clamp
- 在截断区间内线性映射到 0-100
- `higher_better` 与 `lower_better` 分开处理
- 若区间无方差（`hi == lo`），统一返回 50

## 7. 总分

- `Total = wq*Q + wc*C + wl*L + wt*T`
- 默认权重来自 profile，可被用户输入覆盖
- V1 不启用复杂 penalty

## 8. 置信度

- 按关键字段覆盖率计算：`confidence = coverage`（简化版）
- 若高权重维度缺失，可额外下调

## 9. 解释生成

- 每项至少 3 条 `explanations`
- 每项至少 1 条 `tradeoffs`
- `missing_data_flags` 必须显式输出
- 使用阈值规则，不依赖自由生成

## 10. 稳定性与可复现

- 同快照 + 同输入 = 同排序与同分数
- 返回结果应可回溯到快照日期与生效策略

## 11. 二级用途扩展设计

- 增加 `sub_scenario` 配置映射到：
  - 质量公式
  - 默认权重
  - 解释模板
- 不改变主计算流程与 API 主结构
