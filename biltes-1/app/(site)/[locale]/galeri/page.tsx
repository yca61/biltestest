import { notFound } from "next/navigation";
import { PageHero } from "@/components/PageHero";
import { Gallery } from "@/components/Gallery";
import { db } from "@/lib/db";
import { isLocale, tx, ui } from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return isLocale(locale) ? buildMeta(locale, "/galeri", { title: locale === "tr" ? "Foto Galeri" : "Photo Gallery" }) : {};
}
export default async function GalleryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  // Galeri = Medya Kitaplığı'nda klasörü "galeri" veya "galeri/<kategori>" olan görseller.
  const assets = await db.mediaAsset.findMany({ where: { kind: "image", OR: [{ folder: "galeri" }, { folder: { startsWith: "galeri/" } }] }, orderBy: { createdAt: "desc" } });
  const title = locale === "tr" ? "Foto Galeri" : "Photo Gallery";
  return (
    <>
      <PageHero locale={locale} title={title} crumbs={[{ label: title }]} />
      <section className="wrap py-16">
        {assets.length === 0 ? <p>{ui(locale).noContent}</p> : <Gallery allLabel={ui(locale).all} items={assets.map((a) => ({ src: a.webpUrl ?? a.url, alt: tx(a.alt, locale), category: a.folder.split("/")[1] }))} />}
      </section>
    </>
  );
}
