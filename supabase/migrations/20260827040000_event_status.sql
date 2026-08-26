-- Add event_status column for toggling event visibility
ALTER TABLE public.branch_events
  ADD COLUMN IF NOT EXISTS event_status text DEFAULT 'upcoming' CHECK (event_status IN ('upcoming', 'live', 'past', 'cancelled'));

-- Set existing events to 'past' if scheduled_at is in the past, 'upcoming' otherwise
UPDATE public.branch_events
  SET event_status = CASE WHEN scheduled_at < now() THEN 'past' ELSE 'upcoming' END
  WHERE event_status IS NULL OR event_status = 'upcoming';
