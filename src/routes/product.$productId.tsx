import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ShoppingCart, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductGrid } from "@/components/site/ProductCard";
import { SectionHeading } from "@/components/site/SectionHeading";
import { Stars } from "@/components/site/Stars";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useCart } from "@/lib/cart";
import { useCategories, useProduct, useProductReviews, useProducts } from "@/lib/data";
import { discountPercent, bnDate, taka, toBn } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/product/$productId")({
  head: () => ({
    meta: [
      { title: "পণ্যের বিস্তারিত | আমার দোকান" },
      {
        name: "description",
        content: "পণ্যের ছবি, দাম, বিবরণ ও কাস্টমার রিভিউ দেখে নিশ্চিন্তে অর্ডার করুন।",
      },
      { property: "og:title", content: "পণ্যের বিস্তারিত | আমার দোকান" },
      { property: "og:description", content: "পণ্যের ছবি, দাম, বিবরণ ও রিভিউ দেখুন।" },
    ],
  }),
  component: ProductPage,
});

const FALLBACK = "https://placehold.co/800x800/e9f5ef/0f9d58?text=%E0%A6%9B%E0%A6%AC%E0%A6%BF";

function ProductPage() {
  const { productId } = Route.useParams();
  const { data: product, isLoading } = useProduct(productId);
  const { data: categories = [] } = useCategories();
  const { data: allProducts = [] } = useProducts();
  const { data: reviews = [] } = useProductReviews(product?.id);
  const { add } = useCart();
  const navigate = useNavigate();
  const [active, setActive] = useState(0);

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container-page grid gap-8 py-10 lg:grid-cols-2">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-10 w-1/2" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </SiteLayout>
    );
  }

  if (!product) {
    return (
      <SiteLayout>
        <div className="container-page py-24 text-center">
          <h1 className="font-display text-2xl font-bold">পণ্যটি খুঁজে পাওয়া যায়নি</h1>
          <Button asChild className="mt-6 rounded-full px-8">
            <Link to="/shop">শপে ফিরে যান</Link>
          </Button>
        </div>
      </SiteLayout>
    );
  }

  const images = product.images?.length ? product.images : [FALLBACK];
  const price = Number(product.discount_price ?? product.price);
  const off = discountPercent(Number(product.price), product.discount_price);
  const category = categories.find((c) => c.id === product.category_id);
  const related = allProducts.filter(
    (p) => p.category_id === product.category_id && p.id !== product.id,
  );

  const payload = {
    id: product.id,
    title: product.title,
    price,
    image: images[0] ?? FALLBACK,
  };

  const breakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <SiteLayout>
      <div className="container-page py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <div className="overflow-hidden rounded-2xl border border-border bg-muted shadow-soft">
              <img
                src={images[active] ?? FALLBACK}
                alt={product.title}
                className="aspect-square w-full object-cover"
              />
            </div>
            {images.length > 1 ? (
              <div className="no-scrollbar mt-3 flex gap-3 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button
                    key={img + i}
                    onClick={() => setActive(i)}
                    className={cn(
                      "h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all",
                      i === active ? "border-primary" : "border-border opacity-70",
                    )}
                  >
                    <img src={img} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            ) : null}
          </div>

          <div className="space-y-5">
            {category ? (
              <Link
                to="/shop"
                search={{ category: category.slug }}
                className="inline-block rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground"
              >
                {category.name}
              </Link>
            ) : null}

            <h1 className="font-display text-2xl font-bold leading-tight sm:text-3xl">
              {product.title}
            </h1>

            <Stars rating={Number(product.rating)} count={product.review_count} size={18} />

            <div className="flex flex-wrap items-baseline gap-3">
              <span className="font-display text-3xl font-extrabold text-primary">
                {taka(price)}
              </span>
              {product.discount_price ? (
                <>
                  <span className="text-lg text-muted-foreground line-through">
                    {taka(product.price)}
                  </span>
                  {off ? (
                    <span className="rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground">
                      {toBn(off)}% ছাড়
                    </span>
                  ) : null}
                </>
              ) : null}
            </div>

            {product.short_description ? (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.short_description}
              </p>
            ) : null}

            <p className="text-sm">
              স্টক:{" "}
              <span className={product.stock > 0 ? "font-semibold text-success" : "text-destructive"}>
                {product.stock > 0 ? `${toBn(product.stock)} টি আছে` : "স্টক শেষ"}
              </span>
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                variant="outline"
                size="lg"
                className="gap-2 rounded-full"
                onClick={() => {
                  add(payload);
                  toast.success("কার্টে যোগ হয়েছে");
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                কার্টে যোগ করুন
              </Button>
              <Button
                size="lg"
                className="gap-2 rounded-full"
                onClick={() => {
                  add(payload);
                  void navigate({ to: "/checkout" });
                }}
              >
                <Zap className="h-4 w-4" />
                এখনই কিনুন
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="description" className="mt-12">
          <TabsList className="rounded-full">
            <TabsTrigger value="description" className="rounded-full">
              বিবরণ
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-full">
              রিভিউ ({toBn(reviews.length)})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="description">
            <div className="rounded-2xl border border-border bg-card p-6 text-sm leading-relaxed text-muted-foreground shadow-soft">
              {product.description || "এই পণ্যের বিস্তারিত বিবরণ শীঘ্রই যোগ করা হবে।"}
            </div>
          </TabsContent>

          <TabsContent value="reviews">
            <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                <p className="font-display text-4xl font-extrabold text-primary">
                  {toBn(Number(product.rating).toFixed(1))}
                </p>
                <Stars rating={Number(product.rating)} count={product.review_count} />
                <div className="mt-4 space-y-2">
                  {breakdown.map((b) => (
                    <div key={b.star} className="flex items-center gap-2">
                      <span className="w-8 text-xs text-muted-foreground">{toBn(b.star)}★</span>
                      <Progress
                        value={reviews.length ? (b.count / reviews.length) * 100 : 0}
                        className="h-2"
                      />
                      <span className="w-6 text-right text-xs text-muted-foreground">
                        {toBn(b.count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {reviews.length ? (
                  reviews.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-2xl border border-border bg-card p-5 shadow-soft"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <img
                          src={r.avatar_url ?? "https://i.pravatar.cc/150"}
                          alt={r.name}
                          className="h-10 w-10 shrink-0 rounded-full object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold">{r.name}</p>
                          <Stars rating={r.rating} />
                        </div>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {bnDate(r.created_at)}
                        </span>
                      </div>
                      {r.comment ? (
                        <p className="mt-3 text-sm text-muted-foreground">{r.comment}</p>
                      ) : null}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/40 py-14 text-center text-sm text-muted-foreground">
                    এখনো কোনো রিভিউ নেই
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {related.length ? (
          <section className="mt-14">
            <SectionHeading title="সম্পর্কিত পণ্য" align="left" />
            <ProductGrid products={related.slice(0, 4)} categories={categories} />
          </section>
        ) : null}
      </div>
    </SiteLayout>
  );
}
