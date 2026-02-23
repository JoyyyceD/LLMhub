# 服务商枚举（V1）

## 1. 说明

- 本文档是 `provider_name` 的单一来源（Single Source of Truth）。
- 社区评分帖、API 校验、前端下拉选项统一引用本枚举。

## 2. 枚举列表

- `OpenAI`
- `Anthropic`
- `Google`
- `Cohere`
- `DeepSeek`
- `Qwen`
- `Meta`
- `Mistral`
- `xAI`
- `Moonshot`
- `Zhipu`
- `MiniMax`
- `ByteDance`
- `Tencent`
- `Baidu`
- `01AI`
- `Other`

## 3. 规则

- 前端输入与后端校验均使用严格枚举匹配（区分大小写）。
- 当用户填写的服务商无法映射到枚举时，使用 `Other`。

## 4. 变更管理

- 增删枚举项时，必须同步：
- `docs/api/contract.md`
- `docs/community/data-model.md`
- `docs/product/frontend-handoff.md`
