import { Link } from "@tanstack/react-router";
import { Home, LayoutGrid, ShoppingBag, Store } from "lucide-react";

import { useCartSheet } from "./CartSheet";
import { useCart } from "@/lib/cart";
import { toBn } from "@/lib/format";

const ITEMS = [
  { to: "/", label: "হোম", icon: Home, exact: true },
  { to: "/categories", label: "ক্যাটাগরি", icon: LayoutGrid, exact: false },
  { to: "/shop", label: "শপ", icon: Store, exact: false },
] as const;

export function BottomNav() {
  const { count } = useCart();
  const { setOpen } = useCartSheet();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg md:hidden">
      <div className="grid grid-cols-4">
        {ITEMS.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            activeOptions={{ exact: item.exact }}
            className="flex flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground [&.active]:text-primary"
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative flex flex-col items-center gap-1 py-2 text-[11px] font-medium text-muted-foreground"
        >
          <span className="relative">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 ? (
              <span className="absolute -right-2 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">
                {toBn(count)}
              </span>
            ) : null}
          </span>
          কার্ট
        </button>
      </div>
    </nav>
  );
}
