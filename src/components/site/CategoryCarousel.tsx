import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useRef } from "react";

import { cdnImage } from "@/lib/format";
import type { Category } from "@/lib/data";

export function CategoryCarousel({ categories }: { categories: Category[] }) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div
        ref={ref}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2"
      >
        {categories.map((c) => (
          <Link
            key={c.id}
            to="/shop"
            search={{ category: c.slug }}
            className="group w-[calc((100%-5rem)/6)] shrink-0 snap-start text-center"
          >
            <div className="aspect-square overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lift">
              <img
                src={cdnImage(
                  c.image_url ??
                    "https://placehold.co/300x300/e9f5ef/0f9d58?text=%E0%A6%9B%E0%A6%AC%E0%A6%BF",
                  320,
                )}
                alt={c.name}
                loading="lazy"
                decoding="async"
                width={320}
                height={320}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            </div>
            <p className="mt-2 truncate text-sm font-semibold">{c.name}</p>
          </Link>
        ))}
      </div>

      {categories.length > 6 ? (
        <>
          <button
            onClick={() => scrollBy(-1)}
            aria-label="আগে"
            className="absolute -left-3 top-[38%] hidden h-10 w-10 place-items-center rounded-full border border-border bg-background shadow-soft transition-colors hover:bg-secondary md:grid"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => scrollBy(1)}
            aria-label="পরে"
            className="absolute -right-3 top-[38%] hidden h-10 w-10 place-items-center rounded-full border border-border bg-background shadow-soft transition-colors hover:bg-secondary md:grid"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}
    </div>
  );
}
