import { notFound } from "next/navigation";
import { HeroSlider } from "@/components/HeroSlider";
import * as S from "@/components/HomeSections";
import { Marquee } from "@/components/Motion";
import { getHeroSlides, getHomeSections } from "@/lib/content";
import { isLocale, tx, ui } from "@/lib/i18n";
import { buildMeta } from "@/lib/seo";
import { currentUser } from "@/lib/auth";
import { getSettings } from "@/lib/settings";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const s = await getSettings();
  return buildMeta(locale, "/", { title: s.siteTitle, description: s.siteDescription });
}

const MAP = { about: S.About, pillars: S.Pillars, programs: S.Programs, campuses: S.CampusesSection, approach: S.Approach, life: S.Life, achievements: S.AchievementsSection, news: S.NewsSection, testimonials: S.Testimonials, cta: S.CtaSection } as const;

export default async function Home({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ preview?: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const preview = (await searchParams).preview === "1" && !!(await currentUser());
  const [slides, sections] = await Promise.all([getHeroSlides(), getHomeSections()]);
  const t = ui(locale);
  const hero = slides.map((s) => ({ id: s.id, title: tx(s.title, locale), subtitle: tx(s.subtitle, locale), ctaLabel: tx(s.ctaLabel, locale), ctaUrl: s.ctaUrl ? (/^(https?:|\/(tr|en)\/)/.test(s.ctaUrl) ? s.ctaUrl : `/${locale}${s.ctaUrl}`) : "", desktop: s.desktop?.url ?? null, mobile: s.mobile?.url ?? null, video: s.videoUrl, overlay: s.overlay }));
  return (
    <>
      {hero.length > 0 && <HeroSlider logoUrl={(await getSettings()).logoUrl} slides={hero} labels={{ prev: t.prev, next: t.next, pause: t.pause, play: t.play, secondary: locale === "tr" ? "Kampüslerimizi İnceleyin" : "Explore Our Campuses", secondaryUrl: `/${locale}/kampusler` }} />}
      {(() => { const pl = sections.find((x) => x.key === "pillars" && x.visible); const w = ((pl?.data as { items?: { title: unknown }[] })?.items ?? []).map((i) => tx(i.title, locale)).filter(Boolean); return w.length ? <Marquee words={w} /> : null; })()}
      {sections.filter((s) => s.visible).map((s) => {
        const C = MAP[s.key as keyof typeof MAP] as React.ComponentType<{ d: Record<string, unknown>; l: typeof locale }> | undefined;
        const data = (preview && s.draft ? s.draft : s.data) as Record<string, unknown>;
        return C ? <C key={s.key} d={data} l={locale} /> : null;
      })}
    </>
  );
}
