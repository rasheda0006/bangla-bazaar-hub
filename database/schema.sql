-- ============================================================================
-- সম্পূর্ণ ডাটাবেস স্কিমা (এক ফাইলে রান করার মতো)
-- Bangla E-commerce Template — Supabase migration script
-- যেকোনো নতুন Supabase প্রজেক্টে SQL Editor এ এই ফাইলটি একবার রান করুন।
-- ============================================================================

-- ---------------------------------------------------------------- extensions
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------- helper: roles
do $$ begin
  create type public.app_role as enum ('admin', 'user');
exception when duplicate_object then null; end $$;

create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.app_role not null default 'user',
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role(auth.uid(), 'admin');
$$;

drop policy if exists "নিজের রোল দেখা যাবে" on public.user_roles;
create policy "নিজের রোল দেখা যাবে" on public.user_roles
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

-- প্রথম সাইন-আপ করা ইউজার স্বয়ংক্রিয়ভাবে অ্যাডমিন হবে
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.user_roles where role = 'admin') then
    insert into public.user_roles (user_id, role) values (new.id, 'admin')
    on conflict do nothing;
  else
    insert into public.user_roles (user_id, role) values (new.id, 'user')
    on conflict do nothing;
  end if;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ------------------------------------------------------- helper: updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end $$;

-- ================================================================= settings
create table if not exists public.site_settings (
  id int primary key default 1,
  site_name text not null default 'আমার ডিজিটাল স্টোর',
  site_tagline text not null default 'কোর্স, টুলস ও সাবস্ক্রিপশন — ইনস্ট্যান্ট ডিজিটাল ডেলিভারি',
  logo_url text,
  favicon_url text,
  phone text default '+8801700000000',
  email text default 'support@example.com',
  whatsapp text default '+8801700000000',
  address text default 'ঢাকা, বাংলাদেশ',
  facebook_url text,
  instagram_url text,
  youtube_url text,
  primary_color text not null default '#0f9d58',
  secondary_color text not null default '#f4b400',
  font_family text not null default 'Hind Siliguri',
  meta_title text default 'আমার ডিজিটাল স্টোর — অনলাইন কোর্স, টুলস ও সাবস্ক্রিপশন',
  meta_description text default 'অনলাইন কোর্স, প্রিমিয়াম টুলস, সাবস্ক্রিপশন ও ই-বুক — পেমেন্টের পর ইনস্ট্যান্ট ডিজিটাল ডেলিভারি।',
  fb_pixel_id text,
  ga_id text,
  gtm_id text,
  bkash_number text default '01700000000',
  nagad_number text default '01700000000',
  rocket_number text default '01700000000',
  bkash_enabled boolean not null default true,
  nagad_enabled boolean not null default true,
  rocket_enabled boolean not null default true,
  show_hero boolean not null default true,
  show_categories boolean not null default true,
  show_best_selling boolean not null default true,
  show_all_products boolean not null default true,
  show_suggested boolean not null default true,
  show_testimonials boolean not null default true,
  hero_height_mobile integer not null default 200,
  hero_height_desktop integer not null default 300,
  hero_bg_style text not null default 'gradient',
  hero_bg_from text not null default '#4c1d95',
  hero_bg_to text not null default '#7c3aed',
  hero_max_width integer not null default 1120,
  updated_at timestamptz not null default now(),
  constraint site_settings_singleton check (id = 1)
);

grant select on public.site_settings to anon, authenticated;
grant insert, update on public.site_settings to authenticated;
grant all on public.site_settings to service_role;
alter table public.site_settings enable row level security;

drop policy if exists "সেটিংস সবাই পড়তে পারবে" on public.site_settings;
create policy "সেটিংস সবাই পড়তে পারবে" on public.site_settings for select using (true);
drop policy if exists "অ্যাডমিন সেটিংস বদলাতে পারবে" on public.site_settings;
create policy "অ্যাডমিন সেটিংস বদলাতে পারবে" on public.site_settings
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop trigger if exists trg_site_settings_updated on public.site_settings;
create trigger trg_site_settings_updated before update on public.site_settings
  for each row execute function public.set_updated_at();

-- =============================================================== categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant select on public.categories to anon, authenticated;
grant insert, update, delete on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;

