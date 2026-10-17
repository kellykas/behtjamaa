import { createClient } from "@supabase/supabase-js";

/**
 * Privileged Supabase auth work (create account, invite, password reset).
 *
 * The browser only holds the publishable key, so `supabase.auth.admin.*` there
 * fails with "User not allowed". This endpoint runs on the server with the
 * service-role key, and first verifies that the caller is a signed-in super
 * admin before doing anything.
 */

interface ApiRequest {
  method?: string;
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
}

interface ApiResponse {
  status: (code: number) => { json: (body: unknown) => void };
}

interface AdminUsersBody {
  action?: string;
  email?: string;
  password?: string;
  userId?: string;
}

// The project URL is public (it already ships in the client bundle), so it is safe
// to fall back to it if the deployment does not expose it to the server runtime.
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "https://oanwtlbhejghtstryefe.supabase.co";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const reply = (res: ApiResponse, code: number, payload: unknown) => res.status(code).json(payload);

const headerValue = (value: string | string[] | undefined): string =>
  Array.isArray(value) ? value[0] ?? "" : value ?? "";

export default async function handler(req: ApiRequest, res: ApiResponse) {
  if (req.method !== "POST") return reply(res, 405, { error: "Method not allowed." });

  if (!SUPABASE_URL) return reply(res, 500, { error: "SUPABASE_URL is not configured on the server." });
  if (!SERVICE_ROLE_KEY) {
    return reply(res, 500, {
      error:
        "Account creation is not configured yet. Add SUPABASE_SERVICE_ROLE_KEY to the site's environment variables, then deploy again.",
    });
  }

  const token = headerValue(req.headers.authorization).replace(/^Bearer\s+/i, "").trim();
  if (!token) return reply(res, 401, { error: "Sign in again to manage sign-in accounts." });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: callerData, error: callerError } = await admin.auth.getUser(token);
  const caller = callerData?.user;
  if (callerError || !caller) return reply(res, 401, { error: "Your session expired. Sign in again." });

  const { data: roleRow, error: roleError } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", caller.id)
    .eq("role", "admin")
    .maybeSingle();

  if (roleError) return reply(res, 500, { error: roleError.message });
  if (!roleRow) return reply(res, 403, { error: "Only a super admin can create or reset sign-in accounts." });

  let rawBody: unknown = req.body;
  if (typeof rawBody === "string") {
    try {
      rawBody = JSON.parse(rawBody || "{}");
    } catch {
      return reply(res, 400, { error: "Could not read the request." });
    }
  }

  const body = (rawBody ?? {}) as AdminUsersBody;
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const userId = (body.userId ?? "").trim();

  if (body.action === "create") {
    if (!email || !password) return reply(res, 400, { error: "An email and password are required." });
    if (password.length < 8) return reply(res, 400, { error: "Use a password of at least 8 characters." });

    const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (error) return reply(res, 400, { error: error.message });
    return reply(res, 200, { userId: data.user?.id ?? null });
  }

  if (body.action === "invite") {
    if (!email) return reply(res, 400, { error: "An email is required." });

    const { data, error } = await admin.auth.admin.generateLink({ type: "invite", email });
    if (error) return reply(res, 400, { error: error.message });
    return reply(res, 200, { userId: data.user?.id ?? null });
  }

  if (body.action === "reset") {
    if (!userId || !password) return reply(res, 400, { error: "An account and password are required." });
    if (password.length < 8) return reply(res, 400, { error: "Use a password of at least 8 characters." });

    const { error } = await admin.auth.admin.updateUserById(userId, { password });
    if (error) return reply(res, 400, { error: error.message });
    return reply(res, 200, { userId });
  }

  return reply(res, 400, { error: "Unknown action." });
}
