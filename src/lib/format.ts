const BN_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

/** ইংরেজি সংখ্যাকে বাংলা সংখ্যায় রূপান্তর */
export function toBn(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)] ?? d);
}

/** টাকার অঙ্ক বাংলায় ফরম্যাট */
export function taka(value: number | string | null | undefined): string {
  const n = Number(value ?? 0);
  return `৳ ${toBn(n.toLocaleString("en-US", { maximumFractionDigits: 0 }))}`;
}

export function bnDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  return toBn(
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" }),
  );
}

export function slugify(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}]+/gu, "-")
    .replace(/^-+|-+$/g, "");
  return base || `item-${Date.now()}`;
}

export function discountPercent(price: number, discount?: number | null): number | null {
  if (!discount || discount <= 0 || discount >= price) return null;
  return Math.round(((price - discount) / price) * 100);
}

export const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  pending: { label: "পেন্ডিং", className: "bg-warning/15 text-warning-foreground" },
  verified: { label: "ভেরিফাইড", className: "bg-primary/15 text-primary" },
  completed: { label: "সম্পন্ন", className: "bg-success/15 text-success" },
  cancelled: { label: "বাতিল", className: "bg-destructive/15 text-destructive" },
};

export const PAYMENT_METHODS = [
  { value: "bkash", label: "বিকাশ", color: "#e2136e" },
  { value: "nagad", label: "নগদ", color: "#f6921e" },
  { value: "rocket", label: "রকেট", color: "#8c3494" },
] as const;

/** ইমেজ CDN অপ্টিমাইজেশন — সাপোর্টেড হোস্টে রিসাইজ/কমপ্রেস প্যারামিটার যোগ করে */
export function cdnImage(url: string | null | undefined, width = 600): string {
  if (!url) return "";
  try {
    const u = new URL(url);
    if (u.hostname.endsWith("unsplash.com")) {
      u.searchParams.set("auto", "format");
      u.searchParams.set("fit", "crop");
      u.searchParams.set("w", String(width));
      u.searchParams.set("q", "70");
      return u.toString();
    }
    if (u.hostname.endsWith("supabase.co") && u.pathname.includes("/storage/v1/object/public/")) {
      u.pathname = u.pathname.replace("/object/public/", "/render/image/public/");
      u.searchParams.set("width", String(width));
      u.searchParams.set("quality", "70");
      u.searchParams.set("resize", "cover");
      return u.toString();
    }
    return url;
  } catch {
    return url;
  }
}
