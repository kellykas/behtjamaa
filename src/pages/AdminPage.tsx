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
import { ArrowLeft, Plus, Trash2, Edit, Music, Heart, Calendar, Users, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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

  // Episode form
  const [epTitle, setEpTitle] = useState("");
  const [epDesc, setEpDesc] = useState("");
  const [epAudioUrl, setEpAudioUrl] = useState("");
  const [epCategory, setEpCategory] = useState("sermon");
  const [epPublished, setEpPublished] = useState(false);
  const [epFeatured, setEpFeatured] = useState(false);
  const [epDialogOpen, setEpDialogOpen] = useState(false);
  const [editingEpId, setEditingEpId] = useState<string | null>(null);

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
  };

  useEffect(() => {
    if (isAdmin) fetchAll();
  }, [isAdmin]);

  const resetEpForm = () => { setEpTitle(""); setEpDesc(""); setEpAudioUrl(""); setEpCategory("sermon"); setEpPublished(false); setEpFeatured(false); setEditingEpId(null); };
  const resetEvForm = () => { setEvTitle(""); setEvDesc(""); setEvStreamUrl(""); setEvScheduledAt(""); setEvIsLive(false); setEditingEvId(null); };

  const handleSaveEpisode = async () => {
    const payload = { title: epTitle, description: epDesc, audio_url: epAudioUrl || null, category: epCategory, published: epPublished, featured: epFeatured, published_at: epPublished ? new Date().toISOString() : null };
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
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Episodes</h2>
              <Dialog open={epDialogOpen} onOpenChange={(o) => { setEpDialogOpen(o); if (!o) resetEpForm(); }}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-2" /> Add Episode</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingEpId ? "Edit" : "New"} Episode</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2"><Label>Title</Label><Input value={epTitle} onChange={(e) => setEpTitle(e.target.value)} required /></div>
                    <div className="space-y-2"><Label>Description</Label><Textarea value={epDesc} onChange={(e) => setEpDesc(e.target.value)} rows={3} /></div>
                    <div className="space-y-2"><Label>Audio URL</Label><Input value={epAudioUrl} onChange={(e) => setEpAudioUrl(e.target.value)} placeholder="https://..." /></div>
                    <div className="space-y-2"><Label>Category</Label><Input value={epCategory} onChange={(e) => setEpCategory(e.target.value)} /></div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2"><Switch checked={epPublished} onCheckedChange={setEpPublished} /><Label>Published</Label></div>
                      <div className="flex items-center gap-2"><Switch checked={epFeatured} onCheckedChange={setEpFeatured} /><Label>Featured</Label></div>
                    </div>
                    <Button onClick={handleSaveEpisode} className="w-full">{editingEpId ? "Update" : "Create"} Episode</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            {episodes.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No episodes yet. Add your first one!</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {episodes.map((ep) => (
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
            )}
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
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDeletePrayer(pr.id)}><Trash2 className="h-4 w-4" /></Button>
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
                    <CardContent className="flex items-center gap-4 p-4">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                        {p.display_name ? p.display_name[0].toUpperCase() : "?"}
                      </div>
                      <div>
                        <p className="font-semibold">{p.display_name || "Unnamed"}</p>
                        <p className="text-xs text-muted-foreground">Joined {format(new Date(p.created_at), "PP")}</p>
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
