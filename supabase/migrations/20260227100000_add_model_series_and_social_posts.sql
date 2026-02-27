-- =============================================
-- Migration: Add model_series + social_posts
-- Date: 2026-02-27
-- =============================================

-- -----------------------------------------------
-- TABLE: model_series
-- Brand/family grouping above individual variants
-- e.g. "Qwen3", "GLM-5", "Kimi K2.5", "MiniMax M2.5"
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.model_series (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text UNIQUE NOT NULL,      -- e.g. "qwen3", "glm-5", "kimi-k2-5"
  display_name  text NOT NULL,             -- e.g. "Qwen3", "GLM-5", "Kimi K2.5"
  provider      text,                      -- e.g. "alibaba", "zhipu", "moonshot"
  query_aliases text[] NOT NULL DEFAULT '{}', -- raw CSV query strings that map here
  is_visible    boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.model_series ENABLE ROW LEVEL SECURITY;

CREATE POLICY "model_series_read_all"
  ON public.model_series FOR SELECT
  USING (true);

CREATE POLICY "model_series_write_service_role"
  ON public.model_series FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------
-- Add series_id FK to model_snapshots (nullable)
-- Populated by import script, not migration
-- -----------------------------------------------
ALTER TABLE public.model_snapshots
  ADD COLUMN IF NOT EXISTS series_id uuid REFERENCES public.model_series(id);

CREATE INDEX IF NOT EXISTS idx_model_snapshots_series_id
  ON public.model_snapshots (series_id);

-- -----------------------------------------------
-- TABLE: social_posts
-- Third-party social media posts about models
-- (XHS, Weibo, etc.) — read-only source of truth
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.social_posts (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  uid              text UNIQUE NOT NULL,      -- "xhs:698f17e40000000016009c10"
  series_id        uuid REFERENCES public.model_series(id),
  platform         text NOT NULL,             -- "xhs"
  query            text,                      -- raw query string from CSV
  post_date        date,
  source_url       text,
  title            text,
  author           text,
  like_count       integer NOT NULL DEFAULT 0,
  comment_count    integer NOT NULL DEFAULT 0,
  collect_count    integer NOT NULL DEFAULT 0,
  overall_score    smallint,
  score_quality    smallint,
  score_value      smallint,
  score_latency    smallint,
  score_throughput smallint,
  score_stability  smallint,
  pros_summary     text,
  cons_summary     text,
  overall_summary  text,
  evidence         text,
  tag              text,
  fetched_at       timestamptz,
  run_id           text,
  created_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_social_posts_series_id
  ON public.social_posts (series_id);

CREATE INDEX IF NOT EXISTS idx_social_posts_platform_query
  ON public.social_posts (platform, query);

-- RLS: public read-only, service_role writes
ALTER TABLE public.social_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "social_posts_read_all"
  ON public.social_posts FOR SELECT
  USING (true);

CREATE POLICY "social_posts_write_service_role"
  ON public.social_posts FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
