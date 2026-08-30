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
  -- ট্র্যাকিং (মেটা পিক্সেল + CAPI, GA4, GTM, Google Ads, TikTok, Clarity)
  tracking_enabled boolean not null default true,
  fb_capi_enabled boolean not null default false,
  fb_test_event_code text,
  ga4_id text,
  google_ads_id text,
  google_ads_conversion_label text,
  tiktok_pixel_id text,
  clarity_id text,
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
  hero_height_mobile integer not null default 290,
  hero_height_desktop integer not null default 360,
  hero_bg_style text not null default 'gradient',
  hero_bg_from text not null default '#4c1d95',
  hero_bg_to text not null default '#7c3aed',
  hero_max_width integer not null default 1180,
  hero_offer_image_url text not null default 'https://images.unsplash.com/photo-1607083206968-13611e3d76db?auto=format&fit=crop&w=800&q=80',
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

-- অর্ডার প্লেস করার নিরাপদ ফাংশন (দাম সবসময় ডাটাবেস থেকে নেওয়া হয়)
create or replace function public.place_order(
  p_customer_name text,
  p_email text,
  p_phone text,
  p_payment_method text,
  p_transaction_id text,
  p_sender_number text,
  p_items jsonb
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_items jsonb;
  v_total numeric;
  v_order_no bigint;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'কার্ট খালি';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', p.id, 'title', p.title,
           'price', coalesce(p.discount_price, p.price),
           'qty', it.qty)), '[]'::jsonb),
         coalesce(sum(coalesce(p.discount_price, p.price) * it.qty), 0)
    into v_items, v_total
  from jsonb_to_recordset(p_items) as it(id uuid, qty int)
  join public.products p on p.id = it.id;

  if v_items is null or jsonb_array_length(v_items) = 0 then
    raise exception 'প্রোডাক্ট পাওয়া যায়নি';
  end if;

  insert into public.orders (
    customer_name, email, phone, payment_method,
    transaction_id, sender_number, items, total
  ) values (
    p_customer_name, p_email, p_phone, p_payment_method,
    p_transaction_id, p_sender_number, v_items, v_total
  )
  returning order_no into v_order_no;

  return v_order_no;
end;
$$;

revoke all on function public.place_order(text,text,text,text,text,text,jsonb) from public;
grant execute on function public.place_order(text,text,text,text,text,text,jsonb) to anon, authenticated, service_role;



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
  ('রেকর্ডেড কোর্স', 'রেকর্ডেড-কোর্স', 'https://i.ibb.co.com/5Wfr6n3H/1.png', 1),
  ('সফটওয়্যার ও টুলস', 'সফটওয়্যার-ও-টুলস', 'https://i.ibb.co.com/ZzsFWX7f/2.png', 2),
  ('ভিডিও বান্ডেল', 'ভিডিও-বান্ডেল', 'https://i.ibb.co.com/6JtTdf4r/4.png', 3),
  ('ই-বুক', 'ই-বুক', 'https://i.ibb.co.com/BVVPX4RN/3.png', 4),
  ('ডিজিটাল টেমপ্লেট', 'ডিজিটাল-টেমপ্লেট', 'https://i.ibb.co.com/SXGzVQcc/6.png', 5),
  ('গ্রাফিক্স অ্যাসেট', 'গ্রাফিক্স-অ্যাসেট', 'https://i.ibb.co.com/N6hmqw0j/7.png', 6)
on conflict (slug) do nothing;

