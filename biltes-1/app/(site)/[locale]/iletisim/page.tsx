import { notFound } from "next/navigation";
import { MapPin, Phone, Mail } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { LeadForm } from "@/components/LeadForm";
import { db } from "@/lib/db";
import { getCampuses } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { isLocale, ui } from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return isLocale(locale) ? buildMeta(locale, "/iletisim", { title: ui(locale).contact }) : {};
}
export default async function Contact({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [s, campuses] = await Promise.all([getSettings(), getCampuses()]);
  const t = ui(locale);
  void db;
  return (
    <>
      <PageHero locale={locale} title={t.contact} crumbs={[{ label: t.contact }]} />
      <section className="wrap grid gap-16 py-16 lg:grid-cols-12">
        <div className="space-y-10 lg:col-span-5">
          <ul className="space-y-4">
            {s.contact.phone && <li className="flex gap-4"><Phone className="mt-1 text-teal" /><a className="text-xl font-semibold text-navy" href={`tel:${s.contact.phone.replace(/[^\d+]/g, "")}`}>{s.contact.phone}</a></li>}
            {s.contact.email && <li className="flex gap-4"><Mail className="mt-1 text-teal" /><a className="text-xl font-semibold text-navy" href={`mailto:${s.contact.email}`}>{s.contact.email}</a></li>}
            {s.contact.address && <li className="flex gap-4"><MapPin className="mt-1 text-teal" />{s.contact.address}</li>}
          </ul>
          <div><h2 className="mb-4 text-2xl font-semibold">{t.campuses}</h2>
            <ul className="divide-y divide-navy/10 border-y border-navy/10">{campuses.map((c) => (
              <li key={c.id} className="py-4"><p className="font-semibold text-navy">{c.name}</p>{c.address && <p className="text-sm text-ink/70">{c.address}</p>}{c.phone && <a href={`tel:${c.phone.replace(/[^\d+]/g, "")}`} className="text-sm text-teal">{c.phone}</a>}
                {c.mapLinkUrl && <a href={c.mapLinkUrl} target="_blank" rel="noopener noreferrer" className="ml-4 text-sm text-teal underline">Google Maps</a>}</li>))}</ul></div>
        </div>
        <div className="lg:col-span-7"><h2 className="mb-6 text-3xl font-semibold">{t.requestInfo}</h2><LeadForm locale={locale} campuses={campuses.map((c) => ({ id: c.id, name: c.name }))} /></div>
      </section>
    </>
  );
}
