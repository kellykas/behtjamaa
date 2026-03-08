import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, User, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

const MembersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => {
          if (data) {
            setProfile(data);
            setDisplayName(data.display_name || "");
            setBio(data.bio || "");
          }
        });
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ display_name: displayName, bio })
      .eq("user_id", user.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!" });
    }
  };

  if (authLoading) return <div className="min-h-screen gradient-subtle flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>

        <h1 className="text-4xl font-bold mb-2">Member Portal</h1>
        <p className="text-muted-foreground mb-8">Manage your profile and access member features</p>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="md:col-span-1">
            <CardContent className="pt-6 text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                  {displayName ? displayName[0].toUpperCase() : <User className="h-10 w-10" />}
                </AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-lg">{displayName || "Member"}</h3>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="member-name">Display Name</Label>
                <Input id="member-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="member-bio">Bio</Label>
                <Textarea id="member-bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={4} maxLength={500} />
              </div>
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? "Saving..." : "Save Profile"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MembersPage;
