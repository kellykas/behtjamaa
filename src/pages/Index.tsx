import { Calendar, Heart, Users, Bell, Play, LogIn, LogOut, Menu, X, Pause, Eye, Target, BookOpen, Handshake, Theater, UsersRound, Globe, HeartHandshake, ExternalLink, Mail, Building2, MapPin, Music, ChevronLeft, ChevronRight, SkipBack, SkipForward, Volume2, ArrowRight, Star, TrendingUp, Users2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import { getDailyVerse } from "@/lib/dailyScripture";

/* ─── Hero — Modern Floating Cards Layout ────────────────────── */
const HeroSection = () => {
  const [branchCount, setBranchCount] = useState(0);

  useEffect(() => {
    supabase
      .from("branches")
      .select("id", { count: "exact", head: true })
      .eq("active", true)
      .then(({ count }) => setBranchCount(count || 0));
  }, []);

  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)" }}>
      <div className="max-w-6xl mx-auto">
        {/* Badge */}
        <div className="text-center mb-6">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-slate-900 text-white">
            Youth Evangelistic Ministry
          </span>
        </div>

        {/* Headline */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight tracking-tight mb-4">
            Our Tailored
            <br />
            <span className="text-blue-600">Ministry</span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            We create spiritual experiences that transform lives. From evangelism to discipleship, we help young people discover their purpose in Christ.
          </p>
        </div>

        {/* Floating Cards Layout — Desktop */}
        <div className="relative hidden md:block" style={{ height: 480 }}>
          {/* Central Image */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[320px] rounded-3xl overflow-hidden shadow-2xl z-10">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="text-center relative z-10">
                <Users className="h-20 w-20 text-white/90 mx-auto mb-4" />
                <p className="text-white font-bold text-2xl">BEHT JAMAA</p>
                <p className="text-white/70 text-sm">Transforming Lives for Christ</p>
              </div>
            </div>
          </div>

          {/* Floating Stat Card — Top Left */}
          <div className="absolute -left-4 top-16 floating-card">
            <div className="bg-white rounded-2xl p-5 shadow-xl border border-slate-100 min-w-[180px]">
              <div className="text-3xl font-bold text-slate-900 mb-1">2.5K+</div>
              <p className="text-slate-500 text-sm leading-tight">Youth members across all branches</p>
            </div>
          </div>

          {/* Floating Stat Card — Top Right */}
          <div className="absolute -right-4 top-20 floating-card" style={{ animationDelay: "0.2s" }}>
            <div className="bg-slate-900 rounded-2xl p-5 shadow-xl min-w-[180px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-bold text-white">4.9</span>
                <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-slate-300 text-sm leading-tight">Our community rating</p>
            </div>
          </div>

          {/* Floating Stat Card — Bottom Left */}
          <div className="absolute -left-2 bottom-32 floating-card" style={{ animationDelay: "0.4s" }}>
            <div className="bg-white rounded-2xl p-5 shadow-xl border border-slate-100 min-w-[160px]">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-3xl font-bold text-slate-900">{branchCount || 12}</span>
              </div>
              <p className="text-slate-500 text-sm leading-tight">Active branches worldwide</p>
            </div>
          </div>

          {/* Floating Tag Pills — Bottom Right */}
          <div className="absolute right-0 bottom-28 floating-card" style={{ animationDelay: "0.6s" }}>
            <div className="flex flex-wrap gap-2 max-w-[260px]">
              {["Evangelism", "Worship", "Arts", "Community", "Discipleship"].map((tag) => (
                <span key={tag} className="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-default">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Central Image */}
          <div className="w-full h-64 rounded-3xl overflow-hidden shadow-xl mb-6">
            <div className="w-full h-full bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center relative">
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              <div className="text-center relative z-10">
                <Users className="h-14 w-14 text-white/90 mx-auto mb-3" />
                <p className="text-white font-bold text-xl">BEHT JAMAA</p>
                <p className="text-white/70 text-xs">Transforming Lives for Christ</p>
              </div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 text-center">
              <div className="text-2xl font-bold text-slate-900">2.5K+</div>
              <p className="text-slate-500 text-xs mt-1">Members</p>
            </div>
            <div className="bg-slate-900 rounded-2xl p-4 shadow-lg text-center">
              <div className="flex items-center justify-center gap-1">
                <span className="text-2xl font-bold text-white">4.9</span>
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              </div>
              <p className="text-slate-300 text-xs mt-1">Rating</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg border border-slate-100 text-center">
              <div className="text-2xl font-bold text-slate-900">{branchCount || 12}</div>
              <p className="text-slate-500 text-xs mt-1">Branches</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {["Evangelism", "Worship", "Arts", "Community", "Discipleship"].map((tag) => (
              <span key={tag} className="px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-8">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95"
          >
            Join Our Ministry
            <ArrowRight className="h-5 w-5" />
          </Link>
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
  <section className="py-24 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700 mb-4">
          About Us
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Our Foundation</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          Everything we do is rooted in the Word of God and guided by the Holy Spirit.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        {beliefItems.map((item) => (
          <Card key={item.title} className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-lg bg-white rounded-3xl overflow-hidden">
            <CardContent className="pt-10 pb-8 px-8 text-center">
              <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${item.accent} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                <item.icon className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{item.text}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Services — Floating Tag Style ──────────────────────────── */
const services = [
  { icon: Globe, title: "Evangelism", desc: "Winning youths for Christ across communities and campuses.", color: "bg-red-50 text-red-600 border-red-100" },
  { icon: Theater, title: "Artistic Activities", desc: "Empowering them for a life of discipleship through the arts, touching the spirit, soul and body with the power of the Holy Spirit.", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { icon: Handshake, title: "Community Service", desc: "Empowering youths for usefulness to their communities through active service.", color: "bg-green-50 text-green-600 border-green-100" },
  { icon: UsersRound, title: "Workshops & Festivals", desc: "Starting from where the youths are, with their spiritual, physical, intellectual, social and financial needs.", color: "bg-amber-50 text-amber-600 border-amber-100" },
  { icon: HeartHandshake, title: "Humanitarian", desc: "Engaging non-believers and sharing the love of Christ with them through tangible acts of care.", color: "bg-purple-50 text-purple-600 border-purple-100" },
];

const ServicesPreview = () => (
  <section id="services" className="py-24 px-4 scroll-mt-20" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)" }}>
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-slate-900 text-white mb-4">
          Our Services
        </span>
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">This Is How We Bring Transformation</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          Five ministry pillars working together to win souls and raise a generation of Christ-centered youth.
        </p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {services.map((svc) => (
          <Card key={svc.title} className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-md bg-white rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-all duration-500 group-hover:scale-110 ${svc.color} border`}>
                <svc.icon className="h-7 w-7" />
              </div>
              <h3 className="font-bold text-xl text-slate-900 mb-3">{svc.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{svc.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="text-center">
        <Link to="/services">
          <Button className="gap-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
            View All Services <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </div>
  </section>
);

/* ─── Branches Preview ─────────────────────────────────────── */
const BranchesPreview = () => {
  const [branches, setBranches] = useState<Tables<"branches">[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("branches")
      .select("*")
      .eq("active", true)
      .order("name")
      .limit(6)
      .then(({ data }) => {
        setBranches(data || []);
        setLoading(false);
      });
  }, []);

  if (!loading && branches.length === 0) return null;

  return (
    <section className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700 mb-4">
            Our Branches
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">BEHT JAMAA Worldwide</h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Find a branch near you and join a community of young people transforming lives for Jesus Christ.
          </p>
        </div>
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="overflow-hidden rounded-3xl">
                <Skeleton className="h-40 w-full" />
                <CardContent className="p-6 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-12 w-12 rounded-full shrink-0" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {branches.map((branch) => (
              <Link key={branch.id} to={`/branches/${branch.slug}`}>
                <Card className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-md h-full rounded-3xl overflow-hidden">
                  {branch.banner_url ? (
                    <div className="h-40 overflow-hidden">
                      <img src={branch.banner_url} alt={branch.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-white/40" />
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      {branch.logo_url ? (
                        <img src={branch.logo_url} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md" />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                          <Building2 className="h-6 w-6 text-white" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <h3 className="font-bold text-slate-900 truncate">{branch.name}</h3>
                        {branch.location && (
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <MapPin className="h-3 w-3" /> {branch.location}
                          </p>
                        )}
                      </div>
                    </div>
                    {branch.description && <p className="text-sm text-slate-500 line-clamp-2 mb-4">{branch.description}</p>}
                    <span className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      View Portal <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        {!loading && branches.length > 0 && (
          <div className="text-center">
            <Link to="/branches">
              <Button variant="outline" size="lg" className="gap-2 rounded-full px-8 border-slate-200 text-slate-700 hover:bg-slate-50">
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
    <section id="daily-scripture" className="py-16 px-4 scroll-mt-20" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)" }}>
      <div className="max-w-4xl mx-auto">
        <div className="rounded-3xl border border-slate-100 shadow-lg bg-white overflow-hidden">
          <div className="p-8 md:p-10 text-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 mb-4">
              Daily Scripture
            </span>
            <h3 className="tracking-tight text-xl font-semibold text-slate-900 mb-6">{dateStr}</h3>
            <blockquote className="text-lg md:text-xl italic text-slate-600 leading-relaxed max-w-3xl mx-auto mb-4">
              "{verse.text}"
            </blockquote>
            <p className="text-blue-600 font-bold text-lg">— {verse.ref}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ─── Spotify-Style Podcast Carousel ──────────────────────────── */
const CarouselOrbs = ({ activeEpisode }: { activeEpisode: Tables<"episodes"> | null }) => {
  const colors = activeEpisode?.category === "Worship"
    ? ["rgba(59,130,246,0.5)", "rgba(168,85,247,0.4)", "rgba(236,72,153,0.35)"]
    : activeEpisode?.category === "Sermon"
    ? ["rgba(239,68,68,0.5)", "rgba(245,158,11,0.4)", "rgba(239,68,68,0.3)"]
    : activeEpisode?.category === "Testimony"
    ? ["rgba(16,185,129,0.5)", "rgba(59,130,246,0.4)", "rgba(16,185,129,0.3)"]
    : ["rgba(59,130,246,0.5)", "rgba(168,85,247,0.4)", "rgba(236,72,153,0.35)"];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="carousel-orb" style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", background: `radial-gradient(circle, ${colors[0]} 0%, transparent 70%)`, filter: "blur(60px)", top: "5%", left: "50%", transform: "translateX(-50%)", animation: "orb-drift-1 16s ease-in-out infinite" }} />
      <div className="carousel-orb" style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: `radial-gradient(circle, ${colors[1]} 0%, transparent 70%)`, filter: "blur(60px)", top: "30%", left: "5%", animation: "orb-drift-2 14s ease-in-out infinite", animationDelay: "-3s" }} />
      <div className="carousel-orb" style={{ position: "absolute", width: 350, height: 350, borderRadius: "50%", background: `radial-gradient(circle, ${colors[2]} 0%, transparent 70%)`, filter: "blur(60px)", top: "30%", right: "5%", animation: "orb-drift-3 18s ease-in-out infinite", animationDelay: "-7s" }} />
    </div>
  );
};

const CoverFlowCard = ({ episode, offset, onPlay, playing, onClick }: { episode: Tables<"episodes">; offset: number; onPlay: () => void; playing: boolean; onClick: () => void }) => {
  const absOffset = Math.abs(offset);
  const isCenter = offset === 0;
  const isLeft = offset < 0;
  const rotateY = isCenter ? 0 : isLeft ? 40 : -40;
  const scale = isCenter ? 1 : absOffset === 1 ? 0.78 : 0.55;
  const translateX = isCenter ? 0 : isLeft ? -55 : 55;
  const opacity = isCenter ? 1 : absOffset === 1 ? 0.8 : 0.35;
  const zIndex = 10 - absOffset;

  return (
    <div className="carousel-cover-card absolute top-1/2 left-1/2 cursor-pointer select-none" style={{ width: isCenter ? 260 : 210, height: isCenter ? 340 : 280, opacity, zIndex, transform: `translate(-50%, -50%) translateX(${translateX}px) perspective(900px) rotateY(${rotateY}deg) scale(${scale})`, transition: "all 550ms cubic-bezier(0.34, 1.56, 0.64, 1)" }} onClick={onClick}>
      <div className="relative w-full h-full rounded-2xl overflow-hidden">
        {episode.thumbnail_url ? (
          <img src={episode.thumbnail_url} alt={episode.title} className="absolute inset-0 w-full h-full object-cover" style={{ transform: isCenter ? "scale(1.08)" : "scale(1)", transition: "transform 600ms ease-out" }} draggable={false} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center">
            <Music className="h-16 w-16 text-white/20" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
        <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ border: isCenter ? "1.5px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.1)", boxShadow: isCenter ? "0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.2)" : "0 8px 30px rgba(0,0,0,0.4)", transition: "all 550ms cubic-bezier(0.34, 1.56, 0.64, 1)" }} />
        <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
          <Badge className="bg-white/15 text-white border-white/15 text-[10px] backdrop-blur-md mb-2">{episode.category}</Badge>
          <h3 className="text-white font-bold text-sm leading-tight drop-shadow-lg truncate">{episode.title}</h3>
          {episode.description && <p className="text-white/50 text-xs line-clamp-1 mt-0.5">{episode.description}</p>}
          {episode.audio_url && isCenter && (
            <button onClick={(e) => { e.stopPropagation(); onPlay(); }} className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-full text-xs font-semibold h-8 px-5 carousel-play-btn" style={{ background: playing ? "rgba(239,68,68,0.35)" : "rgba(255,255,255,0.18)", backdropFilter: "blur(16px)", border: playing ? "1px solid rgba(239,68,68,0.4)" : "1px solid rgba(255,255,255,0.25)", color: "white", boxShadow: "0 4px 16px rgba(0,0,0,0.25)" }}>
              {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3 fill-white" />}
              {playing ? "Pause" : "Play"}
            </button>
          )}
        </div>
        {playing && isCenter && (
          <div className="absolute top-3 right-3 z-10 flex items-end gap-[3px] h-4">
            {[0, 1, 2].map((i) => <div key={i} className="carousel-eq-bar w-[3px] bg-red-400 rounded-full" style={{ animationDelay: `${i * 0.12}s` }} />)}
          </div>
        )}
      </div>
    </div>
  );
};

const PlayerBar = ({ episode, playing, onToggle, onPrev, onNext }: { episode: Tables<"episodes"> | null; playing: boolean; onToggle: () => void; onPrev: () => void; onNext: () => void }) => {
  if (!episode) return null;
  return (
    <div className="carousel-player-bar mx-auto mt-6 flex items-center gap-3 py-3 px-4 rounded-2xl max-w-lg" style={{ background: "rgba(255,255,255,0.12)", backdropFilter: "blur(20px) saturate(180%)", border: "1px solid rgba(255,255,255,0.15)", boxShadow: "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
      {episode.thumbnail_url ? <img src={episode.thumbnail_url} alt="" className="w-10 h-10 rounded-lg object-cover" /> : <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-700 flex items-center justify-center"><Music className="h-4 w-4 text-white/50" /></div>}
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm truncate">{episode.title}</p>
        <p className="text-white/50 text-xs truncate">{episode.category}</p>
      </div>
      <div className="flex items-center gap-1">
        <button onClick={onPrev} className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"><SkipBack className="h-4 w-4" /></button>
        <button onClick={onToggle} className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-all hover:scale-105 active:scale-95" style={{ background: playing ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.2)" }}>
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-white" />}
        </button>
        <button onClick={onNext} className="w-8 h-8 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"><SkipForward className="h-4 w-4" /></button>
      </div>
    </div>
  );
};

const FeaturedEpisodes = () => {
  const [episodes, setEpisodes] = useState<Tables<"episodes">[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [playingIdx, setPlayingIdx] = useState<number | null>(null);
  const [audios, setAudios] = useState<Record<string, HTMLAudioElement>>({});

  useEffect(() => {
    supabase.from("episodes").select("*").eq("published", true).order("published_at", { ascending: false }).limit(8).then(({ data }) => {
      const eps = data || [];
      setEpisodes(eps);
      const map: Record<string, HTMLAudioElement> = {};
      eps.forEach((ep) => { if (ep.audio_url) map[ep.id] = new Audio(ep.audio_url); });
      setAudios(map);
    });
    return () => { Object.values(audios).forEach((a) => a.pause()); };
  }, []);

  const togglePlay = useCallback((idx: number) => {
    const ep = episodes[idx];
    if (!ep?.audio_url) return;
    const audio = audios[ep.id];
    if (!audio) return;
    if (playingIdx === idx) { audio.pause(); setPlayingIdx(null); }
    else { if (playingIdx !== null) audios[episodes[playingIdx]?.id]?.pause(); audio.currentTime = 0; audio.play(); setPlayingIdx(idx); audio.onended = () => setPlayingIdx(null); }
  }, [episodes, audios, playingIdx]);

  const goTo = useCallback((idx: number) => { setActiveIdx(Math.max(0, Math.min(idx, episodes.length - 1))); }, [episodes.length]);
  const goNext = useCallback(() => { goTo(activeIdx >= episodes.length - 1 ? 0 : activeIdx + 1); }, [activeIdx, episodes.length, goTo]);
  const goPrev = useCallback(() => { goTo(activeIdx <= 0 ? episodes.length - 1 : activeIdx - 1); }, [activeIdx, episodes.length, goTo]);

  const activeEpisode = episodes[activeIdx] || null;

  return (
    <section id="featured" className="scroll-mt-20 relative overflow-hidden" style={{ background: "linear-gradient(180deg, hsl(222 47% 8%) 0%, hsl(230 40% 10%) 50%, hsl(222 47% 8%) 100%)", paddingTop: 80, paddingBottom: 80 }}>
      <CarouselOrbs activeEpisode={activeEpisode} />
      <div className="text-center mb-8 px-4 relative z-10">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white border border-white/15 backdrop-blur-md mb-4">Podcast</span>
        <h2 className="text-3xl md:text-5xl font-bold mb-3 text-white">Featured Episodes</h2>
        <p className="text-white/50 max-w-lg mx-auto text-sm">Swipe or hover to explore — sermons, testimonies, and Bible teachings.</p>
      </div>
      {episodes.length === 0 ? (
        <div className="text-center py-20 px-4 relative z-10"><Music className="h-16 w-16 text-white/20 mx-auto mb-4" /><p className="text-white/40 text-lg">No episodes available yet.</p><p className="text-white/30 text-sm">Check back soon!</p></div>
      ) : (
        <>
          <div className="relative mx-auto" style={{ height: 380, maxWidth: 700 }}>
            {episodes.map((ep, i) => <CoverFlowCard key={ep.id} episode={ep} offset={i - activeIdx} onPlay={() => togglePlay(i)} playing={playingIdx === i} onClick={() => goTo(i)} />)}
            <button onClick={goPrev} className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full items-center justify-center hidden md:flex transition-all duration-300 hover:scale-110 active:scale-95" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}><ChevronLeft className="h-5 w-5" /></button>
            <button onClick={goNext} className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full items-center justify-center hidden md:flex transition-all duration-300 hover:scale-110 active:scale-95" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.7)" }}><ChevronRight className="h-5 w-5" /></button>
          </div>
          <div className="relative z-10 px-4"><PlayerBar episode={activeEpisode} playing={playingIdx === activeIdx} onToggle={() => togglePlay(activeIdx)} onPrev={goPrev} onNext={goNext} /></div>
          <div className="flex justify-center gap-2 mt-6 relative z-10">
            {episodes.map((_, i) => <button key={i} onClick={() => goTo(i)} className="rounded-full" style={{ width: i === activeIdx ? 28 : 8, height: 8, background: i === activeIdx ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.25)", transition: "all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)" }} />)}
          </div>
        </>
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
  <section className="py-24 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-16">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700 mb-4">Leadership</span>
        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Meet The Team</h2>
        <p className="text-slate-500 max-w-xl mx-auto text-lg">The people leading BEHT JAMAA's mission to reach and empower young people for Christ.</p>
      </div>
      <div className="grid sm:grid-cols-3 gap-8 max-w-3xl mx-auto">
        {team.map((member) => (
          <Card key={member.name} className="group hover:shadow-xl transition-all duration-500 hover:-translate-y-2 border-0 shadow-md bg-white rounded-3xl overflow-hidden">
            <CardContent className="pt-10 pb-8 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-900 to-slate-700 flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-500">
                <span className="text-2xl font-bold text-white">{member.initials}</span>
              </div>
              <h3 className="font-bold text-xl text-slate-900">{member.name}</h3>
              <p className="text-sm text-blue-600 font-medium mt-1">{member.role}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </section>
);

/* ─── Donate CTA ──────────────────────────────────────────────── */
const DonateCTA = () => (
  <section className="py-24 px-4" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
    <div className="max-w-4xl mx-auto text-center">
      <HeartHandshake className="h-14 w-14 mx-auto mb-6 text-blue-400" />
      <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Support Our Ministry</h2>
      <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
        Your generous donation helps us reach more young people with the Gospel, fund community projects, and host workshops and festivals that change lives.
      </p>
      <Link to="/donate" className="inline-flex items-center gap-2 h-14 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg px-10 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 active:scale-95">
        <HeartHandshake className="h-6 w-6" />
        Donate Now
      </Link>
    </div>
  </section>
);

/* ─── Footer ──────────────────────────────────────────────────── */
const Footer = () => (
  <footer className="bg-slate-900 text-white">
    <div className="max-w-6xl mx-auto px-4 py-16">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="md:col-span-2">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center">
              <Play className="h-6 w-6 text-white fill-white" />
            </div>
            <div>
              <h3 className="font-bold text-xl">BEHT JAMAA</h3>
              <p className="text-xs text-slate-400">Boys Evangelists of the Holy Trinity</p>
            </div>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            A Youth Evangelistic Ministry that aims at winning souls for the Glory of our Lord Jesus Christ through Arts, empowering youths for discipleship, ministry and service.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-5">Quick Links</h4>
          <ul className="space-y-3 text-sm text-slate-400">
            <li><Link to="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link to="/services" className="hover:text-white transition-colors">Our Services</Link></li>
            <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link to="/donate" className="hover:text-white transition-colors">Donate</Link></li>
            <li><Link to="/live" className="hover:text-white transition-colors">Live Broadcast</Link></li>
            <li><Link to="/prayer" className="hover:text-white transition-colors">Prayer Requests</Link></li>
            <li><Link to="/members" className="hover:text-white transition-colors">Member Portal</Link></li>
            <li><Link to="/auth" className="hover:text-white transition-colors">Sign In</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-lg mb-5">Connect With Us</h4>
          <ul className="space-y-3 text-sm text-slate-400 mb-6">
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
              <a key={s.href} href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} className="w-10 h-10 rounded-full bg-slate-800 hover:bg-blue-600 flex items-center justify-center transition-colors duration-300">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d={s.path} /></svg>
              </a>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-slate-800 mt-12 pt-8 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} Boys Evangelists of the Holy Trinity (BEHT JAMAA). All rights reserved.
      </div>
    </div>
  </footer>
);

/* ─── Home Page ───────────────────────────────────────────────── */
const Index = () => (
  <div className="min-h-screen bg-white">
    <HeroSection />
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
