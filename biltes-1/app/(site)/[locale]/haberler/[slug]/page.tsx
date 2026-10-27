import { notFound } from "next/navigation";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { db } from "@/lib/db";
import { live } from "@/lib/content";
import { hasTranslation, isLocale, tx, ui } from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";
import { cleanHtml } from "@/lib/sanitize";
import { notFoundOr301 } from "@/lib/redirects";
import { fmtDate, siteUrl } from "@/lib/utils";

const get = (slug: string) => db.newsArticle.findFirst({ where: { slug, ...live() }, include: { cover: true, category: true, author: { select: { name: true } } } });

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const n = isLocale(locale) ? await get(slug) : null;
  return n ? buildMeta(locale as "tr", `/haberler/${slug}`, { title: tx(n.title, locale as "tr"), description: tx(n.excerpt, locale as "tr"), seo: n.seo as never, image: n.cover?.url, type: "article" }) : {};
}
export default async function Article({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const n = await get(slug);
  if (!n) return notFoundOr301(`/haberler/${slug}`);
  const related = await db.newsArticle.findMany({ where: { ...live(), id: { not: n.id }, ...(n.categoryId ? { categoryId: n.categoryId } : {}) }, take: 3, orderBy: { createdAt: "desc" }, include: { cover: true } });
  const ld = { "@context": "https://schema.org", "@type": "NewsArticle", headline: tx(n.title, locale), datePublished: (n.publishAt ?? n.createdAt).toISOString(), dateModified: n.updatedAt.toISOString(), image: n.cover?.url, author: n.author ? { "@type": "Person", name: n.author.name } : undefined, mainEntityOfPage: `${siteUrl()}/${locale}/haberler/${slug}` };
  return (
    <>
      <PageHero locale={locale} title={tx(n.title, locale)} eyebrow={`${n.category ? tx(n.category.name, locale) + " · " : ""}${fmtDate(n.publishAt ?? n.createdAt, locale)}`} crumbs={[{ label: locale === "tr" ? "Haberler" : "News", href: `/${locale}/haberler` }, { label: tx(n.title, locale) }]} />
      <article className="wrap max-w-4xl py-16">
        {locale !== "tr" && !hasTranslation(n.title, locale) && <p className="mb-8 bg-amber/15 p-4 text-sm">{ui(locale).translationPending}</p>}
        {n.cover && <Photo src={n.cover.url} alt={tx(n.cover.alt, locale)} ratio="16/9" className="mb-10 w-full" priority />}
        <div className="prose-site" dangerouslySetInnerHTML={{ __html: cleanHtml(tx(n.body, locale)) }} />
        {n.tags.length > 0 && <ul className="mt-10 flex flex-wrap gap-2">{n.tags.map((t) => <li key={t} className="rounded-full bg-mist px-3 py-1 text-sm text-navy">#{t}</li>)}</ul>}
      </article>
      {related.length > 0 && (
        <section className="bg-mist py-16"><div className="wrap"><h2 className="mb-8 text-3xl font-semibold">{locale === "tr" ? "İlgili Haberler" : "Related"}</h2>
          <div className="grid gap-8 md:grid-cols-3">{related.map((r) => <Link key={r.id} href={`/${locale}/haberler/${r.slug}`} className="group"><Photo src={r.cover?.url} ratio="3/2" className="w-full" /><h3 className="mt-3 text-lg font-semibold group-hover:text-teal">{tx(r.title, locale)}</h3></Link>)}</div></div></section>
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
