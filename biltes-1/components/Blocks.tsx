import Link from "next/link";
import { Photo } from "./Photo";
import { Gallery } from "./Gallery";
import { Reveal } from "./Reveal";
import { Download } from "lucide-react";
import { cleanHtml } from "@/lib/sanitize";

type B = Record<string, any> & { type: string }; // eslint-disable-line @typescript-eslint/no-explicit-any

function embed(url: string) {
  const yt = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/.exec(url);
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`;
  const vi = /vimeo\.com\/(\d+)/.exec(url);
  return vi ? `https://player.vimeo.com/video/${vi[1]}?dnt=1` : null;
}
const loc = (u: string, l: string) => (u?.startsWith("/") && !/^\/(tr|en)(\/|$)/.test(u) ? `/${l}${u}` : u);

export function Blocks({ blocks, locale }: { blocks: B[]; locale: string }) {
  return (
    <div className="space-y-16">
      {blocks.map((b, i) => (
        <Reveal key={i}>
          <Block b={b} locale={locale} />
        </Reveal>
      ))}
    </div>
  );
}

function Title({ t }: { t?: string }) { return t ? <h2 className="mb-8 text-3xl font-semibold md:text-4xl">{t}</h2> : null; }

function Block({ b, locale }: { b: B; locale: string }) {
  switch (b.type) {
    case "text": return (<div><Title t={b.title} /><div className="prose-site" dangerouslySetInnerHTML={{ __html: cleanHtml(b.html ?? "") }} /></div>);
    case "imageText": return (
      <div className={`grid items-center gap-10 md:grid-cols-2 md:gap-16 ${b.imageRight ? "" : "md:[&>*:first-child]:order-2"}`}>
        <div><Title t={b.title} /><div className="prose-site" dangerouslySetInnerHTML={{ __html: cleanHtml(b.html ?? "") }} /></div>
        <Photo src={b.image} alt={b.alt} ratio="4/3" className="w-full" />
      </div>);
    case "gallery": return (<div><Title t={b.title} /><Gallery items={(b.images ?? []).filter((x: any) => x.src).map((x: any) => ({ src: x.src, alt: x.alt }))} categories={false} /></div>); // eslint-disable-line @typescript-eslint/no-explicit-any
    case "video": { const e = embed(b.url ?? ""); return e ? (<div><Title t={b.title} /><div className="aspect-video overflow-hidden bg-navy"><iframe src={e} title={b.title || "Video"} loading="lazy" allow="fullscreen; picture-in-picture" className="h-full w-full" /></div></div>) : null; }
    case "accordion": return (<div><Title t={b.title} /><div className="divide-y divide-navy/10 border-y border-navy/10">{(b.items ?? []).map((it: any, k: number) => (<details key={k} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between font-display text-lg font-semibold text-navy">{it.q}<span className="text-teal transition group-open:rotate-45">+</span></summary><p className="mt-3 max-w-3xl leading-7 text-ink/80">{it.a}</p></details>))}</div></div>); // eslint-disable-line @typescript-eslint/no-explicit-any
    case "cta": return (<div className="bg-navy p-10 text-white md:p-16"><h2 className="text-3xl font-semibold !text-white md:text-4xl">{b.title}</h2><p className="mt-4 max-w-2xl text-white/85">{b.text}</p>{b.url && b.label && <Link href={loc(b.url, locale)} className="btn-primary mt-8">{b.label}</Link>}</div>);
    case "stats": return (<div><Title t={b.title} /><dl className="grid grid-cols-2 gap-8 md:grid-cols-4">{(b.items ?? []).map((it: any, k: number) => (<div key={k} className="border-t-2 border-teal pt-4"><dt className="order-2 mt-1 text-sm text-ink/70">{it.label}</dt><dd className="font-display text-5xl font-extrabold text-navy">{it.value}</dd></div>))}</dl></div>); // eslint-disable-line @typescript-eslint/no-explicit-any
    case "cards": return (<div><Title t={b.title} /><div className="grid gap-6 md:grid-cols-3">{(b.items ?? []).map((it: any, k: number) => { const c = (<><Photo src={it.image} alt="" ratio="3/2" className="w-full" /><h3 className="mt-4 text-xl font-semibold">{it.title}</h3><p className="mt-2 text-ink/75">{it.text}</p></>); return it.url ? <Link key={k} href={loc(it.url, locale)} className="block">{c}</Link> : <div key={k}>{c}</div>; })}</div></div>); // eslint-disable-line @typescript-eslint/no-explicit-any
    case "features": return (<div><Title t={b.title} /><div className="grid gap-x-10 gap-y-8 md:grid-cols-3">{(b.items ?? []).map((it: any, k: number) => (<div key={k} className="border-t border-navy/15 pt-5"><h3 className="text-xl font-semibold">{it.title}</h3><p className="mt-2 leading-7 text-ink/75">{it.text}</p></div>))}</div></div>); // eslint-disable-line @typescript-eslint/no-explicit-any
    case "timeline": return (<div><Title t={b.title} /><ol className="relative space-y-8 border-l-2 border-teal/30 pl-8">{(b.items ?? []).map((it: any, k: number) => (<li key={k} className="relative"><span className="absolute -left-[41px] top-1.5 h-4 w-4 rounded-full border-4 border-white bg-teal" /><p className="text-sm font-semibold text-teal">{it.date}</p><h3 className="text-xl font-semibold">{it.title}</h3><p className="mt-1 text-ink/75">{it.text}</p></li>))}</ol></div>); // eslint-disable-line @typescript-eslint/no-explicit-any
    case "quote": return (<blockquote className="border-l-4 border-amber pl-6 font-display text-2xl leading-9 text-navy md:text-3xl">“{b.text}”{b.author && <footer className="mt-4 text-base text-ink/60">— {b.author}</footer>}</blockquote>);
    case "download": return (<div><Title t={b.title} /><ul className="grid gap-3 md:grid-cols-2">{(b.items ?? []).filter((x: any) => x.url).map((it: any, k: number) => (<li key={k}><a href={it.url} download className="flex items-center justify-between border border-navy/15 p-4 transition hover:border-teal hover:text-teal"><span className="font-medium">{it.label}</span><Download size={18} /></a></li>))}</ul></div>); // eslint-disable-line @typescript-eslint/no-explicit-any
    default: return null;
  }
}
