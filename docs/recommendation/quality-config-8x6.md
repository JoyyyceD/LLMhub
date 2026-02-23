# Q 权重配置（8x6 初稿）

## 1. 适用范围

- 本文仅定义 `QualityScore (Q)` 的权重配置。
- 总分框架保持不变：`Total = wq*Q + wc*C + wl*L + wt*T`。
- 当前可用质量字段：
- `aa_evaluations_artificial_analysis_intelligence_index`（简称 `intelligence`）
- `aa_evaluations_artificial_analysis_coding_index`（简称 `coding`）
- `aa_evaluations_gpqa`（`gpqa`）
- `aa_evaluations_hle`（`hle`）
- `aa_evaluations_ifbench`（`ifbench`）
- `aa_evaluations_lcr`（`lcr`）
- `aa_evaluations_scicode`（`scicode`）
- `aa_evaluations_terminalbench_hard`（`terminalbench_hard`）
- `aa_evaluations_tau2`（`tau2`）

## 2. 配置原则

- 每个场景（默认或二级）给出一组 Q 权重，权重和为 1.0。
- 非该场景相关指标权重可为 0。
- 二级场景为一级默认的“偏移版”，避免模型复杂度爆炸。

## 3. 一级与二级权重表

## 3.1 通用对话

### 默认：日常问答

| metric | weight |
|---|---:|
| intelligence | 0.45 |
| gpqa | 0.20 |
| hle | 0.15 |
| ifbench | 0.15 |
| tau2 | 0.05 |

### 深度推理与决策

| metric | weight |
|---|---:|
| intelligence | 0.40 |
| gpqa | 0.25 |
| hle | 0.20 |
| tau2 | 0.10 |
| ifbench | 0.05 |

### 规划与拆解

| metric | weight |
|---|---:|
| intelligence | 0.40 |
| ifbench | 0.25 |
| tau2 | 0.20 |
| gpqa | 0.10 |
| hle | 0.05 |

### 信息抽取与结构化

| metric | weight |
|---|---:|
| ifbench | 0.35 |
| intelligence | 0.30 |
| tau2 | 0.20 |
| gpqa | 0.10 |
| hle | 0.05 |

### 学习辅导与纠错

| metric | weight |
|---|---:|
| intelligence | 0.45 |
| gpqa | 0.20 |
| hle | 0.20 |
| ifbench | 0.10 |
| tau2 | 0.05 |

### 对话模拟（面试/谈判/客服）

| metric | weight |
|---|---:|
| intelligence | 0.40 |
| ifbench | 0.30 |
| tau2 | 0.20 |
| gpqa | 0.05 |
| hle | 0.05 |

## 3.2 代码助手

### 默认：代码生成

| metric | weight |
|---|---:|
| coding | 0.50 |
| lcr | 0.20 |
| ifbench | 0.15 |
| intelligence | 0.10 |
| scicode | 0.05 |

### Bug 纠错

| metric | weight |
|---|---:|
| coding | 0.35 |
| lcr | 0.25 |
| ifbench | 0.20 |
| scicode | 0.15 |
| intelligence | 0.05 |

### 代码重构

| metric | weight |
|---|---:|
| coding | 0.40 |
| lcr | 0.30 |
| ifbench | 0.15 |
| intelligence | 0.10 |
| scicode | 0.05 |

### 代码解释/走读

| metric | weight |
|---|---:|
| intelligence | 0.35 |
| coding | 0.25 |
| ifbench | 0.20 |
| lcr | 0.15 |
| tau2 | 0.05 |

### SQL 查询与数据建模

| metric | weight |
|---|---:|
| coding | 0.30 |
| ifbench | 0.30 |
| intelligence | 0.20 |
| lcr | 0.10 |
| tau2 | 0.10 |

### 单元测试生成

| metric | weight |
|---|---:|
| ifbench | 0.30 |
| coding | 0.30 |
| lcr | 0.20 |
| intelligence | 0.10 |
| scicode | 0.10 |

## 3.3 科学推理

### 默认：科学问题解释与推断

| metric | weight |
|---|---:|
| gpqa | 0.30 |
| hle | 0.20 |
| scicode | 0.20 |
| tau2 | 0.15 |
| intelligence | 0.15 |

### 科研阅读与总结（论文/报告）