drop policy if exists "ক্যাটাগরি সবাই দেখতে পারবে" on public.categories;
create policy "ক্যাটাগরি সবাই দেখতে পারবে" on public.categories for select using (true);
drop policy if exists "অ্যাডমিন ক্যাটাগরি ম্যানেজ করবে" on public.categories;
create policy "অ্যাডমিন ক্যাটাগরি ম্যানেজ করবে" on public.categories
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop trigger if exists trg_categories_updated on public.categories;
create trigger trg_categories_updated before update on public.categories
  for each row execute function public.set_updated_at();

-- ================================================================= products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  short_description text,
  description text,
  price numeric(12,2) not null default 0,
  discount_price numeric(12,2),
  images text[] not null default '{}',
  category_id uuid references public.categories(id) on delete set null,
  is_best_selling boolean not null default false,
  is_suggested boolean not null default false,
  rating numeric(2,1) not null default 5.0,
  review_count int not null default 0,
  stock int not null default 100,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_category_idx on public.products(category_id);

grant select on public.products to anon, authenticated;
grant insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;
alter table public.products enable row level security;

drop policy if exists "প্রোডাক্ট সবাই দেখতে পারবে" on public.products;
create policy "প্রোডাক্ট সবাই দেখতে পারবে" on public.products for select using (true);
drop policy if exists "অ্যাডমিন প্রোডাক্ট ম্যানেজ করবে" on public.products;
create policy "অ্যাডমিন প্রোডাক্ট ম্যানেজ করবে" on public.products
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop trigger if exists trg_products_updated on public.products;
create trigger trg_products_updated before update on public.products
  for each row execute function public.set_updated_at();

