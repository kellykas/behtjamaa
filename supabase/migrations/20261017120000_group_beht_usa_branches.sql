-- ============================================================================
-- Group the USA branches: BEHT USA becomes the grouping branch, Louisville hangs under it
-- ============================================================================
-- The branch grouping columns (parent_id / is_state_branch / state_code) already
-- exist; this migration is the data half, so the "Add USA State" grouping is
-- actually used by the existing branches instead of sitting empty.
--
-- Safe to re-run: it only re-asserts the same two rows and does nothing when a
-- branch is missing.

DO $$
DECLARE
  usa_id UUID;
  louisville_id UUID;
BEGIN
  -- The USA grouping branch: prefer the slug, fall back to the display name.
  SELECT id INTO usa_id
  FROM public.branches
  WHERE lower(slug) IN ('beht-usa', 'usa')
     OR lower(btrim(name)) IN ('beht usa', 'beht-usa', 'usa')
  ORDER BY (lower(slug) = 'beht-usa') DESC, created_at
  LIMIT 1;

  IF usa_id IS NULL THEN
    RAISE NOTICE 'No BEHT USA branch found; nothing to group.';
    RETURN;
  END IF;

  UPDATE public.branches
  SET is_state_branch = true,
      state_code = COALESCE(state_code, 'US'),
      parent_id = NULL
  WHERE id = usa_id;

  -- Louisville becomes a chapter of BEHT USA.
  SELECT id INTO louisville_id
  FROM public.branches
  WHERE id <> usa_id
    AND (lower(slug) LIKE '%louisville%' OR lower(name) LIKE '%louisville%')
  ORDER BY created_at
  LIMIT 1;

  IF louisville_id IS NULL THEN
    RAISE NOTICE 'No Louisville branch found; BEHT USA is grouped but has no chapters yet.';
    RETURN;
  END IF;

  UPDATE public.branches
  SET parent_id = usa_id,
      is_state_branch = false
  WHERE id = louisville_id;

  RAISE NOTICE 'BEHT USA (%) is the USA grouping; Louisville (%) is now its chapter.', usa_id, louisville_id;
END $$;
