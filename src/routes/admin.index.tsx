import { createFileRoute, Link } from "@tanstack/react-router";
import { FolderTree, Package, ShoppingBag, Wallet } from "lucide-react";

import { AdminCard, AdminPage } from "@/components/admin/AdminPage";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategories, useOrders, useProducts } from "@/lib/data";
import { ORDER_STATUS, bnDate, taka, toBn } from "@/lib/format";

export const Route = createFileRoute("/admin/")({
  component: Dashboard,
});

function Dashboard() {
  const { data: products = [], isLoading: pl } = useProducts();
  const { data: orders = [], isLoading: ol } = useOrders();
  const { data: categories = [] } = useCategories();

  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((s, o) => s + Number(o.total), 0);

  const stats = [
    { label: "মোট পণ্য", value: toBn(products.length), icon: Package },
    { label: "মোট অর্ডার", value: toBn(orders.length), icon: ShoppingBag },
    { label: "মোট বিক্রি", value: taka(revenue), icon: Wallet },
    { label: "ক্যাটাগরি", value: toBn(categories.length), icon: FolderTree },
  ];

  return (
    <AdminPage title="ড্যাশবোর্ড" description="আপনার দোকানের এক নজরে হিসাব">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {pl || ol
          ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          : stats.map((s) => (
              <AdminCard key={s.label}>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-muted-foreground">{s.label}</p>
                    <p className="mt-1 font-display text-2xl font-extrabold">{s.value}</p>
                  </div>
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                    <s.icon className="h-5 w-5" />
                  </span>
                </div>
              </AdminCard>
            ))}
      </div>

      <AdminCard>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <h2 className="truncate font-display text-lg font-bold">সাম্প্রতিক অর্ডার</h2>
          <Link to="/admin/orders" className="shrink-0 text-sm font-semibold text-primary">
            সব দেখুন
          </Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">অর্ডার</th>
                <th className="pb-2 font-medium">গ্রাহক</th>
                <th className="pb-2 font-medium">তারিখ</th>
                <th className="pb-2 font-medium">মোট</th>
                <th className="pb-2 font-medium">স্ট্যাটাস</th>
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 6).map((o) => {
                const st = ORDER_STATUS[o.status] ?? ORDER_STATUS['pending']!;
                return (
                  <tr key={o.id} className="border-b border-border/60 last:border-0">
                    <td className="py-3 font-semibold">#{toBn(o.order_no)}</td>
                    <td className="py-3">{o.customer_name}</td>
                    <td className="py-3 text-muted-foreground">{bnDate(o.created_at)}</td>
                    <td className="py-3 font-semibold">{taka(o.total)}</td>
                    <td className="py-3">
                      <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${st.className}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!ol && orders.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">এখনো কোনো অর্ডার নেই</p>
          ) : null}
        </div>
      </AdminCard>
    </AdminPage>
  );
}
