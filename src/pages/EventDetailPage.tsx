import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Clock,
  Play,
  Heart,
  Users,
  DollarSign,
  BookOpen,
  Mail,
  Share2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
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

  // Daily verse subscription
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

  const handleSubscribe = async () => {
    if (!email.trim()) {
      toast({ title: "Please enter your email", variant: "destructive" });
      return;
    }
    // In a real app, this would save to a subscriptions table
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
          <div className="h-64 md:h-96 overflow-hidden">
            <img
              src={allImages[currentImageIndex]}
              alt={event.title}
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => setLightboxOpen(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          </div>
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className={`w-2 h-2 rounded-full ${i === currentImageIndex ? "bg-white" : "bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-r from-primary/10 to-primary/5" />
      )}

      {/* Lightbox */}
      {lightboxOpen && allImages.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button onClick={() => setLightboxOpen(false)} className="absolute top-4 right-4 text-white">
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

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate(`/branches/${slug}`)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to {branch.name}
        </Button>

        {/* Event Header */}
        <div className="mb-8">
          <div className="flex flex-wrap items-center gap-3 mb-3">
            {event.is_live && <Badge className="bg-red-100 text-red-800 border-transparent">LIVE NOW</Badge>}
            <Badge variant="secondary">{format(new Date(event.scheduled_at), "EEEE, MMMM d, yyyy")}</Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {format(new Date(event.scheduled_at), "h:mm a")}
            </span>
            {event.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {event.location}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {branch.name}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Description */}
            {event.description && (
              <Card>
                <CardHeader><CardTitle>About This Event</CardTitle></CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </CardContent>
              </Card>
            )}

            {/* YouTube Embed */}
            {youtubeId && (
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Play className="h-5 w-5" /> Watch Live</CardTitle></CardHeader>
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
                <CardHeader><CardTitle>Event Photos</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {allImages.map((img, i) => (
                      <button key={i} onClick={() => { setCurrentImageIndex(i); setLightboxOpen(true); }} className="rounded-lg overflow-hidden aspect-square">
                        <img src={img} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - Actions */}
          <div className="space-y-4">
            {/* Branch Info */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  {branch.logo_url ? (
                    <img src={branch.logo_url} alt="" className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{branch.name}</p>
                    {branch.location && <p className="text-xs text-muted-foreground">{branch.location}</p>}
                  </div>
                </div>
                {branch.leader_name && (
                  <p className="text-sm text-muted-foreground mb-3">
                    Led by <span className="font-medium text-foreground">{branch.leader_name}</span>
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Join Ministry */}
            <Card className="border-primary/20">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Join This Ministry</h3>
                </div>
                <p className="text-sm text-muted-foreground">Become part of {branch.name}'s community and grow in faith together.</p>
                <Button className="w-full" onClick={() => navigate(`/branches/${slug}`)}>
                  <Users className="h-4 w-4 mr-2" /> Join Ministry
                </Button>
              </CardContent>
            </Card>

            {/* Donate */}
            <Card className="border-green-200">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <h3 className="font-semibold">Support This Branch</h3>
                </div>
                <p className="text-sm text-muted-foreground">Your donation helps spread the Gospel and serve the community.</p>
                <Button className="w-full bg-green-600 hover:bg-green-700 text-white" onClick={() => navigate(`/branches/${slug}?tab=donations`)}>
                  <DollarSign className="h-4 w-4 mr-2" /> Give Now
                </Button>
              </CardContent>
            </Card>

            {/* Daily Bible Verse */}
            <Card className="border-amber-200">
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen className="h-5 w-5 text-amber-600" />
                  <h3 className="font-semibold">Daily Bible Verse</h3>
                </div>
                <p className="text-sm text-muted-foreground">Receive an inspiring scripture every morning.</p>
                {subscribed ? (
                  <div className="bg-amber-50 rounded-lg p-3 text-center">
                    <p className="text-sm font-medium text-amber-800">You're subscribed! Check your email daily.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-sm"
                    />
                    <Button variant="outline" className="w-full border-amber-300 text-amber-700 hover:bg-amber-50" onClick={handleSubscribe}>
                      <BookOpen className="h-4 w-4 mr-2" /> Subscribe
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Connect with Leader */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold">Connect with Leader</h3>
                </div>
                <p className="text-sm text-muted-foreground">Have questions? Reach out to the branch leader directly.</p>
                <div className="space-y-2">
                  {branch.leader_email && (
                    <a href={`mailto:${branch.leader_email}`}>
                      <Button variant="outline" className="w-full" size="sm">
                        <Mail className="h-4 w-4 mr-2" /> Email {branch.leader_name || "Leader"}
                      </Button>
                    </a>
                  )}
                  {branch.phone && (
                    <a href={`tel:${branch.phone}`}>
                      <Button variant="outline" className="w-full" size="sm">
                        <Mail className="h-4 w-4 mr-2" /> Call Branch
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Social Media */}
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold">Follow Us</h3>
                </div>
                <p className="text-sm text-muted-foreground">Stay connected on social media.</p>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { label: "Facebook", href: "https://facebook.com" },
                    { label: "YouTube", href: "https://youtube.com" },
                    { label: "Instagram", href: "https://instagram.com" },
                    { label: "TikTok", href: "https://tiktok.com" },
                  ].map((s) => (
                    <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-3 w-3 mr-1" /> {s.label}
                      </Button>
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Share Event */}
            <Card>
              <CardContent className="pt-6">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast({ title: "Link copied!" });
                  }}
                >
                  <Share2 className="h-4 w-4 mr-2" /> Share Event
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
