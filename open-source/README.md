# Open Source Pack: Model Selection Methodology

This folder contains the public layer of the model-selection system.

## What is included

- `methodology.md`: scenario-to-decision workflow
- `api-schema.json`: public request/response contract
- `skill-template/SKILL.md`: installable skill template for agents
- `examples/request.json`: sample request payload
- `examples/response.json`: sample response payload
- `BOUNDARIES.md`: what is open vs private
- `CONTRIBUTING.md`: contribution rules

## What this is for

- Build trust with transparent selection logic
- Let developers integrate quickly
- Let agents follow a stable recommendation workflow

## Quick start

1. Read `methodology.md`
2. Validate your payload shape with `api-schema.json`
3. Use `examples/request.json` to call `/v1/model-recommendation`
4. Install `skill-template/SKILL.md` into your agent skill directory

## Release note

This package intentionally excludes private routing policies, private weights, and proprietary feedback datasets.

## License

Apache-2.0. See the repository root `LICENSE`.
