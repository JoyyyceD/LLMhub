/**
 * constants.ts
 *
 * Hardcoded model data has been removed.
 * All model data is now fetched from the `model_snapshots` Supabase table.
 *
 * See src/types.ts for ModelSnapshot type definition.
 * See src/lib/scoring.ts for recommendation engine.
 */

// Legacy exports kept as empty arrays to avoid import errors during migration.
// These will be removed once all pages are fully migrated to Supabase.
export const MODELS: never[] = [];
export const REVIEWS: never[] = [];
