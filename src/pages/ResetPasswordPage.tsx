import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Lock } from "lucide-react";

type LinkStatus = "checking" | "ready" | "invalid";

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<LinkStatus>("checking");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    let settled = false;
    const settle = (next: LinkStatus) => {
      if (cancelled || settled) return;
      settled = true;
      setStatus(next);
    };

    // The client parses a recovery link in the URL hash itself and turns it
    // into a session, so watch the auth events rather than reading the hash
    // (which it removes while parsing).
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || (event === "SIGNED_IN" && session)) {
        settle("ready");
      }
    });

    (async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const tokenHash = params.get("token_hash");

      // PKCE flow: the link carries a one-time code that has to be exchanged
      // for a session before the password can be changed.
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        settle(error ? "invalid" : "ready");
        return;
      }

      // Confirmation links pass token_hash + type instead of a code.
      if (tokenHash && params.get("type") === "recovery") {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery",
        });
        settle(error ? "invalid" : "ready");
        return;
      }

      // No token in the URL: allow a signed-in visitor to change their
      // password, and give the client a moment to finish parsing a hash link
      // before declaring the link unusable.
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        settle("ready");
        return;
      }
      window.setTimeout(() => settle("invalid"), 2500);
    })();

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "ready") return;
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Password updated!", description: "You can now sign in with your new password." });
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen gradient-subtle flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Set New Password</CardTitle>
          <CardDescription>
            {status === "checking" && "Processing your reset link..."}
            {status === "ready" && "Enter your new password below."}
            {status === "invalid" && "This reset link is missing or has expired."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {status === "invalid" ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Reset links expire after a short while and can only be used once. Request a new one
                from the sign-in page and open it on this device.
              </p>
              <Button asChild className="w-full">
                <Link to="/auth">Request a new link</Link>
              </Button>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="new-password" type="password" placeholder="••••••••" className="pl-10" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} disabled={status !== "ready"} />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading || status !== "ready"}>
                {loading ? "Updating..." : status === "checking" ? "Checking link..." : "Update Password"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
