# 前端对接规范（V1）

## 1. 页面范围

- 推荐页
- 模型详情页
- 社区页（评分帖入口与列表）
- 评分帖回复区

## 2. 推荐页输入枚举

### 2.1 主场景（`scenario`）

- `general_chat`
- `coding_assistant`
- `math_reasoning`
- `copywriting`
- `long_context_rag`
- `agent`
- `multimodal`
- `translation`

### 2.2 地区偏好（`region_preference`）

- `cn_mainland`
- `overseas`
- `no_preference`

地区映射规则（V1）：

- `overseas`：保留海外模型集合
- `cn_mainland`：剔除海外模型集合，仅保留中国大陆可用模型
- `no_preference`：不过滤

补充：

- 非中国大陆厂商统一归为海外
- 未识别厂商默认归海外

### 2.3 预算偏好（`budget_preference`）

- `cost_first`
- `balanced`
- `quality_first`

### 2.4 速度偏好（`speed_preference`）

- `low_latency`
- `high_throughput`
- `balanced`

## 3. 推荐结果字段

每个卡片至少展示：

- `model_id`（aa_slug）
- `model_name`（aa_name）
- `price_input_per_1m`
- `price_output_per_1m`
- `ttft_seconds`
- `tps`
- `total_score`
- `explanations`（至少 3 条）
- `tradeoffs`（至少 1 条）
- `confidence`

价格展示规则：

- 前端统一展示 `CNY`
- 后端返回原始价格字段时建议同时提供：
- `price_input_per_1m_usd`
- `price_output_per_1m_usd`
- `fx_usd_cny`
- `price_input_per_1m_cny`
- `price_output_per_1m_cny`

V1 可先使用固定汇率或当日汇率快照，后续再做本地化增强。

## 4. 列表规则

- 默认请求 `top_k = 4`
- 实际返回可能 `< 4`，前端必须兼容
- 不得自行补齐占位“伪推荐”

## 5. 边界态与提示文案

- `0 条结果`：提示用户放宽条件
- `1-3 条结果`：提示“当前满足条件模型较少”
- `未登录`：可浏览推荐，不显示评分输入控件
- `评分<10`：显示“评分样本不足，暂不展示均分”

## 6. 评分评论交互

- 发帖入口：
- 模型详情页直接发帖
- 社区页发帖需先选模型（下拉）
- 评分帖字段：
- 必填总评分（1-5）
- 可选维度评分（中文）：质量、价格、延迟、吞吐、稳定性
- 可选服务商（枚举）、优点、缺点、评论
- 同用户同模型重复提交时走“更新帖子”语义
- 支持对帖子回复
- 支持对帖子点赞/踩（单用户单帖单态度）
- 评分帖列表默认按 `updated_at desc`
- 支持按模型筛选评分帖

## 7. 前端校验建议

- 评分值仅允许 `1..5`
- 服务商 `provider_name` 必须为枚举值（见 `docs/data/provider-enum.md`）
- 评论正文 `comment` 长度上限：`800`
- 优点 `pros` 长度上限：`200`
- 缺点 `cons` 长度上限：`200`
- 回复 `reply.content` 长度上限：`300`
- 请求失败时按错误码显示明确提示
- 维度评分若填写，也必须在 `1..5`

## 8. V1 暂不启用项

- 隐私合规筛选开关（仅可展示标签，不入筛选）
