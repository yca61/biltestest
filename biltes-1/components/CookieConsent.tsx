"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "biltes_consent";
export function CookieConsent({ locale, gaId }: { locale: "tr" | "en"; gaId: string }) {
  const [state, setState] = useState<string | null>("pending");
  useEffect(() => {
    let v: string | null = null;
    try { v = localStorage.getItem(KEY); } catch {}
    setState(v);
    if (v === "all" && gaId && !document.getElementById("ga")) {
      const s = document.createElement("script"); s.id = "ga"; s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`; document.head.appendChild(s);
      const w = window as unknown as { dataLayer: unknown[] }; w.dataLayer = w.dataLayer || [];
      w.dataLayer.push(["js", new Date()], ["config", gaId, { anonymize_ip: true }]);
    }
  }, [gaId]);
  if (state !== null) return null;
  const set = (v: string) => { try { localStorage.setItem(KEY, v); } catch {} setState(v); if (v === "all") location.reload(); };
  const t = locale === "tr"
    ? { text: "Sitemizi çalıştırmak için zorunlu çerezler kullanıyoruz. Analitik çerezler yalnızca onayınızla etkinleşir.", all: "Tümünü kabul et", min: "Yalnızca zorunlu", more: "Ayrıntılar" }
    : { text: "We use strictly necessary cookies. Analytics cookies are only enabled with your consent.", all: "Accept all", min: "Necessary only", more: "Details" };
  return (
    <div role="dialog" aria-label="Cookie" className="fixed inset-x-3 bottom-3 z-[70] mx-auto max-w-3xl rounded-lg bg-navy p-5 text-sm text-white shadow-2xl md:flex md:items-center md:gap-6">
      <p className="flex-1 leading-6">{t.text} <Link href={`/${locale}/yasal/cerez-tercihleri`} className="underline">{t.more}</Link></p>
      <div className="mt-4 flex gap-2 md:mt-0">
        <button onClick={() => set("necessary")} className="rounded-full border border-white/40 px-4 py-2 font-semibold hover:bg-white/10">{t.min}</button>
        <button onClick={() => set("all")} className="rounded-full bg-teal px-4 py-2 font-semibold hover:bg-white hover:text-navy">{t.all}</button>
      </div>
    </div>
  );
}
