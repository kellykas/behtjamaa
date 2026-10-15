import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Eye, Target, BookOpen, Globe, Theater, Handshake, UsersRound, HeartHandshake, Trophy, Music, Mic, Star, Sparkles } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useTeamFounders } from "@/hooks/useContent";
import { useState, useEffect } from "react";

const stats = [
  { value: "2011", label: "Year Established", icon: Star },
  { value: "14+", label: "Years of Ministry", icon: Trophy },
  { value: "Countless", label: "Souls Won for Christ", icon: HeartHandshake },
  { value: "2016", label: "Akademia Music Award", icon: Music },
];

const whatWeDo = [
  { icon: Globe, label: "Evangelism" },
  { icon: UsersRound, label: "Sports Events" },
  { icon: Theater, label: "Artistic Activities" },
  { icon: Sparkles, label: "Workshops & Festivals" },
  { icon: HeartHandshake, label: "Humanitarian Work" },
  { icon: Handshake, label: "Community Service" },
  { icon: Globe, label: "War on Drugs" },
  { icon: Target, label: "Youth Training" },
  { icon: BookOpen, label: "Discipleship Programs" },
];

const achievements = [
  {
    icon: Music,
    title: "Akademia Music Awards 2016",
    desc: "Won Best Contemporary Christian Song category in California",
    color: "from-amber-500 to-amber-600",
  },
  {
    icon: HeartHandshake,
    title: "Souls Won for Christ",
    desc: "The majority of our present members are our own fruits, transformed lives for Jesus",
    color: "from-emerald-500 to-emerald-600",
  },
  {
    icon: Globe,
    title: "International Performances",
    desc: "Performed on local and international stages in Kampala, Uganda, and USA, in schools, churches, streets, and beyond",
    color: "from-blue-500 to-blue-600",
  },
];

const initialsFor = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

