-- 0003 — Fix RLS multi-admin : Studio est source de vérité, RLS permissif pour authenticated
-- Contexte : 0002 hardcodait alphasecondd@gmail.com. Désormais l'autorisation est gérée
-- côté app via lib/admin.ts (Sanity adminEmails). Les routes admin utilisent service_role (bypass RLS).
-- On garde RLS activé mais on autorise tout utilisateur authenticated à lire/écrire via RLS,
-- l'app layer bloque les non-autorisés (403). Alternative stricte nécessiterait une table admin_emails en DB.

drop policy if exists "admin_all_customers" on customers;
drop policy if exists "admin_all_orders" on orders;
drop policy if exists "admin_all_boxes" on boxes;
drop policy if exists "admin_all_order_items" on order_items;
drop policy if exists "admin_all_delivery_zones" on delivery_zones;

create policy "admin_all_customers" on customers for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_all_orders" on orders for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_all_boxes" on boxes for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_all_order_items" on order_items for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
create policy "admin_all_delivery_zones" on delivery_zones for all to authenticated using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');
