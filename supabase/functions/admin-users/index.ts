import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Privileged Supabase auth work (create account, invite, password reset,
 * delete account).
 *
 * The browser only holds the publishable key, so `supabase.auth.admin.*` there
 * fails with "User not allowed". Edge Functions run with Lovable Cloud's
 * managed SUPABASE_SERVICE_ROLE_KEY, so this function verifies that the caller
 * is a signed-in super admin and then performs the operation server-side.
 *
 * Called from the app with `supabase.functions.invoke("admin-users", ...)`.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Always answer 200 with an envelope so the client can show the real reason.
const reply = (payload: Record<string, unknown>) =>
  new Response(JSON.stringify(payload), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const fail = (error: string) => reply({ ok: false, error });

interface Body {
  action?: string;
  email?: string;
  password?: string;
  userId?: string;
  resetIfExists?: boolean;
}

export const handleRequest = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return fail("Method not allowed.");

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) {
    return fail("The account service is missing its Supabase credentials. Check the project's Cloud secrets.");
  }

  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token || token === Deno.env.get("SUPABASE_ANON_KEY")) {
    return fail("Sign in again to manage sign-in accounts.");
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: callerData, error: callerError } = await admin.auth.getUser(token);
  const caller = callerData?.user;
  if (callerError || !caller) return fail("Your session expired. Sign in again.");

  const { data: roleRow, error: roleError } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", caller.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError) return fail(roleError.message);
  if (!roleRow) return fail("Only a super admin can create or reset sign-in accounts.");

  let body: Body = {};
  try {
    body = (await req.json()) as Body;
  } catch {
    return fail("Could not read the request.");
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const userId = (body.userId ?? "").trim();

  if (body.action === "create") {
    if (!email || !password) return fail("An email and password are required.");
    if (password.length < 8) return fail("Use a password of at least 8 characters.");

    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (!error) return reply({ ok: true, userId: data.user?.id ?? null });
    if (!body.resetIfExists || !/already|exists|registered/i.test(error.message)) return fail(error.message);

    // The account already exists (e.g. an earlier attempt half-finished):
    // find it and give it the new password so the admin can share it.
    for (let page = 1; page <= 50; page++) {
      const { data: list, error: listError } = await admin.auth.admin.listUsers({ page, perPage: 200 });
      if (listError) return fail(listError.message);
      const found = list.users.find((u) => (u.email ?? "").toLowerCase() === email);
      if (found) {
        const { error: updError } = await admin.auth.admin.updateUserById(found.id, {
          password,
          email_confirm: true,
        });
        if (updError) return fail(updError.message);
        return reply({ ok: true, userId: found.id, existed: true });
      }
      if (list.users.length < 200) break;
    }
    return fail(error.message);
  }

  if (body.action === "invite") {
    if (!email) return fail("An email is required.");

    const { data, error } = await admin.auth.admin.generateLink({ type: "invite", email });
    if (error) return fail(error.message);
    return reply({ ok: true, userId: data.user?.id ?? null });
  }

  if (body.action === "reset") {
    if (!userId || !password) return fail("An account and password are required.");
    if (password.length < 8) return fail("Use a password of at least 8 characters.");

    const { error } = await admin.auth.admin.updateUserById(userId, { password });
    if (error) return fail(error.message);
    return reply({ ok: true, userId });
  }

  // Removing the auth user also removes their app rows: profiles, roles,
  // branch memberships and branch-admin grants all cascade on auth.users.
  if (body.action === "delete") {
    if (!userId) return fail("An account is required.");

    const { error } = await admin.auth.admin.deleteUser(userId);
    if (error) return fail(error.message);
    return reply({ ok: true, userId });
  }

  return fail("Unknown action.");
};

if (typeof Deno !== "undefined") Deno.serve(handleRequest);
