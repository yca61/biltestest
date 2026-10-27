// Mevcut siteden indirilen logo/görselleri medya kitaplığına yükler ve ana sayfaya bağlar. Kullanım: tsx scripts/import-live-assets.mts <klasör>
import { PrismaClient, Prisma } from "@prisma/client";
import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";
const dir = process.argv[2];
const db = new PrismaClient();
const out = (p: string) => path.join(process.cwd(), "public", "uploads", p);

async function up(file: string, name: string, alt: string, folder = "genel", logo = false) {
  const base = file.replace(/\.[^.]+$/, "").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const key = `canli-site/${base}.${logo ? "png" : "jpg"}`;
  const old = await db.mediaAsset.findUnique({ where: { key } });
  if (old) return old;
  const buf = await fs.readFile(path.join(dir, file));
  const pipe = () => sharp(buf).rotate().resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true });
  const main = logo ? await pipe().png().toBuffer({ resolveWithObject: true }) : await pipe().jpeg({ quality: 85, mozjpeg: true }).toBuffer({ resolveWithObject: true });
  const webp = await pipe().webp({ quality: 82 }).toBuffer();
  await fs.mkdir(path.dirname(out(key)), { recursive: true });
  await fs.writeFile(out(key), main.data); await fs.writeFile(out(key.replace(/\.\w+$/, ".webp")), webp);
  return db.mediaAsset.create({ data: { key, url: `/uploads/${key}`, webpUrl: `/uploads/${key.replace(/\.\w+$/, ".webp")}`, kind: "image", mime: logo ? "image/png" : "image/jpeg", size: main.data.length, width: main.info.width, height: main.info.height, folder, name, alt: { tr: alt, en: "" } } });
}
const L = (tr: string, en = "") => ({ tr, en });
const A: Record<string, Awaited<ReturnType<typeof up>>> = {};
const list: [string, string, string, string?][] = [
  ["cropped-BILTES-LOGO-1.png", "BİLTES Koleji logosu", "BİLTES Koleji logosu", "marka"],
  ["IMG_5234-scaled.jpg", "Sınıfta öğrenciler", "Sınıfta ders çalışan öğrenciler"], ["IMG_6124-scaled.jpg", "Ortaokul sınıfı", "Sınıfta öğrenciler"],
  ["DSC_0069-scaled.jpg", "Bilgisayar laboratuvarı", "Bilgisayar laboratuvarında öğrenciler"], ["DSC_0052-1-scaled.jpg", "Anaokulu bahçesi", "Bahçede oyun oynayan çocuk"],
  ["bilteskolejigokturkkampusu.jpg", "Göktürk kampüsü", "BİLTES Koleji Göktürk kampüs binası"], ["sadabad-biltes-koleji-04.jpg", "Sadabad kampüsü", "BİLTES Koleji Sadabad kampüs binası"],
  ["sadabat_anaokulu-scaled.jpg", "Sadabad Anaokulu", "BİLTES Anaokulu Sadabad giriş cephesi"], ["biltes-koleji-anaokulu.jpg", "Anaokulu sınıfı", "Anaokulu sınıfı"],
  ["biltes-koleji-ilkokul-egitim-programi.jpg", "İlkokul", "İlkokul öğrencileri"], ["biltes-koleji-ortaokul-egitim-programi.jpg", "Ortaokul", "Ortaokul öğrencileri"],
  ["biltes-koleji-yabanci-dil-programi.jpg", "Yabancı dil", "Yabancı dil programı"], ["PYP.jpg", "PYP", "Tablet ile çalışan öğrenciler"],
  ["modern-dans-atolyesi.jpg", "Modern dans atölyesi", "Modern dans atölyesi", "galeri/atolyeler"], ["sanat-koordinatorlugu.jpg", "Bale", "Bale çalışması yapan öğrenciler", "galeri/atolyeler"],
  ["yeni-medya.jpg", "Yeni medya atölyesi", "Yeni medya atölyesi", "galeri/atolyeler"],
];
for (const [f, n, alt, folder] of list) A[f] = await up(f, n, alt, folder ?? "genel", f.includes("LOGO"));
const u = (f: string) => A[f].url;
const id = (f: string) => A[f].id;

