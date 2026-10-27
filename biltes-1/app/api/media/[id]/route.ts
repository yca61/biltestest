import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { deleteObject } from "@/lib/storage";
import { audit } from "@/lib/audit";
import { sameOrigin } from "@/lib/csrf";
import { cleanText } from "@/lib/sanitize";
import { slugify } from "@/lib/utils";
import { usageCount } from "@/lib/media";

async function guard(req: Request) {
  const u = await currentUser();
  if (!u || !can(u.role, "media")) return { err: NextResponse.json({ error: "Yetkisiz" }, { status: 403 }) };
  if (!sameOrigin(req)) return { err: NextResponse.json({ error: "Geçersiz istek kaynağı" }, { status: 403 }) };
  return { u };
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(req); if (g.err) return g.err;
  const { id } = await params;
  const b = await req.json();
  const a = await db.mediaAsset.update({ where: { id }, data: {
    name: cleanText(String(b.name ?? "")).slice(0, 200) || undefined, folder: b.folder ? (String(b.folder).split("/").map(slugify).filter(Boolean).join("/") || "genel") : undefined,
    alt: { tr: cleanText(String(b.alt?.tr ?? "")), en: cleanText(String(b.alt?.en ?? "")) },
  } });
  await audit(g.u!.id, "media.update", "media", id);
  return NextResponse.json({ item: a });
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await guard(req); if (g.err) return g.err;
  const { id } = await params;
  const a = await db.mediaAsset.findUnique({ where: { id } });
  if (!a) return NextResponse.json({ error: "Bulunamadı" }, { status: 404 });
  const n = await usageCount(a);
  if (n > 0) return NextResponse.json({ error: `Bu dosya ${n} yerde kullanılıyor; önce kullanımları kaldırın.` }, { status: 409 });
  await db.mediaAsset.delete({ where: { id } });
  await deleteObject(a.key).catch(() => {});
  if (a.webpUrl) await deleteObject(a.key.replace(/\.[a-z]+$/, ".webp")).catch(() => {});
  await audit(g.u!.id, "media.delete", "media", id, a.name);
  return NextResponse.json({ ok: true });
}
