import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { db } from "@/lib/db";
import { liveSimple } from "@/lib/content";
import { isLocale, tx, ui } from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";
import { fmtDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return isLocale(locale) ? buildMeta(locale, "/etkinlikler", { title: locale === "tr" ? "Etkinlikler" : "Events" }) : {};
}
export default async function Events({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const now = new Date();
  const [up, past] = await Promise.all([
    db.event.findMany({ where: { ...liveSimple, startsAt: { gte: now } }, orderBy: { startsAt: "asc" }, include: { image: true, campus: true } }),
    db.event.findMany({ where: { ...liveSimple, startsAt: { lt: now } }, orderBy: { startsAt: "desc" }, take: 12, include: { image: true, campus: true } }),
  ]);
  const t = ui(locale);
  const List = ({ title, items }: { title: string; items: typeof up }) => (
    <section className="mb-16"><h2 className="mb-8 text-3xl font-semibold">{title}</h2>
      {items.length === 0 ? <p className="text-ink/60">{t.noContent}</p> : <div className="grid gap-8 md:grid-cols-3">{items.map((e) => (
        <Link key={e.id} href={`/${locale}/etkinlikler/${e.slug}`} className="group block"><Photo src={e.image?.url} ratio="3/2" className="w-full" />
          <p className="mt-4 text-sm font-semibold text-teal">{fmtDate(e.startsAt, locale)}{e.campus ? ` · ${e.campus.name}` : ""}</p><h3 className="mt-1 text-xl font-semibold group-hover:text-teal">{tx(e.title, locale)}</h3></Link>))}</div>}
    </section>
  );
  return (<><PageHero locale={locale} title={locale === "tr" ? "Etkinlikler" : "Events"} crumbs={[{ label: locale === "tr" ? "Etkinlikler" : "Events" }]} /><div className="wrap py-16"><List title={t.upcoming} items={up} /><List title={t.past} items={past} /></div></>);
}
