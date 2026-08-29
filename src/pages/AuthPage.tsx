import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useContent";
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Church } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Premium glass input ────── */
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
        "h-12 pl-10 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-white/25",
        "focus:bg-white/[0.1] focus:border-blue-500/40 focus:ring-blue-500/20 focus:ring-1",
        "backdrop-blur-sm transition-all duration-300 rounded-xl",
        Icon ? "pl-10" : "pl-4",
        className
      )}
      {...props}
    />
  </div>
);

/* ── Step indicator matching the screenshot style ────── */
const StepIndicator = ({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) => (
  <div className="flex items-center justify-center gap-0 mb-8">
    {Array.from({ length: totalSteps }, (_, i) => {
      const step = i + 1;
      const isCompleted = step < currentStep;
      const isCurrent = step === currentStep;
      const isFuture = step > currentStep;

      return (
        <div key={i} className="flex items-center">
          {/* Step circle */}
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-500",
                isCompleted && "bg-blue-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.5)]",
                isCurrent && "bg-blue-600 text-white shadow-[0_0_25px_rgba(59,130,246,0.6)] ring-2 ring-blue-400/30 scale-110",
                isFuture && "bg-white/10 text-white/30 border border-white/10"
              )}
            >
              {isCompleted ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                step
              )}
            </div>
            <span className={cn(
              "text-[10px] mt-1.5 font-medium transition-colors duration-300",
              isCurrent ? "text-white" : isCompleted ? "text-blue-400" : "text-white/25"
            )}>
              Step {step}
            </span>
          </div>
          {/* Connector line */}
          {i < totalSteps - 1 && (
            <div className="w-10 sm:w-14 h-[2px] mx-1 mb-5">
              <div className={cn(
                "h-full rounded-full transition-all duration-500",
                step < currentStep ? "bg-blue-500" : "bg-white/10"
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
      <div className="auth-bg min-h-screen flex items-center justify-center p-4">
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />
        <div className="auth-noise" />

        <Card className="w-full max-w-md relative z-10 rounded-3xl" style={glassCardStyle}>
          <CardContent className="p-8">
            <Button
              variant="ghost"
              size="sm"
              className="w-fit mb-6 text-white/50 hover:text-white hover:bg-white/5"
              onClick={() => setShowForgotPassword(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>

            <div className="text-center mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6 text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-1">Reset Password</h2>
              <p className="text-white/40 text-sm">Enter your email to receive a reset link</p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-4">
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
                className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="auth-bg min-h-screen flex items-center justify-center p-4">
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />
      <div className="auth-noise" />

      <Card className="w-full max-w-md relative z-10 rounded-3xl" style={glassCardStyle}>
        <CardContent className="p-8">
          {/* Logo / Brand */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-4">
              <Church className="w-6 h-6 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">BEHT JAMAA</h1>
            <p className="text-white/35 text-sm mt-1">Welcome back to the community</p>
          </div>

          {/* Step indicator */}
          <StepIndicator currentStep={2} totalSteps={4} />

          {/* Google button */}
          <Button
            variant="outline"
            className="w-full h-12 mb-5 bg-white/[0.04] hover:bg-white/[0.08] border-white/[0.08] hover:border-white/[0.15] text-white rounded-xl transition-all duration-300"
            onClick={handleGoogleSignIn}
          >
            <svg className="h-5 w-5 mr-3" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/[0.06]" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 text-white/25 bg-transparent">or continue with email</span>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/[0.04] border border-white/[0.06] rounded-xl p-1">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/20 text-white/40 rounded-lg transition-all duration-300 text-sm font-medium"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-600/20 text-white/40 rounded-lg transition-all duration-300 text-sm font-medium"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Sign In */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-5">
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs font-medium uppercase tracking-wider">Email</Label>
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
                  <Label className="text-white/50 text-xs font-medium uppercase tracking-wider">Password</Label>
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-2"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Continue"}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-white/30 hover:text-white/60"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot your password?
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-5">
                <div className="space-y-1.5">
                  <Label className="text-white/50 text-xs font-medium uppercase tracking-wider">Display Name</Label>
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
                  <Label className="text-white/50 text-xs font-medium uppercase tracking-wider">Email</Label>
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
                  <Label className="text-white/50 text-xs font-medium uppercase tracking-wider">Password</Label>
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
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold text-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-2"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Continue"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Back to Home */}
          <div className="mt-5 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/30 hover:text-white/60 hover:bg-white/5 text-xs"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1.5" /> Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
