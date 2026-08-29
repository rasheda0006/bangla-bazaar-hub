import { Link } from "@tanstack/react-router";
import { Menu, Search, ShoppingBag, Store } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur-lg">
      <div className="container-page grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-3">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.site_name}
              className="h-9 w-9 shrink-0 rounded-xl object-cover"
            />
          ) : (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Store className="h-5 w-5" />
            </span>
          )}
          <span className="truncate font-display text-lg font-bold">
            {settings?.site_name ?? "আমার দোকান"}
          </span>
        </Link>

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
          <Button asChild variant="ghost" size="icon" className="hidden md:inline-flex">
            <Link to="/shop" aria-label="ডিজিটাল প্রোডাক্ট খুঁজুন">
              <Search className="h-5 w-5" />
            </Link>
          </Button>

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

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden" aria-label="মেনু">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="mt-8 flex flex-col gap-1">
                {NAV.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="rounded-xl px-4 py-3 text-sm font-medium transition-colors hover:bg-secondary [&.active]:bg-secondary [&.active]:text-primary"
                    activeOptions={{ exact: item.to === "/" }}
                  >
                    {item.label}
                  </Link>
                ))}
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary"
                >
                  এডমিন প্যানেল
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
