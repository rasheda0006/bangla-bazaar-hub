import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart";
import { track } from "@/lib/tracking";
import { useSettings } from "@/lib/data";
import { placeOrder as submitOrder } from "@/lib/orders.functions";
import { PAYMENT_METHODS, taka, toBn } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "চেকআউট — অর্ডার সম্পন্ন করুন | আমার দোকান" },
      {
        name: "description",
        content: "বিকাশ, নগদ বা রকেটে পেমেন্ট করে সহজে অর্ডার সম্পন্ন করুন।",
      },
      { property: "og:title", content: "চেকআউট — অর্ডার সম্পন্ন করুন | আমার দোকান" },
      { property: "og:description", content: "বিকাশ, নগদ বা রকেটে পেমেন্ট করে অর্ডার করুন।" },
    ],
  }),
  component: CheckoutPage,
});

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { data: settings } = useSettings();
  const navigate = useNavigate();

  const [method, setMethod] = useState<string>("bkash");
  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    phone: "",
    sender_number: "",
    transaction_id: "",
  });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState<number | null>(null);
  const checkoutTracked = useRef(false);

  useEffect(() => {
    if (checkoutTracked.current || items.length === 0) return;
    checkoutTracked.current = true;
    track("InitiateCheckout", {
      value: subtotal,
      contents: items.map((i) => ({ id: i.id, quantity: i.qty })),
    });
  }, [items, subtotal]);

  const enabled = PAYMENT_METHODS.filter((m) => {
    if (!settings) return true;
    if (m.value === "bkash") return settings.bkash_enabled;
    if (m.value === "nagad") return settings.nagad_enabled;
    return settings.rocket_enabled;
  });

  const payNumber =
    method === "bkash"
      ? settings?.bkash_number
      : method === "nagad"
        ? settings?.nagad_number
        : settings?.rocket_number;

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!items.length) {
      toast.error("আপনার কার্ট খালি");
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) {
      toast.error("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন");
      return;
    }
    if (form.transaction_id.trim().length < 4) {
      toast.error("সঠিক ট্রানজেকশন আইডি দিন");
      return;
    }
    setSaving(true);
    try {
      const result = await submitOrder({
        data: {
          customer_name: form.customer_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          payment_method: method as "bkash" | "nagad" | "rocket",
          transaction_id: form.transaction_id.trim(),
          sender_number: form.sender_number.trim(),
          items: items.map((i) => ({ id: i.id, title: i.title, price: i.price, qty: i.qty })),
        },
      });
      track("Purchase", {
        value: subtotal,
        contents: items.map((i) => ({ id: i.id, quantity: i.qty })),
        email: form.email.trim(),
        phone: form.phone.trim(),
        extra: { transaction_id: String(result.order_no) },
      });
      clear();
      setDone(result.order_no);
    } catch {
      toast.error("অর্ডার সাবমিট করা যায়নি, আবার চেষ্টা করুন");
    } finally {
      setSaving(false);
    }
  };

  if (done !== null) {
    return (
      <SiteLayout>
        <div className="container-page py-12 sm:py-20">
          <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-6 text-center shadow-lift sm:p-8">
            <CheckCircle2 className="mx-auto h-16 w-16 text-success" />
            <h1 className="mt-4 font-display text-2xl font-bold">অর্ডার সফল হয়েছে!</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              আপনার অর্ডার নম্বর <span className="font-bold text-primary">#{toBn(done)}</span>। আমরা
              পেমেন্ট যাচাই করে আপনার ইমেইলে ডিজিটাল প্রোডাক্টের অ্যাক্সেস/ডাউনলোড লিংক পাঠিয়ে দেবো।
            </p>
            <Button
              className="mt-6 rounded-full px-8"
              onClick={() => void navigate({ to: "/shop" })}
            >
              আরও কেনাকাটা করুন
            </Button>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <div className="container-page py-6 sm:py-10">
        <h1 className="mb-6 text-center font-display text-2xl font-bold sm:mb-8 sm:text-4xl">চেকআউট</h1>

        {items.length === 0 ? (
          <div className="mx-auto max-w-md rounded-2xl border border-dashed border-border bg-muted/40 py-16 text-center">
            <p className="text-sm text-muted-foreground">চেকআউট করতে কার্টে ডিজিটাল প্রোডাক্ট যোগ করুন</p>
            <Button asChild className="mt-5 rounded-full px-8">
              <Link to="/shop">শপে যান</Link>
            </Button>
          </div>
        ) : (
          <form
            onSubmit={submit}
            className="grid min-w-0 grid-cols-1 gap-5 sm:gap-8 lg:grid-cols-[minmax(0,1fr)_340px]"
          >
            <div className="min-w-0 space-y-5 sm:space-y-6">
              <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
                <h2 className="font-display text-lg font-bold">আপনার তথ্য</h2>
                <p className="mt-1 break-words text-xs text-muted-foreground">
                  সব প্রোডাক্ট ডিজিটাল — কোনো ঠিকানা লাগবে না, অ্যাক্সেস ইমেইলে পাঠানো হবে।
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="আপনার নাম" required>
                    <Input
                      required
                      value={form.customer_name}
                      onChange={(e) => set("customer_name", e.target.value)}
                      placeholder="যেমন: রহিম উদ্দিন"
                    />
                  </Field>
                  <Field label="ইমেইল" required>
                    <Input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      placeholder="you@example.com"
                    />
                  </Field>
                  <Field label="মোবাইল নম্বর" required>
                    <Input
                      required
                      inputMode="numeric"
                      value={form.phone}
                      onChange={(e) => set("phone", e.target.value)}
                      placeholder="01XXXXXXXXX"
                    />
                  </Field>
                </div>
              </section>

              <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
                <h2 className="font-display text-lg font-bold">পেমেন্ট মাধ্যম</h2>
                <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
                  {enabled.map((m) => (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => setMethod(m.value)}
                      className={cn(
                        "rounded-xl border-2 px-2 py-3 text-xs font-bold transition-all sm:px-4 sm:text-sm",
                        method === m.value
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-border hover:border-primary/40",
                      )}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>

                <div className="mt-5 min-w-0 rounded-xl bg-secondary/60 p-3 text-sm sm:p-4">
                  <p className="font-semibold">
                    নিচের নম্বরে <span className="text-primary">{taka(subtotal)}</span> সেন্ড মানি
                    করুন
                  </p>
                  <div className="mt-2 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                    <span className="min-w-0 truncate font-display text-lg font-extrabold tracking-wide sm:text-xl">
                      {toBn(payNumber ?? "—")}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-2 rounded-full"
                      onClick={() => {
                        void navigator.clipboard.writeText(payNumber ?? "");
                        toast.success("নম্বর কপি হয়েছে");
                      }}
                    >
                      <Copy className="h-3.5 w-3.5" />
                      কপি
                    </Button>
                  </div>
                  <p className="mt-2 break-words text-xs text-muted-foreground">
                    সেন্ড মানি করার পর ট্রানজেকশন আইডি ও যে নম্বর থেকে পাঠিয়েছেন তা নিচে লিখুন।
                  </p>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="যে নম্বর থেকে পাঠিয়েছেন" required>
                    <Input
                      required
                      inputMode="numeric"
                      value={form.sender_number}
                      onChange={(e) => set("sender_number", e.target.value)}
                      placeholder="01XXXXXXXXX"
                    />
                  </Field>
                  <Field label="ট্রানজেকশন আইডি" required>
                    <Input
                      required
                      value={form.transaction_id}
                      onChange={(e) => set("transaction_id", e.target.value)}
                      placeholder="যেমন: 9F7X2K1A"
                    />
                  </Field>
                </div>
              </section>
            </div>

            <aside className="min-w-0">
              <div className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6 lg:sticky lg:top-24">
                <h2 className="font-display text-lg font-bold">অর্ডার সামারি</h2>
                <ul className="mt-4 space-y-3">
                  {items.map((i) => (
                    <li key={i.id} className="flex gap-3 text-sm">
                      <span className="min-w-0 flex-1 truncate">
                        {i.title} × {toBn(i.qty)}
                      </span>
                      <span className="shrink-0 font-semibold">{taka(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-between border-t border-border pt-4">
                  <span className="font-bold">সর্বমোট</span>
                  <span className="font-display font-extrabold text-primary">{taka(subtotal)}</span>
                </div>
                <Button
                  type="submit"
                  size="lg"
                  disabled={saving}
                  className="mt-6 w-full rounded-full"
                >
                  {saving ? "অপেক্ষা করুন..." : "অর্ডার নিশ্চিত করুন"}
                </Button>
              </div>
            </aside>
          </form>
        )}
      </div>
    </SiteLayout>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label className="text-sm">
        {label} {required ? <span className="text-destructive">*</span> : null}
      </Label>
      {children}
    </div>
  );
}
