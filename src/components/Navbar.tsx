import { useState, useEffect } from "react";
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
  Shield,
  KeyRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ChangePasswordDialog from "@/components/ChangePasswordDialog";

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

const EASE_SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";
const EASE_SMOOTH = "cubic-bezier(0.4, 0, 0.2, 1)";

const Navbar = () => {
  const { user, signOut, hasAdminAccess } = useAuth();
  const location = useLocation();
  const [myBranch, setMyBranch] = useState<{ slug: string } | null>(null);
  const { settings } = useSiteSettings("appearance");
  const glassIntensity = parseInt(settings.glass_intensity || "60", 10);

  const [shrunk, setShrunk] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);

  useEffect(() => {
    let lastScroll = 0;
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const current = window.scrollY;
          if (current > 80) {
            setShrunk(current > lastScroll);
          } else {
            setShrunk(false);
          }
          lastScroll = current;
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setShrunk(false);
  }, [location.pathname]);

  const isExpanded = !shrunk || hovered;

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

  const compact = !isExpanded;

  /* ── Individual nav item ──────────────────────────────────────── */
  const NavItemLink = ({ item }: { item: NavItem }) => {
    const active = isActive(item.to);
    return (
      <Link
        to={item.to}
        className="nav-item group relative flex flex-col items-center rounded-full"
        style={{
          padding: compact ? "6px 10px" : "8px 16px",
          minWidth: compact ? 40 : 64,
          gap: compact ? 0 : 2,
          transition: `padding 400ms ${EASE_SPRING}, min-width 400ms ${EASE_SPRING}, gap 300ms ${EASE_SMOOTH}`,
        }}
      >
        {/* Hover / active background pill — uses group-hover for smooth trigger */}
        <div
          className="absolute inset-0 rounded-full transition-all duration-300 ease-out"
          style={{
            background: active
              ? "rgba(239,246,255,1)"
              : undefined,
            transform: "scale(1)",
            transition: `background 250ms ${EASE_SMOOTH}, transform 250ms ${EASE_SPRING}`,
          }}
        />
        {/* Hover overlay — separate element so it doesn't fight with active bg */}
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out"
          style={{
            background: active ? "rgba(219,234,254,0.5)" : "rgba(243,244,246,0.6)",
          }}
        />

        <div className="relative z-10 flex flex-col items-center" style={{ gap: compact ? 0 : 2 }}>
          <item.icon
            className="transition-all"
            style={{
              width: compact ? 16 : 20,
              height: compact ? 16 : 20,
              color: active ? "#2563eb" : "#6b7280",
              transition: `width 400ms ${EASE_SPRING}, height 400ms ${EASE_SPRING}, color 200ms ease`,
              transform: "scale(1)",
            }}
          />

          <span
            className="text-[10px] font-semibold leading-none whitespace-nowrap overflow-hidden"
            style={{
              maxHeight: compact ? 0 : 14,
              opacity: compact ? 0 : 1,
              maxWidth: compact ? 0 : 80,
              marginBottom: compact ? 0 : 1,
              transition: `max-height 250ms ${EASE_SMOOTH}, opacity 200ms ease, max-width 400ms ${EASE_SPRING}, margin 300ms ${EASE_SMOOTH}`,
              color: active ? "#2563eb" : "#6b7280",
            }}
          >
            {item.label}
          </span>
        </div>

        {/* Active indicator */}
        <div
          className="relative z-10 bg-blue-600 rounded-full"
          style={{
            width: active ? (compact ? 8 : 16) : 0,
            height: 2,
            marginTop: 2,
            opacity: active ? 1 : 0,
            transform: active ? "scaleX(1)" : "scaleX(0)",
            transition: `width 400ms ${EASE_SPRING}, opacity 250ms ease, transform 350ms ${EASE_SPRING}`,
          }}
        />
      </Link>
    );
  };

  /* ── Auth button ──────────────────────────────────────────────── */
  const AuthButton = () => {
    if (user) {
      return (
        <>
          {/* Change password — signed-in users, including branch admins */}
          <button
            onClick={() => setPasswordDialogOpen(true)}
            aria-label="Change password"
            className="nav-item group relative flex flex-col items-center rounded-full text-gray-500"
            style={{
              padding: compact ? "6px 10px" : "8px 16px",
              minWidth: compact ? 40 : 64,
              gap: compact ? 0 : 2,
              transition: `padding 400ms ${EASE_SPRING}, min-width 400ms ${EASE_SPRING}`,
            }}
          >
            <div
              className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out"
              style={{ background: "rgba(243,244,246,0.6)" }}
            />
            <KeyRound
              className="relative z-10"
              style={{
                width: compact ? 16 : 20,
                height: compact ? 16 : 20,
                transition: `width 400ms ${EASE_SPRING}, height 400ms ${EASE_SPRING}`,
              }}
            />
            <span
              className="relative z-10 text-[10px] font-semibold leading-none whitespace-nowrap overflow-hidden"
              style={{
                maxHeight: compact ? 0 : 14,
                opacity: compact ? 0 : 1,
                maxWidth: compact ? 0 : 80,
                transition: `max-height 250ms ${EASE_SMOOTH}, opacity 200ms ease, max-width 400ms ${EASE_SPRING}`,
              }}
            >
              Password
            </span>
          </button>
          <ChangePasswordDialog
            open={passwordDialogOpen}
            onOpenChange={setPasswordDialogOpen}
          />
        <button
          onClick={signOut}
          className="nav-item group relative flex flex-col items-center rounded-full text-gray-500"
          style={{
            padding: compact ? "6px 10px" : "8px 16px",
            minWidth: compact ? 40 : 64,
            gap: compact ? 0 : 2,
            transition: `padding 400ms ${EASE_SPRING}, min-width 400ms ${EASE_SPRING}`,
          }}
        >
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out"
            style={{ background: "rgba(243,244,246,0.6)" }}
          />
          <LogOut
            className="relative z-10"
            style={{
              width: compact ? 16 : 20,
              height: compact ? 16 : 20,
              transition: `width 400ms ${EASE_SPRING}, height 400ms ${EASE_SPRING}`,
            }}
          />
          <span
            className="relative z-10 text-[10px] font-semibold leading-none whitespace-nowrap overflow-hidden"
            style={{
              maxHeight: compact ? 0 : 14,
              opacity: compact ? 0 : 1,
              maxWidth: compact ? 0 : 80,
              transition: `max-height 250ms ${EASE_SMOOTH}, opacity 200ms ease, max-width 400ms ${EASE_SPRING}`,
            }}
          >
            Sign Out
          </span>
        </button>
        </>
      );
    }
    const active = isActive("/auth");
    return (
      <Link
        to="/auth"
        className="nav-item group relative flex flex-col items-center rounded-full"
        style={{
          padding: compact ? "6px 10px" : "8px 16px",
          minWidth: compact ? 40 : 64,
          gap: compact ? 0 : 2,
          transition: `padding 400ms ${EASE_SPRING}, min-width 400ms ${EASE_SPRING}`,
          color: active ? "#2563eb" : "#6b7280",
        }}
      >
        <div
          className="absolute inset-0 rounded-full transition-all duration-250 ease-out"
          style={{ background: active ? "rgba(239,246,255,1)" : undefined }}
        />
        <div
          className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out"
          style={{
            background: active ? "rgba(219,234,254,0.5)" : "rgba(243,244,246,0.6)",
          }}
        />
        <User
          className="relative z-10"
          style={{
            width: compact ? 16 : 20,
            height: compact ? 16 : 20,
            transition: `width 400ms ${EASE_SPRING}, height 400ms ${EASE_SPRING}`,
            color: active ? "#2563eb" : "#6b7280",
          }}
        />
        <span
          className="relative z-10 text-[10px] font-semibold leading-none whitespace-nowrap overflow-hidden"
          style={{
            maxHeight: compact ? 0 : 14,
            opacity: compact ? 0 : 1,
            maxWidth: compact ? 0 : 80,
            transition: `max-height 250ms ${EASE_SMOOTH}, opacity 200ms ease, max-width 400ms ${EASE_SPRING}`,
          }}
        >
          Sign In
        </span>
        <div
          className="relative z-10 bg-blue-600 rounded-full"
          style={{
            width: active ? (compact ? 8 : 16) : 0,
            height: 2,
            marginTop: 2,
            opacity: active ? 1 : 0,
            transform: active ? "scaleX(1)" : "scaleX(0)",
            transition: `width 400ms ${EASE_SPRING}, opacity 250ms ease, transform 350ms ${EASE_SPRING}`,
          }}
        />
      </Link>
    );
  };

  /* ── Branch link ──────────────────────────────────────────────── */
  const BranchLink = () => {
    if (!user || !myBranch) return null;
    const active = isActive("/branches/");
    return (
      <>
        <div
          className="bg-gray-200/60"
          style={{
            width: 1,
            height: compact ? 20 : 28,
            margin: compact ? "0 2px" : "0 4px",
            transition: `height 400ms ${EASE_SPRING}, margin 300ms ${EASE_SMOOTH}`,
          }}
        />
        <Link
          to={`/branches/${myBranch.slug}`}
          className="nav-item group relative flex flex-col items-center rounded-full"
          style={{
            padding: compact ? "6px 10px" : "8px 16px",
            minWidth: compact ? 40 : 64,
            gap: compact ? 0 : 2,
            transition: `padding 400ms ${EASE_SPRING}, min-width 400ms ${EASE_SPRING}`,
            color: active ? "#2563eb" : "#6b7280",
          }}
        >
          <div
            className="absolute inset-0 rounded-full transition-all duration-250 ease-out"
            style={{ background: active ? "rgba(239,246,255,1)" : undefined }}
          />
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out"
            style={{
              background: active ? "rgba(219,234,254,0.5)" : "rgba(243,244,246,0.6)",
            }}
          />
          <Building2
            className="relative z-10"
            style={{
              width: compact ? 16 : 20,
              height: compact ? 16 : 20,
              transition: `width 400ms ${EASE_SPRING}, height 400ms ${EASE_SPRING}`,
              color: active ? "#2563eb" : "#6b7280",
            }}
          />
          <span
            className="relative z-10 text-[10px] font-semibold leading-none whitespace-nowrap overflow-hidden"
            style={{
              maxHeight: compact ? 0 : 14,
              opacity: compact ? 0 : 1,
              maxWidth: compact ? 0 : 80,
              transition: `max-height 250ms ${EASE_SMOOTH}, opacity 200ms ease, max-width 400ms ${EASE_SPRING}`,
            }}
          >
            My Branch
          </span>
          <div
            className="relative z-10 bg-blue-600 rounded-full"
            style={{
              width: active ? (compact ? 8 : 16) : 0,
              height: 2,
              marginTop: 2,
              opacity: active ? 1 : 0,
              transform: active ? "scaleX(1)" : "scaleX(0)",
              transition: `width 400ms ${EASE_SPRING}, opacity 250ms ease, transform 350ms ${EASE_SPRING}`,
            }}
          />
        </Link>
      </>
    );
  };

  /* ── Admin link (admins only) ─────────────────────────────────── */
  const AdminLink = () => {
    if (!user || !hasAdminAccess) return null;
    const active = isActive("/admin");
    return (
      <>
        <div
          className="bg-gray-200/60"
          style={{
            width: 1,
            height: compact ? 20 : 28,
            margin: compact ? "0 2px" : "0 4px",
            transition: `height 400ms ${EASE_SPRING}, margin 300ms ${EASE_SMOOTH}`,
          }}
        />
        <Link
          to="/admin"
          className="nav-item group relative flex flex-col items-center rounded-full"
          style={{
            padding: compact ? "6px 10px" : "8px 16px",
            minWidth: compact ? 40 : 64,
            gap: compact ? 0 : 2,
            transition: `padding 400ms ${EASE_SPRING}, min-width 400ms ${EASE_SPRING}`,
            color: active ? "#2563eb" : "#6b7280",
          }}
        >
          <div
            className="absolute inset-0 rounded-full transition-all duration-250 ease-out"
            style={{ background: active ? "rgba(239,246,255,1)" : undefined }}
          />
          <div
            className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out"
            style={{
              background: active ? "rgba(219,234,254,0.5)" : "rgba(243,244,246,0.6)",
            }}
          />
          <Shield
            className="relative z-10"
            style={{
              width: compact ? 16 : 20,
              height: compact ? 16 : 20,
              transition: `width 400ms ${EASE_SPRING}, height 400ms ${EASE_SPRING}`,
              color: active ? "#2563eb" : "#6b7280",
            }}
          />
          <span
            className="relative z-10 text-[10px] font-semibold leading-none whitespace-nowrap overflow-hidden"
            style={{
              maxHeight: compact ? 0 : 14,
              opacity: compact ? 0 : 1,
              maxWidth: compact ? 0 : 80,
              transition: `max-height 250ms ${EASE_SMOOTH}, opacity 200ms ease, max-width 400ms ${EASE_SPRING}`,
              color: active ? "#2563eb" : "#6b7280",
            }}
          >
            Admin
          </span>
          <div
            className="relative z-10 bg-blue-600 rounded-full"
            style={{
              width: active ? (compact ? 8 : 16) : 0,
              height: 2,
              marginTop: 2,
              opacity: active ? 1 : 0,
              transform: active ? "scaleX(1)" : "scaleX(0)",
              transition: `width 400ms ${EASE_SPRING}, opacity 250ms ease, transform 350ms ${EASE_SPRING}`,
            }}
          />
        </Link>
      </>
    );
  };

  // Hide navbar on auth-related pages
  const hideNav = location.pathname === "/auth" || location.pathname === "/reset-password";
  if (hideNav) return null;

  return (
    <>
      {/* ── Desktop: floating pill at top ─────────────────────── */}
      <nav
        className="hidden md:flex fixed top-4 left-1/2 -translate-x-1/2 z-50"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div
          className="relative flex items-center rounded-full overflow-hidden"
          style={{
            ...glassStyle,
            padding: compact ? "6px 6px" : "8px 8px",
            gap: compact ? 2 : 4,
            boxShadow: compact
              ? "0 2px 12px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.03), inset 0 1px 0 0 rgba(255,255,255,0.12)"
              : "0 4px 24px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.04), inset 0 1px 0 0 rgba(255,255,255,0.2), inset 0 -1px 0 0 rgba(255,255,255,0.05)",
            border: `1px solid ${compact ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.4)"}`,
            transition: `padding 400ms ${EASE_SPRING}, gap 300ms ${EASE_SMOOTH}, box-shadow 400ms ${EASE_SMOOTH}, border-color 300ms ease, transform 300ms ${EASE_SPRING}`,
            transform: hovered && shrunk ? "scale(1.03)" : "scale(1)",
          }}
        >
          {/* Edge highlight — top shine */}
          <div
            className="absolute inset-x-0 top-0 h-px rounded-full pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)" }}
          />
          {NAV_ITEMS.map((item) => (
            <NavItemLink key={item.to} item={item} />
          ))}

          <div
            className="bg-gray-200/60"
            style={{
              width: 1,
              height: compact ? 20 : 28,
              margin: compact ? "0 2px" : "0 4px",
              transition: `height 400ms ${EASE_SPRING}, margin 300ms ${EASE_SMOOTH}`,
            }}
          />

          <AuthButton />
          <BranchLink />
          <AdminLink />
        </div>
      </nav>

      {/* ── Mobile: floating pill at bottom ──────────────────── */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px]">
        <div
          className="flex items-center justify-around rounded-full border border-white/40"
          style={{
            ...glassStyle,
            padding: "8px 4px",
            boxShadow: "0 4px 24px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)",
          }}
        >
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className="group relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full overflow-hidden"
                style={{
                  color: active ? "#2563eb" : "#6b7280",
                  transition: "color 200ms ease",
                }}
              >
                <div
                  className="absolute inset-0 rounded-full transition-all duration-200 ease-out"
                  style={{
                    background: active ? "rgba(239,246,255,1)" : undefined,
                  }}
                />
                <div
                  className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-150"
                  style={{
                    background: active ? "rgba(219,234,254,0.5)" : "rgba(243,244,246,0.6)",
                  }}
                />
                <item.icon
                  className="relative z-10 h-5 w-5 transition-all duration-200"
                  style={active ? { fill: "rgba(37,99,235,0.15)", strokeWidth: 2.2 } : undefined}
                />
                <span className="relative z-10 text-[9px] font-semibold leading-none">
                  {item.label}
                </span>
                {active && (
                  <div className="relative z-10 w-4 h-0.5 bg-blue-600 rounded-full mt-0.5" />
                )}
              </Link>
            );
          })}

          {user ? (
            <button
              onClick={signOut}
              className="group relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full text-gray-500 overflow-hidden"
            >
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-150" style={{ background: "rgba(243,244,246,0.6)" }} />
              <LogOut className="relative z-10 h-5 w-5" />
              <span className="relative z-10 text-[9px] font-semibold leading-none">Exit</span>
            </button>
          ) : (
            <Link
              to="/auth"
              className="group relative flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-full overflow-hidden"
              style={{
                color: isActive("/auth") ? "#2563eb" : "#6b7280",
                transition: "color 200ms ease",
              }}
            >
              <div
                className="absolute inset-0 rounded-full transition-all duration-200"
                style={{ background: isActive("/auth") ? "rgba(239,246,255,1)" : undefined }}
              />
              <div
                className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-150"
                style={{
                  background: isActive("/auth") ? "rgba(219,234,254,0.5)" : "rgba(243,244,246,0.6)",
                }}
              />
              <User className="relative z-10 h-5 w-5" />
              <span className="relative z-10 text-[9px] font-semibold leading-none">
                Sign In
              </span>
              {isActive("/auth") && (
                <div className="relative z-10 w-4 h-0.5 bg-blue-600 rounded-full mt-0.5" />
              )}
            </Link>
          )}
        </div>
      </nav>
    </>
  );
};

export { Navbar };
