import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

import { ProductCard, ProductCardSkeleton } from "./ProductCard";
import type { Category, Product } from "@/lib/data";

export function ProductCarousel({
  products,
  categories,
  loading,
}: {
  products: Product[];
  categories: Category[];
  loading?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: number) => {
    ref.current?.scrollBy({ left: dir * (ref.current.clientWidth * 0.8), behavior: "smooth" });
  };

  if (loading) {
    return (
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-[46%] shrink-0 sm:w-[32%] lg:w-[24%]">
            <ProductCardSkeleton />
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 py-14 text-center text-sm text-muted-foreground">
        এখনো কোনো সাজেস্টেড প্রোডাক্ট নেই
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={ref}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 sm:gap-4"
      >
        {products.map((p) => (
          <div key={p.id} className="w-[46%] shrink-0 snap-start sm:w-[32%] lg:w-[24%]">
            <ProductCard product={p} category={categories.find((c) => c.id === p.category_id)} />
          </div>
        ))}
      </div>

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
    </div>
  );
}
