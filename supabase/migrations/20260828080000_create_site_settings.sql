-- Create site_settings table for site-wide configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
  key text PRIMARY KEY,
  value text,
  section text DEFAULT 'general',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- RLS for site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read site settings (public config)
CREATE POLICY "Anyone can read site settings"
ON public.site_settings FOR SELECT
USING (true);

-- Only admins can modify site settings
CREATE POLICY "Admins can manage site settings"
ON public.site_settings FOR ALL
USING (
  public.has_role(auth.uid(), 'admin'::public.app_role)
);

-- Insert some default settings
INSERT INTO public.site_settings (key, value, section) VALUES
  ('glass_intensity', '60', 'appearance'),
  ('hero_image_url', '', 'home'),
  ('hero_title', 'BEHT JAMAA', 'home'),
  ('hero_subtitle', 'Winning souls for the Glory of our Lord Jesus Christ through Arts, empowering youths for a life of discipleship, ministry and service.', 'home')
ON CONFLICT (key) DO NOTHING;