// Logo + renkler (logodan örneklenen kurumsal renkler)
const set = (key: string, value: Prisma.InputJsonValue) => db.websiteSetting.upsert({ where: { key }, create: { key, value }, update: { value } });
await set("logoUrl", u("cropped-BILTES-LOGO-1.png")); await set("logoMobileUrl", u("cropped-BILTES-LOGO-1.png")); await set("faviconUrl", u("cropped-BILTES-LOGO-1.png"));
await set("colors", { navy: "#1B3A78", turquoise: "#D93A17", accent: "#F2A444" });

// Hero slaytları
await db.heroSlide.deleteMany();
const slides: [string, string, string, string, string, string][] = [
  ["Mutlulukla Başarıya Taşır!", "Bilim, teknoloji, eğitim ve sanatla geleceği şekillendiren bir öğrenme yolculuğu.", "BİLTES'i Keşfedin", "/kurumsal/hakkimizda", "biltes-koleji-ilkokul-egitim-programi.jpg", "Carrying Children to Success, Happily!"],
  ["Sadabad Kampüsü", "İstanbul'un merkezinde, modern imkânlarla öğrenme.", "Kampüsü İnceleyin", "/kampusler/sadabad", "sadabad-biltes-koleji-04.jpg", "Sadabad Campus"],
  ["Göktürk Kampüsü", "Ailelerin ve çocukların yeni buluşma noktası.", "Kampüsü İnceleyin", "/kampusler/gokturk", "bilteskolejigokturkkampusu.jpg", "Göktürk Campus"],
  ["Teknoloji ve Öğrenme", "Bilgisayar laboratuvarlarında üreten, keşfeden öğrenciler.", "Eğitim Programları", "/egitim", "DSC_0069-scaled.jpg", "Technology & Learning"],
];
for (const [i, [t, s, c, url, f, en]] of slides.entries()) await db.heroSlide.create({ data: { title: L(t, en), subtitle: L(s), ctaLabel: L(c), ctaUrl: url, desktopId: id(f), overlay: 40, sortOrder: i } });

// Programlar ve kampüsler
for (const [slug, f] of [["anaokulu", "biltes-koleji-anaokulu.jpg"], ["ilkokul", "biltes-koleji-ilkokul-egitim-programi.jpg"], ["ortaokul", "biltes-koleji-ortaokul-egitim-programi.jpg"]]) await db.educationProgram.update({ where: { slug }, data: { imageId: id(f) } });
for (const [slug, f] of [["sadabad", "sadabad-biltes-koleji-04.jpg"], ["sadabad-anaokulu", "sadabat_anaokulu-scaled.jpg"], ["gokturk", "bilteskolejigokturkkampusu.jpg"]]) {
  const c = await db.campus.update({ where: { slug }, data: { mainImageId: id(f) } });
  await db.campusGallery.deleteMany({ where: { campusId: c.id } }); await db.campusGallery.create({ data: { campusId: c.id, mediaId: id(f), sortOrder: 0 } });
}
// Ana sayfa bölümleri
const sec = async (key: string, patch: (d: any) => void) => { const r = await db.homeSection.findUniqueOrThrow({ where: { key } }); const d = r.data as any; patch(d); await db.homeSection.update({ where: { key }, data: { data: d } }); }; // eslint-disable-line
await sec("about", (d) => { d.image1 = u("IMG_6124-scaled.jpg"); d.image2 = u("IMG_5234-scaled.jpg"); });
await sec("approach", (d) => { const m = [null, "PYP.jpg", "biltes-koleji-yabanci-dil-programi.jpg", "DSC_0069-scaled.jpg", "yeni-medya.jpg", "IMG_5234-scaled.jpg"]; d.items.forEach((it: any, i: number) => { if (m[i]) it.image = u(m[i]!); }); });
await sec("life", (d) => { const m: Record<string, string> = { Dans: "modern-dans-atolyesi.jpg", Bale: "sanat-koordinatorlugu.jpg", Kodlama: "DSC_0069-scaled.jpg", "Sanat Atölyeleri": "yeni-medya.jpg" }; d.items.forEach((it: any) => { if (m[it.title.tr]) it.image = u(m[it.title.tr]); }); });
await sec("cta", (d) => { d.image = u("sadabad-biltes-koleji-04.jpg"); });
console.log("Yüklenen medya:", Object.keys(A).length);
await db.$disconnect();
