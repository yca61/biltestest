import Link from "next/link";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { can, STATUS_LABEL } from "@/lib/permissions";
import { leadWhere, type LeadQuery } from "@/lib/leads";
import { purgeExpiredLeads } from "@/app/actions/admin";

export default async function Leads({ searchParams }: { searchParams: Promise<LeadQuery & { sayfa?: string }> }) {
  const u = await requirePermission("leads.view");
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.sayfa) || 1), per = 25;
  const where = leadWhere(sp);
  const [rows, total, campuses, staff] = await Promise.all([
    db.lead.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * per, take: per, include: { campus: true, assignee: true } }), db.lead.count({ where }),
    db.campus.findMany({ select: { id: true, name: true } }), db.user.findMany({ where: { role: { in: ["ADMISSIONS", "SUPER_ADMIN"] }, active: true }, select: { id: true, name: true } }),
  ]);
  const qs = new URLSearchParams(Object.entries(sp).filter(([k, v]) => v && k !== "sayfa") as [string, string][]).toString();
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><h1 className="text-2xl font-bold">Başvurular <span className="text-base font-normal text-ink/50">({total})</span></h1>
        <div className="flex gap-2">{can(u.role, "leads.export") && <a href={`/api/leads/export?${qs}`} className="btn-outline !min-h-10">CSV dışa aktar</a>}
          {can(u.role, "users") && <form action={async () => { "use server"; await purgeExpiredLeads(); }}><button className="btn-outline !min-h-10" title="Saklama süresi dolan kayıtları kalıcı siler">Süresi dolanları sil</button></form>}</div></div>
      <form className="mb-4 grid gap-2 bg-white p-4 shadow-sm md:grid-cols-6">
        <input name="q" defaultValue={sp.q} placeholder="Ad, e-posta, telefon" className="field !py-2 md:col-span-2" />
        <select name="status" defaultValue={sp.status ?? ""} className="field !py-2"><option value="">Tüm durumlar</option>{Object.entries(STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
        <select name="campus" defaultValue={sp.campus ?? ""} className="field !py-2"><option value="">Tüm kampüsler</option>{campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
        <select name="assignee" defaultValue={sp.assignee ?? ""} className="field !py-2"><option value="">Tüm atananlar</option><option value="none">Atanmamış</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
        <div className="flex gap-2"><input type="date" name="from" defaultValue={sp.from} className="field !py-2" aria-label="Başlangıç" /><input type="date" name="to" defaultValue={sp.to} className="field !py-2" aria-label="Bitiş" /></div>
        <button className="btn-dark !min-h-10 md:col-span-6 md:w-fit">Filtrele</button>
      </form>
      <div className="overflow-x-auto bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="border-b bg-mist text-xs uppercase tracking-wide text-ink/60"><tr><th className="p-3">Tarih</th><th>Veli</th><th>Kampüs</th><th>Kademe</th><th>Durum</th><th>Atanan</th></tr></thead>
        <tbody>{rows.map((r) => <tr key={r.id} className="border-b last:border-0 hover:bg-mist/50"><td className="whitespace-nowrap p-3">{r.createdAt.toLocaleDateString("tr-TR")}</td><td><Link href={`/admin/leads/${r.id}`} className="font-medium text-navy hover:text-teal">{r.parentName}</Link><br /><span className="text-xs text-ink/50">{r.phone}</span></td><td>{r.campus?.name ?? "—"}</td><td>{r.level ?? "—"}</td><td><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${r.status === "NEW" ? "bg-amber/25" : "bg-mist"}`}>{STATUS_LABEL[r.status]}</span></td><td>{r.assignee?.name ?? "—"}</td></tr>)}
          {!rows.length && <tr><td colSpan={6} className="p-10 text-center text-ink/50">Kayıt bulunamadı.</td></tr>}</tbody></table></div>
      {total > per && <div className="mt-4 flex gap-2">{Array.from({ length: Math.ceil(total / per) }, (_, i) => <Link key={i} href={`/admin/leads?${qs}&sayfa=${i + 1}`} className={`grid h-9 w-9 place-items-center ${page === i + 1 ? "bg-navy text-white" : "bg-white"}`}>{i + 1}</Link>)}</div>}
    </div>
  );
}
