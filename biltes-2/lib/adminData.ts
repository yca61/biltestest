import { db } from "./db";
import type { Field } from "./forms";
import { tx } from "./i18n";

export async function relOptions() {
  const [campus, category] = await Promise.all([db.campus.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }), db.newsCategory.findMany({ select: { id: true, name: true } })]);
  return { campus: campus.map((c) => ({ value: c.id, label: c.name })), category: category.map((c) => ({ value: c.id, label: tx(c.name, "tr") })), page: [] as { value: string; label: string }[] };
}
/** Form değerindeki mediaId alanları için id→url önizleme haritası. */
export async function mediaMap(fields: Field[], value: Record<string, any>) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const ids = new Set<string>();
  const walk = (fs: Field[], v: any) => { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!v) return;
    for (const f of fs) {
      const x = v[f.name];
      if (f.type === "mediaId" && typeof x === "string") ids.add(x);
      else if (f.type === "group") walk(f.fields!, x);
      else if (f.type === "list" && Array.isArray(x)) x.forEach((it) => walk(f.fields!, it));
    }
  };
  walk(fields, value);
  if (!ids.size) return {};
  const rows = await db.mediaAsset.findMany({ where: { id: { in: [...ids] } }, select: { id: true, url: true } });
  return Object.fromEntries(rows.map((r) => [r.id, r.url]));
}
