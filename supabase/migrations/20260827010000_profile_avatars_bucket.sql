-- Create storage bucket for profile avatars
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-avatars', 'profile-avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Public read access for profile avatars
CREATE POLICY "Profile avatars publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'profile-avatars');

-- Authenticated users can upload their own avatar
CREATE POLICY "Authenticated users can upload avatars"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'profile-avatars' AND auth.role() = 'authenticated');

-- Users can update their own avatars
CREATE POLICY "Users can update own avatars"
ON storage.objects FOR UPDATE
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Users can delete their own avatars
CREATE POLICY "Users can delete own avatars"
ON storage.objects FOR DELETE
USING (bucket_id = 'profile-avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
