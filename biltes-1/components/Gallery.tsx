"use client";
import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Photo } from "./Photo";

export type GItem = { src: string; alt: string; category?: string };

export function Gallery({ items, allLabel = "Tümü", categories = true }: { items: GItem[]; allLabel?: string; categories?: boolean }) {
  const cats = Array.from(new Set(items.map((i) => i.category).filter(Boolean))) as string[];
  const [cat, setCat] = useState("");
  const [open, setOpen] = useState<number | null>(null);
  const list = cat ? items.filter((i) => i.category === cat) : items;
  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") setOpen((v) => (v === null ? v : (v + 1) % list.length));
      if (e.key === "ArrowLeft") setOpen((v) => (v === null ? v : (v - 1 + list.length) % list.length));
    };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, list.length]);
  return (
    <div>
      {categories && cats.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2" role="group">
          {["", ...cats].map((c) => <button key={c} aria-pressed={cat === c} onClick={() => setCat(c)} className={`rounded-full border px-4 py-2 text-sm font-medium transition ${cat === c ? "border-navy bg-navy text-white" : "border-navy/20 text-navy hover:border-navy"}`}>{c || allLabel}</button>)}
        </div>
      )}
      <ul className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>li]:mb-3">
        {list.map((it, i) => (
          <li key={it.src + i} className="break-inside-avoid">
            <button onClick={() => setOpen(i)} className="group block w-full overflow-hidden" aria-label={it.alt || "Büyüt"}>
              <Photo src={it.src} alt={it.alt} className="w-full transition duration-700 group-hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>
      {open !== null && list[open] && (
        <div role="dialog" aria-modal="true" className="fixed inset-0 z-[80] grid place-items-center bg-navy/95 p-4" onClick={() => setOpen(null)}>
          <button aria-label="Kapat" className="absolute right-4 top-4 p-2 text-white" onClick={() => setOpen(null)}><X /></button>
          <button aria-label="Önceki" className="absolute left-3 p-3 text-white" onClick={(e) => { e.stopPropagation(); setOpen((open - 1 + list.length) % list.length); }}><ChevronLeft size={32} /></button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={list[open].src} alt={list[open].alt} className="max-h-[88vh] max-w-full object-contain" onClick={(e) => e.stopPropagation()} />
          <button aria-label="Sonraki" className="absolute right-3 p-3 text-white" onClick={(e) => { e.stopPropagation(); setOpen((open + 1) % list.length); }}><ChevronRight size={32} /></button>
        </div>
      )}
    </div>
  );
}
