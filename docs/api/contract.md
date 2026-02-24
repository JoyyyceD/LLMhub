# API 契约（V1）

## 1. 通用约定

- Base Path：`/api`
- 数据格式：`application/json`
- 时间格式：ISO 8601
- 鉴权方式：Bearer Token（评分/评论写操作必需）

## 2. 推荐接口

### 2.1 `POST /api/recommendations` 或 `POST /v1/model-recommendation`

用途：根据用户偏好返回推荐结果（最多 4 条，可不足 4）。

请求体（`candidates` 可选；不传则服务端从 Supabase `model_snapshots` 自动加载）：

```json
{
  "scenario": "coding_assistant",
  "region_preference": "cn_mainland",
  "budget_preference": "balanced",
  "speed_preference": "high_throughput",
  "advanced_filters": {
    "input_types": ["pdf", "image"],
    "min_context_tokens": 128000,
    "task_tags": ["code_generation", "bug_fix"]
  },
  "assumptions": {
    "expected_input_tokens": 1200,
    "expected_output_tokens": 800
  },
  "top_k": 4
}
```

响应体：

```json
{
  "snapshot_date": "2026-02-22",
  "total_candidates": 146,
  "returned_count": 4,
  "filters_applied": {
    "source_filter": "has_aa=true AND has_or=true",
    "strict_core_fields": true
  },
  "items": [
    {
      "rank": 1,
      "model_id": "deepseek-coder-v2",
      "model_name": "DeepSeek-Coder-V2",
      "metrics": {
        "price_input_per_1m_usd": 1.0,
        "price_output_per_1m_usd": 2.0,
        "fx_usd_cny": 7.2,
        "price_input_per_1m_cny": 7.2,
        "price_output_per_1m_cny": 14.4,
        "ttft_seconds": 0.12,
        "tps": 120.0
      },
      "scores": {
        "total_score": 91.2,
        "quality_score": 90.5,
        "cost_score": 88.3,
        "latency_score": 93.1,
        "throughput_score": 85.7
      },
      "explanations": [
        "代码质量位于候选前10%",
        "在当前预算偏好下成本表现位于前20%",
        "在高吞吐偏好下综合总分领先"
      ],
      "tradeoffs": [
        "推理综合能力不是最优，适合代码场景优先"
      ],
      "missing_data_flags": [],
      "confidence": 0.93
    }
  ],
  "fx": {
    "base": "USD",
    "quote": "CNY",
    "provider": "open.er-api.com",
    "fx_usd_cny": 7.2,
    "fx_last_update_utc": "2026-02-22T00:02:31Z",
    "fx_stale": false
  }
}
```

地区过滤语义（V1）：

- `cn_mainland`：剔除海外模型集合，仅保留中国大陆可用模型
- `overseas`：保留海外模型集合
- `no_preference`：不过滤

补充：

- 非中国大陆厂商统一归为海外
- 未识别厂商默认归为海外

隐私字段语义（V1）：

- 不接收隐私合规筛选参数
- 隐私能力仅作为展示标签（如前端需要）

返回语义：

- `returned_count` 可能小于 `top_k`
- `items` 允许为空（所有候选被过滤或无可用数据）

### 2.2 推荐错误码

- `400`：入参不合法（枚举、范围、类型）
- `422`：参数合法但语义冲突（如无效组合条件）
- `500`：推荐服务内部错误

## 3. 社区评分帖接口

### 3.1 `POST /api/models/{model_id}/review-post`

用途：创建或更新“模型评分帖”。

请求体：

```json
{
  "rating_overall": 5,
  "rating_quality": 5,
  "rating_price": 4,
  "rating_latency": 5,
  "rating_throughput": 4,
  "rating_stability": 4,
  "provider_name": "DeepSeek",
  "pros": "低延迟，代码补全很顺滑",
  "cons": "复杂推理场景一般",
  "comment": "日常开发够用，性价比高"
}
```

