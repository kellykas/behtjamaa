import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useContent";
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Church, Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Glass input ────── */
const GlassInput = ({
  className,
  icon: Icon,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { icon?: React.ElementType }) => (
  <div className="relative group">
    {Icon && (
      <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30 group-focus-within:text-blue-400 transition-colors duration-200" />
    )}
    <Input
      className={cn(
        "h-11 pl-10 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25",
        "focus:bg-white/[0.1] focus:border-blue-500/40 focus:ring-blue-500/20 focus:ring-1",
        "backdrop-blur-sm transition-all duration-300 rounded-xl",
        Icon ? "pl-10" : "pl-4",
        className
      )}
      {...props}
    />
  </div>
);

/* ── Step indicator matching reference ────── */
const StepIndicator = ({ step, totalSteps, labels }: { step: number; totalSteps: number; labels: string[] }) => (
  <div className="flex items-center justify-center gap-0 mb-6 px-4">
    {Array.from({ length: totalSteps }, (_, i) => {
      const stepNum = i + 1;
      const isCompleted = stepNum < step;
      const isCurrent = stepNum === step;
      const isFuture = stepNum > step;

      return (
        <div key={i} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500",
                isCompleted && "bg-blue-500 text-white shadow-[0_0_16px_rgba(59,130,246,0.5)]",
                isCurrent && "bg-blue-600 text-white shadow-[0_0_20px_rgba(59,130,246,0.6)] ring-2 ring-blue-400/30 scale-110",
                isFuture && "bg-white/[0.06] text-white/25 border border-white/[0.08]"
              )}
            >
              {isCompleted ? <Check className="w-4 h-4" /> : stepNum}
            </div>
            <span className={cn(
              "text-[9px] mt-1 font-medium transition-colors duration-300 whitespace-nowrap",
              isCurrent ? "text-white" : isCompleted ? "text-blue-400" : "text-white/20"
            )}>
              {labels[i]}
            </span>
          </div>
          {i < totalSteps - 1 && (
            <div className="w-8 sm:w-12 h-[2px] mx-1 mb-4">
              <div className={cn(
                "h-full rounded-full transition-all duration-500",
                stepNum < step ? "bg-blue-500" : "bg-white/[0.06]"
              )} />
            </div>
          )}
        </div>
      );
    })}
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

  const { settings } = useSiteSettings("appearance");
  const glassIntensity = parseInt(settings.glass_intensity || "60", 10);
  const blurAmount = Math.round(glassIntensity * 0.24);
  const bgOpacity = glassIntensity / 100;

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

  /* ── Liquid glass card style ────────────────────────────────── */
  const glassCardStyle = {
    background: `linear-gradient(145deg, rgba(255,255,255,${bgOpacity * 0.08}) 0%, rgba(255,255,255,${bgOpacity * 0.03}) 100%)`,
    backdropFilter: `blur(${Math.max(blurAmount, 30)}px) saturate(180%) brightness(1.1)`,
    WebkitBackdropFilter: `blur(${Math.max(blurAmount, 30)}px) saturate(180%) brightness(1.1)`,
    border: "1px solid rgba(255,255,255,0.12)",
    boxShadow: `
      0 0 0 0.5px rgba(255,255,255,0.05),
      0 8px 32px rgba(0,0,0,0.5),
      0 2px 8px rgba(0,0,0,0.3),
      inset 0 1px 0 0 rgba(255,255,255,0.1),
      inset 0 -1px 0 0 rgba(255,255,255,0.02),
      inset 1px 0 0 0 rgba(255,255,255,0.04),
      inset -1px 0 0 0 rgba(255,255,255,0.04)
    `,
  } as const;

  if (showForgotPassword) {
    return (
      <div className="auth-bg min-h-screen flex flex-col items-center justify-center p-4">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        <div className="auth-noise" />

        <div className="relative z-10 w-full max-w-[400px]">
          <StepIndicator step={2} totalSteps={3} labels={["Account", "Verify", "Done"]} />

          <Card className="rounded-3xl" style={glassCardStyle}>
            <CardContent className="p-6">
              <Button
                variant="ghost"
                size="sm"
                className="w-fit mb-4 text-white/50 hover:text-white hover:bg-white/5 text-xs"
                onClick={() => setShowForgotPassword(false)}
              >
                <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back
              </Button>

              <div className="text-center mb-4">
                <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-2.5">
                  <Lock className="w-5 h-5 text-blue-400" />
                </div>
                <h2 className="text-lg font-bold text-white mb-0.5">Reset Password</h2>
                <p className="text-white/35 text-xs">Enter your email to receive a reset link</p>
              </div>

              <form onSubmit={handleForgotPassword} className="space-y-3">
                <GlassInput
                  icon={Mail}
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <Button
                  type="submit"
                  className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Continue"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-bg min-h-screen flex flex-col items-center justify-center p-4">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />
      <div className="auth-noise" />

      <div className="relative z-10 w-full max-w-[400px]">
        {/* Step indicator */}
        <StepIndicator
          step={authMode === "signin" ? 2 : 2}
          totalSteps={3}
          labels={["Account", "Details", "Done"]}
        />

        <Card className="rounded-3xl" style={glassCardStyle}>
          <CardContent className="p-6">
            {/* Brand */}
            <div className="text-center mb-4">
              <div className="w-11 h-11 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-2.5">
                <Church className="w-5 h-5 text-blue-400" />
              </div>
              <h1 className="text-lg font-bold text-white tracking-tight">BEHT JAMAA</h1>
              <p className="text-white/30 text-[11px] mt-0.5">Welcome back to the community</p>
            </div>

            {/* Google button */}
            <Button
              variant="outline"
              className="w-full h-10 mb-3 bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] hover:border-white/[0.15] text-white rounded-xl transition-all duration-300 text-sm"
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
            <div className="relative mb-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/[0.06]" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-3 text-white/20 bg-transparent">or continue with email</span>
              </div>
            </div>

            {/* Mode toggle - clean pill switcher */}
            <div className="flex bg-white/[0.04] border border-white/[0.06] rounded-xl p-1 mb-4">
              <button
                type="button"
                className={cn(
                  "flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-300",
                  authMode === "signin"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-white/35 hover:text-white/50"
                )}
                onClick={() => setAuthMode("signin")}
              >
                Sign In
              </button>
              <button
                type="button"
                className={cn(
                  "flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-300",
                  authMode === "signup"
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                    : "text-white/35 hover:text-white/50"
                )}
                onClick={() => setAuthMode("signup")}
              >
                Sign Up
              </button>
            </div>

            {/* Forms */}
            {authMode === "signin" ? (
              <form onSubmit={handleSignIn} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-white/40 text-[10px] font-medium uppercase tracking-wider">Email</Label>
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
                  <Label className="text-white/40 text-[10px] font-medium uppercase tracking-wider">Password</Label>
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Continue"}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-[11px] text-white/25 hover:text-white/50 py-0"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot your password?
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-white/40 text-[10px] font-medium uppercase tracking-wider">Display Name</Label>
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
                  <Label className="text-white/40 text-[10px] font-medium uppercase tracking-wider">Email</Label>
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
                  <Label className="text-white/40 text-[10px] font-medium uppercase tracking-wider">Password</Label>
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/40 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-10 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Continue"}
                </Button>
              </form>
            )}

            {/* Back to Home */}
            <div className="mt-3 text-center">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/25 hover:text-white/50 hover:bg-white/5 text-[11px]"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="h-3 w-3 mr-1" /> Back to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AuthPage;
