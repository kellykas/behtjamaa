-- Fix 42P17 "infinite recursion detected in policy for relation \"branches\"".
--
-- The branch_grouping_columns migration added two policies that read
-- public.branches from inside a policy on public.branches. PostgREST evaluates a
-- policy by reading that same table, so every branches request re-entered its own
-- policy and failed outright -- the public branch directory showed "No Branches
-- Yet" even though three active branches exist.
--
-- "Branches viewable by everyone" (USING true) already makes every branch row
-- readable, so the child-branch read policy granted nothing and is dropped.
DROP POLICY IF EXISTS "Child branches viewable when parent active" ON public.branches;

-- The write policy's EXISTS subquery always matched the outer row (b.id =
-- branches.id), so it added recursion and no permission beyond what "Admins can
-- manage branches" and "Assigned branch admins can update their branches" already
-- grant. Creating branches therefore stays admin-only.
DROP POLICY IF EXISTS "Branch admins manage child branches" ON public.branches;