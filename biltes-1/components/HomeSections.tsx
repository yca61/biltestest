import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Photo } from "./Photo";
import { Reveal } from "./Reveal";
import { LogoBadge } from "./LogoBadge";
import { ClipReveal, Parallax, SplitText } from "./Motion";
import { getSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { live, liveSimple } from "@/lib/content";
import { tx, ui, type Locale } from "@/lib/i18n";
import { fmtDate } from "@/lib/utils";

type D = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const lk = (u: string | undefined, l: Locale) => (!u ? "#" : /^(https?:|mailto:|tel:|#)/.test(u) || /^\/(tr|en)(\/|$)/.test(u) ? u : `/${l}${u === "/" ? "" : u}`);

function Head({ d, l, light }: { d: D; l: Locale; light?: boolean }) {
  return (
    <div className="max-w-3xl">
      {d.eyebrow && <p className="eyebrow">{tx(d.eyebrow, l)}</p>}
      {d.title && <h2 className={`mt-4 text-4xl font-semibold leading-[1.1] md:text-5xl ${light ? "!text-white" : ""}`}><SplitText text={tx(d.title, l)} /></h2>}
      {d.text && <p className="mt-5 text-lg leading-8 text-ink/75">{tx(d.text, l)}</p>}
    </div>
  );
}

export async function About({ d, l }: { d: D; l: Locale }) {
  const { logoUrl } = await getSettings();
  return (
    <section className="wrap grid items-center gap-14 py-24 lg:grid-cols-12 lg:py-32">
      <Reveal className="lg:col-span-5">
        <p className="eyebrow">{tx(d.eyebrow, l)}</p>
        <h2 className="mt-4 text-4xl font-semibold leading-[1.1] md:text-5xl"><SplitText text={tx(d.title, l)} /></h2>
        <p className="mt-6 text-lg leading-8 text-ink/75">{tx(d.text, l)}</p>
        {d.ctaUrl && <Link href={lk(d.ctaUrl, l)} className="btn-dark mt-9">{tx(d.ctaLabel, l)}<ArrowUpRight size={18} /></Link>}
      </Reveal>
      <Reveal delay={0.15} className="relative lg:col-span-7">
        <div className="absolute -left-6 -top-6 hidden h-40 w-40 border-2 border-amber md:block" aria-hidden />
        <LogoBadge src={logoUrl} size="md" className="absolute -right-4 -top-10 z-10 md:-right-8" />
        <ClipReveal><Parallax amount={30}><Photo src={d.image1} alt="" ratio="5/4" className="relative w-full" /></Parallax></ClipReveal>
        <Photo src={d.image2} alt="" ratio="1/1" className="absolute -bottom-10 -left-4 hidden w-2/5 border-8 border-white shadow-xl md:block lg:-left-14" />
      </Reveal>
    </section>
  );
}

export function Pillars({ d, l }: { d: D; l: Locale }) {
  return (
    <section className="bg-mist py-24">
      <div className="wrap grid gap-px bg-navy/10 sm:grid-cols-2 lg:grid-cols-4">
        {(d.items ?? []).map((p: D, i: number) => (
          <Reveal key={i} delay={i * 0.08} className="group bg-mist p-8 transition duration-500 hover:bg-navy md:p-10">
            <span className="font-display text-sm font-bold text-teal">0{i + 1}</span>
            <svg className="my-6 h-10 w-10 text-navy transition group-hover:text-amber" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden>
              {[<><circle cx="20" cy="20" r="14" /><path d="M20 6v28M6 20h28" /></>, <><rect x="7" y="9" width="26" height="18" rx="1" /><path d="M14 33h12M20 27v6" /></>, <><path d="M5 15 20 7l15 8-15 8-15-8Z" /><path d="M11 19v8c0 3 4 5 9 5s9-2 9-5v-8" /></>, <><path d="M20 6c8 0 14 5 14 11 0 5-4 5-7 5-3 0-3 3-3 5 0 3-2 5-5 5C11 32 6 27 6 20S12 6 20 6Z" /><circle cx="14" cy="16" r="1.5" /><circle cx="22" cy="13" r="1.5" /></>][i % 4]}
            </svg>
            <h3 className="text-2xl font-bold tracking-wide group-hover:text-white">{tx(p.title, l)}</h3>
            <p className="mt-3 leading-7 text-ink/70 group-hover:text-white/80">{tx(p.text, l)}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export async function Programs({ d, l }: { d: D; l: Locale }) {
  const items = await db.educationProgram.findMany({ where: { ...liveSimple, level: { in: ["anaokulu", "ilkokul", "ortaokul"] } }, orderBy: { sortOrder: "asc" }, include: { image: true } });
  return (
    <section className="wrap py-24 lg:py-32">
      <Reveal><Head d={d} l={l} /></Reveal>
      <div className="mt-16 grid gap-8 md:grid-cols-3">
        {items.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.1} className={i === 1 ? "md:mt-16" : i === 2 ? "md:mt-32" : ""}>
            <Link href={`/${l}/egitim/${p.slug}`} className="group block">
              <ClipReveal delay={i * 0.1}><div className="overflow-hidden"><Photo src={p.image?.url} alt={tx(p.image?.alt, l)} ratio="4/5" className="w-full transition duration-[900ms] group-hover:scale-105" /></div></ClipReveal>
              <h3 className="mt-6 text-3xl font-semibold">{tx(p.title, l)}</h3>
              <p className="mt-3 leading-7 text-ink/70">{tx(p.summary, l)}</p>
              <span className="mt-5 inline-flex items-center gap-2 border-b border-teal pb-1 text-sm font-semibold text-teal transition-all group-hover:gap-4">{ui(l).discover}<ArrowUpRight size={16} /></span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export async function CampusesSection({ d, l }: { d: D; l: Locale }) {
  const { logoUrl } = await getSettings();
  const items = await db.campus.findMany({ where: liveSimple, orderBy: { sortOrder: "asc" }, include: { mainImage: true } });
  return (
    <section className="bg-navy py-24 text-white lg:py-32">
      <div className="wrap">
        <Reveal><Head d={d} l={l} light /></Reveal>
        <div className="mt-14 grid gap-px bg-white/15 md:grid-cols-3">
          {items.map((c, i) => (
            <Reveal key={c.id} delay={i * 0.08} className="bg-navy">
              <Link href={`/${l}/kampusler/${c.slug}`} className="group relative block">
                <LogoBadge src={logoUrl} size="sm" className="absolute left-4 top-4 z-10" />
                <div className="overflow-hidden"><Photo src={c.mainImage?.url} alt={c.name} ratio="3/4" className="w-full opacity-90 transition duration-[900ms] group-hover:scale-105" /></div>
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy via-navy/70 to-transparent p-7 pt-24">
                  <p className="text-xs font-semibold uppercase tracking-widest text-amber">{tx(c.location, l)}</p>
                  <h3 className="mt-1 text-2xl font-semibold !text-white">{c.name}</h3>
                  <span className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-white/90">{ui(l).discover}<ArrowUpRight size={15} /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Approach({ d, l }: { d: D; l: Locale }) {
  return (
    <section className="wrap py-24 lg:py-32">
      <Reveal><h2 className="max-w-3xl text-4xl font-semibold md:text-5xl"><SplitText text={tx(d.title, l)} /></h2></Reveal>
      <div className="mt-14 grid gap-x-12 gap-y-2 md:grid-cols-2">
        {(d.items ?? []).map((it: D, i: number) => (
          <Reveal key={i} delay={(i % 2) * 0.08}>
            <Link href={lk(it.url, l)} className="group flex items-start gap-6 border-t border-navy/15 py-8">
              <span className="font-display text-sm font-bold text-teal">0{i + 1}</span>
              <div className="flex-1"><h3 className="text-2xl font-semibold transition group-hover:text-teal">{tx(it.title, l)}</h3>{tx(it.text, l) && <p className="mt-2 leading-7 text-ink/70">{tx(it.text, l)}</p>}</div>
              <ArrowUpRight className="mt-1 text-navy/40 transition group-hover:text-teal" />
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export function Life({ d, l }: { d: D; l: Locale }) {
  return (
    <section className="bg-mist py-24 lg:py-32">
      <div className="wrap">
        <Reveal><h2 className="max-w-4xl text-4xl font-semibold leading-[1.1] md:text-6xl"><SplitText text={tx(d.title, l)} /></h2></Reveal>
        <ul className="mt-14 grid grid-cols-2 gap-3 md:grid-cols-4">
          {(d.items ?? []).map((it: D, i: number) => (
            <li key={i} className="group relative aspect-[4/5] overflow-hidden bg-navy">
              {it.image?.endsWith(".svg") ? (
                <div className="absolute inset-0 grid place-items-center bg-teal transition duration-700 group-hover:scale-105">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={it.image} alt={tx(it.title, l)} className="h-1/2 w-1/2 object-contain" /></div>
              ) : <Photo src={it.image} alt={tx(it.title, l)} className="absolute inset-0 h-full w-full transition duration-700 group-hover:scale-110" />}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/90 via-navy/50 to-transparent p-5 pt-20"><span className="font-display text-lg font-semibold text-white">{tx(it.title, l)}</span></div>
            </li>
          ))}
        </ul>
        <Link href={`/${l}/galeri`} className="btn-outline mt-10">{l === "tr" ? "Foto Galeri" : "Photo Gallery"}</Link>
      </div>
    </section>
  );
}

export async function AchievementsSection({ d, l }: { d: D; l: Locale }) {
  const items = await db.achievement.findMany({ where: liveSimple, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], take: 4, include: { image: true } });
  if (!items.length) return null;
  return (
    <section className="wrap py-24 lg:py-32">
      <Reveal><Head d={d} l={l} /></Reveal>
      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
        {items.map((a, i) => (
          <Reveal key={a.id} delay={i * 0.07}>
            <Photo src={a.image?.url} alt="" ratio="4/3" className="w-full" />
            {a.year && <p className="mt-4 text-sm font-semibold text-teal">{a.year}</p>}
            <h3 className="mt-1 text-xl font-semibold">{tx(a.title, l)}</h3>
            <p className="mt-2 text-ink/70">{tx(a.summary, l)}</p>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export async function NewsSection({ d, l }: { d: D; l: Locale }) {
  const items = await db.newsArticle.findMany({ where: live(), orderBy: [{ featured: "desc" }, { publishAt: "desc" }, { createdAt: "desc" }], take: 3, include: { cover: true, category: true } });
  if (!items.length) return null;
  return (
    <section className="bg-mist py-24 lg:py-32">
      <div className="wrap">
        <div className="flex items-end justify-between gap-6"><Reveal><Head d={d} l={l} /></Reveal><Link href={`/${l}/haberler`} className="btn-outline hidden md:inline-flex">{ui(l).allNews}</Link></div>
        <div className="mt-12 grid gap-8 md:grid-cols-3">
          {items.map((n, i) => (
            <Reveal key={n.id} delay={i * 0.08}>
              <Link href={`/${l}/haberler/${n.slug}`} className="group block">
                <div className="overflow-hidden"><Photo src={n.cover?.url} alt="" ratio="3/2" className="w-full transition duration-700 group-hover:scale-105" /></div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-teal">{n.category ? tx(n.category.name, l) : ""} · {fmtDate(n.publishAt ?? n.createdAt, l)}</p>
                <h3 className="mt-2 text-xl font-semibold transition group-hover:text-teal">{tx(n.title, l)}</h3>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export async function Testimonials({ d, l }: { d: D; l: Locale }) {
  const items = await db.testimonial.findMany({ where: { ...liveSimple, consent: true }, orderBy: { sortOrder: "asc" }, take: 3, include: { photo: true } });
  if (!items.length) return null;
  return (
    <section className="wrap py-24 lg:py-32">
      <Reveal><Head d={d} l={l} /></Reveal>
      <div className="mt-12 grid gap-10 md:grid-cols-3">
        {items.map((t) => (
          <Reveal key={t.id}>
            <figure className="border-t-2 border-amber pt-6"><blockquote className="font-display text-xl leading-8 text-navy">“{tx(t.quote, l)}”</blockquote><figcaption className="mt-5 text-sm text-ink/70">{t.author}{tx(t.relation, l) ? ` — ${tx(t.relation, l)}` : ""}</figcaption></figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export async function CtaSection({ d, l }: { d: D; l: Locale }) {
  const { logoUrl } = await getSettings();
  return (
    <section className="relative overflow-hidden bg-navy py-28 text-white">
      <div className="absolute inset-0 opacity-30"><Parallax amount={60} className="h-full"><Photo src={d.image} className="h-[130%] w-full" /></Parallax></div>
      <LogoBadge src={logoUrl} size="lg" className="absolute right-8 top-1/2 hidden -translate-y-1/2 lg:grid xl:right-24" />
      <div className="wrap relative">
        <Reveal>
          <h2 className="max-w-4xl text-4xl font-semibold leading-[1.08] !text-white md:text-6xl"><SplitText text={tx(d.title, l)} /></h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">{tx(d.text, l)}</p>
          <div className="mt-10 flex flex-wrap gap-3"><Link href={lk(d.btn1Url, l)} className="btn-primary">{tx(d.btn1Label, l)}</Link><Link href={lk(d.btn2Url, l)} className="btn-ghost">{tx(d.btn2Label, l)}</Link></div>
        </Reveal>
      </div>
    </section>
  );
}
