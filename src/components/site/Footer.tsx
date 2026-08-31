import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Mail, MapPin, MessageCircle, Music2, Phone, Store, Youtube } from "lucide-react";

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

  const socials = [
    { url: s?.facebook_url, label: "ফেসবুক", Icon: Facebook },
    { url: s?.instagram_url, label: "ইনস্টাগ্রাম", Icon: Instagram },
    { url: s?.youtube_url, label: "ইউটিউব", Icon: Youtube },
    { url: s?.tiktok_url, label: "টিকটক", Icon: Music2 },
  ].filter((x) => Boolean(x.url));

  const footerStyle = {
    backgroundColor: s?.footer_bg_color || undefined,
    color: s?.footer_text_color || undefined,
  } as React.CSSProperties;

  return (
    <footer style={footerStyle} className="mt-16 border-t border-border bg-secondary/40">
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
          <p className="max-w-xs text-sm opacity-80">
            {s?.footer_about || s?.site_tagline || "বাংলাদেশের সেরা ডিজিটাল প্রোডাক্ট স্টোর"}
          </p>
          <div className="flex items-center gap-2">
            {socials.map(({ url, label, Icon }) => (
              <a
                key={label}
                href={url as string}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="grid h-9 w-9 place-items-center rounded-full bg-background text-muted-foreground shadow-soft transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="mb-4 font-display text-base font-bold">
            {s?.footer_links_title || "দ্রুত লিংক"}
          </h4>
          <ul className="space-y-2 text-sm">
            {LINKS.map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="opacity-80 transition-opacity hover:opacity-100">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-4 font-display text-base font-bold">
            {s?.footer_contact_title || "যোগাযোগ"}
          </h4>
          <ul className="space-y-3 text-sm opacity-85">
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

      <div className="border-t border-border py-4 text-center text-xs opacity-75">
        {s?.footer_copyright || `© ${year} ${s?.site_name ?? "আমার দোকান"} — সর্বস্বত্ব সংরক্ষিত`}
      </div>
    </footer>
  );
}
