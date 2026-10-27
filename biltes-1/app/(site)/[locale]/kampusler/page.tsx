import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { Reveal } from "@/components/Reveal";
import { getCampuses } from "@/lib/content";
import { isLocale, tx, ui } from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return isLocale(locale) ? buildMeta(locale, "/kampusler", { title: ui(locale).campuses }) : {};
}
export default async function Campuses({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const items = await getCampuses();
  return (
    <>
      <PageHero locale={locale} title={ui(locale).campuses} crumbs={[{ label: ui(locale).campuses }]} />
      <section className="wrap space-y-24 py-20">
        {items.length === 0 && <p>{ui(locale).noContent}</p>}
        {items.map((c, i) => (
          <Reveal key={c.id}>
            <Link href={`/${locale}/kampusler/${c.slug}`} className={`group grid items-center gap-10 lg:grid-cols-12 ${i % 2 ? "lg:[&>*:first-child]:order-2" : ""}`}>
              <div className="overflow-hidden lg:col-span-7"><Photo src={c.mainImage?.url} alt={tx(c.mainImage?.alt, locale) || c.name} ratio="16/10" className="w-full transition duration-[900ms] group-hover:scale-105" /></div>
              <div className="lg:col-span-5">
                <p className="eyebrow">{tx(c.location, locale)}</p>
                <h2 className="mt-3 text-4xl font-semibold">{c.name}</h2>
                <p className="mt-4 leading-8 text-ink/75">{tx(c.description, locale)}</p>
                {c.levels.length > 0 && <p className="mt-4 text-sm font-medium text-navy">{c.levels.map((l) => l[0].toUpperCase() + l.slice(1)).join(" · ")}</p>}
                <span className="mt-6 inline-flex items-center gap-2 border-b border-teal pb-1 font-semibold text-teal">{ui(locale).discover}<ArrowUpRight size={16} /></span>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>
    </>
  );
}
