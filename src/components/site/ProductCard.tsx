import { Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Zap } from "lucide-react";
import { toast } from "sonner";

import { Stars } from "./Stars";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/lib/cart";
import { discountPercent, taka, toBn } from "@/lib/format";
import type { Category, Product } from "@/lib/data";

const FALLBACK = "https://placehold.co/600x600/e9f5ef/0f9d58?text=%E0%A6%9B%E0%A6%AC%E0%A6%BF";

export function ProductCard({
  product,
  category,
}: {
  product: Product;
  category?: Category | undefined;
}) {
  const { add } = useCart();
  const navigate = useNavigate();
  const price = product.discount_price ?? product.price;
  const off = discountPercent(product.price, product.discount_price);
  const image = product.images?.[0] || FALLBACK;

  const payload = {
    id: product.id,
    title: product.title,
    price,
    image,
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <Link
        to="/product/$productId"
        params={{ productId: product.id }}
        className="relative block aspect-square overflow-hidden bg-muted"
      >
        <img
          src={image}
          alt={product.title}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {category ? (
          <span className="absolute left-2 top-2 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-semibold text-foreground shadow-soft backdrop-blur">
            {category.name}
          </span>
        ) : null}
        {off ? (
          <span className="absolute right-2 top-2 rounded-full bg-destructive px-2 py-1 text-[11px] font-bold text-destructive-foreground">
            -{toBn(off)}%
          </span>
        ) : null}
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <Link
          to="/product/$productId"
          params={{ productId: product.id }}
          className="line-clamp-2-safe min-h-[2.6rem] text-sm font-semibold leading-snug transition-colors hover:text-primary"
        >
          {product.title}
        </Link>

        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-display text-lg font-bold text-primary">{taka(price)}</span>
          {product.discount_price ? (
            <span className="text-xs text-muted-foreground line-through">
              {taka(product.price)}
            </span>
          ) : null}
        </div>

        <Stars rating={Number(product.rating)} count={product.review_count} />

        <div className="mt-auto grid grid-cols-2 gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1 text-xs"
            onClick={() => {
              add(payload);
              toast.success("কার্টে যোগ হয়েছে");
            }}
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            কার্টে
          </Button>
          <Button
            size="sm"
            className="gap-1 text-xs"
            onClick={() => {
              add(payload);
              void navigate({ to: "/checkout" });
            }}
          >
            <Zap className="h-3.5 w-3.5" />
            অর্ডার করুন
          </Button>
        </div>
      </div>
    </article>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2 p-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-5 w-1/2" />
        <div className="grid grid-cols-2 gap-2 pt-2">
          <Skeleton className="h-8" />
          <Skeleton className="h-8" />
        </div>
      </div>
    </div>
  );
}

export function ProductGrid({
  products,
  categories,
  loading,
  skeletonCount = 8,
  emptyText = "কোনো ডিজিটাল প্রোডাক্ট পাওয়া যায়নি",
}: {
  products: Product[];
  categories: Category[];
  loading?: boolean;
  skeletonCount?: number;
  emptyText?: string;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: skeletonCount }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-muted/40 py-16 text-center">
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          category={categories.find((c) => c.id === p.category_id)}
        />
      ))}
    </div>
  );
}
