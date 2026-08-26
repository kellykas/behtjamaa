import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

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

export function useServices() {
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("services").select("*").eq("active", true).order("sort_order")
      .then(({ data }) => { setServices(data || []); setLoading(false); });
  }, []);

  return { services, loading };
}
