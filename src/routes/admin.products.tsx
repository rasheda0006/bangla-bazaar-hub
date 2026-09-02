import { createFileRoute } from "@tanstack/react-router";
import { Pencil, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { AdminCard, AdminPage } from "@/components/admin/AdminPage";
import { ImageField } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useRefresh } from "@/lib/admin";
import { db, useCategories, useProducts, type Product } from "@/lib/data";
import { slugify, taka, toBn } from "@/lib/format";

export const Route = createFileRoute("/admin/products")({
  component: AdminProducts,
});

type Form = {
  id?: string;
  title: string;
  slug: string;
  short_description: string;
  description: string;
  price: number;
  discount_price: string;
  images: string[];
  category_id: string;
  is_best_selling: boolean;
  is_suggested: boolean;
  stock: number;
  rating: number;
};

const EMPTY: Form = {
  title: "",
  slug: "",
  short_description: "",
  description: "",
  price: 0,
  discount_price: "",
  images: ["", "", ""],
  category_id: "",
  is_best_selling: false,
  is_suggested: false,
  stock: 100,
  rating: 5,
};

function AdminProducts() {
  const { data: products = [] } = useProducts();
  const { data: categories = [] } = useCategories();
  const refresh = useRefresh();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("newest");

  const list = products
    .filter((p) => p.title.toLowerCase().includes(q.toLowerCase()))
    .slice()
    .sort((a, b) => {
      const pa = Number(a.discount_price ?? a.price);
      const pb = Number(b.discount_price ?? b.price);
      if (sort === "price_asc") return pa - pb;
      if (sort === "price_desc") return pb - pa;
      if (sort === "title_asc") return a.title.localeCompare(b.title, "bn");
      if (sort === "stock_asc") return a.stock - b.stock;
      if (sort === "oldest")
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const edit = (p: Product) => {
    setForm({
      id: p.id,
      title: p.title,
      slug: p.slug,
      short_description: p.short_description ?? "",
      description: p.description ?? "",
      price: Number(p.price),
      discount_price: p.discount_price ? String(p.discount_price) : "",
      images: [p.images[0] ?? "", p.images[1] ?? "", p.images[2] ?? ""],
      category_id: p.category_id ?? "",
      is_best_selling: p.is_best_selling,
      is_suggested: p.is_suggested,
      stock: p.stock,
      rating: Number(p.rating),
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      title: form.title.trim(),
      slug: slugify(form.slug || form.title),
      short_description: form.short_description || null,
      description: form.description || null,
      price: Number(form.price) || 0,
      discount_price: form.discount_price ? Number(form.discount_price) : null,
      images: form.images.filter(Boolean),
      category_id: form.category_id || null,
      is_best_selling: form.is_best_selling,
      is_suggested: form.is_suggested,
      stock: Number(form.stock) || 0,
      rating: Number(form.rating) || 5,
    };
    const { error } = form.id
      ? await db.from("products").update(payload).eq("id", form.id)
      : await db.from("products").insert(payload);
    setBusy(false);
    if (error) {
      toast.error("সেভ করা যায়নি");
      return;
    }
    toast.success("সেভ হয়েছে");
    setOpen(false);
    setForm(EMPTY);
    refresh(["products"]);
  };

  const remove = async (id: string) => {
    const { error } = await db.from("products").delete().eq("id", id);
    if (error) toast.error("মুছে ফেলা যায়নি");
    else {
      toast.success("মুছে ফেলা হয়েছে");
      refresh(["products"]);
    }
  };

  return (
    <AdminPage
      title="ডিজিটাল প্রোডাক্ট"
      description="কোর্স, টুলস, সাবস্ক্রিপশন ও ই-বুক যোগ, সম্পাদনা ও মুছুন"
      action={
        <Button
          className="gap-2 rounded-full"
          onClick={() => {
            setForm(EMPTY);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          নতুন প্রোডাক্ট
        </Button>
      }
    >
      <AdminCard>
        <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_220px]">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="প্রোডাক্টের নাম খুঁজুন"
          />
          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">নতুন আগে</SelectItem>
              <SelectItem value="oldest">পুরনো আগে</SelectItem>
              <SelectItem value="price_asc">দাম: কম থেকে বেশি</SelectItem>
              <SelectItem value="price_desc">দাম: বেশি থেকে কম</SelectItem>
              <SelectItem value="title_asc">নাম (ক-হ)</SelectItem>
              <SelectItem value="stock_asc">স্টক কম আগে</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">ছবি</th>
                <th className="pb-2 font-medium">নাম</th>
                <th className="pb-2 font-medium">ক্যাটাগরি</th>
                <th className="pb-2 font-medium">দাম</th>
                <th className="pb-2 font-medium">লাইসেন্স স্টক</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {list.map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3">
                    <img
                      src={p.images[0] ?? "https://placehold.co/80"}
                      alt={p.title}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  </td>
                  <td className="max-w-[240px] py-3">
                    <span className="line-clamp-2-safe font-semibold">{p.title}</span>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    {categories.find((c) => c.id === p.category_id)?.name ?? "—"}
                  </td>
                  <td className="py-3 font-semibold">{taka(p.discount_price ?? p.price)}</td>
                  <td className="py-3">{toBn(p.stock)}</td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => edit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <ConfirmDelete itemName={p.title} onConfirm={() => void remove(p.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">কোনো ডিজিটাল প্রোডাক্ট নেই</p>
          ) : null}
        </div>
      </AdminCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[88vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">
              {form.id ? "প্রোডাক্ট সম্পাদনা" : "নতুন প্রোডাক্ট"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1.5">
              <Label>প্রোডাক্টের নাম</Label>
              <Input
                required
                value={form.title}
                onChange={(e) => {
                  const title = e.target.value;
                  const auto = !form.slug || form.slug === slugify(form.title);
                  setForm({ ...form, title, slug: auto ? slugify(title) : form.slug });
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label>স্লাগ (URL) — অটো তৈরি হয়</Label>
              <Input
                value={form.slug}
                placeholder="auto-generated"
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>সংক্ষিপ্ত বিবরণ</Label>
              <Input
                value={form.short_description}
                onChange={(e) => setForm({ ...form, short_description: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label>বিস্তারিত বিবরণ</Label>
              <Textarea
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>দাম (৳)</Label>
                <Input
                  type="number"
                  required
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>ছাড়ের দাম (৳)</Label>
                <Input
                  type="number"
                  value={form.discount_price}
                  onChange={(e) => setForm({ ...form, discount_price: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>লাইসেন্স স্টক (আনলিমিটেড হলে বড় সংখ্যা)</Label>
                <Input
                  type="number"
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>রেটিং</Label>
                <Input
                  type="number"
                  step="0.1"
                  min={0}
                  max={5}
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>ক্যাটাগরি</Label>
              <Select
                value={form.category_id}
                onValueChange={(v) => setForm({ ...form, category_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="ক্যাটাগরি বাছুন" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {form.images.map((img, i) => (
                <ImageField
                  key={i}
                  label={`ছবি ${toBn(i + 1)}`}
                  value={img}
                  onChange={(url) =>
                    setForm({
                      ...form,
                      images: form.images.map((v, idx) => (idx === i ? url : v)),
                    })
                  }
                />
              ))}
            </div>

            <div className="flex flex-wrap gap-6">
              <label className="flex items-center gap-3 text-sm">
                <Switch
                  checked={form.is_best_selling}
                  onCheckedChange={(v) => setForm({ ...form, is_best_selling: v })}
                />
                বেস্ট সেলিং
              </label>
              <label className="flex items-center gap-3 text-sm">
                <Switch
                  checked={form.is_suggested}
                  onCheckedChange={(v) => setForm({ ...form, is_suggested: v })}
                />
                সাজেস্টেড
              </label>
            </div>

            <Button type="submit" disabled={busy} className="w-full rounded-full">
              {busy ? "সেভ হচ্ছে..." : "সেভ করুন"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </AdminPage>
  );
}
