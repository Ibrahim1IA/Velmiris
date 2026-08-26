import Link from "next/link";

export default function LegalNotice() {
  return (
    <div
      role="note"
      aria-label="Avertissement juridique"
      className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900"
    >
      <p className="font-medium">À faire valider juridiquement</p>
      <p className="mt-1 text-amber-800/80">
        Ces contenus sont des templates génériques fournis comme base de travail. Ils doivent être adaptés à la
        juridiction applicable (Sénégal / qualifications légales) et validés par un professionnel avant publication.
        Raison sociale, adresse, immatriculation et moyens de paiement sont à compléter (voir{" "}
        <span className="font-medium">CONTENUS-A-FOURNIR.md §F5 / §G</span>).
      </p>
    </div>
  );
}

export function LegalShell({
  title,
  description,
  updated,
  children,
}: {
  title: string;
  description: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-12 md:py-16">
      <nav aria-label="Fil d'Ariane" className="mb-6">
        <ol className="flex flex-wrap items-center gap-2 text-sm text-ink/60">
          <li>
            <Link href="/" className="hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-sm">
              Accueil
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li aria-current="page" className="font-medium text-ink">
            {title}
          </li>
        </ol>
      </nav>
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/60">VELMIRYS — Légal</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-ink/60">{description}</p>
        {updated && <p className="mt-2 text-xs text-ink/60">Dernière mise à jour : {updated}</p>}
      </header>
      <LegalNotice />
      <article className="prose max-w-none prose-headings:font-serif prose-a:text-accent">{children}</article>
      <nav aria-label="Pages légales" className="mt-12 flex flex-wrap gap-3 border-t border-sand pt-8 text-sm">
        <Link href="/legal/cgv" className="inline-flex min-h-[44px] items-center rounded-full border border-ink/10 px-4 py-2 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          CGV
        </Link>
        <Link href="/legal/confidentialite" className="inline-flex min-h-[44px] items-center rounded-full border border-ink/10 px-4 py-2 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          Confidentialité
        </Link>
        <Link href="/legal/livraison-retours" className="inline-flex min-h-[44px] items-center rounded-full border border-ink/10 px-4 py-2 hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">
          Livraison &amp; retours
        </Link>
      </nav>
    </div>
  );
}
