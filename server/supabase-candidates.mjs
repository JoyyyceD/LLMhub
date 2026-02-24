import { createClient } from "@supabase/supabase-js";

function toNumber(value, fallback = null) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function normalize0To10(value) {
  const n = toNumber(value, null);
  if (n == null) return null;
  if (n <= 10) return Math.max(0, Math.min(10, n));
  if (n <= 100) return Math.max(0, Math.min(10, n / 10));
  return 10;
}

function estimateLatencyMs(row, outputTokensP50) {
  const ttftSec = toNumber(row.aa_ttft_seconds, null);
  const tps = toNumber(row.aa_tps, null);
  const outputTokens = Math.max(1, toNumber(outputTokensP50, 500) ?? 500);

  const ttftMs = ttftSec != null ? ttftSec * 1000 : 900;
  const decodeMs = tps && tps > 0 ? (outputTokens / tps) * 1000 : 1200;
  return Math.round(ttftMs + decodeMs);
}

function deriveReliability0To10(row) {
  const signals = [
    normalize0To10(row.aa_ifbench),
    normalize0To10(row.aa_lcr),
    normalize0To10(row.aa_tau2),
    normalize0To10(row.aa_hle),
  ].filter((v) => v != null);

  if (signals.length === 0) return 6.5;
  const avg = signals.reduce((a, b) => a + b, 0) / signals.length;
  return Number(avg.toFixed(4));
}

function deriveQuality0To10(row) {
  const signals = [
    normalize0To10(row.aa_intelligence_index),
    normalize0To10(row.aa_coding_index),
    normalize0To10(row.aa_gpqa),
  ].filter((v) => v != null);

  if (signals.length === 0) return 5.5;
  const avg = signals.reduce((a, b) => a + b, 0) / signals.length;
  return Number(avg.toFixed(4));
}

function inferCapabilities(row) {
  const modality = String(row.aa_modality ?? "llm").toLowerCase();
  const inputModalities = Array.isArray(row.or_architecture_input_modalities)
    ? row.or_architecture_input_modalities.map((v) => String(v).toLowerCase())
    : [];
  const isMultimodal = modality !== "llm" || inputModalities.includes("image") || inputModalities.includes("audio");

  // Conservative defaults for current snapshot schema.
  return {
    tools: modality === "llm",
    json_schema: modality === "llm",
    multimodal: isMultimodal,
  };
}

function toCandidate(row, scenario) {
  const inputPer1M = toNumber(row.aa_price_input_usd, 0) ?? 0;
  const outputPer1M = toNumber(row.aa_price_output_usd, 0) ?? 0;
  const contextWindow = toNumber(row.or_context_length, null) ?? toNumber(row.aa_context_length, 0) ?? 0;

  return {
    name: row.aa_slug,
    provider: row.aa_model_creator_name ?? "",
    capabilities: inferCapabilities(row),
    limits: {
      context_window_tokens: contextWindow,
    },
    pricing: {
      input_per_1k_usd: Number((inputPer1M / 1000).toFixed(8)),
      output_per_1k_usd: Number((outputPer1M / 1000).toFixed(8)),
    },
    performance: {
      quality_0_10: deriveQuality0To10(row),
      p95_latency_ms: estimateLatencyMs(row, scenario?.output_tokens_p50),
      reliability_0_10: deriveReliability0To10(row),
    },
    integration_fit_0_10: row.has_or ? 8 : 6.8,
  };
}

function applyLightFilters(rows, payload) {
  const scenario = payload?.scenario ?? {};
  const region = payload?.region_preference;
  const isNewSchema = typeof scenario === "object" && scenario !== null;

  return rows.filter((row) => {
    if (!row.has_aa) return false;
    if (row.aa_modality && String(row.aa_modality).toLowerCase() !== "llm") return false;

    if (region === "cn_mainland" && !row.is_cn_provider) return false;
    if (region === "overseas" && row.is_cn_provider) return false;

    if (isNewSchema) {
      if (scenario.must_support_multimodal === true) return false;
      if (scenario.context_window_min_tokens != null) {
        const ctx = toNumber(row.or_context_length, null) ?? toNumber(row.aa_context_length, 0) ?? 0;
        if (ctx < Number(scenario.context_window_min_tokens)) return false;
      }
    }

    return true;
  });
}

export async function loadCandidatesFromSupabase(payload) {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing SUPABASE_URL/SUPABASE_KEY environment variables.");
  }

  const client = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });
  const { data, error } = await client
    .from("model_snapshots")
    .select(
      [
        "aa_slug",
        "aa_name",
        "aa_model_creator_name",
        "is_cn_provider",
        "aa_modality",
        "aa_intelligence_index",
        "aa_coding_index",
        "aa_gpqa",
        "aa_hle",
        "aa_ifbench",
        "aa_lcr",
        "aa_tau2",
        "aa_ttft_seconds",
        "aa_tps",
        "aa_price_input_usd",
        "aa_price_output_usd",
        "aa_context_length",
        "or_context_length",
        "or_architecture_input_modalities",
        "has_aa",
        "has_or",
        "record_date",
      ].join(",")
    )
    .order("record_date", { ascending: false })
    .limit(1000);

  if (error) {
    throw new Error(`Supabase query failed: ${error.message}`);
  }

  const rows = Array.isArray(data) ? data : [];
  const filtered = applyLightFilters(rows, payload);
  const scenario = typeof payload?.scenario === "object" && payload?.scenario ? payload.scenario : {};
  const candidates = filtered.map((row) => toCandidate(row, scenario));

  const newestDate = rows.find((r) => r.record_date)?.record_date ?? null;
  return {
    candidates,
    assumptions: [
      "Capabilities are inferred from snapshot fields; validate tools/json-schema support for final procurement.",
      "Latency is estimated from ttft+tps and expected output tokens.",
    ],
    metadata: {
      source: "supabase:model_snapshots",
      snapshot_date: newestDate,
      total_rows: rows.length,
      filtered_rows: filtered.length,
    },
  };
}
