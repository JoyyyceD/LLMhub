-- Product/API provider mapping tables + refresh function.
-- Strategy:
-- 1) Keep product support rules stable in product_api_support.
-- 2) Rebuild product_supported_models from latest model_snapshots.

CREATE TABLE IF NOT EXISTS public.providers (
  provider_canonical text PRIMARY KEY,
  display_name text,
  website_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.provider_aliases (
  id bigserial PRIMARY KEY,
  provider_canonical text NOT NULL REFERENCES public.providers(provider_canonical) ON DELETE CASCADE,
  alias_name text NOT NULL,
  normalized_alias text NOT NULL,
  alias_source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (normalized_alias)
);

CREATE TABLE IF NOT EXISTS public.coding_products (
  id bigserial PRIMARY KEY,
  product_vendor text NOT NULL,
  product_name text NOT NULL UNIQUE,
  product_canonical text REFERENCES public.providers(provider_canonical) ON DELETE SET NULL,
  product_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.product_api_support (
  id bigserial PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES public.coding_products(id) ON DELETE CASCADE,
  api_provider_canonical text NOT NULL REFERENCES public.providers(provider_canonical) ON DELETE CASCADE,
  support_scope text NOT NULL CHECK (support_scope IN ('own_all_models', 'recent_6_months_models')),
  rule_basis text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, api_provider_canonical, support_scope)
);

CREATE TABLE IF NOT EXISTS public.product_supported_models (
  id bigserial PRIMARY KEY,
  product_id bigint NOT NULL REFERENCES public.coding_products(id) ON DELETE CASCADE,
  product_name text NOT NULL,
  product_vendor text NOT NULL,
  product_canonical text,
  api_provider_canonical text NOT NULL REFERENCES public.providers(provider_canonical) ON DELETE CASCADE,
  support_scope text NOT NULL CHECK (support_scope IN ('own_all_models', 'recent_6_months_models')),
  model_slug text NOT NULL,
  model_name text NOT NULL,
  model_release_date date,
  model_creator_name text,
  source_table text NOT NULL DEFAULT 'model_snapshots',
  refreshed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, api_provider_canonical, model_slug, support_scope)
);

CREATE INDEX IF NOT EXISTS idx_provider_aliases_provider ON public.provider_aliases(provider_canonical);
CREATE INDEX IF NOT EXISTS idx_product_api_support_product ON public.product_api_support(product_id);
CREATE INDEX IF NOT EXISTS idx_product_api_support_provider ON public.product_api_support(api_provider_canonical);
CREATE INDEX IF NOT EXISTS idx_product_supported_models_product ON public.product_supported_models(product_id);
CREATE INDEX IF NOT EXISTS idx_product_supported_models_provider ON public.product_supported_models(api_provider_canonical);
CREATE INDEX IF NOT EXISTS idx_product_supported_models_release ON public.product_supported_models(model_release_date);

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_aliases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_api_support ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_supported_models ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS providers_read_all ON public.providers;
CREATE POLICY providers_read_all
  ON public.providers FOR SELECT
  USING (true);

DROP POLICY IF EXISTS provider_aliases_read_all ON public.provider_aliases;
CREATE POLICY provider_aliases_read_all
  ON public.provider_aliases FOR SELECT
  USING (true);

DROP POLICY IF EXISTS coding_products_read_all ON public.coding_products;
CREATE POLICY coding_products_read_all
  ON public.coding_products FOR SELECT
  USING (true);

DROP POLICY IF EXISTS product_api_support_read_all ON public.product_api_support;
CREATE POLICY product_api_support_read_all
  ON public.product_api_support FOR SELECT
  USING (true);

DROP POLICY IF EXISTS product_supported_models_read_all ON public.product_supported_models;
CREATE POLICY product_supported_models_read_all
  ON public.product_supported_models FOR SELECT
  USING (true);

DROP POLICY IF EXISTS providers_write_service_role ON public.providers;
CREATE POLICY providers_write_service_role
  ON public.providers FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS provider_aliases_write_service_role ON public.provider_aliases;
CREATE POLICY provider_aliases_write_service_role
  ON public.provider_aliases FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS coding_products_write_service_role ON public.coding_products;
CREATE POLICY coding_products_write_service_role
  ON public.coding_products FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS product_api_support_write_service_role ON public.product_api_support;
CREATE POLICY product_api_support_write_service_role
  ON public.product_api_support FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS product_supported_models_write_service_role ON public.product_supported_models;
CREATE POLICY product_supported_models_write_service_role
  ON public.product_supported_models FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.refresh_product_supported_models(p_cutoff_date date DEFAULT (CURRENT_DATE - INTERVAL '6 months'))
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_rows integer := 0;
BEGIN
  DELETE FROM public.product_supported_models;

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

