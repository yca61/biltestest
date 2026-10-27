import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Reveal } from "@/components/Reveal";
import { db } from "@/lib/db";
import { live, liveSimple } from "@/lib/content";
import { GROUPS } from "@/lib/groups";
import { isLocale, tx } from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";
import { notFoundOr301 } from "@/lib/redirects";
import { getSettings } from "@/lib/settings";

export async function generateMetadata({ params }: { params: Promise<{ locale: string; group: string }> }) {
  const { locale, group } = await params;
  return isLocale(locale) && GROUPS[group] ? buildMeta(locale, `/${group}`, { title: GROUPS[group][locale] }) : {};
}
export default async function GroupIndex({ params }: { params: Promise<{ locale: string; group: string }> }) {
  const { locale, group } = await params;
  if (!isLocale(locale)) notFound();
  if (!GROUPS[group]) return notFoundOr301(`/${group}`);
  const [pages, programs] = await Promise.all([
    db.page.findMany({ where: { group, ...live() }, orderBy: { sortOrder: "asc" } }),
    group === "egitim" ? db.educationProgram.findMany({ where: liveSimple, orderBy: { sortOrder: "asc" } }) : Promise.resolve([]),
  ]);
  const items = [...programs.map((p) => ({ id: p.id, href: `/${locale}/egitim/${p.slug}`, title: tx(p.title, locale), text: tx(p.summary, locale) })), ...pages.map((p) => ({ id: p.id, href: `/${locale}/${group}/${p.slug}`, title: tx(p.title, locale), text: tx(p.summary, locale) }))];
  return (
    <>
      <PageHero locale={locale} title={GROUPS[group][locale]} image={(await getSettings()).groupImages[group]} crumbs={[{ label: GROUPS[group][locale] }]} />
      <section className="wrap grid gap-x-12 py-16 md:grid-cols-2">
        {items.map((it, i) => (
          <Reveal key={it.id} delay={(i % 2) * 0.06}>
            <Link href={it.href} className="group block border-t border-navy/15 py-7"><h2 className="text-2xl font-semibold transition group-hover:text-teal">{it.title}</h2>{it.text && <p className="mt-2 text-ink/70">{it.text}</p>}</Link>
          </Reveal>
        ))}
      </section>
    </>
  );
}
