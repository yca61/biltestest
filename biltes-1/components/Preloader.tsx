"use client";
import { useEffect, useState } from "react";

/** Açılış ekranı: oturum başına bir kez, logo animasyonlu. CSS ile kendiliğinden kapanır (JS'siz de engellemez). */
export function Preloader({ logoUrl, siteTitle, tagline }: { logoUrl: string; siteTitle: string; tagline: string }) {
  const [gone, setGone] = useState(false);
  useEffect(() => {
    try { if (sessionStorage.getItem("biltes_loaded")) { setGone(true); return; } sessionStorage.setItem("biltes_loaded", "1"); } catch {}
    const t = setTimeout(() => setGone(true), 2700);
    return () => clearTimeout(t);
  }, []);
  if (gone) return null;
  return (
    <div aria-hidden className="preloader fixed inset-0 z-[100] grid place-items-center bg-white">
      <div className="flex flex-col items-center px-6 text-center">
        <div className="pre-logo relative">
          <span className="pre-ring absolute -inset-6 rounded-full border border-teal/40" />
          {logoUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={logoUrl} alt="" className="h-32 w-auto md:h-40" /> : <span className="font-display text-5xl font-extrabold text-navy">BİLTES</span>}
        </div>
        <p className="pre-tag mt-8 font-display text-lg font-semibold text-navy md:text-xl">{tagline}</p>
        <span className="pre-bar mt-8 block h-0.5 w-48 origin-left bg-teal" />
        <span className="sr-only">{siteTitle}</span>
      </div>
    </div>
  );
}
