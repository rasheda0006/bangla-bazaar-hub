alter table public.orders
  add column if not exists payment_status text not null default 'pending',
  add column if not exists gateway text,
  add column if not exists invoice_id text,
  add column if not exists val_id text,
  add column if not exists payment_url text,
  add column if not exists paid_at timestamptz;

alter table public.orders alter column transaction_id set default '';
alter table public.orders alter column sender_number set default '';

create unique index if not exists orders_val_id_key on public.orders (val_id) where val_id is not null;
create index if not exists orders_invoice_id_idx on public.orders (invoice_id);

insert into public.payment_methods (code, label, number, instructions, color, sort_order, is_active)
values ('zinipay', 'অনলাইন পেমেন্ট (ZiniPay)', null,
  'বিকাশ, নগদ, রকেট বা কার্ড দিয়ে সরাসরি অনলাইনে পেমেন্ট করুন। পেমেন্ট সম্পন্ন হলে অর্ডার স্বয়ংক্রিয়ভাবে নিশ্চিত হবে।',
  '#7c3aed', -1, true)
on conflict do nothing;