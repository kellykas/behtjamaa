-- Create storage buckets for episode media
INSERT INTO storage.buckets (id, name, public) VALUES ('episode-audio', 'episode-audio', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('episode-thumbnails', 'episode-thumbnails', true);

-- Public read access
CREATE POLICY "Episode audio publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'episode-audio');

CREATE POLICY "Episode thumbnails publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'episode-thumbnails');

-- Admins can upload
CREATE POLICY "Admins can upload episode audio"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'episode-audio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can upload episode thumbnails"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'episode-thumbnails' AND public.has_role(auth.uid(), 'admin'));

-- Admins can update
CREATE POLICY "Admins can update episode audio"
ON storage.objects FOR UPDATE
USING (bucket_id = 'episode-audio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update episode thumbnails"
ON storage.objects FOR UPDATE
USING (bucket_id = 'episode-thumbnails' AND public.has_role(auth.uid(), 'admin'));

-- Admins can delete
CREATE POLICY "Admins can delete episode audio"
ON storage.objects FOR DELETE
USING (bucket_id = 'episode-audio' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete episode thumbnails"
ON storage.objects FOR DELETE
USING (bucket_id = 'episode-thumbnails' AND public.has_role(auth.uid(), 'admin'));