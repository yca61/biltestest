import Link from "next/link";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { can, STATUS_LABEL } from "@/lib/permissions";
import { tx } from "@/lib/i18n";

export default async function Dashboard() {
  const u = await requireUser();
  const showLeads = can(u.role, "leads.view"), showContent = can(u.role, "content");
  const [leadsNew, leadsAll, leads, pending, media, pages, news, audits] = await Promise.all([
    showLeads ? db.lead.count({ where: { status: "NEW" } }) : 0, showLeads ? db.lead.count() : 0,
    showLeads ? db.lead.findMany({ orderBy: { createdAt: "desc" }, take: 6, include: { campus: true } }) : [],
    showContent ? db.newsArticle.count({ where: { OR: [{ status: "DRAFT" }, { status: "PUBLISHED", publishAt: { gt: new Date() } }] } }) : 0,
    can(u.role, "media") ? db.mediaAsset.count() : 0, showContent ? db.page.count({ where: { status: "PUBLISHED" } }) : 0, showContent ? db.newsArticle.count({ where: { status: "PUBLISHED" } }) : 0,
    showContent ? db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { user: { select: { name: true } } } }) : [],
  ]);
  const Stat = ({ l, v, href }: { l: string; v: number; href?: string }) => { const c = (<div className="bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{l}</p><p className="mt-2 font-display text-4xl font-extrabold text-navy">{v}</p></div>); return href ? <Link href={href} className="block transition hover:-translate-y-0.5">{c}</Link> : c; };
  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-bold">Merhaba, {u.name}</h1><p className="text-sm text-ink/60">BİLTES Koleji yönetim paneli</p></div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {showLeads && <><Stat l="Yeni başvuru" v={leadsNew} href="/admin/leads?status=NEW" /><Stat l="Toplam başvuru" v={leadsAll} href="/admin/leads" /></>}
        {showContent && <><Stat l="Yayındaki sayfa" v={pages} href="/admin/r/pages" /><Stat l="Yayındaki haber" v={news} href="/admin/r/news" /><Stat l="Taslak / zamanlanmış haber" v={pending} href="/admin/r/news?durum=DRAFT" /></>}
        {can(u.role, "media") && <Stat l="Medya dosyası" v={media} href="/admin/medya" />}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {showLeads && <section className="bg-white p-5 shadow-sm"><h2 className="mb-3 font-semibold">Son başvurular</h2><ul className="divide-y text-sm">{leads.map((l) => <li key={l.id}><Link href={`/admin/leads/${l.id}`} className="flex justify-between gap-3 py-2.5 hover:text-teal"><span>{l.parentName}<span className="text-ink/50"> · {l.campus?.name ?? "—"}</span></span><span className="text-xs">{STATUS_LABEL[l.status]}</span></Link></li>)}{!leads.length && <li className="py-6 text-center text-ink/50">Henüz başvuru yok.</li>}</ul></section>}
        {showContent && <section className="bg-white p-5 shadow-sm"><h2 className="mb-3 font-semibold">Son içerik değişiklikleri</h2><ul className="divide-y text-sm">{audits.map((a) => <li key={a.id} className="flex justify-between gap-3 py-2.5"><span>{a.user?.name ?? "Sistem"} · {a.action} {a.entity ?? ""} <span className="text-ink/50">{a.detail ? tx(a.detail, "tr").slice(0, 40) : ""}</span></span><span className="shrink-0 text-xs text-ink/50">{a.createdAt.toLocaleString("tr-TR", { dateStyle: "short", timeStyle: "short" })}</span></li>)}</ul></section>}
      </div>
    </div>
  );
}
