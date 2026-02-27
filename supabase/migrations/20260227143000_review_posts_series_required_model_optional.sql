-- =============================================
-- Migration: review posts use model_series as primary target
-- Date: 2026-02-27
-- =============================================

-- 1) Add series_id (required after backfill)
ALTER TABLE public.model_review_posts
  ADD COLUMN IF NOT EXISTS series_id uuid REFERENCES public.model_series(id);

CREATE INDEX IF NOT EXISTS idx_model_review_posts_series_id
  ON public.model_review_posts(series_id);

-- 2) Backfill series_id from model_id -> model_snapshots.series_id
UPDATE public.model_review_posts rp
SET series_id = ms.series_id
FROM public.model_snapshots ms
WHERE rp.model_id = ms.aa_slug
  AND rp.series_id IS NULL;

-- 3) Make model_id optional and series_id required
ALTER TABLE public.model_review_posts
  ALTER COLUMN model_id DROP NOT NULL;

ALTER TABLE public.model_review_posts
  ALTER COLUMN series_id SET NOT NULL;

-- 4) Replace old uniqueness: one series-level post + optional per-model posts
ALTER TABLE public.model_review_posts
  DROP CONSTRAINT IF EXISTS model_review_posts_user_id_model_id_key;

DROP INDEX IF EXISTS idx_model_review_posts_unique_series_level;
DROP INDEX IF EXISTS idx_model_review_posts_unique_model_level;

CREATE UNIQUE INDEX idx_model_review_posts_unique_series_level
  ON public.model_review_posts(user_id, series_id)
  WHERE model_id IS NULL;

CREATE UNIQUE INDEX idx_model_review_posts_unique_model_level
  ON public.model_review_posts(user_id, series_id, model_id)
  WHERE model_id IS NOT NULL;

-- 5) Enforce consistency: if model_id is set, it must belong to series_id
CREATE OR REPLACE FUNCTION public.ensure_review_model_in_series()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  model_series uuid;
BEGIN
  IF NEW.model_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT series_id INTO model_series
  FROM public.model_snapshots
  WHERE aa_slug = NEW.model_id;

  IF model_series IS NULL THEN
    RAISE EXCEPTION 'model_id % has no mapped series_id', NEW.model_id;
  END IF;

  IF model_series <> NEW.series_id THEN
    RAISE EXCEPTION 'model_id % does not belong to series_id %', NEW.model_id, NEW.series_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_review_model_in_series ON public.model_review_posts;
CREATE TRIGGER trg_review_model_in_series
BEFORE INSERT OR UPDATE ON public.model_review_posts
FOR EACH ROW
EXECUTE FUNCTION public.ensure_review_model_in_series();
