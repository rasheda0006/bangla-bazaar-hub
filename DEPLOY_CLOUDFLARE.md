# Cloudflare-এ ডিপ্লয় গাইড (বাংলা)

এই প্রজেক্টটি **TanStack Start (SSR + server function)** দিয়ে তৈরি। এতে সার্ভার-সাইড কোড আছে (যেমন `src/lib/orders.functions.ts` — অর্ডার সেভ করার সার্ভার ফাংশন)।

## Pages না Worker?

**উত্তর: Cloudflare Workers** (Workers Builds দিয়ে)।

- Cloudflare **Pages** শুধু স্ট্যাটিক সাইটের জন্য ভালো — এই সাইটে SSR ও server function থাকায় Pages যথেষ্ট নয়।
- Cloudflare এখন নিজেরাই নতুন full-stack প্রজেক্টের জন্য **Workers** রেকমেন্ড করে। তাই ডিপ্লয় করবেন Workers-এ।

## ধাপ ১ — কোড GitHub-এ পুশ করুন

Lovable থেকে GitHub-এ কানেক্ট করে রিপো পুশ করুন।

## ধাপ ২ — Supabase প্রজেক্ট রেডি করুন

নতুন কাস্টমারের জন্য নতুন Supabase প্রজেক্ট বানিয়ে:

1. Storage → নতুন bucket `media` (Private, ফাইল সাইজ লিমিট 10MB)।
2. SQL Editor-এ `database/schema.sql` ফাইলটি হুবহু একবার রান করুন (সব টেবিল, RLS, ফাংশন, ট্রিগার, ডেমো ডাটা)।
3. Authentication → Email/Password চালু করুন। (চাইলে "Confirm email" বন্ধ রাখুন যাতে সাথে সাথে লগইন করা যায়।)
4. সাইটে `/admin` এ গিয়ে প্রথম অ্যাকাউন্ট তৈরি করুন — প্রথম ইউজার স্বয়ংক্রিয়ভাবে অ্যাডমিন হয়।

## ধাপ ৩ — Cloudflare Worker তৈরি

Cloudflare Dashboard → **Workers & Pages** → **Create** → **Import a repository** → আপনার GitHub রিপো সিলেক্ট করুন।

বিল্ড সেটিংস:

| ফিল্ড | মান |
| --- | --- |
| Build command | `bun run build` (বা `npm run build`) |
| Deploy command | `npx wrangler deploy` |
| Root directory | `/` |

## ধাপ ৪ — Environment Variables

Worker → **Settings → Variables and Secrets** এ নিচেরগুলো যোগ করুন। বিল্ড টাইমেও লাগে, তাই **Build variables** অংশেও একই মান দিন।

| নাম | ধরন | কোথায় পাবেন |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Text | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Text | API → publishable / anon key |
| `VITE_SUPABASE_PROJECT_ID` | Text | Project URL-এর সাবডোমেইন অংশ |
| `SUPABASE_URL` | Text | উপরের Project URL |
| `SUPABASE_PUBLISHABLE_KEY` | Text | publishable / anon key |
| `SUPABASE_PROJECT_ID` | Text | project ref |
| `SUPABASE_SERVICE_ROLE_KEY` | **Secret** | API → service_role key (কখনো ক্লায়েন্টে দেবেন না) |

মনে রাখবেন:

- `VITE_` দিয়ে শুরু হওয়া ভ্যারিয়েবল ব্রাউজারে যায় — এগুলোতে কখনো সিক্রেট রাখবেন না।
- `SUPABASE_SERVICE_ROLE_KEY` শুধু সার্ভার ফাংশনে ব্যবহৃত হয় (অর্ডার সেভ করা), তাই এটা **Secret** হিসেবে রাখুন।
- ভ্যারিয়েবল বদলালে নতুন করে **Redeploy** করতে হবে, নাহলে পুরোনো মান থেকে যাবে।

লোকালি চালাতে `.env` ফাইল:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
VITE_SUPABASE_PROJECT_ID=xxxx
SUPABASE_URL=https://xxxx.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxx
SUPABASE_PROJECT_ID=xxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

## ধাপ ৫ — Supabase-এ ডোমেইন অনুমোদন

Supabase → Authentication → URL Configuration:

- **Site URL**: আপনার Worker/কাস্টম ডোমেইন (যেমন `https://shop.example.com`)
- **Redirect URLs**: একই ডোমেইন + `/**`

## ধাপ ৬ — কাস্টম ডোমেইন

Worker → Settings → **Domains & Routes** → Add custom domain। ডোমেইনটি Cloudflare DNS-এ থাকলে SSL অটোমেটিক হয়ে যাবে।

## নতুন কাস্টমারের জন্য চেকলিস্ট

1. নতুন Supabase প্রজেক্ট + `media` bucket + `schema.sql` রান।
2. নতুন Cloudflare Worker + উপরের env ভ্যারিয়েবল।
3. `/admin` এ প্রথম অ্যাকাউন্ট = অ্যাডমিন।
4. Admin → সেটিংস থেকে নাম, লোগো, কালার, ফন্ট, হিরো উচ্চতা, পেমেন্ট নম্বর, SEO সব বদলে নিন।
5. Admin → পণ্য/ক্যাটাগরি/কনটেন্ট থেকে ডেমো ডাটা মুছে আসল ডিজিটাল প্রোডাক্ট (কোর্স, প্যাকেজ, টুলস, সাবস্ক্রিপশন) যোগ করুন।

## সমস্যা হলে

- **সাদা পেজ / "Failed to fetch"** → env ভ্যারিয়েবল ভুল বা redeploy করা হয়নি।
- **অর্ডার সেভ হচ্ছে না** → `SUPABASE_SERVICE_ROLE_KEY` সেট নেই।
- **অ্যাডমিনে ঢুকতে পারছি না** → `user_roles` টেবিলে ওই ইউজারের `admin` রোল আছে কিনা দেখুন।
- **ছবি আপলোড হচ্ছে না** → `media` bucket তৈরি হয়েছে কিনা এবং storage পলিসি (schema.sql-এ আছে) রান হয়েছে কিনা দেখুন।
