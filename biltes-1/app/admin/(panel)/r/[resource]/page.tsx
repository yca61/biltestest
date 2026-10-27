import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { RESOURCES } from "@/lib/resources";

export default async function List({ params, searchParams }: { params: Promise<{ resource: string }>; searchParams: Promise<{ q?: string; durum?: string }> }) {
  const { resource } = await params;
  const res = RESOURCES[resource];
  if (!res) notFound();
  const user = await requirePermission(res.perm);
  const sp = await searchParams;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let rows: any[] = await (db as any)[res.model].findMany({ orderBy: res.orderBy, ...(res.hasStatus && sp.durum ? { where: { status: sp.durum } } : {}), take: 500 });
  if (res.campusScoped && !can(user.role, "campus.all")) rows = rows.filter((r) => user.campusIds.includes(r.id));
  const q = sp.q?.toLocaleLowerCase("tr");
  if (q) rows = rows.filter((r) => res.columns.some((c) => c.get(r).toLocaleLowerCase("tr").includes(q)));
  const canCreate = !(res.campusScoped && !can(user.role, "campus.all"));
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">{res.label}</h1>{canCreate && <Link href={`/admin/r/${resource}/yeni`} className="btn-primary !min-h-10">+ Yeni {res.singular}</Link>}</div>
      <form className="mb-4 flex flex-wrap gap-2"><input name="q" defaultValue={sp.q} placeholder="Ara…" className="field !w-64 !py-2" />
        {res.hasStatus && <select name="durum" defaultValue={sp.durum ?? ""} className="field !w-40 !py-2"><option value="">Tüm durumlar</option><option value="DRAFT">Taslak</option><option value="PUBLISHED">Yayında</option><option value="ARCHIVED">Arşiv</option></select>}
        <button className="btn-outline !min-h-10">Filtrele</button></form>
      <div className="overflow-x-auto bg-white shadow-sm"><table className="w-full text-left text-sm">
        <thead className="border-b bg-mist text-xs uppercase tracking-wide text-ink/60"><tr>{res.columns.map((c) => <th key={c.label} className="px-4 py-3">{c.label}</th>)}<th /></tr></thead>
        <tbody>{rows.map((r) => (<tr key={r.id} className="border-b last:border-0 hover:bg-mist/50">{res.columns.map((c, i) => <td key={c.label} className="px-4 py-3">{i === 0 ? <Link className="font-medium text-navy hover:text-teal" href={`/admin/r/${resource}/${r.id}`}>{c.get(r) || "(başlıksız)"}</Link> : c.get(r)}</td>)}<td className="px-4 py-3 text-right"><Link href={`/admin/r/${resource}/${r.id}`} className="text-teal">Düzenle</Link></td></tr>))}
          {!rows.length && <tr><td colSpan={res.columns.length + 1} className="px-4 py-10 text-center text-ink/50">Kayıt yok.</td></tr>}</tbody></table></div>
    </div>
  );
}
