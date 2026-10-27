"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, ExternalLink, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { tx, type Locale } from "@/lib/i18n";

type Item = { id: string; label: unknown; url: string; external: boolean; children?: Item[] };

const href = (url: string, locale: Locale, external: boolean) => (external || /^(https?:|mailto:|tel:)/.test(url) ? url : `/${locale}${url === "/" ? "" : url}`);

export function Header({ locale, menu, utility, logoUrl, logoMobileUrl, cta, siteTitle }: { locale: Locale; menu: Item[]; utility: Item[]; logoUrl: string; logoMobileUrl: string; cta: string; siteTitle: string }) {
  const pathname = usePathname();
  const isHome = pathname === `/${locale}`;
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const [mobile, setMobile] = useState(false);
  const [mobSub, setMobSub] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { setMobile(false); setOpen(null); }, [pathname]);
  useEffect(() => { document.body.style.overflow = mobile ? "hidden" : ""; }, [mobile]);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && (setOpen(null), setMobile(false));
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  const solid = scrolled || !isHome || !!open || mobile;
  const other: Locale = locale === "tr" ? "en" : "tr";
  const switchHref = pathname.replace(/^\/(tr|en)/, `/${other}`);
  const active = (url: string) => { const h = href(url, locale, false); return url === "/" ? pathname === h : pathname === h || pathname.startsWith(h + "/"); };

  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 transition-all duration-500", solid ? "bg-white shadow-[0_1px_0_rgba(16,43,70,.08)]" : "bg-transparent")} onMouseLeave={() => { timer.current = setTimeout(() => setOpen(null), 120); }} onMouseEnter={() => clearTimeout(timer.current)}>
      <div className={cn("hidden border-b text-xs transition-all duration-500 lg:block", solid ? "h-0 overflow-hidden border-transparent opacity-0" : "border-white/15 text-white/85")}>
        <div className="wrap flex h-10 items-center justify-between">
          <ul className="flex items-center gap-6">
            {utility.map((u) => (
              <li key={u.id}><a href={href(u.url, locale, u.external)} target={u.external ? "_blank" : undefined} rel={u.external ? "noopener noreferrer" : undefined} className="inline-flex items-center gap-1 hover:text-white">{tx(u.label, locale)}{u.external && <ExternalLink size={11} aria-hidden />}</a></li>
            ))}
          </ul>
          <Link href={switchHref} hrefLang={other} lang={other} className="font-semibold tracking-widest hover:text-white" aria-label={other === "en" ? "Switch to English" : "Türkçe'ye geç"}>
            <span className={locale === "tr" ? "text-white" : "opacity-60"}>TR</span> / <span className={locale === "en" ? "text-white" : "opacity-60"}>EN</span>
          </Link>
        </div>
      </div>

      <div className="wrap flex h-[76px] items-center justify-between gap-6">
        <Link href={`/${locale}`} className="flex shrink-0 items-center" aria-label={siteTitle}>
          {logoUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoUrl} alt={siteTitle} className={cn("hidden h-14 w-auto rounded-md transition sm:block", !solid && "bg-white p-1")} />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={logoMobileUrl || logoUrl} alt={siteTitle} className={cn("h-11 w-auto rounded-md sm:hidden", !solid && "bg-white p-0.5")} />
            </>
          ) : (
            <span className={cn("font-display text-2xl font-extrabold tracking-tight transition-colors", solid ? "text-navy" : "text-white")}>BİLTES<span className="ml-2 text-[11px] font-semibold tracking-[.3em] text-teal">KOLEJİ</span></span>
          )}
        </Link>

        <nav aria-label="Ana menü" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {menu.map((m) => {
              const has = !!m.children?.length;
              return (
                <li key={m.id} className="relative" onMouseEnter={() => has && setOpen(m.id)}>
                  <div className="flex items-center">
                    <Link href={href(m.url, locale, m.external)} aria-current={active(m.url) ? "page" : undefined}
                      className={cn("relative whitespace-nowrap px-2 py-7 text-[13px] xl:px-3 xl:text-[13.5px] font-semibold transition-colors after:absolute after:inset-x-2 xl:after:inset-x-3 after:bottom-5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-teal after:transition-transform hover:after:scale-x-100", solid ? "text-navy" : "text-white", active(m.url) && "after:scale-x-100")}>
                      {tx(m.label, locale)}
                    </Link>
                    {has && (
                      <button aria-label={`${tx(m.label, locale)} alt menüsü`} aria-expanded={open === m.id} onClick={() => setOpen(open === m.id ? null : m.id)} className={cn("-ml-2 p-1", solid ? "text-navy" : "text-white")}>
                        <ChevronDown size={14} className={cn("transition-transform", open === m.id && "rotate-180")} />
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-3">
          <Link href={`/${locale}/kayit/bilgi-talebi`} className="btn-primary hidden !min-h-11 whitespace-nowrap !px-5 2xl:inline-flex">{cta}</Link>
          <Link href={switchHref} className={cn("text-xs font-bold tracking-widest lg:hidden", solid ? "text-navy" : "text-white")}>{other.toUpperCase()}</Link>
          <button className={cn("p-2 lg:hidden", solid ? "text-navy" : "text-white")} aria-label="Menü" aria-expanded={mobile} onClick={() => setMobile(!mobile)}>{mobile ? <X /> : <Menu />}</button>
        </div>
      </div>

      {/* Mega menü */}
      {menu.map((m) => m.children?.length ? (
        <div key={m.id} role="region" aria-label={tx(m.label, locale)} className={cn("absolute inset-x-0 top-full hidden origin-top border-t border-navy/10 bg-white shadow-xl transition duration-300 lg:block", open === m.id ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0")}>
          <div className="wrap grid grid-cols-12 gap-10 py-10">
            <div className="col-span-3">
              <p className="eyebrow">{tx(m.label, locale)}</p>
              <p className="mt-3 font-display text-2xl font-semibold text-navy">{tx(m.label, locale)}</p>
              <Link href={href(m.url, locale, false)} className="mt-5 inline-block text-sm font-semibold text-teal underline underline-offset-4">{locale === "tr" ? "Tümünü gör" : "View all"}</Link>
            </div>
            <ul className="col-span-9 grid grid-cols-3 gap-x-8 gap-y-1">
              {m.children.map((c) => (
                <li key={c.id}><Link href={href(c.url, locale, c.external)} tabIndex={open === m.id ? 0 : -1} className="block rounded-md px-3 py-2.5 text-[15px] text-ink/85 transition hover:bg-mist hover:text-teal">{tx(c.label, locale)}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      ) : null)}

      {/* Mobil menü */}
      <div className={cn("fixed inset-x-0 bottom-0 top-[76px] overflow-y-auto bg-white transition-all duration-500 lg:hidden", mobile ? "visible opacity-100" : "invisible opacity-0")}>
        <nav aria-label="Mobil menü" className="wrap py-6">
          <ul>
            {menu.map((m) => (
              <li key={m.id} className="border-b border-navy/10">
                <div className="flex items-center justify-between">
                  <Link href={href(m.url, locale, m.external)} className="flex-1 py-4 font-display text-xl font-semibold text-navy">{tx(m.label, locale)}</Link>
                  {m.children?.length ? <button aria-label="Alt menü" aria-expanded={mobSub === m.id} className="p-3 text-navy" onClick={() => setMobSub(mobSub === m.id ? null : m.id)}><ChevronDown className={cn("transition-transform", mobSub === m.id && "rotate-180")} /></button> : null}
                </div>
                {mobSub === m.id && <ul className="pb-3 pl-3">{m.children!.map((c) => <li key={c.id}><Link href={href(c.url, locale, c.external)} className="block py-2.5 text-ink/80">{tx(c.label, locale)}</Link></li>)}</ul>}
              </li>
            ))}
          </ul>
          <Link href={`/${locale}/kayit/bilgi-talebi`} className="btn-primary mt-6 w-full">{cta}</Link>
          <ul className="mt-6 grid grid-cols-2 gap-3 text-sm text-ink/70">
            {utility.map((u) => <li key={u.id}><a href={href(u.url, locale, u.external)} target={u.external ? "_blank" : undefined} rel="noopener noreferrer">{tx(u.label, locale)}</a></li>)}
          </ul>
        </nav>
      </div>
    </header>
  );
}
