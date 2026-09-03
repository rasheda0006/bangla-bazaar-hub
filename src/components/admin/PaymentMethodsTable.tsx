import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useRefresh } from "@/lib/admin";
import { db, usePaymentMethods, type PaymentMethod } from "@/lib/data";
import { slugify } from "@/lib/format";

type Draft = {
  id?: string;
  code: string;
  label: string;
  number: string;
  instructions: string;
  color: string;
  sort_order: number;
  is_active: boolean;
};

const EMPTY: Draft = {
  code: "",
  label: "",
  number: "",
  instructions: "",
  color: "#0f9d58",
  sort_order: 0,
  is_active: true,
};

export function PaymentMethodsTable() {
  const { data: methods = [], isLoading } = usePaymentMethods();
  const refresh = useRefresh();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((prev) => (prev ? { ...prev, [key]: value } : prev));

  const openEdit = (m: PaymentMethod) =>
    setDraft({
      id: m.id,
      code: m.code,
      label: m.label,
      number: m.number ?? "",
      instructions: m.instructions ?? "",
      color: m.color || "#0f9d58",
      sort_order: m.sort_order,
      is_active: m.is_active,
    });

  const save = async () => {
    if (!draft) return;
    const label = draft.label.trim();
    if (!label) {
      toast.error("মাধ্যমের নাম দিন");
      return;
    }
    const code = (draft.code.trim() || slugify(label) || `method-${Date.now()}`).toLowerCase();
    const payload = {
      code,
      label,
      number: draft.number.trim() || null,
      instructions: draft.instructions.trim() || null,
      color: draft.color || "#0f9d58",
      sort_order: Number(draft.sort_order) || 0,
      is_active: draft.is_active,
    };
    setBusy(true);
    const { error } = draft.id
      ? await db.from("payment_methods").update(payload).eq("id", draft.id)
      : await db.from("payment_methods").insert(payload);
    setBusy(false);
    if (error) {
      toast.error("সেভ করা যায়নি");
      return;
    }
    toast.success("পেমেন্ট মাধ্যম সেভ হয়েছে");
    setDraft(null);
    refresh(["payment_methods"]);
  };

  const toggleActive = async (m: PaymentMethod, value: boolean) => {
    const { error } = await db.from("payment_methods").update({ is_active: value }).eq("id", m.id);
    if (error) toast.error("আপডেট হয়নি");
    else refresh(["payment_methods"]);
  };

  const remove = async (id: string) => {
    const { error } = await db.from("payment_methods").delete().eq("id", id);
    if (error) toast.error("মুছে ফেলা যায়নি");
    else {
      toast.success("মুছে ফেলা হয়েছে");
      refresh(["payment_methods"]);
    }
  };

  return (
    <div className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-display text-base font-bold">পেমেন্ট মাধ্যম</h3>
          <p className="text-xs text-muted-foreground">
            প্রতিটি মাধ্যমের নম্বর ও আলাদা নির্দেশনা চেকআউট পেজে দেখাবে
          </p>
        </div>
        <Button className="rounded-full" onClick={() => setDraft({ ...EMPTY, sort_order: methods.length + 1 })}>
          নতুন মাধ্যম যোগ করুন
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted-foreground">
              <th className="pb-2 font-medium">নাম</th>
              <th className="pb-2 font-medium">কোড</th>
              <th className="pb-2 font-medium">নম্বর</th>
              <th className="pb-2 font-medium">নির্দেশনা</th>
              <th className="pb-2 font-medium">ক্রম</th>
              <th className="pb-2 font-medium">চালু</th>
              <th className="pb-2" />
            </tr>
          </thead>
          <tbody>
            {methods.map((m) => (
              <tr key={m.id} className="border-b border-border/60 last:border-0">
                <td className="py-3">
                  <span className="flex items-center gap-2 font-semibold">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full"
                      style={{ background: m.color }}
                    />
                    {m.label}
                  </span>
                </td>
                <td className="py-3 text-muted-foreground">{m.code}</td>
                <td className="py-3">{m.number ?? "—"}</td>
                <td className="py-3 max-w-[260px] truncate text-muted-foreground">
                  {m.instructions ?? "—"}
                </td>
                <td className="py-3">{m.sort_order}</td>
                <td className="py-3">
                  <Switch
                    checked={m.is_active}
                    onCheckedChange={(v) => void toggleActive(m, v)}
                  />
                </td>
                <td className="py-3 text-right">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(m)}>
                    এডিট
                  </Button>
                  <ConfirmDelete itemName={m.label} onConfirm={() => void remove(m.id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!isLoading && methods.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            কোনো পেমেন্ট মাধ্যম নেই — নতুন যোগ করুন
          </p>
        ) : null}
      </div>

      <Dialog open={Boolean(draft)} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {draft?.id ? "পেমেন্ট মাধ্যম এডিট" : "নতুন পেমেন্ট মাধ্যম"}
            </DialogTitle>
          </DialogHeader>
          {draft ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>নাম</Label>
                <Input
                  value={draft.label}
                  placeholder="যেমন: বিকাশ"
                  onChange={(e) => set("label", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>কোড (খালি রাখলে অটো)</Label>
                <Input
                  value={draft.code}
                  placeholder="bkash"
                  onChange={(e) => set("code", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>নম্বর / অ্যাকাউন্ট</Label>
                <Input value={draft.number} onChange={(e) => set("number", e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>রঙ</Label>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <Input value={draft.color} onChange={(e) => set("color", e.target.value)} />
                  <input
                    type="color"
                    value={draft.color}
                    onChange={(e) => set("color", e.target.value)}
                    className="h-9 w-12 shrink-0 rounded-md border border-border"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>ক্রম</Label>
                <Input
                  type="number"
                  value={draft.sort_order}
                  onChange={(e) => set("sort_order", Number(e.target.value) || 0)}
                />
              </div>
              <label className="flex items-center justify-between gap-4 self-end rounded-xl border border-border px-4 py-2.5 text-sm">
                <span>চালু</span>
                <Switch checked={draft.is_active} onCheckedChange={(v) => set("is_active", v)} />
              </label>
              <div className="space-y-1.5 sm:col-span-2">
                <Label>এই মাধ্যমের নির্দেশনা</Label>
                <Textarea
                  rows={4}
                  value={draft.instructions}
                  placeholder="সেন্ড মানি করার পর ট্রানজেকশন আইডি লিখুন..."
                  onChange={(e) => set("instructions", e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Button disabled={busy} className="w-full rounded-full" onClick={() => void save()}>
                  {busy ? "সেভ হচ্ছে..." : "সেভ করুন"}
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
