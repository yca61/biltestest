import { notFound } from "next/navigation";
import { MapPin, Phone, Mail } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Gallery } from "@/components/Gallery";
import { LeadForm } from "@/components/LeadForm";
import { db } from "@/lib/db";
import { live, liveSimple } from "@/lib/content";
import { isLocale, tx, txAny, ui } from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";
import { notFoundOr301 } from "@/lib/redirects";
import Link from "next/link";
import { fmtDate } from "@/lib/utils";

const get = (slug: string) => db.campus.findFirst({ where: { slug, ...liveSimple }, include: { mainImage: true, gallery: { include: { media: true }, orderBy: { sortOrder: "asc" } } } });

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const c = isLocale(locale) ? await get(slug) : null;
  return c ? buildMeta(locale as "tr", `/kampusler/${slug}`, { title: c.name, description: tx(c.description, locale as "tr"), seo: c.seo as never, image: c.mainImage?.url }) : {};
}
const embedVideo = (u: string) => { const y = /(?:youtu\.be\/|v=|embed\/)([\w-]{11})/.exec(u); return y ? `https://www.youtube-nocookie.com/embed/${y[1]}` : null; };

export default async function CampusPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();
  const c = await get(slug);
  if (!c) return notFoundOr301(`/kampusler/${slug}`);
  const [campuses, news] = await Promise.all([
    db.campus.findMany({ where: liveSimple, select: { id: true, name: true } }),
    db.newsArticle.findMany({ where: { ...live(), campusId: c.id }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]);
  const features = txAny<{ text: unknown }[]>(c.features ? { [locale]: c.features, tr: c.features } : null, locale, []);
  const t = ui(locale);
  const vid = c.videoUrl ? embedVideo(c.videoUrl) : null;
  const ld = { "@context": "https://schema.org", "@type": "School", name: c.name, telephone: c.phone || undefined, email: c.email || undefined, address: c.address ? { "@type": "PostalAddress", streetAddress: c.address, addressCountry: "TR" } : undefined, image: c.mainImage?.url };
  return (
    <>
      <PageHero locale={locale} title={c.name} eyebrow={tx(c.location, locale)} lead={tx(c.description, locale)} image={c.mainImage?.url} crumbs={[{ label: t.campuses, href: `/${locale}/kampusler` }, { label: c.name }]} />
      <div className="wrap grid gap-14 py-16 lg:grid-cols-12">
        <div className="space-y-14 lg:col-span-8">
          {features.length > 0 && <ul className="grid gap-4 sm:grid-cols-2">{features.map((f, i) => <li key={i} className="border-t-2 border-teal pt-3 font-medium text-navy">{tx(f.text, locale)}</li>)}</ul>}
          {c.gallery.length > 0 && <Gallery categories={false} items={c.gallery.map((g) => ({ src: g.media.url, alt: tx(g.media.alt, locale) }))} />}
          {vid && <div className="aspect-video bg-navy"><iframe src={vid} title={c.name} loading="lazy" allow="fullscreen" className="h-full w-full" /></div>}
          {c.mapEmbedUrl && c.mapEmbedUrl.startsWith("https://www.google.com/maps") && <iframe src={c.mapEmbedUrl} title={`${c.name} harita`} loading="lazy" className="h-96 w-full border-0" referrerPolicy="no-referrer-when-downgrade" />}
          {news.length > 0 && <div><h2 className="mb-6 text-3xl font-semibold">{locale === "tr" ? "Kampüsten Haberler" : "Campus news"}</h2><ul className="divide-y divide-navy/10 border-y border-navy/10">{news.map((n) => <li key={n.id}><Link className="flex justify-between gap-4 py-4 hover:text-teal" href={`/${locale}/haberler/${n.slug}`}><span className="font-medium">{tx(n.title, locale)}</span><span className="text-sm text-ink/60">{fmtDate(n.publishAt ?? n.createdAt, locale)}</span></Link></li>)}</ul></div>}
        </div>
        <aside className="space-y-8 lg:col-span-4">
          <div className="bg-mist p-7">
            <h2 className="text-xl font-semibold">{t.contact}</h2>
            <ul className="mt-4 space-y-3 text-[15px]">
              {c.address && <li className="flex gap-3"><MapPin size={18} className="mt-1 shrink-0 text-teal" />{c.address}</li>}
              {c.phone && <li className="flex gap-3"><Phone size={18} className="mt-1 shrink-0 text-teal" /><a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>{c.phone}</a></li>}
              {c.email && <li className="flex gap-3"><Mail size={18} className="mt-1 shrink-0 text-teal" /><a href={`mailto:${c.email}`} className="break-all">{c.email}</a></li>}
            </ul>
            {c.mapLinkUrl && <a href={c.mapLinkUrl} target="_blank" rel="noopener noreferrer" className="btn-outline mt-6 w-full">{locale === "tr" ? "Yol tarifi al" : "Get directions"}</a>}
          </div>
          <div className="border border-navy/10 p-7">
            <h2 className="mb-5 text-xl font-semibold">{t.requestInfo}</h2>
            <LeadForm locale={locale} campuses={campuses} source="kampus-formu" defaultCampusId={c.id} />
          </div>
        </aside>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </>
  );
}
