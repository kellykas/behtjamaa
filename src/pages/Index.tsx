import { Calendar, Heart, Users, Bell, Play, LogIn, LogOut, Menu, X, Pause, Eye, Target, BookOpen, Handshake, Theater, UsersRound, Globe, HeartHandshake, ExternalLink, Mail, Building2, MapPin, Music, ChevronLeft, ChevronRight, SkipBack, SkipForward, Volume2, ArrowRight, Star, Clock, MapPinned, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { getDailyVerse } from "@/lib/dailyScripture";
import { useSiteSettings } from "@/hooks/useContent";

/* ─── Hero ────────────────────────────────────────────────────── */
const HeroSection = () => {
  const { settings } = useSiteSettings();
  const heroImage = settings.hero_image_url || "";
  const [searchTab, setSearchTab] = useState<"events" | "branches" | "podcasts">("events");

  return (
    <section className="relative h-auto min-h-[85vh] md:min-h-screen overflow-hidden">
      {/* Background image or gradient */}
      {heroImage ? (
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url('${heroImage}')` }}
        />
      ) : (
        <div className="absolute inset-0 bg-[#1a2744]" />
      )}

      {/* Solid overlay for text readability */}
      <div className="absolute inset-0 bg-black/55" />

      {/* Content — bottom-aligned with clearance for navbar + bottom nav */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 pt-16 sm:pt-24 md:pt-44 pb-24 md:pb-20 flex flex-col justify-end">
        {/* Top badges row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 sm:mb-8">
          {/* Pill badges */}
          <div className="hidden sm:flex items-center gap-1 bg-white/15 backdrop-blur-md rounded-full px-5 py-2.5 border border-white/20 w-fit">
            <span className="text-white/90 text-sm font-medium">Reach</span>
            <span className="text-white/40 mx-1.5">•</span>
            <span className="text-white/90 text-sm font-medium">and</span>
            <span className="text-white/40 mx-1.5">•</span>
            <span className="text-white/90 text-sm font-medium">Preach</span>
          </div>

          {/* Trust badge */}
          <div className="flex items-center gap-2.5 bg-white/15 backdrop-blur-md rounded-full pl-1.5 pr-3.5 py-1.5 border border-white/20 w-fit">              <div className="flex -space-x-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-7 h-7 rounded-full border-2 border-white/30 bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold"
                  style={{ zIndex: 3 - i }}
                >
                  {"BJT"[i]}
                </div>
              ))}
            </div>
            <div className="text-right">
              <p className="text-white text-xs font-bold leading-tight">Trusted by 25K+</p>
              <p className="text-white/60 text-[10px] leading-tight">Youth Members</p>
            </div>
          </div>
        </div>

        {/* Headline */}
        <div className="max-w-2xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-1 sm:mb-2 leading-[1.1] tracking-tight">
            BEHT JAMAA
          </h1>
          <h2 className="text-[14px] sm:text-lg md:text-2xl font-bold text-amber-400 mb-3 sm:mb-4 md:tracking-wide uppercase leading-tight">
            Boyz Evangelists of the Holy Trinity
          </h2>
          <p className="text-[12px] sm:text-base md:text-lg text-white/70 mb-4 sm:mb-6 md:mb-8 max-w-lg leading-relaxed">
            Winning souls for the Glory of our Lord Jesus Christ through Arts, empowering youths for a life of discipleship, ministry and service.
          </p>
        </div>

        {/* Search bar — glass pill */}
        <div className="w-full max-w-3xl mt-2 sm:mt-3">
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-2">
            {/* Tabs */}
            <div className="flex gap-1 mb-2 px-2">
              {(["events", "branches", "podcasts"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSearchTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all ${
                    searchTab === tab
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-white/60 hover:text-white hover:bg-white/10"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Search input row */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2 sm:gap-3 bg-white rounded-xl px-3 sm:px-4 py-2.5 sm:py-3">
                <Search className="h-5 w-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder={
                    searchTab === "events"
                      ? "Search events, workshops, gatherings..."
                      : searchTab === "branches"
                      ? "Search branches by location..."
                      : "Search podcasts, sermons, testimonies..."
                  }
                  className="flex-1 bg-transparent text-slate-900 text-sm placeholder:text-slate-400 outline-none"
                />
              </div>
              <Link
                to={
                  searchTab === "events"
                    ? "/"
                    : searchTab === "branches"
                    ? "/branches"
                    : "/"
                }
                className="h-10 sm:h-12 px-4 sm:px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm flex items-center gap-2 transition-all shadow-lg shrink-0"
              >
                <Search className="h-4 w-4" />
                Search
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div className="flex flex-wrap gap-2 mt-3 pb-2 sm:pb-0">
            <Link to="/branches" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/80 hover:text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 transition-all">
              <Building2 className="h-3 w-3" /> Find a Branch
            </Link>
            <a href="#featured" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/80 hover:text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 transition-all">
              <Play className="h-3 w-3" /> Listen Now
            </a>
            <Link to="/auth" className="inline-flex items-center gap-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white/80 hover:text-white text-xs font-medium px-3 py-1.5 rounded-full border border-white/10 transition-all">
              <Users className="h-3 w-3" /> Join Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Vision / Mission / Confession ──────────────────────────── */
const beliefItems = [
  {
    icon: Eye,
    title: "Vision",
    text: "To create Youth Worship Centers across the planet for evangelism, discipleship and worship according to Matthew 28:18-19.",
    accent: "from-blue-500 to-blue-600",
  },
  {
    icon: Target,
    title: "Mission",
    text: "Win Souls for Jesus Christ and empower the youths for evangelism (Isaiah 52:7; Romans 10:15).",
    accent: "from-emerald-500 to-emerald-600",
  },
  {
    icon: BookOpen,
    title: "Confession",
    text: "We believe in the Holy Trinity (God Father, Son and Holy Spirit as one God). The Bible is our reference (2 Timothy 3:16-17). The Holy Spirit is the source of our inspiration.",
    accent: "from-purple-500 to-purple-600",
  },
];

const BeliefSection = () => (
  <section className="py-20 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <Badge className="mb-3">About Us</Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Foundation</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Everything we do is rooted in the Word of God and guided by the Holy Spirit.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {beliefItems.map((item) => (
          <Card key={item.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-8 pb-6 px-6 text-center">
              <div className={`w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${item.accent} flex items-center justify-center`}>
                <item.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed text-sm">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Services ────────────────────────────────────────────────── */
const services = [
  { icon: Globe, title: "Evangelism", desc: "Winning youths for Christ across communities and campuses.", color: "bg-red-100 text-red-600 group-hover:bg-red-200" },
  { icon: Theater, title: "Artistic Activities", desc: "Empowering them for a life of discipleship, ministry and service through the arts, touching the spirit, soul and body with the power of the Holy Spirit.", color: "bg-blue-100 text-blue-600 group-hover:bg-blue-200" },
  { icon: Handshake, title: "Community Service", desc: "Empowering youths for usefulness to their communities through active service.", color: "bg-green-100 text-green-600 group-hover:bg-green-200" },
  { icon: UsersRound, title: "Workshops & Festivals", desc: "Starting from where the youths are, with their spiritual, physical, intellectual, social and financial needs, to attract them and launch them in a process of growth.", color: "bg-amber-100 text-amber-600 group-hover:bg-amber-200" },
  { icon: HeartHandshake, title: "Humanitarian", desc: "Engaging non-believers, especially young people, and sharing the love of Christ with them through tangible acts of care.", color: "bg-purple-100 text-purple-600 group-hover:bg-purple-200" },
];

const ServicesPreview = () => (
  <section id="services" className="py-20 px-4 bg-background scroll-mt-20">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <Badge className="mb-3">Our Services</Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">This Is How We Bring Transformation</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Five ministry pillars working together to win souls and raise a generation of Christ-centered youth.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {services.map((svc) => (
          <Card key={svc.title} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${svc.color}`}>
                <svc.icon className="h-6 w-6" />
              </div>
              <h3 className="font-bold text-lg mb-2">{svc.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{svc.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center">
        <Link to="/services">
          <Button variant="outline" size="lg" className="gap-2">
            View All Services <ExternalLink className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

/* ─── Events Carousel — Case Studies Style (Improved) ─────────── */
const EventsPreview = () => {
  const [events, setEvents] = useState<Tables<"branch_events">[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    supabase
      .from("branch_events")
      .select("*, branches!inner(name, slug)")
      .in("event_status", ["upcoming", "live"])
      .order("scheduled_at", { ascending: true })
      .limit(8)
      .then(({ data }) => {
        setEvents((data as any) || []);
        setLoading(false);
      });
  }, []);

  const goNext = () => {
    if (activeIdx < events.length - 1) setActiveIdx((i) => i + 1);
  };
  const goPrev = () => {
    if (activeIdx > 0) setActiveIdx((i) => i - 1);
  };

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setIsDragging(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    setTouchDelta(e.touches[0].clientX - touchStart);
  };
  const handleTouchEnd = () => {
    if (Math.abs(touchDelta) > 60) {
      if (touchDelta < 0 && activeIdx < events.length - 1) goNext();
      else if (touchDelta > 0 && activeIdx > 0) goPrev();
    }
    setTouchStart(null);
    setTouchDelta(0);
    setIsDragging(false);
  };

  if (!loading && events.length === 0) return null;

  return (
    <section className="py-24 px-4" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)" }}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-slate-900 text-white mb-4">Events</span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">What We've Planned</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Upcoming events, workshops, and gatherings across our branches.
          </p>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {[1, 2].map((i) => (
              <div key={i} className="shrink-0 w-[700px] rounded-3xl overflow-hidden bg-white shadow-lg">
                <div className="flex flex-col md:flex-row">
                  <Skeleton className="w-full md:w-[320px] h-[280px] shrink-0" />
                  <div className="flex-1 p-8 space-y-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="overflow-hidden">
              <div
                className="flex gap-6 transition-transform"
                style={{
                  transform: `translateX(calc(-${activeIdx} * (min(700px, 100vw - 2rem) + 1.5rem))${isDragging ? ` + ${touchDelta}px` : ""})`,
                  transitionDuration: isDragging ? "0ms" : "600ms",
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="shrink-0 rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 group"
                    style={{ width: "min(700px, calc(100vw - 2rem))" }}
                  >
                    <div className="flex flex-col md:flex-row">
                      {/* Image */}
                      <div className="w-full md:w-[320px] h-[280px] md:h-auto shrink-0 relative overflow-hidden">
                        {event.images && Array.isArray(event.images) && event.images.length > 0 ? (
                          <img src={event.images[0]} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                            <Calendar className="h-16 w-16 text-white/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/15" />
                        {event.event_status === "live" && (
                          <div className="absolute top-4 left-4">
                            <span className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500 text-white text-xs font-bold shadow-lg">
                              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                              LIVE
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 p-8">
                        <div className="flex items-center gap-2 mb-3">
                          {(event as any).branches?.name && (
                            <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">{(event as any).branches.name}</span>
                          )}
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${event.event_status === "live" ? "bg-red-50 text-red-700 border border-red-100" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>
                            {event.event_status === "live" ? "Happening Now" : "Upcoming"}
                          </span>
                        </div>

                        <h3 className="text-2xl font-bold text-slate-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">{event.title}</h3>
                        {event.description && (
                          <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-3">{event.description}</p>
                        )}

                        <div className="flex items-center gap-6 mb-6">
                          {event.scheduled_at && (
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                              <Clock className="h-4 w-4" />
                              <span>{new Date(event.scheduled_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                            </div>
                          )}
                          {event.location && (
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                              <MapPinned className="h-4 w-4" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-4">
                          {event.stream_url && (
                            <a href={event.stream_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-all hover:shadow-lg hover:shadow-slate-900/20">
                              <Play className="h-4 w-4" /> Watch Live
                            </a>
                          )}
                          <Link to={`/branches/${(event as any).branches?.slug || ""}/events/${event.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:gap-3 transition-all">
                            View Event <ArrowRight className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Arrows */}
            {activeIdx > 0 && (
              <button onClick={goPrev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center hover:scale-110 transition-all border border-slate-100">
                <ChevronLeft className="h-5 w-5 text-slate-700" />
              </button>
            )}
            {activeIdx < events.length - 1 && (
              <button onClick={goNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center hover:scale-110 transition-all border border-slate-100">
                <ChevronRight className="h-5 w-5 text-slate-700" />
              </button>
            )}

            {/* Dots */}
            {events.length > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {events.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className="rounded-full transition-all"
                    style={{
                      width: i === activeIdx ? 32 : 8,
                      height: 8,
                      background: i === activeIdx ? "#0f172a" : "#e2e8f0",
                      transition: "all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="text-center mt-10">
            <Link to="/branches">
              <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                Explore All Events <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

/* ─── Branches Preview — Improved Horizontal Carousel ─────────── */
const BranchesPreview = () => {
  const [branches, setBranches] = useState<Tables<"branches">[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIdx, setActiveIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    supabase
      .from("branches")
      .select("*")
      .eq("active", true)
      .order("name")
      .limit(8)
      .then(({ data }) => {
        setBranches(data || []);
        setLoading(false);
      });
  }, []);

  const goNext = () => {
    if (activeIdx < branches.length - 1) setActiveIdx((i) => i + 1);
  };
  const goPrev = () => {
    if (activeIdx > 0) setActiveIdx((i) => i - 1);
  };

  // Touch/swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setIsDragging(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    setTouchDelta(e.touches[0].clientX - touchStart);
  };
  const handleTouchEnd = () => {
    if (Math.abs(touchDelta) > 60) {
      if (touchDelta < 0 && activeIdx < branches.length - 1) goNext();
      else if (touchDelta > 0 && activeIdx > 0) goPrev();
    }
    setTouchStart(null);
    setTouchDelta(0);
    setIsDragging(false);
  };

  if (!loading && branches.length === 0) return null;

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700 mb-4">Our Branches</span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">BEHT JAMAA Worldwide</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Find a branch near you and join a community of young people transforming lives for Jesus Christ.
          </p>
        </div>

        {loading ? (
          <div className="flex gap-6 overflow-hidden">
            {[1, 2, 3].map((i) => (
              <div key={i} className="shrink-0 w-[340px] rounded-3xl overflow-hidden bg-white shadow-lg">
                <Skeleton className="h-[280px] w-full" />
                <div className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            className="relative"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="overflow-hidden">
              <div
                className="flex gap-6 transition-transform"
                style={{
                  transform: `translateX(calc(-${activeIdx} * (min(340px, calc((100vw - 2rem) / 1.1)) + 1.5rem))${isDragging ? ` + ${touchDelta}px` : ""})`,
                  transitionDuration: isDragging ? "0ms" : "600ms",
                  transitionTimingFunction: "cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              >
                {branches.map((branch) => (
                  <Link
                    key={branch.id}
                    to={`/branches/${branch.slug}`}
                    className="shrink-0 group rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100"
                    style={{ width: "min(340px, calc((100vw - 2rem) / 1.1))" }}
                  >
                    {/* Banner */}
                    <div className="h-[280px] relative overflow-hidden">
                      {branch.banner_url ? (
                        <img src={branch.banner_url} alt={branch.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center">
                          <Building2 className="h-16 w-16 text-white/25" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      {/* Branch name overlay */}
                      <div className="absolute bottom-0 left-0 right-0 p-6">
                        <div className="flex items-center gap-3">
                          {branch.logo_url ? (
                            <img src={branch.logo_url} alt="" className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xl" />
                          ) : (
                            <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                              <Building2 className="h-7 w-7 text-white" />
                            </div>
                          )}
                          <div>
                            <h3 className="font-bold text-white text-xl drop-shadow-lg">{branch.name}</h3>
                            {branch.location && (
                              <p className="text-white/80 text-sm flex items-center gap-1">
                                <MapPin className="h-3.5 w-3.5" /> {branch.location}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {branch.description && (
                        <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">{branch.description}</p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                          View Portal <ArrowRight className="h-4 w-4" />
                        </span>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                          <span className="text-xs font-medium text-slate-500">Active</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Arrows */}
            {activeIdx > 0 && (
              <button onClick={goPrev} className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center hover:scale-110 transition-all border border-slate-100">
                <ChevronLeft className="h-5 w-5 text-slate-700" />
              </button>
            )}
            {activeIdx < branches.length - 1 && (
              <button onClick={goNext} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-12 h-12 rounded-full bg-white shadow-xl flex items-center justify-center hover:scale-110 transition-all border border-slate-100">
                <ChevronRight className="h-5 w-5 text-slate-700" />
              </button>
            )}

            {/* Dots */}
            {branches.length > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                {branches.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveIdx(i)}
                    className="rounded-full transition-all"
                    style={{
                      width: i === activeIdx ? 32 : 8,
                      height: 8,
                      background: i === activeIdx ? "#0f172a" : "#e2e8f0",
                      transition: "all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {!loading && branches.length > 0 && (
          <div className="text-center mt-10">
            <Link to="/branches">
              <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
                View All Branches <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

/* ─── Daily Scripture ─────────────────────────────────────────── */
const DailyScripture = () => {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
  const verse = getDailyVerse(today);

  return (
    <section id="daily-scripture" className="py-12 px-4 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-lg border shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="p-6 text-center">
            <Badge className="mb-2 bg-blue-100 text-blue-800 border-transparent hover:bg-blue-100">Daily Scripture</Badge>
            <h3 className="tracking-tight text-2xl font-bold text-foreground/80 mb-4">{dateStr}</h3>
            <blockquote className="text-lg md:text-xl italic text-foreground/70 leading-relaxed max-w-3xl mx-auto">
              "{verse.text}"
            </blockquote>
            <p className="text-blue-600 font-semibold text-lg mt-3">— {verse.ref}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Podcast — 3D Museum Gallery Style ───────────────────────── */

// Glass overlay for the active podcast card
const PodcastGlassOverlay = ({ episode, playing }: { episode: Tables<"episodes">; playing: boolean }) => (
  <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
    <div
      className="rounded-2xl p-5"
      style={{
        background: "rgba(0,0,0,0.45)",
        backdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.12)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-white font-bold text-lg leading-tight">{episode.title}</p>
          <p className="text-white/50 text-xs mt-1">{episode.category}</p>
        </div>
        {episode.featured && (
          <span className="px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-bold border border-amber-400/20">★ Featured</span>
        )}
      </div>
      {episode.description && (
        <p className="text-white/60 text-xs italic leading-relaxed line-clamp-2 mb-3">
          "{episode.description}"
        </p>
      )}
      <div className="flex items-center gap-4 text-white/40 text-[11px]">
        <span>Category: {episode.category}</span>
        {episode.duration && <span>Duration: {episode.duration}</span>}
      </div>
    </div>
  </div>
);

// Player bar below the gallery
const PodcastPlayerBar = ({
  episode,
  playing,
  onToggle,
  onPrev,
  onNext,
}: {
  episode: Tables<"episodes"> | null;
  playing: boolean;
  onToggle: () => void;
  onPrev: () => void;
  onNext: () => void;
}) => {
  if (!episode) return null;
  return (
    <div
      className="mx-auto mt-8 flex items-center gap-4 py-4 px-6 rounded-2xl max-w-md"
      style={{
        background: "rgba(0,0,0,0.3)",
        backdropFilter: "blur(24px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
      }}
    >
      {episode.thumbnail_url ? (
        <img src={episode.thumbnail_url} alt="" className="w-12 h-12 rounded-xl object-cover" />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <Music className="h-5 w-5 text-white/50" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">{episode.title}</p>
        <p className="text-white/50 text-xs truncate">{episode.category}</p>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onPrev} className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          onClick={onToggle}
          className="w-11 h-11 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95"
          style={{
            background: playing ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.15)",
          }}
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-white" />}
        </button>
        <button onClick={onNext} className="w-9 h-9 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const FeaturedEpisodes = () => {
  const [episodes, setEpisodes] = useState<Tables<"episodes">[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [audios, setAudios] = useState<Record<string, HTMLAudioElement>>({});
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchDelta, setTouchDelta] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    supabase
      .from("episodes")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(8)
      .then(({ data }) => {
        const eps = data || [];
        setEpisodes(eps);
        const map: Record<string, HTMLAudioElement> = {};
        eps.forEach((ep) => {
          if (ep.audio_url) map[ep.id] = new Audio(ep.audio_url);
        });
        setAudios(map);
      });
    return () => {
      Object.values(audios).forEach((a) => a.pause());
    };
  }, []);

  const togglePlay = useCallback(
    (idx: number) => {
      const ep = episodes[idx];
      if (!ep?.audio_url) return;
      const audio = audios[ep.id];
      if (!audio) return;
      if (playingIdx === idx) {
        audio.pause();
        setPlayingIdx(null);
      } else {
        if (playingIdx !== null) audios[episodes[playingIdx]?.id]?.pause();
        audio.currentTime = 0;
        audio.play();
        setPlayingIdx(idx);
        audio.onended = () => setPlayingIdx(null);
      }
    },
    [episodes, audios, playingIdx]
  );

  const goTo = useCallback((idx: number) => { setActiveIdx(Math.max(0, Math.min(idx, episodes.length - 1))); }, [episodes.length]);
  const goNext = useCallback(() => { goTo(activeIdx >= episodes.length - 1 ? 0 : activeIdx + 1); }, [activeIdx, episodes.length, goTo]);
  const goPrev = useCallback(() => { goTo(activeIdx <= 0 ? episodes.length - 1 : activeIdx - 1); }, [activeIdx, episodes.length, goTo]);

  // Touch/swipe handlers for museum gallery
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
    setIsDragging(true);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    setTouchDelta(e.touches[0].clientX - touchStart);
  };
  const handleTouchEnd = () => {
    if (Math.abs(touchDelta) > 60) {
      if (touchDelta < 0) goNext();
      else if (touchDelta > 0) goPrev();
    }
    setTouchStart(null);
    setTouchDelta(0);
    setIsDragging(false);
  };

  const activeEpisode = episodes[activeIdx] || null;

  return (
    <section id="featured" className="scroll-mt-20 relative overflow-hidden" style={{ background: "linear-gradient(180deg, #1a1a2e 0%, #16213e 40%, #0f3460 70%, #1a1a2e 100%)", paddingTop: 80, paddingBottom: 80 }}>
      {/* Ambient light orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-[500px] h-[500px] rounded-full opacity-30" style={{ background: "radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 70%)", top: "-10%", left: "20%", filter: "blur(80px)" }} />
        <div className="absolute w-[400px] h-[400px] rounded-full opacity-25" style={{ background: "radial-gradient(circle, rgba(168,85,247,0.35) 0%, transparent 70%)", bottom: "-5%", right: "15%", filter: "blur(80px)" }} />
      </div>

      {/* Title */}
      <div className="text-center mb-10 px-4 relative z-10">
        <Badge className="mb-3 bg-white/10 text-white border-white/15 backdrop-blur-md">Podcast</Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-white">Featured Episodes</h2>
        <p className="text-white/50 max-w-lg mx-auto text-sm">
          Explore our collection of sermons, testimonies, and Bible teachings.
        </p>
      </div>

      {episodes.length === 0 ? (
        <div className="text-center py-20 px-4 relative z-10">
          <Music className="h-16 w-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 text-lg">No episodes available yet.</p>
          <p className="text-white/30 text-sm">Check back soon!</p>
        </div>
      ) : (
        <div className="relative z-10">
          {/* Museum Gallery — 3D Perspective Carousel */}
          <div
            className="relative mx-auto overflow-hidden"
            style={{ height: 420, maxWidth: 900, perspective: "1200px" }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Back cards (furthest) */}
            {episodes.map((ep, i) => {
              const offset = i - activeIdx;
              const absOffset = Math.abs(offset);
              if (absOffset > 3) return null;

              const isCenter = offset === 0;
              const isLeft = offset < 0;

              // Museum perspective math
              const translateX = isCenter ? 0 : isLeft ? -(180 + absOffset * 40) : (180 + absOffset * 40);
              const rotateY = isCenter ? 0 : isLeft ? 35 + absOffset * 5 : -(35 + absOffset * 5);
              const scale = isCenter ? 1 : absOffset === 1 ? 0.75 : absOffset === 2 ? 0.55 : 0.4;
              const opacity = isCenter ? 1 : absOffset === 1 ? 0.7 : absOffset === 2 ? 0.4 : 0.2;
              const zIndex = 10 - absOffset;
              const cardWidth = isCenter ? 420 : 340;
              const cardHeight = isCenter ? 380 : 300;

              return (
                <div
                  key={ep.id}
                  className="absolute top-1/2 left-1/2 cursor-pointer museum-card"
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    opacity: isDragging ? (isCenter ? 1 : 0.6) : opacity,
                    zIndex,
                    transform: `translate(-50%, -50%) translateX(${isDragging && isCenter ? touchDelta * 0.3 : translateX}px) rotateY(${isDragging && isCenter ? touchDelta * 0.05 : rotateY}deg) scale(${scale})`,
                    transition: isDragging ? "none" : "all 650ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                    transformStyle: "preserve-3d",
                  }}
                  onClick={() => goTo(i)}
                >
                  <div className="relative w-full h-full rounded-2xl overflow-hidden">
                    {/* Thumbnail */}
                    {ep.thumbnail_url ? (
                      <img src={ep.thumbnail_url} alt={ep.title} className="absolute inset-0 w-full h-full object-cover" style={{ transform: isCenter ? "scale(1.05)" : "scale(1)", transition: "transform 700ms ease-out" }} draggable={false} />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
                        <Music className="h-20 w-20 text-white/20" />
                      </div>
                    )}

                    {/* Subtle gradient for depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                    {/* Glass border */}
                    <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ border: isCenter ? "1.5px solid rgba(255,255,255,0.2)" : "1px solid rgba(255,255,255,0.08)", boxShadow: isCenter ? "0 24px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)" : "0 12px 40px rgba(0,0,0,0.3)" }} />

                    {/* Play indicator on side cards */}
                    {!isCenter && ep.audio_url && (
                      <div className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                        <Play className="h-3 w-3 text-white fill-white" />
                      </div>
                    )}

                    {/* Glass overlay — center card only */}
                    {isCenter && <PodcastGlassOverlay episode={ep} playing={playingIdx === i} />}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Player Bar */}
          <div className="relative z-10 px-4">
            <PodcastPlayerBar
              episode={activeEpisode}
              playing={playingIdx === activeIdx}
              onToggle={() => togglePlay(activeIdx)}
              onPrev={goPrev}
              onNext={goNext}
            />
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6 relative z-10">
            {episodes.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="rounded-full transition-all duration-400"
                style={{
                  width: i === activeIdx ? 28 : 8,
                  height: 8,
                  background: i === activeIdx ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)",
                  transition: "all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
};

/* ─── Meet The Team ───────────────────────────────────────────── */
const team = [
  { name: "Chris Sadiki", role: "President", initials: "CS" },
  { name: "Reagan Lescot", role: "Secretary", initials: "RL" },
  { name: "Fab Meekboy", role: "Project Manager", initials: "FM" },
];

const TeamSection = () => (
  <section className="py-20 px-4 bg-background">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <Badge className="mb-3">Leadership</Badge>
        <h2 className="text-3xl md:text-4xl font-bold mb-4">Meet The Team</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          The people leading BEHT JAMAA's mission to reach and empower young people for Christ.
        </p>
      </div>
      <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
        {team.map((member) => (
          <Card key={member.name} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardContent className="pt-8 pb-6 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-primary-foreground">{member.initials}</span>
              </div>
              <h3 className="font-bold text-lg">{member.name}</h3>
              <p className="text-sm text-primary font-medium">{member.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Donate CTA ──────────────────────────────────────────────── */
const DonateCTA = () => (
  <section className="py-20 px-4 gradient-hero text-primary-foreground relative overflow-hidden">
    <div className="absolute inset-0 bg-background/10" />
    <div className="relative max-w-4xl mx-auto text-center">
      <HeartHandshake className="h-12 w-12 mx-auto mb-6 opacity-80" />
      <h2 className="text-3xl md:text-4xl font-bold mb-4">Support Our Ministry</h2>
      <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto leading-relaxed">
        Your generous donation helps us reach more young people with the Gospel, fund community projects, and host workshops and festivals that change lives.
      </p>
      <Link
        to="/donate"
        className="inline-flex items-center justify-center gap-2 h-14 rounded-md bg-brand-accent hover:bg-brand-accent/90 text-brand-accent-foreground font-bold text-lg px-10 transition-colors"
      >
        <HeartHandshake className="h-6 w-6" />
        Donate Now
      </Link>
    </div>
  </section>
);

/* ─── Footer ──────────────────────────────────────────────────── */
const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-xl">BEHT JAMAA</h3>
              <p className="text-xs text-primary-foreground/60">Boys Evangelists of the Holy Trinity</p>
            </div>
          </div>
          <p className="text-primary-foreground/70 text-sm leading-relaxed max-w-sm">
            A Youth Evangelistic Ministry that aims at winning souls for the Glory of our Lord Jesus Christ through Arts, empowering youths for discipleship, ministry and service.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/about" className="hover:text-primary-foreground transition-colors">About Us</Link></li>
            <li><Link to="/services" className="hover:text-primary-foreground transition-colors">Our Services</Link></li>
            <li><Link to="/contact" className="hover:text-primary-foreground transition-colors">Contact</Link></li>
            <li><Link to="/donate" className="hover:text-primary-foreground transition-colors">Donate</Link></li>
            <li><Link to="/live" className="hover:text-primary-foreground transition-colors">Live Broadcast</Link></li>
            <li><Link to="/prayer" className="hover:text-primary-foreground transition-colors">Prayer Requests</Link></li>
            <li><Link to="/members" className="hover:text-primary-foreground transition-colors">Member Portal</Link></li>
            <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Sign In</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-lg mb-4">Connect With Us</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70 mb-5">
            <li>✉️ contact@behtjamaa.com</li>
            <li>📍 Lubumbashi, DR Congo</li>
          </ul>
          <div className="flex gap-3">
            {[
              { href: "https://facebook.com", label: "Facebook", path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" },
              { href: "https://youtube.com", label: "YouTube", path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" },
              { href: "https://instagram.com", label: "Instagram", path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" },
              { href: "https://tiktok.com", label: "TikTok", path: "M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" },
            ].map((s) => (
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.path} /></svg>
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-sm text-primary-foreground/50">
        © {new Date().getFullYear()} Boys Evangelists of the Holy Trinity (BEHT JAMAA). All rights reserved.
      </div>
    </div>
  </footer>
);

/* ─── Home Page ───────────────────────────────────────────────── */
const Index = () => (
  <div className="min-h-screen gradient-subtle">
    <HeroSection />
    <EventsPreview />
    <BranchesPreview />
    <BeliefSection />
    <DailyScripture />
    <ServicesPreview />
    <FeaturedEpisodes />
    <TeamSection />
    <DonateCTA />
    <Footer />
  </div>
);

export default Index;
