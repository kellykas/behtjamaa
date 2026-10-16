-- ============================================================================
-- Link approved membership requests to the account that signs up with them
-- ============================================================================
-- A person reaches a branch through two rows:
--   * membership_requests (status = 'approved')  -> the details an admin or the
--     visitor entered; this is what the branch roster showed before sign-up.
--   * branch_members (user_id set)               -> the membership itself, which
--     carries the role and is what the roster uses for role changes.
--
-- Signing up creates the branch_members row but left the approved request in
-- place, so the roster listed the same person twice. `linked_user_id` records
-- which account a request belongs to, which lets the roster fold the two rows
-- into one (see src/lib/branchMembers.ts).
--
-- Safe to run more than once: the column is added only if absent, the backfill
-- only touches rows that are not linked yet, and the triggers are recreated.
-- ============================================================================

ALTER TABLE public.membership_requests
  ADD COLUMN IF NOT EXISTS linked_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_membership_requests_linked_user
  ON public.membership_requests (branch_id, linked_user_id)
  WHERE linked_user_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Backfill: approve-then-sign-up pairs that already exist
-- ---------------------------------------------------------------------------
UPDATE public.membership_requests r
   SET linked_user_id = m.user_id
  FROM public.branch_members m
  JOIN auth.users u ON u.id = m.user_id
 WHERE r.status = 'approved'
   AND r.linked_user_id IS NULL
   AND m.branch_id = r.branch_id
   AND lower(r.email) = lower(u.email);

-- ---------------------------------------------------------------------------
-- Keep the link fresh when a member joins (or is linked) after sign-up
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.link_approved_membership_requests()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
BEGIN
  IF NEW.user_id IS NULL THEN RETURN NEW; END IF;

  SELECT lower(u.email) INTO _email FROM auth.users u WHERE u.id = NEW.user_id;
  IF _email IS NULL THEN RETURN NEW; END IF;

  -- SECURITY DEFINER: the member signing themselves up cannot update the
  -- request (RLS only allows branch leaders and admins), the trigger can.
  UPDATE public.membership_requests r
     SET linked_user_id = NEW.user_id
   WHERE r.branch_id = NEW.branch_id
     AND r.status = 'approved'
     AND r.linked_user_id IS DISTINCT FROM NEW.user_id
     AND lower(r.email) = _email;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS link_approved_membership_requests ON public.branch_members;
CREATE TRIGGER link_approved_membership_requests
  AFTER INSERT OR UPDATE OF user_id ON public.branch_members
  FOR EACH ROW EXECUTE FUNCTION public.link_approved_membership_requests();

-- ---------------------------------------------------------------------------
-- Same link, the other way round: a member added by an admin for someone whose
-- account already exists must not become a second roster row either.
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.link_membership_request_to_member()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id uuid;
BEGIN
  IF NEW.status IS DISTINCT FROM 'approved' OR NEW.linked_user_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT m.user_id INTO _user_id
    FROM public.branch_members m
    JOIN auth.users u ON u.id = m.user_id
   WHERE m.branch_id = NEW.branch_id
     AND m.user_id IS NOT NULL
     AND lower(u.email) = lower(NEW.email)
   LIMIT 1;

  IF _user_id IS NULL THEN RETURN NEW; END IF;

  UPDATE public.membership_requests r
     SET linked_user_id = _user_id
   WHERE r.id = NEW.id
     AND r.linked_user_id IS NULL;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS link_membership_request_to_member ON public.membership_requests;
CREATE TRIGGER link_membership_request_to_member
  AFTER INSERT OR UPDATE OF email, status ON public.membership_requests
  FOR EACH ROW EXECUTE FUNCTION public.link_membership_request_to_member();
