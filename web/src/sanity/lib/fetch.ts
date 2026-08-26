import { client } from "./client";

type FetchOptions = { next?: { revalidate?: number; tags?: string[] } };

const RETRYABLE_CODES = new Set([
  "UND_ERR_CONNECT_TIMEOUT",
  "ECONNREFUSED",
  "ENOTFOUND",
  "ETIMEDOUT",
  "EAI_AGAIN",
  "ECONNRESET",
]);

function isTransient(error: unknown): boolean {
  const code = (error as { cause?: { code?: string } } | null)?.cause?.code ?? "";
  const message = error instanceof Error ? error.message : "";
  return RETRYABLE_CODES.has(code) || message.includes("fetch failed");
}

export async function sanityFetch<T>(
  query: string,
  params: Record<string, unknown> | null = null,
  options: FetchOptions = {},
  attempts = 2,
): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try {
      return await client.fetch<T>(query, params ?? {}, options as never);
    } catch (error) {
      if (attempt >= attempts || !isTransient(error)) throw error;
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
}
