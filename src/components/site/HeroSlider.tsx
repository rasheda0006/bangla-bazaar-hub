import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { HeroSlide, Product } from "@/lib/data";

export function HeroSlider({
  slides,
  products = [],
  loading,
  heightMobile = 200,
  heightDesktop = 300,
  bgStyle = "gradient",
  bgFrom = "#4c1d95",
  bgTo = "#7c3aed",
  maxWidth = 1120,
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
  const highlights = products.slice(0, 3);

  const sectionStyle = {
    "--hero-h": `${heightMobile}px`,
    "--hero-h-lg": `${heightDesktop}px`,
    "--hero-w": `${maxWidth}px`,
    background:
      bgStyle === "solid" ? bgFrom : `linear-gradient(115deg, ${bgFrom} 0%, ${bgTo} 100%)`,
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
      <section style={sectionStyle}>
        <div className="container-page py-8">
          <div className="mx-auto grid w-full max-w-[var(--hero-w)] items-center gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Skeleton className="h-8 w-4/5 bg-white/20" />
              <Skeleton className="h-4 w-full bg-white/20" />
              <Skeleton className="h-10 w-40 rounded-full bg-white/20" />
            </div>
            <Skeleton className="aspect-video w-full rounded-2xl bg-white/20" />
          </div>
        </div>
      </section>
    );
  }
  if (!total) return null;

  return (
    <section style={sectionStyle} className="relative overflow-hidden text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-white/10 blur-3xl"
      />
      <div className="container-page relative py-7 sm:py-9">
        <div className="mx-auto w-full max-w-[var(--hero-w)]">
          <div className="relative">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className={cn(
                  "grid items-center gap-6 transition-opacity duration-700 ease-out md:grid-cols-2 md:gap-8",
                  i === index ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
                )}
              >
                <div className="order-2 w-full md:order-1">
                  {slide.heading ? (
                    <h1 className="font-display text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-[34px]">
                      {slide.heading}
                    </h1>
                  ) : null}
                  {slide.subheading ? (
                    <p className="mt-2.5 max-w-lg text-[13px] leading-relaxed text-white/75 sm:text-sm">
                      {slide.subheading}
                    </p>
                  ) : null}

                  {highlights.length ? (
                    <ul className="mt-3 flex flex-wrap gap-2">
                      {highlights.map((p) => (
                        <li
                          key={p.id}
                          className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[11px] text-white/90"
                        >
                          <span className="font-semibold">{p.title}</span>
                          {p.short_description ? (
                            <span className="text-white/60">
                              {" — "}
                              {p.short_description.slice(0, 34)}
                            </span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Button
                      asChild
                      size="sm"
                      className="rounded-full border border-white/40 bg-white/10 px-6 text-white hover:bg-white/20"
                    >
                      <Link to="/shop">{slide.cta_text || "শুরু করুন এখন"}</Link>
                    </Button>
                    <Button
                      asChild
                      size="sm"
                      variant="outline"
                      className="rounded-full border-white/40 bg-transparent px-6 text-white hover:bg-white/15 hover:text-white"
                    >
                      <Link to="/shop">সব প্রোডাক্ট দেখুন</Link>
                    </Button>
                  </div>

                  <div className="mt-4 flex items-center gap-2.5">
                    <div className="flex -space-x-2">
                      {[0, 1, 2].map((n) => (
                        <span
                          key={n}
                          className="h-7 w-7 rounded-full border-2 border-white/70 bg-white/25"
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-[11px] text-white/80">
                        ১০,০০০+ সন্তুষ্ট গ্রাহকের আস্থা
                      </p>
                      <div className="flex gap-0.5">
                        {[0, 1, 2, 3, 4].map((n) => (
                          <Star key={n} className="h-3 w-3 fill-current text-yellow-300" />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="order-1 w-full md:order-2">
                  <div className="aspect-video h-[var(--hero-h)] w-full max-w-full overflow-hidden rounded-2xl border border-white/20 bg-white/10 shadow-lift md:ml-auto md:h-[var(--hero-h-lg)] md:w-auto">
                    <img
                      src={slide.image_url}
                      alt={slide.heading ?? "ব্যানার"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {total > 1 ? (
            <div className="mt-5 flex items-center justify-center gap-3 md:justify-end">
              <button
                onClick={prev}
                aria-label="আগের স্লাইড"
                className="grid h-8 w-8 place-items-center rounded-full border border-white/30 bg-white/10 text-white transition-all hover:bg-white/20"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-2">
                {slides.map((s, i) => (
                  <button
                    key={s.id}
                    aria-label={`স্লাইড ${i + 1}`}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      i === index ? "w-6 bg-white" : "w-2 bg-white/40",
                    )}
                  />
                ))}
              </div>
              <button
                onClick={next}
                aria-label="পরের স্লাইড"
                className="grid h-8 w-8 place-items-center rounded-full border border-white/30 bg-white/10 text-white transition-all hover:bg-white/20"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
