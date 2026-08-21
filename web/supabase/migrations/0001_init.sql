-- VELMIRYS V1 — Schéma initial (PRD §11.2)
-- À exécuter dans le SQL editor Supabase ou via la CLI

create extension if not exists "pgcrypto";

-- Anticipation comptes clientes (PRD §12 / I1)
create table customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  delivery_zone text not null,
  created_at timestamptz not null default now()
);

create type order_status as enum (
  'en_attente', 'confirmee', 'payee', 'expediee', 'livree', 'annulee'
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  ref text not null unique,               -- VEL-XXXX (PRD §6.1)
  customer_id uuid references customers(id) on delete set null,
  status order_status not null default 'en_attente',
  currency text not null check (currency in ('XOF', 'EUR')),
  subtotal numeric(12, 2) not null,
  total numeric(12, 2) not null,
  payload jsonb not null,                 -- copie figée telle qu'affichée dans WhatsApp
  created_at timestamptz not null default now()
);

create table boxes (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  gift_message text,
  card_design_id text
);

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  parent_box_id uuid references boxes(id) on delete cascade, -- null = article simple
  product_id text not null,
  variant_id text not null,
  qty int not null check (qty > 0),
  unit_price numeric(12, 2) not null
);

-- Anticipation livraison par zone (PRD §12 / I1)
create table delivery_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  fee_xof numeric(12, 2),
  fee_eur numeric(12, 2),
  active boolean not null default true
);

create index idx_orders_status on orders(status);
create index idx_orders_created on orders(created_at desc);
create index idx_order_items_order on order_items(order_id);
