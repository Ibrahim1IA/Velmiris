import { client } from "@/sanity/lib/client";
import type { CartLine } from "@/lib/types";

export type ResolvedProduct = {
  _id: string;
  title: string;
  slug: { current: string };
  priceXof: number;
  priceEur: number;
  priceGnf: number;
  variants: Array<{
    _key: string;
    colorName: string;
    hex: string;
    inStock: boolean;
    sku?: string;
  }>;
};

export type ResolvedLine =
  | {
      kind: "product";
      index: number;
      product: ResolvedProduct;
      variant: ResolvedProduct["variants"][number];
      qty: number;
    }
  | {
      kind: "box";
      index: number;
      boxId: string;
      giftMessage?: string;
      cardDesignId: string;
      items: Array<{
        product: ResolvedProduct;
        variant: ResolvedProduct["variants"][number];
        qty: number;
      }>;
      subtotalXof: number;
      subtotalEur: number;
      subtotalGnf: number;
    };

export async function resolveCartLines(lines: CartLine[]): Promise<ResolvedLine[]> {
  if (lines.length === 0) return [];
  const ids = Array.from(
    new Set(
      lines.flatMap((l) =>
        l.kind === "product"
          ? [l.productId]
          : l.items.map((i) => i.productId),
      ),
    ),
  );
  if (ids.length === 0) return [];
  let products: ResolvedProduct[] = [];
  try {
    products = await client.fetch(
      `*[_type == "product" && _id in $ids]{
        _id, title, slug, priceXof, priceEur, priceGnf,
        variants[]{ _key, colorName, hex, inStock, sku }
      }`,
      { ids },
    );
  } catch (err) {
    console.warn("[cart] resolveCartLines: Sanity fetch failed (CORS ?)", err);
    return [];
  }
  const byId = new Map(products.map((p) => [p._id, p]));

  const resolved: ResolvedLine[] = [];
  lines.forEach((line, index) => {
    if (line.kind === "product") {
      const product = byId.get(line.productId);
      const variant = product?.variants.find((v) => v._key === line.variantId);
      if (product && variant) {
        resolved.push({
          kind: "product",
          index,
          product,
          variant,
          qty: line.qty,
        });
      }
    } else {
      const items: Array<{
        product: ResolvedProduct;
        variant: ResolvedProduct["variants"][number];
        qty: number;
      }> = [];
      for (const it of line.items) {
        const product = byId.get(it.productId);
        const variant = product?.variants.find((v) => v._key === it.variantId);
        if (product && variant) items.push({ product, variant, qty: it.qty });
      }
      const subtotalXof = items.reduce(
        (s: number, it) => s + it.product.priceXof * it.qty,
        0,
      );
      const subtotalEur = items.reduce(
        (s: number, it) => s + it.product.priceEur * it.qty,
        0,
      );
      const subtotalGnf = items.reduce(
        (s: number, it) => s + (it.product.priceGnf ?? 0) * it.qty,
        0,
      );
      resolved.push({
        kind: "box",
        index,
        boxId: line.boxId,
        giftMessage: line.giftMessage,
        cardDesignId: line.cardDesignId,
        items,
        subtotalXof,
        subtotalEur,
        subtotalGnf,
      });
    }
  });
  return resolved;
}

export function cartTotals(resolved: ResolvedLine[]) {
  let totalXof = 0;
  let totalEur = 0;
  let totalGnf = 0;
  let count = 0;
  for (const r of resolved) {
    if (r.kind === "product") {
      totalXof += r.product.priceXof * r.qty;
      totalEur += r.product.priceEur * r.qty;
      totalGnf += (r.product.priceGnf ?? 0) * r.qty;
      count += r.qty;
    } else {
      totalXof += r.subtotalXof;
      totalEur += r.subtotalEur;
      totalGnf += r.subtotalGnf;
      count += r.items.reduce((s, it) => s + it.qty, 0);
    }
  }
  return { totalXof, totalEur, totalGnf, count };
}
