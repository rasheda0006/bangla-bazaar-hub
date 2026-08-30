alter table public.site_settings
  add column if not exists og_image_url text,
  add column if not exists og_description text,
  add column if not exists fb_capi_access_token text,
  add column if not exists tiktok_url text,
  add column if not exists payment_instructions text default 'সেন্ড মানি করার পর ট্রানজেকশন আইডি ও যে নম্বর থেকে পাঠিয়েছেন তা নিচে লিখুন।',
  add column if not exists header_bg_color text not null default '#ffffff',
  add column if not exists header_text_color text not null default '#0f172a',
  add column if not exists header_show_search boolean not null default true,
  add column if not exists footer_bg_color text not null default '#f3f5f7',
  add column if not exists footer_text_color text not null default '#0f172a',
  add column if not exists footer_about text,
  add column if not exists footer_links_title text not null default 'দ্রুত লিংক',
  add column if not exists footer_contact_title text not null default 'যোগাযোগ',
  add column if not exists footer_copyright text,
  add column if not exists sec_categories_title text not null default 'ক্যাটাগরি',
  add column if not exists sec_categories_subtitle text not null default 'আপনার পছন্দের ক্যাটাগরি বেছে নিন',
  add column if not exists sec_best_title text not null default 'বেস্ট সেলিং ডিজিটাল প্রোডাক্ট',
  add column if not exists sec_best_subtitle text not null default 'সবচেয়ে বেশি বিক্রি হওয়া কোর্স, টুলস ও সাবস্ক্রিপশন',
  add column if not exists sec_suggested_title text not null default 'আপনার জন্য সাজেস্টেড',
  add column if not exists sec_suggested_subtitle text not null default 'আপনার পছন্দ হতে পারে এমন ডিজিটাল প্রোডাক্ট',
  add column if not exists sec_all_title text not null default 'সব ডিজিটাল প্রোডাক্ট',
  add column if not exists sec_all_subtitle text not null default 'কোর্স, টুলস, সাবস্ক্রিপশন, ই-বুক ও টেমপ্লেট',
  add column if not exists sec_testimonials_title text not null default 'কাস্টমার রিভিউ',
  add column if not exists sec_testimonials_subtitle text not null default 'আমাদের ক্রেতারা যা বলছেন',
  add column if not exists sec_proof_title text not null default 'অর্ডার প্রুফ',
  add column if not exists sec_proof_subtitle text not null default 'আমাদের কাছ থেকে যারা অর্ডার করেছেন',
  add column if not exists show_proofs boolean not null default true,
  add column if not exists hero_badge_text text not null default 'নতুন ডিজিটাল কালেকশন লাইভ',
  add column if not exists hero_secondary_cta_text text not null default 'সব প্রোডাক্ট',
  add column if not exists hero_secondary_cta_link text not null default '/shop',
  add column if not exists hero_trust_text text not null default 'নিরাপদ পেমেন্ট',
  add column if not exists hero_customers_text text not null default '১০,০০০+ গ্রাহক',
  add column if not exists hero_delivery_badge_text text not null default 'ইনস্ট্যান্ট ডেলিভারি';

create table if not exists public.proof_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  caption text,
  sort_order integer not null default 0,
  created_at timestamp with time zone not null default now()
);

grant select on public.proof_images to anon;
grant select, insert, update, delete on public.proof_images to authenticated;
grant all on public.proof_images to service_role;

alter table public.proof_images enable row level security;

drop policy if exists proofs_public_read on public.proof_images;
create policy proofs_public_read on public.proof_images for select using (true);

drop policy if exists proofs_admin_write on public.proof_images;
create policy proofs_admin_write on public.proof_images for all to authenticated using (is_admin()) with check (is_admin());