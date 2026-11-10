-- Passwords are no longer stored. Sign-in accounts are created by the
-- admin-users Edge Function, and the password is shown once to the admin.
-- Drop the plaintext copies that earlier migrations kept.

DROP TABLE IF EXISTS public.member_login_credentials;

ALTER TABLE public.membership_requests
  DROP COLUMN IF EXISTS temp_password;

ALTER TABLE public.branch_admins
  DROP COLUMN IF EXISTS temp_password;
