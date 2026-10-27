import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Blocks } from "@/components/Blocks";
import { LeadForm } from "@/components/LeadForm";
import { Photo } from "@/components/Photo";
import { Gallery } from "@/components/Gallery";
import { db } from "@/lib/db";
import { getCampuses, live, liveSimple } from "@/lib/content";
import { GROUPS } from "@/lib/groups";
import { hasTranslation, isLocale, tx, txAny, ui, type Locale } from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";
import { notFoundOr301 } from "@/lib/redirects";
import { getSettings } from "@/lib/settings";

type Blk = { type: string };
async function load(group: string, slug: string) {
  if (!GROUPS[group]) return null;
  if (group === "egitim") {
    const p = await db.educationProgram.findFirst({ where: { slug, ...liveSimple }, include: { image: true } });
    if (p) return { kind: "program" as const, title: p.title, summary: p.summary, blocks: p.body, cover: p.image?.url, seo: p.seo, id: p.id };
  }
  const p = await db.page.findFirst({ where: { group, slug, ...live() }, include: { cover: true } });
  return p ? { kind: "page" as const, title: p.title, summary: p.summary, blocks: p.blocks, cover: p.cover?.url, seo: p.seo, id: p.id } : null;
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; group: string; slug: string }> }) {
  const { locale, group, slug } = await params;
  if (!isLocale(locale)) return {};
  const p = await load(group, slug);
  return p ? buildMeta(locale, `/${group}/${slug}`, { title: tx(p.title, locale), description: tx(p.summary, locale), seo: p.seo as never, image: p.cover }) : {};
}

async function Extras({ slug, locale }: { slug: string; locale: Locale }) {
  if (slug === "bilgi-talebi" || slug === "kampus-ziyareti") {
    const campuses = await getCampuses();
    return <div className="mt-12 max-w-3xl"><LeadForm locale={locale} campuses={campuses.map((c) => ({ id: c.id, name: c.name }))} source={slug === "kampus-ziyareti" ? "ziyaret" : "bilgi-talebi"} /></div>;
  }
  if (slug === "kulupler" || slug === "atolyeler") {
    const items = await db.club.findMany({ where: { ...liveSimple, kind: slug === "kulupler" ? { in: ["kulup", "spor", "sanat"] } : "atolye" }, orderBy: { sortOrder: "asc" }, include: { image: true } });
    if (!items.length) return null;
    return <div className="mt-12 grid gap-8 md:grid-cols-3">{items.map((c) => <div key={c.id}><Photo src={c.image?.url} ratio="4/3" className="w-full" /><h3 className="mt-3 text-xl font-semibold">{tx(c.title, locale)}</h3><p className="text-ink/70">{tx(c.summary, locale)}</p></div>)}</div>;
  }
  if (slug === "basarilarimiz") {
    const items = await db.achievement.findMany({ where: liveSimple, orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], include: { image: true } });
    if (!items.length) return null;
    return <div className="mt-12 grid gap-8 md:grid-cols-3">{items.map((a) => <div key={a.id}><Photo src={a.image?.url} ratio="4/3" className="w-full" />{a.year && <p className="mt-3 text-sm font-semibold text-teal">{a.year}</p>}<h3 className="text-xl font-semibold">{tx(a.title, locale)}</h3><p className="text-ink/70">{tx(a.summary, locale)}</p></div>)}</div>;
  }
  if (slug === "veli-yorumlarimiz") {
    const items = await db.testimonial.findMany({ where: { ...liveSimple, consent: true }, orderBy: { sortOrder: "asc" } });
    if (!items.length) return null;
    return <div className="mt-12 grid gap-10 md:grid-cols-2">{items.map((t) => <figure key={t.id} className="border-t-2 border-amber pt-5"><blockquote className="font-display text-xl leading-8 text-navy">“{tx(t.quote, locale)}”</blockquote><figcaption className="mt-3 text-sm text-ink/70">{t.author}</figcaption></figure>)}</div>;
  }
  return null;
}
void Gallery;

export default async function InnerPage({ params }: { params: Promise<{ locale: string; group: string; slug: string }> }) {
  const { locale, group, slug } = await params;
  if (!isLocale(locale)) notFound();
  const p = await load(group, slug);
  if (!p) return notFoundOr301(`/${group}/${slug}`);
  const blocks = txAny<Blk[]>(p.blocks, locale, []);
  const siblings = group === "egitim" ? [] : await db.page.findMany({ where: { group, ...live() }, orderBy: { sortOrder: "asc" }, select: { slug: true, title: true } });
  const g = GROUPS[group][locale];
  return (
    <>
      <PageHero locale={locale} title={tx(p.title, locale)} eyebrow={g} lead={tx(p.summary, locale)} image={p.cover ?? (await getSettings()).groupImages[group]} crumbs={[{ label: g, href: `/${locale}/${group}` }, { label: tx(p.title, locale) }]} />
      <div className="wrap grid gap-14 py-16 lg:grid-cols-12">
        {siblings.length > 1 && (
          <aside className="hidden lg:col-span-3 lg:block"><nav aria-label={g} className="sticky top-32"><ul className="border-l border-navy/15">
            {siblings.map((s) => <li key={s.slug}><Link href={`/${locale}/${group}/${s.slug}`} aria-current={s.slug === slug ? "page" : undefined} className={`-ml-px block border-l-2 py-2 pl-5 text-[15px] transition ${s.slug === slug ? "border-teal font-semibold text-navy" : "border-transparent text-ink/70 hover:text-teal"}`}>{tx(s.title, locale)}</Link></li>)}</ul></nav></aside>
        )}
        <div className={siblings.length > 1 ? "lg:col-span-9" : "lg:col-span-12"}>
          {locale !== "tr" && !hasTranslation(p.title, locale) && <p className="mb-8 bg-amber/15 p-4 text-sm">{ui(locale).translationPending}</p>}
          {blocks.length ? <Blocks blocks={blocks as never} locale={locale} /> : !["bilgi-talebi", "kampus-ziyareti", "kulupler", "atolyeler", "basarilarimiz", "veli-yorumlarimiz"].includes(slug) && <p className="text-ink/60">{ui(locale).noContent}</p>}
          <Extras slug={slug} locale={locale} />
        </div>
      </div>
    </>
  );
}
