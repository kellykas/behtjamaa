-- Site settings: key-value store for all editable page content
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  section TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Site settings viewable by everyone" ON public.site_settings FOR SELECT USING (true);
CREATE POLICY "Admins can manage site settings" ON public.site_settings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Team members
CREATE TABLE public.team_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Team members viewable by everyone" ON public.team_members FOR SELECT USING (true);
CREATE POLICY "Admins can manage team members" ON public.team_members FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Services / ministry areas
CREATE TABLE public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  bible_verse TEXT,
  sort_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Services viewable by everyone" ON public.services FOR SELECT USING (true);
CREATE POLICY "Admins can manage services" ON public.services FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON public.site_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_team_members_updated_at BEFORE UPDATE ON public.team_members FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed site_settings with current hardcoded values
INSERT INTO public.site_settings (key, value, section) VALUES
  ('hero_title', 'BOYS EVANGELISTS OF THE HOLY TRINITY', 'home'),
  ('hero_subtitle', 'A youth evangelistic ministry winning souls for the glory of our Lord Jesus Christ through the arts, impacting youths worldwide by modeling Jesus Christ''s lifestyle in this generation.', 'home'),
  ('hero_established', 'EST. 2011', 'home'),
  ('hero_tagline', 'B.E.H.T', 'home'),
  ('stat_years', '14+', 'home'),
  ('stat_years_label', 'Years of Ministry', 'home'),
  ('stat_souls', 'Countless', 'home'),
  ('stat_souls_label', 'Souls Won for Christ', 'home'),
  ('stat_award', '2016', 'home'),
  ('stat_award_label', 'Akademia Music Award', 'home'),
  ('vision', 'To create Youth Worship Centers across the planet for evangelism, discipleship and worship according to Matthew 28:18-19.', 'home'),
  ('mission', 'To win souls for Jesus Christ and empower the youths for evangelism (Isaiah 52:7; Romans 10:15).', 'home'),
  ('purpose', 'To attract youths, empower them for discipleship and service, and promote their talents for a total worship experience touching spirit, soul, and body.', 'home'),
  ('confession_title', 'Our Confession', 'about'),
  ('confession_1', 'We believe in the HOLY TRINITY (God the Father, Son, and Holy Spirit as one God).', 'about'),
  ('confession_2', 'The Bible is our reference (2 Timothy 3:16-17).', 'about'),
  ('confession_3', 'The Holy Spirit is the source of our inspiration.', 'about'),
  ('about_story', 'In 2010, at Gabba Bible Institute, God met with Christophe Sadiki Mubira and called him from the world to His kingdom for a great mission: "Saved to win souls for Jesus Christ." After experiencing salvation, Chris felt a deep burden for his generation of youths still living in sin and perversion. Like Jeremiah, Moses, Samuel, and Timothy, the Spirit convicted him to speak about Jesus Christ to fellow youths. When God asked "What do you have?" Chris answered, "All I know is to rap." God revealed that many youths loved rap music and sent him to be a "fisher of men" using his artistic gifts. During an overnight service at Gabba Community Church, God spoke through Isaiah 52:7 and 1 Timothy 4:12, telling him not to let anyone look down on him and to be an example to fellow youths in all ways, spiritually, socially, and in love. In late 2010, Chris met with his co-founders, Dieudonne Sangano, Danny Mani, Fabrice Muhindo, and Lwenga Rajabu, united in spirit and purpose to glorify Jesus Christ. Together, they launched the ASJC (All Souls for Jesus Christ) project on January 7, 2011, organizing youth conferences, concerts, crusades, recording albums, and using media to spread the Gospel.', 'about'),
  ('contact_email', 'wetheboys243@gmail.com', 'contact'),
  ('contact_phone', '+1 (502) 936-4279', 'contact'),
  ('contact_address', '123 Faith Avenue, City, State 12345', 'contact'),
  ('contact_hours_weekday', 'Monday - Friday: 9:00 AM - 5:00 PM', 'contact'),
  ('contact_hours_saturday', 'Saturday: 10:00 AM - 2:00 PM', 'contact'),
  ('contact_hours_sunday', 'Sunday: Closed', 'contact'),
  ('donate_bank_name', 'First National Bank', 'donate'),
  ('donate_account_name', 'BEHT JAMAA Ministry', 'donate'),
  ('donate_routing', '123456789', 'donate'),
  ('donate_mail_address', 'BEHT JAMAA, 123 Faith Avenue, City, State 12345', 'donate'),
  ('donate_email', 'giving@behtjamaa.org', 'donate'),
  ('donate_phone', '+1 (555) 123-4567', 'donate'),
  ('footer_name', 'Boys Evangelists of the Holy Trinity', 'footer'),
  ('footer_description', 'A youth evangelistic ministry winning souls for the glory of our Lord Jesus Christ through the arts.', 'footer'),
  ('footer_copyright', '© 2024 BEHT JAMAA. All rights reserved.', 'footer')
ON CONFLICT (key) DO NOTHING;

-- Seed team members
INSERT INTO public.team_members (name, role, bio, sort_order) VALUES
  ('Chris Sadiki', 'President & Founder', 'Called by God in 2010 to win souls through the arts. Leading BEHT JAMAA since its founding on January 7, 2011.', 1),
  ('Reagan Lescot', 'Secretary', 'Dedicated servant of God, organizing and coordinating ministry activities.', 2),
  ('Fab Meekboy', 'Project Manager', 'Talented artist and project leader, driving BEHT JAMAA''s creative initiatives forward.', 3)
ON CONFLICT DO NOTHING;

-- Seed services
INSERT INTO public.services (title, description, icon, bible_verse, sort_order) VALUES
  ('Evangelism', 'Winning souls for Jesus Christ through outreach programs, street ministry, and community engagement.', 'Heart', 'How beautiful are the feet of those who bring good news! - Romans 10:15', 1),
  ('Artistic Activities', 'Using music, dance, drama, and visual arts to spread the Gospel and glorify God.', 'Music', 'Sing to the Lord a new song; sing to the Lord, all the earth. - Psalm 96:1', 2),
  ('Community Service', 'Serving our local communities through practical acts of love and compassion.', 'Users', 'For even the Son of Man did not come to be served, but to serve. - Mark 10:45', 3),
  ('Workshops & Festivals', 'Organizing youth conferences, workshops, and festivals to equip and inspire the next generation.', 'Calendar', 'Don''t let anyone look down on you because you are young, but set an example. - 1 Timothy 4:12', 4),
  ('Humanitarian Work', 'Providing relief and support to those in need, reflecting God''s love in action.', 'HeartHandshake', 'Religion that God our Father accepts as pure and faultless is this: to look after orphans and widows. - James 1:27', 5)
ON CONFLICT DO NOTHING;
