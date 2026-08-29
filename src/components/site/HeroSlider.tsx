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
    return <Skeleton className="h-[320px] w-full rounded-none sm:h-[420px] lg:h-[520px]" />;
  }
  if (!total) return null;

  return (
    <section className="relative h-[320px] w-full overflow-hidden bg-muted sm:h-[420px] lg:h-[520px]">
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700 ease-out",
            i === index ? "opacity-100" : "pointer-events-none opacity-0",
          )}
        >
          <img
            src={slide.image_url}
            alt={slide.heading ?? "ব্যানার"}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
          <div className="container-page absolute inset-0 flex flex-col items-start justify-center gap-4">
            <div className="max-w-xl">
              {slide.heading ? (
                <h1 className="font-display text-3xl font-extrabold leading-tight text-background drop-shadow sm:text-5xl">
                  {slide.heading}
                </h1>
              ) : null}
              {slide.subheading ? (
                <p className="mt-3 max-w-md text-sm text-background/90 sm:text-base">
                  {slide.subheading}
                </p>
              ) : null}
              {slide.cta_text ? (
                <Button asChild size="lg" className="mt-6 rounded-full px-8">
                  <Link to={slide.cta_link === "/shop" ? "/shop" : "/shop"}>{slide.cta_text}</Link>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      ))}

      {total > 1 ? (
        <>
          <button
            onClick={prev}
            aria-label="আগের স্লাইড"
            className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground shadow-soft transition-all hover:bg-background"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            aria-label="পরের স্লাইড"
            className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-background/80 text-foreground shadow-soft transition-all hover:bg-background"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2">
            {slides.map((s, i) => (
              <button
                key={s.id}
                aria-label={`স্লাইড ${i + 1}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "h-2 rounded-full transition-all duration-300",
                  i === index ? "w-7 bg-primary" : "w-2 bg-background/70",
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}
