import Link from "next/link";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { HOME_SECTIONS } from "@/lib/forms";
import { moveSection, toggleSection } from "@/app/actions/admin";

export default async function Home() {
  await requirePermission("content");
  const rows = await db.homeSection.findMany({ orderBy: { sortOrder: "asc" } });
  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold">Anasayfa Oluşturucu</h1>
      <p className="mb-6 mt-1 text-sm text-ink/60">Bölümleri sıralayın, gizleyin veya düzenleyin. Taslaklar yalnızca <b>önizleme</b> ile görünür; <b>Yayınla</b> ile canlıya alınır. Hero slaytları ayrı bölümdedir.</p>
      <ul className="divide-y bg-white shadow-sm">
        {rows.map((s, i) => (
          <li key={s.key} className="flex items-center gap-3 p-4">
            <div className="flex flex-col"><form action={moveSection.bind(null, s.key, -1)}><button disabled={i === 0} className="px-2 text-ink/50 hover:text-navy disabled:opacity-20" aria-label="Yukarı">▲</button></form><form action={moveSection.bind(null, s.key, 1)}><button disabled={i === rows.length - 1} className="px-2 text-ink/50 hover:text-navy disabled:opacity-20" aria-label="Aşağı">▼</button></form></div>
            <div className="flex-1"><p className="font-semibold">{HOME_SECTIONS[s.key]?.label ?? s.key}</p>{s.draft != null && <span className="text-xs font-semibold text-amber">● Yayınlanmamış taslak var</span>}</div>
            <form action={toggleSection.bind(null, s.key, !s.visible)}><button className={`rounded-full px-3 py-1 text-xs font-semibold ${s.visible ? "bg-teal/15 text-teal" : "bg-ink/10 text-ink/60"}`}>{s.visible ? "Görünür" : "Gizli"}</button></form>
            <Link href={`/admin/anasayfa/${s.key}`} className="btn-outline !min-h-9 !px-4 text-sm">Düzenle</Link>
          </li>))}
      </ul>
      <a href="/tr?preview=1" target="_blank" className="mt-5 inline-block text-sm text-teal underline">Taslak önizlemesini aç →</a>
    </div>
  );
}
