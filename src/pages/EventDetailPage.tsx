import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { firstImageUrl } from "@/lib/utils";
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
  ArrowRight,
  Copy,
  Check,
  MessageCircle,
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
  const [linkCopied, setLinkCopied] = useState(false);

  const eventUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `Check out this event: ${event?.title || "BEHT JAMAA Event"}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: event?.title, text: shareText, url: eventUrl });
      } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(eventUrl);
      setLinkCopied(true);
      toast({ title: "Link copied!", description: "Share this event with your friends." });
      setTimeout(() => setLinkCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(eventUrl);
    setLinkCopied(true);
    toast({ title: "Link copied!", description: "Share this event with your friends." });
    setTimeout(() => setLinkCopied(false), 2000);
  };

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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900" />
      </div>
    );
  }

  if (!event || !branch) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)" }}>
        <Card className="max-w-md w-full mx-4 rounded-3xl border-0 shadow-lg">
          <CardContent className="pt-8 text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Event Not Found</h1>
            <p className="text-slate-500 mb-6">This event doesn't exist or has been removed.</p>
            <Button onClick={() => navigate(`/branches/${slug}`)} className="bg-slate-900 hover:bg-slate-800 text-white rounded-full">
              Back to Branch
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const allImages: string[] = [];
  if (event.image_url) allImages.push(event.image_url);
  if (Array.isArray(event.images)) {
    event.images.forEach((img) => {
      const url = typeof img === "string" ? img : "";
      if (url && !allImages.includes(url)) allImages.push(url);
    });
  }

  const youtubeId = event.stream_url?.match(
    /(?:youtube\.com\/(?:embed\/|watch\?v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  )?.[1];

  return (
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)" }}>
      {/* Image Gallery / Hero */}
      {allImages.length > 0 ? (
        <div className="relative">
          <div className="h-64 md:h-96 overflow-hidden">
            <img
              src={allImages[currentImageIndex]}
              alt={event.title}
              className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
              onClick={() => setLightboxOpen(true)}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          </div>
          {allImages.length > 1 && (
            <>
              <button
                onClick={() => setCurrentImageIndex((i) => (i === 0 ? allImages.length - 1 : i - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/30"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() => setCurrentImageIndex((i) => (i === allImages.length - 1 ? 0 : i + 1))}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-all border border-white/30"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {allImages.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentImageIndex(i)}
                    className="rounded-full transition-all"
                    style={{
                      width: i === currentImageIndex ? 24 : 8,
                      height: 8,
                      background: i === currentImageIndex ? "white" : "rgba(255,255,255,0.4)",
                    }}
                  />
                ))}
              </div>
            </>
          )}
          {/* Event title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-5xl mx-auto">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                {event.event_status === "live" && (
                  <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg">
                    <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    LIVE
                  </span>
                )}
                {event.event_status === "cancelled" && (
                  <span className="px-3 py-1.5 rounded-full bg-orange-500 text-white text-xs font-bold">CANCELLED</span>
                )}
                {event.event_status === "past" && (
                  <span className="px-3 py-1.5 rounded-full bg-slate-500 text-white text-xs font-bold">PAST EVENT</span>
                )}
                <span className="px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md text-white text-xs font-medium border border-white/30">
                  <Clock className="h-3 w-3 inline mr-1" />
                  {format(new Date(event.scheduled_at), "EEE, MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-white drop-shadow-lg">{event.title}</h1>
            </div>
          </div>
        </div>
      ) : (
        <div className="h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />
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
          <img src={allImages[currentImageIndex]} alt="" className="max-h-[85vh] max-w-[90vw] object-contain rounded-2xl" onClick={(e) => e.stopPropagation()} />
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Back button */}
        <Button variant="ghost" onClick={() => navigate(`/branches/${slug}`)} className="mb-6" size="sm">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to {branch.name}
        </Button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-5">
            {/* Branch + Location */}
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" /> {branch.name}
              </span>
              {event.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" /> {event.location}
                </span>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <Card className="rounded-3xl border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-slate-900">About This Event</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-500 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </CardContent>
              </Card>
            )}

            {/* YouTube Embed */}
            {youtubeId && (
              <Card className="rounded-3xl border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-slate-900 flex items-center gap-2">
                    <Play className="h-4 w-4" /> Watch Live
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video rounded-2xl overflow-hidden">
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
              <Card className="rounded-3xl border-0 shadow-md">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-slate-900">Event Photos ({allImages.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                    {allImages.map((img, i) => (
                      <button
                        key={i}
                        onClick={() => { setCurrentImageIndex(i); setLightboxOpen(true); }}
                        className="rounded-xl overflow-hidden aspect-square border-2 border-slate-100 hover:border-blue-500 hover:shadow-lg transition-all"
                      >
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* More from this branch */}
            <Card className="rounded-3xl border-0 shadow-md">
              <CardContent className="pt-6 pb-6 text-center">
                <p className="text-sm text-slate-500 mb-4">Explore more from {branch.name}</p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-full border-slate-200"
                    onClick={() => navigate(`/branches/${slug}?tab=events`)}
                  >
                    <Calendar className="h-3.5 w-3.5 mr-1.5" /> All Events
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white"
                    onClick={() => navigate(`/branches/${slug}`)}
                  >
                    <Users className="h-3.5 w-3.5 mr-1.5" /> Branch Portal
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Sticky */}
          <div className="space-y-4 md:sticky md:top-20 md:self-start">
            {/* Branch Info + Join */}
            <Card className="rounded-3xl border-0 shadow-md">
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="flex items-center gap-3">
                  {branch.logo_url ? (
                    <img src={branch.logo_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                      <Users className="h-6 w-6 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-slate-900">{branch.name}</p>
                    {branch.location && <p className="text-xs text-slate-500">{branch.location}</p>}
                  </div>
                </div>
                {branch.leader_name && (
                  <p className="text-xs text-slate-500">Led by <span className="font-medium text-slate-900">{branch.leader_name}</span></p>
                )}
                <Button
                  className="w-full rounded-full bg-slate-900 hover:bg-slate-800 text-white"
                  size="sm"
                  onClick={() => navigate(`/branches/${slug}`)}
                >
                  <Users className="h-3.5 w-3.5 mr-1.5" /> Join Ministry
                </Button>
              </CardContent>
            </Card>

            {/* Share Event */}
            <Card className="rounded-3xl border-0 shadow-md">
              <CardContent className="pt-6 pb-6 space-y-3">
                <div className="flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Share This Event</h3>
                </div>
                {"share" in navigator && (
                  <Button
                    className="w-full rounded-full bg-blue-600 hover:bg-blue-700 text-white"
                    size="sm"
                    onClick={handleShare}
                  >
                    <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
                  </Button>
                )}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-[#1877F2] text-white text-xs font-medium hover:bg-[#166FE5] transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    Facebook
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(eventUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-black text-white text-xs font-medium hover:bg-slate-800 transition-colors"
                  >
                    <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    X
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(shareText + " " + eventUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-[#25D366] text-white text-xs font-medium hover:bg-[#20BA5A] transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    WhatsApp
                  </a>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
                  >
                    {linkCopied ? <Check className="h-3.5 w-3.5 text-green-600" /> : <Copy className="h-3.5 w-3.5" />}
                    {linkCopied ? "Copied!" : "Copy Link"}
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Donate + Daily Verse */}
            <Card className="rounded-3xl border-0 shadow-md">
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Support This Branch</h3>
                </div>
                <p className="text-xs text-slate-500">Your donation helps spread the Gospel.</p>
                <Button
                  className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="sm"
                  onClick={() => navigate(`/branches/${slug}?tab=donations`)}
                >
                  <DollarSign className="h-3.5 w-3.5 mr-1.5" /> Give Now
                </Button>
                <div className="border-t border-slate-100 pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4 text-amber-600" />
                    <h3 className="font-bold text-slate-900 text-sm">Daily Bible Verse</h3>
                  </div>
                  {subscribed ? (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded-xl p-3">Subscribed! Check your email daily.</p>
                  ) : (
                    <div className="flex gap-2">
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="text-xs h-9 rounded-full"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-9 px-4 rounded-full text-amber-700 border-amber-200 hover:bg-amber-50"
                        onClick={handleSubscribe}
                      >
                        <BookOpen className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact + Social */}
            <Card className="rounded-3xl border-0 shadow-md">
              <CardContent className="pt-6 pb-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Connect</h3>
                </div>
                <div className="flex gap-2">
                  {branch.leader_email && (
                    <a href={`mailto:${branch.leader_email}`} className="flex-1">
                      <Button variant="outline" className="w-full rounded-full" size="sm">
                        <Mail className="h-3 w-3 mr-1" /> Email
                      </Button>
                    </a>
                  )}
                  {branch.phone && (
                    <a href={`tel:${branch.phone}`} className="flex-1">
                      <Button variant="outline" className="w-full rounded-full" size="sm">
                        <Phone className="h-3 w-3 mr-1" /> Call
                      </Button>
                    </a>
                  )}
                </div>
                <div className="border-t border-slate-100 pt-4">
                  <p className="text-xs text-slate-500 mb-3">Follow us on social media</p>
                  <div className="flex flex-wrap gap-2">
                    {["Facebook", "YouTube", "Instagram", "TikTok"].map((name) => (
                      <a key={name} href={`https://${name.toLowerCase()}.com`} target="_blank" rel="noopener noreferrer">
                        <Button variant="outline" size="sm" className="h-8 text-xs px-3 rounded-full">
                          <ExternalLink className="h-3 w-3 mr-1" /> {name}
                        </Button>
                      </a>
                    ))}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-slate-500 hover:text-slate-900 rounded-full"
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
