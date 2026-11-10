import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Mail, Lock, User, ArrowLeft, Eye, EyeOff, Church, ArrowRight, CheckCircle2, Phone } from "lucide-react";
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
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  // Sign-in is the only way in. People who are not members yet send a join
  // request for the branch they choose instead of creating an account.
  const [authMode, setAuthMode] = useState<"signin" | "join">("signin");
  const [branches, setBranches] = useState<{ id: string; name: string; location: string | null }[]>([]);
  const [joinName, setJoinName] = useState("");
  const [joinEmail, setJoinEmail] = useState("");
  const [joinPhone, setJoinPhone] = useState("");
  const [joinBranchId, setJoinBranchId] = useState("");
  const [joinMessage, setJoinMessage] = useState("");
  const [joinSubmitted, setJoinSubmitted] = useState(false);
  const [joinedBranchName, setJoinedBranchName] = useState("");
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

  /**
   * Join requests replace self sign-up: RLS lets anyone submit one, and it
   * lands with the chosen branch's leader and the super admin, who review it
   * in Admin → Members (or the branch portal's Members tab). Approved members
   * get a sign-in created for them by a super admin.
   */
  const handleJoinRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinBranchId) {
      toast({ title: "Choose a branch", description: "Pick the branch you'd love to join.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.from("membership_requests").insert({
      branch_id: joinBranchId,
      full_name: joinName.trim(),
      email: joinEmail.trim().toLowerCase(),
      phone: joinPhone.trim() || null,
      message: joinMessage.trim() || null,
      status: "pending",
    });
    setLoading(false);
    if (error) {
      toast({ title: "Could not send your request", description: error.message, variant: "destructive" });
      return;
    }
    setJoinedBranchName(branches.find((b) => b.id === joinBranchId)?.name || "your chosen branch");
    setJoinSubmitted(true);
    toast({
      title: "Request sent",
      description: "Your join request has been sent to the branch leader and the ministry's super admin.",
    });
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

  // Branches are publicly readable, so the join form can offer every active one.
  useEffect(() => {
    supabase
      .from("branches")
      .select("id, name, location")
      .eq("active", true)
      .order("name")
      .then(({ data }) => setBranches(data || []));
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
                  <Label htmlFor="forgot-email" className="text-slate-600 text-xs font-medium">Email</Label>
                  <GlassInput
                    id="forgot-email"
                    icon={Mail}
                    type="email"
                    autoComplete="email"
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
              {authMode === "signin" ? "Welcome back" : "Join the ministry"}
            </h1>
            <p className="text-slate-500 text-sm">
              {authMode === "signin"
                ? "Sign in to your BEHT JAMAA account"
                : "Send a request to join a BEHT JAMAA branch"}
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
                authMode === "join"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-400 hover:text-slate-600"
              )}
              onClick={() => setAuthMode("join")}
            >
              Join Ministry
            </button>
          </div>

          {/* Forms */}
          {authMode === "signin" ? (
            <form onSubmit={handleSignIn} className="space-y-3.5">
              <div className="space-y-1.5">
                  <Label htmlFor="signin-email" className="text-slate-600 text-xs font-medium">Email</Label>
                  <GlassInput
                    id="signin-email"
                    icon={Mail}
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signin-password" className="text-slate-600 text-xs font-medium">Password</Label>
                  <button
                    type="button"
                    className="text-[11px] text-blue-500 hover:text-blue-600 font-medium rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => setShowForgotPassword(true)}
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <GlassInput
                    id="signin-password"
                    icon={Lock}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    aria-pressed={showPassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
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
          ) : joinSubmitted ? (
            <div className="text-center py-6 space-y-3">
              <CheckCircle2 className="h-14 w-14 mx-auto text-green-500" />
              <h2 className="text-lg font-bold text-slate-900">Request sent!</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                Your request to join <span className="font-semibold text-slate-700">{joinedBranchName}</span> has
                been sent to the branch leader and the ministry's super admin for review. Once approved, your
                leader will share your sign-in details.
              </p>
              <Button
                type="button"
                variant="outline"
                className="rounded-xl"
                onClick={() => {
                  setJoinSubmitted(false);
                  setAuthMode("signin");
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Sign In
              </Button>
            </div>
          ) : (
            <form onSubmit={handleJoinRequest} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label htmlFor="join-name" className="text-slate-600 text-xs font-medium">Full Name</Label>
                <GlassInput
                  id="join-name"
                  icon={User}
                  type="text"
                  autoComplete="name"
                  placeholder="Your full name"
                  value={joinName}
                  onChange={(e) => setJoinName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="join-email" className="text-slate-600 text-xs font-medium">Email</Label>
                <GlassInput
                  id="join-email"
                  icon={Mail}
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={joinEmail}
                  onChange={(e) => setJoinEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="join-phone" className="text-slate-600 text-xs font-medium">Phone (optional)</Label>
                <GlassInput
                  id="join-phone"
                  icon={Phone}
                  type="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+1 (555) 000-0000"
                  value={joinPhone}
                  onChange={(e) => setJoinPhone(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="join-branch" className="text-slate-600 text-xs font-medium">Branch you'd love to join</Label>
                <Select value={joinBranchId} onValueChange={setJoinBranchId}>
                  <SelectTrigger id="join-branch" className="h-12 bg-slate-50 border-slate-200 rounded-xl text-sm focus:border-blue-400 focus:ring-blue-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2">
                    <SelectValue placeholder={branches.length ? "Choose a branch" : "No branches available yet"} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.name}
                        {b.location ? ` — ${b.location}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="join-message" className="text-slate-600 text-xs font-medium">Why would you like to join? (optional)</Label>
                <Textarea
                  id="join-message"
                  placeholder="Tell us a little about yourself..."
                  value={joinMessage}
                  onChange={(e) => setJoinMessage(e.target.value)}
                  rows={3}
                  className="bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-blue-400 focus:ring-blue-100 focus:ring-1 transition-all duration-300 rounded-xl text-sm"
                />
              </div>
              <Button
                type="submit"
                className="w-full h-12 bg-[#111827] hover:bg-[#1f2937] text-white rounded-xl font-semibold text-sm transition-all duration-300"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Join Request"} {!loading && <ArrowRight className="h-4 w-4 ml-1.5" />}
              </Button>
              <p className="text-[11px] text-slate-400 text-center leading-relaxed">
                Your request goes to the branch leader and our super admin. There is no self sign-up — approved
                members receive their sign-in details from their leader.
              </p>
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
