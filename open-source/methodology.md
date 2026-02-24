# Methodology (Public)

## Goal

Recommend model candidates under explicit constraints instead of implicit preference.

## Workflow

1. Collect scenario constraints.
2. Build candidate set.
3. Apply hard filters.
4. Score feasible candidates.
5. Return ranked recommendations with risks and validation plan.

## Required inputs

- Task type and success criteria
- Latency target (p95)
- Budget guardrail
- Context window minimum
- Capability requirements (tools, json-schema, multimodal)

## Hard filters

Reject candidates when any condition fails:

- Context window below minimum
- Missing required capability
- Latency above target
- Estimated blended cost above limit

## Scoring dimensions

- quality
- cost
- latency
- reliability
- integration_fit

Default normalized weights:

- quality: 0.35
- cost: 0.20
- latency: 0.20
- reliability: 0.15
- integration_fit: 0.10

## Output requirements

Always return:

- Ranked candidates
- Rejection reasons
- Assumptions
- Conservative option
- Aggressive option
- A/B validation plan

## Decision boundary

When constraints are incomplete, ask targeted questions.  
If user declines, proceed with explicit assumptions and lower confidence.
