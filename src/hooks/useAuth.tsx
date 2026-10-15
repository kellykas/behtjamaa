import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type BranchAdmin = {
  id: string;
  full_name: string;
  email: string;
  /** Branches this admin is allowed to manage. */
  branch_ids: string[];
  /** Capability keys this admin is allowed to modify. */
  permissions: string[];
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  /** Full-access system administrator. */
  isAdmin: boolean;
  /** The administrator allowed to create Branch Admin sign-ons. */
  isSuperAdmin: boolean;
  /** Scoped branch administrator signed in to this session, if any. */
  branchAdmin: BranchAdmin | null;
  isBranchAdmin: boolean;
  /** Super admins always pass; branch admins pass only if granted. */
  can: (permission: string) => boolean;
  /** Super admins always pass; branch admins pass only for assigned branches. */
  managesBranch: (branchId: string) => boolean;
  /** Whether the user may open the admin area at all. */
  hasAdminAccess: boolean;
  refreshBranchAdmin: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  isSuperAdmin: false,
  branchAdmin: null,
  isBranchAdmin: false,
  can: () => false,
  managesBranch: () => false,
  hasAdminAccess: false,
  refreshBranchAdmin: async () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [branchAdmin, setBranchAdmin] = useState<BranchAdmin | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const refreshBranchAdmin = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("my_branch_admin", {});
      if (error || !data || data.length === 0) {
        setBranchAdmin(null);
        return;
      }
      const row = data[0];
      setBranchAdmin({
        id: row.id,
        full_name: row.full_name,
        email: row.email,
        branch_ids: row.branch_ids ?? [],
        permissions: row.permissions ?? [],
      });
    } catch {
      // The branch-admins migration may not be applied yet.
      setBranchAdmin(null);
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      setBranchAdmin(null);
      return;
    }

    // Use the has_role RPC (SECURITY DEFINER, bypasses RLS)
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data, error }) => {
      if (error) {
        console.error("Admin role check failed:", error.message);
      }
      setIsAdmin(!!data);
    });

    (async () => {
      // Attach this auth user to a pending Branch Admin invite matching their email.
      try {
        await supabase.rpc("link_branch_admin", {});
      } catch {
        // Migration not applied yet — ignore.
      }
      await refreshBranchAdmin();
    })();
  }, [user, refreshBranchAdmin]);

  const isSuperAdmin = isAdmin;
  const isBranchAdmin = !!branchAdmin;

  const can = useCallback(
    (permission: string) => isAdmin || !!branchAdmin?.permissions.includes(permission),
    [isAdmin, branchAdmin]
  );

  const managesBranch = useCallback(
    (branchId: string) => isAdmin || !!branchAdmin?.branch_ids.includes(branchId),
    [isAdmin, branchAdmin]
  );

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAdmin,
        isSuperAdmin,
        branchAdmin,
        isBranchAdmin,
        can,
        managesBranch,
        hasAdminAccess: isAdmin || isBranchAdmin,
        refreshBranchAdmin,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
