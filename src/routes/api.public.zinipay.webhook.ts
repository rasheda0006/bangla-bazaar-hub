import { createFileRoute } from "@tanstack/react-router";

/**
 * ZiniPay ওয়েবহুক। পেমেন্টের ফলাফল কখনোই পেলোড থেকে বিশ্বাস করা হয় না —
 * val_id নিয়ে ZiniPay-এর verify API দিয়ে আবার যাচাই করে অর্ডার আপডেট করা হয়।
 */
async function handle(request: Request) {
  const url = new URL(request.url);
  let valId = url.searchParams.get("val_id") ?? url.searchParams.get("invoice_id") ?? "";

  if (!valId && request.method === "POST") {
    const body = (await request.json().catch(() => ({}))) as {
      val_id?: string;
      invoice_id?: string;
    };
    valId = body.val_id ?? body.invoice_id ?? "";
  }

  if (!valId) return new Response("missing val_id", { status: 400 });

  try {
    const { verifyAndSyncOrder } = await import("@/lib/zinipay.server");
    const result = await verifyAndSyncOrder(valId);
    return Response.json({ ok: true, status: result.status });
  } catch (error) {
    console.error("zinipay webhook error", error);
    return new Response("verification failed", { status: 500 });
  }
}

export const Route = createFileRoute("/api/public/zinipay/webhook")({
  server: {
    handlers: {
      POST: ({ request }) => handle(request),
      GET: ({ request }) => handle(request),
    },
  },
});
