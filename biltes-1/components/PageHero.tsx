import Link from "next/link";
import { Photo } from "./Photo";
import { LogoBadge } from "./LogoBadge";
import { Parallax } from "./Motion";
import { getSettings } from "@/lib/settings";
import { siteUrl } from "@/lib/utils";
import type { Locale } from "@/lib/i18n";

export async function PageHero({ title, eyebrow, lead, image, crumbs, locale }: { title: string; eyebrow?: string; lead?: string; image?: string | null; crumbs: { label: string; href?: string }[]; locale: Locale }) {
  const { logoUrl } = await getSettings();
  const ld = { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [{ label: locale === "tr" ? "Ana Sayfa" : "Home", href: `/${locale}` }, ...crumbs].map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: c.href ? `${siteUrl()}${c.href}` : undefined })) };
  return (
    <header className="relative overflow-hidden bg-navy pb-16 pt-40 text-white md:pb-24 md:pt-52">
      {image && <div className="absolute inset-0 opacity-35"><Parallax amount={50} className="h-full"><Photo src={image} className="h-[130%] w-full" priority /></Parallax></div>}
      <LogoBadge src={logoUrl} size="md" className="absolute bottom-10 right-8 hidden md:grid xl:right-24" />
      <div className="wrap relative">
        <nav aria-label="Breadcrumb" className="mb-8 text-sm text-white/70">
          <ol className="flex flex-wrap gap-2"><li><Link href={`/${locale}`} className="hover:text-white">{locale === "tr" ? "Ana Sayfa" : "Home"}</Link></li>
            {crumbs.map((c, i) => <li key={i} className="flex gap-2"><span aria-hidden>/</span>{c.href ? <Link href={c.href} className="hover:text-white">{c.label}</Link> : <span aria-current="page" className="text-white">{c.label}</span>}</li>)}</ol>
        </nav>
        {eyebrow && <p className="eyebrow !text-amber">{eyebrow}</p>}
        <h1 className="mt-3 max-w-4xl text-4xl font-extrabold leading-[1.05] !text-white md:text-6xl">{title}</h1>
        {lead && <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">{lead}</p>}
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
    </header>
  );
}
