import { db } from "./db";

/** Başka kayıtlarca (ilişki veya JSON içindeki URL) kullanılan dosya silinemez. */
export async function usageCount(a: { id: string; url: string; webpUrl: string | null }) {
  const c = await db.mediaAsset.findUnique({ where: { id: a.id }, include: { _count: { select: { pages: true, campusMain: true, campusGallery: true, programs: true, articles: true, events: true, achievements: true, clubs: true, testimonials: true, heroDesktop: true, heroMobile: true } } } });
  let n = Object.values(c?._count ?? {}).reduce((x, y) => x + y, 0);
  const needles = [a.url, a.webpUrl].filter(Boolean) as string[];
  for (const needle of needles) {
    const [h, s, p, nw, pr] = await Promise.all([
      db.$queryRaw<{ c: bigint }[]>`SELECT count(*) c FROM "HomeSection" WHERE data::text LIKE ${"%" + needle + "%"} OR coalesce(draft::text,'') LIKE ${"%" + needle + "%"}`,
      db.$queryRaw<{ c: bigint }[]>`SELECT count(*) c FROM "WebsiteSetting" WHERE value::text LIKE ${"%" + needle + "%"}`,
      db.$queryRaw<{ c: bigint }[]>`SELECT count(*) c FROM "Page" WHERE blocks::text LIKE ${"%" + needle + "%"}`,
      db.$queryRaw<{ c: bigint }[]>`SELECT count(*) c FROM "NewsArticle" WHERE body::text LIKE ${"%" + needle + "%"}`,
      db.$queryRaw<{ c: bigint }[]>`SELECT count(*) c FROM "EducationProgram" WHERE body::text LIKE ${"%" + needle + "%"}`,
    ]);
    n += [h, s, p, nw, pr].reduce((t, r) => t + Number(r[0].c), 0);
  }
  return n;
}

