CREATE TABLE public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  label text not null,
  number text,
  instructions text,
  color text not null default '#0f9d58',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

GRANT SELECT ON public.payment_methods TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.payment_methods TO authenticated;
GRANT ALL ON public.payment_methods TO service_role;

ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY payment_methods_public_read ON public.payment_methods FOR SELECT USING (true);
CREATE POLICY payment_methods_admin_write ON public.payment_methods FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());

CREATE TRIGGER payment_methods_set_updated_at BEFORE UPDATE ON public.payment_methods
FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

INSERT INTO public.payment_methods (code, label, number, instructions, color, sort_order, is_active)
SELECT 'bkash', 'বিকাশ', s.bkash_number, s.payment_instructions, '#e2136e', 1, s.bkash_enabled FROM public.site_settings s WHERE s.id = 1;
INSERT INTO public.payment_methods (code, label, number, instructions, color, sort_order, is_active)
SELECT 'nagad', 'নগদ', s.nagad_number, s.payment_instructions, '#f6921e', 2, s.nagad_enabled FROM public.site_settings s WHERE s.id = 1;
INSERT INTO public.payment_methods (code, label, number, instructions, color, sort_order, is_active)
SELECT 'rocket', 'রকেট', s.rocket_number, s.payment_instructions, '#8c3494', 3, s.rocket_enabled FROM public.site_settings s WHERE s.id = 1;