const AboutPage = () => {
  const navigate = useNavigate();
  const { founders, loading: foundersLoading } = useTeamFounders();

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>

        {/* Hero */}
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5">EST. 2011</Badge>
          <h1 className="text-5xl md:text-7xl font-bold mb-2 leading-tight">B.E.H.T</h1>
          <p className="text-xl md:text-2xl font-medium text-muted-foreground mb-6">Boyz Evangelists of the Holy Trinity</p>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            A youth evangelistic ministry winning souls for the glory of our Lord Jesus Christ through the arts, impacting youths worldwide by modeling Jesus Christ&apos;s lifestyle in this generation.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {stats.map((s) => (
            <Card key={s.label} className="text-center hover:shadow-md transition-shadow">
              <CardContent className="pt-6 pb-4">
                <s.icon className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-3xl font-bold mb-1">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Our Story */}
        <section className="mb-20">
          <Badge className="mb-3">Our Story</Badge>
          <h2 className="text-3xl font-bold mb-6">How It All Began</h2>
          <div className="prose prose-lg max-w-none space-y-4 text-muted-foreground">
            <p>
              In 2010, at Gabba Bible Institute, God met with <strong className="text-foreground">Christophe Sadiki Mubira</strong> and called him from the world to His kingdom for a great mission: <em>&quot;Saved to win souls for Jesus Christ.&quot;</em>
            </p>
            <p>
              After experiencing salvation, Chris felt a deep burden for his generation of youths still living in sin and perversion. Like Jeremiah, Moses, Samuel, and Timothy, the Spirit convicted him to speak about Jesus Christ to fellow youths.
            </p>
            <p>
              When God asked <em>&quot;What do you have?&quot;</em> Chris answered, <em>&quot;All I know is to rap.&quot;</em> God revealed that many youths loved rap music and sent him to be a &quot;fisher of men&quot; using his artistic gifts.
            </p>
            <p>
              During an overnight service at Gabba Community Church, God spoke through <strong className="text-foreground">Isaiah 52:7</strong> and <strong className="text-foreground">1 Timothy 4:12</strong>, telling him not to let anyone look down on him and to be an example to fellow youths in all ways, spiritually, socially, and in love.
            </p>
            <p>
              In late 2010, Chris met with his co-founders, <strong className="text-foreground">Dieudonne Sangano, Danny Mani, Fabrice Muhindo, and Lwenga Rajabu</strong>, united in spirit and purpose to glorify Jesus Christ. Together, they launched the ASJC (All Souls for Jesus Christ) project on <strong className="text-foreground">January 7, 2011</strong>, organizing youth conferences, concerts, crusades, recording albums, and using media to spread the Gospel.
            </p>
          </div>
        </section>

        {/* Vision / Mission / Purpose */}
        <section className="mb-20">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Eye, title: "Our Vision", text: "To create Youth Worship Centers across the planet for evangelism, discipleship and worship according to Matthew 28:18-19.", accent: "from-blue-500 to-blue-600" },
              { icon: Target, title: "Our Mission", text: "To win souls for Jesus Christ and empower the youths for evangelism (Isaiah 52:7; Romans 10:15).", accent: "from-emerald-500 to-emerald-600" },
              { icon: Sparkles, title: "Our Purpose", text: "To attract youths, empower them for discipleship and service, and promote their talents for a total worship experience touching spirit, soul, and body.", accent: "from-purple-500 to-purple-600" },
            ].map((item) => (
              <Card key={item.title} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${item.accent} flex items-center justify-center`}>
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.text}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* What We Do */}
        <section className="mb-20">
          <Badge className="mb-3">What We Do</Badge>
          <h2 className="text-3xl font-bold mb-8">Ministry Activities</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-4">
            {whatWeDo.map((item) => (
              <div key={item.label} className="flex items-center gap-3 bg-background border rounded-lg p-4 hover:shadow-md transition-shadow">
                <item.icon className="h-5 w-5 text-primary shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Confession */}
        <section className="mb-20">
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="p-8 md:p-12">
              <BookOpen className="h-10 w-10 mb-4 opacity-80" />
              <h2 className="text-2xl font-bold mb-6">Our Confession</h2>
              <ul className="space-y-3 text-primary-foreground/90">
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary-foreground/50 shrink-0" />
                  We believe in the <strong>HOLY TRINITY</strong> (God the Father, Son, and Holy Spirit as one God).
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary-foreground/50 shrink-0" />
                  The <strong>Bible</strong> is our reference (2 Timothy 3:16-17).
                </li>
                <li className="flex items-start gap-3">
                  <span className="mt-1 h-2 w-2 rounded-full bg-primary-foreground/50 shrink-0" />
                  The <strong>Holy Spirit</strong> is the source of our inspiration.
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Achievements */}
        <section className="mb-20">
          <Badge className="mb-3">Recognition</Badge>
          <h2 className="text-3xl font-bold mb-8">Achievements & Recognition</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {achievements.map((a) => (
              <Card key={a.title} className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="pt-8 pb-6 text-center">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${a.color} flex items-center justify-center`}>
                    <a.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{a.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Founders */}
        <section className="mb-20">
          <Badge className="mb-3">Leadership</Badge>
          <h2 className="text-3xl font-bold mb-8">Our Founders & Team</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {founders.map((m) => (
              <Card key={m.id} className="group relative hover:shadow-md transition-shadow">
                <CardContent className="pt-6 text-center">
                  <div className="relative inline-flex items-center justify-center mb-3">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center mx-auto">
                      {m.avatar_url ? (
                        <img src={m.avatar_url} alt={m.name} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-primary-foreground">{initialsFor(m.name)}</span>
                      )}
                    </div>
                    <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Link to={`/admin/founders/${m.id}`} className="p-1.5 rounded-full bg-white/80 text-primary hover:bg-white transition-colors" title="Edit founder">
                        <Eye className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                  <h3 className="font-bold">{m.name}</h3>
                  {m.subtitle && <p className="text-xs text-muted-foreground italic">{m.subtitle}</p>}
                  <p className="text-sm text-primary font-medium">{m.role}</p>
                  {m.bio && <p className="text-xs text-muted-foreground mt-2">{m.bio}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Join the Movement</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            Be part of a generation that&apos;s modeling Jesus Christ&apos;s lifestyle and transforming lives worldwide.
          </p>
          <blockquote className="text-muted-foreground italic mb-6">
            &quot;How beautiful are the feet of those who bring good news!&quot;, Romans 10:15
          </blockquote>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/members"><Button size="lg">Become a Member</Button></Link>
            <Link to="/donate"><Button variant="outline" size="lg">Support Our Mission</Button></Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;
