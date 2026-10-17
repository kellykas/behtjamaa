# AGENTS.md

Rules for working on this project. Each rule states a decision and why it holds.

## Database

- **A row-level security policy must never read the table it is defined on.** PostgREST evaluates a policy by querying that same table, so a self-reference re-enters its own policy and every request on the table fails with `42P17 infinite recursion detected in policy`. If a rule genuinely needs another row of the same table (e.g. a parent's status), expose it through a `SECURITY DEFINER` function that reads a different table, or rely on an existing broader policy instead of adding one. *Why: a broken policy does not merely deny access, it takes the whole table down for every visitor.*

- **A migration file in `supabase/migrations/` is not proof the change reached the database.** Verify against the live schema before assuming a feature's columns or policies exist. *Why: one migration here had been failing silently for months, so its feature's columns were missing and the app was broken, while the repo looked correct.*

- **Application tables and functions stay in `public`.** Do not alter managed tables, columns, functions or triggers in `auth`, `storage`, `realtime`, `supabase_functions` or `vault`. *Why: those schemas are platform-managed and changes there are overwritten or break the managed stack.*

- **Grant Data API access in the same migration that creates a table.** Supabase does not grant default privileges on `public` to `anon`, `authenticated` or `service_role`. *Why: RLS alone is not enough — without explicit grants the API returns a permission error.*

- **Widen write access only with a concrete reason, and never in a policy that covers `INSERT` without checking who the new row belongs to.** A `FOR ALL` policy whose `WITH CHECK` accepts `leader_user_id = auth.uid()` lets any signed-in user create a row and appoint themselves its owner. *Why: that turns a convenience policy into a privilege-escalation path.*

## Privileged operations

- **Supabase auth administration runs only inside an Edge Function using the backend's service-role key; the browser never calls `auth.admin.*`.** The function authenticates the caller and checks the role in `public.user_roles` before acting. *Why: the browser holds only the publishable key, which Supabase rejects with "User not allowed".*

- **Roles live in `public.user_roles` and are read through the `has_role` helper, never from user-editable metadata or client storage.** *Why: metadata and local storage can be manipulated by the caller, so they cannot be a basis for privilege.*

## Frontend data shapes

- **`jsonb` columns arrive typed as `Json`, so never index into them or pass a member to something expecting a string.** Normalize through a helper in `src/lib/utils.ts` that keeps only usable values. *Why: the generated type admits numbers, booleans, nested arrays and objects, so a `jsonb` array is not a `string[]` at compile time.*

## Checks

- **Run `bunx vitest run` before reporting work complete.** The harness builds and typechecks automatically but does not run tests.
