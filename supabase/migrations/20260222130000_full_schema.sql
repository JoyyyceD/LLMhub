-- =============================================
-- Full Schema Migration: LLMhub v2
-- Date: 2026-02-22
-- =============================================

-- -----------------------------------------------
-- DROP OLD TABLES (2 test rows, safe to drop)
-- -----------------------------------------------
DROP TABLE IF EXISTS public.review_likes CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;

-- -----------------------------------------------
-- TABLE: model_snapshots
-- Core data source for recommendation engine
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.model_snapshots (
  aa_slug                   text PRIMARY KEY,
  aa_name                   text NOT NULL,
  aa_model_creator_name     text,
  is_cn_provider            boolean NOT NULL DEFAULT false,

  -- Quality / Benchmark metrics (from AA)
  aa_intelligence_index     numeric,
  aa_coding_index           numeric,
  aa_gpqa                   numeric,
  aa_hle                    numeric,
  aa_ifbench                numeric,
  aa_lcr                    numeric,
  aa_scicode                numeric,
  aa_terminalbench_hard     numeric,
  aa_tau2                   numeric,

  -- Speed metrics
  aa_ttft_seconds           numeric,
  aa_tps                    numeric,

  -- Pricing (USD per 1M tokens)
  aa_price_input_usd        numeric,
  aa_price_output_usd       numeric,
  aa_price_blended_usd      numeric,

  -- Context & metadata
  aa_context_length         integer,
  aa_release_date           text,

  -- Data source flags
  has_aa                    boolean NOT NULL DEFAULT false,
  has_or                    boolean NOT NULL DEFAULT false,
  match_confidence          text,

  record_date               date,
  updated_at                timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.model_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "model_snapshots_read_all"
  ON public.model_snapshots FOR SELECT
  USING (true);

CREATE POLICY "model_snapshots_write_service_role"
  ON public.model_snapshots FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- -----------------------------------------------
-- TABLE: model_review_posts
-- Replaces old `reviews` table
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.model_review_posts (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  model_id          text NOT NULL REFERENCES public.model_snapshots(aa_slug) ON DELETE CASCADE,

  -- Ratings (1-5)
  rating_overall    integer NOT NULL CHECK (rating_overall BETWEEN 1 AND 5),
  rating_quality    integer CHECK (rating_quality BETWEEN 1 AND 5),
  rating_price      integer CHECK (rating_price BETWEEN 1 AND 5),
  rating_latency    integer CHECK (rating_latency BETWEEN 1 AND 5),
  rating_throughput integer CHECK (rating_throughput BETWEEN 1 AND 5),
  rating_stability  integer CHECK (rating_stability BETWEEN 1 AND 5),

  -- Optional fields
  provider_name     text CHECK (provider_name IN (
    'OpenAI', 'Anthropic', 'Google', 'Meta', 'Mistral',
    'DeepSeek', 'Alibaba', 'Baidu', 'ByteDance', 'Zhipu',
    'Moonshot', 'MiniMax', 'Tencent', '01AI', 'SiliconFlow',
    'OpenRouter', 'Together AI', 'Other'
  )),
  pros              text CHECK (char_length(pros) <= 200),
  cons              text CHECK (char_length(cons) <= 200),
  comment           text CHECK (char_length(comment) <= 800),

  status            text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'deleted')),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now(),

  -- One review per user per model (duplicate = update)
  UNIQUE (user_id, model_id)
);

-- RLS
ALTER TABLE public.model_review_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "review_posts_read_published"
  ON public.model_review_posts FOR SELECT
  USING (status = 'published');

CREATE POLICY "review_posts_insert_authenticated"
  ON public.model_review_posts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "review_posts_update_own"
  ON public.model_review_posts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "review_posts_delete_own"
  ON public.model_review_posts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------
-- TABLE: review_post_replies
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_post_replies (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES public.model_review_posts(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     text NOT NULL CHECK (char_length(content) BETWEEN 1 AND 300),
  status      text NOT NULL DEFAULT 'published' CHECK (status IN ('published', 'hidden', 'deleted')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_replies_post_created
  ON public.review_post_replies (post_id, created_at ASC);

-- RLS
ALTER TABLE public.review_post_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "replies_read_published"
  ON public.review_post_replies FOR SELECT
  USING (status = 'published');

CREATE POLICY "replies_insert_authenticated"
  ON public.review_post_replies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "replies_update_own"
  ON public.review_post_replies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "replies_delete_own"
  ON public.review_post_replies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------
-- TABLE: review_post_reactions (replaces review_likes)
-- up/down reactions
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.review_post_reactions (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id     uuid NOT NULL REFERENCES public.model_review_posts(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction    text NOT NULL CHECK (reaction IN ('up', 'down')),
  created_at  timestamptz NOT NULL DEFAULT now(),

  UNIQUE (post_id, user_id)
);

-- RLS
ALTER TABLE public.review_post_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "reactions_read_all"
  ON public.review_post_reactions FOR SELECT
  USING (true);

CREATE POLICY "reactions_insert_authenticated"
  ON public.review_post_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reactions_update_own"
  ON public.review_post_reactions FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reactions_delete_own"
  ON public.review_post_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- -----------------------------------------------
-- VIEW: model_rating_summary
-- Aggregated rating data per model
-- -----------------------------------------------
CREATE OR REPLACE VIEW public.model_rating_summary AS
SELECT
  model_id,
  COUNT(*)                      AS rating_count,
  AVG(rating_overall)::numeric  AS rating_avg,
  COUNT(*) >= 10                AS show_public_rating
FROM public.model_review_posts
WHERE status = 'published'
GROUP BY model_id;

-- Grant read access to anon and authenticated
GRANT SELECT ON public.model_rating_summary TO anon, authenticated;
