# 平台架构（V1）

## 1. 架构目标

- 面向 C 端用户提供模型推荐、评分、评论能力
- 保证每日数据自动更新并可稳定对外服务
- 前后端解耦，后续可扩展到多供应商端点推荐

## 2. 分层架构

### 2.1 Client Layer

- Web 前端
- 页面：推荐页、模型详情页、评论区、登录入口

### 2.2 API Gateway / BFF Layer

- 统一前端接口入口
- 聚合推荐结果、模型信息、社区聚合数据
- 参数校验与鉴权透传

### 2.3 Domain Services

- Recommendation Service：过滤、打分、解释、Top4 输出
- Model Catalog Service：模型基础信息与标签查询
- Community Service：评分/评论写入与聚合展示
- Auth Service：登录与用户身份校验

### 2.4 Data Pipeline Layer

- Ingestion Job：每天抓取 AA + OR
- Merge/Validation Job：数据合并与字段校验
- Publish Job：发布可用快照供在线推荐读取

### 2.5 Storage Layer

- Operational DB：在线查询与社区数据
- Object Storage：原始抓取与快照归档（可选）

### 2.6 Observability Layer

- 任务成功率、候选规模、接口耗时、错误率监控
- 异常告警（抓取失败、候选骤降、服务错误率升高）

## 3. 核心数据流

1. 每天北京时间 08:00 启动抓取任务
2. 拉取 AA 与 OR 数据并合并
3. 过滤 `has_aa = true AND has_or = true`
4. 对核心字段做严格校验，缺失则跳过该模型
5. 发布 `latest` 快照
6. 用户请求推荐时读取 `latest` 快照，返回 Top4（允许不足 4）
7. 用户评分评论写入社区库，评分数达到 10 才展示公开均分

## 4. V1 关键边界

- 推荐粒度为模型版本，不做 provider endpoint 粒度
- 隐私合规仅展示标签，不做硬过滤
- 社区评分不进入推荐打分模型

## 5. 部署建议（V1）

- 前端与 BFF：Vercel
- 数据库与鉴权：Supabase
- 定时任务：GitHub Actions（北京时间 08:00）

## 6. 演进方向（V1.5+）

- 多供应商端点级推荐（`model x provider endpoint`）
- 社区信号轻量纳入排序
- 预计算或缓存层提升大规模性能
