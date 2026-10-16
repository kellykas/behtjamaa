import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const fallbackFounders = [
  { id: "fallback-1", name: "Christophe Sadiki Mubira", role: "Founder & President", subtitle: "", bio: "", avatar_url: null, sort_order: 1 },
  { id: "fallback-2", name: "Dieudonne Sangano", role: "Co-Founder", subtitle: "", bio: "", avatar_url: null, sort_order: 2 },
  { id: "fallback-3", name: "Danny Mani", role: "Co-Founder", subtitle: "", bio: "", avatar_url: null, sort_order: 3 },
  { id: "fallback-4", name: "Fabrice Muhindo", role: "Co-Founder", subtitle: "", bio: "", avatar_url: null, sort_order: 4 },
  { id: "fallback-5", name: "Lwenga Rajabu", role: "Co-Founder & Secretary", subtitle: "aka Reagan Lescot", bio: "", avatar_url: null, sort_order: 5 },
];

export function useSiteSettings(section?: string) {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let query = supabase.from("site_settings").select("key, value");
    if (section) query = query.eq("section", section);
    query.then(({ data }) => {
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s) => { map[s.key] = s.value || ""; });
        setSettings(map);
      }
      setLoading(false);
    });
  }, [section]);

  return { settings, loading };
}

export function useTeamMembers() {
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("team_members").select("*").eq("active", true).order("sort_order")
      .then(({ data }) => { setMembers(data || []); setLoading(false); });
  }, []);

  return { members, loading };
}

export function useTeamMember(id: string | null) {
  const [member, setMember] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setMember(null);
      setLoading(false);
      return;
    }
    supabase
      .from("team_members")
      .select("*")
      .eq("id", id)
      .single()
      .then(({ data, error }) => {
        setMember(error ? null : data);
        setLoading(false);
      });
  }, [id]);

  return { member, loading, refetch: () => setLoading(true) };
}

/**
 * Founders shown on the About page.
 *
 * `fallback` keeps the public About page rendering the seeded leadership when
 * the table is missing or empty. The admin editor passes `fallback: false` so
 * it always sees the real rows (and the real empty state).
 */
export function useTeamFounders({ fallback = true }: { fallback?: boolean } = {}) {
  const [founders, setFounders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    supabase
      .from("team_founders" as any)
      .select("*" as any)
      .eq("active", true)
      .order("sort_order" as any)
      .then(({ data }: { data?: any[] | null }) => {
        if (cancelled) return;
        setFounders(data && data.length > 0 ? data : fallback ? fallbackFounders : []);
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fallback, reloadKey]);

  return { founders, loading, refetch: () => setReloadKey((k) => k + 1) };
}

export function useFounders() {
  return useTeamFounders();
}

export function useServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("services").select("*").eq("active", true).order("sort_order")
      .then(({ data }) => { setServices(data || []); setLoading(false); });
  }, []);

  return { services, loading };
}

// USA branch grouping

export function useStateBranches() {
  const [stateBranches, setStateBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("branches")
      .select("*")
      .eq("is_state_branch", true)
      .order("name")
      .then(({ data }) => {
        setStateBranches(data || []);
        setLoading(false);
      });
  }, []);

  return { stateBranches, loading };
}

export function useSubBranches(parentId: string | null) {
  const [subBranches, setSubBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!parentId) {
      setSubBranches([]);
      setLoading(false);
      return;
    }
    supabase
      .from("branches")
      .select("*")
      .eq("parent_id", parentId)
      .order("name")
      .then(({ data }) => {
        setSubBranches(data || []);
        setLoading(false);
      });
  }, [parentId]);

  return { subBranches, loading };
}
