# Intake Checklist

Use this checklist to gather minimum viable inputs before recommending models.

## Required

1. What is the primary task?
2. What is the definition of success?
3. What are latency and throughput targets?
4. What is the budget constraint?
5. Are there must-have capabilities?

## Task Types

- Chat assistant
- RAG Q&A
- Tool-calling agent
- Code generation
- Classification/extraction
- Summarization
- Translation
- Multimodal (text + image/audio/video)

## Constraint Fields

- `context_window_min_tokens`
- `input_tokens_p50`
- `input_tokens_p95`
- `output_tokens_p50`
- `output_tokens_p95`
- `p95_latency_ms_target`
- `qps_target`
- `monthly_budget_usd`
- `max_cost_per_1k_tokens_usd`
- `must_support_tools` (true/false)
- `must_support_json_schema` (true/false)
- `must_support_multimodal` (true/false)

## Risk Tolerance

- What mistakes are unacceptable?
- Which failures are recoverable?
- Is deterministic output required?

## Priority Weights Prompt

Ask user to allocate 100 points:
- quality
- cost
- latency
- reliability
- integration_fit

If user does not provide, use defaults from `SKILL.md`.
