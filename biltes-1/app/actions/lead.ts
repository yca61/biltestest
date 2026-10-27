"use server";
import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { leadSchema } from "@/lib/leadSchema";
import { rateLimit } from "@/lib/ratelimit";
import { clientIp } from "@/lib/audit";
import { sendMail } from "@/lib/mail";
import { cleanText } from "@/lib/sanitize";

export type LeadState = { ok: boolean; errors?: Record<string, string>; message?: string };
const RETAIN_DAYS = 730; // Saklama süresi: başvuru tarihinden 2 yıl (hukuk onayına tabi; ayarlanabilir)

export async function submitLead(_prev: LeadState, fd: FormData): Promise<LeadState> {
  const raw = Object.fromEntries(fd.entries());
  const parsed = leadSchema.safeParse(raw);
  if (!parsed.success) {
    const errors: Record<string, string> = {};
    for (const i of parsed.error.issues) errors[String(i.path[0])] ??= i.message;
    return { ok: false, errors };
  }
  const d = parsed.data;
  if (d.website) return { ok: true }; // bot: sessizce yut
  const ip = await clientIp();
  const ipHash = createHash("sha256").update(ip + (process.env.AUTH_SECRET ?? "")).digest("hex").slice(0, 32);
  if (!(await rateLimit(`lead:${ipHash}`, 5, 3600))) return { ok: false, message: "Çok fazla deneme yaptınız. Lütfen daha sonra tekrar deneyin." };

  let campusId: string | null = null;
  if (d.campusId) campusId = (await db.campus.findFirst({ where: { id: d.campusId, status: "PUBLISHED" }, select: { id: true } }))?.id ?? null;
  const lead = await db.lead.create({
    data: {
      parentName: cleanText(d.parentName), phone: cleanText(d.phone), email: d.email.toLowerCase(), campusId, level: d.level || null,
      studentAge: d.studentAge ? cleanText(d.studentAge) : null, message: d.message ? cleanText(d.message) : null, source: d.source,
      privacyAccepted: true, marketingConsent: d.marketing === "on", locale: d.locale, ipHash,
      retainUntil: new Date(Date.now() + RETAIN_DAYS * 864e5),
      history: { create: { type: "created", detail: `Kaynak: ${d.source}` } },
    },
    include: { campus: true },
  });
  const to = (process.env.LEAD_NOTIFY_TO ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  if (to.length) {
    // Bildirim e-postası kişisel veriyi ÇOK az içerir; ayrıntılar yalnızca panelde.
    sendMail(to, `Yeni bilgi talebi${lead.campus ? ` — ${lead.campus.name}` : ""}`, `Yeni bir başvuru alındı (${lead.source}). Ayrıntılar için yönetim panelini açın: ${process.env.SITE_URL ?? ""}/admin/leads/${lead.id}`).catch((e) => console.error("mail", e));
  }
  return { ok: true };
}
