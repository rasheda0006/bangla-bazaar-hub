import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useProducts } from "@/lib/data";
import { toBn } from "@/lib/format";

export const Route = createFileRoute("/categories")({
  head: () => ({
    meta: [
      { title: "ক্যাটাগরি — সব বিভাগ | আমার ডিজিটাল স্টোর" },
      {
        name: "description",
        content: "কোর্স, সফটওয়্যার টুলস, সাবস্ক্রিপশন, ই-বুক ও টেমপ্লেট — সব ডিজিটাল ক্যাটাগরি দেখুন।",
      },
      { property: "og:title", content: "ক্যাটাগরি — সব বিভাগ | আমার ডিজিটাল স্টোর" },
      { property: "og:description", content: "সব ডিজিটাল ক্যাটাগরি ঘুরে দেখুন ও পছন্দের প্রোডাক্ট কিনুন।" },
    ],
  }),
  component: CategoriesPage,
});

function CategoriesPage() {
  const { data: categories = [], isLoading } = useCategories();
  const { data: products = [] } = useProducts();

  return (
    <SiteLayout>
      <div className="container-page py-10">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">সব ক্যাটাগরি</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            যে ক্যাটাগরিতে ক্লিক করবেন, সেই অনুযায়ী ডিজিটাল প্রোডাক্ট ফিল্টার হয়ে যাবে
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-2xl" />
            ))}
          </div>
        ) : categories.length ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {categories.map((c) => {
              const count = products.filter((p) => p.category_id === c.id).length;
              return (
                <Link
                  key={c.id}
                  to="/shop"
                  search={{ category: c.slug }}
                  className="group overflow-hidden rounded-2xl border border-border bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
                >
                  <div className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={
                        c.image_url ??
                        "https://placehold.co/400x300/e9f5ef/0f9d58?text=%E0%A6%9B%E0%A6%AC%E0%A6%BF"
                      }
                      alt={c.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-4 text-center">
                    <h2 className="truncate font-display text-base font-bold">{c.name}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{toBn(count)} টি প্রোডাক্ট</p>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border bg-muted/40 py-16 text-center text-sm text-muted-foreground">
            কোনো ক্যাটাগরি পাওয়া যায়নি
          </div>
        )}
      </div>
    </SiteLayout>
  );
}
