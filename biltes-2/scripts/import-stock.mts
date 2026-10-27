// Unsplash (ücretsiz lisans) yer tutucu fotoğrafları — gerçek okul fotoğrafı DEĞİLDİR; panelden değiştirilebilir.
import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
const db = new PrismaClient();
const items: [string, string, string, string][] = [
  ["drama.jpg", "Drama", "Kostümlü çocukların sahne oyunu (Unsplash, temsili görsel)", "Drama"],
  ["buz-pateni.jpg", "Buz pateni", "Açık hava buz pistinde patenle kayan çocuklar (Unsplash, temsili görsel)", "Buz Pateni"],
  ["satranc.jpg", "Satranç", "Satranç tahtası başında çocuk (Unsplash, temsili görsel)", "Satranç"],
];
const hs = await db.homeSection.findUniqueOrThrow({ where: { key: "life" } });
const d = hs.data as any; // eslint-disable-line
for (const [f, name, alt, title] of items) {
  const key = `stok/${f.replace(".jpg", "")}.jpg`;
  const p = () => sharp(path.join(process.argv[2], f)).rotate().resize({ width: 2000, withoutEnlargement: true });
  const m = await p().jpeg({ quality: 85, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  const out = (k: string) => path.join(process.cwd(), "public", "uploads", k);
  await fs.mkdir(path.dirname(out(key)), { recursive: true });
  await fs.writeFile(out(key), m.data); await fs.writeFile(out(key.replace(".jpg", ".webp")), await p().webp({ quality: 82 }).toBuffer());
  const a = await db.mediaAsset.upsert({ where: { key }, update: {}, create: { key, url: `/uploads/${key}`, webpUrl: `/uploads/${key.replace(".jpg", ".webp")}`, kind: "image", mime: "image/jpeg", size: m.data.length, width: m.info.width, height: m.info.height, folder: "stok", name: `${name} (stok)`, alt: { tr: alt, en: "" } } });
  d.items.forEach((it: any) => { if (it.title.tr === title) it.image = a.url; }); // eslint-disable-line
}
await db.homeSection.update({ where: { key: "life" }, data: { data: d } });
console.log("tamam"); await db.$disconnect();
