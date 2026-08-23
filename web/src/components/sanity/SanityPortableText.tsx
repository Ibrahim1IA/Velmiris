type Span = {
  _key?: string;
  _type: "span";
  text: string;
  marks?: string[];
};

type Block = {
  _key: string;
  _type: "block";
  style?: string;
  listItem?: string;
  level?: number;
  children: Span[];
  markDefs?: Array<{ _key: string; _type: string; href?: string }>;
};

type PortableValue = Block[];

/* Rendu minimal Portable Text sans dépendance externe — PRD §10 */
function renderSpan(span: Span, markDefs: Block["markDefs"], idx: number) {
  let node: React.ReactNode = span.text;
  const marks = span.marks ?? [];
  for (const mark of marks) {
    if (mark === "strong") node = <strong key={`${idx}-strong`} className="font-semibold">{node}</strong>;
    else if (mark === "em") node = <em key={`${idx}-em`} className="italic">{node}</em>;
    else if (mark === "underline") node = <span key={`${idx}-u`} className="underline">{node}</span>;
    else if (mark === "code") node = <code key={`${idx}-code`} className="rounded bg-sand px-1 py-0.5 text-sm">{node}</code>;
    else {
      const def = markDefs?.find((d) => d._key === mark);
      if (def?._type === "link" && def.href) {
        node = (
          <a key={`${idx}-link`} href={def.href} target="_blank" rel="noopener noreferrer" className="underline decoration-ink/20 underline-offset-4 hover:decoration-accent hover:text-accent">
            {node}
          </a>
        );
      }
    }
  }
  return <span key={idx}>{node}</span>;
}

export default function SanityPortableText({ value }: { value: PortableValue }) {
  if (!value || value.length === 0) return null;
  return (
    <div className="prose prose-ink max-w-none prose-p:leading-relaxed prose-a:text-accent">
      {value.map((block) => {
        if (block._type !== "block") return null;
        const key = block._key;
        const content = block.children?.map((c, i) => renderSpan(c as Span, block.markDefs, i));
        if (block.listItem === "bullet") {
          return (
            <ul key={key} className="my-3 list-disc pl-6 text-ink/80">
              <li>{content}</li>
            </ul>
          );
        }
        if (block.listItem === "number") {
          return (
            <ol key={key} className="my-3 list-decimal pl-6 text-ink/80">
              <li>{content}</li>
            </ol>
          );
        }
        switch (block.style) {
          case "h1":
            return <h1 key={key} className="mt-8 font-serif text-3xl tracking-tight">{content}</h1>;
          case "h2":
            return <h2 key={key} className="mt-10 font-serif text-2xl tracking-tight">{content}</h2>;
          case "h3":
            return <h3 key={key} className="mt-6 font-serif text-xl">{content}</h3>;
          case "h4":
            return <h4 key={key} className="mt-4 font-medium">{content}</h4>;
          case "blockquote":
            return <blockquote key={key} className="mt-6 border-l-2 border-accent/30 pl-4 italic text-ink/70">{content}</blockquote>;
          default:
            return <p key={key} className="mt-4 leading-relaxed text-ink/80">{content}</p>;
        }
      })}
    </div>
  );
}
