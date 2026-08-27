import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSiteSettings } from "@/hooks/useContent";
import { Mail, Lock, User, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/* ── Glass input: semi-transparent with border glow on focus ────── */
const GlassInput = ({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) => (
  <Input
    className={cn(
      "pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/40",
      "focus:bg-white/15 focus:border-white/40 focus:ring-white/20",
      "backdrop-blur-sm transition-all duration-200",
      className
    )}
    {...props}
  />
);

const AuthPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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

  /* ── Shared glass card style ───────────────────────────────── */
  const glassCardStyle = {
    background: `rgba(255,255,255,${bgOpacity * 0.12})`,
    backdropFilter: `blur(${blurAmount}px) saturate(180%)`,
    WebkitBackdropFilter: `blur(${blurAmount}px) saturate(180%)`,
    border: "1px solid rgba(255,255,255,0.18)",
    boxShadow: `
      inset 0 1px 0 0 rgba(255,255,255,0.15),
      inset 0 -1px 0 0 rgba(255,255,255,0.05),
      0 8px 32px rgba(0,0,0,0.3),
      0 0 0 1px rgba(255,255,255,0.05)
    `,
  } as const;

  if (showForgotPassword) {
    return (
      <div className="auth-bg min-h-screen flex items-center justify-center p-4">
        {/* Background gradient orbs */}
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />

        {/* Noise texture overlay */}
        <div className="auth-noise" />

        <Card className="w-full max-w-md relative z-10" style={glassCardStyle}>
          <CardHeader>
            <Button
              variant="ghost"
              size="sm"
              className="w-fit mb-2 text-white/70 hover:text-white hover:bg-white/10"
              onClick={() => setShowForgotPassword(false)}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <CardTitle className="text-white">Reset Password</CardTitle>
            <CardDescription className="text-white/60">Enter your email to receive a reset link.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white/80 text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                  <GlassInput
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:border-white/30 transition-all duration-200"
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
      {/* Background gradient orbs */}
      <div className="auth-orb auth-orb-1" />
      <div className="auth-orb auth-orb-2" />
      <div className="auth-orb auth-orb-3" />

      {/* Noise texture overlay */}
      <div className="auth-noise" />

      <Card className="w-full max-w-md relative z-10" style={glassCardStyle}>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-white font-bold tracking-tight">BEHT JAMAA</CardTitle>
          <CardDescription className="text-white/60">Sign in or create an account</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Google button — glass style */}
          <Button
            variant="outline"
            className="w-full mb-6 bg-white/10 hover:bg-white/20 border-white/20 hover:border-white/30 text-white transition-all duration-200"
            onClick={handleGoogleSignIn}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-white/15" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="px-2 text-white/40 bg-transparent">Or continue with email</span>
            </div>
          </div>

          {/* Tabs — glass style */}
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/10 border border-white/15">
              <TabsTrigger
                value="signin"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 transition-all duration-200"
              >
                Sign In
              </TabsTrigger>
              <TabsTrigger
                value="signup"
                className="data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/60 transition-all duration-200"
              >
                Sign Up
              </TabsTrigger>
            </TabsList>

            {/* Sign In */}
            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-white/80 text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <GlassInput
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80 text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <GlassInput
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:border-white/30 transition-all duration-200 font-semibold"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
                <Button
                  type="button"
                  variant="link"
                  className="w-full text-sm text-white/50 hover:text-white/80"
                  onClick={() => setShowForgotPassword(true)}
                >
                  Forgot your password?
                </Button>
              </form>
            </TabsContent>

            {/* Sign Up */}
            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-white/80 text-sm">Display Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <GlassInput
                      type="text"
                      placeholder="Your Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80 text-sm">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <GlassInput
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80 text-sm">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-white/40" />
                    <GlassInput
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-white/15 hover:bg-white/25 text-white border border-white/20 hover:border-white/30 transition-all duration-200 font-semibold"
                  disabled={loading}
                >
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Back to Home */}
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-white/50 hover:text-white/80 hover:bg-white/10"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
