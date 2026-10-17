import { supabase } from "@/integrations/supabase/client";

export type AdminUserAction = "create" | "invite" | "reset";

export interface AdminUserResult {
  error?: string;
  userId?: string | null;
}

/**
 * Privileged Supabase auth work goes through /api/admin-users.
 *
 * Calling `supabase.auth.admin.*` from the browser uses the publishable key and
 * Supabase rejects it with "User not allowed". The service-role key stays on the
 * server; this helper only forwards the signed-in super admin's access token.
 */
export const callAdminUsersApi = async (payload: {
  action: AdminUserAction;
  email?: string;
  password?: string;
  userId?: string;
}): Promise<AdminUserResult> => {
  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session?.access_token;
  if (!token) return { error: "Your session expired. Sign in again." };

  try {
    const response = await fetch("/api/admin-users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = (await response.json().catch(() => null)) as
      | { error?: string; userId?: string | null }
      | null;

    if (response.status === 404) {
      return { error: "The account service is not deployed yet. Redeploy the site and try again." };
    }
    if (!response.ok) {
      return { error: data?.error || "The account service could not complete this request." };
    }
    return { userId: data?.userId ?? null };
  } catch {
    return { error: "Could not reach the account service. Check your connection and try again." };
  }
};