-- ============================================================== hero_slides
create table if not exists public.hero_slides (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  heading text,
  subheading text,
  cta_text text default 'এখনই কিনুন',
  cta_link text default '/shop',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

grant select on public.hero_slides to anon, authenticated;
grant insert, update, delete on public.hero_slides to authenticated;
grant all on public.hero_slides to service_role;
alter table public.hero_slides enable row level security;

drop policy if exists "স্লাইড সবাই দেখতে পারবে" on public.hero_slides;
create policy "স্লাইড সবাই দেখতে পারবে" on public.hero_slides for select using (true);
drop policy if exists "অ্যাডমিন স্লাইড ম্যানেজ করবে" on public.hero_slides;
create policy "অ্যাডমিন স্লাইড ম্যানেজ করবে" on public.hero_slides
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ============================================================== testimonials
create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  avatar_url text,
  rating int not null default 5,
  comment text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

grant select on public.testimonials to anon, authenticated;
grant insert, update, delete on public.testimonials to authenticated;
grant all on public.testimonials to service_role;
alter table public.testimonials enable row level security;

drop policy if exists "টেস্টিমোনিয়াল সবাই দেখতে পারবে" on public.testimonials;
create policy "টেস্টিমোনিয়াল সবাই দেখতে পারবে" on public.testimonials for select using (true);
drop policy if exists "অ্যাডমিন টেস্টিমোনিয়াল ম্যানেজ করবে" on public.testimonials;
create policy "অ্যাডমিন টেস্টিমোনিয়াল ম্যানেজ করবে" on public.testimonials
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- =================================================================== reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  avatar_url text,
  rating int not null default 5,
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists reviews_product_idx on public.reviews(product_id);

grant select on public.reviews to anon, authenticated;
grant insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;

drop policy if exists "রিভিউ সবাই দেখতে পারবে" on public.reviews;
create policy "রিভিউ সবাই দেখতে পারবে" on public.reviews for select using (true);
drop policy if exists "অ্যাডমিন রিভিউ ম্যানেজ করবে" on public.reviews;
create policy "অ্যাডমিন রিভিউ ম্যানেজ করবে" on public.reviews
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ==================================================================== orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_no bigint generated by default as identity,
  customer_name text not null,
  email text not null,
  phone text not null,
  payment_method text not null,
  transaction_id text not null,
  sender_number text not null,
  items jsonb not null default '[]'::jsonb,
  total numeric(12,2) not null default 0,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

grant insert on public.orders to anon, authenticated;
grant select, update, delete on public.orders to authenticated;
grant all on public.orders to service_role;
alter table public.orders enable row level security;

drop policy if exists "যে কেউ অর্ডার দিতে পারবে" on public.orders;
create policy "যে কেউ অর্ডার দিতে পারবে" on public.orders for insert with check (true);
drop policy if exists "অ্যাডমিন অর্ডার দেখবে ও ম্যানেজ করবে" on public.orders;
create policy "অ্যাডমিন অর্ডার দেখবে ও ম্যানেজ করবে" on public.orders
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop trigger if exists trg_orders_updated on public.orders;
create trigger trg_orders_updated before update on public.orders
  for each row execute function public.set_updated_at();

-- ================================================================== storage
-- নোট: 'media' নামে একটি স্টোরেজ বাকেট তৈরি করুন (Storage UI বা API দিয়ে)।
-- এই টেমপ্লেটে বাকেটটি private, ছবি দেখানোর জন্য দীর্ঘমেয়াদি signed URL ব্যবহার হয়।

drop policy if exists "মিডিয়া পাবলিক রিড" on storage.objects;
create policy "মিডিয়া পাবলিক রিড" on storage.objects
  for select using (bucket_id = 'media');

drop policy if exists "অ্যাডমিন মিডিয়া আপলোড" on storage.objects;
create policy "অ্যাডমিন মিডিয়া আপলোড" on storage.objects
  for insert to authenticated with check (bucket_id = 'media' and public.is_admin());

drop policy if exists "অ্যাডমিন মিডিয়া আপডেট" on storage.objects;
create policy "অ্যাডমিন মিডিয়া আপডেট" on storage.objects
  for update to authenticated using (bucket_id = 'media' and public.is_admin());

drop policy if exists "অ্যাডমিন মিডিয়া ডিলিট" on storage.objects;
create policy "অ্যাডমিন মিডিয়া ডিলিট" on storage.objects
  for delete to authenticated using (bucket_id = 'media' and public.is_admin());

-- ============================================================== demo ডাটা
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

insert into public.categories (name, slug, image_url, sort_order) values
  ('অনলাইন কোর্স', 'courses', 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&q=80', 1),
  ('সফটওয়্যার ও টুলস', 'tools', 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80', 2),
  ('সাবস্ক্রিপশন', 'subscriptions', 'https://images.unsplash.com/photo-1611262588024-d12430b98920?w=600&q=80', 3),
  ('ই-বুক', 'ebooks', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80', 4),
  ('ডিজিটাল টেমপ্লেট', 'templates', 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=600&q=80', 5),
  ('গ্রাফিক্স অ্যাসেট', 'graphics', 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=600&q=80', 6)
on conflict (slug) do nothing;

insert into public.products (title, slug, short_description, description, price, discount_price, images, category_id, is_best_selling, is_suggested, rating, review_count)
select p.title, p.slug, p.short_desc, p.descr, p.price, p.discount, p.imgs, c.id, p.best, p.sugg, p.rating, p.rc
from (values
  ('ফুল স্ট্যাক ওয়েব ডেভেলপমেন্ট কোর্স', 'full-stack-course', 'বাংলায় ৮০+ ঘণ্টার ভিডিও কোর্স', 'HTML, CSS, JavaScript, React ও Node.js — শূন্য থেকে প্রফেশনাল লেভেল পর্যন্ত বাংলায় সম্পূর্ণ গাইডলাইন। লাইফটাইম অ্যাক্সেস ও সার্টিফিকেট।', 5500, 3499, array['https://images.unsplash.com/photo-1517180102446-f3ece451e9d8?w=800&q=80'], 'courses', true, true, 4.8, 214),
  ('ডিজিটাল মার্কেটিং মাস্টারক্লাস', 'digital-marketing-course', 'ফেসবুক ও গুগল অ্যাডস প্র্যাকটিক্যাল', 'ফেসবুক অ্যাডস, গুগল অ্যাডস, SEO ও কনটেন্ট মার্কেটিং — রিয়েল ক্যাম্পেইন কেস স্টাডিসহ সম্পূর্ণ কোর্স।', 4000, 2490, array['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80'], 'courses', true, false, 4.6, 132),
  ('গ্রাফিক ডিজাইন ফাউন্ডেশন কোর্স', 'graphic-design-course', 'ফটোশপ ও ইলাস্ট্রেটর বেসিক টু প্রো', 'ফটোশপ, ইলাস্ট্রেটর ও ফিগমা দিয়ে প্রফেশনাল ডিজাইন শেখার সম্পূর্ণ বাংলা কোর্স, প্রজেক্ট ফাইলসহ।', 3500, 1990, array['https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80'], 'courses', false, true, 4.5, 88),
  ('প্রিমিয়াম SEO টুল লাইসেন্স (১ বছর)', 'seo-tool-license', 'কীওয়ার্ড ও র‍্যাংক ট্র্যাকিং', 'আনলিমিটেড কীওয়ার্ড রিসার্চ, ব্যাকলিংক অডিট ও র‍্যাংক ট্র্যাকিং — ১ বছরের অফিসিয়াল লাইসেন্স কী।', 6000, 4500, array['https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=800&q=80'], 'tools', true, true, 4.4, 61),
  ('AI কনটেন্ট রাইটিং টুল (লাইফটাইম)', 'ai-writing-tool', 'বাংলা ও ইংরেজি কনটেন্ট জেনারেটর', 'ব্লগ, অ্যাড কপি ও প্রোডাক্ট ডেসক্রিপশন লেখার AI টুল — লাইফটাইম অ্যাক্সেস, ইনস্ট্যান্ট অ্যাক্টিভেশন।', 4500, 2990, array['https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80'], 'tools', true, true, 4.7, 143),
  ('ভিডিও এডিটিং প্রিসেট প্যাক', 'video-preset-pack', '২০০+ প্রিমিয়াম প্রিসেট', 'Premiere Pro ও CapCut এর জন্য ২০০+ ট্রানজিশন, LUT ও টাইটেল প্রিসেট — ইনস্ট্যান্ট ডাউনলোড।', 2000, 1290, array['https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=80'], 'tools', false, false, 4.2, 37),
  ('প্রিমিয়াম মিউজিক সাবস্ক্রিপশন (১২ মাস)', 'music-subscription-12m', 'অ্যাড-ফ্রি আনলিমিটেড', '১২ মাসের প্রিমিয়াম মিউজিক সাবস্ক্রিপশন — অ্যাড-ফ্রি, অফলাইন ডাউনলোড ও হাই কোয়ালিটি অডিও।', 3600, 2400, array['https://images.unsplash.com/photo-1611339555312-e607c8352fd7?w=800&q=80'], 'subscriptions', true, true, 4.5, 176),
  ('ক্লাউড স্টোরেজ প্ল্যান ২TB (১ বছর)', 'cloud-storage-2tb', 'সিকিউর অনলাইন ব্যাকআপ', '২TB ক্লাউড স্টোরেজ, অটো ব্যাকআপ ও ফাইল শেয়ারিং — ১ বছরের অ্যাক্টিভেশন কোড ইমেইলে পাঠানো হবে।', 5000, 3600, array['https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&q=80'], 'subscriptions', false, true, 4.3, 52),
  ('ফ্রিল্যান্সিং গাইড ই-বুক', 'freelancing-ebook', 'আপওয়ার্ক ও ফাইভার স্ট্র্যাটেজি', 'বাংলাদেশ থেকে ফ্রিল্যান্সিং শুরু করার সম্পূর্ণ রোডম্যাপ, প্রপোজাল টেমপ্লেট ও পেমেন্ট গাইডসহ PDF ই-বুক।', 800, 450, array['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&q=80'], 'ebooks', true, true, 4.9, 298),
  ('স্টক মার্কেট বেসিক ই-বুক', 'stock-market-ebook', 'বিগিনারদের জন্য বাংলা গাইড', 'শেয়ারবাজারের বেসিক, টেকনিক্যাল অ্যানালাইসিস ও রিস্ক ম্যানেজমেন্ট নিয়ে সহজ বাংলায় লেখা ই-বুক।', 700, 390, array['https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?w=800&q=80'], 'ebooks', false, false, 4.1, 44),
  ('বিজনেস ওয়েবসাইট টেমপ্লেট প্যাক', 'business-template-pack', '১০টি রেসপন্সিভ টেমপ্লেট', 'HTML ও ফিগমা ফরম্যাটে ১০টি রেসপন্সিভ বিজনেস ওয়েবসাইট টেমপ্লেট — সোর্স ফাইলসহ ইনস্ট্যান্ট ডাউনলোড।', 2500, 1690, array['https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&q=80'], 'templates', true, true, 4.6, 97),
  ('সোশ্যাল মিডিয়া গ্রাফিক্স বান্ডেল', 'social-graphics-bundle', '৫০০+ এডিটেবল ডিজাইন', 'ফেসবুক, ইনস্টাগ্রাম ও ইউটিউবের জন্য ৫০০+ এডিটেবল ক্যানভা ও PSD ডিজাইন টেমপ্লেট বান্ডেল।', 1800, 990, array['https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80'], 'graphics', false, true, 4.4, 73)
) as p(title, slug, short_desc, descr, price, discount, imgs, cat_slug, best, sugg, rating, rc)
join public.categories c on c.slug = p.cat_slug
on conflict (slug) do nothing;

insert into public.hero_slides (image_url, heading, subheading, cta_text, cta_link, sort_order) values
  ('https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=900&fit=crop&q=80', 'ডিজিটাল প্রোডাক্ট মেগা সেল', 'কোর্স, টুলস ও সাবস্ক্রিপশনে ৫০% পর্যন্ত ছাড়', 'এখনই কিনুন', '/shop', 1),
  ('https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&h=900&fit=crop&q=80', 'নতুন কোর্স ও টুলস এসেছে', 'বাংলায় প্রিমিয়াম কোর্স আর প্রফেশনাল সফটওয়্যার একসাথে', 'কালেকশন দেখুন', '/shop', 2),
  ('https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&h=900&fit=crop&q=80', 'ইনস্ট্যান্ট ডিজিটাল ডেলিভারি', 'পেমেন্ট ভেরিফাই হলেই ইমেইলে অ্যাক্সেস পেয়ে যাবেন', 'অর্ডার করুন', '/shop', 3)
on conflict do nothing;

insert into public.testimonials (name, avatar_url, rating, comment, sort_order) values
  ('রাফিয়া ইসলাম', 'https://i.pravatar.cc/150?img=47', 5, 'পেমেন্টের কিছুক্ষণের মধ্যেই কোর্সের অ্যাক্সেস ইমেইলে পেয়ে গেছি। কনটেন্ট অসাধারণ।', 1),
  ('তানভীর হাসান', 'https://i.pravatar.cc/150?img=12', 5, 'টুলের লাইসেন্স কী ঠিকঠাক কাজ করছে, দামও অনেক কম পেয়েছি।', 2),
  ('নুসরাত জাহান', 'https://i.pravatar.cc/150?img=32', 4, 'ই-বুকটা খুব কাজে দিয়েছে, ডাউনলোড লিংক সাথে সাথেই পেয়েছি।', 3)
on conflict do nothing;

insert into public.reviews (product_id, name, avatar_url, rating, comment)
select p.id, v.name, v.avatar, v.rating, v.comment
from public.products p
cross join (values
  ('সাকিব আহমেদ', 'https://i.pravatar.cc/150?img=5', 5, 'দারুণ ডিজিটাল প্রোডাক্ট, রিকমেন্ড করছি।'),
  ('মিতু আক্তার', 'https://i.pravatar.cc/150?img=25', 4, 'কনটেন্ট ভালো, অ্যাক্সেস পেতে অল্প সময় লেগেছে।')
) as v(name, avatar, rating, comment)
where p.slug in ('full-stack-course', 'ai-writing-tool', 'freelancing-ebook');

-- ============================================================================
-- ফাংশন পারমিশন হার্ডেনিং
-- ============================================================================
-- এই ফাংশনগুলো শুধু ট্রিগার/অভ্যন্তরীণ ব্যবহারের জন্য — API থেকে কল করা যাবে না
revoke all on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.set_updated_at() from public, anon, authenticated;
revoke all on function public.has_role(uuid, public.app_role) from public, anon, authenticated;

-- is_admin() প্রতিটি RLS পলিসিতে ব্যবহৃত হয়, তাই execute অনুমতি রাখতেই হবে।
-- এটি কোনো ডাটা রিটার্ন করে না, শুধু কলার নিজে অ্যাডমিন কিনা সেই boolean দেয়।
grant execute on function public.is_admin() to anon, authenticated;

-- ============================================================================
-- স্টোরেজ (media bucket)
-- ============================================================================
-- নতুন প্রজেক্টে Supabase ড্যাশবোর্ড থেকে "media" নামে একটি bucket তৈরি করুন
-- (private, file size limit 10MB), তারপর নিচের পলিসিগুলো এমনিতেই কাজ করবে।
