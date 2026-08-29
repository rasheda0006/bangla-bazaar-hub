import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminCard, AdminPage } from "@/components/admin/AdminPage";
import { ImageField } from "@/components/admin/ImageField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRefresh } from "@/lib/admin";
import { db, useHeroSlides, useTestimonials } from "@/lib/data";
import { toBn } from "@/lib/format";

export const Route = createFileRoute("/admin/content")({
  component: AdminContent,
});

function AdminContent() {
  return (
    <AdminPage title="কনটেন্ট" description="হিরো স্লাইড ও কাস্টমার রিভিউ পরিচালনা করুন">
      <Tabs defaultValue="slides">
        <TabsList className="rounded-full">
          <TabsTrigger value="slides" className="rounded-full">
            হিরো স্লাইড
          </TabsTrigger>
          <TabsTrigger value="testimonials" className="rounded-full">
            টেস্টিমোনিয়াল
          </TabsTrigger>
        </TabsList>
        <TabsContent value="slides">
          <SlidesTab />
        </TabsContent>
        <TabsContent value="testimonials">
          <TestimonialsTab />
        </TabsContent>
      </Tabs>
    </AdminPage>
  );
}

function SlidesTab() {
  const { data: slides = [] } = useHeroSlides();
  const refresh = useRefresh();
  const [form, setForm] = useState({
    image_url: "",
    heading: "",
    subheading: "",
    cta_text: "এখনই কিনুন",
    cta_link: "/shop",
    sort_order: 0,
  });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url) {
      toast.error("ছবি দিন");
      return;
    }
    const { error } = await db.from("hero_slides").insert({ ...form, is_active: true });
    if (error) toast.error("যোগ করা যায়নি");
    else {
      toast.success("স্লাইড যোগ হয়েছে");
      setForm({ ...form, image_url: "", heading: "", subheading: "" });
      refresh(["hero_slides"]);
    }
  };

  const update = async (id: string, patch: Record<string, unknown>) => {
    const { error } = await db.from("hero_slides").update(patch).eq("id", id);
    if (error) toast.error("আপডেট হয়নি");
    else refresh(["hero_slides"]);
  };

  const remove = async (id: string) => {
    const { error } = await db.from("hero_slides").delete().eq("id", id);
    if (error) toast.error("মুছে ফেলা যায়নি");
    else {
      toast.success("মুছে ফেলা হয়েছে");
      refresh(["hero_slides"]);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <AdminCard>
        <h2 className="font-display text-lg font-bold">নতুন স্লাইড</h2>
        <form onSubmit={add} className="mt-4 grid gap-4 sm:grid-cols-2">
          <ImageField
            label="ছবি"
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
          />
          <div className="space-y-1.5">
            <Label>হেডিং</Label>
            <Input
              value={form.heading}
              onChange={(e) => setForm({ ...form, heading: e.target.value })}
            />
          </div>
          <div className="space-y-1.5">
            <Label>সাবহেডিং</Label>
            <Input
              value={form.subheading}
              onChange={(e) => setForm({ ...form, subheading: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>বাটন টেক্সট</Label>
              <Input
                value={form.cta_text}
                onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>বাটন লিংক</Label>
              <Input
                value={form.cta_link}
                onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
              />
            </div>
          </div>
          <Button type="submit" className="gap-2 rounded-full sm:col-span-2 sm:w-48">
            <Plus className="h-4 w-4" />
            স্লাইড যোগ করুন
          </Button>
        </form>
      </AdminCard>

      <div className="grid gap-4 md:grid-cols-2">
        {slides.map((s) => (
          <AdminCard key={s.id}>
            <img src={s.image_url} alt="" className="h-32 w-full rounded-xl object-cover" />
            <p className="mt-3 truncate font-semibold">{s.heading ?? "—"}</p>
            <p className="truncate text-sm text-muted-foreground">{s.subheading ?? ""}</p>
            <div className="mt-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <label className="flex min-w-0 items-center gap-2 text-sm">
                <Switch
                  checked={s.is_active}
                  onCheckedChange={(v) => void update(s.id, { is_active: v })}
                />
                সক্রিয়
              </label>
              <Button variant="ghost" size="icon" onClick={() => void remove(s.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}

function TestimonialsTab() {
  const { data: testimonials = [] } = useTestimonials();
  const refresh = useRefresh();
  const [form, setForm] = useState({
    name: "",
    avatar_url: "",
    rating: 5,
    comment: "",
    sort_order: 0,
  });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await db.from("testimonials").insert({
      ...form,
      avatar_url: form.avatar_url || null,
    });
    if (error) toast.error("যোগ করা যায়নি");
    else {
      toast.success("যোগ হয়েছে");
      setForm({ name: "", avatar_url: "", rating: 5, comment: "", sort_order: 0 });
      refresh(["testimonials"]);
    }
  };

  const remove = async (id: string) => {
    const { error } = await db.from("testimonials").delete().eq("id", id);
    if (error) toast.error("মুছে ফেলা যায়নি");
    else {
      toast.success("মুছে ফেলা হয়েছে");
      refresh(["testimonials"]);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <AdminCard>
        <h2 className="font-display text-lg font-bold">নতুন টেস্টিমোনিয়াল</h2>
        <form onSubmit={add} className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>নাম</Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <ImageField
            label="ছবি"
            value={form.avatar_url}
            onChange={(url) => setForm({ ...form, avatar_url: url })}
          />
          <div className="space-y-1.5">
            <Label>রেটিং (১-৫)</Label>
            <Input
              type="number"
              min={1}
              max={5}
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>মন্তব্য</Label>
            <Textarea
              required
              rows={3}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
            />
          </div>
          <Button type="submit" className="gap-2 rounded-full sm:w-48">
            <Plus className="h-4 w-4" />
            যোগ করুন
          </Button>
        </form>
      </AdminCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {testimonials.map((t) => (
          <AdminCard key={t.id}>
            <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <img
                  src={t.avatar_url ?? "https://i.pravatar.cc/150"}
                  alt={t.name}
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{toBn(t.rating)} ★</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => void remove(t.id)}>
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
            <p className="mt-3 line-clamp-2-safe text-sm text-muted-foreground">{t.comment}</p>
          </AdminCard>
        ))}
      </div>
    </div>
  );
}
