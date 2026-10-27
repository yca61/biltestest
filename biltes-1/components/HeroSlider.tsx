"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import { Photo } from "./Photo";
import { LogoBadge } from "./LogoBadge";

export type Slide = { id: string; title: string; subtitle: string; ctaLabel: string; ctaUrl: string; desktop: string | null; mobile: string | null; video: string | null; overlay: number };
type Labels = { prev: string; next: string; pause: string; play: string; secondary: string; secondaryUrl: string };

export function HeroSlider({ slides, labels, logoUrl }: { slides: Slide[]; labels: Labels; logoUrl?: string }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const reduce = useReducedMotion();
  const n = slides.length;
  const go = useCallback((d: number) => setI((v) => (v + d + n) % n), [n]);
  useEffect(() => {
    if (!playing || reduce || n < 2) return;
    const t = setInterval(() => go(1), 7000);
    return () => clearInterval(t);
  }, [playing, reduce, n, go]);
  const s = slides[i];
  return (
    <section aria-roledescription="carousel" aria-label="BİLTES" className="relative flex min-h-[100svh] items-end overflow-hidden bg-navy text-white">
      <AnimatePresence mode="sync">
        <motion.div key={s.id} className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}>
          <div className={reduce ? "h-full w-full" : "h-full w-full animate-zoom"}>
            {s.video ? <video src={s.video} autoPlay muted loop playsInline poster={s.desktop ?? undefined} className="h-full w-full object-cover" /> : (
              <picture>
                {s.mobile && <source media="(max-width: 767px)" srcSet={s.mobile} />}
                <Photo src={s.desktop} priority={i === 0} className="h-full w-full" />
              </picture>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, rgba(16,43,70,${s.overlay / 200}) 0%, rgba(16,43,70,${s.overlay / 100}) 100%)` }} />
      <LogoBadge src={logoUrl} size="lg" className="absolute bottom-64 right-6 z-10 hidden animate-[float_6s_ease-in-out_infinite] md:grid lg:right-16 xl:right-28" />
      <div className="wrap relative z-10 pb-24 pt-44 md:pb-32">
        <div className="max-w-4xl" aria-live={playing ? "off" : "polite"}>
          <motion.h1 key={s.id + "h"} initial={reduce ? false : { opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
            className="font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[5.5rem]">{s.title}</motion.h1>
          {s.subtitle && <motion.p key={s.id + "p"} initial={reduce ? false : { opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.5 }} className="mt-6 max-w-2xl text-lg leading-8 text-white/90 md:text-xl">{s.subtitle}</motion.p>}
          <div className="mt-9 flex flex-wrap gap-3">
            {s.ctaLabel && s.ctaUrl && <Link href={s.ctaUrl} className="btn-primary">{s.ctaLabel}</Link>}
            <Link href={labels.secondaryUrl} className="btn-ghost">{labels.secondary}</Link>
          </div>
        </div>
        {n > 1 && (
          <div className="mt-14 flex items-center gap-5">
            <div className="flex gap-2" role="tablist">
              {slides.map((x, k) => <button key={x.id} role="tab" aria-selected={k === i} aria-label={`${k + 1}/${n}`} onClick={() => setI(k)} className="group py-3"><span className={`block h-0.5 transition-all duration-500 ${k === i ? "w-14 bg-amber" : "w-8 bg-white/40 group-hover:bg-white"}`} /></button>)}
            </div>
            <div className="ml-auto flex gap-2">
              <button onClick={() => setPlaying(!playing)} aria-label={playing ? labels.pause : labels.play} className="grid h-11 w-11 place-items-center rounded-full border border-white/40 hover:bg-white hover:text-navy">{playing ? <Pause size={16} /> : <Play size={16} />}</button>
              <button onClick={() => go(-1)} aria-label={labels.prev} className="grid h-11 w-11 place-items-center rounded-full border border-white/40 hover:bg-white hover:text-navy"><ArrowLeft size={18} /></button>
              <button onClick={() => go(1)} aria-label={labels.next} className="grid h-11 w-11 place-items-center rounded-full border border-white/40 hover:bg-white hover:text-navy"><ArrowRight size={18} /></button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
