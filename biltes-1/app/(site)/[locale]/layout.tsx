import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { ScrollProgress } from "@/components/Motion";
import { Preloader } from "@/components/Preloader";
import { CookieConsent } from "@/components/CookieConsent";
import "../../globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getMenu } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { isLocale, ui } from "@/lib/i18n";
import { siteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";
const display = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-display", display: "swap" });
const body = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-body", display: "swap" });


export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return { metadataBase: new URL(siteUrl()), title: { default: s.siteTitle, template: `%s | ${s.siteTitle}` }, description: s.siteDescription, icons: s.faviconUrl ? { icon: s.faviconUrl } : undefined };
}

const hex = (h: string) => { const m = /^#?([0-9a-f]{6})$/i.exec(h); if (!m) return null; const n = parseInt(m[1], 16); return `${n >> 16} ${(n >> 8) & 255} ${n & 255}`; };

export default async function RootLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const [s, menu, utility] = await Promise.all([getSettings(), getMenu("header"), getMenu("utility")]);
  const vars = [["navy", s.colors.navy], ["teal", s.colors.turquoise], ["accent", s.colors.accent]].map(([k, v]) => (hex(v) ? `--c-${k}:${hex(v)}` : "")).join(";");
  const org = {
    "@context": "https://schema.org", "@type": "EducationalOrganization", name: s.siteTitle, url: siteUrl(), logo: s.logoUrl || undefined,
    telephone: s.contact.phone || undefined, email: s.contact.email || undefined, sameAs: Object.values(s.social).filter(Boolean),
  };
  return (
    <html lang={locale} className={`${display.variable} ${body.variable}`}>
      <head><style dangerouslySetInnerHTML={{ __html: `:root{${vars}}` }} /></head>
      <body>
        <ScrollProgress />
        <Preloader logoUrl={s.logoUrl} siteTitle={s.siteTitle} tagline={locale === "tr" ? "Mutlulukla Başarıya Taşır!" : "Carrying Children to Success, Happily!"} />
        <a href="#icerik" className="sr-only z-[60] bg-white p-3 focus:not-sr-only focus:fixed focus:left-3 focus:top-3">{ui(locale).skip}</a>
        <Header locale={locale} menu={JSON.parse(JSON.stringify(menu))} utility={JSON.parse(JSON.stringify(utility))} logoUrl={s.logoUrl} logoMobileUrl={s.logoMobileUrl} cta={ui(locale).requestInfo} siteTitle={s.siteTitle} />
        <main id="icerik">{children}</main>
        <Footer locale={locale} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />
        <CookieConsent locale={locale} gaId={s.gaId} />
      </body>
    </html>
  );
}
