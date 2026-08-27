import { useState, useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useSiteSettings } from "@/hooks/useContent";
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
  const { settings } = useSiteSettings("appearance");
  const glassIntensity = parseInt(settings.glass_intensity || "60", 10);

  // Scroll/hover state
  const [shrunk, setShrunk] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Track scroll direction
  useEffect(() => {
    let lastScroll = 0;
    const onScroll = () => {
      const current = window.scrollY;
      if (current > 80) {
        setShrunk(current > lastScroll);
      } else {
        setShrunk(false);
      }
      lastScroll = current;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Reset shrunk on route change
  useEffect(() => {
    setShrunk(false);
  }, [location.pathname]);

  const isExpanded = !shrunk || hovered;

  // Fetch branch leader info
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

  const glassStyle = {
    background: `rgba(255,255,255,${glassIntensity / 100})`,
    backdropFilter: `blur(${Math.round(glassIntensity * 0.24)}px)`,
    WebkitBackdropFilter: `blur(${Math.round(glassIntensity * 0.24)}px)`,
  } as const;

  const renderItem = (item: NavItem, compact: boolean) => {
    const active = isActive(item.to);
    return (
      <Link
        key={item.to}
        to={item.to}
        className={cn(
          "flex flex-col items-center rounded-full transition-all duration-300 ease-in-out",
          compact ? "gap-0 px-3 py-1.5 min-w-[40px]" : "gap-0.5 px-4 py-2 min-w-[64px]",
          active
            ? "text-blue-600"
            : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
        )}
      >
        <item.icon
          className={cn(
            "transition-all duration-300",
            compact ? "h-4 w-4" : "h-5 w-5",
            active && "fill-blue-600/15 stroke-[2.2]"
          )}
        />
        {!compact && (
          <span className="text-[10px] font-semibold leading-none transition-all duration-300">
            {item.label}
          </span>
        )}
        {active && !compact && (
          <div className="w-5 h-0.5 bg-blue-600 rounded-full mt-0.5 transition-all duration-300" />
        )}
        {active && compact && (
          <div className="w-3 h-0.5 bg-blue-600 rounded-full mt-0.5 transition-all duration-300" />
        )}
      </Link>
    );
  };

  const renderAuthButton = (compact: boolean) => {
    if (user) {
      return (
        <button
          onClick={signOut}
          className={cn(
            "flex flex-col items-center rounded-full transition-all duration-300 text-gray-500 hover:text-gray-800 hover:bg-gray-100/60",
            compact ? "gap-0 px-3 py-1.5" : "gap-0.5 px-4 py-2 min-w-[64px]"
          )}
        >
          <LogOut className={cn("transition-all duration-300", compact ? "h-4 w-4" : "h-5 w-5")} />
          {!compact && (
            <span className="text-[10px] font-semibold leading-none">Sign Out</span>
          )}
        </button>
      );
    }
    return (
      <Link
        to="/auth"
        className={cn(
          "flex flex-col items-center rounded-full transition-all duration-300",
          compact ? "gap-0 px-3 py-1.5" : "gap-0.5 px-4 py-2 min-w-[64px]",
          isActive("/auth")
            ? "text-blue-600"
            : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
        )}
      >
        <User className={cn("transition-all duration-300", compact ? "h-4 w-4" : "h-5 w-5")} />
        {!compact && (
          <span className="text-[10px] font-semibold leading-none">Sign In</span>
        )}
        {isActive("/auth") && !compact && (
          <div className="w-5 h-0.5 bg-blue-600 rounded-full mt-0.5" />
        )}
        {isActive("/auth") && compact && (
          <div className="w-3 h-0.5 bg-blue-600 rounded-full mt-0.5" />
        )}
      </Link>
    );
  };

  const renderBranchLink = (compact: boolean) => {
    if (!user || !myBranch) return null;
    const active = isActive("/branches/");
    return (
      <>
        <div className={cn("bg-gray-200 transition-all duration-300", compact ? "w-px h-6 mx-0.5" : "w-px h-8 mx-1")} />
        <Link
          to={`/branches/${myBranch.slug}`}
          className={cn(
            "flex flex-col items-center rounded-full transition-all duration-300",
            compact ? "gap-0 px-3 py-1.5" : "gap-0.5 px-4 py-2 min-w-[64px]",
            active
              ? "text-blue-600"
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-100/60"
          )}
        >
          <Building2 className={cn("transition-all duration-300", compact ? "h-4 w-4" : "h-5 w-5")} />
          {!compact && (
            <span className="text-[10px] font-semibold leading-none">My Branch</span>
          )}
          {active && !compact && (
            <div className="w-5 h-0.5 bg-blue-600 rounded-full mt-0.5" />
          )}
          {active && compact && (
            <div className="w-3 h-0.5 bg-blue-600 rounded-full mt-0.5" />
          )}
        </Link>
      </>
    );
  };

  const compact = !isExpanded;

  return (
    <>
      {/* Desktop: floating pill at top */}
      <nav
        className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 z-50 transition-all duration-300"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className={cn(
            "flex items-center rounded-full border border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.08),0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-300",
            compact ? "gap-0.5 px-1.5 py-1.5" : "gap-1 px-2 py-2"
          )}
          style={glassStyle}
        >
          {NAV_ITEMS.map((item) => renderItem(item, compact))}

          {/* Divider */}
          <div className={cn("bg-gray-200 transition-all duration-300", compact ? "w-px h-6 mx-0.5" : "w-px h-8 mx-1")} />

          {/* Auth button */}
          {renderAuthButton(compact)}

          {/* My Branch (if leader) */}
          {renderBranchLink(compact)}
        </div>
      </nav>

      {/* Mobile: floating pill at bottom */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px]">
        <div
          className="flex items-center justify-around px-1 py-2 rounded-full border border-white/40 shadow-[0_4px_24px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)]"
          style={glassStyle}
        >
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
