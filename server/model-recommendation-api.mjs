import express from "express";
import { evaluateModelRecommendation } from "./recommendation-engine.mjs";

const app = express();
const port = Number(process.env.PORT ?? 8787);

app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({
    ok: true,
    service: "model-recommendation-api",
    now: new Date().toISOString(),
  });
});

function respondWithEvaluation(req, res) {
  try {
    const result = evaluateModelRecommendation(req.body);
    if (result.error === "no_feasible_candidates") {
      return res.status(422).json(result);
    }
    return res.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request payload";
    return res.status(400).json({ error: "invalid_payload", message });
  }
}

app.post("/v1/model-recommendation", respondWithEvaluation);
app.post("/api/recommendations", respondWithEvaluation);

app.use((req, res) => {
  res.status(404).json({
    error: "not_found",
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`model-recommendation-api listening on http://localhost:${port}`);
});
