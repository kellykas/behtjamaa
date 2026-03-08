import { Calendar, Heart, Users, Bell, Play, LogIn } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const Navbar = () => (
  <nav className="sticky top-0 z-50 bg-background border-b px-4 py-3">
    <div className="max-w-6xl mx-auto flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
          <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
        </div>
        <div>
          <h2 className="font-bold text-lg leading-tight">BEHT JAMAA</h2>
          <p className="text-xs text-muted-foreground">Podcast Ministry</p>
        </div>
      </div>
      <div className="hidden md:flex items-center gap-6">
        <a href="/live" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Calendar className="h-4 w-4" />
          Live
          <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">LIVE</span>
        </a>
        <a href="/prayer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Heart className="h-4 w-4" />
          Prayer
        </a>
        <a href="/members" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Users className="h-4 w-4" />
          Members
        </a>
        <a href="/auth" className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground h-9 px-4 hover:bg-primary/90 transition-colors">
          Sign In
        </a>
      </div>
    </div>
  </nav>
);

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
        <button className="inline-flex items-center justify-center gap-2 h-11 rounded-md bg-brand-accent hover:bg-brand-accent/90 text-brand-accent-foreground font-semibold px-8 py-3 transition-colors">
          <Play className="mr-2 h-5 w-5" />
          Start Listening
        </button>
        <button className="inline-flex items-center justify-center gap-2 h-11 rounded-md border border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent font-medium px-8 py-3 transition-colors">
          <Bell className="mr-2 h-5 w-5" />
          Get Daily Scripture
        </button>
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

const FeaturedEpisodes = () => (
  <section className="py-16 px-4">
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-foreground mb-4">Featured Episodes</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Discover our latest sermons, testimonies, and Bible teachings designed to strengthen your faith and deepen your relationship with Christ.
        </p>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        <div className="col-span-full text-center py-12">
          <p className="text-muted-foreground text-lg">No episodes available yet.</p>
          <p className="text-muted-foreground">Check back soon for new content!</p>
        </div>
      </div>
    </div>
  </section>
);

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
          <a key={link.href} className="group" href={link.href}>
            <div className={`rounded-lg border bg-card text-card-foreground shadow-sm text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${link.borderColor}`}>
              <div className="p-6 pt-8 pb-6">
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center transition-colors ${link.iconBg}`}>
                  <link.icon className={`h-8 w-8 ${link.iconColor}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{link.title}</h3>
                <p className="text-muted-foreground text-sm">{link.desc}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  </section>
);

const Index = () => (
  <div className="min-h-screen gradient-subtle">
    <Navbar />
    <HeroSection />
    <DailyScripture />
    <FeaturedEpisodes />
    <QuickLinks />
  </div>
);

export default Index;
