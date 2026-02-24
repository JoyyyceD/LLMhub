---
name: model-selection-advisor
description: Constraint-driven model selection advisor. Use when users ask to choose models, optimize cost, meet latency targets, compare candidates, or prepare an evaluation plan.
---

# Model Selection Advisor (Template)

## Workflow

1. Capture constraints
2. Filter infeasible models
3. Score feasible candidates
4. Return ranked recommendation and validation plan

## Required output sections

- scenario_summary
- weights
- candidate_ranking
- conservative_option
- aggressive_option
- experiment_plan
- assumptions

## Trigger examples

- "帮我选模型"
- "给我在预算内的最优方案"
- "低延迟场景推荐哪些模型"
- "做一个模型评测计划"