insert into public.products (title, slug, short_description, description, price, discount_price, images, category_id, is_best_selling, is_suggested, rating, review_count)
select p.title, p.slug, p.short_desc, p.descr, p.price::numeric, p.discount::numeric, p.imgs::text[], c.id, p.best::boolean, p.sugg::boolean, p.rating::numeric, p.rc::int
from (values
  ('কম্পিউটারের প্রয়োজনীয় সব সফটওয়্যার', 'কম্পিউটারের-প্রয়োজনীয়-সব-সফটওয়্যার', 'কম্পিউটারের প্রয়োজনীয় সকল প্রয়োজনীয় সফটওয়্যার (Adobe, MS Office, Windows, Video Editing) এবং ৫০GB+ বোনাস গ্রাফিক্স ফাইল একসাথে পান এক প্যাকেই! অর্ডারের সাথে সাথেই ইমেইলে ড্রাইভ লিঙ্ক পাবেন।', 'আপনার কম্পিউটারের জন্য প্রয়োজনীয় সব প্রিমিয়াম সফটওয়্যার এখন পাচ্ছেন একটি সুপার বান্ডেল প্যাকেজে! আলাদা আলাদা সফটওয়্যার খোঁজার ঝামেলা ছাড়া মাত্র এক ক্লিকেই পেয়ে যাবেন ১০০% ওয়ার্কিং ও প্রয়োজনীয় সব টুলস।

প্যাকেজে যা যা থাকছে:

Adobe Master Collection: Photoshop, Illustrator, Premiere Pro, After Effects, Lightroom, XD, InDesign, Audition সহ সম্পূর্ণ অ্যাডোবি স্যুট।

Microsoft Office Full Pack: Word, Excel, PowerPoint, Outlook, OneNote, Publisher & Access.

Windows OS Pack: Windows XP, 7, 10, 11 (All Pro Versions).

Essential Utility Tools: Internet Download Manager (IDM), CapCut, Avast/Antivirus, Vijay 52, File Archiver & Media Players.

বিশেষ বোনাস: ৭,০০০+ প্রিমিয়াম গ্রাফিক্স ফাইলসহ ৫০GB+ বিশাল ফাইল কালেকশন একদম ফ্রি!

কেন এই প্যাকেজটি নিবেন?

অর্ডার করার সাথে সাথে ইমেইলে ইনস্ট্যান্ট গুগল ড্রাইভ ডাউনলোড লিঙ্ক পাবেন।

আজীবন ব্যবহার ও ডাউনলোডের সুবিধা।

সহজ ইনস্টলেশন প্রসেস।

অফারটি সীমিত সময়ের জন্য, এখনই ''Order Now'' বাটনে ক্লিক করে সংগ্রহ করুন!', 199.0, null, array['https://i.ibb.co.com/fd70Qvxx/image1.png'], 'সফটওয়্যার-ও-টুলস', true, true, 5.0, 0),
  ('ফেসবুক মনিটাইজেশন কোর্স: এ-টু-জেড আর্নিং মাস্টারক্লাস', 'ফেসবুক-মনিটাইজেশন-কোর্স-এ-টু-জেড-আর্নিং-মাস্টারক্লাস', 'ফেসবুক থেকে ইনকাম শুরু করার সম্পূর্ণ গাইডলাইন! অর্গানিক ট্রিকস, পলিসি ইস্যু সমাধান, ভিডিও এডিটিং ও সিক্রেট মেথড শিখে এখনই নিজের আয়ের নতুন যাত্রা শুরু করুন।', 'আপনি কি ফেসবুক থেকে পেজ মনিটাইজ করে প্রতি মাসে ভালো অঙ্কের টাকা আয় করতে চান? আমাদের এই প্র্যাকটিক্যাল "ফেসবুক মনিটাইজেশন কোর্স" আপনাকে শূন্য থেকে ইনকাম শুরু করার প্রতিটি ধাপ সহজ ভাষায় শেখাবে।

কোর্সে যা যা শিখবেন:

অর্গানিক ট্রিকস: খুব দ্রুত মনিটাইজেশনের সব ক্রাইটেরিয়া ও ওয়াচটাইম পূর্ণ করার সহজ টেকনিক।

ভায়োলেশন ও পলিসি ইস্যু: ফেসবুক মনিটাইজেশন পলিসি ইস্যু এবং অন্যান্য ভায়োলেশন নিজে নিজেই ঠিক করার প্রফেশনাল ট্রিকস।

ইনস্ট্রিম অ্যাডস মনিটাইজেশন: ইনস্ট্রিম অ্যাডস সেটআপ এবং মনিটাইজেশন পাওয়ার সঠিক প্রসেস।

ভিডিও ও অডিও এডিটিং: মোবাইল/কম্পিউটার দিয়ে মনিটাইজেশন ফ্রেন্ডলি ভিডিও এবং অডিও এডিটিং শেখা।

কপি কনটেন্ট আর্নিং: কপিরাইট ছাড়া অন্যের কনটেন্ট ব্যবহার করে নিরাপদে ইনকাম করার উপায়।

ভাইরাল কনটেন্ট সিক্রেট মেথডস: কনটেন্ট দ্রুত ভাইরাল করার কার্যকর সিক্রেট স্ট্র্যাটেজি।

কেন এই কোর্সটি করবেন?

ঘরে বসে সুবিধাজনক সময়ে শেখার সুবিধা।

সম্পূর্ণ প্র্যাকটিক্যাল ও রেজাল্ট-ওরিয়েন্টেড গাইডলাইন।

স্পেশাল অফার প্রাইস: মাত্র ১৯৯ টাকা!

দেরি না করে আজই এনরোল করুন এবং আপনার অনলাইন আয়ের জার্নি শুরু করুন!', 199.0, null, array['https://i.ibb.co.com/XrwQkW2Y/image.png'], 'রেকর্ডেড-কোর্স', true, true, 5.0, 0),
  ('গ্রাফিক্স ফাইল, ওয়ার্ড ফাইল ও সফটওয়্যার মেগা বান্ডেল', 'গ-র-ফ-ক-স-ফ-ইল-ওয়-র-ড-ফ-ইল-ও-সফটওয-য-র-ম-গ-ব-ন-ড-ল', 'ডিজাইনার, কম্পিউটার অপারেটর ও ডিজিটাল উদ্যোক্তাদের জন্য প্রয়োজনীয় সব রেডিমেড ডিজাইন, প্রয়োজনীয় বাংলা ওয়ার্ড ফাইল এবং ফুল-ভার্সন সফটওয়্যার একসাথে পাবেন মাত্র ৯৯ টাকায়!', 'আপনার দৈনন্দিন ডিজাইন ও ডকুমেন্টের কাজকে আরও সহজ ও দ্রুত করতে নিয়ে এলাম এক বিশাল ডিজিটাল বান্ডেল। মাত্র একটি প্যাকেজেই পেয়ে যাচ্ছেন প্রিমিয়াম গ্রাফিক্স টেমপ্লেট, ওয়ার্ড ফাইল এবং জরুরি সফটওয়্যার কালেকশন।

প্যাকেজে যা যা থাকছে:

১. গ্রাফিক্স কালেকশন:

রাজনৈতিক ও ইভেন্ট ব্যানার: রাজনৈতিক ব্যানার, ওয়াজ/মাহফিল, ১৬ই ডিসেম্বর, ২১শে ফেব্রুয়ারি, ২৬শে মার্চ ও ঈদুল ফিতর/ঈদ মোবারক পোস্টার ডিজাইন।

ব্যবসায়িক ও শপ ডিজাইন: ভিজিটিং কার্ড, লোগো, ক্যাশ মেমো, হালখাতা, মেমো, মগ ডিজাইন এবং দোকানের প্রয়োজনীয় ফাইল।

অন্যান্য ডিজাইন: ক্যালেন্ডার, আলপনা, ফেসবুক পোস্টার, প্রফেশনাল সিভি, আইডি কার্ড, সার্টিফিকেট, জন্ম/মৃত্যু স্মরণিকা, বিবাহ ক্যালিগ্রাফি ও ফ্রি ফন্ট (বাংলা, ইংরেজি, আরবি)।

২. প্রয়োজনীয় সফটওয়্যারসমূহ:

অ্যাডোবি স্যুট: Adobe Photoshop, Illustrator, Premiere Pro, After Effects, InDesign, Acrobat Pro সহ Adobe-এর সব সফটওয়্যার।

এডিটিং ও ডিজাইন: CorelDRAW, Filmora 9, CapCut Desktop.

অফিস ও ডাটা: Microsoft Office (2010, 2019, 2021), Visio, Project, Bijoy 52, Bangla Fonts Collection এবং Data Recovery Software.

৩. রেডিমেড ওয়ার্ড ফাইল (২৫০+ ফাইল):

অফিসিয়াল ও ব্যক্তিগত সনদ: সিভি, অভিজ্ঞতা, ওয়ারিশ, চারিত্রিক, ফ্যামিলি, অনাপত্তি, পুনর্বিবাহ না হওয়ার সনদ, মৃত্যু ও একই ব্যক্তি সনদ।

চুক্তিপত্র ও আইনি দলিল: বায়নাপত্র, জমি ও ফ্ল্যাট বিক্রি, গাড়ি বিক্রি, অংশীদারি চুক্তিপত্র, আম-মোক্তারনামা, বন্ধক এবং বিভিন্ন হলফনামা।

অন্যান্য ফর্ম: রেজাইন লেটার, মানি রিসিট, ভর্তি ফর্ম, স্কুলের প্রশ্নপত্র ফরমেট, কারবিননামা, যোগদানপত্র ও দোকান/অফিস ভাড়া চুক্তি।

অফারটি সীমিত সময়ের জন্য! মাত্র ৯৯ টাকায় পুরো বান্ডেলটি নিতে এখনই অর্ডার বাটনে ক্লিক করুন।', 99.0, null, array['https://i.ibb.co.com/VpLVbBQv/image.png'], 'গ্রাফিক্স-অ্যাসেট', true, true, 5.0, 0),
  ('১৪০+ প্রিমিয়াম বাংলা ল্যান্ডিং পেজ বান্ডেল (ফ্রি প্লাগিন ও কোর্স সহ)', '১৪০-প্রিমিয়াম-বাংলা-ল্যান্ডিং-পেজ-বান্ডেল-ফ্রি-প্লাগিন-ও-কোর্স-সহ', 'ওয়েবসাইটে সেলস ও কনভার্সন বাড়াতে নিয়ে নিন ১৪০+ ইউনিক বাংলা ল্যান্ডিং পেজ টেমপ্লেট বান্ডেল! সাথে পাচ্ছেন প্রয়োজনীয় সব প্রিমিয়াম প্লাগিন, স্টেপ-বাই-স্টেপ ভিডিও টিউটোরিয়াল এবং ফুল ল্যান্ডিং পেজ ডিজাইন কোর্স।', 'আপনার ডিজিটাল প্রোডাক্ট বা ই-কমার্স বিজনেসের বিক্রি বহুগুণ বাড়িয়ে নিতে চান? প্রফেশনাল ল্যান্ডিং পেজ ছাড়া ক্রেতাদের আকর্ষণ করা কঠিন। তাই আপনার জন্য নিয়ে এলাম ১৪০টিরও বেশি রেডিমেড বাংলা ল্যান্ডিং পেজ টেমপ্লেটের বিশাল এক কালেকশন!

প্যাকেজে যা যা পাচ্ছেন:

১৪০+ ইউনিক বাংলা টেমপ্লেট: ই-কমার্স, কোয়ার্স, ডিজিটাল প্রোডাক্ট ও সার্ভিসের জন্য সম্পূর্ণ রেডিমেড ও হাই-কনভার্টিং ল্যান্ডিং পেজ ডিজাইন।

প্রো প্লাগিনস ফ্রি:

Elementor Pro

CartFlows Pro

PixelYourSite Pro

স্টেপ-বাই-স্টেপ গাইড: খুব সহজেই নিজে নিজেই সেটআপ করার জন্য বিস্তারিত টিউটোরিয়াল ও ভিডিও গাইড।

ল্যান্ডিং পেজ ডিজাইন কোর্স: একদম নতুনদের জন্য সম্পূর্ণ ল্যান্ডিং পেজ মেকিং অ্যান্ড ডিজাইন কোর্স।

লাইফটাইম সাপোর্ট: যেকোনো সমস্যায় সাহায্য করার জন্য ফ্রি টেকনিক্যাল সাপোর্ট।

কেন এই বান্ডেলটি ব্যবহার করবেন?

কোনো কোডিং বা কোড লেখার প্রয়োজন নেই (ডাইরেক্ট ইমপোর্ট করে ব্যবহারযোগ্য)।

খুব দ্রুত রেসপন্সিভ ও দৃষ্টিনন্দন ল্যান্ডিং পেজ তৈরি করে ফেলা যায়।

কোনো থার্ড-পার্টি ডিজাইনারের পেছনে অতিরিক্ত টাকা খরচ করা লাগবে না।

দেরি না করে আজই আপনার ওয়েবসাইটের জন্য এই মেগা ল্যান্ডিং পেজ বান্ডেলটি সংগ্রহ করুন!', 299.0, null, array['https://i.ibb.co.com/wZKz5MRz/image1.png'], 'ডিজিটাল-টেমপ্লেট', true, true, 5.0, 0),
  ('৪৪+ প্রিমিয়াম আপডেটেড লারাভেল সোর্স কোড মেগা বান্ডেল', '৪৪-প্রিমিয়াম-আপডেটেড-লারাভেল-সোর্স-কোড-মেগা-বান্ডেল', 'ওয়েব ডেভেলপার এবং এজেন্সিগুলোর জন্য বিশাল সুযোগ! একসাথে পাচ্ছেন ৪৪টিরও বেশি ক্যাটাগরির ১০০% ওয়ার্কিং ও আপডেটেড Laravel Source Code (Script)। খুব সহজেই কাস্টমাইজ করে ক্লায়েন্ট বা নিজের জন্য প্রফেশনাল ওয়েব অ্যাপ্লিকেশন তৈরি করুন।', 'আপনি কি কম সময়ে ও ঝামেলা ছাড়াই প্রফেশনাল ওয়েব অ্যাপ্লিকেশন তৈরি করতে চান? আমাদের এই মেগা বান্ডেলে পাচ্ছেন বিভিন্ন ক্যাটাগরির ৪৪+ প্রিমিয়াম লারাভেল (Laravel) সোর্স কোড ও স্ক্রিপ্ট। ডেভেলপার, ফ্রীল্যান্সার এবং আইটি উদ্যোক্তাদের কাজের সময় ও খরচ বহুগুণ বাঁচিয়ে দেওয়ার জন্য এটি একটি সেরা কালেকশন।

বান্ডেলে যেসব সোর্স কোড/স্ক্রিপ্ট থাকছে:

ই-কমার্স (১০টি): বিভিন্ন ক্যাটাগরির আধুনিক ও রেসপন্সিভ ই-কমার্স ওয়েবসাইট স্ক্রিপ্ট।

নিউজ পোর্টাল (৬টি): অনলাইন সংবাদপত্র ও নিউজ পোর্টালের জন্য বিশেষ স্ক্রিপ্ট।

এডুকেশন ও স্কুল ম্যানেজমেন্ট (৩টি): স্কুল, কলেজ ও কোচিং সেন্টার ম্যানেজমেন্ট সিস্টেম।

শপ ও বিজনেস সফটওয়্যার (২টি): দোকান ও ছোট ব্যবসার হিসাব-নিকাশের জন্য POS/মেসেজিং ভিত্তিক সফটওয়্যার।

কুরিয়ার ম্যানেজমেন্ট (২টি): পার্সেল ট্র্যাকিং ও ডেলিভারি ম্যানেজমেন্ট সিস্টেম।

এনজিও (৩টি) ও ডায়াগনস্টিক (১টি): চ্যারিটি/এনজিও ওয়েবসাইট ও ডায়াগনস্টিক সেন্টার ম্যানেজমেন্ট।

অন্যান্য প্রয়োজনীয় স্ক্রিপ্ট: আইটি এজেন্সি (১টি), পোর্টফোলিও (১টি), রেস্টুরেন্ট (১টি), ফার্মেসি (১টি), বাস টিকিট/ট্রাভেল সফটওয়্যার, সিআরএম (CRM), ট্রেইলারিং, ব্রডব্যান্ড নেটওয়ার্ক ম্যানেজমেন্টসহ আরও অসংখ্য প্রিমিয়াম স্ক্রিপ্ট!

কেন এই সোর্স কোড মেগা প্যাকটি নিবেন?

১০০% ক্লিন ও আপডেটেড কোড: সহজেই কাস্টমাইজেশন ও নতুন ফিচার যুক্ত করার সুবিধা।

বিপুল সময় সাশ্রয়: শূন্য থেকে কোডিং করার ঝামেলা ছাড়া দ্রুত প্রজেক্ট হ্যান্ডওভার করার সুযোগ।

ব্যবসার সুযোগ: স্ক্রিপ্টগুলো ব্যবহার করে ক্লায়েন্টদের দ্রুত সার্ভিস দিয়ে ভালো টাকা আয় করতে পারবেন।

সীমিত সময়ের বিশেষ অফারে মেগা বান্ডেলটি পেতে এখনই ''Order Now'' বাটনে ক্লিক করুন!', 199.0, null, array['https://i.ibb.co.com/pjysq46q/image.png'], 'ডিজিটাল-টেমপ্লেট', true, true, 5.0, 0),
  ('১ লাখ ৫০ হাজার+ কপিরাইট ফ্রি প্রিমিয়াম রিলস মেগা বান্ডেল', '১-লাখ-৫০-হাজার-কপিরাইট-ফ্রি-প্রিমিয়াম-রিলস-মেগা-বান্ডেল', 'ফেসবুক, ইনস্টাগ্রাম ও ইউটিউবে রিলস আপলোড করে ঘরে বসে ইনকাম করতে চান? নিয়ে নিন ১,৫০,০০০+ কপিরাইট ফ্রি প্রিমিয়াম রিলস বান্ডেল! সাথে পাচ্ছেন প্রিমিয়াম হ্যাশট্যাগ ও লাইফটাইম অ্যাক্সেস।', 'ভিডিও তৈরি করার ঝামেলার দিন শেষ! এখন থেকে ভিডিও দিবো আমরা, আর কনটেন্ট ভাইরাল করে পেজ মনিটাইজেশনের মাধ্যমে ইনকাম করবেন আপনি। ফেসবুক রিলস, ইনস্টাগ্রাম রিলস এবং ইউটিউব শর্টস বানিয়ে পেজ গ্রো ও মনিটাইজ করার জন্য এটি একটি কমপ্লিট সলিউশন।

প্যাকেজের মূল বৈশিষ্ট্যসমূহ:

১,৫০,০০০+ বিশাল কালেকশন: ১ লাখ ৫০ হাজারের বেশি উচ্চমানের এইচডি রিলস ভিডিও।

১০০% কপিরাইট ফ্রি: স্ট্রাইক বা ভায়োলেশনের কোনো ভয় ছাড়াই নিশ্চিন্তে ব্যবহার করতে পারবেন।

৩৮+ ট্রেন্ডিং ক্যাটাগরি: মোটিভেশনাল, গ্যাজেটস, ফানি, ইসলামিক, লাইফস্টাইল, টেকসহ ৩৮টিরও বেশি ক্যাটাগরির ভিডিও।

প্রিমিয়াম হ্যাশট্যাগ বান্ডেল: ভিডিও দ্রুত ভাইরাল করার জন্য ক্যাটাগরি অনুযায়ী প্রিমিয়াম হ্যাশট্যাগের কালেকশন।

লাইফটাইম অ্যাক্সেস ও রেগুলার আপডেট: একবার নিলে নতুন ভিডিওর রেগুলার আপডেটসহ আজীবন ব্যবহার করার সুযোগ।

কেন এই বান্ডেলটি নিবেন?

নিজে ভিডিও ফেস না দেখিয়ে বা ভয়েস-ওভার না দিয়েও কনটেন্ট তৈরি করা সম্ভব।

পেজের রিচ ও ফলোয়ার দ্রুত বাড়িয়ে ফেসবুক মনিটাইজেশন নিশ্চিত করার সহজ উপায়।

রিলস আপলোড করে ঘরে বসে পার্ট-টাইম বা ফুল-টাইম ইনকামের সুযোগ।

বিশেষ অফারে এখনই সংগ্রহ করতে Order Now বাটনে ক্লিক করুন!', 150.0, null, array['https://i.ibb.co.com/DH7qcZc4/image2.png'], 'ডিজিটাল-টেমপ্লেট', true, true, 5.0, 0),
  ('কমপ্লিট ভিসা প্রসেসিং মাস্টারকোর্স', 'কমপ্লিট-ভিসা-প্রসেসিং-মাস্টারকোর্স', 'ইন্ডিয়া, থাইল্যান্ড, ইউকে, ইউএসএ, কানাডাসহ বিশ্বের শীর্ষ দেশগুলোর ভিসা প্রসেসিং শিখুন প্রফেশনাল এক্সপার্টদের কাছ থেকে! নিজের ভিসা নিজে করার পাশাপাশি ট্রাভেল এজেন্সি বা ভিসা প্রসেসিং কনসালটেন্সি শুরু করার সম্পূর্ণ সুযোগ', 'ভিসা প্রসেসিং সংক্রান্ত সঠিক তথ্যের অভাবে এজেন্টদের পেছনে অতিরিক্ত টাকা ও সময় নষ্ট করার দিন শেষ! সেরা এক্সপার্টদের সহায়তায় তৈরি এই কমপ্লিট কোর্সের মাধ্যমে আপনি নিজেই বিভিন্ন দেশের ভিসা আবেদনের সঠিক নিয়ম শিখতে পারবেন। কোর্সে যেসব দেশের ভিসা প্রসেসিং শেখানো হবে: এশিয়ান ও মিডল ইস্ট দেশসমূহ: ইন্ডিয়া, থাইল্যান্ড, মালয়েশিয়া, সিঙ্গাপুর, সৌদি আরব, দুবাই ও জাপান। ইউরোপীয় ও শেনজেন কান্ট্রি: শেনজেন ভিসা, ইউকে (যুক্তরাজ্য), ইতালি ও সুইডেন। আমেরিকা ও অন্যান্য দেশ: ইউএসএ (যুক্তরাষ্ট্র), কানাডা ও অস্ট্রেলিয়া। কোর্সের মূল সুবিধা ও বৈশিষ্ট্য: নিজের ভিসা নিজে করুন: কোনো থার্ড-পার্টি এজেন্টের ওপর নির্ভর না করে ১০০% সঠিক নিয়মে ফরম পূরণ ও ফাইল সাবমিট করার টেকনিক। সেরা এক্সপার্টদের গাইডলাইন: দীর্ঘ অভিজ্ঞতাসম্পন্ন ভিসা কনসালটেন্টদের বাস্তব কাজের অভিজ্ঞতা থেকে শেখার সুবিধা। স্মার্ট ক্যারিয়ার ও বিজনেস: কোর্সটি সম্পন্ন করে ট্রাভেল এজেন্সি বা স্বাধীনভাবে ভিসা প্রসেসিং ফ্রিল্যান্সিং সার্ভিস শুরু করতে পারবেন। নিজের অথবা ক্লায়েন্টের ভিসা প্রসেসিং প্রফেশনালি করতে এখনই Order Now বাটনে ক্লিক করে এনরোল করুন!
', 199.0, null, array['https://i.ibb.co.com/kgWq1km3/image1.png'], 'রেকর্ডেড-কোর্স', true, true, 5.0, 0)
) as p(title, slug, short_desc, descr, price, discount, imgs, cat_slug, best, sugg, rating, rc)
join public.categories c on c.slug = p.cat_slug
on conflict (slug) do nothing;

insert into public.hero_slides (image_url, heading, subheading, cta_text, cta_link, sort_order) values
  ('https://i.ibb.co.com/DH7qcZc4/image2.png', '', '', 'এখনই কিনুন', '/shop', 0),
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
