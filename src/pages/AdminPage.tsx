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
import { ArrowLeft, Plus, Trash2, Edit, Music, Heart, Calendar, Users, Shield, Search } from "lucide-react";
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
  const [evIsLive, setEvIsLive] = useState(false);
  const [evDialogOpen, setEvDialogOpen] = useState(false);
  const [editingEvId, setEditingEvId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      toast({ title: "Access denied", description: "You need admin privileges.", variant: "destructive" });
      navigate("/");
    }
  }, [user, isAdmin, authLoading, navigate, toast]);

  const fetchAll = async () => {
    const [ep, pr, ev, prof] = await Promise.all([
      supabase.from("episodes").select("*").order("created_at", { ascending: false }),
      supabase.from("prayer_requests").select("*").order("created_at", { ascending: false }),
      supabase.from("live_events").select("*").order("scheduled_at", { ascending: true }),
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    ]);
    setEpisodes(ep.data || []);
    setPrayers(pr.data || []);
    setEvents(ev.data || []);
    setProfiles(prof.data || []);

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

  const resetEpForm = () => { setEpTitle(""); setEpDesc(""); setEpAudioUrl(""); setEpThumbnailUrl(""); setEpCategory("sermon"); setEpPublished(false); setEpFeatured(false); setEditingEpId(null); setAudioProgress(0); };
  const resetEvForm = () => { setEvTitle(""); setEvDesc(""); setEvStreamUrl(""); setEvScheduledAt(""); setEvIsLive(false); setEditingEvId(null); };

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

  if (authLoading) return <div className="min-h-screen gradient-subtle flex items-center justify-center">Loading...</div>;
  if (!isAdmin) return null;

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
          <TabsList className="mb-4">
            <TabsTrigger value="episodes"><Music className="h-4 w-4 mr-2" />Episodes</TabsTrigger>
            <TabsTrigger value="prayers"><Heart className="h-4 w-4 mr-2" />Prayers</TabsTrigger>
            <TabsTrigger value="events"><Calendar className="h-4 w-4 mr-2" />Events</TabsTrigger>
            <TabsTrigger value="members"><Users className="h-4 w-4 mr-2" />Members</TabsTrigger>
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
                    <CardContent className="flex items-center justify-between p-4">
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
                    <CardContent className="flex items-center justify-between p-4">
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
            <div className="flex justify-between items-center mb-4">
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
                    <CardContent className="flex items-center justify-between p-4">
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
                    <CardContent className="flex items-center justify-between gap-4 p-4">
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
        </Tabs>
      </div>
    </div>
  );
};

export default AdminPage;
