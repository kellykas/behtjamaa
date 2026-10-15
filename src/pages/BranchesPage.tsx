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
  ArrowRight,
  Star,
  Layers,
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type BranchWithStats = Tables<"branches"> & {
  member_count?: number;
  event_count?: number;
};

function isStateBranch(branch: BranchWithStats): boolean {
  return Boolean((branch as any).is_state_branch);
}

const BranchesPage = () => {
  const { user, isAdmin, isSuperAdmin } = useAuth();
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
    <div className="min-h-screen" style={{ background: "linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)" }}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Home
        </Button>

        <div className="text-center mb-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-slate-100 text-slate-700 mb-4">
            Our Branches
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            BEHT JAMAA Worldwide
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            Find a branch near you and join a community of young people
            transforming lives for Jesus Christ.
          </p>
          {isAdmin && isSuperAdmin && (
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Button asChild>
                <Link to="/branches/state/new"><Plus className="h-4 w-4 mr-2" /> Add USA State</Link>
              </Button>
            </div>
          )}
        </div>

        <div className="relative max-w-md mx-auto mb-10">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search branches by name or location..."
            className="pl-11 py-6 rounded-full bg-white border-slate-200 shadow-sm focus:shadow-md transition-shadow"
          />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4" />
            <p className="text-slate-500">Loading branches...</p>
          </div>
        ) : filtered.length === 0 ? (
          <Card className="rounded-3xl border-0 shadow-lg">
            <CardContent className="py-16 text-center">
              <Building2 className="h-16 w-16 mx-auto mb-4 text-slate-300" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                {branches.length === 0
                  ? "No Branches Yet"
                  : "No Branches Found"}
              </h2>
              <p className="text-slate-500 max-w-md mx-auto">
                {branches.length === 0
                  ? "Branches will appear here once created by an admin."
                  : "Try adjusting your search terms."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((branch) => (
              <Link
                key={branch.id}
                to={`/branches/${branch.slug}`}
                className="group rounded-3xl overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-slate-100"
              >
                {/* Banner */}
                <div className="h-[280px] relative overflow-hidden">
                  {branch.banner_url ? (
                    <img
                      src={branch.banner_url}
                      alt={branch.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
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
                        <img
                          src={branch.logo_url}
                          alt=""
                          className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xl"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                          <Building2 className="h-7 w-7 text-white" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-bold text-white text-xl drop-shadow-lg">
                          {branch.name}
                        </h3>
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
                    <p className="text-sm text-slate-500 leading-relaxed mb-4 line-clamp-2">
                      {branch.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
                    <span className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5" />
                      {branch.member_count} members
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {branch.event_count} events
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-blue-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                      View Portal <ArrowRight className="h-4 w-4" />
                    </span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span className="text-xs font-medium text-slate-500">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {!loading && branches.length > 0 && (
          <div className="text-center mt-10">
            <p className="text-slate-500 text-sm">
              Can't find your city?{" "}
              <Link
                to="/contact"
                className="text-blue-600 hover:underline font-medium"
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
