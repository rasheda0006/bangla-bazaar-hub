import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight, ShieldCheck, Zap } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/lib/data";

export function HeroSlider({
  slides,
  loading,
  heightMobile = 200,
  heightDesktop = 300,
  bgStyle = "gradient",
  bgFrom = "#e9f7ef",
  bgTo = "#ffffff",
  maxWidth = 1200,
}: {
  slides: HeroSlide[];
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

  const sectionStyle = {
    "--hero-h": `${heightMobile}px`,
    "--hero-h-lg": `${heightDesktop}px`,
    "--hero-w": `${maxWidth}px`,
    background:
      bgStyle === "solid" ? bgFrom : `linear-gradient(135deg, ${bgFrom} 0%, ${bgTo} 100%)`,
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
      <section className="bg-secondary">
        <div className="container-page py-5">
          <div className="grid items-center gap-5 md:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-3">
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-36 rounded-full" />
            </div>
            <Skeleton className="aspect-[16/9] w-full rounded-2xl md:aspect-square" />
          </div>
        </div>
      </section>
    );
  }
  if (!total) return null;

  return (
    <section style={sectionStyle} className="border-b border-border/60">
      <div className="container-page py-5 sm:py-7">
        <div className="mx-auto w-full max-w-[var(--hero-w)]">
          <div className="relative">
            {slides.map((slide, i) => (
              <div
                key={slide.id}
                className={cn(
                  "grid items-center gap-4 transition-opacity duration-700 ease-out md:grid-cols-[1.15fr_0.85fr] md:gap-8",
                  i === index ? "opacity-100" : "pointer-events-none absolute inset-0 opacity-0",
                )}
              >
                <div className="order-2 md:order-1">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold text-primary">
                    <Zap className="h-3.5 w-3.5" />
                    ইনস্ট্যান্ট ডিজিটাল ডেলিভারি
                  </span>
                  {slide.heading ? (
                    <h1 className="mt-2.5 font-display text-xl font-extrabold leading-snug sm:text-2xl lg:text-[28px]">
                      {slide.heading}
                    </h1>
                  ) : null}
                  {slide.subheading ? (
                    <p className="mt-2 line-clamp-2 max-w-md text-[13px] leading-relaxed text-muted-foreground sm:text-sm">
                      {slide.subheading}
                    </p>
                  ) : null}
                  <div className="mt-3.5 flex flex-wrap items-center gap-3">
                    {slide.cta_text ? (
                      <Button asChild size="sm" className="rounded-full px-5">
                        <Link to="/shop">{slide.cta_text}</Link>
                      </Button>
                    ) : null}
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      নিরাপদ পেমেন্ট — বিকাশ, নগদ, রকেট
                    </span>
                  </div>
                </div>
                <div className="order-1 md:order-2">
                  <div className="mx-auto aspect-[16/9] h-[var(--hero-h)] w-auto max-w-full overflow-hidden rounded-2xl border border-border bg-muted shadow-soft md:ml-auto md:mr-0 md:aspect-square md:h-[var(--hero-h-lg)]">
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
            <div className="mt-4 flex items-center justify-center gap-3 md:justify-start">
              <button
                onClick={prev}
                aria-label="আগের স্লাইড"
                className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-foreground shadow-soft transition-all hover:bg-secondary"
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
                      i === index ? "w-6 bg-primary" : "w-2 bg-border",
                    )}
                  />
                ))}
              </div>
              <button
                onClick={next}
                aria-label="পরের স্লাইড"
                className="grid h-8 w-8 place-items-center rounded-full border border-border bg-card text-foreground shadow-soft transition-all hover:bg-secondary"
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
