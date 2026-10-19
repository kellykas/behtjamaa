import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { callAdminUsersApi, generatePassword } from "@/lib/adminUsers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Edit, Music, Heart, Calendar, Users, Shield, Search, Sparkles, Save, Building2, KeyRound, UserCog, UserPlus, Link2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { PERMISSIONS, permissionLabel } from "@/lib/permissions";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";
import { Briefcase } from "lucide-react";
import { useTeamFounders } from "@/hooks/useContent";
import BranchMembersPanel from "@/components/BranchMembersPanel";
import { ImageUpload } from "@/components/ImageUpload";

const AdminPage = () => {
  const { user, isAdmin, isSuperAdmin, isBranchAdmin, can, managesBranch, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [episodes, setEpisodes] = useState<Tables<"episodes">[]>([]);
  const [prayers, setPrayers] = useState<Tables<"prayer_requests">[]>([]);
  const [events, setEvents] = useState<Tables<"live_events">[]>([]);
  const [profiles, setProfiles] = useState<Tables<"profiles">[]>([]);
  const [resetByProfileId, setResetByProfileId] = useState<string | null>(null);
  const [baCreatingAuthForId, setBaCreatingAuthForId] = useState<string | null>(null);
  // Branch admin whose "create sign-in account" dialog is open, plus its password field.
  const [baAuthForId, setBaAuthForId] = useState<string | null>(null);
  const [baAuthPassword, setBaAuthPassword] = useState("");
  const [roleMap, setRoleMap] = useState<Record<string, string>>({});
  const [epSearch, setEpSearch] = useState("");

  // CMS content
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [services, setServicesList] = useState<any[]>([]);
  const { founders, refetch: refetchFounders } = useTeamFounders({ fallback: false });
  const [tmDialogOpen, setTmDialogOpen] = useState(false);
  const [editingTmId, setEditingTmId] = useState<string | null>(null);
  const [tmName, setTmName] = useState("");
  const [tmRole, setTmRole] = useState("");
  const [tmBio, setTmBio] = useState("");
  const [tmAvatar, setTmAvatar] = useState("");
  // Founders keep their own state: they carry a subtitle plus a bio, which the
  // team-member fields above cannot represent.
  const [founderDialogOpen, setFounderDialogOpen] = useState(false);
  const [editingFounderId, setEditingFounderId] = useState<string | null>(null);
  const [founderName, setFounderName] = useState("");
  const [founderRole, setFounderRole] = useState("");
  const [founderSubtitle, setFounderSubtitle] = useState("");
  const [founderBio, setFounderBio] = useState("");
  const [founderAvatar, setFounderAvatar] = useState("");
  const [svDialogOpen, setSvDialogOpen] = useState(false);
  const [editingSvId, setEditingSvId] = useState<string | null>(null);
  const [svTitle, setSvTitle] = useState("");
  const [svDesc, setSvDesc] = useState("");
  const [svIcon, setSvIcon] = useState("");
  const [svVerse, setSvVerse] = useState("");

  // Branch admins (super-admin managed scoped sign-ons)
  const [branchAdmins, setBranchAdmins] = useState<any[]>([]);
  const [baDialogOpen, setBaDialogOpen] = useState(false);
  const [editingBaId, setEditingBaId] = useState<string | null>(null);
  const [baName, setBaName] = useState("");
  const [baEmail, setBaEmail] = useState("");
  const [baBranchIds, setBaBranchIds] = useState<string[]>([]);
  const [baPermissions, setBaPermissions] = useState<string[]>([]);
  const [baActive, setBaActive] = useState(true);
  const [baPassword, setBaPassword] = useState("");

  // Branch management
  const [branchesList, setBranchesList] = useState<Tables<"branches">[]>([]);
  const [branchDialogOpen, setBranchDialogOpen] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const [brName, setBrName] = useState("");
  const [brSlug, setBrSlug] = useState("");
  const [brLocation, setBrLocation] = useState("");
  const [brDesc, setBrDesc] = useState("");
  const [brLeader, setBrLeader] = useState("");
  const [brEmail, setBrEmail] = useState("");
  const [brPhone, setBrPhone] = useState("");
  const [brLogo, setBrLogo] = useState("");
  const [brBanner, setBrBanner] = useState("");
  const [brActive, setBrActive] = useState(true);
  const [brIsGrouping, setBrIsGrouping] = useState(false);
  const [brStateCode, setBrStateCode] = useState("");
  const [brParentId, setBrParentId] = useState("");
  const [brLeaderUserId, setBrLeaderUserId] = useState<string>("");

  // Episode form
  const [epTitle, setEpTitle] = useState("");
  const [epDesc, setEpDesc] = useState("");
  const [epAudioUrl, setEpAudioUrl] = useState("");
  const [epThumbnailUrl, setEpThumbnailUrl] = useState("");
  const [epCategory, setEpCategory] = useState("sermon");
  const [epPublished, setEpPublished] = useState(false);
  const [epFeatured, setEpFeatured] = useState(false);
  const [epDialogOpen, setEpDialogOpen] = useState(false);
  const [editingEpId, setEditingEpId] = useState<string | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [uploadingHeroImage, setUploadingHeroImage] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);

  // Event form
  const [evTitle, setEvTitle] = useState("");
  const [evDesc, setEvDesc] = useState("");
  const [evStreamUrl, setEvStreamUrl] = useState("");
  const [evScheduledAt, setEvScheduledAt] = useState("");
  const [evIsLive, setEvIsLive] = useState(false);  const [evDialogOpen, setEvDialogOpen] = useState(false);
  const [editingEvId, setEditingEvId] = useState<string | null>(null);

  const fetchAll = async () => {
    const [ep, pr, ev, prof, ss, tm, sv] = await Promise.all([
      supabase.from("episodes").select("*").order("created_at", { ascending: false }),
      supabase.from("prayer_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("live_events").select("*").order("scheduled_at", { ascending: true }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("site_settings").select("*"),
      supabase.from("team_members").select("*").order("sort_order"),
      supabase.from("services").select("*").order("sort_order"),
    ]);
    setEpisodes(ep.data || []);
    setPrayers(pr.data || []);
    setEvents(ev.data || []);
    setProfiles(prof.data || []);
    if (ss.data) {
      const map: Record<string, string> = {};
      ss.data.forEach((s) => { map[s.key] = s.value || ""; });
      setSiteSettings(map);
    }
    setTeamMembers(tm.data || []);
    setServicesList(sv.data || []);

    const { data: br } = await supabase.from("branches").select("*").order("created_at", { ascending: false });
    setBranchesList(br || []);

    const { data: roles } = await supabase.from("user_roles").select("*");
    if (roles) {
      const map: Record<string, string> = {};
      roles.forEach((r) => {
        map[r.user_id] = r.role;
      });
      setRoleMap(map);
    }

    // Branch admins are only readable by super admins (RLS enforces this too)
    const { data: ba } = await supabase.from("branch_admins").select("*").order("created_at", { ascending: false });
    setBranchAdmins(ba || []);
  };

  useEffect(() => {
    if (isAdmin || isBranchAdmin) fetchAll();
  }, [isAdmin, isBranchAdmin]);

  if (authLoading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Sign In Required</h1>
            <p className="text-muted-foreground mb-6">You need to sign in to access the admin panel.</p>
            <Button onClick={() => navigate("/auth?returnTo=/admin")}>Sign In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdmin && !isBranchAdmin) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-destructive" />
            <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
            <p className="text-muted-foreground mb-2">You do not have admin privileges.</p>
            <p className="text-xs text-muted-foreground mb-1">Signed in as: {user.email}</p>
            <p className="text-xs text-muted-foreground mb-6">User ID: {user.id}</p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const resetEpForm = () => { setEpTitle(""); setEpDesc(""); setEpAudioUrl(""); setEpThumbnailUrl(""); setEpCategory("sermon"); setEpPublished(false); setEpFeatured(false); setEditingEpId(null); setAudioProgress(0); };
  const resetEvForm = () => { setEvTitle(""); setEvDesc(""); setEvStreamUrl(""); setEvScheduledAt(""); setEvIsLive(false); setEditingEvId(null); };

  const resetTmForm = () => { setTmName(""); setTmRole(""); setTmBio(""); setTmAvatar(""); setEditingTmId(null); };
  const resetFounderForm = () => { setFounderName(""); setFounderRole(""); setFounderSubtitle(""); setFounderBio(""); setFounderAvatar(""); setEditingFounderId(null); };

  const handleSaveFounder = async () => {
    if (!founderName.trim() || !founderRole.trim()) {
      toast({ title: "Name and role are required", variant: "destructive" });
      return;
    }
    const payload: any = {
      name: founderName.trim(),
      role: founderRole.trim(),
      subtitle: founderSubtitle.trim() || null,
      bio: founderBio.trim() || null,
      avatar_url: founderAvatar.trim() || null,
    };
    if (editingFounderId) {
      const { error } = await supabase.from("team_founders" as any).update(payload).eq("id", editingFounderId);
      if (error) {
        toast({ title: "Could not update founder", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      const { data }: any = await supabase.from("team_founders" as any).select("sort_order").order("sort_order", { ascending: false }).limit(1);
      const { error } = await supabase.from("team_founders" as any).insert({ ...payload, sort_order: (data?.[0]?.sort_order || 0) + 1 });
      if (error) {
        toast({ title: "Could not add founder", description: error.message, variant: "destructive" });
        return;
      }
    }
    setFounderDialogOpen(false);
    resetFounderForm();
    refetchFounders();
    toast({ title: editingFounderId ? "Founder updated" : "Founder added" });
  };

  const handleDeleteFounder = async (id: string) => {
    const { error } = await supabase.from("team_founders" as any).delete().eq("id", id);
    if (error) {
      toast({ title: "Could not remove founder", description: error.message, variant: "destructive" });
      return;
    }
    refetchFounders();
    toast({ title: "Founder removed" });
  };

  const handleEditFounder = (f: any) => {
    setEditingFounderId(f.id);
    setFounderName(f.name);
    setFounderRole(f.role);
    setFounderSubtitle(f.subtitle || "");
    setFounderBio(f.bio || "");
    setFounderAvatar(f.avatar_url || "");
    setFounderDialogOpen(true);
  };
  const resetSvForm = () => { setSvTitle(""); setSvDesc(""); setSvIcon(""); setSvVerse(""); setEditingSvId(null); };
  const resetBrForm = () => { setBrName(""); setBrSlug(""); setBrLocation(""); setBrDesc(""); setBrLeader(""); setBrEmail(""); setBrPhone(""); setBrLogo(""); setBrBanner(""); setBrActive(true); setBrLeaderUserId(""); setBrIsGrouping(false); setBrStateCode(""); setBrParentId(""); setEditingBranchId(null); };

  // ── Scoped access (branch admins see only their branches + granted areas) ──
  const visibleBranches = isAdmin ? branchesList : branchesList.filter((b) => managesBranch(b.id));
  const tabPermissions = ["events", "prayers", "members", "content", "team", "services", "branches"] as const;
  const defaultTab = tabPermissions.find((p) => can(p)) ?? (isSuperAdmin ? "branchAdmins" : "branches");
  const hasAnyPermission = PERMISSIONS.some((p) => can(p.key));

  if (!isSuperAdmin && !hasAnyPermission) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 text-center">
            <Shield className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">No permissions yet</h1>
            <p className="text-muted-foreground mb-6">
              You are a branch admin, but a Super Admin has not granted you anything to modify yet.
            </p>
            <Button onClick={() => navigate("/")}>Back to Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ── Branch admin sign-ons (super admin only) ──
  const resetBaForm = () => {
    setBaName(""); setBaEmail(""); setBaBranchIds([]); setBaPermissions([]); setBaActive(true); setEditingBaId(null); setBaPassword("");
  };

  const handleSaveBranchAdmin = async () => {
    if (!baName.trim() || !baEmail.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" });
      return;
    }

    if (!editingBaId) {
      // Sign-ons are created immediately: the super admin sets the password now,
      // so there is no invite email to wait for.
      const email = baEmail.trim().toLowerCase();
      const typedPassword = baPassword.trim();
      if (typedPassword && typedPassword.length < 8) {
        toast({ title: "Password too short", description: "Use at least 8 characters, or leave it empty to generate one.", variant: "destructive" });
        return;
      }
      const password = typedPassword || generatePassword();

      const payload: any = {
        full_name: baName.trim(),
        email,
        branch_ids: baBranchIds,
        permissions: baPermissions,
        is_active: baActive,
        created_by: user?.id ?? null,
      };

      const { data: inserted, error: insertError } = await supabase
        .from("branch_admins")
        .insert({ ...payload, temp_password: null })
        .select("id")
        .single();
      if (insertError || !inserted) {
        toast({ title: "Could not create the branch admin", description: insertError?.message, variant: "destructive" });
        return;
      }

      const accountResult = await callAdminUsersApi({ action: "create", email, password });

      if (accountResult.error) {
        toast({
          title: "Branch admin saved, sign-in missing",
          description: `The branch admin record exists, but the sign-in was not created: ${accountResult.error} Fix the cause, then press "Create account" on their card.`,
          variant: "destructive",
        });
        setBaDialogOpen(false);
        resetBaForm();
        fetchAll();
        return;
      }

      if (accountResult.userId) {
        const { error: linkError } = await supabase
          .from("branch_admins")
          .update({ user_id: accountResult.userId })
          .eq("id", inserted.id);
        if (linkError) {
          console.warn("Failed to link branch_admins row to auth account:", linkError);
        }
      }

      setBaDialogOpen(false);
      resetBaForm();
      fetchAll();
      toast({
        title: "Account created",
        description: `${email} can sign in now with the password: ${password}. Share it securely and ask them to change it after signing in.`,
      });
      return;
    }

    // Editing an existing entry: scope, permissions and active state only. The
    // sign-in itself is created here or from the card's "Create account" button.
    const payload: any = {
      full_name: baName.trim(),
      email: baEmail.trim().toLowerCase(),
      branch_ids: baBranchIds,
      permissions: baPermissions,
      is_active: baActive,
    };
    const { error } = await supabase.from("branch_admins").update(payload).eq("id", editingBaId);
    if (error) {
      toast({ title: "Could not save branch admin", description: error.message, variant: "destructive" });
      return;
    }
    setBaDialogOpen(false);
    resetBaForm();
    fetchAll();
    toast({ title: "Branch admin updated" });
  };

  const handleDeleteBranchAdmin = async (id: string) => {
    const { error } = await supabase.from("branch_admins").delete().eq("id", id);
    if (error) {
      toast({ title: "Could not delete", description: error.message, variant: "destructive" });
      return;
    }
    fetchAll();
    toast({ title: "Branch admin removed" });
  };

  const handleEditBranchAdmin = (ba: any) => {
    setEditingBaId(ba.id);
    setBaName(ba.full_name || "");
    setBaEmail(ba.email || "");
    setBaBranchIds(ba.branch_ids || []);
    setBaPermissions(ba.permissions || []);
    setBaActive(ba.is_active !== false);
    setBaPassword("");
    setBaDialogOpen(true);
  };

  const toggleBaBranch = (id: string, on: boolean) =>
    setBaBranchIds((prev) => (on ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));

  const toggleBaPermission = (key: string, on: boolean) =>
    setBaPermissions((prev) => (on ? [...new Set([...prev, key])] : prev.filter((x) => x !== key)));

  const handleSaveSetting = async (key: string, value: string) => {
    await supabase.from("site_settings").upsert({ key, value }, { onConflict: "key" });
    setSiteSettings((prev) => ({ ...prev, [key]: value }));
    toast({ title: "Setting saved" });
  };

  const handleSaveTeamMember = async () => {
    const payload = { name: tmName, role: tmRole, bio: tmBio || null, avatar_url: tmAvatar || null };
    if (editingTmId) {
      await supabase.from("team_members").update(payload).eq("id", editingTmId);
    } else {
      const { data } = await supabase.from("team_members").select("sort_order").order("sort_order", { ascending: false }).limit(1);
      await supabase.from("team_members").insert({ ...payload, sort_order: (data?.[0]?.sort_order || 0) + 1 });
    }
    setTmDialogOpen(false);
    resetTmForm();
    fetchAll();
    toast({ title: editingTmId ? "Team member updated" : "Team member added" });
  };

  const handleDeleteTeamMember = async (id: string) => {
    await supabase.from("team_members").delete().eq("id", id);
    fetchAll();
    toast({ title: "Team member removed" });
  };

  const handleEditTeamMember = (tm: any) => {
    setEditingTmId(tm.id);
    setTmName(tm.name);
    setTmRole(tm.role);
    setTmBio(tm.bio || "");
    setTmAvatar(tm.avatar_url || "");
    setTmDialogOpen(true);
  };

  const handleSaveService = async () => {
    const payload = { title: svTitle, description: svDesc || null, icon: svIcon || null, bible_verse: svVerse || null };
    if (editingSvId) {
      await supabase.from("services").update(payload).eq("id", editingSvId);
    } else {
      const { data } = await supabase.from("services").select("sort_order").order("sort_order", { ascending: false }).limit(1);
      await supabase.from("services").insert({ ...payload, sort_order: (data?.[0]?.sort_order || 0) + 1 });
    }
    setSvDialogOpen(false);
    resetSvForm();
    fetchAll();
    toast({ title: editingSvId ? "Service updated" : "Service added" });
  };

  const handleDeleteService = async (id: string) => {
    await supabase.from("services").delete().eq("id", id);
    fetchAll();
    toast({ title: "Service removed" });
  };

  const handleEditService = (sv: any) => {
    setEditingSvId(sv.id);
    setSvTitle(sv.title);
    setSvDesc(sv.description || "");
    setSvIcon(sv.icon || "");
    setSvVerse(sv.bible_verse || "");
    setSvDialogOpen(true);
  };

  const uploadFile = async (file: File, bucket: "episode-audio" | "episode-thumbnails") => {
    const ext = file.name.split(".").pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, file, { cacheControl: "3600", upsert: false });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 100 * 1024 * 1024) {
      toast({ title: "File too large", description: "Audio must be under 100MB.", variant: "destructive" });
      return;
    }
    setUploadingAudio(true);
    setAudioProgress(10);
    const progressInterval = setInterval(() => setAudioProgress((p) => Math.min(p + 10, 90)), 300);
    try {
      const url = await uploadFile(file, "episode-audio");
      setAudioProgress(100);
      setEpAudioUrl(url);
      toast({ title: "Audio uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      clearInterval(progressInterval);
      setUploadingAudio(false);
      setTimeout(() => setAudioProgress(0), 1000);
    }
  };

  const handleHeroImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be under 10MB.", variant: "destructive" });
      return;
    }
    setUploadingHeroImage(true);
    try {
      const ext = file.name.split(".").pop();
      const fileName = `hero-${Date.now()}.${ext}`;
      toast({ title: "Uploading image..." });
      const { error: uploadError } = await supabase.storage.from("profile-avatars").upload(fileName, file, { cacheControl: "3600", upsert: true });
      if (uploadError) {
        toast({ title: "Storage upload failed", description: uploadError.message, variant: "destructive" });
        throw uploadError;
      }
      const { data: urlData } = supabase.storage.from("profile-avatars").getPublicUrl(fileName);
      if (!urlData?.publicUrl) {
        toast({ title: "Failed to get image URL", variant: "destructive" });
        return;
      }
      const { error: saveError } = await supabase.from("site_settings").upsert({ key: "hero_image_url", value: urlData.publicUrl }, { onConflict: "key" });
      if (saveError) {
        toast({ title: "Failed to save setting", description: saveError.message, variant: "destructive" });
        throw saveError;
      }
      setSiteSettings((prev) => ({ ...prev, hero_image_url: urlData.publicUrl }));
      toast({ title: "Hero image uploaded successfully" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message || "Unknown error", variant: "destructive" });
    } finally {
      setUploadingHeroImage(false);
    }
  };

  const handleSaveEpisode = async () => {
    const payload = { title: epTitle, description: epDesc, audio_url: epAudioUrl || null, thumbnail_url: epThumbnailUrl || null, category: epCategory, published: epPublished, featured: epFeatured, published_at: epPublished ? new Date().toISOString() : null };
    if (editingEpId) {
      await supabase.from("episodes").update(payload).eq("id", editingEpId);
    } else {
      await supabase.from("episodes").insert(payload);
    }
    setEpDialogOpen(false);
    resetEpForm();
    fetchAll();
    toast({ title: editingEpId ? "Episode updated" : "Episode created" });
  };

  const handleDeleteEpisode = async (id: string) => {
    await supabase.from("episodes").delete().eq("id", id);
    fetchAll();
    toast({ title: "Episode deleted" });
  };

  const handleEditEpisode = (ep: Tables<"episodes">) => {
    setEditingEpId(ep.id);
    setEpTitle(ep.title);
    setEpDesc(ep.description || "");
    setEpAudioUrl(ep.audio_url || "");
    setEpThumbnailUrl(ep.thumbnail_url || "");
    setEpCategory(ep.category || "sermon");
    setEpPublished(ep.published || false);
    setEpFeatured(ep.featured || false);
    setEpDialogOpen(true);
  };

  const handleSaveEvent = async () => {
    const payload = { title: evTitle, description: evDesc, stream_url: evStreamUrl || null, scheduled_at: evScheduledAt, is_live: evIsLive };
    if (editingEvId) {
      await supabase.from("live_events").update(payload).eq("id", editingEvId);
    } else {
      await supabase.from("live_events").insert(payload);
    }
    setEvDialogOpen(false);
    resetEvForm();
    fetchAll();
    toast({ title: editingEvId ? "Event updated" : "Event created" });
  };

  const handleDeleteEvent = async (id: string) => {
    await supabase.from("live_events").delete().eq("id", id);
    fetchAll();
    toast({ title: "Event deleted" });
  };

  const handleSaveBranch = async () => {
    if (!brName.trim()) {
      toast({ title: "Name is required", variant: "destructive" });
      return;
    }
    const slug = brSlug || brName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    // Portal access and the grouping columns are super-admin only: a branch
    // admin's save must not send them, or the database guard rejects the update.
    const payload: any = {
      name: brName.trim(),
      slug,
      location: brLocation || null,
      description: brDesc || null,
      leader_name: brLeader || null,
      leader_email: brEmail || null,
      phone: brPhone || null,
      logo_url: brLogo || null,
      banner_url: brBanner || null,
      active: brActive,
    };
    if (isSuperAdmin) {
      Object.assign(payload, {
        leader_user_id: brLeaderUserId || null,
        is_state_branch: brIsGrouping,
        state_code: brIsGrouping ? (brStateCode.trim().toUpperCase() || null) : null,
        parent_id: brIsGrouping || !brParentId ? null : brParentId,
      });
    }

    const { error } = editingBranchId
      ? await supabase.from("branches").update(payload).eq("id", editingBranchId)
      : await supabase.from("branches").insert(payload);

    if (error) {
      toast({
        title: "Could not save branch",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setBranchDialogOpen(false);
    resetBrForm();
    fetchAll();
    toast({ title: editingBranchId ? "Branch updated" : "Branch created" });
  };

  const handleDeleteBranch = async (id: string) => {
    await supabase.from("branches").delete().eq("id", id);
    fetchAll();
    toast({ title: "Branch deleted" });
  };

  const handleEditBranch = (br: Tables<"branches">) => {
    setEditingBranchId(br.id);
    setBrName(br.name);
    setBrSlug(br.slug);
    setBrLocation(br.location || "");
    setBrDesc(br.description || "");
    setBrLeader(br.leader_name || "");
    setBrLeaderUserId(br.leader_user_id || "");
    setBrEmail(br.leader_email || "");
    setBrPhone(br.phone || "");
    setBrLogo(br.logo_url || "");
    setBrBanner(br.banner_url || "");
    setBrActive(br.active !== false);
    setBrIsGrouping(Boolean((br as any).is_state_branch));
    setBrStateCode(((br as any).state_code as string) || "");
    setBrParentId(((br as any).parent_id as string) || "");
    setBranchDialogOpen(true);
  };

  const handleEditEvent = (ev: Tables<"live_events">) => {
    setEditingEvId(ev.id);
    setEvTitle(ev.title);
    setEvDesc(ev.description || "");
    setEvStreamUrl(ev.stream_url || "");
    setEvScheduledAt(ev.scheduled_at);
    setEvIsLive(ev.is_live || false);
    setEvDialogOpen(true);
  };

  const handleDeletePrayer = async (id: string) => {
    await supabase.from("prayer_requests").delete().eq("id", id);
    fetchAll();
    toast({ title: "Prayer request deleted" });
  };

  const handlePrayerStatus = async (id: string, status: string) => {
    await supabase.from("prayer_requests").update({ status }).eq("id", id);
    fetchAll();
    toast({ title: `Marked as ${status}` });
  };

  const handleSetRole = async (userId: string, role: string) => {
    if (!role || role === "user") {
      // Revoke special roles back to default 'user'
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId);
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
    } else {
      const { data: existing } = await supabase.from("user_roles").select("id").eq("user_id", userId).maybeSingle();
      const { error } = existing
        ? await supabase.from("user_roles").update({ role: role as "admin" | "moderator" }).eq("id", existing.id)
        : await supabase.from("user_roles").insert({ user_id: userId, role: role as "admin" | "moderator" });
      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
        return;
      }
    }
    setRoleMap((prev) => ({ ...prev, [userId]: role }));
    toast({ title: `Role updated to ${role}` });
  };

  /**
   * Generate a fresh password for a member's sign-in and show it once.
   * `profiles.id` is not the auth user id (it has its own uuid), so the auth
   * user is resolved through `user_id` before handing it to the account
   * service — otherwise the reset targets a user that does not exist.
   */
  const handleResetMemberPassword = async (profileId: string) => {
    setResetByProfileId(profileId);
    try {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("display_name, user_id")
        .eq("id", profileId)
        .single();

      if (profileError || !profile?.user_id) {
        toast({ title: "Could not find account", description: "No sign-in account is attached to this profile.", variant: "destructive" });
        return;
      }

      const password = generatePassword();
      const resetResult = await callAdminUsersApi({
        action: "reset",
        userId: profile.user_id,
        password,
      });

      if (resetResult.error) {
        toast({
          title: "Could not reset password",
          description: resetResult.error,
          variant: "destructive",
        });
        return;
      }

      const memberName = profile.display_name || "this account";
      toast({
        title: "Password reset",
        description: `New password for ${memberName}: ${password}. Share it securely and ask them to change it after signing in.`,
      });
    } finally {
      setResetByProfileId(null);
      fetchAll();
    }
  };

  const handleCreateAuthAccountForBranchAdmin = async () => {
    const targetId = baAuthForId;
    if (!targetId) return;

    const ba = branchAdmins.find((b) => b.id === targetId);
    if (!ba) {
      toast({ title: "Could not find branch admin", description: "This branch admin record no longer exists.", variant: "destructive" });
      setBaAuthForId(null);
      fetchAll();
      return;
    }

    const manualPassword = baAuthPassword.trim();
    if (manualPassword && manualPassword.length < 8) {
      toast({ title: "Password too short", description: "Use at least 8 characters, or leave the field empty to generate one.", variant: "destructive" });
      return;
    }

    const password = manualPassword || generatePassword();
    const email = ba.email.trim().toLowerCase();
    setBaCreatingAuthForId(targetId);

    try {
      const createResult = await callAdminUsersApi({ action: "create", email, password });

      if (createResult.error) {
        toast({
          title: "Could not create account",
          description: (
            createResult.error?.includes("User not allowed")
              ? "The sign-in service cannot be reached. Refresh and try again."
              : createResult.error
          ),
          variant: "destructive",
        });
        return;
      }

      const newUserId = createResult.userId;
      if (typeof newUserId === "string") {
        const linkResult = await supabase
          .from("branch_admins")
          .update({ user_id: newUserId })
          .eq("id", targetId);
        if (linkResult.error) {
          console.warn("Failed to link branch_admins row to auth account:", linkResult.error);
        }
      }

      setBaAuthForId(null);
      setBaAuthPassword("");
      toast({
        title: "Account created",
        description: `Sign-in: ${email} — password: ${password}. Share it securely; they should change it after signing in.`,
      });
    } finally {
      setBaCreatingAuthForId(null);
      fetchAll();
    }
  };

  const baAuthTarget = branchAdmins.find((b) => b.id === baAuthForId);

  /**
   * Only admins may delete an account, and nobody may delete their own —
   * `roleMap` is keyed by auth user id, and so is the session user.
   */
  const canDeleteAccount = (profileId: string) => {
    if (!user) return false;
    const target = profiles.find((p) => p.id === profileId);
    const isSelf = target ? target.user_id === user.id : profileId === user.id;
    if (isSelf) return false;
    return isSuperAdmin || roleMap[user.id] === "admin";
  };

  /**
   * Delete a site account outright. The auth user is removed through the
   * `admin-users` Edge Function (the browser only holds the publishable key,
   * which Supabase rejects for auth.admin calls). Every app row keyed on that
   * user — profile, roles, branch memberships, branch-admin grants — is
   * removed by ON DELETE CASCADE.
   */
  const handleDeleteAccount = async (profileId: string) => {
    if (!user) return;
    if (!canDeleteAccount(profileId)) {
      toast({
        title: "Not allowed",
        description: "Only admins can delete accounts, and nobody can delete their own account.",
        variant: "destructive",
      });
      return;
    }
    const target = profiles.find((p) => p.id === profileId);
    if (!target?.user_id) {
      toast({ title: "Could not find account", description: "This profile has no sign-in attached to it.", variant: "destructive" });
      return;
    }
    const label = target.display_name || "this account";
    if (!window.confirm(`Delete ${label}? They will no longer be able to sign in. This cannot be undone.`)) {
      return;
    }
    const result = await callAdminUsersApi({ action: "delete", userId: target.user_id });
    if (result.error) {
      toast({ title: "Could not delete account", description: result.error, variant: "destructive" });
      return;
    }
    toast({ title: "Account deleted", description: `${label} can no longer sign in.` });
    fetchAll();
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-4xl font-bold">{isSuperAdmin ? "Super Admin" : "Branch Admin"}</h1>
            <p className="text-muted-foreground">
              {isSuperAdmin
                ? "Manage content, branches and admins"
                : "Manage the areas and branches assigned to you"}
            </p>
          </div>
        </div>

        {isSuperAdmin && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{episodes.length}</p><p className="text-sm text-muted-foreground">Episodes</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{prayers.length}</p><p className="text-sm text-muted-foreground">Prayers</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{events.length}</p><p className="text-sm text-muted-foreground">Events</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{profiles.length}</p><p className="text-sm text-muted-foreground">Members</p></CardContent></Card>
        </div>
        )}

        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            {can("events") && <TabsTrigger value="episodes"><Music className="h-4 w-4 mr-2" />Episodes</TabsTrigger>}
            {can("prayers") && <TabsTrigger value="prayers"><Heart className="h-4 w-4 mr-2" />Prayers</TabsTrigger>}
            {can("events") && <TabsTrigger value="events"><Calendar className="h-4 w-4 mr-2" />Events</TabsTrigger>}
            {can("members") && <TabsTrigger value="members"><Users className="h-4 w-4 mr-2" />Members</TabsTrigger>}
            {can("content") && <TabsTrigger value="content"><Edit className="h-4 w-4 mr-2" />Content</TabsTrigger>}
            {can("team") && <TabsTrigger value="team"><Users className="h-4 w-4 mr-2" />Team</TabsTrigger>}
            {can("services") && <TabsTrigger value="services"><Sparkles className="h-4 w-4 mr-2" />Services</TabsTrigger>}
            {can("branches") && <TabsTrigger value="branches"><Building2 className="h-4 w-4 mr-2" />Branches</TabsTrigger>}
            {isSuperAdmin && <TabsTrigger value="branchAdmins"><UserCog className="h-4 w-4 mr-2" />Branch Admins</TabsTrigger>}
            {can("team") && <TabsTrigger value="founders"><Users className="h-4 w-4 mr-2" />Founders</TabsTrigger>}
          </TabsList>

          <TabsContent value="episodes">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-4">
              <h2 className="text-xl font-semibold">Episodes</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-56">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={epSearch} onChange={(e) => setEpSearch(e.target.value)} placeholder="Search episodes..." className="pl-9" />
                </div>
              <Dialog open={epDialogOpen} onOpenChange={(o) => { setEpDialogOpen(o); if (!o) resetEpForm(); }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" /> Add Episode</Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editingEpId ? "Edit" : "New"} Episode</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Title</Label><Input value={epTitle} onChange={(e) => setEpTitle(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={epDesc} onChange={(e) => setEpDesc(e.target.value)} rows={3} /></div>

                    <div className="space-y-2">
                      <Label>Audio File</Label>
                      <Input type="file" accept="audio/*" onChange={handleAudioUpload} disabled={uploadingAudio} />
                      {uploadingAudio && <Progress value={audioProgress} className="h-2" />}
                      {epAudioUrl && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground truncate">{epAudioUrl}</p>
                          <audio controls src={epAudioUrl} className="w-full h-8" />
                        </div>
                      )}
                      <Input value={epAudioUrl} onChange={(e) => setEpAudioUrl(e.target.value)} placeholder="...or paste URL" className="text-xs" />
                    </div>

                    <ImageUpload
                      id="episode-thumbnail"
                      label="Thumbnail Image"
                      value={epThumbnailUrl}
                      onChange={setEpThumbnailUrl}
                      folder="episodes"
                      preview="thumbnail"
                    />

                    <div className="space-y-2"><Label>Category</Label><Input value={epCategory} onChange={(e) => setEpCategory(e.target.value)} /></div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2"><Switch checked={epPublished} onCheckedChange={setEpPublished} /><Label>Published</Label></div>
                      <div className="flex items-center gap-2"><Switch checked={epFeatured} onCheckedChange={setEpFeatured} /><Label>Featured</Label></div>
                    </div>
                    <Button onClick={handleSaveEpisode} disabled={uploadingAudio} className="w-full">{editingEpId ? "Update" : "Create"} Episode</Button>
                  </div>
                </DialogContent>
                </Dialog>
              </div>
            </div>
            {(() => {
              const filtered = episodes.filter((ep) => ep.title.toLowerCase().includes(epSearch.toLowerCase()));
              if (filtered.length === 0) {
                return (
                  <Card><CardContent className="py-8 text-center text-muted-foreground">
                    {episodes.length === 0 ? "No episodes yet. Add your first one!" : "No episodes match your search."}
                  </CardContent></Card>
                );
              }
              return (
              <div className="grid gap-3">
                {filtered.map((ep) => (
                  <Card key={ep.id}>
                    <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{ep.title}</h3>
                          {ep.published && <Badge className="bg-green-100 text-green-800 border-transparent">Published</Badge>}
                          {ep.featured && <Badge className="bg-blue-100 text-blue-800 border-transparent">Featured</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{ep.category} • {format(new Date(ep.created_at), "PP")}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditEpisode(ep)}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDeleteEpisode(ep.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="prayers">
            <h2 className="text-xl font-semibold mb-4">Prayer Requests</h2>
            {prayers.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No prayer requests yet.</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {prayers.map((pr) => (
                  <Card key={pr.id}>
                    <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                      <div>
                        <p className="font-semibold">{pr.is_anonymous ? "Anonymous" : pr.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-1">{pr.request}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(pr.created_at), "PP")} • {pr.prayed_count} prayers</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select value={pr.status || "pending"} onValueChange={(v) => handlePrayerStatus(pr.id, v)}>
                          <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="praying">Praying</SelectItem>
                            <SelectItem value="answered">Answered</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDeletePrayer(pr.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="events">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold">Live Events</h2>
              <Dialog open={evDialogOpen} onOpenChange={(o) => { setEvDialogOpen(o); if (!o) resetEvForm(); }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" /> Add Event</Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editingEvId ? "Edit" : "New"} Event</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Title</Label><Input value={evTitle} onChange={(e) => setEvTitle(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={evDesc} onChange={(e) => setEvDesc(e.target.value)} rows={3} /></div>
                    <div className="space-y-2"><Label>Stream URL (YouTube embed)</Label><Input value={evStreamUrl} onChange={(e) => setEvStreamUrl(e.target.value)} placeholder="https://www.youtube.com/embed/..." /></div>
                    <div className="space-y-2"><Label>Scheduled At</Label><Input type="datetime-local" value={evScheduledAt ? evScheduledAt.slice(0, 16) : ""} onChange={(e) => setEvScheduledAt(new Date(e.target.value).toISOString())} required /></div>
                    <div className="flex items-center gap-2"><Switch checked={evIsLive} onCheckedChange={setEvIsLive} /><Label>Currently Live</Label></div>
                    <Button onClick={handleSaveEvent} className="w-full">{editingEvId ? "Update" : "Create"} Event</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {events.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No events yet.</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {events.map((ev) => (
                  <Card key={ev.id}>
                    <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{ev.title}</h3>
                          {ev.is_live && <Badge className="bg-destructive text-destructive-foreground">LIVE</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{format(new Date(ev.scheduled_at), "PPP 'at' p")}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditEvent(ev)}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDeleteEvent(ev.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="members">
            {/* Branch admins manage the members of the branches they were given,
                and the join requests those branches received. */}
            <BranchMembersPanel branchIds={visibleBranches.map((b) => b.id)} branches={visibleBranches} />

            {isSuperAdmin && (
            <div className="mt-12">
            <h2 className="text-xl font-semibold mb-4">All Site Accounts ({profiles.length})</h2>
            {profiles.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No accounts yet.</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {profiles.map((p) => (
                  <Card key={p.id}>
                    <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shrink-0">
                          {p.display_name ? p.display_name[0].toUpperCase() : "?"}
                        </div>
                        <div>
                          <p className="font-semibold">{p.display_name || "Unnamed"}</p>      <p className="text-xs text-muted-foreground">Joined {format(new Date(p.created_at), "PP")}</p>
                        </div>
                      </div>
                      {(isSuperAdmin || isAdmin) && (
                        <div className="flex items-center gap-2">
                          <Select value={roleMap?.[p.user_id] ?? "user"} onValueChange={(v) => handleSetRole(p.user_id, v)} disabled={p.user_id === user?.id}>
                            <SelectTrigger className="w-28 h-9"><SelectValue placeholder="Role" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" disabled={resetByProfileId === p.id} onClick={() => handleResetMemberPassword(p.id)}>
                            {resetByProfileId === p.id ? "Resetting…" : "Reset password"}
                          </Button>
                          <Button size="sm" variant="destructive" disabled={!canDeleteAccount(p.id)} onClick={() => handleDeleteAccount(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Account cleanup: super admins, and admins promoted to admin role, can delete accounts. */}
      {(isSuperAdmin || roleMap[user?.id] === "admin") && (
        <div className="mt-12">
          <h2 className="text-xl font-semibold mb-4">Account Cleanup</h2>
          <Card>
            <CardContent className="pt-6">
              {profiles.length === 0 ? (
                <p className="text-muted-foreground">No accounts to clean up.</p>
              ) : (
                <div className="grid gap-3">
                  {profiles.map((p) => (
                    <Card key={p.id}>
                      <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shrink-0">
                            {p.display_name ? p.display_name[0].toUpperCase() : "?"}
                          </div>
                          <div>
                            <p className="font-semibold">{p.display_name || "Unnamed"}</p>
                            <p className="text-xs text-muted-foreground">Joined {format(new Date(p.created_at), "PP")}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="destructive" disabled={!canDeleteAccount(p.id)} onClick={() => handleDeleteAccount(p.id)}>
                            <Trash2 className="h-4 w-4" /> Delete account
                          </Button>
                        </div>
                      </CardContent>
                    </Card>                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
          </TabsContent>

          <TabsContent value="content">
            <h2 className="text-xl font-semibold mb-4">Site Content</h2>
            {(() => {
              const sections = [
                { label: "Home Page", keys: ["hero_title", "hero_subtitle", "hero_established", "hero_tagline", "stat_years", "stat_years_label", "stat_souls", "stat_souls_label", "stat_award", "stat_award_label", "vision", "mission", "purpose"], textarea: ["hero_subtitle", "vision", "mission", "purpose"] },
                { label: "About Page", keys: ["confession_title", "confession_1", "confession_2", "confession_3", "about_story"], textarea: ["confession_1", "confession_2", "confession_3", "about_story"] },
                { label: "Contact Info", keys: ["contact_email", "contact_phone", "contact_address", "contact_hours_weekday", "contact_hours_saturday", "contact_hours_sunday"], textarea: [] },
                { label: "Donate Info", keys: ["donate_bank_name", "donate_account_name", "donate_routing", "donate_mail_address", "donate_email", "donate_phone"], textarea: ["donate_mail_address"] },
                { label: "Footer", keys: ["footer_name", "footer_description", "footer_copyright"], textarea: ["footer_description"] },
              ];
              return (
                <div className="space-y-8">
                  {sections.map((section) => (
                    <Card key={section.label}>
                      <CardHeader><CardTitle className="text-lg">{section.label}</CardTitle></CardHeader>
                      <CardContent className="space-y-4">
                        {section.keys.map((key) => {
                          const isLong = section.textarea.includes(key);
                          const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
                          return (
                            <div key={key} className="space-y-2">
                              <Label className="text-sm font-medium">{label}</Label>
                              <div className="flex gap-2">
                                {isLong ? (
                                  <Textarea
                                    value={siteSettings[key] || ""}
                                    onChange={(e) => setSiteSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                                    rows={3}
                                    className="flex-1"
                                  />
                                ) : (
                                  <Input
                                    value={siteSettings[key] || ""}
                                    onChange={(e) => setSiteSettings((prev) => ({ ...prev, [key]: e.target.value }))}
                                    className="flex-1"
                                  />
                                )}
                                <Button size="sm" onClick={() => handleSaveSetting(key, siteSettings[key] || "")} className="shrink-0">
                                  <Save className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  ))}

                  {/* Appearance Settings */}
                  <Card>
                    <CardHeader><CardTitle className="text-lg">Appearance</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium">Glass Intensity</Label>
                          <span className="text-sm text-muted-foreground font-mono">{siteSettings.glass_intensity || "60"}%</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          step="5"
                          value={siteSettings.glass_intensity || "60"}
                          onChange={(e) => setSiteSettings((prev) => ({ ...prev, glass_intensity: e.target.value }))}
                          className="w-full h-2 rounded-full appearance-none cursor-pointer bg-gray-200 accent-primary"
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Clear (0%)</span>
                          <span>Default (60%)</span>
                          <span>Frosted (100%)</span>
                        </div>
                        <p className="text-xs text-muted-foreground">Controls the opacity and blur of glass-effect cards (Auth page, Navbar). Higher = more frosted.</p>
                        <Button size="sm" onClick={() => handleSaveSetting("glass_intensity", siteSettings.glass_intensity || "60")}>
                          <Save className="h-4 w-4 mr-2" /> Save Appearance
                        </Button>
                      </div>

                      {/* Hero Image Upload */}
                      <div className="space-y-3 pt-4 border-t">
                        <Label className="text-sm font-medium">Hero Background Image</Label>
                        <p className="text-xs text-muted-foreground">Upload the background image for the home page hero section.</p>
                        {siteSettings.hero_image_url && (
                          <div className="relative w-full h-40 rounded-lg overflow-hidden border">
                            <img src={siteSettings.hero_image_url} alt="Hero preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <Input type="file" accept="image/*" onChange={handleHeroImageUpload} disabled={uploadingHeroImage} />
                        {uploadingHeroImage && <Progress value={50} className="h-2" />}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="founders">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold">About Founders ({founders.length})</h2>
              <Dialog open={founderDialogOpen} onOpenChange={(o) => { setFounderDialogOpen(o); if (!o) resetFounderForm(); }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" /> Add Founder</Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editingFounderId ? "Edit" : "Add"} Founder</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Name</Label><Input value={founderName} onChange={(e) => setFounderName(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>Role</Label><Input value={founderRole} onChange={(e) => setFounderRole(e.target.value)} placeholder="e.g. Co-Founder" required /></div>
                    <div className="space-y-2"><Label>Subtitle</Label><Input value={founderSubtitle} onChange={(e) => setFounderSubtitle(e.target.value)} placeholder="e.g. aka Reagan Lescot" /></div>
                    <div className="space-y-2"><Label>Bio</Label><Textarea value={founderBio} onChange={(e) => setFounderBio(e.target.value)} rows={3} placeholder="Optional bio shown on the About page." /></div>
                    <ImageUpload
                      id="founder-avatar"
                      label="Avatar"
                      value={founderAvatar}
                      onChange={setFounderAvatar}
                      preview="avatar"
                      folder="founders"
                    />
                    <Button onClick={handleSaveFounder} className="w-full">{editingFounderId ? "Update" : "Add"} Founder</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {founders.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No founders yet. Add the first one.</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {founders.map((f) => (
                  <Card key={f.id}>
                    <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                      <div className="flex items-center gap-4">
                        <Link to={`/admin/founders/${f.id}`} className="shrink-0">
                          {f.avatar_url ? (
                            <img src={f.avatar_url} alt={f.name} className="w-12 h-12 rounded-full object-cover" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold hover:bg-purple-200 transition cursor-pointer">
                              {f.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </Link>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold truncate">{f.name}</h3>
                          </div>
                          <p className="text-sm text-primary font-medium">{f.role}</p>
                          {f.subtitle && <p className="text-xs text-muted-foreground italic">{f.subtitle}</p>}
                          {f.bio && <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{f.bio}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-auto shrink-0">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/admin/founders/${f.id}`}><Edit className="h-4 w-4" /></Link>
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDeleteFounder(f.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="team">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold">Team Members ({teamMembers.length})</h2>
              <Dialog open={tmDialogOpen} onOpenChange={(o) => { setTmDialogOpen(o); if (!o) resetTmForm(); }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" /> Add Member</Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editingTmId ? "Edit" : "Add"} Team Member</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Name</Label><Input value={tmName} onChange={(e) => setTmName(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>Role</Label><Input value={tmRole} onChange={(e) => setTmRole(e.target.value)} placeholder="e.g. Co-Founder" required /></div>
                    <div className="space-y-2"><Label>Bio</Label><Textarea value={tmBio} onChange={(e) => setTmBio(e.target.value)} rows={3} /></div>
                    <ImageUpload
                      id="team-member-avatar"
                      label="Avatar"
                      value={tmAvatar}
                      onChange={setTmAvatar}
                      preview="avatar"
                      folder="team-members"
                    />
                    <Button onClick={handleSaveTeamMember} className="w-full">{editingTmId ? "Update" : "Add"} Member</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {teamMembers.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No team members yet.</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {teamMembers.map((tm) => (
                  <Card key={tm.id}>
                    <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                      <div className="flex items-center gap-4">
                        <Link to={`/admin/team/${tm.id}`} className="shrink-0">
                          <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold hover:bg-purple-200 transition cursor-pointer">
                            {tm.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                        </Link>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h3 className="font-semibold truncate">{tm.name}</h3>
                            {tm.avatar_url ? <Briefcase className="h-3.5 w-3.5 text-muted-foreground shrink-0" /> : null}
                          </div>
                          <p className="text-sm text-primary font-medium">{tm.role}</p>
                          {tm.bio && <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{tm.bio}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2 ml-auto shrink-0">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/admin/team/${tm.id}`}><Edit className="h-4 w-4" /></Link>
                        </Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDeleteTeamMember(tm.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="services">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold">Ministry Services ({services.length})</h2>
              <Dialog open={svDialogOpen} onOpenChange={(o) => { setSvDialogOpen(o); if (!o) resetSvForm(); }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" /> Add Service</Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editingSvId ? "Edit" : "Add"} Service</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Title</Label><Input value={svTitle} onChange={(e) => setSvTitle(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={svDesc} onChange={(e) => setSvDesc(e.target.value)} rows={3} /></div>
                    <div className="space-y-2"><Label>Icon</Label><Input value={svIcon} onChange={(e) => setSvIcon(e.target.value)} placeholder="e.g. Globe, Heart, Music" /></div>
                    <div className="space-y-2"><Label>Bible Verse</Label><Input value={svVerse} onChange={(e) => setSvVerse(e.target.value)} placeholder="e.g. Matthew 28:19" /></div>
                    <Button onClick={handleSaveService} className="w-full">{editingSvId ? "Update" : "Add"} Service</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {services.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No services yet.</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {services.map((sv) => (
                  <Card key={sv.id}>
                    <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                      <div>
                        <h3 className="font-semibold">{sv.title}</h3>
                        {sv.description && <p className="text-sm text-muted-foreground line-clamp-1">{sv.description}</p>}
                        {sv.bible_verse && <p className="text-xs text-primary italic mt-1">{sv.bible_verse}</p>}
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditService(sv)}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDeleteService(sv.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="branches">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold">Ministry Branches ({visibleBranches.length})</h2>
              <Dialog open={branchDialogOpen} onOpenChange={(o) => { setBranchDialogOpen(o); if (!o) resetBrForm(); }}>
                {isSuperAdmin && (
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" /> Add Branch</Button>
                </DialogTrigger>
                )}
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editingBranchId ? "Edit" : "New"} Branch</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Name</Label><Input value={brName} onChange={(e) => setBrName(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>Slug</Label><Input value={brSlug} onChange={(e) => setBrSlug(e.target.value)} placeholder="auto-generated from name" /></div>
                    <div className="space-y-2"><Label>Location</Label><Input value={brLocation} onChange={(e) => setBrLocation(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={brDesc} onChange={(e) => setBrDesc(e.target.value)} rows={3} /></div>
                    <div className="space-y-2"><Label>Leader Name</Label><Input value={brLeader} onChange={(e) => setBrLeader(e.target.value)} /></div>
                    {isSuperAdmin && (
                    <div className="space-y-2">
                      <Label>Leader User (Portal Access)</Label>
                      <Select value={brLeaderUserId || "none"} onValueChange={(v) => setBrLeaderUserId(v === "none" ? "" : v)}>
                        <SelectTrigger><SelectValue placeholder="Select a user" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          {profiles.map((p) => (
                            <SelectItem key={p.user_id} value={p.user_id}>{p.display_name || p.user_id.slice(0, 8)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">Assigns this user branch portal editing access.</p>
                    </div>
                    )}
                    <div className="space-y-2"><Label>Leader Email</Label><Input value={brEmail} onChange={(e) => setBrEmail(e.target.value)} type="email" /></div>
                    <div className="space-y-2"><Label>Phone</Label><Input value={brPhone} onChange={(e) => setBrPhone(e.target.value)} /></div>
                    <ImageUpload
                      id="branch-logo"
                      label="Logo"
                      value={brLogo}
                      onChange={setBrLogo}
                      preview="avatar"
                      folder="branches"
                    />
                    <ImageUpload
                      id="branch-banner"
                      label="Banner"
                      value={brBanner}
                      onChange={setBrBanner}
                      preview="banner"
                      folder="branches"
                    />
                    {isSuperAdmin && (
                    <div className="space-y-3 rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <Switch checked={brIsGrouping} onCheckedChange={setBrIsGrouping} />
                        <Label>This is a grouping branch</Label>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Grouping branches own local chapters, e.g. BEHT USA groups Louisville.
                      </p>
                      {brIsGrouping ? (
                        <div className="space-y-2">
                          <Label>Grouping code</Label>
                          <Input value={brStateCode} onChange={(e) => setBrStateCode(e.target.value)} placeholder="e.g. US" maxLength={10} />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Label>Belongs under</Label>
                          <Select value={brParentId || "none"} onValueChange={(v) => setBrParentId(v === "none" ? "" : v)}>
                            <SelectTrigger><SelectValue placeholder="No grouping" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No grouping</SelectItem>
                              {branchesList
                                .filter((b) => Boolean((b as any).is_state_branch) && b.id !== editingBranchId)
                                .map((b) => (
                                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>
                    )}
                    <div className="flex items-center gap-2"><Switch checked={brActive} onCheckedChange={setBrActive} /><Label>Active</Label></div>
                    <Button onClick={handleSaveBranch} className="w-full">{editingBranchId ? "Update" : "Create"} Branch</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {visibleBranches.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">{isSuperAdmin ? "No branches yet. Add your first branch!" : "You are not assigned to any branch yet."}</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {visibleBranches.map((br) => (
                  <Card key={br.id}>
                    <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <Building2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">{br.name}</h3>
                            {!br.active && <Badge variant="secondary">Inactive</Badge>}
                            {Boolean((br as any).is_state_branch) && <Badge variant="secondary">Grouping branch</Badge>}
                            {!(br as any).is_state_branch && (br as any).parent_id && (
                              <Badge variant="secondary">
                                Under {branchesList.find((b) => b.id === (br as any).parent_id)?.name ?? "a grouping branch"}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{br.location || "No location"} - {br.leader_name || "No leader"}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditBranch(br)}><Edit className="h-4 w-4" /></Button>
                        {isSuperAdmin && <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDeleteBranch(br.id)}><Trash2 className="h-4 w-4" /></Button>}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {isSuperAdmin && (
          <TabsContent value="branchAdmins">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <div>
                <h2 className="text-xl font-semibold">Branch Admins ({branchAdmins.length})</h2>
                <p className="text-sm text-muted-foreground">Create sign-ons, assign the branches they manage, and choose what they can modify.</p>
              </div>
              <Dialog open={baDialogOpen} onOpenChange={(o) => { setBaDialogOpen(o); if (!o) resetBaForm(); }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" /> Add Branch Admin</Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editingBaId ? "Edit" : "New"} Branch Admin</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Full name</Label><Input value={baName} onChange={(e) => setBaName(e.target.value)} placeholder="e.g. Jean Kabila" /></div>

                    <div className="space-y-2">
                      <Label>Sign-on email</Label>
                      <Input type="email" value={baEmail} onChange={(e) => setBaEmail(e.target.value)} placeholder="person@example.com" />
                      <p className="text-xs text-muted-foreground">
                        {editingBaId
                          ? "This person already has a BEHT JAMAA account. Use the fields below to manage their name, branches, permissions or active status."
                          : "A BEHT JAMAA sign-in is created straight away with the password below — no invite email is sent."}
                      </p>
                    </div>

                    {!editingBaId && (
                      <div className="space-y-2">
                        <Label>Password</Label>
                        <div className="flex gap-2">
                          <Input
                            value={baPassword}
                            onChange={(e) => setBaPassword(e.target.value)}
                            placeholder="Minimum 8 characters, or press the key to generate"
                            type="text"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setBaPassword(generatePassword())}
                            title="Generate a password"
                          >
                            <KeyRound className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Their sign-in password. You will see it once, right after the account is created — share it securely.
                        </p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Branches they manage ({baBranchIds.length})</Label>
                      <div className="max-h-44 overflow-y-auto rounded-md border p-3 space-y-2">
                        {branchesList.length === 0 && <p className="text-sm text-muted-foreground">No branches yet.</p>}
                        {branchesList.map((br) => (
                          <label key={br.id} className="flex items-center gap-2 text-sm cursor-pointer">
                            <Checkbox
                              checked={baBranchIds.includes(br.id)}
                              onCheckedChange={(v) => toggleBaBranch(br.id, v === true)}
                            />
                            <span>{br.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>What they can modify ({baPermissions.length})</Label>
                      <div className="rounded-md border p-3 space-y-3">
                        {PERMISSIONS.map((p) => (
                          <label key={p.key} className="flex items-start gap-2 cursor-pointer">
                            <Checkbox
                              className="mt-0.5"
                              checked={baPermissions.includes(p.key)}
                              onCheckedChange={(v) => toggleBaPermission(p.key, v === true)}
                            />
                            <span className="text-sm">
                              <span className="font-medium">{p.label}</span>
                              {p.branchScoped && (
                                <Badge variant="secondary" className="ml-2 text-[10px]">Their branches only</Badge>
                              )}
                              <span className="block text-xs text-muted-foreground">{p.description}</span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2"><Switch checked={baActive} onCheckedChange={setBaActive} /><Label>Active</Label></div>
                    <Button onClick={handleSaveBranchAdmin} className="w-full">{editingBaId ? "Update Branch Admin" : "Create Branch Admin Account"}</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {branchAdmins.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No branch admins yet. Add one to give a leader scoped access.</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {branchAdmins.map((ba) => {
                  const branchNames = branchesList.filter((b) => (ba.branch_ids || []).includes(b.id)).map((b) => b.name);
                  return (
                    <Card key={ba.id}>
                      <CardContent className="p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                              <UserCog className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="font-semibold">{ba.full_name}</h3>
                                {!ba.is_active && <Badge variant="secondary">Inactive</Badge>}
                                {ba.user_id
                                  ? <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Has account</Badge>
                                  : <Badge className="bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100">No account yet</Badge>
                                  }
                              </div>
                              <p className="text-sm text-muted-foreground">{ba.email}</p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {!ba.user_id && baCreatingAuthForId !== ba.id ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => { setBaAuthPassword(""); setBaAuthForId(ba.id); }}
                              >
                                Create account
                              </Button>
                            ) : null}
                            {baCreatingAuthForId === ba.id ? (
                              <Button size="sm" variant="outline" disabled>
                                Creating account…
                              </Button>
                            ) : null}
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button size="sm" variant="outline">Actions</Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-48">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => { setBaAuthPassword(""); setBaAuthForId(ba.id); }}>
                                  <UserPlus className="mr-2 h-4 w-4" /> Create account
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { setBaAuthPassword(""); setBaAuthForId(ba.id); }}>
                                  <Link2 className="mr-2 h-4 w-4" /> Attach existing auth user
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteBranchAdmin(ba.id)}>
                                  <Trash2 className="mr-2 h-4 w-4" /> Delete branch admin
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Branches: </span>
                          {branchNames.length
                            ? branchNames.join(", ")
                            : <span className="text-destructive">None assigned</span>}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {(ba.permissions || []).length === 0
                            ? <span className="text-sm text-destructive">No permissions assigned</span>
                            : (ba.permissions || []).map((k: string) => (
                                <Badge key={k} variant="secondary" className="text-[11px]">{permissionLabel(k)}</Badge>
                              ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <Dialog
              open={!!baAuthForId}
              onOpenChange={(o) => {
                if (!o && !baCreatingAuthForId) {
                  setBaAuthForId(null);
                  setBaAuthPassword("");
                }
              }}
            >
              <DialogContent>
                <DialogHeader><DialogTitle>Create sign-in account</DialogTitle></DialogHeader>
                {baAuthTarget ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      This creates a BEHT JAMAA sign-in for{" "}
                      <span className="font-medium text-foreground">{baAuthTarget.email}</span>.
                    </p>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <div className="flex gap-2">
                        <Input
                          value={baAuthPassword}
                          onChange={(e) => setBaAuthPassword(e.target.value)}
                          placeholder="Leave empty to generate one"
                          type="text"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setBaAuthPassword(generatePassword())}
                          title="Generate a password"
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        At least 8 characters. The password is shown once after the account is created.
                      </p>
                    </div>
                    <Button
                      onClick={handleCreateAuthAccountForBranchAdmin}
                      className="w-full"
                      disabled={!!baCreatingAuthForId}
                    >
                      {baCreatingAuthForId ? "Creating account…" : "Create account"}
                    </Button>
                  </div>
                ) : null}
              </DialogContent>
            </Dialog>
          </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
