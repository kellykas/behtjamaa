-- ============================================================================
-- About Founders (About-page-specific leadership team)
-- ============================================================================
-- Kept separate from team_members so the public About page can maintain its
-- own founders/leaders independently of the home team section.

CREATE TABLE IF NOT EXISTS public.team_founders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  subtitle TEXT,
  bio TEXT,
  avatar_url TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.team_founders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Team founders viewable by everyone" ON public.team_founders;
CREATE POLICY "Team founders viewable by everyone" ON public.team_founders FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Admins can manage team founders" ON public.team_founders;
CREATE POLICY "Admins can manage team founders" ON public.team_founders FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

DROP TRIGGER IF EXISTS update_team_founders_updated_at ON public.team_founders;
CREATE TRIGGER update_team_founders_updated_at
  BEFORE UPDATE ON public.team_founders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed the current About founders only if the table is still empty.
INSERT INTO public.team_founders (name, role, subtitle, bio, sort_order)
VALUES
  ('Christophe Sadiki Mubira', 'Founder & President', '', 'Called by God in 2010 to win souls through the arts. Leading BEHT JAMAA since its founding on January 7, 2011.', 1),
  ('Dieudonne Sangano', 'Co-Founder', '', 'Co-founder and early partner in the BEHT JAMAA mission.', 2),
  ('Danny Mani', 'Co-Founder', '', 'Co-founder helping shape the ministry from its beginning.', 3),
  ('Fabrice Muhindo', 'Co-Founder', '', 'Co-founder and creative leader within the ministry.', 4),
  ('Lwenga Rajabu', 'Co-Founder & Secretary', 'aka Reagan Lescot', 'Co-founder and secretary coordinating ministry activities.', 5)
ON CONFLICT DO NOTHING;
