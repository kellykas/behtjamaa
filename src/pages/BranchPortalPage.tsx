import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
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
  Send,
  HandHeart,
  UserPlus,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import BranchMembersPanel from "@/components/BranchMembersPanel";
import { ImageUpload } from "@/components/ImageUpload";
import type { Tables } from "@/integrations/supabase/types";

type Branch = Tables<"branches">;

/** Tabs the portal knows about; `?tab=` may only name one of these. */
const PORTAL_TABS = ["overview", "members", "events", "services", "podcasts", "donations", "store", "prayers"];

const BranchPortalPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const { user, isAdmin, can, managesBranch, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  // Deep links like /branches/louisville?tab=events open straight on that tab.
  const [activeTab, setActiveTab] = useState(() => {
    const requested = searchParams.get("tab");
    return requested && PORTAL_TABS.includes(requested) ? requested : "overview";
  });
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

  // Leader forms
  const [evForm, setEvForm] = useState({ title: "", description: "", stream_url: "", scheduled_at: "", is_live: false, image_url: "", event_status: "upcoming" });
  const [eventImages, setEventImages] = useState<string[]>([]);
  const [svForm, setSvForm] = useState({ title: "", description: "", icon: "", bible_verse: "" });
  const [epForm, setEpForm] = useState({ title: "", description: "", audio_url: "", thumbnail_url: "", category: "sermon", published: false });
  const [stForm, setStForm] = useState({ name: "", description: "", price: 0, image_url: "", category: "", stock: 10 });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Visitor forms
  const [prayerForm, setPrayerForm] = useState({ name: "", request: "", is_anonymous: false });
  const [prayerSubmitted, setPrayerSubmitted] = useState(false);

  const [donationForm, setDonationForm] = useState({ donor_name: "", donor_email: "", amount: 50, frequency: "one_time", message: "" });
  const [donationSubmitted, setDonationSubmitted] = useState(false);

  const [memberForm, setMemberForm] = useState({ name: "", email: "", phone: "", message: "" });
  const [memberSubmitted, setMemberSubmitted] = useState(false);

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
    // NOTE: `branch_members` has no foreign key to `profiles` (it points at
    // auth.users), so embedding profiles here fails with PGRST200. Member names
    // are resolved by user_id in BranchMembersPanel instead.
    const [mem, ev, sv, ep, don, pr, st, ords] = await Promise.all([
      supabase.from("branch_members").select("*").eq("branch_id", branch.id),
      supabase.from("branch_events").select("*").eq("branch_id", branch.id).order("scheduled_at", { ascending: true }),
      supabase.from("branch_services").select("*").eq("branch_id", branch.id).order("sort_order"),
      supabase.from("branch_episodes").select("*").eq("branch_id", branch.id).order("created_at", { ascending: false }),
      supabase.from("branch_donations").select("*").eq("branch_id", branch.id).order("created_at", { ascending: false }),
      supabase.from("branch_prayers").select("*").eq("branch_id", branch.id).order("created_at", { ascending: false }),
      supabase.from("store_items").select("*").eq("branch_id", branch.id).order("created_at", { ascending: false }),
      supabase.from("store_orders").select("*").eq("branch_id", branch.id).order("created_at", { ascending: false }),
    ]);
    if (ev.error) console.error("Events fetch error:", ev.error.message);
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
  // A branch admin granted the "members" permission can run the members area of
  // the branches assigned to them, exactly like the branch leader.
  const canManageMembers = isBranchLeader || (can("members") && managesBranch(branch.id));

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
    if (!evForm.title.trim()) {
      toast({ title: "Title is required", variant: "destructive" });
      return;
    }
    if (!evForm.scheduled_at) {
      toast({ title: "Scheduled date is required", description: "Please set when this event takes place", variant: "destructive" });
      return;
    }
    const allImages = evForm.image_url ? [evForm.image_url, ...eventImages.filter(img => img !== evForm.image_url)] : eventImages;
    // Only send base columns that exist in the original table
    const basePayload = {
      branch_id: branch!.id,
      title: evForm.title.trim(),
      description: evForm.description || null,
      stream_url: evForm.stream_url || null,
      scheduled_at: evForm.scheduled_at,
      is_live: evForm.is_live || false,
      event_status: evForm.event_status || "upcoming",
    };
    const isEditing = !!editingId;
    let error;
    let savedId: string | null = null;
    if (isEditing) {
      ({ error } = await supabase.from("branch_events").update(basePayload).eq("id", editingId));
      savedId = editingId;
    } else {
      const { data: inserted, error: insertErr } = await supabase.from("branch_events").insert(basePayload).select("id").single();
      error = insertErr;
      savedId = inserted?.id || null;
    }
    // Try to save image_url and images separately (may fail if columns don't exist yet)
    if (!error && savedId) {
      const imgPayload: Record<string, unknown> = {};
      if (evForm.image_url) imgPayload.image_url = evForm.image_url;
      if (allImages.length > 0) imgPayload.images = allImages;
      if (Object.keys(imgPayload).length > 0) {
        await supabase.from("branch_events").update(imgPayload).eq("id", savedId);
      }
    }
    if (error) {
      toast({ title: "Error saving event", description: error.message, variant: "destructive" });
      return;
    }
    setEventDialog(false);
    setEditingId(null);
    setEvForm({ title: "", description: "", stream_url: "", scheduled_at: "", is_live: false, image_url: "", event_status: "upcoming" });
    setEventImages([]);
    fetchBranchData();
    toast({ title: isEditing ? "Event updated" : "Event created" });
  };

  const handleServiceSave = async () => {
    const isEditing = !!editingId;
    const payload = { branch_id: branch!.id, ...svForm };
    if (isEditing) {
      await supabase.from("branch_services").update(svForm).eq("id", editingId);
    } else {
      const { data } = await supabase.from("branch_services").select("sort_order").eq("branch_id", branch!.id).order("sort_order", { ascending: false }).limit(1);
      await supabase.from("branch_services").insert({ ...payload, sort_order: (data?.[0]?.sort_order || 0) + 1 });
    }
    setServiceDialog(false);
    setEditingId(null);
    setSvForm({ title: "", description: "", icon: "", bible_verse: "" });
    fetchBranchData();
    toast({ title: isEditing ? "Service updated" : "Service created" });
  };

  const handleEpisodeSave = async () => {
    const isEditing = !!editingId;
    const payload = { branch_id: branch!.id, ...epForm, published_at: epForm.published ? new Date().toISOString() : null };
    if (isEditing) {
      await supabase.from("branch_episodes").update(epForm).eq("id", editingId);
    } else {
      await supabase.from("branch_episodes").insert(payload);
    }
    setEpisodeDialog(false);
    setEditingId(null);
    setEpForm({ title: "", description: "", audio_url: "", thumbnail_url: "", category: "sermon", published: false });
    fetchBranchData();
    toast({ title: isEditing ? "Episode updated" : "Episode created" });
  };

  const handleStoreSave = async () => {
    const isEditing = !!editingId;
    const payload = { branch_id: branch!.id, ...stForm };
    if (isEditing) {
      await supabase.from("store_items").update(stForm).eq("id", editingId);
    } else {
      await supabase.from("store_items").insert(payload);
    }
    setStoreDialog(false);
    setEditingId(null);
    setStForm({ name: "", description: "", price: 0, image_url: "", category: "", stock: 10 });
    fetchBranchData();
    toast({ title: isEditing ? "Item updated" : "Item created" });
  };

  const handlePrayerStatus = async (id: string, status: string) => {
    await supabase.from("branch_prayers").update({ status }).eq("id", id);
    fetchBranchData();
    toast({ title: `Marked as ${status}` });
  };

  // ── Visitor: Submit Prayer Request ────────────────────────────
  const handlePrayerSubmit = async () => {
    if (!prayerForm.request.trim()) {
      toast({ title: "Please enter your prayer request", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("branch_prayers").insert({
      branch_id: branch!.id,
      user_id: user?.id || null,
      name: prayerForm.is_anonymous ? "Anonymous" : (prayerForm.name || "Anonymous"),
      request: prayerForm.request,
      is_anonymous: prayerForm.is_anonymous,
    });
    if (error) {
      toast({ title: "Failed to submit", description: error.message, variant: "destructive" });
    } else {
      setPrayerSubmitted(true);
      setPrayerForm({ name: "", request: "", is_anonymous: false });
      toast({ title: "Prayer request submitted", description: "Your request has been sent to the branch leader." });
    }
  };

  // ── Visitor: Make a Donation ──────────────────────────────────
  const handleDonationSubmit = async () => {
    if (donationForm.amount <= 0) {
      toast({ title: "Please enter a valid amount", variant: "destructive" });
      return;
    }
    const { error } = await supabase.from("branch_donations").insert({
      branch_id: branch!.id,
      user_id: user?.id || null,
      donor_name: donationForm.donor_name || "Anonymous",
      donor_email: donationForm.donor_email || null,
      amount: donationForm.amount,
      frequency: donationForm.frequency,
      message: donationForm.message || null,
      status: "completed",
    });
    if (error) {
      toast({ title: "Failed to process donation", description: error.message, variant: "destructive" });
    } else {
      setDonationSubmitted(true);
      setDonationForm({ donor_name: "", donor_email: "", amount: 50, frequency: "one_time", message: "" });
      toast({ title: "Thank you for your donation!", description: "Your generous gift supports this branch's ministry." });
    }
  };

  // ── Visitor: Request to Join ──────────────────────────────────
  const handleMemberRequest = async () => {
    if (!memberForm.name.trim() || !memberForm.email.trim()) {
      toast({ title: "Please fill in your name and email", variant: "destructive" });
      return;
    }
    // Use membership_requests table for anonymous visitors
    const { error } = await supabase.from("membership_requests").insert({
      branch_id: branch!.id,
      full_name: memberForm.name.trim(),
      email: memberForm.email.trim(),
      phone: memberForm.phone || null,
      message: memberForm.message || null,
    });
    if (error) {
      toast({ title: "Failed to submit request", description: error.message, variant: "destructive" });
    } else {
      setMemberSubmitted(true);
      setMemberForm({ name: "", email: "", phone: "", message: "" });
      toast({ title: "Membership request submitted", description: "The branch leader will review your request." });
    }
  };

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Branch Header */}
      <div className="relative">
        {branch.banner_url && (
          <div className="h-56 md:h-72 relative overflow-hidden">
            <img src={branch.banner_url} alt={branch.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>
        )}
        <div className={`max-w-6xl mx-auto px-4 ${branch.banner_url ? "relative -mt-24" : "pt-8"}`}>
          <Button variant="ghost" onClick={() => navigate("/branches")} className="mb-3">
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
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl md:text-3xl font-bold truncate">{branch.name}</h1>
              {branch.location && (
                <p className="text-muted-foreground flex items-center gap-1 mt-1 truncate">
                  <MapPin className="h-4 w-4 shrink-0" /> <span className="truncate">{branch.location}</span>
                </p>
              )}
              {branch.leader_name && (
                <p className="text-sm text-muted-foreground mt-1 truncate">Led by <span className="font-medium text-foreground">{branch.leader_name}</span></p>
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
            <TabsTrigger value="members"><Users className="h-4 w-4 mr-1" />{canManageMembers ? "Members" : "Join Us"}</TabsTrigger>
            <TabsTrigger value="events"><Calendar className="h-4 w-4 mr-1" />Events</TabsTrigger>
            <TabsTrigger value="services"><Globe className="h-4 w-4 mr-1" />Services</TabsTrigger>
            <TabsTrigger value="podcasts"><Music className="h-4 w-4 mr-1" />Podcasts</TabsTrigger>
            <TabsTrigger value="donations"><DollarSign className="h-4 w-4 mr-1" />{isBranchLeader ? "Donations" : "Give"}</TabsTrigger>
            <TabsTrigger value="store"><ShoppingBag className="h-4 w-4 mr-1" />Store</TabsTrigger>
            <TabsTrigger value="prayers"><Heart className="h-4 w-4 mr-1" />{isBranchLeader ? "Prayers" : "Pray"}</TabsTrigger>
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
                      <UserPlus className="h-4 w-4 mr-2" /> Become a Member
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("donations")}>
                      <HandHeart className="h-4 w-4 mr-2" /> Support This Branch
                    </Button>
                    <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("prayers")}>
                      <Heart className="h-4 w-4 mr-2" /> Submit Prayer Request
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
                      <div key={ev.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 border-b last:border-0 pb-3 last:pb-0">
                        <div>
                          <p className="font-medium">{ev.title}</p>
                          <p className="text-xs text-muted-foreground">{format(new Date(ev.scheduled_at), "PPP 'at' p")}</p>
                        </div>
                        {ev.event_status === "live" && <Badge className="bg-red-100 text-red-800 border-transparent">LIVE</Badge>}
                        {ev.event_status === "cancelled" && <Badge className="bg-orange-100 text-orange-800 border-transparent">CANCELLED</Badge>}
                        {ev.event_status === "past" && <Badge className="bg-gray-100 text-gray-800 border-transparent">PAST</Badge>}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* ── Members ──────────────────────────────────── */}
          <TabsContent value="members">
            {canManageMembers ? (
              /* Branch leaders and assigned branch admins manage members here */
              <BranchMembersPanel
                branchIds={[branch.id]}
                branches={[{ id: branch.id, name: branch.name }]}
                onChange={fetchBranchData}
              />
            ) : (
              /* Visitor view: request to join */
              <div className="max-w-lg mx-auto">
                <Card>
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                      <UserPlus className="h-8 w-8 text-primary" />
                    </div>
                    <CardTitle>Join {branch.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Become part of this branch's community and grow in faith together.</p>
                  </CardHeader>
                  <CardContent>
                    {memberSubmitted ? (
                      <div className="text-center py-6">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Request Submitted!</h3>
                        <p className="text-muted-foreground mb-4">Your membership request has been sent to the branch leader for approval. You'll be notified once reviewed.</p>
                        <Button variant="outline" onClick={() => setMemberSubmitted(false)}>Submit Another Request</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="member-name">Full Name *</Label>
                          <Input id="member-name" placeholder="Your full name" value={memberForm.name} onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="member-email">Email Address *</Label>
                          <Input id="member-email" type="email" placeholder="your@email.com" value={memberForm.email} onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="member-phone">Phone Number (Optional)</Label>
                          <Input id="member-phone" type="tel" placeholder="+1 (555) 000-0000" value={memberForm.phone} onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="member-message">Why do you want to join? (Optional)</Label>
                          <Textarea id="member-message" placeholder="Tell us about yourself and why you'd like to join..." value={memberForm.message} onChange={(e) => setMemberForm({ ...memberForm, message: e.target.value })} rows={3} />
                        </div>
                        <Button onClick={handleMemberRequest} className="w-full" size="lg">
                          <Send className="h-4 w-4 mr-2" /> Submit Request
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">Your request will be reviewed by the branch leader.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ── Events ───────────────────────────────────── */}
          <TabsContent value="events">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold">Events ({branchEvents.length})</h2>
              {isBranchLeader && (                  <Dialog open={eventDialog} onOpenChange={(o) => { setEventDialog(o); if (!o) { setEditingId(null); setEvForm({ title: "", description: "", stream_url: "", scheduled_at: "", is_live: false, image_url: "", event_status: "upcoming" }); setEventImages([]); } }}>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Event</Button></DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editingId ? "Edit" : "New"} Event</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2"><Label>Title</Label><Input value={evForm.title} onChange={(e) => setEvForm({ ...evForm, title: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Description</Label><Textarea value={evForm.description || ""} onChange={(e) => setEvForm({ ...evForm, description: e.target.value })} rows={3} /></div>
                      <div className="space-y-2">
                        <Label>Event Image (Optional)</Label>
                        <input type="file" accept="image/*" onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 5 * 1024 * 1024) { toast({ title: 'Image too large', description: 'Max 5MB', variant: 'destructive' }); return; }
                          const ext = file.name.split('.').pop();
                          const path = `events/${Date.now()}.${ext}`;
                          const { error } = await supabase.storage.from('profile-avatars').upload(path, file, { upsert: true });
                          if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); return; }
                          const { data } = supabase.storage.from('profile-avatars').getPublicUrl(path);
                          setEvForm({ ...evForm, image_url: data.publicUrl });
                          toast({ title: 'Image uploaded' });
                        }} className="w-full text-sm" />
                        {evForm.image_url && <img src={evForm.image_url} alt="Event" className="w-full h-32 object-cover rounded-md mt-2" />}
                      </div>
                      <div className="space-y-2">
                        <Label>Additional Images (Optional)</Label>
                        <input type="file" accept="image/*" multiple onChange={async (e) => {
                          const files = e.target.files;
                          if (!files) return;
                          for (const file of Array.from(files)) {
                            if (file.size > 5 * 1024 * 1024) { toast({ title: 'Image too large', description: 'Max 5MB each', variant: 'destructive' }); continue; }
                            const ext = file.name.split('.').pop();
                            const path = `events/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                            const { error } = await supabase.storage.from('profile-avatars').upload(path, file, { upsert: true });
                            if (error) { toast({ title: 'Upload failed', description: error.message, variant: 'destructive' }); continue; }
                            const { data } = supabase.storage.from('profile-avatars').getPublicUrl(path);
                            setEventImages(prev => [...prev, data.publicUrl]);
                          }
                          toast({ title: 'Images uploaded' });
                        }} className="w-full text-sm" />
                        {eventImages.length > 0 && (
                          <div className="flex gap-2 mt-2 flex-wrap">
                            {eventImages.map((img, i) => (
                              <div key={i} className="relative">
                                <img src={img} alt="" className="w-20 h-20 object-cover rounded-md" />
                                <button onClick={() => setEventImages(prev => prev.filter((_, idx) => idx !== i))} className="absolute -top-1 -right-1 bg-destructive text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">X</button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2"><Label>YouTube URL (Optional)</Label><Input value={evForm.stream_url || ""} onChange={(e) => setEvForm({ ...evForm, stream_url: e.target.value })} placeholder="YouTube URL for live stream" /></div>
                      <div className="space-y-2"><Label>Scheduled At *</Label><Input type="datetime-local" required value={evForm.scheduled_at ? evForm.scheduled_at.slice(0, 16) : ""} onChange={(e) => setEvForm({ ...evForm, scheduled_at: new Date(e.target.value).toISOString() })} /></div>
                      <div className="flex items-center gap-2"><Switch checked={evForm.is_live || false} onCheckedChange={(v) => setEvForm({ ...evForm, is_live: v })} /><Label>Currently Live</Label></div>
                      <div className="space-y-2">
                        <Label>Event Status</Label>
                        <div className="grid grid-cols-2 gap-2">
                          {[{ value: "upcoming", label: "Upcoming", color: "bg-blue-100 text-blue-800" }, { value: "live", label: "Live Now", color: "bg-red-100 text-red-800" }, { value: "past", label: "Past", color: "bg-gray-100 text-gray-800" }, { value: "cancelled", label: "Cancelled", color: "bg-orange-100 text-orange-800" }].map((s) => (
                            <button key={s.value} type="button" onClick={() => setEvForm({ ...evForm, event_status: s.value })} className={`px-3 py-2 rounded-md text-sm font-medium border transition-all ${evForm.event_status === s.value ? `${s.color} border-current` : "border-border text-muted-foreground hover:bg-muted"}`}>{s.label}</button>
                          ))}
                        </div>
                      </div>
                      <Button onClick={handleEventSave} className="w-full">{editingId ? "Update" : "Create"}</Button>
                      {(evForm.image_url || eventImages.length > 0) && <Button variant="ghost" size="sm" className="w-full text-destructive" onClick={() => { setEvForm({ ...evForm, image_url: "" }); setEventImages([]); }}>Remove All Images</Button>}
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
                    <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                      <div className="flex gap-3 min-w-0">
                        {ev.image_url && <img src={ev.image_url} alt="" className="w-16 h-16 rounded-md object-cover shrink-0" />}
                        {!ev.image_url && ev.images && (ev.images as string[]).length > 0 && <img src={(ev.images as string[])[0]} alt="" className="w-16 h-16 rounded-md object-cover shrink-0" />}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{ev.title}</h3>
                            {ev.event_status === "live" && <Badge className="bg-red-100 text-red-800 border-transparent">LIVE</Badge>}
                            {ev.event_status === "cancelled" && <Badge className="bg-orange-100 text-orange-800 border-transparent">CANCELLED</Badge>}
                            {ev.event_status === "past" && <Badge className="bg-gray-100 text-gray-800 border-transparent">PAST</Badge>}
                            {(!ev.event_status || ev.event_status === "upcoming") && <Badge className="bg-blue-100 text-blue-800 border-transparent">UPCOMING</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">{format(new Date(ev.scheduled_at), "PPP 'at' p")}</p>
                          {ev.description && <p className="text-sm text-muted-foreground line-clamp-1 mt-1">{ev.description}</p>}
                          <Link to={`/branches/${slug}/events/${ev.id}`} className="text-sm text-primary hover:underline mt-1 inline-block">View Details</Link>
                        </div>
                      </div>
                      {isBranchLeader && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => { setEditingId(ev.id); setEvForm({ title: ev.title, description: ev.description || "", stream_url: ev.stream_url || "", scheduled_at: ev.scheduled_at, is_live: ev.is_live || false, image_url: ev.image_url || "", event_status: ev.event_status || "upcoming" }); setEventImages((ev.images as string[]) || []); setEventDialog(true); }}><Edit className="h-4 w-4" /></Button>
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold">Branch Services ({branchServices.length})</h2>
              {isBranchLeader && (
                <Dialog open={serviceDialog} onOpenChange={(o) => { setServiceDialog(o); if (!o) { setEditingId(null); setSvForm({ title: "", description: "", icon: "", bible_verse: "" }); } }}>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Service</Button></DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
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
                    <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                      <div className="min-w-0">
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
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
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
                      <ImageUpload
                        id="episode-thumbnail"
                        label="Thumbnail"
                        value={epForm.thumbnail_url || ""}
                        onChange={(thumbnail_url) => setEpForm({ ...epForm, thumbnail_url })}
                        folder="episodes"
                        preview="thumbnail"
                      />
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
            {isBranchLeader ? (
              /* Leader view: see all donations */
              <>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-4">
                  <h2 className="text-xl font-semibold">Donations (${totalDonations.toLocaleString()} total)</h2>
                </div>
                {branchDonations.length === 0 ? (
                  <Card><CardContent className="py-8 text-center text-muted-foreground">No donations recorded yet.</CardContent></Card>
                ) : (
                  <div className="grid gap-3">
                    {branchDonations.map((d) => (
                      <Card key={d.id}>
                        <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                          <div className="min-w-0">
                            <p className="font-semibold">{d.donor_name || "Anonymous"}</p>
                            <p className="text-sm text-muted-foreground">{d.donor_email || "No email"} - {d.frequency || "one-time"}</p>
                            <p className="text-xs text-muted-foreground">{format(new Date(d.created_at), "PP")}</p>
                          </div>
                          <div className="sm:text-right">
                            <p className="text-lg font-bold text-green-600">${d.amount.toLocaleString()}</p>
                            <Badge variant={d.status === "completed" ? "default" : "secondary"}>{d.status || "pending"}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Visitor view: make a donation */
              <div className="max-w-lg mx-auto">
                <Card>
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <HandHeart className="h-8 w-8 text-green-600" />
                    </div>
                    <CardTitle>Support {branch.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">Your generous donation helps this branch spread the Gospel and serve the community.</p>
                  </CardHeader>
                  <CardContent>
                    {donationSubmitted ? (
                      <div className="text-center py-6">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Thank You!</h3>
                        <p className="text-muted-foreground mb-4">Your donation has been recorded. May God bless you for your generosity!</p>
                        <p className="text-xs text-muted-foreground italic mb-4">"Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver." - 2 Corinthians 9:7</p>
                        <Button variant="outline" onClick={() => setDonationSubmitted(false)}>Make Another Donation</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Donation Amount (USD)</Label>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[25, 50, 100, 250].map((amt) => (
                              <Button
                                key={amt}
                                variant={donationForm.amount === amt ? "default" : "outline"}
                                onClick={() => setDonationForm({ ...donationForm, amount: amt })}
                              >
                                ${amt}
                              </Button>
                            ))}
                          </div>
                          <div className="mt-2">
                            <Input
                              type="number"
                              placeholder="Custom amount"
                              value={donationForm.amount || ""}
                              onChange={(e) => setDonationForm({ ...donationForm, amount: parseFloat(e.target.value) || 0 })}
                              min="1"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Frequency</Label>
                          <div className="grid grid-cols-2 gap-2">
                            <Button variant={donationForm.frequency === "one_time" ? "default" : "outline"} onClick={() => setDonationForm({ ...donationForm, frequency: "one_time" })}>One-Time</Button>
                            <Button variant={donationForm.frequency === "monthly" ? "default" : "outline"} onClick={() => setDonationForm({ ...donationForm, frequency: "monthly" })}>Monthly</Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="donor-name">Your Name (Optional)</Label>
                          <Input id="donor-name" placeholder="Anonymous" value={donationForm.donor_name} onChange={(e) => setDonationForm({ ...donationForm, donor_name: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="donor-email">Email for Receipt (Optional)</Label>
                          <Input id="donor-email" type="email" placeholder="your@email.com" value={donationForm.donor_email} onChange={(e) => setDonationForm({ ...donationForm, donor_email: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="donor-message">Message (Optional)</Label>
                          <Textarea id="donor-message" placeholder="Leave a note..." value={donationForm.message} onChange={(e) => setDonationForm({ ...donationForm, message: e.target.value })} rows={2} />
                        </div>
                        <Button onClick={handleDonationSubmit} className="w-full" size="lg">
                          <DollarSign className="h-4 w-4 mr-2" /> Give ${donationForm.amount} {donationForm.frequency === "monthly" ? "Monthly" : "Now"}
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">Your donation is a blessing to this ministry.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* ── Store ────────────────────────────────────── */}
          <TabsContent value="store">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h2 className="text-xl font-semibold">Online Store ({storeItems.length} items)</h2>
              {isBranchLeader && (
                <Dialog open={storeDialog} onOpenChange={(o) => { setStoreDialog(o); if (!o) { setEditingId(null); setStForm({ name: "", description: "", price: 0, image_url: "", category: "", stock: 10 }); } }}>
                  <DialogTrigger asChild><Button><Plus className="h-4 w-4 mr-2" />Add Item</Button></DialogTrigger>
                  <DialogContent className="max-h-[90vh] overflow-y-auto">
                    <DialogHeader><DialogTitle>{editingId ? "Edit" : "New"} Store Item</DialogTitle></DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2"><Label>Name</Label><Input value={stForm.name} onChange={(e) => setStForm({ ...stForm, name: e.target.value })} /></div>
                      <div className="space-y-2"><Label>Description</Label><Textarea value={stForm.description || ""} onChange={(e) => setStForm({ ...stForm, description: e.target.value })} rows={3} /></div>
                      <div className="space-y-2"><Label>Price ($)</Label><Input type="number" value={stForm.price} onChange={(e) => setStForm({ ...stForm, price: parseFloat(e.target.value) || 0 })} /></div>
                      <ImageUpload
                        id="store-item-image"
                        label="Product Image"
                        value={stForm.image_url || ""}
                        onChange={(image_url) => setStForm({ ...stForm, image_url })}
                        folder="store"
                        preview="card"
                      />
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

            {isBranchLeader && storeOrders.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Recent Orders ({storeOrders.length})</h3>
                <div className="grid gap-3">
                  {storeOrders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                        <div className="min-w-0">
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
            {isBranchLeader ? (
              /* Leader view: see all prayer requests */
              <>
                <h2 className="text-xl font-semibold mb-4">Prayer Requests ({branchPrayers.length})</h2>
                {branchPrayers.length === 0 ? (
                  <Card><CardContent className="py-8 text-center text-muted-foreground">No prayer requests yet.</CardContent></Card>
                ) : (
                  <div className="grid gap-3">
                    {branchPrayers.map((pr) => (
                      <Card key={pr.id}>                          <CardContent className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4">
                          <div className="min-w-0">
                            <p className="font-semibold">{pr.is_anonymous ? "Anonymous" : pr.name}</p>
                            <p className="text-sm text-muted-foreground line-clamp-2">{pr.request}</p>
                            <p className="text-xs text-muted-foreground mt-1">{format(new Date(pr.created_at), "PP")} - {pr.prayed_count || 0} prayers</p>
                          </div>
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
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </>
            ) : (
              /* Visitor view: submit a prayer request */
              <div className="max-w-lg mx-auto">
                <Card>
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-3">
                      <Heart className="h-8 w-8 text-purple-600" />
                    </div>
                    <CardTitle>Submit a Prayer Request</CardTitle>
                    <p className="text-sm text-muted-foreground">Share your prayer needs with {branch.name}. Our leaders and community will pray for you.</p>
                  </CardHeader>
                  <CardContent>
                    {prayerSubmitted ? (
                      <div className="text-center py-6">
                        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">Prayer Request Received!</h3>
                        <p className="text-muted-foreground mb-4">Your request has been sent to the branch leader. They will keep you in their prayers.</p>
                        <p className="text-xs text-muted-foreground italic mb-4">"Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God." - Philippians 4:6</p>
                        <Button variant="outline" onClick={() => setPrayerSubmitted(false)}>Submit Another Request</Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="prayer-name">Your Name</Label>
                          <Input id="prayer-name" placeholder="Your name" value={prayerForm.name} onChange={(e) => setPrayerForm({ ...prayerForm, name: e.target.value })} />
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch id="prayer-anon" checked={prayerForm.is_anonymous} onCheckedChange={(v) => setPrayerForm({ ...prayerForm, is_anonymous: v })} />
                          <Label htmlFor="prayer-anon" className="text-sm">Submit anonymously</Label>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="prayer-request">Your Prayer Request *</Label>
                          <Textarea id="prayer-request" placeholder="Share what you'd like us to pray about..." value={prayerForm.request} onChange={(e) => setPrayerForm({ ...prayerForm, request: e.target.value })} rows={5} />
                        </div>
                        <Button onClick={handlePrayerSubmit} className="w-full" size="lg">
                          <Send className="h-4 w-4 mr-2" /> Submit Prayer Request
                        </Button>
                        <p className="text-xs text-muted-foreground text-center">Your request is confidential and only visible to branch leaders.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default BranchPortalPage;
