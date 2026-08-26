-- Add image_url to branch_events for event banners and pictures
ALTER TABLE public.branch_events
  ADD COLUMN IF NOT EXISTS image_url text;
