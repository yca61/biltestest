"use client";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

/** Sayfa üstünde kaydırma ilerleme çubuğu. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const x = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });
  const reduce = useReducedMotion();
  if (reduce) return null;
  return <motion.div aria-hidden style={{ scaleX: x }} className="fixed inset-x-0 top-0 z-[60] h-[3px] origin-left bg-amber" />;
}

/** Görseli kaydırmayla hafifçe kaydırır (paralaks). Kapsayıcı overflow-hidden olmalı. */
export function Parallax({ children, amount = 40, className }: { children: ReactNode; amount?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [-amount, amount]);
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <div ref={ref} className="overflow-hidden">
      <motion.div style={{ y, scale: 1.12 }} className={className}>{children}</motion.div>
    </div>
  );
}

/** Başlığı kelime kelime yukarıdan açar. Tetikleyici kırpılmayan dış kapsayıcıdadır. */
export function SplitText({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <span className={className}>{text}</span>;
  return (
    <motion.span className={className} aria-label={text} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-40px" }} transition={{ staggerChildren: 0.06, delayChildren: delay }}>
      {text.split(" ").map((w, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden align-bottom">
          <motion.span className="inline-block" variants={{ hidden: { y: "110%" }, show: { y: 0 } }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}>
            {w}&nbsp;
          </motion.span>
        </span>
      ))}
    </motion.span>
  );
}

/** Görseli perde gibi açan giriş animasyonu. */
export function ClipReveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div className={className} initial={{ clipPath: "inset(0 0 100% 0)" }} whileInView={{ clipPath: "inset(0 0 0% 0)" }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 1.1, delay, ease: [0.77, 0, 0.175, 1] }}>
      {children}
    </motion.div>
  );
}

/** Sonsuz kayan kelime şeridi. */
export function Marquee({ words }: { words: string[] }) {
  const row = [...words, ...words];
  return (
    <div aria-hidden className="marquee overflow-hidden border-y border-navy/10 bg-white py-5">
      <div className="marquee-track flex w-max gap-12 whitespace-nowrap">
        {[...row, ...row].map((w, i) => (
          <span key={i} className="flex items-center gap-12 font-display text-3xl font-extrabold uppercase tracking-tight text-navy/90 md:text-5xl">
            {w}<span className="text-amber">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}
