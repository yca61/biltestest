import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { live, liveSimple } from "@/lib/content";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [pages, campuses, programs, news, events] = await Promise.all([
    db.page.findMany({ where: { ...live(), group: { not: "yasal" } }, select: { group: true, slug: true, updatedAt: true } }),
    db.campus.findMany({ where: liveSimple, select: { slug: true, updatedAt: true } }),
    db.educationProgram.findMany({ where: liveSimple, select: { slug: true, updatedAt: true } }),
    db.newsArticle.findMany({ where: live(), select: { slug: true, updatedAt: true } }),
    db.event.findMany({ where: liveSimple, select: { slug: true, updatedAt: true } }),
  ]);
  const paths: [string, Date?][] = [["", undefined], ["/kampusler"], ["/haberler"], ["/etkinlikler"], ["/galeri"], ["/iletisim"],
    ...pages.map((p) => [`/${p.group}/${p.slug}`, p.updatedAt] as [string, Date]), ...campuses.map((c) => [`/kampusler/${c.slug}`, c.updatedAt] as [string, Date]),
    ...programs.map((p) => [`/egitim/${p.slug}`, p.updatedAt] as [string, Date]), ...news.map((n) => [`/haberler/${n.slug}`, n.updatedAt] as [string, Date]), ...events.map((e) => [`/etkinlikler/${e.slug}`, e.updatedAt] as [string, Date])];
  return paths.flatMap(([p, d]) => (["tr", "en"] as const).map((l) => ({
    url: `${siteUrl()}/${l}${p}`, lastModified: d, alternates: { languages: { tr: `${siteUrl()}/tr${p}`, en: `${siteUrl()}/en${p}` } },
  })));
}
