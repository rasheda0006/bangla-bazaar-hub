import { createFileRoute } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AdminCard, AdminPage } from "@/components/admin/AdminPage";
import { ConfirmDelete } from "@/components/admin/ConfirmDelete";
import { ImageField } from "@/components/admin/ImageField";
import {
  AreaField,
  ColorField,
  FieldGroup,
  NumberField,
  TextField,
  ToggleField,
  useSettingsForm,
} from "@/components/admin/settings-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useRefresh } from "@/lib/admin";
import { db, useHeroSlides, useProofImages, useTestimonials } from "@/lib/data";

export const Route = createFileRoute("/admin/content")({
  component: AdminContent,
});

function AdminContent() {
  return (
    <AdminPage
      title="কনটেন্ট"
      description="হিরো স্লাইড, রিভিউ, অর্ডার প্রুফ, ডিজাইন ও সেকশন পরিচালনা করুন"
    >
      <Tabs defaultValue="slides">
        <TabsList className="flex-wrap rounded-full">
          <TabsTrigger value="slides" className="rounded-full">হিরো স্লাইড</TabsTrigger>
          <TabsTrigger value="testimonials" className="rounded-full">টেস্টিমোনিয়াল</TabsTrigger>
          <TabsTrigger value="design" className="rounded-full">ডিজাইন</TabsTrigger>
          <TabsTrigger value="proofs" className="rounded-full">অর্ডার প্রুফ</TabsTrigger>
          <TabsTrigger value="sections" className="rounded-full">সেকশন</TabsTrigger>
        </TabsList>
        <TabsContent value="slides"><SlidesTab /></TabsContent>
        <TabsContent value="testimonials"><TestimonialsTab /></TabsContent>
        <TabsContent value="design"><DesignTab /></TabsContent>
        <TabsContent value="proofs"><ProofsTab /></TabsContent>
        <TabsContent value="sections"><SectionsTab /></TabsContent>
      </Tabs>
    </AdminPage>
  );
}

