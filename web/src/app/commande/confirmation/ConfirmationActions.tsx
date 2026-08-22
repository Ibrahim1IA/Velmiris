"use client";

import { useState } from "react";

export default function ConfirmationActions({
  whatsappUrl,
  message,
  refCode,
}: {
  whatsappUrl: string;
  message: string;
  refCode: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const ta = document.createElement("textarea");
      ta.value = message;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full rounded-full bg-[#25D366] py-3.5 text-center text-sm font-medium text-white hover:bg-[#1da851]"
        >
          Rouvrir WhatsApp — {refCode}
        </a>
      ) : (
        <p className="rounded-xl bg-accent/10 px-4 py-3 text-sm text-accent">Numéro WhatsApp non configuré.</p>
      )}
      <button
        onClick={copy}
        className="w-full rounded-full border border-ink/15 py-3 text-sm hover:border-ink"
      >
        {copied ? "Message copié ✓" : "Copier le message"}
      </button>
      <details className="rounded-xl border border-sand bg-cream p-4">
        <summary className="cursor-pointer text-sm font-medium">Voir le message pré-rempli</summary>
        <pre className="mt-3 whitespace-pre-wrap text-sm text-ink/70">{message}</pre>
      </details>
    </div>
  );
}
