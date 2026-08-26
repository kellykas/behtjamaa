import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  MapPin,
  Users,
  Search,
  Building2,
  Calendar,
  Globe,
  Phone,
  Mail,
  ExternalLink,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type BranchWithStats = Tables<"branches"> & {
  member_count?: number;
  event_count?: number;
};

const BranchesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [branches, setBranches] = useState<BranchWithStats[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoading(true);
    const { data: branchData } = await supabase
      .from("branches")
      .select("*")
      .eq("active", true)
      .order("name");

    if (branchData) {
      const branchesWithStats = await Promise.all(
        branchData.map(async (branch) => {
          const [memberRes, eventRes] = await Promise.all([
            supabase
              .from("branch_members")
              .select("id", { count: "exact", head: true })
              .eq("branch_id", branch.id),
            supabase
              .from("branch_events")
              .select("id", { count: "exact", head: true })
              .eq("branch_id", branch.id),
          ]);
          return {
            ...branch,
            member_count: memberRes.count || 0,
            event_count: eventRes.count || 0,
          };
        })
      );
      setBranches(branchesWithStats);
    }
    setLoading(false);
  };

  const filtered = branches.filter(
    (b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.location && b.location.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen gradient-subtle">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>

        <div className="text-center mb-10">
          <Badge className="mb-3 bg-blue-100 text-blue-800 border-transparent">
            Our Branches
          </Badge>
          <h1 className="text-4xl font-bold mb-3">
            BEHT JAMAA Worldwide
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Find a branch near you and join a community of young people
            transforming lives for Jesus Christ.
          </p>
        </div>

        <div className="relative max-w-md mx-auto mb-10">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search branches by name or location..."
            className="pl-9"
          />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Loading branches...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-bold mb-2">
                {branches.length === 0
                  ? "No Branches Yet"
                  : "No Branches Found"}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {branches.length === 0
                  ? "Branches will appear here once created by an admin."
                  : "Try adjusting your search terms."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((branch) => (
              <Card
                key={branch.id}
                className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
              >
                {branch.banner_url && (
                  <div className="h-40 overflow-hidden">
                    <img
                      src={branch.banner_url}
                      alt={branch.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-start gap-3 mb-4">
                    {branch.logo_url ? (
                      <img
                        src={branch.logo_url}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover border"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shrink-0">
                        <Building2 className="h-6 w-6 text-primary-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <h3 className="font-bold text-lg leading-tight truncate">
                        {branch.name}
                      </h3>
                      {branch.location && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1 mt-0.5">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {branch.location}
                        </p>
                      )}
                    </div>
                  </div>

                  {branch.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {branch.description}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {branch.member_count} members
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      {branch.event_count} events
                    </span>
                  </div>

                  {branch.leader_name && (
                    <p className="text-xs text-muted-foreground mb-3">
                      <span className="font-medium">Led by:</span>{" "}
                      {branch.leader_name}
                    </p>
                  )}

                  <div className="flex flex-col gap-2">
                    <Link to={`/branches/${branch.slug}`}>
                      <Button className="w-full" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View Portal
                      </Button>
                    </Link>
                    <div className="flex gap-2">
                      {branch.phone && (
                        <a
                          href={`tel:${branch.phone}`}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Phone className="h-3.5 w-3.5 mr-1" />
                            Call
                          </Button>
                        </a>
                      )}
                      {branch.leader_email && (
                        <a
                          href={`mailto:${branch.leader_email}`}
                          className="flex-1"
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                          >
                            <Mail className="h-3.5 w-3.5 mr-1" />
                            Email
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!loading && branches.length > 0 && (
          <div className="text-center mt-10">
            <p className="text-muted-foreground text-sm">
              Can't find your city?{" "}
              <Link
                to="/contact"
                className="text-primary hover:underline font-medium"
              >
                Contact us
              </Link>{" "}
              about starting a new branch.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BranchesPage;
