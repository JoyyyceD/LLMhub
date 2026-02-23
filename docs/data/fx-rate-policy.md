# 汇率快照策略（V1）

## 1. 目标

- 每天与模型数据任务一起获取一次汇率快照
- 统一价格展示为 CNY
- 保留 USD 原值用于计算与审计

## 2. 数据源（默认）

- 默认 API：`https://open.er-api.com/v6/latest/USD`
- 读取字段：
- `rates.CNY`
- `time_last_update_utc`
- `time_next_update_utc`
- `provider`

说明：

- 该端点每日更新，适合当前“每日 08:00”批处理
- 响应中包含下次更新时间，可用于任务校验

## 3. 快照写入字段

建议写入以下字段到当日快照元信息：

- `fx_base`: `USD`
- `fx_quote`: `CNY`
- `fx_usd_cny`: number
- `fx_provider`: string
- `fx_last_update_utc`: string
- `fx_snapshot_time_utc`: string

## 4. 计算与展示口径

- 计算基准：USD
- 展示货币：CNY
- 换算公式：
- `price_input_per_1m_cny = price_input_per_1m_usd * fx_usd_cny`
- `price_output_per_1m_cny = price_output_per_1m_usd * fx_usd_cny`

## 5. 失败回退

当日汇率请求失败时：

1. 优先使用前一天汇率快照
2. 若前一天不可用，则使用最近一次有效汇率快照
3. 标记 `fx_stale = true`
4. 运维告警但不中断推荐服务

## 6. 合规与注意事项

- 若使用 open endpoint，遵循其使用条款与归因要求
- 如后续需要更高频更新，可切换有 key 的付费/免费计划端点
