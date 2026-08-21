// Modèle panier — PRD §11.1

export type Currency = "XOF" | "EUR";

export interface CartProductLine {
  kind: "product";
  productId: string;
  variantId: string;
  qty: number;
}

export interface CartBoxItem {
  productId: string;
  variantId: string;
  qty: number;
}

export interface CartBoxLine {
  kind: "box";
  boxId: string;
  items: CartBoxItem[]; // 2 à 5 — PRD §5.2
  giftMessage?: string; // ≤ 250 car.
  cardDesignId: string;
}

export type CartLine = CartProductLine | CartBoxLine;

// Commande résolue (avec noms/prix figés au moment de la commande — PRD §6.2)
export interface OrderItemResolved {
  name: string;
  color: string;
  qty: number;
  unitPrice: number;
}

export interface OrderBoxResolved {
  items: OrderItemResolved[];
  cardName: string;
  giftMessage?: string;
  subtotal: number;
}

export interface OrderData {
  ref: string; // VEL-XXXX
  customerName: string;
  phone: string;
  deliveryZone: string;
  items: OrderItemResolved[];
  boxes: OrderBoxResolved[];
  total: number;
  currency: Currency;
}

export type OrderStatus =
  | "en_attente"
  | "confirmee"
  | "payee"
  | "expediee"
  | "livree"
  | "annulee";
