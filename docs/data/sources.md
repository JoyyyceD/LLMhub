# 数据源说明（V1）

## 1. 主数据源

- Artificial Analysis（AA）
- OpenRouter（OR）

当前推荐系统使用二者合并后的产物作为输入快照。

## 2. 参考抓取脚本

- `fetch_model_data_v4.py`

该脚本完成以下流程：

1. 拉取 AA 多个 endpoint 数据
2. 拉取 OR `models` 数据
3. 进行别名与核心名匹配
4. 合并输出到单表

## 3. 当前快照文件

- `comprehensive_merged_data_v3.csv`

文件包含：

- 合并主键与匹配信息（`merge_key`, `match_confidence`）
- 来源标记（`has_aa`, `has_or`）
- AA 维度字段（评测、价格、性能等）
- OR 维度字段（元信息、定价、上下文等）

## 4. 候选池定义（V1）

在线推荐仅使用：

- `has_aa = true AND has_or = true`

该规则用于保证模型在 AA 与 OR 两侧均可对齐。
