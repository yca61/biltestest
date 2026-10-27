import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { LeadPanel } from "@/components/admin/LeadPanel";
import { audit } from "@/lib/audit";

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) {
  const u = await requirePermission("leads.view");
  const { id } = await params;
  const l = await db.lead.findUnique({ where: { id }, include: { campus: true, notes: { orderBy: { createdAt: "desc" }, include: { author: true } }, history: { orderBy: { createdAt: "desc" } } } });
  if (!l) notFound();
  await audit(u.id, "lead.view", "lead", id);
  const staff = await db.user.findMany({ where: { role: { in: ["ADMISSIONS", "SUPER_ADMIN"] }, active: true }, select: { id: true, name: true } });
  const row = (k: string, v: React.ReactNode) => <div className="flex justify-between gap-6 border-b py-2.5 text-sm last:border-0"><dt className="text-ink/60">{k}</dt><dd className="text-right font-medium">{v || "—"}</dd></div>;
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <h1 className="text-2xl font-bold">{l.parentName}</h1>
        <dl className="bg-white p-5 shadow-sm">
          {row("Telefon", <a href={`tel:${l.phone}`} className="text-teal">{l.phone}</a>)}{row("E-posta", <a href={`mailto:${l.email}`} className="text-teal">{l.email}</a>)}{row("Kampüs", l.campus?.name)}{row("Kademe", l.level)}{row("Öğrenci yaş/sınıf", l.studentAge)}
          {row("Kaynak", l.source)}{row("Başvuru tarihi", l.createdAt.toLocaleString("tr-TR"))}{row("Aydınlatma onayı", l.privacyAccepted ? `Evet (${l.consentAt.toLocaleDateString("tr-TR")})` : "Hayır")}{row("Pazarlama izni", l.marketingConsent ? "Evet" : "Hayır")}{row("Saklama sonu", l.retainUntil?.toLocaleDateString("tr-TR"))}
        </dl>
        {l.message && <div className="bg-white p-5 shadow-sm"><h2 className="mb-2 font-semibold">Mesaj</h2><p className="whitespace-pre-wrap text-sm">{l.message}</p></div>}
        <div className="bg-white p-5 shadow-sm"><h2 className="mb-3 font-semibold">Notlar</h2><ul className="space-y-3 text-sm">{l.notes.map((n) => <li key={n.id} className="border-l-2 border-teal pl-3"><p className="whitespace-pre-wrap">{n.body}</p><p className="text-xs text-ink/50">{n.author?.name} · {n.createdAt.toLocaleString("tr-TR")}</p></li>)}{!l.notes.length && <li className="text-ink/50">Not yok.</li>}</ul></div>
        <div className="bg-white p-5 shadow-sm"><h2 className="mb-3 font-semibold">Geçmiş</h2><ul className="space-y-1 text-xs text-ink/70">{l.history.map((h) => <li key={h.id}>{h.createdAt.toLocaleString("tr-TR")} — {h.type}{h.detail ? `: ${h.detail}` : ""}</li>)}</ul></div>
      </div>
      <LeadPanel id={l.id} status={l.status} assigneeId={l.assigneeId} staff={staff} canDelete={can(u.role, "users")} />
    </div>
  );
}
