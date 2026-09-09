const ZINI_BASE = "https://api.zinipay.com";

export type VerifyResult = {
  status: "PENDING" | "COMPLETED" | "FAILED";
  order_no: number | null;
  total: number;
  transaction_id: string;
  payment_method: string;
};

/**
 * ZiniPay-এর verify API কল করে অর্ডারের পেমেন্ট স্ট্যাটাস ডাটাবেসে সিঙ্ক করে।
 * val_id ছাড়া কোনো অর্ডার আপডেট হয় না, তাই ক্লায়েন্ট থেকে স্ট্যাটাস বিশ্বাস করা হয় না।
 */
export async function verifyAndSyncOrder(valId: string): Promise<VerifyResult> {
  const apiKey = process.env["ZINIPAY_API_KEY"];
  if (!apiKey) throw new Error("অনলাইন পেমেন্ট কনফিগার করা হয়নি");

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { data: order, error } = await supabaseAdmin
    .from("orders")
    .select("id, order_no, total, payment_status")
    .eq("val_id", valId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!order) throw new Error("অর্ডার পাওয়া যায়নি");

  const res = await fetch(`${ZINI_BASE}/v1/payment/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "zini-api-key": apiKey },
    body: JSON.stringify({ invoice_id: valId }),
  });
  const payload = (await res.json().catch(() => ({}))) as {
    status?: string;
    transaction_id?: string;
    payment_method?: string;
    invoice_id?: string;
    amount?: number;
  };

  const raw = String(payload.status ?? "").toUpperCase();
  const status: VerifyResult["status"] =
    raw === "COMPLETED" ? "COMPLETED" : raw === "FAILED" ? "FAILED" : "PENDING";

  const update: Record<string, unknown> = {
    payment_status: status.toLowerCase(),
    invoice_id: payload.invoice_id ?? valId,
  };
  if (payload.transaction_id) update["transaction_id"] = payload.transaction_id;
  if (payload.payment_method) update["payment_method"] = payload.payment_method;
  if (status === "COMPLETED") {
    update["status"] = "paid";
    update["paid_at"] = new Date().toISOString();
  } else if (status === "FAILED") {
    update["status"] = "cancelled";
  }

  await supabaseAdmin.from("orders").update(update).eq("id", order.id);

  return {
    status,
    order_no: order.order_no ?? null,
    total: Number(order.total ?? 0),
    transaction_id: payload.transaction_id ?? "",
    payment_method: payload.payment_method ?? "zinipay",
  };
}
