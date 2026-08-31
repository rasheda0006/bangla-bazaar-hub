import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { slugify } from "@/lib/format";

export type Category = {
  id: string;
  name: string;
  slug: string;
  image_url: string | null;
  sort_order: number;
};

export type Product = {
  id: string;
  title: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  price: number;
  discount_price: number | null;
  images: string[];
  category_id: string | null;
  is_best_selling: boolean;
  is_suggested: boolean;
  rating: number;
  review_count: number;
  stock: number;
  status: string;
  created_at: string;
};

export type HeroSlide = {
  id: string;
  image_url: string;
  heading: string | null;
  subheading: string | null;
  cta_text: string | null;
  cta_link: string | null;
  sort_order: number;
  is_active: boolean;
};

export type Testimonial = {
  id: string;
  name: string;
  avatar_url: string | null;
  rating: number;
  comment: string;
  sort_order: number;
};

export type Review = {
  id: string;
  product_id: string;
  name: string;
  avatar_url: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
};

export type Order = {
  id: string;
  order_no: number;
  customer_name: string;
  email: string;
  phone: string;
  payment_method: string;
  transaction_id: string;
  sender_number: string;
  items: { id: string; title: string; price: number; qty: number }[];
  total: number;
  status: string;
  created_at: string;
};

export type SiteSettings = {
  id: number;
  site_name: string;
  site_tagline: string;
  logo_url: string | null;
  favicon_url: string | null;
  phone: string | null;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  meta_title: string | null;
  meta_description: string | null;
  og_image_url: string | null;
  og_description: string | null;
  fb_pixel_id: string | null;
  ga_id: string | null;
  gtm_id: string | null;
  tracking_enabled: boolean;
  fb_capi_enabled: boolean;
  fb_capi_access_token: string | null;
  fb_test_event_code: string | null;
  ga4_id: string | null;
  google_ads_id: string | null;
  google_ads_conversion_label: string | null;
  tiktok_pixel_id: string | null;
  tiktok_url: string | null;
  clarity_id: string | null;
  bkash_number: string | null;
  nagad_number: string | null;
  rocket_number: string | null;
  bkash_enabled: boolean;
  nagad_enabled: boolean;
  rocket_enabled: boolean;
  payment_instructions: string | null;
  show_hero: boolean;
  show_categories: boolean;
  show_best_selling: boolean;
  show_all_products: boolean;
  show_suggested: boolean;
  show_testimonials: boolean;
  show_proofs: boolean;
  hero_height_mobile: number;
  hero_height_desktop: number;
  hero_bg_style: string;
  hero_bg_from: string;
  hero_bg_to: string;
  hero_max_width: number;
  hero_offer_image_url: string;
  hero_badge_text: string;
  hero_secondary_cta_text: string;
  hero_secondary_cta_link: string;
  hero_trust_text: string;
  hero_customers_text: string;
  hero_delivery_badge_text: string;
  header_bg_color: string;
  header_text_color: string;
  header_show_search: boolean;
  footer_bg_color: string;
  footer_text_color: string;
  footer_about: string | null;
  footer_links_title: string;
  footer_contact_title: string;
  footer_copyright: string | null;
  sec_categories_title: string;
  sec_categories_subtitle: string;
  sec_best_title: string;
  sec_best_subtitle: string;
  sec_suggested_title: string;
  sec_suggested_subtitle: string;
  sec_all_title: string;
  sec_all_subtitle: string;
  sec_testimonials_title: string;
  sec_testimonials_subtitle: string;
  sec_proof_title: string;
  sec_proof_subtitle: string;
};

export type ProofImage = {
  id: string;
  image_url: string;
  caption: string | null;
  sort_order: number;
};


const db = supabase as unknown as {
  from: (table: string) => any;
};

export function useSettings() {
  return useQuery({
    queryKey: ["site_settings"],
    queryFn: async (): Promise<SiteSettings | null> => {
      const { data, error } = await db.from("site_settings").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data as SiteSettings | null;
    },
    staleTime: 60_000,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<Category[]> => {
      const { data, error } = await db
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: async (): Promise<Product[]> => {
      const { data, error } = await db
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Product[];
    },
  });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value).normalize("NFC");
  } catch {
    return value.normalize("NFC");
  }
}

function legacySlugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
}

export function useProduct(idOrSlug: string) {
  return useQuery({
    queryKey: ["product", idOrSlug],
    queryFn: async (): Promise<Product | null> => {
      const key = safeDecode(idOrSlug ?? "");
      const column = UUID_RE.test(key) ? "id" : "slug";
      const { data, error } = await db
        .from("products")
        .select("*")
        .eq(column, key)
        .maybeSingle();
      if (error) throw error;
      if (data) return data as Product;

      if (column === "slug") {
        const { data: products, error: fallbackError } = await db
          .from("products")
          .select("*")
          .eq("status", "active");
        if (fallbackError) throw fallbackError;

        const normalizedKey = key.toLowerCase();
        const match = ((products ?? []) as Product[]).find((product: Product) => {
          const title = String(product.title ?? "");
          const slug = safeDecode(String(product.slug ?? "")).toLowerCase();
          return (
            slug === normalizedKey ||
            slugify(title).normalize("NFC") === normalizedKey ||
            legacySlugify(title).normalize("NFC") === normalizedKey
          );
        });
        return (match as Product | undefined) ?? null;
      }

      return null;
    },
    enabled: Boolean(idOrSlug),
  });
}

export function useProductReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ["reviews", productId],
    queryFn: async (): Promise<Review[]> => {
      const { data, error } = await db
        .from("reviews")
        .select("*")
        .eq("product_id", productId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Review[];
    },
    enabled: Boolean(productId),
  });
}

export function useHeroSlides() {
  return useQuery({
    queryKey: ["hero_slides"],
    queryFn: async (): Promise<HeroSlide[]> => {
      const { data, error } = await db
        .from("hero_slides")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as HeroSlide[];
    },
  });
}

export function useTestimonials() {
  return useQuery({
    queryKey: ["testimonials"],
    queryFn: async (): Promise<Testimonial[]> => {
      const { data, error } = await db
        .from("testimonials")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Testimonial[];
    },
  });
}

export function useProofImages() {
  return useQuery({
    queryKey: ["proof_images"],
    queryFn: async (): Promise<ProofImage[]> => {
      const { data, error } = await db
        .from("proof_images")
        .select("*")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as ProofImage[];
    },
  });
}


export function useOrders() {
  return useQuery({
    queryKey: ["orders"],
    queryFn: async (): Promise<Order[]> => {
      const { data, error } = await db
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Order[];
    },
  });
}

export { db };
