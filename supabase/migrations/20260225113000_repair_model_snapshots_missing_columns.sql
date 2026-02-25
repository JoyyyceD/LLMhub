-- Repair migration for production schema drift on model_snapshots.
-- Safe to run multiple times.

ALTER TABLE public.model_snapshots
  ADD COLUMN IF NOT EXISTS or_context_length integer,
  ADD COLUMN IF NOT EXISTS or_architecture_input_modalities jsonb,
  ADD COLUMN IF NOT EXISTS aa_modality text NOT NULL DEFAULT 'llm',
  ADD COLUMN IF NOT EXISTS aa_id text,
  ADD COLUMN IF NOT EXISTS aa_model_creator_id text,
  ADD COLUMN IF NOT EXISTS aa_model_creator_name_cn text,
  ADD COLUMN IF NOT EXISTS reasoning_type text,
  ADD COLUMN IF NOT EXISTS aa_elo numeric,
  ADD COLUMN IF NOT EXISTS category_style_anime_elo numeric,
  ADD COLUMN IF NOT EXISTS category_style_cartoon_illustration_elo numeric,
  ADD COLUMN IF NOT EXISTS category_style_general_photorealistic_elo numeric,
  ADD COLUMN IF NOT EXISTS category_style_graphic_design_digital_rendering_elo numeric,
  ADD COLUMN IF NOT EXISTS category_style_traditional_art_elo numeric,
  ADD COLUMN IF NOT EXISTS category_subject_commercial_elo numeric,
  ADD COLUMN IF NOT EXISTS category_format_short_prompt_elo numeric,
  ADD COLUMN IF NOT EXISTS category_format_long_prompt_elo numeric,
  ADD COLUMN IF NOT EXISTS category_format_moving_camera_elo numeric,
  ADD COLUMN IF NOT EXISTS category_format_multi_scene_elo numeric,
  ADD COLUMN IF NOT EXISTS category_style_photorealistic_elo numeric,
  ADD COLUMN IF NOT EXISTS category_style_cartoon_and_anime_elo numeric,
  ADD COLUMN IF NOT EXISTS category_style_3d_animation_elo numeric;

UPDATE public.model_snapshots
SET or_context_length = aa_context_length
WHERE or_context_length IS NULL AND aa_context_length IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_model_snapshots_modality ON public.model_snapshots(aa_modality);
CREATE INDEX IF NOT EXISTS idx_model_snapshots_cn_modality ON public.model_snapshots(is_cn_provider, aa_modality);
