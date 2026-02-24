# API Contract (v1)

Use this contract for developer integration.

## Endpoint

- `POST /v1/model-recommendation`

## Request JSON

```json
{
  "scenario": {
    "task_type": "rag_qa",
    "success_criteria": ["factual_accuracy", "citation_precision"],
    "context_window_min_tokens": 64000,
    "p95_latency_ms_target": 2000,
    "must_support_tools": true,
    "must_support_json_schema": true,
    "must_support_multimodal": false,
    "max_cost_per_1k_tokens_usd": 0.02,
    "input_tokens_p50": 3000,
    "output_tokens_p50": 700
  },
  "weights": {
    "quality": 35,
    "cost": 25,
    "latency": 20,
    "reliability": 10,
    "integration_fit": 10
  },
  "candidates": [
    {
      "name": "provider-x/model-a",
      "provider": "provider-x",
      "capabilities": {
        "tools": true,
        "json_schema": true,
        "multimodal": false
      },
      "limits": {
        "context_window_tokens": 128000
      },
      "pricing": {
        "input_per_1k_usd": 0.004,
        "output_per_1k_usd": 0.012
      },
      "performance": {
        "quality_0_10": 8.7,
        "p95_latency_ms": 1650,
        "reliability_0_10": 8.1
      },
      "integration_fit_0_10": 8.5
    }
  ]
}
```

`candidates` is optional. If omitted, API will load candidate models from Supabase `model_snapshots`.

## Response JSON

```json
{
  "weights_normalized": {
    "quality": 0.35,
    "cost": 0.25,
    "latency": 0.2,
    "reliability": 0.1,
    "integration_fit": 0.1
  },
  "ranking": [
    {
      "name": "provider-x/model-a",
      "provider": "provider-x",
      "weighted_score_0_10": 8.21,
      "dimension_scores_0_10": {
        "quality": 8.7,
        "cost": 6.4,
        "latency": 7.9,
        "reliability": 8.1,
        "integration_fit": 8.5
      },
      "estimated_cost_per_1k_usd": 0.0055
    }
  ],
  "rejected": [
    {
      "name": "provider-y/model-b",
      "reasons": ["context_window_too_small", "missing_json_schema_support"]
    }
  ],
  "assumptions": [
    "output token estimate uses scenario.output_tokens_p50 when provided"
  ],
  "source": {
    "source": "supabase:model_snapshots",
    "snapshot_date": "2026-02-24",
    "total_rows": 196,
    "filtered_rows": 74
  }
}
```

## Error Codes

- `400`: Invalid payload (missing required fields, wrong ranges)
- `422`: No feasible candidates after hard constraints
- `500`: Internal evaluation error

## Server Environment Variables

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_ANON_KEY`
