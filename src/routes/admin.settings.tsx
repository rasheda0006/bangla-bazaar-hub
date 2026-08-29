import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import { db, useSettings, type SiteSettings } from "@/lib/data";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { data: settings } = useSettings();
  const refresh = useRefresh();
  const [form, setForm] = useState<SiteSettings | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (settings) setForm(settings);
  }, [settings]);

  if (!form) {
    return <AdminPage title="সেটিংস"><p className="text-sm text-muted-foreground">লোড হচ্ছে...</p></AdminPage>;
  }

  const set = <K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) =>
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));

  const save = async () => {
    setBusy(true);
    const { id: _id, ...payload } = form;
    const { error } = await db.from("site_settings").update(payload).eq("id", 1);
    setBusy(false);
    if (error) toast.error("সেভ করা যায়নি");
    else {
      toast.success("সেটিংস সেভ হয়েছে");
      refresh(["site_settings"]);
    }
  };

  const text = (key: keyof SiteSettings, label: string, placeholder?: string) => (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input
        value={(form[key] as string) ?? ""}
        placeholder={placeholder ?? ""}
        onChange={(e) => set(key, e.target.value as SiteSettings[typeof key])}
      />
    </div>
  );

  const toggle = (key: keyof SiteSettings, label: string) => (
    <label className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3 text-sm">
      <span className="min-w-0 truncate">{label}</span>
      <Switch
        checked={Boolean(form[key])}
        onCheckedChange={(v) => set(key, v as SiteSettings[typeof key])}
      />
    </label>
  );

  return (
    <AdminPage
      title="সেটিংস"
      description="সাইটের সব তথ্য এখান থেকে কাস্টমাইজ করুন"
      action={
        <Button disabled={busy} className="rounded-full px-6" onClick={() => void save()}>
          {busy ? "সেভ হচ্ছে..." : "সেভ করুন"}
        </Button>
      }
    >
      <Tabs defaultValue="general">
        <TabsList className="flex-wrap rounded-full">
          <TabsTrigger value="general" className="rounded-full">সাধারণ</TabsTrigger>
          <TabsTrigger value="design" className="rounded-full">ডিজাইন</TabsTrigger>
          <TabsTrigger value="payment" className="rounded-full">পেমেন্ট</TabsTrigger>
          <TabsTrigger value="seo" className="rounded-full">SEO</TabsTrigger>
          <TabsTrigger value="sections" className="rounded-full">সেকশন</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <AdminCard className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {text("site_name", "সাইটের নাম")}
              {text("site_tagline", "ট্যাগলাইন")}
              <ImageField
                label="লোগো"
                value={form.logo_url ?? ""}
                onChange={(url) => set("logo_url", url || null)}
              />
              <ImageField
                label="ফেভিকন"
                value={form.favicon_url ?? ""}
                onChange={(url) => set("favicon_url", url || null)}
              />
              {text("phone", "ফোন")}
              {text("email", "ইমেইল")}
              {text("whatsapp", "হোয়াটসঅ্যাপ")}
              {text("address", "ঠিকানা")}
              {text("facebook_url", "ফেসবুক লিংক")}
              {text("instagram_url", "ইনস্টাগ্রাম লিংক")}
              {text("youtube_url", "ইউটিউব লিংক")}
            </div>
          </AdminCard>
        </TabsContent>

        <TabsContent value="design">
          <AdminCard className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>প্রাইমারি কালার</Label>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <Input
                    value={form.primary_color}
                    onChange={(e) => set("primary_color", e.target.value)}
                  />
                  <input
                    type="color"
                    value={form.primary_color}
                    onChange={(e) => set("primary_color", e.target.value)}
                    className="h-9 w-12 shrink-0 rounded-md border border-border"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>সেকেন্ডারি কালার</Label>
                <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
                  <Input
                    value={form.secondary_color}
                    onChange={(e) => set("secondary_color", e.target.value)}
                  />
                  <input
                    type="color"
                    value={form.secondary_color}
                    onChange={(e) => set("secondary_color", e.target.value)}
                    className="h-9 w-12 shrink-0 rounded-md border border-border"
                  />
                </div>
              </div>
              {text("font_family", "ফন্ট", "Hind Siliguri")}
              <div className="space-y-1.5">
                <Label>হিরো উচ্চতা — মোবাইল (px)</Label>
                <Input
                  type="number"
                  min={120}
                  max={800}
                  value={form.hero_height_mobile ?? 240}
                  onChange={(e) => set("hero_height_mobile", Number(e.target.value) || 0)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>হিরো উচ্চতা — ডেস্কটপ (px)</Label>
                <Input
                  type="number"
                  min={160}
                  max={1000}
                  value={form.hero_height_desktop ?? 380}
                  onChange={(e) => set("hero_height_desktop", Number(e.target.value) || 0)}
                />
              </div>
            </div>
          </AdminCard>
        </TabsContent>

        <TabsContent value="payment">
          <AdminCard className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {text("bkash_number", "বিকাশ নম্বর")}
              {toggle("bkash_enabled", "বিকাশ চালু")}
              {text("nagad_number", "নগদ নম্বর")}
              {toggle("nagad_enabled", "নগদ চালু")}
              {text("rocket_number", "রকেট নম্বর")}
              {toggle("rocket_enabled", "রকেট চালু")}
            </div>
          </AdminCard>
        </TabsContent>

        <TabsContent value="seo">
          <AdminCard className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {text("meta_title", "মেটা টাইটেল")}
              <div className="space-y-1.5 sm:col-span-2">
                <Label>মেটা ডেসক্রিপশন</Label>
                <Textarea
                  rows={3}
                  value={form.meta_description ?? ""}
                  onChange={(e) => set("meta_description", e.target.value)}
                />
              </div>
              {text("fb_pixel_id", "ফেসবুক পিক্সেল আইডি")}
              {text("ga_id", "গুগল অ্যানালিটিকস আইডি")}
              {text("gtm_id", "গুগল ট্যাগ ম্যানেজার আইডি")}
            </div>
          </AdminCard>
        </TabsContent>

        <TabsContent value="sections">
          <AdminCard className="mt-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {toggle("show_hero", "হিরো স্লাইডার")}
              {toggle("show_categories", "ক্যাটাগরি সেকশন")}
              {toggle("show_best_selling", "বেস্ট সেলিং সেকশন")}
              {toggle("show_suggested", "সাজেস্টেড সেকশন")}
              {toggle("show_all_products", "সব পণ্য সেকশন")}
              {toggle("show_testimonials", "টেস্টিমোনিয়াল সেকশন")}
            </div>
          </AdminCard>
        </TabsContent>
      </Tabs>
    </AdminPage>
  );
}
