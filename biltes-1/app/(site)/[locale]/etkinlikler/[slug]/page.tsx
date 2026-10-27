import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { db } from "@/lib/db";
import { liveSimple } from "@/lib/content";
import { isLocale, tx } from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";
import { notFoundOr301 } from "@/lib/redirects";
import { siteUrl } from "@/lib/utils";

const get = (slug: string) => db.event.findFirst({ where: { slug, ...liveSimple }, include: { image: true, campus: true } });
export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const e = isLocale(locale) ? await get(slug) : null;
  return e ? buildMeta(locale as "tr", `/etkinlikler/${slug}`, { title: tx(e.title, locale as "tr"), description: tx(e.description, locale as "tr"), seo: e.seo as never, image: e.image?.url }) : {};
}
export default async function EventPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const e = await get(slug);
  if (!e) return notFoundOr301(`/etkinlikler/${slug}`);
  const when = new Intl.DateTimeFormat(locale === "tr" ? "tr-TR" : "en-GB", { dateStyle: "full", timeStyle: "short" }).format(e.startsAt);
  const ld = { "@context": "https://schema.org", "@type": "Event", name: tx(e.title, locale), startDate: e.startsAt.toISOString(), endDate: e.endsAt?.toISOString(), location: e.location || e.campus?.name, image: e.image?.url, url: `${siteUrl()}/${locale}/etkinlikler/${slug}` };
  return (
    <>
      <PageHero locale={locale} title={tx(e.title, locale)} eyebrow={when} crumbs={[{ label: locale === "tr" ? "Etkinlikler" : "Events", href: `/${locale}/etkinlikler` }, { label: tx(e.title, locale) }]} />
      <div className="wrap grid max-w-5xl gap-10 py-16 md:grid-cols-3">
        <div className="md:col-span-2"><Photo src={e.image?.url} ratio="16/9" className="mb-8 w-full" /><p className="whitespace-pre-line text-lg leading-8">{tx(e.description, locale)}</p></div>
        <aside className="h-fit bg-mist p-6 text-sm"><p className="font-semibold text-navy">{when}</p>{(e.location || e.campus) && <p className="mt-2">{e.location ?? e.campus?.name}</p>}
          {e.registerUrl && <a href={e.registerUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 w-full">{locale === "tr" ? "Kayıt ol" : "Register"}</a>}</aside>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