响应体：

```json
{
  "post_id": "post_123",
  "model_id": "deepseek-coder-v2",
  "rating_overall": 5,
  "updated": true
}
```

语义：

- 首次提交：创建评分帖
- 同用户同模型重复提交：更新原帖（覆盖式）

错误码：

- `400`：总评分不在 1..5 或字段类型错误
- `400`：`provider_name` 不在枚举中
- `400`：`pros/cons/comment` 超过长度限制
- `401`：未登录
- `404`：模型不存在
- `500`：服务错误

`provider_name` 枚举来源：

- `docs/data/provider-enum.md`

### 3.2 `GET /api/models/{model_id}/rating-summary`

响应体：

```json
{
  "model_id": "deepseek-coder-v2",
  "rating_count": 12,
  "rating_avg": 4.42,
  "show_public_rating": true
}
```

规则：

- `show_public_rating = rating_count >= 10`
- 若 `show_public_rating = false`，前端不展示 `rating_avg`

### 3.3 `GET /api/models/{model_id}/review-posts`

Query 参数：

- `page`（默认 1）
- `page_size`（默认 20，最大 50）

响应体（示意）：

```json
{
  "model_id": "deepseek-coder-v2",
  "page": 1,
  "page_size": 20,
  "total": 12,
  "items": [
    {
      "post_id": "post_123",
      "user_id": "usr_001",
      "rating_overall": 5,
      "rating_quality": 5,
      "rating_price": 4,
      "rating_latency": 5,
      "rating_throughput": 4,
      "rating_stability": 4,
      "provider_name": "DeepSeek",
      "pros": "低延迟，代码补全很顺滑",
      "cons": "复杂推理场景一般",
      "comment": "日常开发够用，性价比高",
      "up_count": 8,
      "down_count": 1,
      "reply_count": 3,
      "created_at": "2026-02-22T09:30:00Z",
      "updated_at": "2026-02-22T10:01:00Z"
    }
  ]
}
```

排序规则：

- 默认按 `updated_at desc`

## 4. 回复与点赞/踩接口

### 4.1 `POST /api/review-posts/{post_id}/replies`

用途：回复某条评分帖（V1 发布即展示）。

请求体：

```json
{
  "content": "我也有同感，尤其是延迟表现。"
}
```

响应体：

```json
{
  "id": "reply_123",
  "post_id": "post_123",
  "content": "我也有同感，尤其是延迟表现。",
  "created_at": "2026-02-22T09:30:00Z"
}
```

错误码：

- `400`：回复为空或超长（`reply.content <= 300`）
- `401`：未登录
- `404`：帖子不存在
- `500`：服务错误

### 4.2 `GET /api/review-posts/{post_id}/replies`

Query 参数：

- `page`（默认 1）
- `page_size`（默认 20，最大 50）

响应体：

```json
{
  "post_id": "post_123",
  "page": 1,
  "page_size": 20,
  "total": 3,
  "items": [
    {
      "id": "reply_123",
      "user_id": "usr_001",
      "content": "我也有同感，尤其是延迟表现。",
      "created_at": "2026-02-22T09:30:00Z"
    }
  ]
}
```

排序规则：

- 按 `created_at asc` 返回

### 4.3 `POST /api/review-posts/{post_id}/reaction`

用途：对某条评分帖点赞或踩。

请求体：

```json
{
  "reaction": "up"
}
```

说明：

- `reaction` 取值：`up` 或 `down`
- 同用户对同帖子重复提交时覆盖更新（可切换）

## 5. 幂等与并发说明

- 推荐接口为无状态查询，不要求幂等键
- 评分帖接口按 `(user_id, model_id)` 唯一约束保证幂等更新语义
- 回复接口为追加写，客户端可选传 `client_request_id` 做去重
- 点赞/踩按 `(post_id, user_id)` 唯一约束保证单态度语义
