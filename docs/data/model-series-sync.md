# Model Series 同步说明

## 目标

- `LLM` 继续使用历史稳定规则生成 `series_name`（与既有 `series_preview.csv` 保持一致）。
- 非 `LLM`（多模态）使用新增规则统一系列命名（如 `Flux 1/2`、`Step1X Edit` 等）。
- 将 `model_snapshots.series_id` 与 `model_series` 持续对齐。

## 脚本

- 主脚本：`scripts/sync_model_series_all_modalities.py`
- 审计文件：`Comment/model_series_mapping_sync_audit.csv`

## 环境变量

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 运行方式

1. 仅审计（不写库）：
```bash
python3 scripts/sync_model_series_all_modalities.py --dry-run
```

2. 正式同步（写库）：
```bash
python3 scripts/sync_model_series_all_modalities.py
```

## 输出解读

- `rows requiring series_id update`：需要更新 `series_id` 的行数（仅统计变更行）。
- `Updated by modality`：按模态统计实际更新量。
- 审计 CSV 字段：
- `current_series_id`：同步前值
- `target_series_id`：规则计算后的目标值
- `needs_update`：是否需要更新

## 与 pipeline 集成

`scripts/pipeline.py` 提供可选后置执行开关，默认关闭：

- `RUN_MODEL_SERIES_SYNC=1`：在主 pipeline 完成后执行系列同步
- `RUN_MODEL_SERIES_SYNC_DRY_RUN=1`：以 dry-run 模式执行

示例：
```bash
RUN_MODEL_SERIES_SYNC=1 RUN_MODEL_SERIES_SYNC_DRY_RUN=1 python3 scripts/pipeline.py
```
