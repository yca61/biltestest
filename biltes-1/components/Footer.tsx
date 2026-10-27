import Link from "next/link";
import { getMenu } from "@/lib/content";
import { getSettings } from "@/lib/settings";
import { db } from "@/lib/db";
import { tx, type Locale } from "@/lib/i18n";
import { Facebook, Instagram, MapPin, Phone, Mail, Twitter, Youtube } from "lucide-react";

const href = (u: string, l: Locale) => (/^(https?:|mailto:|tel:)/.test(u) ? u : `/${l}${u === "/" ? "" : u}`);

export async function Footer({ locale }: { locale: Locale }) {
  const [s, header, legal, campuses, programs] = await Promise.all([
    getSettings(), getMenu("header"), getMenu("footer-legal"),
    db.campus.findMany({ where: { status: "PUBLISHED" }, orderBy: { sortOrder: "asc" }, select: { slug: true, name: true } }),
    db.educationProgram.findMany({ where: { status: "PUBLISHED" }, orderBy: { sortOrder: "asc" }, select: { slug: true, title: true } }),
  ]);
  const tel = s.contact.phone.replace(/[^\d+]/g, "");
  const social = [[Facebook, s.social.facebook, "Facebook"], [Instagram, s.social.instagram, "Instagram"], [Twitter, s.social.twitter, "X / Twitter"], [Youtube, s.social.youtube, "YouTube"]] as const;
  return (
    <footer className="mt-24 bg-navy text-white/80">
      <div className="wrap grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-12">
        <div className="lg:col-span-4">
          {s.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={s.logoUrl} alt={s.siteTitle} className="h-20 w-auto rounded-md bg-white p-2" />
          ) : <p className="font-display text-3xl font-extrabold text-white">BİLTES<span className="ml-2 text-xs tracking-[.3em] text-teal">KOLEJİ</span></p>}
          <p className="mt-5 max-w-sm leading-7">{tx(s.footerText, locale)}</p>
          <ul className="mt-6 flex gap-3">
            {social.filter(([, u]) => u).map(([Icon, u, n]) => <li key={n}><a href={u} target="_blank" rel="noopener noreferrer" aria-label={n} className="grid h-10 w-10 place-items-center rounded-full border border-white/25 transition hover:border-teal hover:bg-teal"><Icon size={17} /></a></li>)}
          </ul>
        </div>
        <FooterCol title={locale === "tr" ? "Hızlı Erişim" : "Quick links"} links={header.filter((m) => m.url !== "/").map((m) => [tx(m.label, locale), href(m.url, locale)])} />
        <FooterCol title={locale === "tr" ? "Eğitim Programları" : "Programmes"} links={programs.map((p) => [tx(p.title, locale), `/${locale}/egitim/${p.slug}`])} />
        <FooterCol title={locale === "tr" ? "Kampüsler" : "Campuses"} links={campuses.map((c) => [c.name, `/${locale}/kampusler/${c.slug}`])} />
        <div className="lg:col-span-2">
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">{locale === "tr" ? "İletişim" : "Contact"}</h3>
          <ul className="space-y-3 text-sm">
            {s.contact.phone && <li className="flex gap-3"><Phone size={17} className="mt-0.5 shrink-0 text-amber" aria-hidden /><a href={`tel:${tel}`} className="hover:text-white">{s.contact.phone}</a></li>}
            {s.contact.email && <li className="flex gap-3"><Mail size={17} className="mt-0.5 shrink-0 text-amber" aria-hidden /><a href={`mailto:${s.contact.email}`} className="break-all hover:text-white">{s.contact.email}</a></li>}
            {s.contact.address && <li className="flex gap-3 leading-6"><MapPin size={17} className="mt-1 shrink-0 text-amber" aria-hidden />{s.contact.address}</li>}
            <li className="flex gap-3"><MapPin size={17} className="mt-0.5 shrink-0 text-amber" aria-hidden /><Link href={`/${locale}/iletisim`} className="hover:text-white">{locale === "tr" ? "Kampüs adresleri ve harita" : "Campus addresses & map"}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="wrap flex flex-col gap-3 py-6 text-xs md:flex-row md:items-center md:justify-between">
          <p>© {new Date().getFullYear()} {s.siteTitle}. {locale === "tr" ? "Tüm hakları saklıdır." : "All rights reserved."}</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">{legal.map((l) => <li key={l.id}><Link href={href(l.url, locale)} className="hover:text-white">{tx(l.label, locale)}</Link></li>)}</ul>
        </div>
      </div>
    </footer>
  );
}
function FooterCol({ title, links }: { title: string; links: string[][] }) {
  return (
    <div className="lg:col-span-2">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white">{title}</h3>
      <ul className="space-y-2 text-sm">{links.map(([t, h]) => <li key={h}><Link href={h} className="transition hover:text-white">{t}</Link></li>)}</ul>
    </div>
  );
}
