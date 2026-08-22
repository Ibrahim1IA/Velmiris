-- RLS pour mini-admin (PRD §8.5) — admin unique alphasecondd@gmail.com
-- Service role (SUPABASE_SECRET_KEY) bypass RLS, donc /api/orders reste fonctionnel

alter table customers enable row level security;
alter table orders enable row level security;
alter table boxes enable row level security;
alter table order_items enable row level security;
alter table delivery_zones enable row level security;

-- Supprime les anciennes policies si re-run
drop policy if exists "admin_all_customers" on customers;
drop policy if exists "admin_all_orders" on orders;
drop policy if exists "admin_all_boxes" on boxes;
drop policy if exists "admin_all_order_items" on order_items;
drop policy if exists "admin_all_delivery_zones" on delivery_zones;

-- Seul l'admin authentifié (email) peut tout faire via anon/authenticated
-- Utilise auth.email() = ADMIN_EMAIL
create policy "admin_all_customers" on customers for all to authenticated using (auth.email() = 'alphasecondd@gmail.com') with check (auth.email() = 'alphasecondd@gmail.com');
create policy "admin_all_orders" on orders for all to authenticated using (auth.email() = 'alphasecondd@gmail.com') with check (auth.email() = 'alphasecondd@gmail.com');
create policy "admin_all_boxes" on boxes for all to authenticated using (auth.email() = 'alphasecondd@gmail.com') with check (auth.email() = 'alphasecondd@gmail.com');
create policy "admin_all_order_items" on order_items for all to authenticated using (auth.email() = 'alphasecondd@gmail.com') with check (auth.email() = 'alphasecondd@gmail.com');
create policy "admin_all_delivery_zones" on delivery_zones for all to authenticated using (auth.email() = 'alphasecondd@gmail.com') with check (auth.email() = 'alphasecondd@gmail.com');
