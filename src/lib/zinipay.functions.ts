import { createServerFn } from "@tanstack/react-start";

const ZINI_BASE = "https://api.zinipay.com";

type CartItem = { id: string; qty: number };

type CreateInput = {
  customer_name: string;
  email: string;
  phone: string;
  items: CartItem[];
  origin: string;
};

function sanitizeItems(items: unknown): CartItem[] {
  if (!Array.isArray(items)) return [];
  return items
    .map((i) => {
      const raw = i as { id?: unknown; qty?: unknown };
      return { id: String(raw.id ?? ""), qty: Math.max(1, Math.min(99, Number(raw.qty) || 1)) };
    })
    .filter((i) => i.id.length > 0);
}

/** ZiniPay ইনভয়েস তৈরি করে — দাম সবসময় ডাটাবেস থেকে নেওয়া হয়, ক্লায়েন্ট থেকে নয়। */
export const createZiniPayInvoice = createServerFn({ method: "POST" })
  .inputValidator((input: CreateInput) => input)
  .handler(async ({ data }) => {
    const apiKey = process.env["ZINIPAY_API_KEY"];
    if (!apiKey) throw new Error("অনলাইন পেমেন্ট এখনো কনফিগার করা হয়নি");

    const items = sanitizeItems(data.items);
    if (!items.length) throw new Error("কার্ট খালি");

    const name = String(data.customer_name ?? "").trim();
    const email = String(data.email ?? "").trim();
    const phone = String(data.phone ?? "").trim();
    if (!name || !email || !/^01[3-9]\d{8}$/.test(phone)) {
      throw new Error("সঠিক নাম, ইমেইল ও মোবাইল নম্বর দিন");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: products, error: prodError } = await supabaseAdmin
      .from("products")
      .select("id, title, price, discount_price, status")
      .in(
        "id",
        items.map((i) => i.id),
      );
    if (prodError) throw new Error(prodError.message);

    const lineItems = items
      .map((i) => {
        const p = (products ?? []).find((x) => x.id === i.id);
        if (!p || p.status !== "active") return null;
        const price = Number(p.discount_price ?? p.price);
        return { id: p.id, title: p.title, price, qty: i.qty };
      })
      .filter((x): x is { id: string; title: string; price: number; qty: number } => x !== null);

    if (!lineItems.length) throw new Error("প্রোডাক্ট পাওয়া যায়নি");

    const total = lineItems.reduce((sum, i) => sum + i.price * i.qty, 0);
    if (total <= 0) throw new Error("অর্ডারের পরিমাণ সঠিক নয়");

    const valId = `INV-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: name,
        email,
        phone,
        payment_method: "zinipay",
        transaction_id: "",
        sender_number: "",
        items: lineItems,
        total,
        status: "pending",
        payment_status: "pending",
        gateway: "zinipay",
        val_id: valId,
      })
      .select("id, order_no")
      .single();
    if (orderError) throw new Error(orderError.message);

    const origin = String(data.origin ?? "").replace(/\/+$/, "");

    const res = await fetch(`${ZINI_BASE}/v1/payment/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "zini-api-key": apiKey },
      body: JSON.stringify({
        cus_name: name,
        cus_email: email,
        amount: Number(total.toFixed(2)),
        metadata: { order_id: String(order.order_no), phone },
        redirect_url: `${origin}/payment/success?val_id=${valId}`,
        cancel_url: `${origin}/payment/cancel?val_id=${valId}`,
        val_id: valId,
        webhook_url: `${origin}/api/public/zinipay/webhook`,
      }),
    });

    const payload = (await res.json().catch(() => ({}))) as {
      status?: boolean;
      message?: string;
      payment_url?: string;
    };

    if (!res.ok || !payload.payment_url) {
      await supabaseAdmin
        .from("orders")
        .update({ payment_status: "failed", status: "cancelled" })
        .eq("id", order.id);
      throw new Error(payload.message || "পেমেন্ট শুরু করা যায়নি, আবার চেষ্টা করুন");
    }

    await supabaseAdmin
      .from("orders")
      .update({ payment_url: payload.payment_url })
      .eq("id", order.id);

    return { payment_url: payload.payment_url, val_id: valId, order_no: order.order_no, total };
  });

/** ZiniPay সার্ভারে পেমেন্ট যাচাই করে অর্ডার আপডেট করে। */
export const verifyZiniPayPayment = createServerFn({ method: "POST" })
  .inputValidator((input: { val_id: string }) => input)
  .handler(async ({ data }) => {
    const valId = String(data.val_id ?? "").trim();
    if (!valId) throw new Error("রেফারেন্স পাওয়া যায়নি");
    const { verifyAndSyncOrder } = await import("./zinipay.server");
    return verifyAndSyncOrder(valId);
  });
