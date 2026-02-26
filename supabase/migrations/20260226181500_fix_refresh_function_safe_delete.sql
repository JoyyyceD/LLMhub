-- Fix refresh function for environments enforcing "DELETE requires a WHERE clause".
-- Keep behavior as full rebuild while satisfying safe-delete policy.

CREATE OR REPLACE FUNCTION public.refresh_product_supported_models(p_cutoff_date date DEFAULT (CURRENT_DATE - INTERVAL '6 months'))
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows integer := 0;
BEGIN
  DELETE FROM public.product_supported_models WHERE id >= 0;

  WITH models_with_provider AS (
    SELECT
      m.aa_slug,
      m.aa_name,
      m.aa_model_creator_name,
      CASE
        WHEN m.aa_release_date ~ '^\d{4}-\d{2}-\d{2}$' THEN m.aa_release_date::date
        ELSE NULL
      END AS release_date,
      pa.provider_canonical
    FROM public.model_snapshots m
    JOIN public.provider_aliases pa
      ON lower(trim(m.aa_model_creator_name)) = lower(trim(pa.alias_name))
    WHERE m.aa_modality = 'llm'
  ),
  expanded AS (
    SELECT
      cp.id AS product_id,
      cp.product_name,
      cp.product_vendor,
      cp.product_canonical,
      pas.api_provider_canonical,
      pas.support_scope,
      mwp.aa_slug AS model_slug,
      mwp.aa_name AS model_name,
      mwp.release_date AS model_release_date,
      mwp.aa_model_creator_name AS model_creator_name
    FROM public.product_api_support pas
    JOIN public.coding_products cp ON cp.id = pas.product_id
    JOIN models_with_provider mwp ON mwp.provider_canonical = pas.api_provider_canonical
    WHERE
      pas.support_scope = 'own_all_models'
      OR (
        pas.support_scope = 'recent_6_months_models'
        AND mwp.release_date IS NOT NULL
        AND mwp.release_date >= p_cutoff_date
      )
  )
  INSERT INTO public.product_supported_models (
    product_id,
    product_name,
    product_vendor,
    product_canonical,
    api_provider_canonical,
    support_scope,
    model_slug,
    model_name,
    model_release_date,
    model_creator_name,
    source_table,
    refreshed_at
  )
  SELECT
    e.product_id,
    e.product_name,
    e.product_vendor,
    e.product_canonical,
    e.api_provider_canonical,
    e.support_scope,
    e.model_slug,
    e.model_name,
    e.model_release_date,
    e.model_creator_name,
    'model_snapshots',
    now()
  FROM expanded e
  ON CONFLICT (product_id, api_provider_canonical, model_slug, support_scope) DO UPDATE
  SET
    model_name = EXCLUDED.model_name,
    model_release_date = EXCLUDED.model_release_date,
    model_creator_name = EXCLUDED.model_creator_name,
    refreshed_at = now();

  GET DIAGNOSTICS v_rows = ROW_COUNT;
  RETURN v_rows;
END;
$$;

GRANT EXECUTE ON FUNCTION public.refresh_product_supported_models(date) TO service_role;

