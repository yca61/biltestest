import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { leadWhere } from "@/lib/leads";

const esc = (v: unknown) => { let s = String(v ?? ""); if (/^[=+\-@\t\r]/.test(s)) s = "'" + s; return `"${s.replace(/"/g, '""')}"`; }; // CSV formül enjeksiyonu önlemi

export async function GET(req: Request) {
  const u = await currentUser();
  if (!u || !can(u.role, "leads.export")) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const sp = Object.fromEntries(new URL(req.url).searchParams);
  const rows = await db.lead.findMany({ where: leadWhere(sp), orderBy: { createdAt: "desc" }, include: { campus: true, assignee: true }, take: 5000 });
  const head = ["Tarih", "Veli", "Telefon", "E-posta", "Kampüs", "Kademe", "Öğrenci yaş/sınıf", "Durum", "Atanan", "Pazarlama izni", "Mesaj"];
  const body = rows.map((r) => [r.createdAt.toISOString(), r.parentName, r.phone, r.email, r.campus?.name, r.level, r.studentAge, r.status, r.assignee?.name, r.marketingConsent ? "Evet" : "Hayır", r.message].map(esc).join(","));
  await audit(u.id, "lead.export", "lead", undefined, `${rows.length} kayıt`);
  return new NextResponse("﻿" + [head.map(esc).join(","), ...body].join("\r\n"), { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="basvurular-${new Date().toISOString().slice(0, 10)}.csv"`, "Cache-Control": "no-store" } });
}
