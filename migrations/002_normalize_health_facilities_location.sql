-- Normalize `health_facilities` string columns for fast, index-friendly exact-match lookups.
-- This is designed to make State → LGA → Facility dropdown queries seamless.
--
-- What it does:
-- - Trims leading/trailing whitespace
-- - Collapses repeated whitespace into a single space
-- - Normalizes casing:
--   - `state`: Title Case (Initcap)
--   - `lga`:   Title Case (Initcap)
--   - `facility_name`: trims + collapses whitespace (keeps original casing to avoid damaging acronyms)
--
-- NOTE:
-- - Your API endpoints `/health-facilities/states` and `/health-facilities/states/:state/lgas` return DB values,
--   so once the DB is normalized, the frontend will always submit exact-matching strings.

BEGIN;

-- Ensure helper regex behavior is consistent
-- (Postgres regexp_replace is available by default)

UPDATE health_facilities
SET
  state = initcap(regexp_replace(trim(state), '\s+', ' ', 'g')),
  lga = initcap(regexp_replace(trim(lga), '\s+', ' ', 'g')),
  facility_name = regexp_replace(trim(facility_name), '\s+', ' ', 'g')
WHERE
  state IS NOT NULL
  AND lga IS NOT NULL
  AND facility_name IS NOT NULL
  AND (
    state <> initcap(regexp_replace(trim(state), '\s+', ' ', 'g'))
    OR lga <> initcap(regexp_replace(trim(lga), '\s+', ' ', 'g'))
    OR facility_name <> regexp_replace(trim(facility_name), '\s+', ' ', 'g')
  );

COMMIT;

