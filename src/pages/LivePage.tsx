import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Radio, ArrowLeft, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

const Countdown = ({ target }: { target: string }) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = new Date(target).getTime() - now;
  if (diff <= 0) return null;

  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const secs = Math.floor((diff % 60000) / 1000);

  return (
    <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600">
      <Clock className="h-4 w-4" />
      Starts in {days > 0 && `${days}d `}{hours}h {mins}m {secs}s
    </span>
  );
};

const LivePage = () => {
  const [events, setEvents] = useState<Tables<"live_events">[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      const { data } = await supabase
        .from("live_events")
        .select("*")
        .order("scheduled_at", { ascending: true });
      setEvents(data || []);
      setLoading(false);
    };
    fetchEvents();
  }, []);

  const liveNow = events.find((e) => e.is_live);
  const now = Date.now();
  const sorted = [...events].sort(
    (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime()
  );
  const upcomingEvents = sorted.filter((e) => !e.is_live && new Date(e.scheduled_at).getTime() >= now);
  const pastEvents = sorted.filter((e) => !e.is_live && new Date(e.scheduled_at).getTime() < now).reverse();

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>

        <h1 className="text-4xl font-bold mb-2">Live Broadcast</h1>
        <p className="text-muted-foreground mb-8">Join our live services and events</p>

        {liveNow && (
          <Card className="mb-8 border-red-300 bg-red-50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Badge className="bg-destructive text-destructive-foreground animate-pulse">🔴 LIVE NOW</Badge>
                <CardTitle>{liveNow.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {liveNow.description && <p className="text-muted-foreground mb-4">{liveNow.description}</p>}
              {liveNow.stream_url && (
                <div className="aspect-video bg-foreground/5 rounded-lg overflow-hidden">
                  <iframe
                    src={liveNow.stream_url}
                    className="w-full h-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5" /> Upcoming Events
        </h2>

        {loading ? (
          <p className="text-muted-foreground">Loading events...</p>
        ) : upcomingEvents.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">No upcoming events scheduled.</p>
              <p className="text-muted-foreground">Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {upcomingEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-3">
                  <div>
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    {event.description && <p className="text-muted-foreground text-sm">{event.description}</p>}
                  </div>
                  <div className="flex flex-col items-start sm:items-end gap-1">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">{format(new Date(event.scheduled_at), "PPP 'at' p")}</span>
                    </div>
                    <Countdown target={event.scheduled_at} />
                  </div>
                </CardContent>
              </Card>
            ))
            }
          </div>
        )}

        {pastEvents.length > 0 && (
          <>
            <h2 className="text-2xl font-semibold mt-12 mb-4 text-muted-foreground">Past Events</h2>
            <div className="grid gap-3 opacity-75">
              {pastEvents.map((event) => (
                <Card key={event.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <h3 className="font-semibold">{event.title}</h3>
                      {event.description && <p className="text-muted-foreground text-sm">{event.description}</p>}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <Clock className="h-4 w-4" />
                      <span>{format(new Date(event.scheduled_at), "PPP 'at' p")}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LivePage;
