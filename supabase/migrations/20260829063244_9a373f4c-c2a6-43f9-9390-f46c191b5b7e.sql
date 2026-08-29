ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS hero_bg_style text NOT NULL DEFAULT 'gradient',
  ADD COLUMN IF NOT EXISTS hero_bg_from text NOT NULL DEFAULT '#e9f7ef',
  ADD COLUMN IF NOT EXISTS hero_bg_to text NOT NULL DEFAULT '#ffffff',
  ADD COLUMN IF NOT EXISTS hero_max_width integer NOT NULL DEFAULT 1200;

ALTER TABLE public.site_settings ALTER COLUMN hero_height_mobile SET DEFAULT 200;
ALTER TABLE public.site_settings ALTER COLUMN hero_height_desktop SET DEFAULT 300;