"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteMenuItem, reorderMenu, saveMenuItem } from "@/app/actions/admin";

type It = { id: string; label: { tr?: string; en?: string }; url: string; external: boolean; enabled: boolean; parentId: string | null; sortOrder: number };
export function MenuManager({ menuId, items }: { menuId: string; items: It[] }) {
  const r = useRouter(); const [p, go] = useTransition();
  const [edit, setEdit] = useState<{ id: string | null; tr: string; en: string; url: string; external: boolean; enabled: boolean; parentId: string | null } | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const [err, setErr] = useState("");
  const tops = items.filter((i) => !i.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
  const kids = (id: string) => items.filter((i) => i.parentId === id).sort((a, b) => a.sortOrder - b.sortOrder);
  const drop = (target: It, siblings: It[]) => { if (!dragId || dragId === target.id) return; const d = siblings.find((s) => s.id === dragId); if (!d) return; const ids = siblings.map((s) => s.id).filter((i) => i !== dragId); ids.splice(ids.indexOf(target.id), 0, dragId); go(async () => { await reorderMenu(ids); r.refresh(); }); };
  const Row = ({ it, sibs }: { it: It; sibs: It[] }) => (
    <li draggable onDragStart={() => setDragId(it.id)} onDragOver={(e) => e.preventDefault()} onDrop={() => drop(it, sibs)} className="flex items-center gap-3 border bg-white px-3 py-2 text-sm">
      <span className="cursor-grab select-none text-ink/40" aria-hidden>⠿</span>
      <span className={`flex-1 ${it.enabled ? "" : "text-ink/40 line-through"}`}><b>{it.label.tr}</b> <span className="text-ink/50">{it.label.en ? `/ ${it.label.en}` : ""} · {it.url}{it.external ? " ↗" : ""}</span></span>
      <button className="text-teal" onClick={() => setEdit({ id: it.id, tr: it.label.tr ?? "", en: it.label.en ?? "", url: it.url, external: it.external, enabled: it.enabled, parentId: it.parentId })}>Düzenle</button>
      <button className="text-red-700" onClick={() => confirm("Silinsin mi? (alt öğeler de silinir)") && go(async () => { await deleteMenuItem(it.id); r.refresh(); })}>Sil</button>
    </li>
  );
  return (
    <div className="space-y-3">
      <ul className="space-y-1.5">{tops.map((t) => (<li key={t.id}><ul className="space-y-1.5"><Row it={t} sibs={tops} />{kids(t.id).length > 0 && <li><ul className="ml-8 space-y-1.5">{kids(t.id).map((k) => <Row key={k.id} it={k} sibs={kids(t.id)} />)}</ul></li>}</ul></li>))}</ul>
      <button className="btn-outline !min-h-10" onClick={() => setEdit({ id: null, tr: "", en: "", url: "/", external: false, enabled: true, parentId: null })}>+ Menü öğesi ekle</button>
      {edit && (<div className="fixed inset-0 z-50 grid place-items-center bg-navy/50 p-4"><div className="w-full max-w-md space-y-3 bg-white p-6">
        <h2 className="font-semibold">{edit.id ? "Öğeyi düzenle" : "Yeni öğe"}</h2>
        <label className="block text-sm">Etiket (TR)<input className="field !py-2" value={edit.tr} onChange={(e) => setEdit({ ...edit, tr: e.target.value })} /></label>
        <label className="block text-sm">Etiket (EN)<input className="field !py-2" value={edit.en} onChange={(e) => setEdit({ ...edit, en: e.target.value })} /></label>
        <label className="block text-sm">Bağlantı (/kampusler, /hayat/kulupler veya https://…)<input className="field !py-2" value={edit.url} onChange={(e) => setEdit({ ...edit, url: e.target.value })} /></label>
        <label className="block text-sm">Üst öğe<select className="field !py-2" value={edit.parentId ?? ""} onChange={(e) => setEdit({ ...edit, parentId: e.target.value || null })}><option value="">— Ana düzey —</option>{tops.filter((t) => t.id !== edit.id).map((t) => <option key={t.id} value={t.id}>{t.label.tr}</option>)}</select></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-teal" checked={edit.external} onChange={(e) => setEdit({ ...edit, external: e.target.checked })} />Yeni sekmede aç (harici)</label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-teal" checked={edit.enabled} onChange={(e) => setEdit({ ...edit, enabled: e.target.checked })} />Etkin</label>
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <div className="flex gap-2"><button disabled={p} className="btn-primary !min-h-10" onClick={() => go(async () => { const res = await saveMenuItem(edit.id, menuId, { trLabel: edit.tr, enLabel: edit.en, url: edit.url, external: edit.external, enabled: edit.enabled, parentId: edit.parentId }); if (!res.ok) setErr(res.error ?? ""); else { setErr(""); setEdit(null); r.refresh(); } })}>Kaydet</button><button className="btn-outline !min-h-10" onClick={() => setEdit(null)}>Vazgeç</button></div>
      </div></div>)}
    </div>
  );
}
