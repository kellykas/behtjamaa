import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Play,
  Users,
  DollarSign,
  BookOpen,
  Mail,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type Branch = Tables<"branches">;
type BranchEvent = Tables<"branch_events">;

const EventDetailPage = () => {
  const { slug, eventId } = useParams<{ slug: string; eventId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [branch, setBranch] = useState<Branch | null>(null);
  const [event, setEvent] = useState<BranchEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (slug && eventId) fetchData();
  }, [slug, eventId]);

  const fetchData = async () => {
    const [branchRes, eventRes] = await Promise.all([
      supabase.from("branches").select("*").eq("slug", slug).single(),
      supabase.from("branch_events").select("*").eq("id", eventId).single(),
    ]);
    setBranch(branchRes.data);
    setEvent(eventRes.data);
    setLoading(false);
  };

  const handleSubscribe = () => {
    if (!email.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    setSubscribed(true);
    toast({ title: "Subscribed!", description: "You'll receive daily Bible verses." });
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  if (!event || !branch) {
    return (
      <div className="min-h-screen gradient-subtle flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="pt-8 text-center">
            <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
            <p className="text-muted-foreground mb-6">This event doesn't exist or has been removed.</p>
            <Button onClick={() => navigate(`/branches/${slug}`)}>Back to Branch</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allImages: string[] = [];
  if (event.image_url) allImages.push(event.image_url);
  if (event.images && Array.isArray(event.images)) {
    event.images.forEach((img) => {
      if (img && !allImages.includes(img)) allImages.push(img);
    });
  }

  const youtubeId = event.stream_url?.match(
    /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )?.[1];

  return (
    <div className="min-h-screen gradient-subtle">
      {/* Image Gallery / Hero */}
      {allImages.length > 0 ? (
        <div className="relative">
          <div className="h-48 md:h-72 overflow-hidden">
            <img
              src={allImages[currentImageIndex]}
              alt={event.title}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-9 h-9 flex items-center justify-center"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === currentImageIndex ? "bg-white" : "bg-white/40"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="h-20 bg-gradient-to-r from-primary/10 to-primary/5" />
      )}

      {/* Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 text-white hover:text-white/80">
            <X className="h-8 w-8" />
          </button>
          {allImages.length > 1 && (
            <>
              <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1)); }} className="absolute left-4 text-white">
                <ChevronLeft className="h-10 w-10" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); setCurrentImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1)); }} className="absolute right-4 text-white">
                <ChevronRight className="h-10 w-10" />
              </button>
            </>
          )}
          <img src={allImages[currentImageIndex]} alt="" className="max-h-[85vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate(`/branches/${slug}`)} className="mb-4" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to {branch.name}
        </Button>

        {/* Event Header - Title, Date, Location */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            {event.is_live && <Badge className="bg-red-100 text-red-800 border-transparent">LIVE</Badge>}
            <Badge variant="secondary" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {format(new Date(event.scheduled_at), "EEE, MMM d, yyyy 'at' h:mm a")}
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold mb-2">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" /> {branch.name}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {event.location}
              </span>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-5">
            {/* Description */}
            {event.description && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-lg">About This Event</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </CardContent>
              </Card>
            )}

            {/* YouTube Embed */}
            {youtubeId && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-lg flex items-center gap-2"><Play className="h-4 w-4" /> Watch Live</CardTitle></CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      className="w-full h-full"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title={event.title}
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <Card>
                <CardHeader className="pb-2"><CardTitle className="text-lg">Event Photos ({allImages.length})</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                    {allImages.map((img, i) => (
                      <button key={i} onClick={() => { setCurrentImageIndex(i); setLightboxOpen(true); }} className="rounded-lg overflow-hidden aspect-square border hover:ring-2 hover:ring-primary transition-all">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* More from this branch */}
            <Card>
              <CardContent className="pt-4 pb-4 text-center">
                <p className="text-sm text-muted-foreground mb-3">Explore more from {branch.name}</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/branches/${slug}?tab=events`)}>
                    <Calendar className="h-3.5 w-3.5 mr-1.5" /> All Events
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/branches/${slug}`)}>
                    <Users className="h-3.5 w-3.5 mr-1.5" /> Branch Portal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Sticky */}
          <div className="space-y-4 md:sticky md:top-20 md:self-start">
            {/* Branch Info + Join */}
            <Card>
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex items-center gap-3">
                  {branch.logo_url ? (
                    <img src={branch.logo_url} alt="" className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-sm">{branch.name}</p>
                    {branch.location && <p className="text-xs text-muted-foreground">{branch.location}</p>}
                  </div>
                </div>
                {branch.leader_name && (
                  <p className="text-xs text-muted-foreground">Led by <span className="font-medium text-foreground">{branch.leader_name}</span></p>
                )}
                <Button className="w-full" size="sm" onClick={() => navigate(`/branches/${slug}`)}>
                  <Users className="h-3.5 w-3.5 mr-1.5" /> Join Ministry
                </Button>
              </CardContent>
            </Card>

            {/* Donate + Daily Verse in one card */}
            <Card>
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <h3 className="font-semibold text-sm">Support This Branch</h3>
                </div>
                <p className="text-xs text-muted-foreground">Your donation helps spread the Gospel.</p>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" size="sm" onClick={() => navigate(`/branches/${slug}?tab=donations`)}>
                  <DollarSign className="h-3.5 w-3.5 mr-1.5" /> Give Now
                </Button>
                <div className="border-t pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-amber-600" />
                    <h3 className="font-semibold text-sm">Daily Bible Verse</h3>
                  </div>
                  {subscribed ? (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded p-2">Subscribed! Check your email daily.</p>
                  ) : (
                    <div className="flex gap-1.5">
                      <Input type="email" placeholder="your@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="text-xs h-8" />
                      <Button variant="outline" size="sm" className="h-8 px-3 text-amber-700 border-amber-300" onClick={handleSubscribe}>
                        <BookOpen className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact + Social in one card */}
            <Card>
              <CardContent className="pt-4 pb-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <h3 className="font-semibold text-sm">Connect</h3>
                </div>
                <div className="flex gap-2">
                  {branch.leader_email && (
                    <a href={`mailto:${branch.leader_email}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Mail className="h-3 w-3 mr-1" /> Email
                      </Button>
                    </a>
                  )}
                  {branch.phone && (
                    <a href={`tel:${branch.phone}`} className="flex-1">
                      <Button variant="outline" className="w-full" size="sm">
                        <Phone className="h-3 w-3 mr-1" /> Call
                      </Button>
                    </a>
                  )}
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-2">Follow us on social media</p>
                  <div className="flex flex-wrap gap-1.5">
                    {["Facebook", "YouTube", "Instagram", "TikTok"].map((name) => (
                      <a key={name} href={`https://${name.toLowerCase()}.com`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="h-7 text-xs px-2">
                          <ExternalLink className="h-3 w-3 mr-1" /> {name}
                        </Button>
                      </a>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-muted-foreground"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({ title: "Link copied!" });
                  }}
                >
                  <Share2 className="h-3 w-3 mr-1.5" /> Share Event
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
