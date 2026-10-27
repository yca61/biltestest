import { PrismaClient, Prisma } from "@prisma/client";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
const [imgDir, svgDir] = [process.argv[2], process.argv[3]];
const db = new PrismaClient();
const pub = (p: string) => path.join(process.cwd(), "public", "uploads", p);
const L = (tr: string) => ({ tr, en: "" });
async function img(file: string, name: string, alt: string, folder = "genel") {
  const key = `canli-site/${file.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-")}.jpg`;
  const ex = await db.mediaAsset.findUnique({ where: { key } }); if (ex) return ex;
  const p = () => sharp(path.join(imgDir, file)).rotate().resize({ width: 2400, withoutEnlargement: true });
  const m = await p().jpeg({ quality: 85, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  await fs.mkdir(path.dirname(pub(key)), { recursive: true });
  await fs.writeFile(pub(key), m.data); await fs.writeFile(pub(key.replace(".jpg", ".webp")), await p().webp({ quality: 82 }).toBuffer());
  return db.mediaAsset.create({ data: { key, url: `/uploads/${key}`, webpUrl: `/uploads/${key.replace(".jpg", ".webp")}`, kind: "image", mime: "image/jpeg", size: m.data.length, width: m.info.width, height: m.info.height, folder, name, alt: L(alt) } });
}
async function svg(file: string, name: string) {
  const key = `canli-site/ikon-${file}`;
  const ex = await db.mediaAsset.findUnique({ where: { key } }); if (ex) return ex;
  const buf = await fs.readFile(path.join(svgDir, file));
  if (/<script|onload|foreignObject/i.test(buf.toString())) throw new Error("güvenli olmayan SVG: " + file);
  await fs.mkdir(path.dirname(pub(key)), { recursive: true }); await fs.writeFile(pub(key), buf);
  return db.mediaAsset.create({ data: { key, url: `/uploads/${key}`, kind: "image", mime: "image/svg+xml", size: buf.length, folder: "ikonlar", name, alt: L(name) } });
}
const A = {
  psikolojik: await img("psikolojik-danismanlik-ve-rehberlik.jpg", "Psikolojik danışmanlık", "Öğrenci ile rehber öğretmen"),
  japon: await img("japon-kultur-koordinatorlugu.jpg", "Japon kültür", "Japon kalesi ve kiraz çiçekleri"),
  spor: await img("kemerburgaz-biltes-koleji-02.jpg", "Okul bahçesi ve spor sahası", "Okul bahçesi ve spor sahası"),
  yoga: await img("yoga-nefes.jpg", "Yoga ve nefes atölyesi", "Yoga ve nefes atölyesi", "galeri/atolyeler"),
  zeka: await img("akil-ve-zeka.jpg", "Akıl ve zeka oyunları atölyesi", "Akıl ve zeka oyunları atölyesi", "galeri/atolyeler"),
};
const S = { drama: await svg("young-actors-kulubu.svg", "Drama"), buz: await svg("anasayfa-buz-pateni.svg", "Buz pateni"), satranc: await svg("anasayfa-satranc.svg", "Satranç") };
const byKey = async (k: string) => (await db.mediaAsset.findUniqueOrThrow({ where: { key: `canli-site/${k}` } }));
const url = async (k: string) => (await byKey(k)).url;
const hl = await db.homeSection.findUniqueOrThrow({ where: { key: "life" } });
const d = hl.data as any; // eslint-disable-line
const m: Record<string, string> = { Drama: S.drama.url, "Buz Pateni": S.buz.url, "Satranç": S.satranc.url, Spor: A.spor.url };
d.items.forEach((it: any) => { if (m[it.title.tr]) it.image = m[it.title.tr]; }); // eslint-disable-line
await db.homeSection.update({ where: { key: "life" }, data: { data: d } });
const cover = async (group: string, slug: string, id: string) => db.page.update({ where: { group_slug: { group, slug } }, data: { coverId: id } });
await cover("hayat", "psikolojik-danismanlik-ve-rehberlik", A.psikolojik.id); await cover("uluslararasi", "kulturel-programlar", A.japon.id);
await cover("uluslararasi", "uluslararasi-kultur-gunleri", A.japon.id); await cover("hayat", "atolyeler", (await byKey("modern-dans-atolyesi.jpg")).id);
await cover("hayat", "saglik-ve-beslenme", A.yoga.id); await cover("egitim", "yabanci-dil-programi", (await byKey("biltes-koleji-yabanci-dil-programi.jpg")).id);
await cover("egitim", "pyp", (await byKey("pyp.jpg")).id); await cover("egitim", "bilim-teknoloji-egitim-sanat", (await byKey("dsc-0069-scaled.jpg")).id);
await cover("egitim", "uluslararasi-egitim-modeli", (await byKey("biltes-koleji-yabanci-dil-programi.jpg")).id); await cover("hayat", "kulupler", A.zeka.id);
await db.websiteSetting.upsert({ where: { key: "groupImages" }, create: { key: "groupImages", value: {} }, update: {} });
const gi = { kurumsal: await url("sadabad-biltes-koleji-04.jpg"), egitim: await url("biltes-koleji-ilkokul-egitim-programi.jpg"), hayat: await url("img-6124-scaled.jpg"), uluslararasi: A.japon.url, kayit: await url("biltes-koleji-anaokulu.jpg") };
await db.websiteSetting.update({ where: { key: "groupImages" }, data: { value: gi as Prisma.InputJsonValue } });
console.log("tamam");
await db.$disconnect();
