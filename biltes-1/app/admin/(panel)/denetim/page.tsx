import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
export default async function Audit() {
  await requirePermission("audit");
  const rows = await db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 300, include: { user: { select: { name: true, email: true } } } });
  return (<div><h1 className="mb-6 text-2xl font-bold">Denetim Kayıtları</h1><div className="overflow-x-auto bg-white shadow-sm"><table className="w-full text-left text-xs"><thead className="border-b bg-mist uppercase tracking-wide text-ink/60"><tr><th className="p-3">Zaman</th><th>Kullanıcı</th><th>İşlem</th><th>Kaynak</th><th>Ayrıntı</th><th>IP</th></tr></thead>
    <tbody>{rows.map((r) => <tr key={r.id} className="border-b last:border-0"><td className="whitespace-nowrap p-3">{r.createdAt.toLocaleString("tr-TR")}</td><td>{r.user?.email ?? "—"}</td><td className="font-medium">{r.action}</td><td>{r.entity}</td><td>{r.detail}</td><td>{r.ip}</td></tr>)}</tbody></table></div></div>);
}
