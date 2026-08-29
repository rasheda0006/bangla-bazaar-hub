import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronLeft, ChevronRight, ShieldCheck, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { HeroSlide, Product } from "@/lib/data";

export function HeroSlider({
  slides,
  products = [],
  loading,
  heightMobile = 290,
  heightDesktop = 360,
  bgStyle = "gradient",
  bgFrom = "#4c1d95",
  bgTo = "#7c3aed",
  maxWidth = 980,
}: {
  slides: HeroSlide[];
  products?: Product[];
  loading?: boolean;
  heightMobile?: number;
  heightDesktop?: number;
  bgStyle?: string;
  bgFrom?: string;
  bgTo?: string;
  maxWidth?: number;
}) {
  const [index, setIndex] = useState(0);
  const total = slides.length;
  const highlights = products.slice(0, 2);
  const activeSlide = slides[index];

  const sectionStyle = {
    "--hero-h": `${heightMobile}px`,
    "--hero-h-lg": `${heightDesktop}px`,
    "--hero-w": `${maxWidth}px`,
    "--hero-from": bgFrom,
    "--hero-to": bgTo,
  } as React.CSSProperties;

  const next = useCallback(() => setIndex((i) => (total ? (i + 1) % total : 0)), [total]);
  const prev = useCallback(() => setIndex((i) => (total ? (i - 1 + total) % total : 0)), [total]);

  useEffect(() => {
    if (total < 2) return;
    const t = setInterval(next, 5000);
    return () => clearInterval(t);
  }, [next, total]);

  if (loading) {
    return (
      <section style={sectionStyle} className="bg-hero-surface py-4 sm:py-6">
        <div className="container-page">
          <div className="mx-auto grid min-h-[var(--hero-h)] w-full max-w-[var(--hero-w)] items-center gap-6 md:min-h-[var(--hero-h-lg)] md:grid-cols-2">
            <div className="space-y-3">
              <Skeleton className="h-8 w-4/5 bg-hero-border" />
              <Skeleton className="h-4 w-full bg-hero-border" />
              <Skeleton className="h-10 w-40 bg-hero-border" />
            </div>
            <Skeleton className="mx-auto aspect-square h-56 w-auto bg-hero-border md:h-72" />
          </div>
        </div>
      </section>
    );
  }
  if (!total || !activeSlide) return null;

  return (
    <section className="bg-hero-surface py-3 sm:py-5">
      <div className="container-page">
        <div
          style={sectionStyle}
          className={cn(
            "relative mx-auto min-h-[var(--hero-h)] w-full max-w-[var(--hero-w)] overflow-hidden rounded-xl border border-hero-border shadow-lift md:min-h-[var(--hero-h-lg)]",
            bgStyle === "solid" ? "hero-solid-bg" : "hero-premium-bg",
          )}
        >
          <div aria-hidden className="hero-dot-pattern pointer-events-none absolute inset-0 opacity-30" />
          <div className="relative grid min-h-[var(--hero-h)] items-center gap-5 px-8 py-8 md:min-h-[var(--hero-h-lg)] md:grid-cols-[1.05fr_0.95fr] md:gap-8 md:px-14 md:py-8 lg:px-20">
            <div key={`content-${activeSlide.id}`} className="hero-content-in order-2 text-center md:order-1 md:text-left">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-hero-border bg-hero-surface-raised/65 px-3 py-1.5 text-[11px] font-semibold text-hero-highlight">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-hero-highlight opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-hero-highlight" />
                </span>
                নতুন ডিজিটাল কালেকশন লাইভ
              </div>
              {activeSlide.heading ? (
                <h1 className="font-display text-3xl font-extrabold leading-[1.16] text-hero-foreground sm:text-4xl lg:text-5xl">
                  {activeSlide.heading}
                </h1>
              ) : null}
              {activeSlide.subheading ? (
                <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-hero-muted md:mx-0 md:text-[15px]">
                  {activeSlide.subheading}
                </p>
              ) : null}

              {highlights.length ? (
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {highlights.map((product) => (
                    <li key={product.id} className="min-w-0 border-l-2 border-hero-highlight pl-3 text-left">
                      <p className="truncate text-xs font-bold text-hero-foreground">{product.title}</p>
                      <p className="truncate text-[11px] text-hero-muted">
                        {product.short_description || "ইনস্ট্যান্ট ডিজিটাল অ্যাক্সেস"}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center justify-center gap-3 md:justify-start">
                <Button asChild size="lg" className="h-11 bg-hero-accent px-6 font-bold text-hero-accent-foreground shadow-lift hover:bg-hero-accent/90">
                  <Link to="/shop">
                    {activeSlide.cta_text || "এখনই সংগ্রহ করুন"}
                    <ArrowUpRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-11 border-hero-border bg-hero-surface-raised/55 px-6 text-hero-foreground hover:bg-hero-surface-raised hover:text-hero-foreground">
                  <Link to="/shop">সব প্রোডাক্ট</Link>
                </Button>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[11px] text-hero-muted md:justify-start">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-hero-highlight" />নিরাপদ পেমেন্ট</span>
                <span className="flex items-center gap-1">
                  {[0, 1, 2, 3, 4].map((n) => <Star key={n} className="h-3 w-3 fill-current text-hero-accent" />)}
                  <strong className="ml-1 text-hero-foreground">১০,০০০+</strong> গ্রাহক
                </span>
              </div>
            </div>

            <div key={`image-${activeSlide.id}`} className="hero-image-in order-1 flex justify-center md:order-2 md:justify-end">
              <div className="relative aspect-square w-[min(72vw,250px)] overflow-hidden rounded-lg border border-hero-border bg-hero-surface-raised shadow-lift md:w-[min(31vw,320px)]">
                <img src={activeSlide.image_url} alt={activeSlide.heading ?? "ডিজিটাল প্রোডাক্ট অফার"} className="h-full w-full object-cover" />
                <div className="absolute bottom-3 left-3 rounded-md bg-hero-surface/90 px-3 py-1.5 text-xs font-semibold text-hero-foreground backdrop-blur-sm">
                  ইনস্ট্যান্ট ডেলিভারি
                </div>
              </div>
            </div>
          </div>

          {total > 1 ? (
            <>
              <Button onClick={prev} aria-label="আগের স্লাইড" title="আগের স্লাইড" size="icon" className="absolute left-3 top-1/2 z-10 hidden -translate-y-1/2 border border-hero-border bg-hero-surface-raised/90 text-hero-foreground shadow-lift hover:bg-hero-highlight hover:text-hero-surface md:inline-flex">
                <ChevronLeft />
              </Button>
              <Button onClick={next} aria-label="পরের স্লাইড" title="পরের স্লাইড" size="icon" className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 border border-hero-border bg-hero-surface-raised/90 text-hero-foreground shadow-lift hover:bg-hero-highlight hover:text-hero-surface md:inline-flex">
                <ChevronRight />
              </Button>
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-full border border-hero-border bg-hero-surface/80 px-3 py-2 backdrop-blur-sm">
                <Button onClick={prev} aria-label="আগের স্লাইড" size="icon" variant="ghost" className="h-6 w-6 text-hero-foreground hover:bg-hero-surface-raised hover:text-hero-foreground md:hidden"><ChevronLeft /></Button>
                {slides.map((slide, slideIndex) => (
                  <Button key={slide.id} aria-label={`স্লাইড ${slideIndex + 1}`} onClick={() => setIndex(slideIndex)} size="icon" variant="ghost" className={cn("h-2 w-2 min-w-0 rounded-full p-0 hover:bg-hero-highlight", slideIndex === index ? "bg-hero-highlight" : "bg-hero-muted/45")} />
                ))}
                <Button onClick={next} aria-label="পরের স্লাইড" size="icon" variant="ghost" className="h-6 w-6 text-hero-foreground hover:bg-hero-surface-raised hover:text-hero-foreground md:hidden"><ChevronRight /></Button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
}
