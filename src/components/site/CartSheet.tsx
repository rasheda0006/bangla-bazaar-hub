import { Link } from "@tanstack/react-router";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { createContext, useContext, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart";
import { cdnImage, taka, toBn } from "@/lib/format";

type CartSheetValue = { open: boolean; setOpen: (v: boolean) => void; toggle: () => void };
const CartSheetContext = createContext<CartSheetValue | null>(null);

export function useCartSheet(): CartSheetValue {
  const ctx = useContext(CartSheetContext);
  if (!ctx) throw new Error("useCartSheet must be used inside CartSheetProvider");
  return ctx;
}

export function CartSheetProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const value = useMemo<CartSheetValue>(
    () => ({ open, setOpen, toggle: () => setOpen((v) => !v) }),
    [open],
  );

  return (
    <CartSheetContext.Provider value={value}>
      {children}
      <CartSheet />
    </CartSheetContext.Provider>
  );
}

function CartSheet() {
  const { open, setOpen } = useCartSheet();
  const { items, subtotal, setQty, remove } = useCart();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border px-4 py-4">
          <SheetTitle className="font-display text-lg">আপনার কার্ট</SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
            <span className="grid h-16 w-16 place-items-center rounded-full bg-secondary">
              <ShoppingBag className="h-7 w-7 text-primary" />
            </span>
            <p className="font-semibold">আপনার কার্ট খালি</p>
            <Button asChild className="rounded-full px-6" onClick={() => setOpen(false)}>
              <Link to="/shop">কেনাকাটা শুরু করুন</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 rounded-xl border border-border bg-card p-2.5"
                >
                  <img
                    src={cdnImage(item.image ?? "", 128)}
                    width={64}
                    height={64}
                    loading="lazy"
                    decoding="async"
                    alt={item.title}
                    className="h-16 w-16 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm font-bold text-primary">{taka(item.price)}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        aria-label="কমান"
                        onClick={() => setQty(item.id, item.qty - 1)}
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="min-w-6 text-center text-sm font-semibold">
                        {toBn(item.qty)}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        aria-label="বাড়ান"
                        onClick={() => setQty(item.id, item.qty + 1)}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="ml-auto h-7 w-7 text-destructive"
                        aria-label="মুছুন"
                        onClick={() => remove(item.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-4 py-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">সাবটোটাল</span>
                <span className="font-display text-lg font-bold text-primary">
                  {taka(subtotal)}
                </span>
              </div>
              <Button asChild className="w-full rounded-full" onClick={() => setOpen(false)}>
                <Link to="/checkout">চেকআউট করুন</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
