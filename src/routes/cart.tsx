import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { taka, toBn } from "@/lib/format";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "আপনার কার্ট | আমার দোকান" },
      { name: "description", content: "কার্টে থাকা ডিজিটাল প্রোডাক্ট দেখুন, পরিমাণ বদলান ও চেকআউট করুন।" },
      { property: "og:title", content: "আপনার কার্ট | আমার দোকান" },
      { property: "og:description", content: "কার্টের ডিজিটাল প্রোডাক্ট দেখে চেকআউট সম্পন্ন করুন।" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal, setQty, remove, ready } = useCart();

  return (
    <SiteLayout>
      <div className="container-page py-10">
        <h1 className="mb-8 text-center font-display text-3xl font-bold sm:text-4xl">
          আপনার কার্ট
        </h1>

        {!ready ? null : items.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-muted/40 px-6 py-16 text-center">
            <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-secondary">
              <ShoppingBag className="h-9 w-9 text-primary" />
            </span>
            <h2 className="mt-5 font-display text-xl font-bold">আপনার কার্ট খালি</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              পছন্দের ডিজিটাল প্রোডাক্ট যোগ করে কেনাকাটা শুরু করুন
            </p>
            <Button asChild className="mt-6 rounded-full px-8">
              <Link to="/shop">কেনাকাটা শুরু করুন</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="grid grid-cols-[64px_minmax(0,1fr)_auto] items-center gap-4 rounded-2xl border border-border bg-card p-3 shadow-soft sm:grid-cols-[80px_minmax(0,1fr)_auto_auto]"
                >
                  <img
                    src={cdnImage(item.image ?? "", 160)}
                    width={80}
                    height={80}
                    loading="lazy"
                    decoding="async"
                    alt={item.title}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-20 sm:w-20"
                  />
                  <div className="min-w-0">
                    <Link
                      to="/product/$productId"
                      params={{ productId: item.id }}
                      className="line-clamp-2-safe text-sm font-semibold hover:text-primary"
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-sm font-bold text-primary">{taka(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2 sm:hidden">
                      <QtyControl item={item} setQty={setQty} />
                      <Button variant="ghost" size="icon" onClick={() => remove(item.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <QtyControl item={item} setQty={setQty} />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hidden sm:inline-flex"
                    onClick={() => remove(item.id)}
                    aria-label="মুছুন"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>

            <aside>
              <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-soft">
                <h2 className="font-display text-lg font-bold">অর্ডার সামারি</h2>
                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">সাবটোটাল</dt>
                    <dd className="font-semibold">{taka(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">ডিজিটাল ডেলিভারি</dt>
                    <dd className="font-semibold text-success">ইনস্ট্যান্ট • ফ্রি</dd>
                  </div>
                  <div className="flex justify-between border-t border-border pt-3 text-base">
                    <dt className="font-bold">সর্বমোট</dt>
                    <dd className="font-display font-extrabold text-primary">{taka(subtotal)}</dd>
                  </div>
                </dl>
                <Button asChild size="lg" className="mt-6 w-full rounded-full">
                  <Link to="/checkout">চেকআউট করুন</Link>
                </Button>
                <Button asChild variant="ghost" className="mt-2 w-full rounded-full">
                  <Link to="/shop">আরও কেনাকাটা</Link>
                </Button>
              </div>
            </aside>
          </div>
        )}
      </div>
    </SiteLayout>
  );
}

function QtyControl({
  item,
  setQty,
}: {
  item: { id: string; qty: number };
  setQty: (id: string, qty: number) => void;
}) {
  return (
    <div className="flex items-center rounded-full border border-border">
      <button
        onClick={() => setQty(item.id, item.qty - 1)}
        className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-secondary"
        aria-label="কমান"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-8 text-center text-sm font-semibold">{toBn(item.qty)}</span>
      <button
        onClick={() => setQty(item.id, item.qty + 1)}
        className="grid h-8 w-8 place-items-center rounded-full transition-colors hover:bg-secondary"
        aria-label="বাড়ান"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
