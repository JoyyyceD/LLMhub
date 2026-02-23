# LLMArena 文档总览

本目录用于沉淀 LLMArena V1 的产品、平台、数据、推荐、社区与运维规范。

## 目录

- `docs/platform/architecture.md`：整个平台架构与数据流
- `docs/product/overview.md`：产品目标、范围与非目标
- `docs/product/user-flows.md`：用户流程与关键交互
- `docs/product/frontend-handoff.md`：前端对接规范（字段与边界态）
- `docs/data/sources.md`：数据源说明（AA + OR）
- `docs/data/schema.md`：字段映射与核心字段定义
- `docs/data/data-dictionary.md`：字段字典（类型、单位、缺失策略）
- `docs/data/fx-rate-policy.md`：汇率快照策略（USD->CNY）
- `docs/data/provider-enum.md`：服务商枚举单一来源
- `docs/data/pipeline.md`：每日更新与增量策略
- `docs/recommendation/requirements.md`：推荐功能需求（Top4）
- `docs/recommendation/use-case-taxonomy.md`：8x6 场景信息架构
- `docs/recommendation/quality-config-8x6.md`：8x6 的 Q 权重配置初稿
- `docs/recommendation/multimodal-extension.md`：多模态专项指标扩展（待补）
- `docs/recommendation/calculation-method.md`：推荐计算方法（详细版）
- `docs/recommendation/scoring-policy.md`：评分与排序策略
- `docs/recommendation/explainability.md`：推荐解释规则
- `docs/community/ratings-comments.md`：社区评分帖与互动机制
- `docs/community/data-model.md`：评分评论数据模型与约束
- `docs/api/contract.md`：API 契约（示例与错误语义）
- `docs/ops/acceptance.md`：验收与运维指标

## 当前版本范围

- 推荐粒度：模型版本（`aa_slug`）
- 数据源：Artificial Analysis + OpenRouter 合并数据
- 每日更新：北京时间 08:00
- 社区能力：登录后发布评分帖、回复与点赞/踩（非论坛）
