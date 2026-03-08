import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Heart, ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import type { Tables } from "@/integrations/supabase/types";

const PrayerPage = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<Tables<"prayer_requests">[]>([]);
  const [name, setName] = useState("");
  const [request, setRequest] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchRequests = async () => {
    const { data } = await supabase
      .from("prayer_requests")
      .select("*")
      .order("created_at", { ascending: false });
    setRequests(data || []);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({ title: "Please sign in", description: "You need to be signed in to submit a prayer request.", variant: "destructive" });
      navigate("/auth");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("prayer_requests").insert({
      user_id: user.id,
      name: isAnonymous ? "Anonymous" : name,
      request,
      is_anonymous: isAnonymous,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Prayer request submitted", description: "Our community will be praying for you." });
      setName("");
      setRequest("");
      setIsAnonymous(false);
      fetchRequests();
    }
  };

  const handlePray = async (id: string, currentCount: number) => {
    await supabase.from("prayer_requests").update({ prayed_count: currentCount + 1 }).eq("id", id);
    fetchRequests();
  };

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>

        <h1 className="text-4xl font-bold mb-2">Prayer Requests</h1>
        <p className="text-muted-foreground mb-8">Submit your prayer needs and pray for others</p>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Send className="h-5 w-5" /> Submit a Prayer Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isAnonymous && (
                <div className="space-y-2">
                  <Label htmlFor="prayer-name">Your Name</Label>
                  <Input id="prayer-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required={!isAnonymous} />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="prayer-request">Prayer Request</Label>
                <Textarea id="prayer-request" value={request} onChange={(e) => setRequest(e.target.value)} placeholder="Share your prayer need..." required rows={4} maxLength={1000} />
              </div>
              <div className="flex items-center gap-2">
                <Switch id="anonymous" checked={isAnonymous} onCheckedChange={setIsAnonymous} />
                <Label htmlFor="anonymous">Submit anonymously</Label>
              </div>
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Prayer Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <h2 className="text-2xl font-semibold mb-4">Community Prayers</h2>
        {requests.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-lg">No prayer requests yet.</p>
              <p className="text-muted-foreground">Be the first to share.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {requests.map((pr) => (
              <Card key={pr.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold">{pr.is_anonymous ? "Anonymous" : pr.name}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(pr.created_at), "PPP")}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => handlePray(pr.id, pr.prayed_count || 0)} className="text-blue-600 border-blue-300 hover:bg-blue-50">
                      <Heart className="h-4 w-4 mr-1" /> Prayed ({pr.prayed_count || 0})
                    </Button>
                  </div>
                  <p className="text-muted-foreground">{pr.request}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PrayerPage;
