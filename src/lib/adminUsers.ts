import { supabase } from "@/integrations/supabase/client";

export type AdminUserAction = "create" | "invite" | "reset" | "delete";

export interface AdminUserResult {
  error?: string;
  userId?: string | null;
}

interface AdminUsersResponse {
  ok?: boolean;
  error?: string;
  userId?: string | null;
}

/**
 * One-time password for a new or reset sign-in. It is shown once so the admin
 * can share it securely; the person changes it after signing in.
 */
export const generatePassword = (): string => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";
  const bytes = new Uint32Array(12);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < bytes.length; i++) out += chars[bytes[i] % chars.length];
  return out;
};

/**
 * Privileged Supabase auth work goes through the `admin-users` Edge Function.
 *
 * Calling `supabase.auth.admin.*` from the browser uses the publishable key and
 * Supabase rejects it with "User not allowed". The function runs with the
 * backend's service-role key and only allows signed-in super admins to call it.
 */
export const callAdminUsersApi = async (payload: {
  action: AdminUserAction;
  email?: string;
  password?: string;
  userId?: string;
  /** For "create": if the email already has an account, set this password on it instead. */
  resetIfExists?: boolean;
}): Promise<AdminUserResult> => {
  const { data: sessionData } = await supabase.auth.getSession();
  if (!sessionData.session) return { error: "Your session expired. Sign in again." };

  const { data, error } = await supabase.functions.invoke<AdminUsersResponse>("admin-users", {
    body: payload,
  });

  if (error) {
    const status = (error as { context?: { status?: number } }).context?.status;
    if (status === 404) {
      return { error: "The account service is not deployed yet. Deploy the admin-users function, then try again." };
    }
    return { error: error.message || "The account service could not complete this request." };
  }

  if (data?.error) return { error: data.error };
  return { userId: data?.userId ?? null };
};
