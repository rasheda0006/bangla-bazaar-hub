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
import { useRefresh } from "@/lib/admin";
import { db, useCategories, type Category } from "@/lib/data";
import { slugify, toBn } from "@/lib/format";

export const Route = createFileRoute("/admin/categories")({
  component: AdminCategories,
});

type Form = { id?: string; name: string; slug: string; image_url: string; sort_order: number };
const EMPTY: Form = { name: "", slug: "", image_url: "", sort_order: 0 };

function AdminCategories() {
  const { data: categories = [] } = useCategories();
  const refresh = useRefresh();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Form>(EMPTY);
  const [busy, setBusy] = useState(false);

  const edit = (c: Category) => {
    setForm({
      id: c.id,
      name: c.name,
      slug: c.slug,
      image_url: c.image_url ?? "",
      sort_order: c.sort_order,
    });
    setOpen(true);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const payload = {
      name: form.name.trim(),
      slug: slugify(form.slug || form.name),
      image_url: form.image_url || null,
      sort_order: Number(form.sort_order) || 0,
    };
    const { error } = form.id
      ? await db.from("categories").update(payload).eq("id", form.id)
      : await db.from("categories").insert(payload);
    setBusy(false);
    if (error) {
      toast.error("সেভ করা যায়নি");
      return;
    }
    toast.success("সেভ হয়েছে");
    setOpen(false);
    setForm(EMPTY);
    refresh(["categories"]);
  };

  const remove = async (id: string) => {
    const { error } = await db.from("categories").delete().eq("id", id);
    if (error) toast.error("মুছে ফেলা যায়নি");
    else {
      toast.success("মুছে ফেলা হয়েছে");
      refresh(["categories", "products"]);
    }
  };

  return (
    <AdminPage
      title="ক্যাটাগরি"
      description="ক্যাটাগরি যোগ, সম্পাদনা ও মুছুন"
      action={
        <Button
          className="gap-2 rounded-full"
          onClick={() => {
            setForm(EMPTY);
            setOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          নতুন
        </Button>
      }
    >
      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">ছবি</th>
                <th className="pb-2 font-medium">নাম</th>
                <th className="pb-2 font-medium">স্লাগ</th>
                <th className="pb-2 font-medium">ক্রম</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3">
                    <img
                      src={c.image_url ?? "https://placehold.co/80"}
                      alt={c.name}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  </td>
                  <td className="py-3 font-semibold">{c.name}</td>
                  <td className="py-3 text-muted-foreground">{c.slug}</td>
                  <td className="py-3">{toBn(c.sort_order)}</td>
                  <td className="py-3 text-right">
                    <Button variant="ghost" size="icon" onClick={() => edit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <ConfirmDelete itemName={c.name} onConfirm={() => void remove(c.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {categories.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">কোনো ক্যাটাগরি নেই</p>
          ) : null}
        </div>
      </AdminCard>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">
              {form.id ? "ক্যাটাগরি সম্পাদনা" : "নতুন ক্যাটাগরি"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div className="space-y-1.5">
              <Label>নাম</Label>
              <Input
                required
                value={form.name}
                onChange={(e) => {
                  const name = e.target.value;
                  const auto = !form.slug || form.slug === slugify(form.name);
                  setForm({ ...form, name, slug: auto ? slugify(name) : form.slug });
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
            <ImageField
              label="ছবি"
              value={form.image_url}
              onChange={(url) => setForm({ ...form, image_url: url })}
            />
            <div className="space-y-1.5">
              <Label>ক্রম</Label>
              <Input
                type="number"
                value={form.sort_order}
                onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              />
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
