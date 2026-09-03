import { supabase } from "@/integrations/supabase/client";

export type OrderInput = {
  customer_name: string;
  email: string;
  phone: string;
  payment_method: string;
  transaction_id: string;
  sender_number: string;
  items: { id: string; qty: number }[];
};

/**
 * Orders are placed through the `place_order` database function.
 * Prices and totals are recomputed inside the database, never trusted from the client.
 */
export async function placeOrder(input: OrderInput): Promise<number> {
  const { data, error } = await supabase.rpc("place_order", {
    p_customer_name: input.customer_name,
    p_email: input.email,
    p_phone: input.phone,
    p_payment_method: input.payment_method,
    p_transaction_id: input.transaction_id,
    p_sender_number: input.sender_number,
    p_items: input.items.map((i) => ({ id: i.id, qty: i.qty })),
  });
  if (error) throw new Error(error.message);
  return Number(data);
}
