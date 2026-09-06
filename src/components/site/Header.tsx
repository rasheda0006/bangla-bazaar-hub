import { Link, useNavigate } from "@tanstack/react-router";
import { Search, ShoppingBag, Store } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartSheet } from "./CartSheet";
import { useCart } from "@/lib/cart";
import { toBn } from "@/lib/format";
import { useSettings } from "@/lib/data";

const NAV = [
  { to: "/", label: "হোম" },
  { to: "/shop", label: "শপ" },
  { to: "/categories", label: "ক্যাটাগরি" },
] as const;

export function Header() {
  const { data: settings } = useSettings();
  const { count } = useCart();
  const { setOpen: setCartOpen } = useCartSheet();
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  const submitSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const q = term.trim();
    if (!q) return;
    setSearchOpen(false);
    void navigate({ to: "/shop", search: { q } });
  };

  const headerStyle = {
    backgroundColor: settings?.header_bg_color || undefined,
    color: settings?.header_text_color || undefined,
  } as React.CSSProperties;

  return (
    <header
      style={headerStyle}
      className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-lg"
    >
      <div className="container-page grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          {settings?.logo_url ? (
            <img
              src={cdnImage(settings.logo_url, 96)}
              width={36}
              height={36}
              loading="eager"
              decoding="async"
              alt={settings.site_name}
              className="h-9 w-9 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Store className="h-5 w-5" />
            </span>
          )}
          <span className="hidden truncate font-display text-lg font-bold md:inline">
            {settings?.site_name ?? "আমার দোকান"}
          </span>
        </Link>

        <span className="truncate text-center font-display text-lg font-bold md:hidden">
          {settings?.site_name ?? "আমার দোকান"}
        </span>

        <nav className="hidden items-center justify-center gap-1 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground [&.active]:bg-secondary [&.active]:text-primary"
              activeOptions={{ exact: item.to === "/" }}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1">
          {settings?.header_show_search !== false ? (
            <form onSubmit={submitSearch} className="hidden items-center gap-2 md:flex">
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="প্রোডাক্ট খুঁজুন..."
                aria-label="প্রোডাক্ট সার্চ"
                className="h-9 w-44 rounded-full lg:w-56"
              />
              <Button type="submit" variant="ghost" size="icon" aria-label="সার্চ করুন">
                <Search className="h-5 w-5" />
              </Button>
            </form>
          ) : null}

          {settings?.header_show_search !== false ? (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              aria-label="সার্চ"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <Search className="h-5 w-5" />
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            className="relative"
            aria-label="কার্ট"
            onClick={() => setCartOpen(true)}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {toBn(count)}
              </span>
            ) : null}
          </Button>
        </div>
      </div>

      {searchOpen && settings?.header_show_search !== false ? (
        <form onSubmit={submitSearch} className="container-page pb-3 md:hidden">
          <Input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="প্রোডাক্ট খুঁজুন..."
            aria-label="প্রোডাক্ট সার্চ"
            className="h-10 rounded-full"
          />
        </form>
      ) : null}
    </header>
  );
}
