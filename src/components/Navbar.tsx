import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import {
  Home,
  Info,
  Radio,
  Heart,
  Building2,
  HandHeart,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  authRequired?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/about", label: "About", icon: Info },
  { to: "/live", label: "Live", icon: Radio },
  { to: "/prayer", label: "Pray", icon: Heart },
  { to: "/branches", label: "Branches", icon: Building2 },
  { to: "/donate", label: "Give", icon: HandHeart },
];

const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [myBranch, setMyBranch] = useState<{ slug: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("branches")
      .select("slug")
      .eq("leader_user_id", user.id)
      .eq("active", true)
      .single()
      .then(({ data }) => {
        if (data) setMyBranch(data);
      });
  }, [user]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Desktop: floating pill at top */}
      <nav className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-1 px-2 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)]">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-2 rounded-full transition-all duration-200 min-w-[64px]",
                  active
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-all",
                    active && "fill-blue-600/15 stroke-[2.2]"
                  )}
                />
                <span className="text-[10px] font-semibold leading-none">
                  {item.label}
                </span>
                {active && (
                  <div className="w-5 h-0.5 bg-blue-600 rounded-full mt-0.5" />
                )}
              </Link>
            );
          })}

          {/* Divider */}
          <div className="w-px h-8 bg-gray-200 mx-1" />

          {/* Auth button */}
          {user ? (
            <button
              onClick={signOut}
              className="flex flex-col items-center gap-0.5 px-4 py-2 rounded-full transition-all duration-200 min-w-[64px] text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[10px] font-semibold leading-none">
                Sign Out
              </span>
            </button>
          ) : (
            <Link
              to="/auth"
              className={cn(
                "flex flex-col items-center gap-0.5 px-4 py-2 rounded-full transition-all duration-200 min-w-[64px]",
                isActive("/auth")
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
              )}
            >
              <User className="h-5 w-5" />
              <span className="text-[10px] font-semibold leading-none">
                Sign In
              </span>
              {isActive("/auth") && (
                <div className="w-5 h-0.5 bg-blue-600 rounded-full mt-0.5" />
              )}
            </Link>
          )}

          {/* My Branch (if leader) */}
          {user && myBranch && (
            <>
              <div className="w-px h-8 bg-gray-200 mx-1" />
              <Link
                to={`/branches/${myBranch.slug}`}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-4 py-2 rounded-full transition-all duration-200 min-w-[64px]",
                  isActive("/branches/")
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
                )}
              >
                <Building2 className="h-5 w-5" />
                <span className="text-[10px] font-semibold leading-none">
                  My Branch
                </span>
                {isActive("/branches/") && (
                  <div className="w-5 h-0.5 bg-blue-600 rounded-full mt-0.5" />
                )}
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Mobile: floating pill at bottom */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px]">
        <div className="flex items-center justify-around px-1 py-2 rounded-full bg-white/70 backdrop-blur-xl border border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200",
                  active
                    ? "text-blue-600"
                    : "text-gray-500 active:text-gray-800"
                )}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 transition-all",
                    active && "fill-blue-600/15 stroke-[2.2]"
                  )}
                />
                <span className="text-[9px] font-semibold leading-none">
                  {item.label}
                </span>
                {active && (
                  <div className="w-4 h-0.5 bg-blue-600 rounded-full mt-0.5" />
                )}
              </Link>
            );
          })}

          {/* Auth / Profile */}
          {user ? (
            <button
              onClick={signOut}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200 text-gray-500 active:text-gray-800"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-[9px] font-semibold leading-none">
                Exit
              </span>
            </button>
          ) : (
            <Link
              to="/auth"
              className={cn(
                "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full transition-all duration-200",
                isActive("/auth")
                  ? "text-blue-600"
                  : "text-gray-500 active:text-gray-800"
              )}
            >
              <User className="h-5 w-5" />
              <span className="text-[9px] font-semibold leading-none">
                Sign In
              </span>
              {isActive("/auth") && (
                <div className="w-4 h-0.5 bg-blue-600 rounded-full mt-0.5" />
              )}
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export { Navbar };
