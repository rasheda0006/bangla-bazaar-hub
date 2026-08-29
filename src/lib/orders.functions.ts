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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Prices come from the database, never from the client.
    const ids = [...new Set(data.items.map((i) => i.id))];
    const { data: products, error: pErr } = await supabaseAdmin
      .from("products")
      .select("id,title,price,discount_price")
      .in("id", ids);
    if (pErr) throw new Error(pErr.message);

    const items = data.items.map((i) => {
      const p = products?.find((x) => x.id === i.id);
      if (!p) throw new Error("পণ্য পাওয়া যায়নি");
      const price = Number(p.discount_price ?? p.price);
      return { id: p.id, title: p.title, price, qty: i.qty };
    });
    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    const { data: order, error } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.customer_name,
        email: data.email,
        phone: data.phone,
        payment_method: data.payment_method,
        transaction_id: data.transaction_id,
        sender_number: data.sender_number,
        items,
        total,
      })
      .select("order_no")
      .single();
    if (error) throw new Error(error.message);

    return { order_no: Number(order.order_no) };
  });
