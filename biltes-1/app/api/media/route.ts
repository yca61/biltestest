import { NextResponse } from "next/server";
import sharp from "sharp";
import { randomUUID } from "node:crypto";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { putObject, storageMode } from "@/lib/storage";
import { audit } from "@/lib/audit";
import { sameOrigin } from "@/lib/csrf";
import { rateLimit } from "@/lib/ratelimit";
import { slugify } from "@/lib/utils";

export const runtime = "nodejs";
const MAX = 12 * 1024 * 1024;
const IMG = new Set(["jpeg", "png", "webp", "gif", "avif"]);

export async function GET(req: Request) {
  const u = await currentUser();
  if (!u || !(can(u.role, "media") || can(u.role, "content"))) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const url = new URL(req.url);
  const q = url.searchParams.get("q")?.trim();
  const kind = url.searchParams.get("kind");
  const folder = url.searchParams.get("folder");
  const items = await db.mediaAsset.findMany({
    where: { ...(q ? { name: { contains: q, mode: "insensitive" } } : {}), ...(kind ? { kind } : {}), ...(folder ? { folder } : {}) },
    orderBy: { createdAt: "desc" }, take: 200,
  });
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const u = await currentUser();
  if (!u || !(can(u.role, "media") || can(u.role, "content"))) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  if (!sameOrigin(req)) return NextResponse.json({ error: "Geçersiz istek kaynağı" }, { status: 403 });
  if (storageMode() === "none") return NextResponse.json({ error: "Medya depolama yapılandırılmadı (S3_* değişkenleri)." }, { status: 503 });
  if (!(await rateLimit(`upload:${u.id}`, 120, 600))) return NextResponse.json({ error: "Çok fazla yükleme" }, { status: 429 });
  const fd = await req.formData();
  const file = fd.get("file");
  const folder = slugify(String(fd.get("folder") ?? "genel")).replace(/^$/, "genel");
  if (!(file instanceof File)) return NextResponse.json({ error: "Dosya yok" }, { status: 400 });
  if (file.size > MAX) return NextResponse.json({ error: "Dosya 12 MB sınırını aşıyor" }, { status: 413 });
  const buf = Buffer.from(await file.arrayBuffer());
  const base = slugify(file.name.replace(/\.[^.]+$/, "")) || "dosya";
  const id = randomUUID().slice(0, 8);
  const day = new Date().toISOString().slice(0, 7);

  // Tür doğrulaması dosya İÇERİĞİNE göre yapılır (uzantı/MIME beyanına güvenilmez).
  if (buf.subarray(0, 5).toString("latin1") === "%PDF-") {
    const key = `belgeler/${day}/${base}-${id}.pdf`;
    const url = await putObject(key, buf, "application/pdf");
    const a = await db.mediaAsset.create({ data: { key, url, kind: "document", mime: "application/pdf", size: buf.length, folder: folder === "genel" ? "belgeler" : folder, name: file.name.slice(0, 200) } });
    await audit(u.id, "media.upload", "media", a.id, file.name);
    return NextResponse.json({ item: a });
  }
  try {
    const meta = await sharp(buf).metadata();
    if (!meta.format || !IMG.has(meta.format)) throw new Error("format");
    const pipeline = () => sharp(buf, { animated: meta.format === "gif" }).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true });
    const webp = await pipeline().webp({ quality: 82 }).toBuffer({ resolveWithObject: true });
    const key = `gorseller/${day}/${base}-${id}.webp`;
    const url = await putObject(key, webp.data, "image/webp");
    // Yedek olarak (eski tarayıcılar için) JPEG/PNG sürümü; EXIF metaverisi temizlenir.
    const hasAlpha = !!meta.hasAlpha;
    const fb = await pipeline()[hasAlpha ? "png" : "jpeg"](hasAlpha ? {} : { quality: 85, mozjpeg: true }).toBuffer();
    const fbKey = `gorseller/${day}/${base}-${id}.${hasAlpha ? "png" : "jpg"}`;
    const fbUrl = await putObject(fbKey, fb, hasAlpha ? "image/png" : "image/jpeg");
    const a = await db.mediaAsset.create({ data: { key: fbKey, url: fbUrl, webpUrl: url, kind: "image", mime: hasAlpha ? "image/png" : "image/jpeg", size: fb.length, width: webp.info.width, height: webp.info.height, folder, name: file.name.slice(0, 200), alt: { tr: "", en: "" } } });
    await audit(u.id, "media.upload", "media", a.id, file.name);
    return NextResponse.json({ item: a });
  } catch {
    return NextResponse.json({ error: "Desteklenmeyen veya bozuk dosya. Yalnızca JPG, PNG, WebP, GIF, AVIF ve PDF kabul edilir." }, { status: 415 });
  }
}
