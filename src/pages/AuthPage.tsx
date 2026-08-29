import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useContent";
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Church, Cross, Users, Building2, Calendar, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Glass input ────── */
const GlassInput = ({
  className,
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType }) => (
  <div className="relative group">
    {Icon && (
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors duration-200" />
    )}
    <Input
      className={cn(
        "h-12 pl-10 bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400",
        "focus:bg-white focus:border-blue-400 focus:ring-blue-100 focus:ring-1",
        "transition-all duration-300 rounded-xl text-sm",
        Icon ? "pl-10" : "pl-4",
        className
      )}
      {...props}
    />
  </div>
);

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const { toast } = useToast();

  const linkMembership = async (userId: string, userEmail: string) => {
    const { data: requests } = await supabase
      .from("membership_requests")
      .select("id, branch_id")
      .eq("email", userEmail)
      .eq("status", "approved");
    if (requests && requests.length > 0) {
      for (const req of requests) {
        const { data: existing } = await supabase
          .from("branch_members")
          .select("id")
          .eq("branch_id", req.branch_id)
          .eq("user_id", userId)
          .maybeSingle();
        if (!existing) {
          await supabase.from("branch_members").insert({
            branch_id: req.branch_id,
            user_id: userId,
            role: "member",
            has_login: true,
          });
        }
      }
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      if (data.user) {
        await linkMembership(data.user.id, data.user.email || email);
      }
      toast({ title: "Welcome back!" });
      navigate(returnTo, { replace: true });
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin,
        data: { full_name: displayName },
      },
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      if (data.user) {
        const { data: requests } = await supabase
          .from("membership_requests")
          .select("branch_id, id")
          .eq("email", email)
          .eq("status", "approved");
        if (requests && requests.length > 0) {
          toast({
            title: "Check your email",
            description: "We sent you a confirmation link. Once confirmed, your account will be linked to your branch membership.",
          });
        } else {
          toast({ title: "Check your email", description: "We sent you a confirmation link." });
        }
      } else {
        toast({ title: "Check your email", description: "We sent you a confirmation link." });
      }
    }
  };

  useEffect(() => {
    const checkAndLink = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await linkMembership(user.id, user.email || "");
      }
    };
    checkAndLink();
  }, []);

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast({ title: "Error", description: String(error), variant: "destructive" });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Check your email", description: "We sent you a password reset link." });
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-[880px] bg-white rounded-[2rem] shadow-[0_8px_60px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row min-h-[520px]">
          {/* Left panel — dark branding */}
          <div className="w-full md:w-[420px] bg-[#111827] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden shrink-0">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-20 -left-20 w-60 h-60 bg-blue-500 rounded-full blur-[100px]" />
              <div className="absolute bottom-20 -right-20 w-48 h-48 bg-amber-400 rounded-full blur-[80px]" />
            </div>
            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
                <Church className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Reset Password</h2>
              <p className="text-white/50 text-sm leading-relaxed">Enter your email address and we'll send you a link to reset your password.</p>
            </div>
            <div className="relative z-10 flex items-center gap-6 mt-8">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">24/7</p>
                <p className="text-white/40 text-[11px]">Support</p>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">100%</p>
                <p className="text-white/40 text-[11px]">Secure</p>
              </div>
            </div>
          </div>

          {/* Right panel — form */}
          <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="w-fit mb-6 text-slate-400 hover:text-slate-700 hover:bg-slate-100 text-xs"
              onClick={() => setShowForgotPassword(false)}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to sign in
            </Button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">Forgot your password?</h3>
            <p className="text-slate-500 text-sm mb-6">No worries, we'll send you reset instructions.</p>

            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-xs font-medium">Email</Label>
                <GlassInput
                  icon={Mail}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-[#111827] hover:bg-[#1f2937] text-white rounded-xl font-semibold text-sm transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[880px] bg-white rounded-[2rem] shadow-[0_8px_60px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row min-h-[560px]">
        {/* Left panel — dark branding with stats */}
        <div className="w-full md:w-[420px] bg-[#111827] p-8 md:p-10 flex flex-col justify-between relative overflow-hidden shrink-0">
          {/* Ambient glow */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 -left-20 w-60 h-60 bg-blue-500 rounded-full blur-[100px]" />
            <div className="absolute bottom-20 -right-20 w-48 h-48 bg-amber-400 rounded-full blur-[80px]" />
          </div>

          <div className="relative z-10">
            {/* Brand icon */}
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8">
              <Church className="w-7 h-7 text-white" />
            </div>

            {/* Headline */}
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 leading-tight">
              BEHT JAMAA
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-2">
              Boyz Evangelists of the Holy Trinity
            </p>
            <p className="text-white/35 text-xs leading-relaxed">
              Winning souls for the Glory of our Lord Jesus Christ through Arts, empowering youths for discipleship, ministry and service.
            </p>
          </div>

          {/* Stats row */}
          <div className="relative z-10 flex items-center gap-5 mt-10">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Building2 className="w-3.5 h-3.5 text-blue-400" />
                <p className="text-2xl font-bold text-white">12+</p>
              </div>
              <p className="text-white/40 text-[11px]">Branches</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <p className="text-2xl font-bold text-white">25K+</p>
              </div>
              <p className="text-white/40 text-[11px]">Members</p>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <p className="text-2xl font-bold text-white">100+</p>
              </div>
              <p className="text-white/40 text-[11px]">Events</p>
            </div>
          </div>
        </div>

        {/* Right panel — form */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          {/* Brand header */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-bold text-slate-900 mb-1">
              {authMode === "signin" ? "Welcome back" : "Create account"}
            </h1>
            <p className="text-slate-500 text-sm">
              {authMode === "signin" ? "Sign in to your BEHT JAMAA account" : "Join the BEHT JAMAA community"}
            </p>
          </div>

          {/* Mode toggle — clean pill switcher */}
          <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
            <button
              type="button"
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                authMode === "signin"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              )}
              onClick={() => setAuthMode("signin")}
            >
              Sign In
            </button>
            <button
              type="button"
              className={cn(
                "flex-1 py-2.5 rounded-lg text-sm font-medium transition-all duration-300",
                authMode === "signup"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              )}
              onClick={() => setAuthMode("signup")}
            >
              Sign Up
            </button>
          </div>

          {/* Google button */}
          <Button
            variant="outline"
            className="w-full h-12 mb-4 bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl transition-all duration-300 text-sm font-medium"
            onClick={handleGoogleSignIn}
          >
            <svg className="h-4 w-4 mr-2.5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative mb-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-[11px]">
              <span className="px-3 text-slate-400 bg-white">or continue with email</span>
            </div>
          </div>

          {/* Forms */}
          {authMode === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-xs font-medium">Email</Label>
                <GlassInput
                  icon={Mail}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-slate-600 text-xs font-medium">Password</Label>
                  <button
                    type="button"
                    className="text-[11px] text-blue-500 hover:text-blue-600 font-medium"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <GlassInput
                    icon={Lock}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-[#111827] hover:bg-[#1f2937] text-white rounded-xl font-semibold text-sm transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Signing in..." : "Continue"} {!loading && <ArrowRight className="h-4 w-4 ml-1.5" />}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-xs font-medium">Display Name</Label>
                <GlassInput
                  icon={User}
                  type="text"
                  placeholder="Your full name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-xs font-medium">Email</Label>
                <GlassInput
                  icon={Mail}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-slate-600 text-xs font-medium">Password</Label>
                <div className="relative">
                  <GlassInput
                    icon={Lock}
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-[#111827] hover:bg-[#1f2937] text-white rounded-xl font-semibold text-sm transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Continue"} {!loading && <ArrowRight className="h-4 w-4 ml-1.5" />}
              </Button>
            </form>
          )}

          {/* Back to Home */}
          <div className="mt-5 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-xs"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-3 w-3 mr-1" /> Back to Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
