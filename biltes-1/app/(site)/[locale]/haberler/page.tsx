import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Photo } from "@/components/Photo";
import { db } from "@/lib/db";
import { live } from "@/lib/content";
import { isLocale, tx, ui } from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";
import { fmtDate } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return isLocale(locale) ? buildMeta(locale, "/haberler", { title: locale === "tr" ? "Haberler & Duyurular" : "News & Announcements" }) : {};
}
export default async function News({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ kategori?: string; tur?: string; sayfa?: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.sayfa) || 1), per = 9;
  const where = { ...live(), ...(sp.kategori ? { category: { slug: sp.kategori } } : {}), ...(sp.tur === "duyuru" || sp.tur === "haber" ? { kind: sp.tur } : {}) };
  const [items, total, cats] = await Promise.all([
    db.newsArticle.findMany({ where, orderBy: [{ featured: "desc" }, { publishAt: "desc" }, { createdAt: "desc" }], skip: (page - 1) * per, take: per, include: { cover: true, category: true } }),
    db.newsArticle.count({ where }), db.newsCategory.findMany({ orderBy: { slug: "asc" } }),
  ]);
  const q = (o: Record<string, string | undefined>) => { const p = new URLSearchParams(Object.entries({ ...sp, sayfa: undefined, ...o }).filter(([, v]) => v) as [string, string][]); return `/${locale}/haberler${p.size ? `?${p}` : ""}`; };
  const title = locale === "tr" ? "Haberler & Duyurular" : "News & Announcements";
  return (
    <>
      <PageHero locale={locale} title={title} crumbs={[{ label: title }]} />
      <section className="wrap py-16">
        <div className="mb-10 flex flex-wrap gap-2">
          <Link href={q({ kategori: undefined, tur: undefined })} className={`rounded-full border px-4 py-2 text-sm ${!sp.kategori && !sp.tur ? "border-navy bg-navy text-white" : "border-navy/20"}`}>{ui(locale).all}</Link>
          {[["haber", locale === "tr" ? "Haberler" : "News"], ["duyuru", locale === "tr" ? "Duyurular" : "Announcements"]].map(([k, l]) => <Link key={k} href={q({ tur: k })} className={`rounded-full border px-4 py-2 text-sm ${sp.tur === k ? "border-navy bg-navy text-white" : "border-navy/20"}`}>{l}</Link>)}
          {cats.map((c) => <Link key={c.id} href={q({ kategori: c.slug })} className={`rounded-full border px-4 py-2 text-sm ${sp.kategori === c.slug ? "border-teal bg-teal text-white" : "border-navy/20"}`}>{tx(c.name, locale)}</Link>)}
        </div>
        {items.length === 0 ? <p>{ui(locale).noContent}</p> : (
          <div className="grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
            {items.map((n) => (
              <Link key={n.id} href={`/${locale}/haberler/${n.slug}`} className="group block">
                <div className="overflow-hidden"><Photo src={n.cover?.url} alt="" ratio="3/2" className="w-full transition duration-700 group-hover:scale-105" /></div>
                <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-teal">{n.category ? tx(n.category.name, locale) + " · " : ""}{fmtDate(n.publishAt ?? n.createdAt, locale)}</p>
                <h2 className="mt-2 text-2xl font-semibold transition group-hover:text-teal">{tx(n.title, locale)}</h2>
                <p className="mt-2 line-clamp-3 text-ink/70">{tx(n.excerpt, locale)}</p>
              </Link>
            ))}
          </div>
        )}
        {total > per && <nav className="mt-14 flex justify-center gap-2" aria-label="Sayfalama">{Array.from({ length: Math.ceil(total / per) }, (_, i) => <Link key={i} href={q({ sayfa: String(i + 1) })} aria-current={page === i + 1 ? "page" : undefined} className={`grid h-11 w-11 place-items-center rounded-full border ${page === i + 1 ? "bg-navy text-white" : "border-navy/20"}`}>{i + 1}</Link>)}</nav>}
      </section>
    </>
  );
}
