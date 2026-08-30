create or replace function public.place_order(
  p_customer_name text,
  p_email text,
  p_phone text,
  p_payment_method text,
  p_transaction_id text,
  p_sender_number text,
  p_items jsonb
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_items jsonb;
  v_total numeric;
  v_order_no bigint;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'কার্ট খালি';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'id', p.id, 'title', p.title,
           'price', coalesce(p.discount_price, p.price),
           'qty', it.qty)), '[]'::jsonb),
         coalesce(sum(coalesce(p.discount_price, p.price) * it.qty), 0)
    into v_items, v_total
  from jsonb_to_recordset(p_items) as it(id uuid, qty int)
  join public.products p on p.id = it.id;

  if v_items is null or jsonb_array_length(v_items) = 0 then
    raise exception 'প্রোডাক্ট পাওয়া যায়নি';
  end if;

  insert into public.orders (
    customer_name, email, phone, payment_method,
    transaction_id, sender_number, items, total
  ) values (
    p_customer_name, p_email, p_phone, p_payment_method,
    p_transaction_id, p_sender_number, v_items, v_total
  )
  returning order_no into v_order_no;

  return v_order_no;
end;
$$;

revoke all on function public.place_order(text,text,text,text,text,text,jsonb) from public;
grant execute on function public.place_order(text,text,text,text,text,text,jsonb) to anon, authenticated, service_role;