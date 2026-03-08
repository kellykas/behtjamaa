import { Calendar, Heart, Users, Bell, Play, LogIn, LogOut, Menu, X, Pause } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

const Navbar = () => {
  const { user, signOut, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-background border-b px-4 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
          </div>
          <div>
            <h2 className="font-bold text-lg leading-tight">BEHT JAMAA</h2>
            <p className="text-xs text-muted-foreground">Podcast Ministry</p>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link to="/live" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Calendar className="h-4 w-4" />
            Live
            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">LIVE</span>
          </Link>
          <Link to="/prayer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Heart className="h-4 w-4" />
            Prayer
          </Link>
          <Link to="/members" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Users className="h-4 w-4" />
            Members
          </Link>
          {user ? (
            <button onClick={signOut} className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 hover:bg-primary/90 transition-colors">
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </button>
          ) : (
            <Link to="/auth" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 hover:bg-primary/90 transition-colors">
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t mt-3 pt-3 space-y-3">
          <Link to="/live" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-2 py-2" onClick={() => setMobileOpen(false)}>
            <Calendar className="h-4 w-4" /> Live
            <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">LIVE</span>
          </Link>
          <Link to="/prayer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-2 py-2" onClick={() => setMobileOpen(false)}>
            <Heart className="h-4 w-4" /> Prayer
          </Link>
          <Link to="/members" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-2 py-2" onClick={() => setMobileOpen(false)}>
            <Users className="h-4 w-4" /> Members
          </Link>
          {user ? (
            <button onClick={() => { signOut(); setMobileOpen(false); }} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-2 py-2 w-full">
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          ) : (
            <Link to="/auth" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground px-2 py-2" onClick={() => setMobileOpen(false)}>
              <LogIn className="h-4 w-4" /> Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

const HeroSection = () => (
  <section className="relative py-20 px-4 gradient-hero text-primary-foreground overflow-hidden">
    <div className="absolute inset-0 bg-background/20" />
    <div className="relative max-w-6xl mx-auto text-center">
      <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">BEHT JAMAA</h1>
      <p className="text-xl md:text-2xl mb-4 opacity-90">
        Spreading the Gospel • Making Disciples • Empowering Believers
      </p>
      <p className="text-lg mb-8 max-w-2xl mx-auto opacity-80">
        Join us on a journey of faith through powerful sermons, inspiring testimonies, and life-changing Bible teachings that will strengthen your walk with Christ.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="#featured" className="inline-flex items-center justify-center gap-2 h-11 rounded-md bg-brand-accent hover:bg-brand-accent/90 text-brand-accent-foreground font-semibold px-8 py-3 transition-colors">
          <Play className="mr-2 h-5 w-5" />
          Start Listening
        </a>
        <a href="#daily-scripture" className="inline-flex items-center justify-center gap-2 h-11 rounded-md border border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent font-medium px-8 py-3 transition-colors">
          <Bell className="mr-2 h-5 w-5" />
          Get Daily Scripture
        </a>
      </div>
    </div>
  </section>
);

const DailyScripture = () => {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <section id="daily-scripture" className="py-8 px-4 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="rounded-lg border shadow-sm bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <div className="flex flex-col space-y-1.5 p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              <Badge className="bg-blue-100 text-blue-800 border-transparent hover:bg-blue-100">
                Daily Scripture
              </Badge>
            </div>
            <h3 className="tracking-tight text-2xl font-bold text-foreground/80">{dateStr}</h3>
          </div>
          <div className="p-6 pt-0 text-center space-y-6">
            <blockquote className="text-lg md:text-xl italic text-foreground/70 leading-relaxed max-w-3xl mx-auto">
              "For I know the plans I have for you, declares the Lord, plans for welfare and not for evil, to give you a future and a hope."
            </blockquote>
            <p className="text-blue-600 font-semibold text-lg">— Jeremiah 29:11</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium border bg-background hover:bg-blue-50 h-10 px-4 py-2 border-blue-300 text-blue-700 transition-colors">
                <Heart className="mr-2 h-4 w-4" />
                Save to Favorites
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-primary-foreground transition-colors">
                <Bell className="mr-2 h-4 w-4" />
                Enable Daily Notifications
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const AudioPlayer = ({ episode }: { episode: Tables<"episodes"> }) => {
  const [playing, setPlaying] = useState(false);
  const [audio] = useState(() => episode.audio_url ? new Audio(episode.audio_url) : null);

  useEffect(() => {
    if (!audio) return;
    const onEnd = () => setPlaying(false);
    audio.addEventListener("ended", onEnd);
    return () => {
      audio.removeEventListener("ended", onEnd);
      audio.pause();
    };
  }, [audio]);

  const toggle = () => {
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  };

  return (
    <div className="rounded-lg border bg-card text-card-foreground shadow-sm hover:shadow-md transition-all duration-300">
      <div className="p-6">
        {episode.thumbnail_url && (
          <img src={episode.thumbnail_url} alt={episode.title} className="w-full h-40 object-cover rounded-md mb-4" />
        )}
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-blue-100 text-blue-800 border-transparent text-xs">{episode.category}</Badge>
          {episode.featured && <Badge className="bg-amber-100 text-amber-800 border-transparent text-xs">Featured</Badge>}
        </div>
        <h3 className="font-semibold text-lg mb-1">{episode.title}</h3>
        {episode.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{episode.description}</p>
        )}
        {episode.duration && <p className="text-xs text-muted-foreground mb-3">Duration: {episode.duration}</p>}
        {episode.audio_url ? (
          <button
            onClick={toggle}
            className="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-primary-foreground transition-colors w-full"
          >
            {playing ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
            {playing ? "Pause" : "Play Episode"}
          </button>
        ) : (
          <p className="text-xs text-muted-foreground italic">Audio coming soon</p>
        )}
      </div>
    </div>
  );
};

const FeaturedEpisodes = () => {
  const [episodes, setEpisodes] = useState<Tables<"episodes">[]>([]);

  useEffect(() => {
    supabase
      .from("episodes")
      .select("*")
      .eq("published", true)
      .order("published_at", { ascending: false })
      .limit(6)
      .then(({ data }) => setEpisodes(data || []));
  }, []);

  return (
    <section id="featured" className="py-16 px-4 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4">Featured Episodes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover our latest sermons, testimonies, and Bible teachings designed to strengthen your faith and deepen your relationship with Christ.
          </p>
        </div>
        {episodes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No episodes available yet.</p>
            <p className="text-muted-foreground">Check back soon for new content!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {episodes.map((ep) => (
              <AudioPlayer key={ep.id} episode={ep} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const quickLinks = [
  { href: "/auth", icon: LogIn, title: "Sign In", desc: "Login or create account", borderColor: "border-indigo-200 hover:border-indigo-300", iconBg: "bg-indigo-100 group-hover:bg-indigo-200", iconColor: "text-indigo-600" },
  { href: "/live", icon: Calendar, title: "Live Broadcast", desc: "Join our live services and events", borderColor: "border-red-200 hover:border-red-300", iconBg: "bg-red-100 group-hover:bg-red-200", iconColor: "text-red-600" },
  { href: "/prayer", icon: Heart, title: "Prayer Requests", desc: "Submit your prayer needs", borderColor: "border-green-200 hover:border-green-300", iconBg: "bg-green-100 group-hover:bg-green-200", iconColor: "text-green-600" },
  { href: "/members", icon: Users, title: "Member Portal", desc: "Access your personal dashboard", borderColor: "border-blue-200 hover:border-blue-300", iconBg: "bg-blue-100 group-hover:bg-blue-200", iconColor: "text-blue-600" },
  { href: "/admin", icon: Bell, title: "Admin Panel", desc: "Manage content and users", borderColor: "border-purple-200 hover:border-purple-300", iconBg: "bg-purple-100 group-hover:bg-purple-200", iconColor: "text-purple-600" },
];

const QuickLinks = () => (
  <section className="py-16 px-4 bg-background">
    <div className="max-w-6xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {quickLinks.map((link) => (
          <Link key={link.href} className="group" to={link.href}>
            <div className={`rounded-lg border bg-card text-card-foreground shadow-sm text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${link.borderColor}`}>
              <div className="p-6 pt-8 pb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${link.iconBg}`}>
                  <link.icon className={`h-8 w-8 ${link.iconColor}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{link.title}</h3>
                <p className="text-muted-foreground text-sm">{link.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const Footer = () => (
  <footer className="bg-primary text-primary-foreground">
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
              <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
            </div>
            <h3 className="font-bold text-xl">BEHT JAMAA</h3>
          </div>
          <p className="text-primary-foreground/70 text-sm leading-relaxed">
            Spreading the Gospel, making disciples, and empowering believers through the power of God's Word.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70">
            <li><Link to="/live" className="hover:text-primary-foreground transition-colors">Live Broadcast</Link></li>
            <li><Link to="/prayer" className="hover:text-primary-foreground transition-colors">Prayer Requests</Link></li>
            <li><Link to="/members" className="hover:text-primary-foreground transition-colors">Member Portal</Link></li>
            <li><Link to="/auth" className="hover:text-primary-foreground transition-colors">Sign In</Link></li>
          </ul>
        </div>

        {/* Contact & Social */}
        <div>
          <h4 className="font-semibold text-lg mb-4">Connect With Us</h4>
          <ul className="space-y-2 text-sm text-primary-foreground/70 mb-5">
            <li>✉️ contact@behtjamaa.com</li>
            <li>📍 Lubumbashi, DR Congo</li>
          </ul>
          <div className="flex gap-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg>
            </a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="w-9 h-9 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors">
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-primary-foreground/10 mt-10 pt-6 text-center text-sm text-primary-foreground/50">
        © {new Date().getFullYear()} BEHT JAMAA. All rights reserved.
      </div>
    </div>
  </footer>
);

const Index = () => (
  <div className="min-h-screen gradient-subtle">
    <Navbar />
    <HeroSection />
    <DailyScripture />
    <FeaturedEpisodes />
    <QuickLinks />
    <Footer />
  </div>
);

export default Index;
