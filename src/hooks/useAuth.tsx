import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAdmin: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

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

  useEffect(() => {
    if (user) {
      const checkAdmin = async () => {
        // Method 1: Try the has_role RPC (SECURITY DEFINER, bypasses RLS)
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc("has_role", {
            _user_id: user.id,
            _role: "admin",
          });
          console.log("[AdminCheck] RPC result:", rpcData, "error:", rpcError);
          if (!rpcError && rpcData === true) {
            setIsAdmin(true);
            return;
          }
        } catch (e) {
          console.log("[AdminCheck] RPC failed:", e);
        }

        // Method 2: Direct query on user_roles (RLS: "Users can view own roles")
        try {
          const { data: roleRows, error: roleError } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", user.id);

          console.log("[AdminCheck] Direct query result:", roleRows, "error:", roleError);

          if (!roleError && roleRows) {
            const hasAdmin = roleRows.some((r) => r.role === "admin");
            console.log("[AdminCheck] hasAdmin:", hasAdmin);
            setIsAdmin(hasAdmin);
          } else {
            setIsAdmin(false);
          }
        } catch (e) {
          console.log("[AdminCheck] Direct query failed:", e);
          setIsAdmin(false);
        }
      };

      checkAdmin();
    } else {
      setIsAdmin(false);
    }
  }, [user]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