| metric | weight |
|---|---:|
| intelligence | 0.30 |
| gpqa | 0.25 |
| hle | 0.20 |
| scicode | 0.15 |
| tau2 | 0.10 |

### 实验设计与因果推断

| metric | weight |
|---|---:|
| gpqa | 0.30 |
| hle | 0.25 |
| tau2 | 0.20 |
| intelligence | 0.15 |
| ifbench | 0.10 |

### 数据分析与统计推理

| metric | weight |
|---|---:|
| gpqa | 0.25 |
| hle | 0.20 |
| intelligence | 0.20 |
| ifbench | 0.20 |
| tau2 | 0.15 |

### 工程估算与数量级推理

| metric | weight |
|---|---:|
| hle | 0.25 |
| gpqa | 0.25 |
| tau2 | 0.20 |
| intelligence | 0.20 |
| ifbench | 0.10 |

### 科学计算/公式推导

| metric | weight |
|---|---:|
| scicode | 0.30 |
| gpqa | 0.25 |
| hle | 0.20 |
| tau2 | 0.15 |
| intelligence | 0.10 |

## 3.4 文案创作

### 默认：营销/增长文案

| metric | weight |
|---|---:|
| intelligence | 0.55 |
| ifbench | 0.20 |
| gpqa | 0.10 |
| hle | 0.10 |
| tau2 | 0.05 |

### 品牌定位与口吻

| metric | weight |
|---|---:|
| intelligence | 0.55 |
| ifbench | 0.20 |
| tau2 | 0.15 |
| gpqa | 0.05 |
| hle | 0.05 |

### 社媒短内容

| metric | weight |
|---|---:|
| intelligence | 0.45 |
| ifbench | 0.30 |
| tau2 | 0.15 |
| gpqa | 0.05 |
| hle | 0.05 |

### 长文写作

| metric | weight |
|---|---:|
| intelligence | 0.50 |
| ifbench | 0.25 |
| gpqa | 0.10 |
| hle | 0.10 |
| tau2 | 0.05 |

### 改写润色

| metric | weight |
|---|---:|
| intelligence | 0.50 |
| ifbench | 0.30 |
| tau2 | 0.10 |
| gpqa | 0.05 |
| hle | 0.05 |

### 多版本 A/B

| metric | weight |
|---|---:|
| intelligence | 0.45 |
| ifbench | 0.30 |
| tau2 | 0.15 |
| gpqa | 0.05 |
| hle | 0.05 |

## 3.5 长文档 RAG

### 默认：文档问答（基于材料）

| metric | weight |
|---|---:|
| intelligence | 0.40 |
| ifbench | 0.25 |
| gpqa | 0.15 |
| hle | 0.10 |
| tau2 | 0.10 |

### 长文总结

| metric | weight |
|---|---:|
| intelligence | 0.45 |
| ifbench | 0.25 |
| gpqa | 0.15 |
| hle | 0.10 |
| tau2 | 0.05 |

### 信息抽取

| metric | weight |
|---|---:|
| ifbench | 0.35 |
| intelligence | 0.30 |
| tau2 | 0.20 |
| gpqa | 0.10 |
| hle | 0.05 |

### 跨文档对比

| metric | weight |
|---|---:|
| intelligence | 0.40 |
| gpqa | 0.20 |
| ifbench | 0.20 |
| hle | 0.10 |
| tau2 | 0.10 |

### 证据引用与可追溯

| metric | weight |
|---|---:|
| ifbench | 0.35 |
| intelligence | 0.30 |
| tau2 | 0.20 |
| gpqa | 0.10 |
| hle | 0.05 |

### 低幻觉模式

| metric | weight |
|---|---:|
| hle | 0.25 |
| gpqa | 0.25 |
| intelligence | 0.25 |
| ifbench | 0.15 |
| tau2 | 0.10 |

## 3.6 智能体 Agent

### 默认：任务执行（Plan -> Tool -> Result）

| metric | weight |
|---|---:|
| ifbench | 0.30 |
| terminalbench_hard | 0.25 |
| tau2 | 0.20 |
| intelligence | 0.15 |
| scicode | 0.10 |

### 工具调用/函数调用

| metric | weight |
|---|---:|
| ifbench | 0.40 |
| terminalbench_hard | 0.25 |
| tau2 | 0.20 |
| intelligence | 0.10 |
| scicode | 0.05 |

### 工作流编排

