import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";

import { AdminCard, AdminPage } from "@/components/admin/AdminPage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRefresh } from "@/lib/admin";
import { db, useOrders, type Order } from "@/lib/data";
import { ORDER_STATUS, PAYMENT_METHODS, bnDate, taka, toBn } from "@/lib/format";

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

const STATUSES = ["pending", "verified", "completed", "cancelled"] as const;

function AdminOrders() {
  const { data: orders = [], isLoading } = useOrders();
  const refresh = useRefresh();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState("all");
  const [detail, setDetail] = useState<Order | null>(null);

  const list = orders.filter((o) => {
    const matchQ =
      !q ||
      String(o.order_no).includes(q) ||
      o.customer_name.toLowerCase().includes(q.toLowerCase()) ||
      o.phone.includes(q) ||
      o.transaction_id.toLowerCase().includes(q.toLowerCase());
    const matchS = filter === "all" || o.status === filter;
    return matchQ && matchS;
  });

  const updateStatus = async (id: string, status: string) => {
    const { error } = await db.from("orders").update({ status }).eq("id", id);
    if (error) toast.error("স্ট্যাটাস আপডেট হয়নি");
    else {
      toast.success("স্ট্যাটাস আপডেট হয়েছে");
      refresh(["orders"]);
    }
  };

  const removeOrder = async (id: string) => {
    const { error } = await db.from("orders").delete().eq("id", id);
    if (error) toast.error("অর্ডার মুছে ফেলা যায়নি");
    else {
      toast.success("অর্ডার মুছে ফেলা হয়েছে");
      refresh(["orders"]);
    }
  };


  return (
    <AdminPage title="অর্ডার" description="সব অর্ডার দেখুন ও পেমেন্ট যাচাই করুন">
      <AdminCard>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="অর্ডার নম্বর, নাম, ফোন বা TrxID খুঁজুন"
          />
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">সব স্ট্যাটাস</SelectItem>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {ORDER_STATUS[s]?.label ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">অর্ডার</th>
                <th className="pb-2 font-medium">গ্রাহক</th>
                <th className="pb-2 font-medium">ফোন</th>
                <th className="pb-2 font-medium">পেমেন্ট</th>
                <th className="pb-2 font-medium">মোট</th>
                <th className="pb-2 font-medium">তারিখ</th>
                <th className="pb-2 font-medium">স্ট্যাটাস</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {list.map((o) => (
                <tr key={o.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 font-semibold">#{toBn(o.order_no)}</td>
                  <td className="py-3">{o.customer_name}</td>
                  <td className="py-3">{toBn(o.phone)}</td>
                  <td className="py-3">
                    {PAYMENT_METHODS.find((p) => p.value === o.payment_method)?.label ??
                      o.payment_method}
                  </td>
                  <td className="py-3 font-semibold">{taka(o.total)}</td>
                  <td className="py-3 text-muted-foreground">{bnDate(o.created_at)}</td>
                  <td className="py-3">
                    <Select value={o.status} onValueChange={(v) => void updateStatus(o.id, v)}>
                      <SelectTrigger className="h-8 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {ORDER_STATUS[s]?.label ?? s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" size="sm" onClick={() => setDetail(o)}>
                      বিস্তারিত
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && list.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">কোনো অর্ডার পাওয়া যায়নি</p>
          ) : null}
        </div>
      </AdminCard>

      <Dialog open={Boolean(detail)} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              অর্ডার #{toBn(detail?.order_no ?? 0)}
            </DialogTitle>
          </DialogHeader>
          {detail ? (
            <div className="space-y-4 text-sm">
              <Row label="গ্রাহক" value={detail.customer_name} />
              <Row label="ইমেইল" value={detail.email} />
              <Row label="ফোন" value={toBn(detail.phone)} />
              <Row
                label="পেমেন্ট মাধ্যম"
                value={
                  PAYMENT_METHODS.find((p) => p.value === detail.payment_method)?.label ??
                  detail.payment_method
                }
              />
              <Row label="সেন্ডার নম্বর" value={toBn(detail.sender_number)} />
              <Row label="ট্রানজেকশন আইডি" value={detail.transaction_id} />
              <div>
                <p className="mb-2 font-semibold">পণ্যসমূহ</p>
                <ul className="space-y-2">
                  {detail.items.map((i, idx) => (
                    <li key={idx} className="flex gap-3 rounded-xl bg-secondary/50 p-3">
                      <span className="min-w-0 flex-1 truncate">
                        {i.title} × {toBn(i.qty)}
                      </span>
                      <span className="shrink-0 font-semibold">{taka(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex justify-between border-t border-border pt-3 text-base">
                <span className="font-bold">সর্বমোট</span>
                <span className="font-display font-extrabold text-primary">
                  {taka(detail.total)}
                </span>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="min-w-0 break-words font-medium">{value}</span>
    </div>
  );
}
