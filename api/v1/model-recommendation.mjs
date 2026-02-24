import { evaluateModelRecommendation } from "../../server/recommendation-engine.mjs";
import { loadCandidatesFromSupabase } from "../../server/supabase-candidates.mjs";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({
      error: "method_not_allowed",
      message: "Use POST for this endpoint.",
    });
  }

  try {
    const payload = req.body && typeof req.body === "object" ? { ...req.body } : {};
    let sourceMeta = null;
    let sourceAssumptions = [];

    if (!Array.isArray(payload.candidates) || payload.candidates.length === 0) {
      const loaded = await loadCandidatesFromSupabase(payload);
      payload.candidates = loaded.candidates;
      sourceMeta = loaded.metadata;
      sourceAssumptions = loaded.assumptions ?? [];
    }

    const result = evaluateModelRecommendation(payload);
    if (sourceAssumptions.length > 0) {
      result.assumptions = [...(result.assumptions ?? []), ...sourceAssumptions];
    }
    if (sourceMeta) {
      result.source = sourceMeta;
    }

    if (result.error === "no_feasible_candidates") {
      return res.status(422).json(result);
    }
    return res.status(200).json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Invalid request payload";
    return res.status(400).json({
      error: "invalid_payload",
      message,
    });
  }
}
