import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteLayout } from "@/components/site/SiteLayout";
import { HeroSlider } from "@/components/site/HeroSlider";
import { ProductGrid } from "@/components/site/ProductCard";
import { ProductCarousel } from "@/components/site/ProductCarousel";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Stars } from "@/components/site/Stars";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useCategories,
  useHeroSlides,
  useProducts,
  useSettings,
  useTestimonials,
} from "@/lib/data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "আমার ডিজিটাল স্টোর — কোর্স, টুলস ও সাবস্ক্রিপশন" },
      {
        name: "description",
        content:
          "অনলাইন কোর্স, প্রিমিয়াম সফটওয়্যার টুলস, সাবস্ক্রিপশন, ই-বুক ও টেমপ্লেট — পেমেন্টের পর ইনস্ট্যান্ট ডিজিটাল ডেলিভারি।",
      },
      { property: "og:title", content: "আমার ডিজিটাল স্টোর — কোর্স, টুলস ও সাবস্ক্রিপশন" },
      {
        property: "og:description",
        content: "ডিজিটাল প্রোডাক্ট কিনুন — পেমেন্টের পরই ইমেইলে ইনস্ট্যান্ট অ্যাক্সেস।",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: settings } = useSettings();
  const { data: slides = [], isLoading: slidesLoading } = useHeroSlides();
  const { data: categories = [], isLoading: catLoading } = useCategories();
  const { data: products = [], isLoading: prodLoading } = useProducts();
  const { data: testimonials = [], isLoading: testiLoading } = useTestimonials();

  const activeSlides = slides.filter((s) => s.is_active);
  const bestSelling = products.filter((p) => p.is_best_selling);
  const suggested = products.filter((p) => p.is_suggested);

  return (
    <SiteLayout>
      {settings?.show_hero !== false ? (
        <HeroSlider
          slides={activeSlides}
          products={(bestSelling.length ? bestSelling : products).slice(0, 4)}
          loading={slidesLoading}
          heightMobile={settings?.hero_height_mobile ?? 290}
          heightDesktop={settings?.hero_height_desktop ?? 360}
          bgStyle={settings?.hero_bg_style ?? "gradient"}
          bgFrom={settings?.hero_bg_from ?? "#4c1d95"}
          bgTo={settings?.hero_bg_to ?? "#7c3aed"}
          maxWidth={settings?.hero_max_width ?? 1180}
          offerImageUrl={settings?.hero_offer_image_url ?? null}
        />
      ) : null}

      {settings?.show_categories !== false ? (
        <section className="container-page py-10 sm:py-14">
          <SectionHeading title="ক্যাটাগরি" subtitle="আপনার পছন্দের ক্যাটাগরি বেছে নিন" />
          {catLoading ? (
            <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="w-28 shrink-0 space-y-2 md:w-auto">
                  <Skeleton className="aspect-square rounded-2xl" />
                  <Skeleton className="mx-auto h-4 w-3/4" />
                </div>
              ))}
            </div>
          ) : categories.length ? (
            <>
            <div className="grid grid-cols-4 gap-3 md:grid-cols-6 md:gap-4">
              {categories.map((c, i) => (
                <Link
                  key={c.id}
                  to="/shop"
                  search={{ category: c.slug }}
                  className={`group text-center ${i > 3 ? "hidden md:block" : ""}`}
                >
                  <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lift">
                    <img
                      src={
                        c.image_url ??
                        "https://placehold.co/300x300/e9f5ef/0f9d58?text=%E0%A6%9B%E0%A6%AC%E0%A6%BF"
                      }
                      alt={c.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <p className="mt-2 truncate text-sm font-semibold">{c.name}</p>
                </Link>
              ))}
            </div>
            <div className="mt-5 flex justify-center md:hidden">
              <Button asChild variant="outline" className="rounded-full px-8">
                <Link to="/categories">সব ক্যাটাগরি</Link>
              </Button>
            </div>
            </>
          ) : (
            <p className="text-center text-sm text-muted-foreground">কোনো ক্যাটাগরি নেই</p>
          )}
        </section>
      ) : null}

      {settings?.show_best_selling !== false ? (
        <section className="container-page py-6 sm:py-10">
          <SectionHeading
            title="বেস্ট সেলিং ডিজিটাল প্রোডাক্ট"
            subtitle="সবচেয়ে বেশি বিক্রি হওয়া কোর্স, টুলস ও সাবস্ক্রিপশন"
            action={
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link to="/shop">সব দেখুন</Link>
              </Button>
            }
          />
          <ProductGrid
            products={bestSelling.slice(0, 8)}
            categories={categories}
            loading={prodLoading}
            emptyText="এখনো কোনো বেস্ট সেলিং ডিজিটাল প্রোডাক্ট নেই"
          />
        </section>
      ) : null}

      {settings?.show_suggested !== false ? (
        <section className="container-page py-6 sm:py-10">
          <SectionHeading
            title="আপনার জন্য সাজেস্টেড"
            subtitle="আপনার পছন্দ হতে পারে এমন ডিজিটাল প্রোডাক্ট"
          />
          <ProductCarousel products={suggested} categories={categories} loading={prodLoading} />
        </section>
      ) : null}

      {settings?.show_all_products !== false ? (
        <section className="container-page py-6 sm:py-10">
          <SectionHeading
            title="সব ডিজিটাল প্রোডাক্ট"
            subtitle="কোর্স, টুলস, সাবস্ক্রিপশন, ই-বুক ও টেমপ্লেট"
            action={
              <Button asChild variant="outline" size="sm" className="rounded-full">
                <Link to="/shop">শপ পেজে যান</Link>
              </Button>
            }
          />
          <ProductGrid
            products={products.slice(0, 12)}
            categories={categories}
            loading={prodLoading}
          />
        </section>
      ) : null}

      {settings?.show_testimonials !== false ? (
        <section className="bg-secondary/40 py-12 sm:py-16">
          <div className="container-page">
            <SectionHeading title="কাস্টমার রিভিউ" subtitle="আমাদের ক্রেতারা যা বলছেন" />
            {testiLoading ? (
              <div className="grid gap-4 md:grid-cols-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-44 rounded-2xl" />
                ))}
              </div>
            ) : testimonials.length ? (
              <div className="grid gap-4 md:grid-cols-3">
                {testimonials.map((t) => (
                  <figure
                    key={t.id}
                    className="rounded-2xl border border-border bg-card p-6 shadow-soft transition-shadow hover:shadow-lift"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <img
                        src={t.avatar_url ?? "https://i.pravatar.cc/150"}
                        alt={t.name}
                        loading="lazy"
                        className="h-12 w-12 shrink-0 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <figcaption className="truncate font-semibold">{t.name}</figcaption>
                        <Stars rating={t.rating} />
                      </div>
                    </div>
                    <blockquote className="mt-4 text-sm leading-relaxed text-muted-foreground">
                      “{t.comment}”
                    </blockquote>
                  </figure>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground">এখনো কোনো রিভিউ নেই</p>
            )}
          </div>
        </section>
      ) : null}
    </SiteLayout>
  );
}
