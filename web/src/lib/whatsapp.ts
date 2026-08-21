import type { OrderData } from "./types";
import { formatPrice } from "./format";

// Message pré-rempli WhatsApp — contenu exact : PRD §6.2
export function buildWhatsAppMessage(order: OrderData): string {
  const lines: string[] = [
    "Bonjour VELMIRYS ! 🤍",
    `Je souhaite confirmer ma commande — Réf : ${order.ref}`,
    "",
    "👤 Mes informations",
    `• Nom : ${order.customerName}`,
    `• Téléphone : ${order.phone}`,
    `• Zone de livraison : ${order.deliveryZone}`,
    "",
    "🛍️ Ma commande",
  ];

  for (const item of order.items) {
    lines.push(`• ${item.name} — ${item.color} ×${item.qty} — ${formatPrice(item.unitPrice * item.qty, order.currency)}`);
  }

  order.boxes.forEach((box, index) => {
    lines.push("", `🎁 Box cadeau n°${index + 1} — ${formatPrice(box.subtotal, order.currency)}`);
    for (const item of box.items) {
      lines.push(`   • ${item.name} — ${item.color} ×${item.qty}`);
    }
    lines.push(`   • Carte : « ${box.cardName} »`);
    if (box.giftMessage) {
      lines.push(`   • Message : « ${box.giftMessage} »`);
    }
  });

  lines.push(
    "",
    `💰 Total : ${formatPrice(order.total, order.currency)}`,
    "🚚 Livraison : à confirmer ensemble",
    "",
    "Merci !",
  );

  return lines.join("\n");
}

// Numéro au format international sans « + » (ex. 221770000000)
export function buildWhatsAppUrl(shopNumber: string, message: string): string {
  return `https://wa.me/${shopNumber}?text=${encodeURIComponent(message)}`;
}
