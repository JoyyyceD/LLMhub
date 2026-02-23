-- Add OpenRouter fields for advanced filtering in recommendation UI
ALTER TABLE public.model_snapshots
  ADD COLUMN IF NOT EXISTS or_context_length integer,
  ADD COLUMN IF NOT EXISTS or_architecture_input_modalities jsonb;

-- Backfill context from existing field used in prior schema versions
UPDATE public.model_snapshots
SET or_context_length = aa_context_length
WHERE or_context_length IS NULL AND aa_context_length IS NOT NULL;
