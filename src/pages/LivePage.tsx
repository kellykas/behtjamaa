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
        ) : events.filter((e) => !e.is_live).length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Radio className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">No upcoming events scheduled.</p>
              <p className="text-muted-foreground">Check back soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {events.filter((e) => !e.is_live).map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="flex items-center justify-between p-6">
                  <div>
                    <h3 className="font-semibold text-lg">{event.title}</h3>
                    {event.description && <p className="text-muted-foreground text-sm">{event.description}</p>}
                  </div>
                  <div className="text-right flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{format(new Date(event.scheduled_at), "PPP 'at' p")}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LivePage;
