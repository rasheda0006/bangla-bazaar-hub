import { createFileRoute } from "@tanstack/react-router";

import { AdminCard, AdminPage } from "@/components/admin/AdminPage";
import { ImageField } from "@/components/admin/ImageField";
import {
  AreaField,
  ColorField,
  FieldGroup,
  TextField,
  ToggleField,
  useSettingsForm,
} from "@/components/admin/settings-form";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  const { form, set, save, busy } = useSettingsForm();

  if (!form) {
    return (
      <AdminPage title="সেটিংস">
        <p className="text-sm text-muted-foreground">লোড হচ্ছে...</p>
      </AdminPage>
    );
  }

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
          <TabsTrigger value="headfoot" className="rounded-full">হেডার ও ফুটার</TabsTrigger>
          <TabsTrigger value="payment" className="rounded-full">পেমেন্ট</TabsTrigger>
          <TabsTrigger value="seo" className="rounded-full">SEO</TabsTrigger>
          <TabsTrigger value="tracking" className="rounded-full">ট্র্যাকিং</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <AdminCard className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField form={form} set={set} field="site_name" label="সাইটের নাম" />
              <TextField form={form} set={set} field="site_tagline" label="ট্যাগলাইন" />
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
              <TextField form={form} set={set} field="phone" label="ফোন" />
              <TextField form={form} set={set} field="email" label="ইমেইল" />
              <TextField form={form} set={set} field="whatsapp" label="হোয়াটসঅ্যাপ" />
              <TextField form={form} set={set} field="address" label="ঠিকানা" />
              <TextField form={form} set={set} field="facebook_url" label="ফেসবুক লিংক" />
              <TextField form={form} set={set} field="instagram_url" label="ইনস্টাগ্রাম লিংক" />
              <TextField form={form} set={set} field="youtube_url" label="ইউটিউব লিংক" />
              <TextField form={form} set={set} field="tiktok_url" label="টিকটক লিংক" />
            </div>
          </AdminCard>
        </TabsContent>

        <TabsContent value="headfoot">
          <AdminCard className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <FieldGroup title="হেডার">
                <ColorField form={form} set={set} field="header_bg_color" label="হেডার ব্যাকগ্রাউন্ড" />
                <ColorField
                  form={form}
                  set={set}
                  field="header_text_color"
                  label="হেডার টেক্সট কালার"
                  fallback="#0f172a"
                />
                <div className="sm:col-span-2">
                  <ToggleField
                    form={form}
                    set={set}
                    field="header_show_search"
                    label="হেডারে সার্চ দেখান"
                  />
                </div>
              </FieldGroup>

              <FieldGroup title="ফুটার">
                <ColorField
                  form={form}
                  set={set}
                  field="footer_bg_color"
                  label="ফুটার ব্যাকগ্রাউন্ড"
                  fallback="#f3f5f7"
                />
                <ColorField
                  form={form}
                  set={set}
                  field="footer_text_color"
                  label="ফুটার টেক্সট কালার"
                  fallback="#0f172a"
                />
                <AreaField form={form} set={set} field="footer_about" label="ফুটার সম্পর্কে টেক্সট" />
                <TextField form={form} set={set} field="footer_links_title" label="লিংক কলামের শিরোনাম" />
                <TextField form={form} set={set} field="footer_contact_title" label="যোগাযোগ কলামের শিরোনাম" />
                <AreaField form={form} set={set} field="footer_copyright" label="কপিরাইট টেক্সট" rows={2} />
              </FieldGroup>
            </div>
          </AdminCard>
        </TabsContent>

        <TabsContent value="payment">
          <AdminCard className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField form={form} set={set} field="bkash_number" label="বিকাশ নম্বর" />
              <ToggleField form={form} set={set} field="bkash_enabled" label="বিকাশ চালু" />
              <TextField form={form} set={set} field="nagad_number" label="নগদ নম্বর" />
              <ToggleField form={form} set={set} field="nagad_enabled" label="নগদ চালু" />
              <TextField form={form} set={set} field="rocket_number" label="রকেট নম্বর" />
              <ToggleField form={form} set={set} field="rocket_enabled" label="রকেট চালু" />
              <AreaField
                form={form}
                set={set}
                field="payment_instructions"
                label="পেমেন্ট নির্দেশনা (চেকআউট পেজে দেখাবে)"
                rows={4}
              />
            </div>
          </AdminCard>
        </TabsContent>

        <TabsContent value="seo">
          <AdminCard className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField form={form} set={set} field="meta_title" label="মেটা টাইটেল" />
              <AreaField form={form} set={set} field="meta_description" label="মেটা ডেসক্রিপশন" />
              <div className="sm:col-span-2">
                <ImageField
                  label="OG ইমেজ (সোশ্যাল শেয়ার প্রিভিউ, ১২০০×৬৩০)"
                  value={form.og_image_url ?? ""}
                  onChange={(url) => set("og_image_url", url || null)}
                />
              </div>
              <AreaField
                form={form}
                set={set}
                field="og_description"
                label="OG ডেসক্রিপশন (শেয়ার করলে যা দেখাবে)"
              />
            </div>
          </AdminCard>
        </TabsContent>

        <TabsContent value="tracking">
          <AdminCard className="mt-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <ToggleField
                  form={form}
                  set={set}
                  field="tracking_enabled"
                  label="ট্র্যাকিং চালু (সব পিক্সেল ও অ্যানালিটিকস)"
                />
              </div>

              <FieldGroup title="মেটা (ফেসবুক)">
                <TextField form={form} set={set} field="fb_pixel_id" label="মেটা পিক্সেল আইডি" placeholder="1234567890" />
                <ToggleField form={form} set={set} field="fb_capi_enabled" label="Conversions API (CAPI) চালু" />
                <TextField
                  form={form}
                  set={set}
                  field="fb_capi_access_token"
                  label="CAPI অ্যাক্সেস টোকেন"
                  placeholder="EAAG..."
                />
                <TextField
                  form={form}
                  set={set}
                  field="fb_test_event_code"
                  label="CAPI টেস্ট ইভেন্ট কোড (ঐচ্ছিক)"
                  placeholder="TEST12345"
                />
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  ব্রাউজার পিক্সেল ও সার্ভার ইভেন্ট একই <code>event_id</code> দিয়ে ডিডুপ্লিকেট হয়।
                </p>
              </FieldGroup>

              <FieldGroup title="গুগল">
                <TextField form={form} set={set} field="ga4_id" label="GA4 মেজারমেন্ট আইডি" placeholder="G-XXXXXXXXXX" />
                <TextField form={form} set={set} field="gtm_id" label="গুগল ট্যাগ ম্যানেজার আইডি" placeholder="GTM-XXXXXXX" />
                <TextField form={form} set={set} field="google_ads_id" label="গুগল অ্যাডস আইডি" placeholder="AW-123456789" />
                <TextField
                  form={form}
                  set={set}
                  field="google_ads_conversion_label"
                  label="অ্যাডস কনভার্সন লেবেল"
                  placeholder="AbC-D_efGh"
                />
                <TextField form={form} set={set} field="ga_id" label="পুরনো UA আইডি (ঐচ্ছিক)" placeholder="UA-XXXXXX-X" />
              </FieldGroup>

              <FieldGroup title="অন্যান্য">
                <TextField form={form} set={set} field="tiktok_pixel_id" label="টিকটক পিক্সেল আইডি" />
                <TextField form={form} set={set} field="clarity_id" label="মাইক্রোসফট ক্ল্যারিটি আইডি" />
                <p className="text-xs text-muted-foreground sm:col-span-2">
                  ট্র্যাক হওয়া ইভেন্ট: PageView, ViewContent, AddToCart, InitiateCheckout, Purchase।
                  অ্যাডমিন প্যানেলে কোনো ট্র্যাকিং চলে না।
                </p>
              </FieldGroup>
            </div>
          </AdminCard>
        </TabsContent>
      </Tabs>
    </AdminPage>
  );
}