/* ---------------- হিরো স্লাইড ---------------- */

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
            <Input value={form.heading} onChange={(e) => setForm({ ...form, heading: e.target.value })} />
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
              <Input value={form.cta_text} onChange={(e) => setForm({ ...form, cta_text: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>বাটন লিংক</Label>
              <Input value={form.cta_link} onChange={(e) => setForm({ ...form, cta_link: e.target.value })} />
            </div>
          </div>
          <Button type="submit" className="gap-2 rounded-full sm:col-span-2 sm:w-48">
            <Plus className="h-4 w-4" />
            স্লাইড যোগ করুন
          </Button>
        </form>
      </AdminCard>

      <AdminCard>
        <h2 className="font-display text-lg font-bold">সব স্লাইড (সরাসরি এডিট করুন)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">ছবি</th>
                <th className="pb-2 font-medium">হেডিং</th>
                <th className="pb-2 font-medium">সাবহেডিং</th>
                <th className="pb-2 font-medium">বাটন</th>
                <th className="pb-2 font-medium">লিংক</th>
                <th className="pb-2 font-medium">ক্রম</th>
                <th className="pb-2 font-medium">সক্রিয়</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {slides.map((s) => (
                <tr key={s.id} className="border-b border-border/60 align-top last:border-0">
                  <td className="py-3 pr-3">
                    <img src={s.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
                  </td>
                  <td className="py-3 pr-2">
                    <Cell value={s.heading ?? ""} onSave={(v) => void update(s.id, { heading: v })} />
                  </td>
                  <td className="py-3 pr-2">
                    <Cell value={s.subheading ?? ""} onSave={(v) => void update(s.id, { subheading: v })} />
                  </td>
                  <td className="py-3 pr-2">
                    <Cell value={s.cta_text ?? ""} onSave={(v) => void update(s.id, { cta_text: v })} />
                  </td>
                  <td className="py-3 pr-2">
                    <Cell value={s.cta_link ?? ""} onSave={(v) => void update(s.id, { cta_link: v })} />
                  </td>
                  <td className="w-20 py-3 pr-2">
                    <Cell
                      value={String(s.sort_order)}
                      type="number"
                      onSave={(v) => void update(s.id, { sort_order: Number(v) || 0 })}
                    />
                  </td>
                  <td className="py-3">
                    <Switch
                      checked={s.is_active}
                      onCheckedChange={(v) => void update(s.id, { is_active: v })}
                    />
                  </td>
                  <td className="py-3 text-right">
                    <ConfirmDelete itemName={s.heading ?? "স্লাইড"} onConfirm={() => void remove(s.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {slides.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">কোনো স্লাইড নেই</p>
          ) : null}
        </div>
      </AdminCard>
    </div>
  );
}

/* ---------------- টেস্টিমোনিয়াল ---------------- */

function TestimonialsTab() {
  const { data: testimonials = [] } = useTestimonials();
  const refresh = useRefresh();
  const [form, setForm] = useState({ name: "", avatar_url: "", rating: 5, comment: "", sort_order: 0 });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await db
      .from("testimonials")
      .insert({ ...form, avatar_url: form.avatar_url || null });
    if (error) toast.error("যোগ করা যায়নি");
    else {
      toast.success("যোগ হয়েছে");
      setForm({ name: "", avatar_url: "", rating: 5, comment: "", sort_order: 0 });
      refresh(["testimonials"]);
    }
  };

  const update = async (id: string, patch: Record<string, unknown>) => {
    const { error } = await db.from("testimonials").update(patch).eq("id", id);
    if (error) toast.error("আপডেট হয়নি");
    else refresh(["testimonials"]);
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
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
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

      <AdminCard>
        <h2 className="font-display text-lg font-bold">সব রিভিউ (সরাসরি এডিট করুন)</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">ছবি</th>
                <th className="pb-2 font-medium">নাম</th>
                <th className="pb-2 font-medium">মন্তব্য</th>
                <th className="pb-2 font-medium">রেটিং</th>
                <th className="pb-2 font-medium">ক্রম</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {testimonials.map((t) => (
                <tr key={t.id} className="border-b border-border/60 align-top last:border-0">
                  <td className="py-3 pr-3">
                    <img
                      src={t.avatar_url ?? "https://i.pravatar.cc/150"}
                      alt={t.name}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  </td>
                  <td className="py-3 pr-2">
                    <Cell value={t.name} onSave={(v) => void update(t.id, { name: v })} />
                  </td>
                  <td className="min-w-[260px] py-3 pr-2">
                    <Cell value={t.comment} onSave={(v) => void update(t.id, { comment: v })} />
                  </td>
                  <td className="w-20 py-3 pr-2">
                    <Cell
                      value={String(t.rating)}
                      type="number"
                      onSave={(v) => void update(t.id, { rating: Number(v) || 5 })}
                    />
                  </td>
                  <td className="w-20 py-3 pr-2">
                    <Cell
                      value={String(t.sort_order)}
                      type="number"
                      onSave={(v) => void update(t.id, { sort_order: Number(v) || 0 })}
                    />
                  </td>
                  <td className="py-3 text-right">
                    <ConfirmDelete itemName={t.name} onConfirm={() => void remove(t.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {testimonials.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">কোনো রিভিউ নেই</p>
          ) : null}
        </div>
      </AdminCard>
    </div>
  );
}

/* ---------------- ডিজাইন ---------------- */

function DesignTab() {
  const { form, set, save, busy } = useSettingsForm();
  if (!form) return <p className="mt-6 text-sm text-muted-foreground">লোড হচ্ছে...</p>;

  return (
    <AdminCard className="mt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <ColorField form={form} set={set} field="primary_color" label="প্রাইমারি কালার" fallback="#0f9d58" />
        <ColorField form={form} set={set} field="secondary_color" label="সেকেন্ডারি কালার" fallback="#f4b400" />
        <TextField form={form} set={set} field="font_family" label="ফন্ট" placeholder="Hind Siliguri" />

        <FieldGroup title="হিরো সেকশন">
          <NumberField form={form} set={set} field="hero_height_mobile" label="উচ্চতা — মোবাইল (px)" min={120} max={600} />
          <NumberField form={form} set={set} field="hero_height_desktop" label="উচ্চতা — ডেস্কটপ (px)" min={160} max={700} />
          <NumberField form={form} set={set} field="hero_max_width" label="সর্বোচ্চ প্রস্থ (px)" min={640} max={1600} />
          <div className="space-y-1.5">
            <Label>ব্যাকগ্রাউন্ড ধরন</Label>
            <select
              value={form.hero_bg_style ?? "gradient"}
              onChange={(e) => set("hero_bg_style", e.target.value)}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm"
            >
              <option value="gradient">গ্রেডিয়েন্ট</option>
              <option value="solid">সলিড কালার</option>
            </select>
          </div>
          <ColorField form={form} set={set} field="hero_bg_from" label="ব্যাকগ্রাউন্ড কালার ১" fallback="#e9f7ef" />
          <ColorField form={form} set={set} field="hero_bg_to" label="ব্যাকগ্রাউন্ড কালার ২ (গ্রেডিয়েন্ট)" />
        </FieldGroup>

        <FieldGroup title="হিরো টেক্সট">
          <TextField form={form} set={set} field="hero_badge_text" label="ব্যাজ টেক্সট" />
          <TextField form={form} set={set} field="hero_secondary_cta_text" label="সেকেন্ডারি বাটন টেক্সট" />
          <TextField form={form} set={set} field="hero_secondary_cta_link" label="সেকেন্ডারি বাটন লিংক" />
          <TextField form={form} set={set} field="hero_trust_text" label="ট্রাস্ট টেক্সট" />
          <TextField form={form} set={set} field="hero_customers_text" label="গ্রাহক সংখ্যা টেক্সট" />
          <TextField form={form} set={set} field="hero_delivery_badge_text" label="ডেলিভারি ব্যাজ টেক্সট" />
        </FieldGroup>
      </div>
      <Button disabled={busy} className="mt-5 rounded-full px-6" onClick={() => void save()}>
        {busy ? "সেভ হচ্ছে..." : "সেভ করুন"}
      </Button>
    </AdminCard>
  );
}

/* ---------------- অর্ডার প্রুফ ---------------- */

function ProofsTab() {
  const { data: proofs = [] } = useProofImages();
  const refresh = useRefresh();
  const [form, setForm] = useState({ image_url: "", caption: "", sort_order: 0 });

  const add = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.image_url) {
      toast.error("ছবি দিন");
      return;
    }
    const { error } = await db
      .from("proof_images")
      .insert({ ...form, caption: form.caption || null });
    if (error) toast.error("যোগ করা যায়নি");
    else {
      toast.success("যোগ হয়েছে");
      setForm({ image_url: "", caption: "", sort_order: 0 });
      refresh(["proof_images"]);
    }
  };

  const update = async (id: string, patch: Record<string, unknown>) => {
    const { error } = await db.from("proof_images").update(patch).eq("id", id);
    if (error) toast.error("আপডেট হয়নি");
    else refresh(["proof_images"]);
  };

  const remove = async (id: string) => {
    const { error } = await db.from("proof_images").delete().eq("id", id);
    if (error) toast.error("মুছে ফেলা যায়নি");
    else {
      toast.success("মুছে ফেলা হয়েছে");
      refresh(["proof_images"]);
    }
  };

  return (
    <div className="mt-4 space-y-4">
      <AdminCard>
        <h2 className="font-display text-lg font-bold">নতুন অর্ডার প্রুফ</h2>
        <form onSubmit={add} className="mt-4 grid gap-4 sm:grid-cols-2">
          <ImageField
            label="প্রুফ ছবি"
            value={form.image_url}
            onChange={(url) => setForm({ ...form, image_url: url })}
          />
          <div className="space-y-1.5">
            <Label>ক্যাপশন</Label>
            <Input value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} />
          </div>
          <Button type="submit" className="gap-2 rounded-full sm:col-span-2 sm:w-48">
            <Plus className="h-4 w-4" />
            যোগ করুন
          </Button>
        </form>
      </AdminCard>

      <AdminCard>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-2 font-medium">ছবি</th>
                <th className="pb-2 font-medium">ক্যাপশন</th>
                <th className="pb-2 font-medium">ক্রম</th>
                <th className="pb-2" />
              </tr>
            </thead>
            <tbody>
              {proofs.map((p) => (
                <tr key={p.id} className="border-b border-border/60 last:border-0">
                  <td className="py-3 pr-3">
                    <img src={p.image_url} alt="" className="h-14 w-14 rounded-lg object-cover" />
                  </td>
                  <td className="py-3 pr-2">
                    <Cell value={p.caption ?? ""} onSave={(v) => void update(p.id, { caption: v })} />
                  </td>
                  <td className="w-20 py-3 pr-2">
                    <Cell
                      value={String(p.sort_order)}
                      type="number"
                      onSave={(v) => void update(p.id, { sort_order: Number(v) || 0 })}
                    />
                  </td>
                  <td className="py-3 text-right">
                    <ConfirmDelete itemName={p.caption ?? "প্রুফ"} onConfirm={() => void remove(p.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {proofs.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">কোনো প্রুফ ইমেজ নেই</p>
          ) : null}
        </div>
      </AdminCard>
    </div>
  );
}

/* ---------------- সেকশন ---------------- */

function SectionsTab() {
  const { form, set, save, busy } = useSettingsForm();
  if (!form) return <p className="mt-6 text-sm text-muted-foreground">লোড হচ্ছে...</p>;

  return (
    <AdminCard className="mt-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <FieldGroup title="সেকশন দেখান / লুকান">
          <ToggleField form={form} set={set} field="show_hero" label="হিরো স্লাইডার" />
          <ToggleField form={form} set={set} field="show_categories" label="ক্যাটাগরি সেকশন" />
          <ToggleField form={form} set={set} field="show_best_selling" label="বেস্ট সেলিং সেকশন" />
          <ToggleField form={form} set={set} field="show_suggested" label="সাজেস্টেড সেকশন" />
          <ToggleField form={form} set={set} field="show_all_products" label="সব প্রোডাক্ট সেকশন" />
          <ToggleField form={form} set={set} field="show_testimonials" label="রিভিউ সেকশন" />
          <ToggleField form={form} set={set} field="show_proofs" label="অর্ডার প্রুফ সেকশন" />
        </FieldGroup>

        <FieldGroup title="সেকশন টেক্সট">
          <TextField form={form} set={set} field="sec_categories_title" label="ক্যাটাগরি শিরোনাম" />
          <TextField form={form} set={set} field="sec_categories_subtitle" label="ক্যাটাগরি সাবটাইটেল" />
          <TextField form={form} set={set} field="sec_best_title" label="বেস্ট সেলিং শিরোনাম" />
          <TextField form={form} set={set} field="sec_best_subtitle" label="বেস্ট সেলিং সাবটাইটেল" />
          <TextField form={form} set={set} field="sec_suggested_title" label="সাজেস্টেড শিরোনাম" />
          <TextField form={form} set={set} field="sec_suggested_subtitle" label="সাজেস্টেড সাবটাইটেল" />
          <TextField form={form} set={set} field="sec_all_title" label="সব প্রোডাক্ট শিরোনাম" />
          <TextField form={form} set={set} field="sec_all_subtitle" label="সব প্রোডাক্ট সাবটাইটেল" />
          <TextField form={form} set={set} field="sec_testimonials_title" label="রিভিউ শিরোনাম" />
          <TextField form={form} set={set} field="sec_testimonials_subtitle" label="রিভিউ সাবটাইটেল" />
          <TextField form={form} set={set} field="sec_proof_title" label="অর্ডার প্রুফ শিরোনাম" />
          <TextField form={form} set={set} field="sec_proof_subtitle" label="অর্ডার প্রুফ সাবটাইটেল" />
        </FieldGroup>
      </div>
      <Button disabled={busy} className="mt-5 rounded-full px-6" onClick={() => void save()}>
        {busy ? "সেভ হচ্ছে..." : "সেভ করুন"}
      </Button>
    </AdminCard>
  );
}

/* ইনলাইন এডিটেবল সেল — ফোকাস সরালে সেভ হয় */
function Cell({
  value,
  onSave,
  type = "text",
}: {
  value: string;
  onSave: (v: string) => void;
  type?: string;
}) {
  const [draft, setDraft] = useState(value);
  const [focused, setFocused] = useState(false);
  return (
    <Input
      type={type}
      className="h-8 text-sm"
      value={focused ? draft : value}
      onFocus={() => {
        setDraft(value);
        setFocused(true);
      }}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={() => {
        setFocused(false);
        if (draft !== value) onSave(draft);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
    />
  );
}