| metric | weight |
|---|---:|
| ifbench | 0.30 |
| tau2 | 0.25 |
| terminalbench_hard | 0.20 |
| intelligence | 0.15 |
| scicode | 0.10 |

### 多智能体协作

| metric | weight |
|---|---:|
| tau2 | 0.30 |
| ifbench | 0.25 |
| intelligence | 0.20 |
| terminalbench_hard | 0.15 |
| gpqa | 0.10 |

### 记忆与偏好

| metric | weight |
|---|---:|
| ifbench | 0.30 |
| intelligence | 0.30 |
| tau2 | 0.20 |
| terminalbench_hard | 0.15 |
| gpqa | 0.05 |

### 安全与权限

| metric | weight |
|---|---:|
| terminalbench_hard | 0.35 |
| ifbench | 0.25 |
| tau2 | 0.20 |
| intelligence | 0.10 |
| gpqa | 0.10 |

## 3.7 多模态

说明：当前数据集中缺少视觉专项基准，先用可用指标做代理。

### 默认：图像理解（看图问答）

| metric | weight |
|---|---:|
| intelligence | 0.45 |
| ifbench | 0.25 |
| gpqa | 0.15 |
| hle | 0.10 |
| tau2 | 0.05 |

### OCR/表单抽取

| metric | weight |
|---|---:|
| ifbench | 0.35 |
| intelligence | 0.30 |
| tau2 | 0.20 |
| gpqa | 0.10 |
| hle | 0.05 |

### 图表理解

| metric | weight |
|---|---:|
| intelligence | 0.35 |
| gpqa | 0.20 |
| ifbench | 0.20 |
| hle | 0.15 |
| tau2 | 0.10 |

### UI/截图诊断

| metric | weight |
|---|---:|
| ifbench | 0.30 |
| intelligence | 0.30 |
| terminalbench_hard | 0.20 |
| tau2 | 0.15 |
| gpqa | 0.05 |

### 视觉推理

| metric | weight |
|---|---:|
| gpqa | 0.25 |
| hle | 0.20 |
| intelligence | 0.25 |
| ifbench | 0.20 |
| tau2 | 0.10 |

### 图文混合材料问答

| metric | weight |
|---|---:|
| intelligence | 0.35 |
| ifbench | 0.25 |
| gpqa | 0.20 |
| hle | 0.10 |
| tau2 | 0.10 |

## 3.8 翻译

### 默认：通用翻译

| metric | weight |
|---|---:|
| intelligence | 0.50 |
| ifbench | 0.25 |
| gpqa | 0.10 |
| hle | 0.10 |
| tau2 | 0.05 |

### 专业领域翻译

| metric | weight |
|---|---:|
| intelligence | 0.40 |
| gpqa | 0.20 |
| hle | 0.20 |
| ifbench | 0.15 |
| tau2 | 0.05 |

### 本地化

| metric | weight |
|---|---:|
| intelligence | 0.50 |
| ifbench | 0.25 |
| tau2 | 0.15 |
| gpqa | 0.05 |
| hle | 0.05 |

### 术语一致性

| metric | weight |
|---|---:|
| ifbench | 0.35 |
| intelligence | 0.30 |
| tau2 | 0.20 |
| gpqa | 0.10 |
| hle | 0.05 |

### 校对润色

| metric | weight |
|---|---:|
| intelligence | 0.45 |
| ifbench | 0.30 |
| gpqa | 0.10 |
| hle | 0.10 |
| tau2 | 0.05 |

### 低延迟短句

| metric | weight |
|---|---:|
| intelligence | 0.45 |
| ifbench | 0.25 |
| tau2 | 0.20 |
| gpqa | 0.05 |
| hle | 0.05 |

## 4. 缺失值与稳健性规则（Q 专项）

- 缺失指标不计 0 分。
- 对于缺失指标，移除其权重并对剩余权重重归一化：
- `Q = sum(w_i * metric_i) / sum(w_i_available)`
- 若某场景可用质量权重和 `< 0.60`，在输出中标记 `low_quality_evidence`。
- `Q_confidence`（简化版）：
- `Q_confidence = sum(w_i_available)`

## 5. 归一化规则（Q 专项）

- 每个质量指标先在候选集内做 `P10-P90` 截断。
- 截断后线性映射到 0-100。
- `hi == lo` 时该指标固定 50 分并记录 `no_variance` 标记。
