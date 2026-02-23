# 多模态扩展规范（待补数据）

## 1. 目标

- 在现有 8x6 架构下，为多模态场景引入 AA 的视觉专项指标。
- 当前先保留代理指标方案，待你补充字段后切换为正式公式。

## 2. 当前状态（V1）

- 多模态场景暂使用通用质量代理指标（intelligence/ifbench/gpqa/hle/tau2）。
- 推荐结果中应标注“多模态专项指标待补”。

## 3. 待补字段（你后续提供）

请补充以下信息：

- 字段名（CSV/AA 实际列名）
- 字段含义（例如 OCR、视觉推理、图表理解等）
- 指标方向（higher_better / lower_better）
- 取值范围（0-100 或其他）
- 缺失覆盖率（可选）

## 4. 计划落地

补齐字段后更新：

1. `docs/recommendation/quality-config-8x6.md` 中多模态分组权重
2. `docs/recommendation/scoring-policy.md` 的多模态质量公式
3. `docs/data/data-dictionary.md` 的字段字典

## 5. 验收标准（多模态）

- 多模态默认场景不再依赖代理指标
- 至少有 3 个视觉专项指标参与 Q 计算
- 缺失时按统一缺失策略处理（重分配 + 置信度下降）
