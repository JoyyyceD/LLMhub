# 模型推荐 API 快速上手

适用人群：想在 5 分钟内把模型选型能力接进产品或 Agent 的开发者。

## 30 秒理解这个 API

- 输入：任务场景约束（预算、延迟、上下文、能力需求）
- 输出：结构化 Top-K 模型推荐（含拒绝原因、风险与假设）
- 接口：`POST /v1/model-recommendation`
- 兼容路径：`POST /api/recommendations`

## 1. 部署前准备

在服务端配置环境变量：

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`（推荐）或 `SUPABASE_ANON_KEY`

说明：
- `SUPABASE_SERVICE_ROLE_KEY` 只能放服务端，禁止放前端构建变量（如 `VITE_*`）。

## 2. 最小请求（推荐）

不传 `candidates`，服务端会自动从 Supabase `model_snapshots` 加载候选模型。

```bash
curl -X POST "https://YOUR_DOMAIN/v1/model-recommendation" \
  -H "Content-Type: application/json" \
  -d '{
    "scenario": {
      "task_type": "rag_qa",
      "context_window_min_tokens": 64000,
      "p95_latency_ms_target": 2000,
      "max_cost_per_1k_tokens_usd": 0.02,
      "must_support_tools": true,
      "must_support_json_schema": true
    },
    "weights": {
      "quality": 35,
      "cost": 25,
      "latency": 20,
      "reliability": 10,
      "integration_fit": 10
    }
  }'
```

## 3. 响应关键字段

- `ranking`: 推荐结果（按加权分降序）
- `rejected`: 被硬约束淘汰的模型与原因
- `assumptions`: 推断前提（用于审计与复盘）
- `source`: 数据来源与快照信息

## 4. 常见错误

- `400 invalid_payload`：请求结构不合法或缺少关键参数
- `422 no_feasible_candidates`：约束过严，无可行模型
- `405 method_not_allowed`：接口只接受 `POST`

## 5. 生产接入建议

- 为每次推荐写入请求和结果日志，便于回放与评估。
- 对相同场景做短期缓存（例如 5-30 分钟），降低查询压力。
- 在线上灰度期固定权重，避免频繁变更导致策略抖动。
- 将接口版本固定为 `v1`，字段变更走新增字段而非破坏性替换。
