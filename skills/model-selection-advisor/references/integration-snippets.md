# Integration Snippets

## TypeScript (fetch)

```ts
const payload = {
  scenario: {
    task_type: "rag_qa",
    context_window_min_tokens: 64000,
    p95_latency_ms_target: 2000,
    max_cost_per_1k_tokens_usd: 0.02,
    must_support_tools: true,
    must_support_json_schema: true
  },
  weights: {
    quality: 35,
    cost: 25,
    latency: 20,
    reliability: 10,
    integration_fit: 10
  }
  // candidates omitted on purpose; server auto-loads from Supabase
};

const res = await fetch("https://your-domain.com/v1/model-recommendation", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});

if (!res.ok) {
  throw new Error(`Recommendation failed: ${res.status}`);
}

const data = await res.json();
console.log(data.ranking?.[0]);
```

## Python (requests)

```python
import requests

resp = requests.post(
    "https://your-domain.com/v1/model-recommendation",
    json=payload,
    timeout=30,
)
resp.raise_for_status()
result = resp.json()
print(result["ranking"][0])
```

## Local API startup

```bash
npm run api:recommend
```

Required env vars for server mode:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY` (recommended) or `SUPABASE_ANON_KEY`

## Local Engine (no server)

```bash
python3 scripts/recommend_models.py --input /path/to/request.json --top-k 3
```
