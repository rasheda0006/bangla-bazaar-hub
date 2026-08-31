import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";

import { SiteLayout } from "@/components/site/SiteLayout";
import { ProductGrid } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCategories, useProducts } from "@/lib/data";
import { taka, toBn } from "@/lib/format";

type ShopSearch = { category?: string | undefined; q?: string | undefined };

export const Route = createFileRoute("/shop")({
  validateSearch: (search: Record<string, unknown>): ShopSearch => ({
    category: typeof search['category'] === "string" ? search['category'] : undefined,
    q: typeof search['q'] === "string" ? search['q'] : undefined,
  }),
  head: () => ({
    meta: [
      { title: "শপ — সব ডিজিটাল প্রোডাক্ট | আমার ডিজিটাল স্টোর" },
      {
        name: "description",
        content: "দাম ও ক্যাটাগরি অনুযায়ী ফিল্টার করে কোর্স, টুলস, সাবস্ক্রিপশন ও ই-বুক দেখুন এবং অর্ডার করুন।",
      },
      { property: "og:title", content: "শপ — সব ডিজিটাল প্রোডাক্ট | আমার ডিজিটাল স্টোর" },
      { property: "og:description", content: "দাম ও ক্যাটাগরি অনুযায়ী ফিল্টার করে ডিজিটাল প্রোডাক্ট কিনুন।" },
    ],
  }),
  component: ShopPage,
});

const PAGE_SIZE = 12;
const MAX_PRICE = 10000;

function ShopPage() {
  const { category, q } = Route.useSearch();
  const navigate = useNavigate({ from: "/shop" });
  const { data: categories = [] } = useCategories();
  const { data: products = [], isLoading } = useProducts();

  const [price, setPrice] = useState<number[]>([0, MAX_PRICE]);
  const [sort, setSort] = useState("newest");
  const [visible, setVisible] = useState(PAGE_SIZE);

  const selected = category ? [category] : [];

  const toggleCategory = (slug: string, checked: boolean) => {
    void navigate({
      search: () => (checked ? { category: slug } : {}),
    });
    setVisible(PAGE_SIZE);
  };

  const filtered = useMemo(() => {
    const catIds = categories.filter((c) => selected.includes(c.slug)).map((c) => c.id);
    const term = (q ?? "").trim().toLowerCase();
    const list = products.filter((p) => {
      const effective = Number(p.discount_price ?? p.price);
      const inPrice = effective >= (price[0] ?? 0) && effective <= (price[1] ?? MAX_PRICE);
      const inCat = catIds.length === 0 || (p.category_id && catIds.includes(p.category_id));
      const inTerm =
        !term ||
        String(p.title ?? "").toLowerCase().includes(term) ||
        String(p.short_description ?? "").toLowerCase().includes(term) ||
        String(p.description ?? "").toLowerCase().includes(term);
      return inPrice && inCat && inTerm;
    });
    const sorted = [...list];
    if (sort === "price_asc")
      sorted.sort(
        (a, b) => Number(a.discount_price ?? a.price) - Number(b.discount_price ?? b.price),
      );
    if (sort === "price_desc")
      sorted.sort(
        (a, b) => Number(b.discount_price ?? b.price) - Number(a.discount_price ?? a.price),
      );
    if (sort === "rating") sorted.sort((a, b) => Number(b.rating) - Number(a.rating));
    return sorted;
  }, [products, categories, selected, price, sort, q]);


  const filters = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 font-display text-base font-bold">দামের সীমা</h3>
        <Slider
          value={price}
          onValueChange={setPrice}
          min={0}
          max={MAX_PRICE}
          step={100}
          className="mt-2"
        />
        <div className="mt-3 flex items-center justify-between text-sm text-muted-foreground">
          <span>{taka(price[0] ?? 0)}</span>
          <span>{taka(price[1] ?? MAX_PRICE)}</span>
        </div>
      </div>

      <div>
        <h3 className="mb-4 font-display text-base font-bold">ক্যাটাগরি</h3>
        <div className="space-y-3">
          {categories.map((c) => (
            <div key={c.id} className="flex items-center gap-3">
              <Checkbox
                id={`cat-${c.id}`}
                checked={selected.includes(c.slug)}
                onCheckedChange={(v) => toggleCategory(c.slug, Boolean(v))}
              />
              <Label htmlFor={`cat-${c.id}`} className="cursor-pointer text-sm font-normal">
                {c.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        className="w-full rounded-full"
        onClick={() => {
          setPrice([0, MAX_PRICE]);
          setSort("newest");
          void navigate({ search: () => ({}) });
        }}
      >
        ফিল্টার মুছুন
      </Button>
    </div>
  );

  return (
    <SiteLayout>
      <div className="container-page py-10">
        <div className="mx-auto mb-8 max-w-2xl text-center">
          <h1 className="font-display text-3xl font-bold sm:text-4xl">সব ডিজিটাল প্রোডাক্ট</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            আপনার পছন্দ অনুযায়ী ফিল্টার করে সেরা ডিজিটাল প্রোডাক্টটি বেছে নিন
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[260px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-6 shadow-soft">
              {filters}
            </div>
          </aside>

          <div>
            <div className="mb-5 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <p className="min-w-0 truncate text-sm text-muted-foreground">
                মোট {toBn(filtered.length)} টি ডিজিটাল প্রোডাক্ট
              </p>
              <div className="flex shrink-0 items-center gap-2">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 rounded-full lg:hidden">
                      <SlidersHorizontal className="h-4 w-4" />
                      ফিল্টার
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 overflow-y-auto">
                    <SheetHeader>
                      <SheetTitle className="font-display">ফিল্টার</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">{filters}</div>
                  </SheetContent>
                </Sheet>

                <Select value={sort} onValueChange={setSort}>
                  <SelectTrigger className="w-[160px] rounded-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">নতুন আগে</SelectItem>
                    <SelectItem value="price_asc">দাম: কম থেকে বেশি</SelectItem>
                    <SelectItem value="price_desc">দাম: বেশি থেকে কম</SelectItem>
                    <SelectItem value="rating">সর্বোচ্চ রেটিং</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ProductGrid
              products={filtered.slice(0, visible)}
              categories={categories}
              loading={isLoading}
            />

            {filtered.length > visible ? (
              <div className="mt-8 text-center">
                <Button
                  variant="outline"
                  className="rounded-full px-8"
                  onClick={() => setVisible((v) => v + PAGE_SIZE)}
                >
                  আরও দেখুন
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </SiteLayout>
  );
}
