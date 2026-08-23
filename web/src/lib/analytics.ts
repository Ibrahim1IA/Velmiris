// Helper Umami — PRD §8.5
// Guard window.umami (script non chargé, env vide, DNT, ad-block) → no-op, ne casse jamais

export type UmamiEvent = "add_to_cart" | "add_to_box" | "checkout_whatsapp";

export function track(
  event: UmamiEvent,
  data?: Record<string, string | number | boolean | undefined>,
): void {
  if (typeof window === "undefined") return;
  try {
    const w = window as unknown as {
      umami?: { track: (e: string, d?: unknown) => void };
    };
    w.umami?.track(event, data);
  } catch {
    // no-op
  }
}
