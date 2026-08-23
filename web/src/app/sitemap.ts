import type { MetadataRoute } from "next";
import { client } from "@/sanity/lib/client";
import { getSiteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const statics: Array<{
    path: string;
    changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority: number;
  }> = [
    { path: "", changeFrequency: "daily", priority: 1 },
    { path: "/boutique", changeFrequency: "daily", priority: 0.9 },
    { path: "/box", changeFrequency: "weekly", priority: 0.8 },
    { path: "/a-propos", changeFrequency: "monthly", priority: 0.5 },
    { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
    { path: "/panier", changeFrequency: "weekly", priority: 0.2 },
    { path: "/legal/cgv", changeFrequency: "yearly", priority: 0.3 },
    { path: "/legal/confidentialite", changeFrequency: "yearly", priority: 0.3 },
    { path: "/legal/livraison-retours", changeFrequency: "yearly", priority: 0.3 },
  ];

  const staticEntries: MetadataRoute.Sitemap = statics.map((s) => ({
    url: `${siteUrl}${s.path || "/"}`.replace(/([^:]\/)\/+/, "$1"),
    lastModified: now,
    changeFrequency: s.changeFrequency,
    priority: s.priority,
  }));

  // Produits dynamiques — try/catch pour ne jamais casser le build si Sanity down (PRD §9.2/13)
  try {
    const slugs: Array<{ slug: { current: string }; _updatedAt?: string }> =
      await client.fetch(
        `*[_type == "product" && defined(slug.current)]{ slug, _updatedAt }`,
        {},
        { next: { revalidate: 3600, tags: ["products"] } },
      );

    const productEntries: MetadataRoute.Sitemap = slugs
      .filter((p) => p.slug?.current)
      .map((p) => ({
        url: `${siteUrl}/boutique/${p.slug.current}`,
        lastModified: p._updatedAt ? new Date(p._updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    return [...staticEntries, ...productEntries];
  } catch {
    return staticEntries;
  }
}
