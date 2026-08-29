ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS hero_height_mobile integer NOT NULL DEFAULT 240,
  ADD COLUMN IF NOT EXISTS hero_height_desktop integer NOT NULL DEFAULT 380;