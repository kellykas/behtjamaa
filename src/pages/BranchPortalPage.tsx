import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  Users,
  Calendar,
  Heart,
  Music,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  Globe,
  DollarSign,
  BookOpen,
  Building2,
  Search,
  Play,
  Pause,
  Star,
  Package,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Branch = Tables<"branches">;

const BranchPortalPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLeader, setIsLeader] = useState(false);

  // Branch data
  const [branchMembers, setBranchMembers] = useState<any[]>([]);
  const [branchEvents, setBranchEvents] = useState<any[]>([]);
  const [branchServices, setBranchServices] = useState<any[]>([]);
  const [branchEpisodes, setBranchEpisodes] = useState<any[]>([]);
  const [branchDonations, setBranchDonations] = useState<any[]>([]);
  const [branchPrayers, setBranchPrayers] = useState<any[]>([]);
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [storeOrders, setStoreOrders] = useState<any[]>([]);

  // Dialogs
  const [eventDialog, setEventDialog] = useState(false);
  const [serviceDialog, setServiceDialog] = useState(false);
  const [episodeDialog, setEpisodeDialog] = useState(false);
  const [storeDialog, setStoreDialog] = useState(false);
  const [prayerDialog, setPrayerDialog] = useState(false);

  // Forms
  const [evForm, setEvForm] = useState({ title: "", description: "", stream_url: "", scheduled_at: "", is_live: false });
  const [svForm, setSvForm] = useState({ title: "", description: "", icon: "", bible_verse: "" });
  const [epForm, setEpForm] = useState({ title: "", description: "", audio_url: "", thumbnail_url: "", category: "sermon", published: false });
  const [stForm, setStForm] = useState({ name: "", description: "", price: 0, image_url: "", category: "", stock: 10 });
  const [prForm, setPrForm] = useState({ name: "", request: "", is_anonymous: false });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (slug) fetchBranch();
  }, [slug]);

  useEffect(() => {
    if (branch) fetchBranchData();
  }, [branch]);

  useEffect(() => {
    if (branch && user) {
      supabase
        .rpc("is_branch_leader", { _branch_id: branch.id, _user_id: user.id })
        .then(({ data, error }) => {
          if (error) console.error("Branch leader check failed:", error.message);
          setIsLeader(!!data);
        });
    }
  }, [branch, user]);

  const fetchBranch = async () => {
    const { data } = await supabase
      .from("branches")
      .select("*")
      .eq("slug", slug)
      .single();
    setBranch(data);
    setLoading(false);
  };

  const fetchBranchData = async () => {
    if (!branch) return;
    const [mem, ev, sv, ep, don, pr, st, ords] = await Promise.all([
      supabase.from("branch_members").select("*, profiles(display_name, avatar_url)").eq("branch_id", branch.id),
      supabase.from("branch_events").select("*").eq("branch_id", branch.id).order("scheduled_at", { ascending: true }),
      supabase.from("branch_services").select("*").eq("branch_id", branch.id).order("sort_order"),
      supabase.from("branch_episodes").select("*").eq("branch_id", branch.id).order("created_at", { ascending: false }),
      supabase.from("branch_donations").select("*").eq("branch_id", branch.id).order("created_at", { ascending: false }),
      supabase.from("branch_prayers").select("*").eq("branch_id", branch.id).order("created_at", { ascending: false }),
      supabase.from("store_items").select("*").eq("branch_id", branch.id).order("created_at", { ascending: false }),
      supabase.from("store_orders").select("*").eq("branch_id", branch.id).order("created_at", { ascending: false }),
    ]);
    setBranchMembers(mem.data || []);
    setBranchEvents(ev.data || []);
    setBranchServices(sv.data || []);
    setBranchEpisodes(ep.data || []);
    setBranchDonations(don.data || []);
    setBranchPrayers(pr.data || []);
    setStoreItems(st.data || []);
    setStoreOrders(ords.data || []);
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading branch portal...</p>
        </div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 text-center">
            <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Branch Not Found</h1>
            <p className="text-muted-foreground mb-6">This branch does not exist or is no longer active.</p>
            <Button onClick={() => navigate("/branches")}>Back to Branches</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isBranchLeader = isAdmin || isLeader;

  const totalDonations = branchDonations.reduce((sum, d) => sum + (d.amount || 0), 0);

  const BRANCH_TABLES = {
    branch_members: "branch_members" as const,
    branch_events: "branch_events" as const,
    branch_services: "branch_services" as const,
    branch_episodes: "branch_episodes" as const,
    branch_donations: "branch_donations" as const,
    branch_prayers: "branch_prayers" as const,
    store_items: "store_items" as const,
  };
  type BranchTable = keyof typeof BRANCH_TABLES;

  const handleDelete = async (table: BranchTable, id: string) => {
    await supabase.from(BRANCH_TABLES[table]).delete().eq("id", id);
    fetchBranchData();
    toast({ title: "Deleted" });
  };

  const handleEventSave = async () => {
    const payload = { branch_id: branch!.id, ...evForm };
    if (editingId) {
      await supabase.from("branch_events").update(evForm).eq("id", editingId);
    } else {
      await supabase.from("branch_events").insert(payload);
    }
    setEventDialog(false);
    setEditingId(null);
    setEvForm({ title: "", description: "", stream_url: "", scheduled_at: "", is_live: false });
    fetchBranchData();
    toast({ title: editingId ? "Event updated" : "Event created" });
  };

  const handleServiceSave = async () => {
    const payload = { branch_id: branch!.id, ...svForm };
    if (editingId) {
      await supabase.from("branch_services").update(svForm).eq("id", editingId);
    } else {
      const { data } = await supabase.from("branch_services").select("sort_order").eq("branch_id", branch!.id).order("sort_order", { ascending: false }).limit(1);
      await supabase.from("branch_services").insert({ ...payload, sort_order: (data?.[0]?.sort_order || 0) + 1 });
    }
    setServiceDialog(false);
    setEditingId(null);
    setSvForm({ title: "", description: "", icon: "", bible_verse: "" });
    fetchBranchData();
    toast({ title: editingId ? "Service updated" : "Service created" });
  };

  const handleEpisodeSave = async () => {
    const payload = { branch_id: branch!.id, ...epForm, published_at: epForm.published ? new Date().toISOString() : null };
    if (editingId) {
      await supabase.from("branch_episodes").update(epForm).eq("id", editingId);
    } else {
      await supabase.from("branch_episodes").insert(payload);
    }
    setEpisodeDialog(false);
    setEditingId(null);
    setEpForm({ title: "", description: "", audio_url: "", thumbnail_url: "", category: "sermon", published: false });
    fetchBranchData();
    toast({ title: editingId ? "Episode updated" : "Episode created" });
  };

  const handleStoreSave = async () => {
    const payload = { branch_id: branch!.id, ...stForm };
    if (editingId) {
      await supabase.from("store_items").update(stForm).eq("id", editingId);
    } else {
      await supabase.from("store_items").insert(payload);
    }
    setStoreDialog(false);
    setEditingId(null);
    setStForm({ name: "", description: "", price: 0, image_url: "", category: "", stock: 10 });
    fetchBranchData();
    toast({ title: editingId ? "Item updated" : "Item created" });
  };

  const handlePrayerStatus = async (id: string, status: string) => {
    await supabase.from("branch_prayers").update({ status }).eq("id", id);
    fetchBranchData();
    toast({ title: `Marked as ${status}` });
  };

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Branch Header */}
      <div className="relative">
        {branch.banner_url && (
          <div className="h-48 md:h-64 overflow-hidden">
            <img src={branch.banner_url} alt={branch.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
          </div>
        )}
        <div className={`max-w-6xl mx-auto px-4 ${branch.banner_url ? "relative -mt-20" : "pt-8"}`}>
          <Button variant="ghost" onClick={() => navigate("/branches")} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Branches
          </Button>
          <div className="flex items-start gap-4 mb-6">
            {branch.logo_url ? (
              <img src={branch.logo_url} alt="" className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover border-4 border-background shadow-lg shrink-0" />
            ) : (
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0 border-4 border-background shadow-lg">
                <Building2 className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground" />
              </div>
            )}
            <div>
              <h1 className="text-2xl md:text-4xl font-bold">{branch.name}</h1>
              {branch.location && (
                <p className="text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4" /> {branch.location}
                </p>
              )}
              {branch.leader_name && (
                <p className="text-sm text-muted-foreground mt-1">Led by <span className="font-medium text-foreground">{branch.leader_name}</span></p>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
            <Card><CardContent className="pt-4 pb-3 text-center">
              <Users className="h-5 w-5 mx-auto mb-1 text-blue-500" />
              <p className="text-2xl font-bold">{branchMembers.length}</p>
              <p className="text-xs text-muted-foreground">Members</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4 pb-3 text-center">
              <Calendar className="h-5 w-5 mx-auto mb-1 text-green-500" />
              <p className="text-2xl font-bold">{branchEvents.length}</p>
              <p className="text-xs text-muted-foreground">Events</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4 pb-3 text-center">
              <Music className="h-5 w-5 mx-auto mb-1 text-purple-500" />
              <p className="text-2xl font-bold">{branchEpisodes.length}</p>
              <p className="text-xs text-muted-foreground">Podcasts</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4 pb-3 text-center">
              <DollarSign className="h-5 w-5 mx-auto mb-1 text-amber-500" />
              <p className="text-2xl font-bold">${totalDonations.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Donations</p>
            </CardContent></Card>
            <Card><CardContent className="pt-4 pb-3 text-center">
              <Package className="h-5 w-5 mx-auto mb-1 text-rose-500" />
              <p className="text-2xl font-bold">{storeItems.length}</p>
              <p className="text-xs text-muted-foreground">Store Items</p>
            </CardContent></Card>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-6xl mx-auto px-4 pb-12">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            <TabsTrigger value="overview"><Building2 className="h-4 w-4 mr-1" />Overview</TabsTrigger>
            <TabsTrigger value="members"><Users className="h-4 w-4 mr-1" />Members</TabsTrigger>
            <TabsTrigger value="events"><Calendar className="h-4 w-4 mr-1" />Events</TabsTrigger>
            <TabsTrigger value="services"><Globe className="h-4 w-4 mr-1" />Services</TabsTrigger>
            <TabsTrigger value="podcasts"><Music className="h-4 w-4 mr-1" />Podcasts</TabsTrigger>
            <TabsTrigger value="donations"><DollarSign className="h-4 w-4 mr-1" />Donations</TabsTrigger>
            <TabsTrigger value="store"><ShoppingBag className="h-4 w-4 mr-1" />Store</TabsTrigger>
            <TabsTrigger value="prayers"><Heart className="h-4 w-4 mr-1" />Prayers</TabsTrigger>
          </TabsList>

          {/* ── Overview ─────────────────────────────────── */}
          <TabsContent value="overview">
            <div className="space-y-6">
              {branch.description && (
                <Card>
                  <CardHeader><CardTitle>About This Branch</CardTitle></CardHeader>
                  <CardContent><p className="text-muted-foreground leading-relaxed">{branch.description}</p></CardContent>
                </Card>
              )}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader><CardTitle className="text-lg">Contact Information</CardTitle></CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    {branch.phone && <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /> {branch.phone}</p>}
                    {branch.leader_email && <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /> {branch.leader_email}</p>}
                    {branch.location && <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-muted-foreground" /> {branch.location}</p>}
                    {!branch.phone && !branch.leader_email && !branch.location && <p className="text-muted-foreground">No contact information available.</p>}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle className="text-lg">Quick Actions</CardTitle></CardHeader>
                  <CardContent className="space-y-2">
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("members")}>
                      <Users className="h-4 w-4 mr-2" /> View Members ({branchMembers.length})
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("events")}>
                      <Calendar className="h-4 w-4 mr-2" /> View Events ({branchEvents.length})
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("podcasts")}>
                      <Music className="h-4 w-4 mr-2" /> Listen to Podcasts ({branchEpisodes.length})
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("store")}>
                      <ShoppingBag className="h-4 w-4 mr-2" /> Browse Store ({storeItems.length} items)
                    </Button>
                  </CardContent>
                </Card>
              </div>
              {/* Recent Activity */}
              {branchEvents.length > 0 && (
                <Card>
                  <CardHeader><CardTitle className="text-lg">Upcoming Events</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {branchEvents.slice(0, 3).map((ev) => (
                      <div key={ev.id} className="flex items-center justify-between border-b last:border-0 pb-3 last:pb-0">
                        <div>
                          <p className="font-medium">{ev.title}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(ev.scheduled_at), "PPP 'at' p")}</p>
                        </div>
                        {ev.is_live && <Badge className="bg-red-100 text-red-800 border-transparent">LIVE</Badge>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ── Members ──────────────────────────────────── */}
          <TabsContent value="members">
            <h2 className="text-xl font-semibold mb-4">Branch Members ({branchMembers.length})</h2>
            {branchMembers.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No members in this branch yet.</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {branchMembers.map((m: any) => (
                  <Card key={m.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold shrink-0">
                          {m.profiles?.display_name ? m.profiles.display_name[0].toUpperCase() : "?"}
                        </div>
                        <div>
                          <p className="font-medium">{m.profiles?.display_name || "Unnamed"}</p>
                          <p className="text-xs text-muted-foreground">{m.role} - Joined {format(new Date(m.joined_at), "PP")}</p>
                        </div>
                      </div>
                      {isBranchLeader && (
                        <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete("branch_members", m.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Events ───────────────────────────────────── */}
          <TabsContent value="events">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Events ({branchEvents.length})</h2>
              {isBranchLeader && (
                <Dialog open={eventDialog} onOpenChange={(o) => { setEventDialog(o); if (!o) { setEditingId(null); setEvForm({ title: "", description: "", stream_url: "", scheduled_at: "", is_live: false }); } }}>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Event</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{editingId ? "Edit" : "New"} Event</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2"><Label>Title</Label><Input value={evForm.title} onChange={(e) => setEvForm({ ...evForm, title: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Description</Label><Textarea value={evForm.description || ""} onChange={(e) => setEvForm({ ...evForm, description: e.target.value })} rows={3} /></div>
                      <div className="space-y-2"><Label>Stream URL</Label><Input value={evForm.stream_url || ""} onChange={(e) => setEvForm({ ...evForm, stream_url: e.target.value })} placeholder="YouTube embed URL" /></div>
                      <div className="space-y-2"><Label>Scheduled At</Label><Input type="datetime-local" value={evForm.scheduled_at ? evForm.scheduled_at.slice(0, 16) : ""} onChange={(e) => setEvForm({ ...evForm, scheduled_at: new Date(e.target.value).toISOString() })} /></div>
                      <div className="flex items-center gap-2"><Switch checked={evForm.is_live || false} onCheckedChange={(v) => setEvForm({ ...evForm, is_live: v })} /><Label>Currently Live</Label></div>
                      <Button onClick={handleEventSave} className="w-full">{editingId ? "Update" : "Create"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {branchEvents.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No events yet.</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {branchEvents.map((ev) => (
                  <Card key={ev.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{ev.title}</h3>
                          {ev.is_live && <Badge className="bg-red-100 text-red-800 border-transparent">LIVE</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">{format(new Date(ev.scheduled_at), "PPP 'at' p")}</p>
                        {ev.description && <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{ev.description}</p>}
                      </div>
                      {isBranchLeader && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditingId(ev.id); setEvForm({ title: ev.title, description: ev.description || "", stream_url: ev.stream_url || "", scheduled_at: ev.scheduled_at, is_live: ev.is_live || false }); setEventDialog(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete("branch_events", ev.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Services ─────────────────────────────────── */}
          <TabsContent value="services">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Branch Services ({branchServices.length})</h2>
              {isBranchLeader && (
                <Dialog open={serviceDialog} onOpenChange={(o) => { setServiceDialog(o); if (!o) { setEditingId(null); setSvForm({ title: "", description: "", icon: "", bible_verse: "" }); } }}>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Service</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{editingId ? "Edit" : "New"} Service</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2"><Label>Title</Label><Input value={svForm.title} onChange={(e) => setSvForm({ ...svForm, title: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Description</Label><Textarea value={svForm.description || ""} onChange={(e) => setSvForm({ ...svForm, description: e.target.value })} rows={3} /></div>
                      <div className="space-y-2"><Label>Icon</Label><Input value={svForm.icon || ""} onChange={(e) => setSvForm({ ...svForm, icon: e.target.value })} placeholder="e.g. Globe, Heart" /></div>
                      <div className="space-y-2"><Label>Bible Verse</Label><Input value={svForm.bible_verse || ""} onChange={(e) => setSvForm({ ...svForm, bible_verse: e.target.value })} placeholder="e.g. Matthew 28:19" /></div>
                      <Button onClick={handleServiceSave} className="w-full">{editingId ? "Update" : "Create"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {branchServices.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No services yet.</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {branchServices.map((sv) => (
                  <Card key={sv.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <h3 className="font-semibold">{sv.title}</h3>
                        {sv.description && <p className="text-sm text-muted-foreground line-clamp-1">{sv.description}</p>}
                        {sv.bible_verse && <p className="text-xs text-primary italic mt-1">{sv.bible_verse}</p>}
                      </div>
                      {isBranchLeader && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditingId(sv.id); setSvForm({ title: sv.title, description: sv.description || "", icon: sv.icon || "", bible_verse: sv.bible_verse || "" }); setServiceDialog(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete("branch_services", sv.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Podcasts ─────────────────────────────────── */}
          <TabsContent value="podcasts">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Podcast Episodes ({branchEpisodes.length})</h2>
              {isBranchLeader && (
                <Dialog open={episodeDialog} onOpenChange={(o) => { setEpisodeDialog(o); if (!o) { setEditingId(null); setEpForm({ title: "", description: "", audio_url: "", thumbnail_url: "", category: "sermon", published: false }); } }}>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Episode</Button></DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editingId ? "Edit" : "New"} Episode</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2"><Label>Title</Label><Input value={epForm.title} onChange={(e) => setEpForm({ ...epForm, title: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Description</Label><Textarea value={epForm.description || ""} onChange={(e) => setEpForm({ ...epForm, description: e.target.value })} rows={3} /></div>
                      <div className="space-y-2"><Label>Audio URL</Label><Input value={epForm.audio_url || ""} onChange={(e) => setEpForm({ ...epForm, audio_url: e.target.value })} placeholder="https://..." /></div>
                      <div className="space-y-2"><Label>Thumbnail URL</Label><Input value={epForm.thumbnail_url || ""} onChange={(e) => setEpForm({ ...epForm, thumbnail_url: e.target.value })} placeholder="https://..." /></div>
                      <div className="space-y-2"><Label>Category</Label><Input value={epForm.category || "sermon"} onChange={(e) => setEpForm({ ...epForm, category: e.target.value })} /></div>
                      <div className="flex items-center gap-2"><Switch checked={epForm.published || false} onCheckedChange={(v) => setEpForm({ ...epForm, published: v })} /><Label>Published</Label></div>
                      <Button onClick={handleEpisodeSave} className="w-full">{editingId ? "Update" : "Create"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {branchEpisodes.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No podcast episodes yet.</CardContent></Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {branchEpisodes.map((ep) => (
                  <Card key={ep.id}>
                    <CardContent className="p-4">
                      {ep.thumbnail_url && <img src={ep.thumbnail_url} alt={ep.title} className="w-full h-36 object-cover rounded-md mb-3" />}
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-100 text-blue-800 border-transparent text-xs">{ep.category}</Badge>
                        {ep.published && <Badge className="bg-green-100 text-green-800 border-transparent text-xs">Published</Badge>}
                      </div>
                      <h3 className="font-semibold">{ep.title}</h3>
                      {ep.description && <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{ep.description}</p>}
                      {ep.audio_url && (
                        <a href={ep.audio_url} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="mt-3" variant="outline"><Play className="h-4 w-4 mr-1" /> Listen</Button>
                        </a>
                      )}
                      {isBranchLeader && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={() => { setEditingId(ep.id); setEpForm({ title: ep.title, description: ep.description || "", audio_url: ep.audio_url || "", thumbnail_url: ep.thumbnail_url || "", category: ep.category || "sermon", published: ep.published || false }); setEpisodeDialog(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete("branch_episodes", ep.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Donations ────────────────────────────────── */}
          <TabsContent value="donations">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Donations (${totalDonations.toLocaleString()} total)</h2>
            </div>
            {branchDonations.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No donations recorded yet.</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {branchDonations.map((d) => (
                  <Card key={d.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-semibold">{d.donor_name || "Anonymous"}</p>
                        <p className="text-sm text-muted-foreground">{d.donor_email || "No email"} - {d.frequency || "one-time"}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(d.created_at), "PP")}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">${d.amount.toLocaleString()}</p>
                        <Badge variant={d.status === "completed" ? "default" : "secondary"}>{d.status || "pending"}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Store ────────────────────────────────────── */}
          <TabsContent value="store">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Online Store ({storeItems.length} items)</h2>
              {isBranchLeader && (
                <Dialog open={storeDialog} onOpenChange={(o) => { setStoreDialog(o); if (!o) { setEditingId(null); setStForm({ name: "", description: "", price: 0, image_url: "", category: "", stock: 10 }); } }}>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Item</Button></DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>{editingId ? "Edit" : "New"} Store Item</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2"><Label>Name</Label><Input value={stForm.name} onChange={(e) => setStForm({ ...stForm, name: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Description</Label><Textarea value={stForm.description || ""} onChange={(e) => setStForm({ ...stForm, description: e.target.value })} rows={3} /></div>
                      <div className="space-y-2"><Label>Price ($)</Label><Input type="number" value={stForm.price} onChange={(e) => setStForm({ ...stForm, price: parseFloat(e.target.value) || 0 })} /></div>
                      <div className="space-y-2"><Label>Image URL</Label><Input value={stForm.image_url || ""} onChange={(e) => setStForm({ ...stForm, image_url: e.target.value })} placeholder="https://..." /></div>
                      <div className="space-y-2"><Label>Category</Label><Input value={stForm.category || ""} onChange={(e) => setStForm({ ...stForm, category: e.target.value })} placeholder="e.g. Merch, Books" /></div>
                      <div className="space-y-2"><Label>Stock</Label><Input type="number" value={stForm.stock || 0} onChange={(e) => setStForm({ ...stForm, stock: parseInt(e.target.value) || 0 })} /></div>
                      <Button onClick={handleStoreSave} className="w-full">{editingId ? "Update" : "Create"}</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
            {storeItems.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No store items yet.</CardContent></Card>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {storeItems.map((item) => (
                  <Card key={item.id} className="overflow-hidden">
                    {item.image_url && <img src={item.image_url} alt={item.name} className="w-full h-40 object-cover" />}
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-semibold">{item.name}</h3>
                        {item.category && <Badge variant="secondary" className="text-xs">{item.category}</Badge>}
                      </div>
                      {item.description && <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>}
                      <div className="flex items-center justify-between">
                        <p className="text-lg font-bold">${item.price}</p>
                        <p className="text-xs text-muted-foreground">{item.stock} in stock</p>
                      </div>
                      {isBranchLeader && (
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" variant="outline" onClick={() => { setEditingId(item.id); setStForm({ name: item.name, description: item.description || "", price: item.price, image_url: item.image_url || "", category: item.category || "", stock: item.stock || 0 }); setStoreDialog(true); }}><Edit className="h-4 w-4" /></Button>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete("store_items", item.id)}><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {storeOrders.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Recent Orders ({storeOrders.length})</h3>
                <div className="grid gap-3">
                  {storeOrders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div>
                          <p className="font-semibold">{order.customer_name || "Guest"}</p>
                          <p className="text-sm text-muted-foreground">{order.customer_email || "No email"}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(order.created_at), "PP")}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold">${order.total}</p>
                          <Badge variant={order.status === "delivered" ? "default" : order.status === "shipped" ? "secondary" : "outline"}>{order.status || "pending"}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Prayers ──────────────────────────────────── */}
          <TabsContent value="prayers">
            <h2 className="text-xl font-semibold mb-4">Prayer Requests ({branchPrayers.length})</h2>
            {branchPrayers.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">No prayer requests yet.</CardContent></Card>
            ) : (
              <div className="grid gap-3">
                {branchPrayers.map((pr) => (
                  <Card key={pr.id}>
                    <CardContent className="flex items-center justify-between p-4">
                      <div>
                        <p className="font-semibold">{pr.is_anonymous ? "Anonymous" : pr.name}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{pr.request}</p>
                        <p className="text-xs text-muted-foreground mt-1">{format(new Date(pr.created_at), "PP")} - {pr.prayed_count || 0} prayers</p>
                      </div>
                      {isBranchLeader && (
                        <div className="flex items-center gap-2">
                          <Select value={pr.status || "pending"} onValueChange={(v) => handlePrayerStatus(pr.id, v)}>
                            <SelectTrigger className="w-28 h-9"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="praying">Praying</SelectItem>
                              <SelectItem value="answered">Answered</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button size="sm" variant="outline" className="text-destructive" onClick={() => handleDelete("branch_prayers", pr.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
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

export default BranchPortalPage;
