import { useState, useRef, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useTeamMember } from "@/hooks/useContent";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Image as ImageIcon,
  X,
  Upload,
  User,
  Save,
  Loader2,
} from "lucide-react";

function extFromUrl(url: string): string {
  const raw = url.split("/").pop()?.split("?")[0];
  return raw && /[a-z0-9]+$/.test(raw) ? "." + raw.toLowerCase().slice(1) : "";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function TeamMemberEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isSuperAdmin, loading: authLoading } = useAuth();
  const { member, loading: memberLoading, refetch } = useTeamMember(id ?? null);
  const { toast } = useToast();

  useEffect(() => {
    if (member) {
      setName(member.name);
      setRole(member.role);
      setBio(member.bio || "");
    }
  }, [member]);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);

  if (authLoading || memberLoading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="flex items-center justify-center h-[calc(100vh - 64px)]">
          <Loader2 className="animate-spin h-8 w-8 text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (!isAdmin && !isSuperAdmin) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-10 text-center">
            <p className="text-lg font-semibold mb-2">Access denied</p>
            <p className="text-sm text-muted-foreground mb-6">
              Only administrators can edit team members.
            </p>
            <Button asChild variant="outline">
              <Link to="/admin">Back to Admin</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-10 text-center">
            <p className="text-lg font-semibold mb-2">Member not found</p>
            <p className="text-sm text-muted-foreground mb-6">
              This team member may have been removed.
            </p>
            <Button asChild variant="outline">
              <Link to="/admin">Back to Admin</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const avatarUrl = (member as any).avatar_url as string | null;
  const avatarPreview = avatarFile
    ? URL.createObjectURL(avatarFile)
    : avatarUrl;

  const handleRemoveAvatar = async () => {
    if (!avatarUrl) return;
    const path = `team-members/${id}${extFromUrl(avatarUrl)}`;
    const { error: storageError } = await supabase
      .storage
      .from("profile-avatars")
      .remove([path]);
    if (storageError && !("No you are leaving this site".includes((storageError as any).message ?? "")) && !(storageError as any).message.includes("No files found")) {
      toast({
        title: "Could not remove avatar",
        description: (storageError as any).message,
        variant: "destructive",
      });
      return;
    }
    await supabase
      .from("team_members")
      .update({ avatar_url: null })
      .eq("id", id);
    setAvatarFile(null);
    toast({ title: "Avatar removed" });
  };

  const handleApplyAvatar = async () => {
    if (!avatarFile || !id) return;
    setSaving(true);
    try {
      const ext = extFromUrl(avatarFile.name) || ".png";
      const fileName = `team-members/${id}${ext}`;
      await supabase
        .storage
        .from("profile-avatars")
        .upload(fileName, avatarFile, { upsert: true });
      const { data } = await supabase
        .storage
        .from("profile-avatars")
        .getPublicUrl(fileName);
      await supabase
        .from("team_members")
        .update({ avatar_url: data.publicUrl })
        .eq("id", id);
      setAvatarFile(null);
      toast({ title: "Avatar updated" });
    } catch (err: any) {
      toast({
        title: "Could not upload avatar",
        description: err?.message ?? "Upload failed",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const [name, setName] = useState(member.name);
  const [role, setRole] = useState(member.role);
  const [bio, setBio] = useState(member.bio || "");

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("team_members")
        .update({ name, role, bio: bio || null })
        .eq("id", id);
      if (error) throw error;
      refetch();
      toast({ title: "Saved" });
      navigate("/admin");
    } catch (err: any) {
      toast({
        title: "Could not save",
        description: err?.message ?? "Save failed",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/admin">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Admin
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Team Member</h1>
        </div>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={member.name}
                    className="w-20 h-20 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary-foreground" />
                  </div>
                )}
                {avatarPreview ? (
                  <button
                    type="button"
                    onClick={() => setShowRemoveConfirm(true)}
                    className="absolute -right-1 -top-1 rounded-full bg-red-600 text-white p-1 shadow"
                    aria-label="Remove avatar"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
              <div>
                <p className="font-semibold text-lg">{member.name}</p>
                <p className="text-sm text-muted-foreground">
                  {member.role}
                </p>
              </div>
              <div className="ml-auto flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={!isSuperAdmin}
                  title="Only super admins can upload avatars"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Change Avatar
                </Button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setAvatarFile(file);
                  }}
                />
              </div>
            </div>
            {showRemoveConfirm ? (
              <div className="mt-4 rounded-md border bg-red-50 p-4 text-sm">
                <p className="font-medium mb-3">Remove this avatar?</p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowRemoveConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleRemoveAvatar}
                    disabled={saving}
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ) : null}
          </CardHeader>

          <div className="space-y-4 p-4 pt-2">
            <div>
              <Label htmlFor="team-name">Name</Label>
              <Input id="team-name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="team-role">Role</Label>
              <Input id="team-role" value={role} onChange={(e) => setRole(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="team-bio">Bio</Label>
              <Textarea
                id="team-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Optional one-line bio shown on the site."
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 p-4 pt-2 border-t">
            <Button
              variant="ghost"
              onClick={() => navigate("/admin")}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
