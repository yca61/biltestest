"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type A = { id: string; url: string; webpUrl: string | null; name: string; kind: string; folder: string; size: number; width: number | null; height: number | null; alt: { tr?: string; en?: string } | null };
export function MediaLibrary() {
  const [items, setItems] = useState<A[]>([]);
  const [q, setQ] = useState(""); const [folder, setFolder] = useState("");
  const [sel, setSel] = useState<A | null>(null);
  const [msg, setMsg] = useState(""); const [busy, setBusy] = useState(false); const [drag, setDrag] = useState(false);
  const up = useRef<HTMLInputElement>(null);
  const load = useCallback(() => fetch(`/api/media?q=${encodeURIComponent(q)}${folder ? `&folder=${encodeURIComponent(folder)}` : ""}`).then((r) => r.json()).then((d) => setItems(d.items ?? [])), [q, folder]);
  useEffect(() => { load(); }, [load]);
  const folders = Array.from(new Set(items.map((i) => i.folder)));
  async function upload(files: FileList | File[]) {
    setBusy(true); setMsg("");
    for (const f of Array.from(files)) {
      const fd = new FormData(); fd.append("file", f); if (folder) fd.append("folder", folder);
      const r = await fetch("/api/media", { method: "POST", body: fd }); const d = await r.json();
      if (!r.ok) setMsg(`${f.name}: ${d.error}`);
    }
    setBusy(false); load();
  }
  async function save() {
    if (!sel) return;
    const r = await fetch(`/api/media/${sel.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: sel.name, folder: sel.folder, alt: sel.alt }) });
    setMsg(r.ok ? "Kaydedildi." : "Kaydedilemedi."); load();
  }
  async function del() {
    if (!sel || !confirm("Dosya silinsin mi?")) return;
    const r = await fetch(`/api/media/${sel.id}`, { method: "DELETE" }); const d = await r.json();
    if (!r.ok) setMsg(d.error); else { setSel(null); setMsg("Silindi."); load(); }
  }
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div>
        <div className="mb-4 flex flex-wrap gap-2"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Dosya ara…" className="field !w-56 !py-2" />
          <input list="folders" value={folder} onChange={(e) => setFolder(e.target.value)} placeholder="Klasör (örn. galeri/dans)" className="field !w-56 !py-2" /><datalist id="folders">{folders.map((f) => <option key={f} value={f} />)}</datalist>
          <button className="btn-dark !min-h-10" onClick={() => up.current?.click()}>{busy ? "Yükleniyor…" : "Dosya yükle"}</button><input ref={up} type="file" multiple hidden accept="image/*,application/pdf" onChange={(e) => e.target.files && upload(e.target.files)} /></div>
        <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files); }}
          className={`mb-4 border-2 border-dashed p-6 text-center text-sm ${drag ? "border-teal bg-teal/5" : "border-navy/20 text-ink/50"}`}>Dosyaları buraya sürükleyip bırakın (JPG, PNG, WebP, GIF, AVIF, PDF · en fazla 12 MB)<br /><span className="text-xs">Galeri sayfası “galeri” veya “galeri/kategori” klasöründeki görselleri gösterir.</span></div>
        {msg && <p role="status" className="mb-3 bg-white p-3 text-sm">{msg}</p>}
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-5">{items.map((a) => (
          <li key={a.id}><button onClick={() => setSel(a)} className={`block w-full border bg-white text-left ${sel?.id === a.id ? "border-teal ring-2 ring-teal" : ""}`}>
            {a.kind === "image" ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.webpUrl ?? a.url} alt={a.alt?.tr ?? ""} loading="lazy" className="aspect-square w-full object-cover" /> : <div className="grid aspect-square place-items-center bg-mist font-semibold">PDF</div>}
            <span className="block truncate px-2 pt-1.5 text-xs font-medium">{a.name}</span><span className="block px-2 pb-1.5 text-[11px] text-ink/50">{a.folder} · {(a.size / 1024).toFixed(0)} KB</span></button></li>))}</ul>
      </div>
      <aside className="h-fit space-y-3 bg-white p-4 shadow-sm lg:sticky lg:top-20">
        {!sel ? <p className="text-sm text-ink/50">Ayrıntı için bir dosya seçin.</p> : (<>
          {sel.kind === "image" && /* eslint-disable-next-line @next/next/no-img-element */ <img src={sel.webpUrl ?? sel.url} alt="" className="w-full" />}
          <p className="text-xs text-ink/50">{sel.width && `${sel.width}×${sel.height} · `}{(sel.size / 1024).toFixed(0)} KB</p>
          <label className="block text-sm">Ad<input className="field !py-2" value={sel.name} onChange={(e) => setSel({ ...sel, name: e.target.value })} /></label>
          <label className="block text-sm">Klasör<input className="field !py-2" value={sel.folder} onChange={(e) => setSel({ ...sel, folder: e.target.value })} /></label>
          {sel.kind === "image" && <><label className="block text-sm">Alt metin (TR)<input className="field !py-2" value={sel.alt?.tr ?? ""} onChange={(e) => setSel({ ...sel, alt: { ...sel.alt, tr: e.target.value } })} /></label>
            <label className="block text-sm">Alt text (EN)<input className="field !py-2" value={sel.alt?.en ?? ""} onChange={(e) => setSel({ ...sel, alt: { ...sel.alt, en: e.target.value } })} /></label></>}
          <input readOnly value={sel.url} className="field !py-2 text-xs" onFocus={(e) => e.target.select()} />
          <div className="flex gap-2"><button className="btn-primary !min-h-10" onClick={save}>Kaydet</button><button className="btn-outline !min-h-10 !text-red-700" onClick={del}>Sil</button></div></>)}
      </aside>
    </div>
  );
}
