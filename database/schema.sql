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
  site_name text not null default 'আমার দোকান',
  site_tagline text not null default 'বাংলাদেশের সেরা অনলাইন শপ',
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
  meta_title text default 'আমার দোকান — অনলাইন শপিং',
  meta_description text default 'সেরা দামে অরিজিনাল পণ্য, সারা বাংলাদেশে ডেলিভারি।',
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
  ('ইলেকট্রনিক্স', 'electronics', 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80', 1),
  ('ফ্যাশন', 'fashion', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80', 2),
  ('হোম ও কিচেন', 'home-kitchen', 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=600&q=80', 3),
  ('বিউটি', 'beauty', 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80', 4),
  ('বই', 'books', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600&q=80', 5),
  ('খেলাধুলা', 'sports', 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&q=80', 6)
on conflict (slug) do nothing;

insert into public.products (title, slug, short_description, description, price, discount_price, images, category_id, is_best_selling, is_suggested, rating, review_count)
select p.title, p.slug, p.short_desc, p.descr, p.price, p.discount, p.imgs, c.id, p.best, p.sugg, p.rating, p.rc
from (values
  ('ওয়্যারলেস ব্লুটুথ হেডফোন', 'wireless-bluetooth-headphone', 'নয়েজ ক্যান্সেলিং সহ প্রিমিয়াম সাউন্ড', 'দীর্ঘ ৩০ ঘণ্টা ব্যাটারি ব্যাকআপ, অ্যাক্টিভ নয়েজ ক্যান্সেলিং এবং আরামদায়ক ইয়ার কুশন সহ প্রিমিয়াম ওয়্যারলেস হেডফোন।', 3500, 2790, array['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'], 'electronics', true, true, 4.7, 128),
  ('স্মার্ট ওয়াচ প্রো', 'smart-watch-pro', 'হার্ট রেট ও স্টেপ ট্র্যাকিং', 'AMOLED ডিসপ্লে, হার্ট রেট মনিটর, SpO2, ৭ দিনের ব্যাটারি এবং IP68 ওয়াটার রেজিস্ট্যান্স।', 4500, 3299, array['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'], 'electronics', true, false, 4.5, 86),
  ('কটন পাঞ্জাবি', 'cotton-panjabi', 'আরামদায়ক দেশি কটন', 'খাঁটি কটন কাপড়ে তৈরি, ঈদ ও উৎসবের জন্য পারফেক্ট পাঞ্জাবি। সব সাইজ উপলব্ধ।', 1800, 1350, array['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80'], 'fashion', true, true, 4.8, 210),
  ('লেদার ব্যাকপ্যাক', 'leather-backpack', 'ল্যাপটপ কম্পার্টমেন্ট সহ', 'প্রিমিয়াম লেদার ফিনিশ, ১৫.৬ ইঞ্চি ল্যাপটপ কম্পার্টমেন্ট ও ওয়াটার রেজিস্ট্যান্ট।', 2900, null, array['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'], 'fashion', false, true, 4.4, 54),
  ('নন-স্টিক ফ্রাই প্যান', 'non-stick-fry-pan', 'তেল কম লাগে', 'উন্নত মানের নন-স্টিক কোটিং, গ্যাস ও ইন্ডাকশন উভয় চুলায় ব্যবহারযোগ্য।', 1200, 899, array['https://images.unsplash.com/photo-1584990347449-a2d4c2c9ec2c?w=800&q=80'], 'home-kitchen', false, false, 4.2, 33),
  ('ইলেকট্রিক কেটলি', 'electric-kettle', '১.৮ লিটার ফাস্ট বয়েল', 'স্টেইনলেস স্টিল বডি, অটো শাট-অফ ও ওভারহিট প্রোটেকশন সহ ইলেকট্রিক কেটলি।', 1500, 1150, array['https://images.unsplash.com/photo-1594213114663-d94db9b17125?w=800&q=80'], 'home-kitchen', true, true, 4.6, 71),
  ('ভিটামিন সি ফেস সিরাম', 'vitamin-c-serum', 'উজ্জ্বল ও দাগমুক্ত ত্বক', '২০% ভিটামিন সি, হায়ালুরনিক অ্যাসিড সমৃদ্ধ ফেস সিরাম — সব ধরনের ত্বকের জন্য।', 950, 720, array['https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80'], 'beauty', false, true, 4.3, 96),
  ('হিমু সমগ্র', 'himu-somogro', 'হুমায়ূন আহমেদ', 'হুমায়ূন আহমেদের জনপ্রিয় হিমু সিরিজের সম্পূর্ণ সংকলন, হার্ডকভার সংস্করণ।', 1100, 850, array['https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80'], 'books', true, true, 4.9, 341),
  ('যোগা ম্যাট প্রিমিয়াম', 'yoga-mat-premium', 'নন-স্লিপ ৬ মিমি', 'পুরু ৬ মিমি নন-স্লিপ যোগা ম্যাট, ক্যারি স্ট্র্যাপ সহ।', 1400, 1050, array['https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=800&q=80'], 'sports', false, false, 4.1, 27),
  ('পোর্টেবল পাওয়ার ব্যাংক ২০০০০mAh', 'power-bank-20000', 'ফাস্ট চার্জিং সাপোর্ট', '২০০০০mAh ক্যাপাসিটি, ডুয়াল USB আউটপুট ও Type-C ফাস্ট চার্জিং।', 2200, 1690, array['https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=800&q=80'], 'electronics', true, true, 4.5, 152),
  ('ডেনিম জ্যাকেট', 'denim-jacket', 'ক্লাসিক ব্লু ওয়াশ', 'ট্রেন্ডি ক্লাসিক ব্লু ডেনিম জ্যাকেট, সব সিজনের জন্য উপযোগী।', 2600, 1990, array['https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80'], 'fashion', false, true, 4.4, 63),
  ('সিরামিক কফি মগ সেট', 'ceramic-mug-set', '৪ পিসের সেট', 'হাতে আঁকা ডিজাইনের ৪ পিস সিরামিক কফি মগ সেট, মাইক্রোওয়েভ সেফ।', 900, 650, array['https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=800&q=80'], 'home-kitchen', false, false, 4.0, 19)
) as p(title, slug, short_desc, descr, price, discount, imgs, cat_slug, best, sugg, rating, rc)
join public.categories c on c.slug = p.cat_slug
on conflict (slug) do nothing;

insert into public.hero_slides (image_url, heading, subheading, cta_text, cta_link, sort_order) values
  ('https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1600&q=80', 'ঈদ মেগা সেল ২০২৬', 'সব পণ্যে ৫০% পর্যন্ত ছাড় — সীমিত সময়ের অফার', 'এখনই কিনুন', '/shop', 1),
  ('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80', 'নতুন কালেকশন এসেছে', 'ট্রেন্ডি ফ্যাশন ও ইলেকট্রনিক্স একসাথে', 'কালেকশন দেখুন', '/shop', 2),
  ('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1600&q=80', 'সারা দেশে ফ্রি ডেলিভারি', '১০০০ টাকার উপরে অর্ডারে ডেলিভারি চার্জ ফ্রি', 'অর্ডার করুন', '/shop', 3)
on conflict do nothing;

insert into public.testimonials (name, avatar_url, rating, comment, sort_order) values
  ('রাফিয়া ইসলাম', 'https://i.pravatar.cc/150?img=47', 5, 'খুব দ্রুত ডেলিভারি পেয়েছি, প্রোডাক্টের কোয়ালিটিও দারুণ। আবারও কিনব ইনশাআল্লাহ।', 1),
  ('তানভীর হাসান', 'https://i.pravatar.cc/150?img=12', 5, 'দাম অনুযায়ী প্রোডাক্ট অসাধারণ। কাস্টমার সাপোর্ট খুবই আন্তরিক ছিল।', 2),
  ('নুসরাত জাহান', 'https://i.pravatar.cc/150?img=32', 4, 'অর্ডার করার পরদিনই পেয়ে গেছি। প্যাকেজিং খুব সুন্দর ছিল।', 3)
on conflict do nothing;

insert into public.reviews (product_id, name, avatar_url, rating, comment)
select p.id, v.name, v.avatar, v.rating, v.comment
from public.products p
cross join (values
  ('সাকিব আহমেদ', 'https://i.pravatar.cc/150?img=5', 5, 'দারুণ প্রোডাক্ট, রিকমেন্ড করছি।'),
  ('মিতু আক্তার', 'https://i.pravatar.cc/150?img=25', 4, 'ভালো মানের, তবে ডেলিভারি একটু দেরি হয়েছে।')
) as v(name, avatar, rating, comment)
where p.slug in ('wireless-bluetooth-headphone', 'cotton-panjabi', 'himu-somogro');
