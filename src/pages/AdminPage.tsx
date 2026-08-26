import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Plus, Trash2, Edit, Music, Heart, Calendar, Users, Shield, Search, Sparkles, Save, Building2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

const AdminPage = () => {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [episodes, setEpisodes] = useState<Tables<"episodes">[]>([]);
  const [prayers, setPrayers] = useState<Tables<"prayer_requests">[]>([]);
  const [events, setEvents] = useState<Tables<"live_events">[]>([]);
  const [profiles, setProfiles] = useState<Tables<"profiles">[]>([]);
  const [roleMap, setRoleMap] = useState<Record<string, string>>({});
  const [epSearch, setEpSearch] = useState("");

  // CMS content
  const [siteSettings, setSiteSettings] = useState<Record<string, string>>({});
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const [services, setServicesList] = useState<any[]>([]);
  const [tmDialogOpen, setTmDialogOpen] = useState(false);
  const [editingTmId, setEditingTmId] = useState<string | null>(null);
  const [tmName, setTmName] = useState("");
  const [tmRole, setTmRole] = useState("");
  const [tmBio, setTmBio] = useState("");
  const [tmAvatar, setTmAvatar] = useState("");
  const [svDialogOpen, setSvDialogOpen] = useState(false);
  const [editingSvId, setEditingSvId] = useState<string | null>(null);
  const [svTitle, setSvTitle] = useState("");
  const [svDesc, setSvDesc] = useState("");
  const [svIcon, setSvIcon] = useState("");
  const [svVerse, setSvVerse] = useState("");

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
  const [brLeaderUserId, setBrLeaderUserId] = useState<string>("");
  const [uploadingBranchLogo, setUploadingBranchLogo] = useState(false);
  const [uploadingBranchBanner, setUploadingBranchBanner] = useState(false);

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
  const [uploadingThumb, setUploadingThumb] = useState(false);
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
  };

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

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

  if (!isAdmin) {
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
  const resetSvForm = () => { setSvTitle(""); setSvDesc(""); setSvIcon(""); setSvVerse(""); setEditingSvId(null); };
  const resetBrForm = () => { setBrName(""); setBrSlug(""); setBrLocation(""); setBrDesc(""); setBrLeader(""); setBrEmail(""); setBrPhone(""); setBrLogo(""); setBrBanner(""); setBrActive(true); setBrLeaderUserId(""); setEditingBranchId(null); };

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

  const handleThumbUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "File too large", description: "Image must be under 5MB.", variant: "destructive" });
      return;
    }
    setUploadingThumb(true);
    try {
      const url = await uploadFile(file, "episode-thumbnails");
      setEpThumbnailUrl(url);
      toast({ title: "Thumbnail uploaded" });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploadingThumb(false);
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
    const payload = { name: brName.trim(), slug, location: brLocation || null, description: brDesc || null, leader_name: brLeader || null, leader_user_id: brLeaderUserId || null, leader_email: brEmail || null, phone: brPhone || null, logo_url: brLogo || null, banner_url: brBanner || null, active: brActive };
    if (editingBranchId) {
      await supabase.from("branches").update(payload).eq("id", editingBranchId);
    } else {
      await supabase.from("branches").insert(payload);
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

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>

        <div className="flex items-center gap-3 mb-8">
          <Shield className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-4xl font-bold">Admin Panel</h1>
            <p className="text-muted-foreground">Manage content and users</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{episodes.length}</p><p className="text-sm text-muted-foreground">Episodes</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{prayers.length}</p><p className="text-sm text-muted-foreground">Prayers</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{events.length}</p><p className="text-sm text-muted-foreground">Events</p></CardContent></Card>
          <Card><CardContent className="pt-6 text-center"><p className="text-3xl font-bold">{profiles.length}</p><p className="text-sm text-muted-foreground">Members</p></CardContent></Card>
        </div>

        <Tabs defaultValue="episodes">
          <TabsList className="mb-4 flex-wrap h-auto gap-1">
            <TabsTrigger value="episodes"><Music className="h-4 w-4 mr-2" />Episodes</TabsTrigger>
            <TabsTrigger value="prayers"><Heart className="h-4 w-4 mr-2" />Prayers</TabsTrigger>
            <TabsTrigger value="events"><Calendar className="h-4 w-4 mr-2" />Events</TabsTrigger>
            <TabsTrigger value="members"><Users className="h-4 w-4 mr-2" />Members</TabsTrigger>
            <TabsTrigger value="content"><Edit className="h-4 w-4 mr-2" />Content</TabsTrigger>
            <TabsTrigger value="team"><Users className="h-4 w-4 mr-2" />Team</TabsTrigger>
            <TabsTrigger value="services"><Sparkles className="h-4 w-4 mr-2" />Services</TabsTrigger>
            <TabsTrigger value="branches"><Building2 className="h-4 w-4 mr-2" />Branches</TabsTrigger>
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

                    <div className="space-y-2">
                      <Label>Thumbnail Image</Label>
                      <Input type="file" accept="image/*" onChange={handleThumbUpload} disabled={uploadingThumb} />
                      {uploadingThumb && <p className="text-xs text-muted-foreground">Uploading...</p>}
                      {epThumbnailUrl && (
                        <img src={epThumbnailUrl} alt="thumbnail preview" className="w-24 h-24 object-cover rounded-md border" />
                      )}
                      <Input value={epThumbnailUrl} onChange={(e) => setEpThumbnailUrl(e.target.value)} placeholder="...or paste URL" className="text-xs" />
                    </div>

                    <div className="space-y-2"><Label>Category</Label><Input value={epCategory} onChange={(e) => setEpCategory(e.target.value)} /></div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2"><Switch checked={epPublished} onCheckedChange={setEpPublished} /><Label>Published</Label></div>
                      <div className="flex items-center gap-2"><Switch checked={epFeatured} onCheckedChange={setEpFeatured} /><Label>Featured</Label></div>
                    </div>
                    <Button onClick={handleSaveEpisode} disabled={uploadingAudio || uploadingThumb} className="w-full">{editingEpId ? "Update" : "Create"} Episode</Button>
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
                <DialogContent>
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
            <h2 className="text-xl font-semibold mb-4">Members ({profiles.length})</h2>
            {profiles.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No members yet.</CardContent></Card>
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
                        {roleMap[p.user_id] === "admin" && <Badge className="bg-purple-100 text-purple-800 border-transparent">Admin</Badge>}
                        {roleMap[p.user_id] === "moderator" && <Badge className="bg-blue-100 text-blue-800 border-transparent">Mod</Badge>}
                        <Select
                          value={roleMap[p.user_id] || "user"}
                          onValueChange={(v) => handleSetRole(p.user_id, v)}
                          disabled={p.user_id === user?.id}
                        >
                          <SelectTrigger className="w-32 h-9"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="moderator">Moderator</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
                </div>
              );
            })()}
          </TabsContent>

          <TabsContent value="team">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold">Team Members ({teamMembers.length})</h2>
              <Dialog open={tmDialogOpen} onOpenChange={(o) => { setTmDialogOpen(o); if (!o) resetTmForm(); }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" /> Add Member</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingTmId ? "Edit" : "Add"} Team Member</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Name</Label><Input value={tmName} onChange={(e) => setTmName(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>Role</Label><Input value={tmRole} onChange={(e) => setTmRole(e.target.value)} placeholder="e.g. Co-Founder" required /></div>
                    <div className="space-y-2"><Label>Bio</Label><Textarea value={tmBio} onChange={(e) => setTmBio(e.target.value)} rows={3} /></div>
                    <div className="space-y-2"><Label>Avatar URL</Label><Input value={tmAvatar} onChange={(e) => setTmAvatar(e.target.value)} placeholder="https://..." /></div>
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
                        <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 font-bold shrink-0">
                          {tm.name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="font-semibold">{tm.name}</h3>
                          <p className="text-sm text-primary font-medium">{tm.role}</p>
                          {tm.bio && <p className="text-xs text-muted-foreground line-clamp-1 mt-1">{tm.bio}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditTeamMember(tm)}><Edit className="h-4 w-4" /></Button>
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
                <DialogContent>
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
              <h2 className="text-xl font-semibold">Ministry Branches ({branchesList.length})</h2>
              <Dialog open={branchDialogOpen} onOpenChange={(o) => { setBranchDialogOpen(o); if (!o) resetBrForm(); }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" /> Add Branch</Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader><DialogTitle>{editingBranchId ? "Edit" : "New"} Branch</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Name</Label><Input value={brName} onChange={(e) => setBrName(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>Slug</Label><Input value={brSlug} onChange={(e) => setBrSlug(e.target.value)} placeholder="auto-generated from name" /></div>
                    <div className="space-y-2"><Label>Location</Label><Input value={brLocation} onChange={(e) => setBrLocation(e.target.value)} /></div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={brDesc} onChange={(e) => setBrDesc(e.target.value)} rows={3} /></div>
                    <div className="space-y-2"><Label>Leader Name</Label><Input value={brLeader} onChange={(e) => setBrLeader(e.target.value)} /></div>
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
                    <div className="space-y-2"><Label>Leader Email</Label><Input value={brEmail} onChange={(e) => setBrEmail(e.target.value)} type="email" /></div>
                    <div className="space-y-2"><Label>Phone</Label><Input value={brPhone} onChange={(e) => setBrPhone(e.target.value)} /></div>
                    <div className="space-y-2">
                      <Label>Logo</Label>
                      {brLogo && (<img src={brLogo} alt="Logo preview" className="w-16 h-16 rounded-full object-cover border mb-2" />)}
                      <Input type="file" accept="image/*" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingBranchLogo(true);
                        try { const url = await uploadFile(file, "episode-thumbnails"); setBrLogo(url); toast({ title: "Logo uploaded" }); }
                        catch (err: any) { toast({ title: "Upload failed", description: err.message, variant: "destructive" }); }
                        finally { setUploadingBranchLogo(false); }
                      }} disabled={uploadingBranchLogo} />
                      {uploadingBranchLogo && <p className="text-xs text-muted-foreground">Uploading...</p>}
                      <Input value={brLogo} onChange={(e) => setBrLogo(e.target.value)} placeholder="...or paste URL" className="text-xs" />
                    </div>
                    <div className="space-y-2">
                      <Label>Banner</Label>
                      {brBanner && (<img src={brBanner} alt="Banner preview" className="w-full h-24 object-cover rounded-md border mb-2" />)}
                      <Input type="file" accept="image/*" onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingBranchBanner(true);
                        try { const url = await uploadFile(file, "episode-thumbnails"); setBrBanner(url); toast({ title: "Banner uploaded" }); }
                        catch (err: any) { toast({ title: "Upload failed", description: err.message, variant: "destructive" }); }
                        finally { setUploadingBranchBanner(false); }
                      }} disabled={uploadingBranchBanner} />
                      {uploadingBranchBanner && <p className="text-xs text-muted-foreground">Uploading...</p>}
                      <Input value={brBanner} onChange={(e) => setBrBanner(e.target.value)} placeholder="...or paste URL" className="text-xs" />
                    </div>
                    <div className="flex items-center gap-2"><Switch checked={brActive} onCheckedChange={setBrActive} /><Label>Active</Label></div>
                    <Button onClick={handleSaveBranch} className="w-full">{editingBranchId ? "Update" : "Create"} Branch</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {branchesList.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No branches yet. Add your first branch!</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {branchesList.map((br) => (
                  <Card key={br.id}>
                    <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <Building2 className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{br.name}</h3>
                            {!br.active && <Badge variant="secondary">Inactive</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{br.location || "No location"} - {br.leader_name || "No leader"}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditBranch(br)}><Edit className="h-4 w-4" /></Button>
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDeleteBranch(br.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
