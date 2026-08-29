import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Phone, Store, Youtube } from "lucide-react";

import { useSettings } from "@/lib/data";
import { toBn } from "@/lib/format";

const LINKS = [
  { to: "/", label: "হোম" },
  { to: "/shop", label: "শপ" },
  { to: "/categories", label: "ক্যাটাগরি" },
  { to: "/cart", label: "কার্ট" },
  { to: "/checkout", label: "চেকআউট" },
] as const;

export function Footer() {
  const { data: s } = useSettings();
  const year = toBn(new Date().getFullYear());

  return (
    <footer className="mt-16 border-t border-border bg-secondary/40">
      <div className="container-page grid gap-10 py-12 text-center md:grid-cols-3">
        <div className="flex flex-col items-center gap-3">
          {s?.logo_url ? (
            <img src={s.logo_url} alt={s.site_name} className="h-14 w-14 rounded-2xl object-cover" />
          ) : (
            <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary text-primary-foreground">
              <Store className="h-7 w-7" />
            </span>
          )}
          <h3 className="font-display text-xl font-bold">{s?.site_name ?? "আমার দোকান"}</h3>
          <p className="max-w-xs text-sm text-muted-foreground">
            {s?.site_tagline ?? "বাংলাদেশের সেরা অনলাইন শপ"}
          </p>
          <div className="flex items-center gap-2">
            {s?.facebook_url ? (
              <a
                href={s.facebook_url}
                target="_blank"
                rel="noreferrer"
                aria-label="ফেসবুক"
                className="grid h-9 w-9 place-items-center rounded-full bg-background text-muted-foreground shadow-soft transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Facebook className="h-4 w-4" />
              </a>
            ) : null}
            {s?.instagram_url ? (
              <a
                href={s.instagram_url}
                target="_blank"
                rel="noreferrer"
                aria-label="ইনস্টাগ্রাম"
                className="grid h-9 w-9 place-items-center rounded-full bg-background text-muted-foreground shadow-soft transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Instagram className="h-4 w-4" />
              </a>
            ) : null}
            {s?.youtube_url ? (
              <a
                href={s.youtube_url}
                target="_blank"
                rel="noreferrer"
                aria-label="ইউটিউব"
                className="grid h-9 w-9 place-items-center rounded-full bg-background text-muted-foreground shadow-soft transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Youtube className="h-4 w-4" />
              </a>
            ) : null}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-display text-base font-bold">দ্রুত লিংক</h4>
          <ul className="space-y-2 text-sm">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className="text-muted-foreground transition-colors hover:text-primary"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-base font-bold">যোগাযোগ</h4>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-center justify-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-primary" />
              <span dir="ltr">{s?.phone ?? "—"}</span>
            </li>
            <li className="flex items-center justify-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-primary" />
              <span className="break-all">{s?.email ?? "—"}</span>
            </li>
            <li className="flex items-center justify-center gap-2">
              <MessageCircle className="h-4 w-4 shrink-0 text-primary" />
              <span dir="ltr">{s?.whatsapp ?? "—"}</span>
            </li>
            <li className="flex items-center justify-center gap-2">
              <MapPin className="h-4 w-4 shrink-0 text-primary" />
              <span>{s?.address ?? "—"}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border py-4 text-center text-xs text-muted-foreground">
        © {year} {s?.site_name ?? "আমার দোকান"} — সর্বস্বত্ব সংরক্ষিত
      </div>
    </footer>
  );
}
