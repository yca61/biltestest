import type { Metadata } from "next";
import { tx, type Locale } from "./i18n";
import { siteUrl } from "./utils";
import { getSettings } from "./settings";

type Seo = { title?: unknown; description?: unknown; ogImage?: string } | null | undefined;

/** path: yerelsiz yol (örn. "/kampusler/sadabad"). hreflang + canonical + OG üretir. */
export async function buildMeta(locale: Locale, path: string, opts: { title: string; description?: string; seo?: Seo; image?: string | null; type?: "website" | "article" }): Promise<Metadata> {
  const s = await getSettings();
  const title = tx(opts.seo?.title, locale) || opts.title;
  const description = tx(opts.seo?.description, locale) || opts.description || s.siteDescription;
  const image = opts.seo?.ogImage || opts.image || undefined;
  const p = path === "/" ? "" : path;
  const url = `${siteUrl()}/${locale}${p}`;
  return {
    metadataBase: new URL(siteUrl()),
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages: { tr: `${siteUrl()}/tr${p}`, en: `${siteUrl()}/en${p}`, "x-default": `${siteUrl()}/tr${p}` } },
    openGraph: { title, description, url, siteName: s.siteTitle, locale: locale === "tr" ? "tr_TR" : "en_US", type: opts.type ?? "website", images: image ? [image] : undefined },
    twitter: { card: image ? "summary_large_image" : "summary", title, description, images: image ? [image] : undefined },
  };
}
