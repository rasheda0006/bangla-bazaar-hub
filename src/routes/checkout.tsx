import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, CheckCircle2, Clock, Copy, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/lib/cart";
import { track } from "@/lib/tracking";
import { useSettings, usePaymentMethods } from "@/lib/data";
import { placeOrder as submitOrder } from "@/lib/orders";
import { PAYMENT_METHODS, taka, toBn } from "@/lib/format";
import { cn } from "@/lib/utils";
import { createZiniPayInvoice } from "@/lib/zinipay.functions";

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

type MethodOption = { value: string; label: string; color?: string };

function CheckoutPage() {
  const { items, subtotal, clear } = useCart();
  const { data: settings } = useSettings();
  const { data: payMethods = [] } = usePaymentMethods();
  const navigate = useNavigate();
  const startOnlinePayment = useServerFn(createZiniPayInvoice);

  const [form, setForm] = useState({
    customer_name: "",
    email: "",
    phone: "",
    sender_number: "",
    transaction_id: "",
  });
  const [open, setOpen] = useState(false);
  const [method, setMethod] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
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

  const enabled: MethodOption[] = payMethods.length
    ? payMethods
        .filter((m) => m.is_active)
        .map((m) => ({ value: m.code, label: m.label, color: m.color }))
    : PAYMENT_METHODS.map((m) => ({ value: m.value, label: m.label }));

  const active = payMethods.find((m) => m.code === method);
  const isOnline = method === "zinipay";
  const instructions = active?.instructions || (isOnline ? "" : settings?.payment_instructions || "");
  const accent = active?.color || "hsl(var(--primary))";

  const set = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const openPayment = () => {
    if (!items.length) {
      toast.error("আপনার কার্ট খালি");
      return;
    }
    if (!form.customer_name.trim()) {
      toast.error("আপনার নাম লিখুন");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
      toast.error("সঠিক ইমেইল দিন");
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(form.phone.trim())) {
      toast.error("সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন");
      return;
    }
    setMethod(null);
    setOpen(true);
  };

  const runOnlinePayment = async () => {
    setSaving(true);
    try {
      track("InitiateCheckout", {
        value: subtotal,
        contents: items.map((i) => ({ id: i.id, quantity: i.qty })),
      });
      const res = await startOnlinePayment({
        data: {
          customer_name: form.customer_name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          items: items.map((i) => ({ id: i.id, qty: i.qty })),
          origin: window.location.origin,
        },
      });
      window.location.href = res.payment_url;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(msg || "পেমেন্ট শুরু করা যায়নি, আবার চেষ্টা করুন");
      setSaving(false);
    }
  };

  const selectMethod = (code: string) => {
    setMethod(code);
    if (code === "zinipay") void runOnlinePayment();
  };

  const verifyManual = async () => {
    if (!method) return;
    if (form.transaction_id.trim().length < 4) {
      toast.error("সঠিক ট্রানজেকশন আইডি দিন");
      return;
    }
    if (!/^01[3-9]\d{8}$/.test(form.sender_number.trim())) {
      toast.error("যে নম্বর থেকে পাঠিয়েছেন সেটি সঠিকভাবে দিন");
      return;
    }
    setSaving(true);
    setOpen(false);
    setCountdown(5);
    const timer = window.setInterval(() => {
      setCountdown((c) => (c === null ? null : Math.max(0, c - 1)));
    }, 1000);
    const wait = new Promise<void>((resolve) => window.setTimeout(resolve, 5000));
    try {
      const orderNo = await submitOrder({
        customer_name: form.customer_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        payment_method: method,
        transaction_id: form.transaction_id.trim(),
        sender_number: form.sender_number.trim(),
        items: items.map((i) => ({ id: i.id, qty: i.qty })),
      });
      track("Purchase", {
        value: subtotal,
        contents: items.map((i) => ({ id: i.id, quantity: i.qty })),
        email: form.email.trim(),
        phone: form.phone.trim(),
        extra: { transaction_id: String(orderNo) },
      });
      await wait;
      clear();
      setDone(orderNo);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      toast.error(msg ? `অর্ডার সাবমিট হয়নি: ${msg}` : "অর্ডার সাবমিট করা যায়নি, আবার চেষ্টা করুন");
      setOpen(true);
    } finally {
      window.clearInterval(timer);
      setCountdown(null);
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
            <div className="mt-4 flex items-center justify-center gap-2 rounded-full bg-warning/10 px-4 py-2 text-sm font-bold text-warning-foreground">
              <Clock className="h-4 w-4" />
              পেমেন্ট ভেরিফিকেশন পেন্ডিং
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              আপনার অর্ডার নম্বর <span className="font-bold text-primary">#{toBn(done)}</span>। আপনার
              ট্রানজেকশন আইডি ও সেন্ডার নম্বর ম্যানুয়ালি যাচাই করা হচ্ছে। যাচাই সম্পন্ন হলে ইমেইলে
              ডিজিটাল প্রোডাক্টের অ্যাক্সেস/ডাউনলোড লিংক পাঠিয়ে দেওয়া হবে।
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
      {countdown !== null ? (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/85 backdrop-blur-sm px-4">
          <div className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 text-center shadow-lift">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
            <h2 className="mt-4 font-display text-lg font-bold">পেমেন্ট যাচাই করা হচ্ছে…</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              আপনার ট্রানজেকশন আইডি ও সেন্ডার নম্বর মিলিয়ে দেখা হচ্ছে
            </p>
            <p className="mt-4 font-display text-4xl font-extrabold text-primary">
              {toBn(countdown)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">সেকেন্ড অপেক্ষা করুন</p>
          </div>
        </div>
      ) : null}

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
          <div className="mx-auto min-w-0 max-w-2xl">
            <section className="min-w-0 overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-soft sm:p-6">
              <h2 className="font-display text-lg font-bold">আপনার তথ্য</h2>
              <p className="mt-1 break-words text-xs text-muted-foreground">
                সব প্রোডাক্ট ডিজিটাল — কোনো ঠিকানা লাগবে না, অ্যাক্সেস ইমেইলে পাঠানো হবে।
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <Field label="আপনার নাম" required>
                  <Input
                    value={form.customer_name}
                    onChange={(e) => set("customer_name", e.target.value)}
                    placeholder="যেমন: রহিম উদ্দিন"
                  />
                </Field>
                <Field label="ইমেইল" required>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="you@example.com"
                  />
                </Field>
                <Field label="মোবাইল নম্বর" required>
                  <Input
                    inputMode="numeric"
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    placeholder="01XXXXXXXXX"
                  />
                </Field>
              </div>

              <div className="mt-6 border-t border-border pt-5">
                <h3 className="font-display text-base font-bold">অর্ডার সামারি</h3>
                <ul className="mt-3 space-y-2">
                  {items.map((i) => (
                    <li key={i.id} className="flex gap-3 text-sm">
                      <span className="min-w-0 flex-1 truncate">
                        {i.title} × {toBn(i.qty)}
                      </span>
                      <span className="shrink-0 font-semibold">{taka(i.price * i.qty)}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-3 flex justify-between border-t border-border pt-3">
                  <span className="font-bold">সর্বমোট</span>
                  <span className="font-display font-extrabold text-primary">{taka(subtotal)}</span>
                </div>
              </div>

              <Button
                type="button"
                size="lg"
                disabled={saving}
                onClick={openPayment}
                className="mt-6 w-full rounded-full"
              >
                পেমেন্ট করুন · {taka(subtotal)}
              </Button>
            </section>
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={(v) => !saving && setOpen(v)}>
        <DialogContent
          className="max-w-md gap-0 overflow-hidden rounded-2xl border-none bg-secondary/40 p-0 [&>button]:hidden"
        >
          <div className="flex items-center justify-between rounded-b-2xl bg-card px-4 py-3 shadow-soft">
            <button
              type="button"
              aria-label="পেছনে"
              onClick={() => (method ? setMethod(null) : setOpen(false))}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <span className="font-display text-sm font-bold">পেমেন্ট</span>
            <button
              type="button"
              aria-label="বন্ধ"
              onClick={() => setOpen(false)}
              className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-secondary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {!method ? (
            <div className="px-4 pb-5 pt-4">
              <div className="text-center">
                <p className="font-display text-lg font-bold">{settings?.site_name || "পেমেন্ট"}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  পেমেন্ট মাধ্যম বেছে নিন
                </p>
              </div>
              <div className="mt-4 rounded-xl bg-primary px-4 py-3 text-center font-bold text-primary-foreground">
                মোবাইল ব্যাংকিং ও অনলাইন
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {enabled.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    disabled={saving}
                    onClick={() => selectMethod(m.value)}
                    className="flex h-20 items-center justify-center rounded-xl border border-border bg-card px-3 text-center text-sm font-bold shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift disabled:opacity-60"
                    style={m.color ? { color: m.color } : undefined}
                  >
                    {m.value === "zinipay" && saving ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      m.label
                    )}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-xl bg-primary/10 py-3 text-center font-display text-lg font-extrabold text-primary">
                পরিশোধ {taka(subtotal)}
              </div>
            </div>
          ) : isOnline ? (
            <div className="px-6 py-10 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-sm text-muted-foreground">
                নিরাপদ ZiniPay পেমেন্ট পেজে নেওয়া হচ্ছে…
              </p>
            </div>
          ) : (
            <div className="px-4 pb-5 pt-4">
              <div className="flex items-center justify-between rounded-xl bg-card px-4 py-3 shadow-soft">
                <span className="font-display text-base font-bold" style={{ color: accent }}>
                  {active?.label || method}
                </span>
                <span className="font-display text-lg font-extrabold">{taka(subtotal)}</span>
              </div>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                নোটঃ টাকা পাঠানোর ৫-১০ সেকেন্ড পর ভেরিফাই করবেন।
              </p>

              <div
                className="mt-3 rounded-2xl p-4 text-primary-foreground"
                style={{ backgroundColor: accent }}
              >
                <p className="text-center font-display text-sm font-bold">
                  ট্রানজেকশন আইডি দিন
                </p>
                <Input
                  value={form.transaction_id}
                  onChange={(e) => set("transaction_id", e.target.value)}
                  placeholder="ট্রানজেকশন আইডি দিন"
                  className="mt-3 border-none bg-card text-center text-foreground"
                />
                <Input
                  inputMode="numeric"
                  value={form.sender_number}
                  onChange={(e) => set("sender_number", e.target.value)}
                  placeholder="যে নম্বর থেকে পাঠিয়েছেন"
                  className="mt-2 border-none bg-card text-center text-foreground"
                />

                {active?.number ? (
                  <div className="mt-4 flex items-center justify-between gap-3 rounded-xl bg-white/15 px-3 py-2 text-sm">
                    <span className="font-bold">{active.number}</span>
                    <button
                      type="button"
                      onClick={() => {
                        void navigator.clipboard.writeText(active.number || "");
                        toast.success("নম্বর কপি হয়েছে");
                      }}
                      className="flex items-center gap-1 rounded-md bg-foreground/20 px-2 py-1 text-xs font-bold"
                    >
                      <Copy className="h-3.5 w-3.5" /> কপি
                    </button>
                  </div>
                ) : null}

                {instructions ? (
                  <div className="mt-3 whitespace-pre-line border-t border-white/25 pt-3 text-xs leading-relaxed opacity-95">
                    {instructions}
                  </div>
                ) : null}
              </div>

              <Button
                type="button"
                size="lg"
                disabled={saving}
                onClick={() => void verifyManual()}
                className={cn("mt-4 w-full rounded-xl font-bold")}
                style={{ backgroundColor: accent }}
              >
                {saving ? "যাচাই করা হচ্ছে…" : "ভেরিফাই ট্রানজেকশন"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
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
