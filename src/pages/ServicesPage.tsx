import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Globe, Theater, Handshake, UsersRound, HeartHandshake } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

const services = [
  {
    icon: Globe,
    title: "Evangelism",
    subtitle: "Winning youths for Christ",
    color: "from-red-500 to-red-600",
    iconBg: "bg-red-100 text-red-600",
    description:
      'We go where young people are -- campuses, communities, social media -- and share the Gospel in ways that resonate with their lives. Through outreach events, street ministry, and digital evangelism, we bring the message of Jesus Christ to a generation searching for meaning and hope.',
    verse: '"How beautiful on the mountains are the feet of those who bring good news, who proclaim peace, who bring good tidings, who proclaim salvation." -- Isaiah 52:7',
  },
  {
    icon: Theater,
    title: "Artistic Activities",
    subtitle: "Empowering through the arts",
    color: "from-blue-500 to-blue-600",
    iconBg: "bg-blue-100 text-blue-600",
    description:
      'Arts are at the heart of BEHT JAMAA. We harness music, dance, drama, visual arts and spoken word to empower youths for a life of discipleship, ministry and service. Our goal is to promote their talents for a total worship experience that touches the spirit, the soul and the body with the power of the Holy Spirit.',
    verse: '"Sing to the Lord a new song; sing to the Lord, all the earth." -- Psalm 96:1',
  },
  {
    icon: Handshake,
    title: "Community Service",
    subtitle: "Empowering for usefulness",
    color: "from-emerald-500 to-emerald-600",
    iconBg: "bg-emerald-100 text-emerald-600",
    description:
      'We believe that faith without works is dead. Through community service projects, clean-up drives, mentorship programs, and local partnerships, we empower young people to serve their communities with compassion, integrity, and the love of Christ.',
    verse: '"For we are God\'s handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do." -- Ephesians 2:10',
  },
  {
    icon: UsersRound,
    title: "Workshops & Festivals",
    subtitle: "Starting where the youth are",
    color: "from-amber-500 to-amber-600",
    iconBg: "bg-amber-100 text-amber-600",
    description:
      'We start from where the youths are -- with their spiritual, physical, intellectual, social and financial needs. Through workshops on leadership, life skills, mental health and entrepreneurship, and festivals celebrating faith and creativity, we attract them and launch them in a process of lasting growth.',
    verse: '"Train up a child in the way he should go; even when he is old he will not depart from it." -- Proverbs 22:6',
  },
  {
    icon: HeartHandshake,
    title: "Humanitarian",
    subtitle: "Sharing the love of Christ",
    color: "from-purple-500 to-purple-600",
    iconBg: "bg-purple-100 text-purple-600",
    description:
      'We engage non-believers, especially young people, through tangible acts of care -- food distribution, clothing drives, hospital visits and support for vulnerable families. Every act of kindness opens a door to share the love and hope found in Jesus Christ.',
    verse: '"For I was hungry and you gave me something to eat, I was thirsty and you gave me something to drink." -- Matthew 25:35',
  },
];

const ServicesPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>

        <div className="text-center mb-14">
          <Badge className="mb-3">Our Services</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Ministry Services</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Five pillars working together to transform the lives of young people across the planet.
          </p>
        </div>

        <div className="space-y-8">
          {services.map((svc) => (
            <Card key={svc.title} className="overflow-hidden hover:shadow-lg transition-all duration-300">
              <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                  <div className={`md:w-64 shrink-0 bg-gradient-to-br ${svc.color} p-8 flex flex-col items-center justify-center text-center`}>
                    <svc.icon className="h-12 w-12 text-white mb-3" />
                    <h3 className="text-xl font-bold text-white">{svc.title}</h3>
                    <p className="text-sm text-white/80 mt-1">{svc.subtitle}</p>
                  </div>
                  <div className="flex-1 p-6 md:p-8">
                    <p className="text-muted-foreground leading-relaxed mb-4">{svc.description}</p>
                    <blockquote className="text-sm italic text-blue-700 bg-blue-50 border-l-4 border-blue-300 p-3 rounded-r-md">
                      {svc.verse}
                    </blockquote>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center space-y-4">
          <h2 className="text-2xl font-bold">Get Involved</h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Whether through prayer, volunteering, or supporting our work financially -- there is a place for you in BEHT JAMAA.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/members">
              <Button size="lg">Join Us Today</Button>
            </Link>
            <Link to="/donate">
              <Button variant="outline" size="lg">
                Donate
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
