---
name: model-selection-advisor
description: Constraint-driven LLM/model selection advisor that ranks candidates with explicit tradeoffs across quality, cost, latency, reliability, and integration fit. Trigger when a user asks to choose a model, reduce model spend, meet latency/SLA targets, compare model candidates, define routing strategy, or create an evaluation/bake-off plan.
---

# Model Selection Advisor

Run a consistent model-selection workflow. Prefer explicit assumptions over hidden judgment.

## One-Line Positioning

Use this skill as a decision layer for model selection. It is not a multi-provider execution gateway.

## Trigger Phrases

Trigger this skill when user asks things like:
- "帮我选模型"
- "在预算内选最优模型"
- "要低延迟又要质量，怎么选"
- "给我多模型路由建议"
- "做一个模型对比和 A/B 计划"

## Workflow

1. Capture scenario inputs.
2. Build candidate set and exclude obviously unfit models.
3. Score candidates by weighted dimensions.
4. Return top recommendations with risks and experiment plan.

If inputs are missing, ask concise clarifying questions. If user declines, continue with stated assumptions.

## Step 1: Capture Inputs

Load `references/intake-checklist.md` and collect:
- Task type and success criteria
- Input/output length and context needs
- Latency target (p95) and throughput (QPS/concurrency)
- Budget constraints and cost sensitivity
- Safety/compliance constraints and failure tolerance
- Tool-calling, structured output, or multimodal requirements

## Step 2: Build Candidate Set

Start from models user already uses or considers. Add alternatives only when they solve a specific gap.

Exclude models that fail hard constraints:
- Context window too small
- Missing required modalities or tool-calling
- Cannot meet latency or budget envelope
- Does not satisfy policy/compliance constraints

## Step 3: Score Candidates

Use a weighted score with these dimensions:
- `quality`
- `cost`
- `latency`
- `reliability`
- `integration_fit`

Default weights when user gives no priorities:
- quality: 0.35
- cost: 0.20
- latency: 0.20
- reliability: 0.15
- integration_fit: 0.10

When priorities are explicit, adjust weights and show them in output.

Use script `scripts/score_models.py` when a deterministic ranking is needed from structured inputs.
Use script `scripts/recommend_models.py` when hard constraints and automatic cost/latency normalization are required.

## Step 4: Produce Recommendation

Load `references/output-template.md` and respond in that structure.

Always include:
- Top 3 candidates (or fewer if constraints are strict)
- Why each candidate fits
- Main risks and failure modes
- Conservative option and aggressive option
- A/B evaluation plan with acceptance thresholds

Never claim certainty. State assumptions and unknowns clearly.

## Output Contract (Always)

Return all of the following sections:
- `scenario_summary`
- `weights`
- `candidate_ranking`
- `conservative_option`
- `aggressive_option`
- `experiment_plan`
- `open_questions`
- `assumptions`

If critical inputs are missing, mark confidence as low and highlight decision-impacting unknowns.

## Programmatic Integration

When user asks for API readiness or developer onboarding:

1. Load `references/api-contract.md` for request/response schema.
2. Load `references/integration-snippets.md` for TS/Python usage snippets.
3. Use `scripts/recommend_models.py` as local engine for deterministic JSON output.

If external provider metrics are missing, return recommendation with `assumptions` and set confidence lower.

## Escalation Rules

- If critical constraints are unknown, ask up to 5 targeted questions.
- If provider/model metadata is stale or unknown, say this and request updated inputs.
- If tradeoffs are close, recommend a short bake-off instead of a single winner.
