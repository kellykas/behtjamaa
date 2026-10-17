import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useContent";
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Church, Cross, ArrowRight } from "lucide-react";
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

  /**
   * Give a brand-new account the branch membership it was approved for. The
   * matching approved request is linked to this account by a database trigger,
   * which is what keeps the branch roster from listing the person twice.
   */
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
        <div className="w-full max-w-[880px] bg-white rounded-[2rem] shadow-[0_8px_60px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row">
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
      <div className="w-full max-w-[880px] bg-white rounded-[2rem] shadow-[0_8px_60px_rgba(0,0,0,0.08)] overflow-hidden flex flex-col md:flex-row">
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

          {/* Stats row removed */}
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
