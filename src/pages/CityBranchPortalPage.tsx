import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useTeamFounders } from "@/hooks/useContent";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  Building2,
  Calendar,
  Users,
  ArrowRight,
  Globe,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { Tables } from "@/integrations/supabase/types";

type BranchWithCounts = Tables<"branches"> & {
  member_count?: number;
  event_count?: number;
};

export default function CityBranchPortalPage() {
  const { stateSlug, childSlug } = useParams<{
    stateSlug: string;
    childSlug: string;
  }>();
  const navigate = useNavigate();

  const [stateBranch, setStateBranch] = useState<BranchWithCounts | null>(null);
  const [childBranch, setChildBranch] = useState<BranchWithCounts | null>(null);
  const [loading, setLoading] = useState(true);
  const { founders } = useTeamFounders();

  useEffect(() => {
    if (!stateSlug || !childSlug) {
      setLoading(false);
      return;
    }

    Promise.all([
      supabase
        .from("branches")
        .select(
          `
          *,
          branch_members (id),
          branch_events (id, title, scheduled_at, event_status)
        `
        )
        .eq("slug", stateSlug)
        .maybeSingle(),
      supabase
        .from("branches")
        .select(
          `
          *,
          branch_members (id),
          branch_events (id, title, scheduled_at, event_status)
        `
        )
        .eq("slug", childSlug)
        .maybeSingle(),
    ]).then(([stateResult, childResult]: [any, any]) => {
      if (stateResult.error) {
        setLoading(false);
        return;
      }
      if (!stateResult.data) {
        setLoading(false);
        return;
      }

      setStateBranch({
        ...stateResult.data,
        member_count: stateResult.data.branch_members?.length ?? 0,
        event_count: stateResult.data.branch_events?.filter(
          (e: any) => e.event_status === "upcoming" || e.event_status === "live"
        ).length ?? 0,
      });

      if (!childResult.data) {
        setLoading(false);
        return;
      }

      setChildBranch({
        ...childResult.data,
        member_count: childResult.data.branch_members?.length ?? 0,
        event_count: childResult.data.branch_events?.filter(
          (e: any) => e.event_status === "upcoming" || e.event_status === "live"
        ).length ?? 0,
      });

      setLoading(false);
    });
  }, [stateSlug, childSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-16">
        <div className="flex items-center justify-center h-[calc(100vh - 64px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  if (!stateBranch || !childBranch) {
    return (
      <div className="min-h-screen bg-background pt-16 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-10 text-center">
            <p className="text-lg font-semibold mb-2">Chapter not found</p>
            <p className="text-sm text-muted-foreground mb-6">
              This local chapter may have been moved or removed.
            </p>
            <Button asChild variant="outline">
              <Link to="/branches">Back to Branches</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button variant="ghost" onClick={() => navigate("/branches")} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Branches
        </Button>

        <div className="mb-8">
          <Badge className="mb-3 bg-primary/10 text-primary border-primary/20 text-sm px-4 py-1.5">
            {stateBranch.state_code || "USA"}
          </Badge>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              to={`/branches/${stateBranch.slug}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:underline"
            >
              <Globe className="h-4 w-4" />
              {stateBranch.name} state
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="text-lg font-semibold">{childBranch.name}</span>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-3 space-y-6">
            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center gap-4 mb-4">
                  {childBranch.logo_url ? (
                    <img
                      src={childBranch.logo_url}
                      alt=""
                      className="w-14 h-14 rounded-full object-cover border-2 border-border"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
                      <Building2 className="h-7 w-7 text-primary-foreground" />
                    </div>
                  )}
                  <div>
                    <h1 className="text-2xl font-bold">{childBranch.name}</h1>
                    {childBranch.location && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3.5 w-3.5" /> {childBranch.location}
                      </p>
                    )}
                  </div>
                </div>

                {childBranch.description && (
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {childBranch.description}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 pb-6">
                <h2 className="font-semibold mb-3">Contact</h2>
                <div className="space-y-3 text-sm">
                  {childBranch.leader_name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4 shrink-0" />
                      {childBranch.leader_name}
                      {childBranch.leader_email && (
                        <>
                          {" "}
                          <span className="text-muted-foreground/60">·</span>
                          <a
                            href={`mailto:${childBranch.leader_email}`}
                            className="text-blue-600 hover:underline"
                          >
                            {childBranch.leader_email}
                          </a>
                        </>
                      )}
                    </div>
                  )}
                  {childBranch.leader_email && !childBranch.leader_name && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4 shrink-0" />
                      <a
                        href={`mailto:${childBranch.leader_email}`}
                        className="text-blue-600 hover:underline"
                      >
                        {childBranch.leader_email}
                      </a>
                    </div>
                  )}
                  {childBranch.phone && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4 shrink-0" />
                      <a
                        href={`tel:${childBranch.phone}`}
                        className="text-blue-600 hover:underline"
                      >
                        {childBranch.phone}
                      </a>
                    </div>
                  )}
                  {childBranch.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {childBranch.location}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardContent className="pt-6 pb-6">
                <h2 className="font-semibold mb-3">State Overview</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {stateBranch.description ||
                    `${stateBranch.name} state chapter of BEHT JAMAA.`}
                </p>
                {stateBranch.location && (
                  <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" /> {stateBranch.location}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 pb-6">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-sm">Local Chapter Stats</h2>
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {childBranch.member_count} members
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {childBranch.event_count} upcoming events
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild>
            <Link to={`/branches/${stateBranch.slug}/events`}>
              View Chapter Events <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/members">Join This Chapter</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
