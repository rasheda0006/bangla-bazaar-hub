import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const itemSchema = z.object({
  id: z.string(),
  title: z.string(),
  price: z.number(),
  qty: z.number().int().positive(),
});

const orderSchema = z.object({
  customer_name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().regex(/^01[3-9]\d{8}$/),
  payment_method: z.enum(["bkash", "nagad", "rocket"]),
  transaction_id: z.string().min(4).max(80),
  sender_number: z.string().min(6).max(20),
  items: z.array(itemSchema).min(1).max(100),
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => orderSchema.parse(data))
  .handler(async ({ data }) => {
    const { createClient } = await import("@supabase/supabase-js");
    const url = process.env["SUPABASE_URL"] ?? process.env["VITE_SUPABASE_URL"];
    const key =
      process.env["SUPABASE_PUBLISHABLE_KEY"] ??
      process.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
      process.env["SUPABASE_ANON_KEY"];
    if (!url || !key) throw new Error("Supabase configuration missing");

    const supabase = createClient(url, key, {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        fetch: (input: RequestInfo | URL, init?: RequestInit) => {
          const h = new Headers(init?.headers);
          if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
            h.delete("Authorization");
          }
          h.set("apikey", key);
          return fetch(input, { ...init, headers: h });
        },
      },
    });

    // Prices are recomputed inside the database function, never trusted from the client.
    const { data: orderNo, error } = await supabase.rpc("place_order", {
      p_customer_name: data.customer_name,
      p_email: data.email,
      p_phone: data.phone,
      p_payment_method: data.payment_method,
      p_transaction_id: data.transaction_id,
      p_sender_number: data.sender_number,
      p_items: data.items.map((i) => ({ id: i.id, qty: i.qty })),
    });
    if (error) throw new Error(error.message);

    return { order_no: Number(orderNo) };
  });

