import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, User, Save, Heart, CalendarDays, Mail, Camera, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

const MembersPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<Tables<"profiles"> | null>(null);
  const [myPrayers, setMyPrayers] = useState<Tables<"prayer_requests">[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth?returnTo=/members", { replace: true });
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

      supabase
        .from("prayer_requests")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .then(({ data }) => setMyPrayers(data || []));
    }
  }, [user]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid file type", description: "Please upload an image file", variant: "destructive" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Please upload an image under 5MB", variant: "destructive" });
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("profile-avatars")
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("profile-avatars")
        .getPublicUrl(filePath);

      const avatarUrl = urlData.publicUrl;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: avatarUrl })
        .eq("user_id", user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? { ...prev, avatar_url: avatarUrl } : prev);
      toast({ title: "Profile picture updated!" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

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
          <Card className="md:col-span-1 h-fit">
            <CardContent className="pt-6 text-center">
              {/* Profile Picture with Upload */}
              <div className="relative inline-block mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback className="text-2xl bg-blue-100 text-blue-600">
                    {displayName ? displayName[0].toUpperCase() : <User className="h-10 w-10" />}
                  </AvatarFallback>
                </Avatar>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors shadow-md disabled:opacity-50"
                >
                  {uploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
              <h3 className="font-semibold text-lg">{displayName || "Member"}</h3>
              <p className="text-sm text-muted-foreground mb-4 break-all">{user?.email}</p>
              <div className="space-y-2 text-left text-sm text-muted-foreground border-t pt-4">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" /> {user?.email}
                </p>
                <p className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  Joined{" "}
                  {profile?.created_at
                    ? format(new Date(profile.created_at), "MMMM yyyy")
                    : user?.created_at
                      ? format(new Date(user.created_at), "MMMM yyyy")
                      : "recently"}
                </p>
                <p className="flex items-center gap-2">
                  <Heart className="h-4 w-4" /> {myPrayers.length} prayer request{myPrayers.length === 1 ? "" : "s"}
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-2 space-y-6">
            <Card>
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
                  <p className="text-xs text-muted-foreground text-right">{bio.length}/500</p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Profile"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-pink-500" /> My Prayer Requests
                </CardTitle>
              </CardHeader>
              <CardContent>
                {myPrayers.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground mb-3">You haven't submitted any prayer requests yet.</p>
                    <Button variant="outline" size="sm" onClick={() => navigate("/prayer")}>
                      Submit your first request
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myPrayers.map((pr) => (
                      <div key={pr.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm line-clamp-2">{pr.request}</p>
                          <Badge variant="secondary" className="shrink-0">
                            <Heart className="h-3 w-3 mr-1 fill-current" /> {pr.prayed_count || 0}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{format(new Date(pr.created_at), "PPP")}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MembersPage;
