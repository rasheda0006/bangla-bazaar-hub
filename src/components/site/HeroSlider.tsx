import { Link } from "@tanstack/react-router";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { HeroSlide } from "@/lib/data";

export function HeroSlider({
  slides,
  loading,
  heightMobile = 240,
  heightDesktop = 380,
}: {
  slides: HeroSlide[];
  loading?: boolean;
  heightMobile?: number;
  heightDesktop?: number;
}) {
  const [index, setIndex] = useState(0);
  const total = slides.length;
  const heightStyle = {
    "--hero-h": `${heightMobile}px`,
    "--hero-h-lg": `${heightDesktop}px`,
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
        <div className="container-page py-6 sm:py-8">
          <div className="grid items-center gap-5 md:grid-cols-2">
            <div className="space-y-3">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-10 w-36 rounded-full" />
            </div>
            <Skeleton className="aspect-video w-full rounded-2xl md:aspect-square" />
          </div>
        </div>
      </section>
    );
  }
  if (!total) return null;

  return (
    <section style={heightStyle} className="bg-secondary">
      <div className="container-page relative py-6 sm:py-8">
        <div className="relative">
          {slides.map((slide, i) => (
            <div
              key={slide.id}
              className={cn(
                "grid items-center gap-6 transition-opacity duration-700 ease-out md:grid-cols-2 md:gap-10",
                i === index
                  ? "opacity-100"
                  : "pointer-events-none absolute inset-0 opacity-0",
              )}
            >
              <div className="order-2 md:order-1">
                {slide.heading ? (
                  <h1 className="font-display text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">
                    {slide.heading}
                  </h1>
                ) : null}
                {slide.subheading ? (
                  <p className="mt-4 max-w-md text-sm text-muted-foreground sm:text-base">
                    {slide.subheading}
                  </p>
                ) : null}
                {slide.cta_text ? (
                  <Button asChild size="lg" className="mt-6 rounded-full px-8">
                    <Link to={slide.cta_link === "/shop" ? "/shop" : "/shop"}>
                      {slide.cta_text}
                    </Link>
                  </Button>
                ) : null}
              </div>
              <div className="order-1 md:order-2">
                <div className="aspect-square w-full overflow-hidden rounded-3xl border border-border bg-muted shadow-lift">
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
          <div className="mt-6 flex items-center justify-center gap-4">
            <button
              onClick={prev}
              aria-label="আগের স্লাইড"
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-soft transition-all hover:bg-secondary"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-2">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  aria-label={`স্লাইড ${i + 1}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === index ? "w-7 bg-primary" : "w-2 bg-border",
                  )}
                />
              ))}
            </div>
            <button
              onClick={next}
              aria-label="পরের স্লাইড"
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-card text-foreground shadow-soft transition-all hover:bg-secondary"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
