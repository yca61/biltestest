"use client";
import { createContext, useContext, useEffect, useMemo, useState, useTransition } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import { ArrowDown, ArrowUp, Plus, Trash2, ImageIcon, X } from "lucide-react";
import { BLOCK_SPECS, type Field } from "@/lib/forms";

type Obj = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
type Opts = { campus: { value: string; label: string }[]; category: { value: string; label: string }[]; page: { value: string; label: string }[] };
const Ctx = createContext<{ lang: "tr" | "en"; media: Record<string, string>; setMedia: (id: string, url: string) => void; pick: (cb: (m: { id: string; url: string }) => void, kind?: string) => void; rel: Opts }>(null as never);

/* ---------- Medya seçici ---------- */
type Asset = { id: string; url: string; webpUrl?: string | null; name: string; kind: string; folder: string };
function Picker({ onPick, onClose, kind }: { onPick: (m: { id: string; url: string }) => void; onClose: () => void; kind?: string }) {
  const [items, setItems] = useState<Asset[]>([]);
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const load = () => fetch(`/api/media?q=${encodeURIComponent(q)}${kind ? `&kind=${kind}` : ""}`).then((r) => r.json()).then((d) => setItems(d.items ?? []));
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q]);
  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    for (const f of Array.from(files)) { const fd = new FormData(); fd.append("file", f); await fetch("/api/media", { method: "POST", body: fd }); }
    setBusy(false); load();
  }
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[90] grid place-items-center bg-navy/60 p-4">
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b p-4"><h3 className="font-semibold">Medya seç</h3><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ara…" className="field !py-2" />
          <label className="btn-dark !min-h-10 cursor-pointer !px-4">{busy ? "Yükleniyor…" : "Yükle"}<input type="file" multiple hidden accept="image/*,application/pdf" onChange={(e) => upload(e.target.files)} /></label>
          <button onClick={onClose} aria-label="Kapat"><X /></button></div>
        <ul className="grid flex-1 grid-cols-3 gap-3 overflow-y-auto p-4 md:grid-cols-5">
          {items.map((a) => (<li key={a.id}><button type="button" onClick={() => { onPick({ id: a.id, url: a.url }); onClose(); }} className="block w-full border text-left hover:border-teal">
            {a.kind === "image" ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={a.webpUrl ?? a.url} alt="" className="aspect-square w-full object-cover" /> : <div className="grid aspect-square place-items-center bg-mist text-xs">PDF</div>}
            <span className="block truncate p-1.5 text-xs">{a.name}</span></button></li>))}
          {!items.length && <li className="col-span-full text-sm text-ink/60">Medya yok. Yukarıdan yükleyin.</li>}
        </ul>
      </div>
    </div>
  );
}

/* ---------- Zengin metin ---------- */
function Rich({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { pick, setMedia } = useContext(Ctx);
  const ed = useEditor({ extensions: [StarterKit.configure({ link: { openOnClick: false } }), Image], content: value, immediatelyRender: false, editorProps: { attributes: { class: "prose-site min-h-40 p-4 focus:outline-none" } }, onUpdate: ({ editor }) => onChange(editor.getHTML()) });
  if (!ed) return null;
  const B = ({ on, label, active }: { on: () => void; label: string; active?: boolean }) => <button type="button" onClick={on} className={`rounded px-2 py-1 text-sm ${active ? "bg-navy text-white" : "hover:bg-mist"}`}>{label}</button>;
  return (
    <div className="border border-navy/20 bg-white">
      <div className="flex flex-wrap gap-1 border-b bg-mist p-1.5">
        <B label="B" active={ed.isActive("bold")} on={() => ed.chain().focus().toggleBold().run()} /><B label="I" active={ed.isActive("italic")} on={() => ed.chain().focus().toggleItalic().run()} />
        <B label="H2" active={ed.isActive("heading", { level: 2 })} on={() => ed.chain().focus().toggleHeading({ level: 2 }).run()} /><B label="H3" active={ed.isActive("heading", { level: 3 })} on={() => ed.chain().focus().toggleHeading({ level: 3 }).run()} />
        <B label="• Liste" active={ed.isActive("bulletList")} on={() => ed.chain().focus().toggleBulletList().run()} /><B label="1. Liste" active={ed.isActive("orderedList")} on={() => ed.chain().focus().toggleOrderedList().run()} />
        <B label="Alıntı" active={ed.isActive("blockquote")} on={() => ed.chain().focus().toggleBlockquote().run()} />
        <B label="Bağlantı" on={() => { const u = prompt("Bağlantı adresi (boş = kaldır)"); if (u === null) return; u ? ed.chain().focus().setLink({ href: u }).run() : ed.chain().focus().unsetLink().run(); }} />
        <B label="Görsel" on={() => pick((m) => { setMedia(m.id, m.url); ed.chain().focus().setImage({ src: m.url }).run(); }, "image")} />
        <B label="↶" on={() => ed.chain().focus().undo().run()} /><B label="↷" on={() => ed.chain().focus().redo().run()} />
      </div>
      <EditorContent editor={ed} />
    </div>
  );
}

/* ---------- Tek alan ---------- */
function Single({ f, v, set }: { f: Field; v: any; set: (v: any) => void }) { // eslint-disable-line @typescript-eslint/no-explicit-any
  const c = useContext(Ctx);
  switch (f.type) {
    case "text": case "slug": case "email": return <input className="field" value={v ?? ""} onChange={(e) => set(e.target.value)} type={f.type === "email" ? "email" : "text"} />;
    case "url": return <input className="field" value={v ?? ""} onChange={(e) => set(e.target.value)} placeholder="https://… veya /yol" />;
    case "textarea": return <textarea className="field" rows={3} value={v ?? ""} onChange={(e) => set(e.target.value)} />;
    case "rich": return <Rich value={v ?? ""} onChange={set} />;
    case "number": return <input className="field" type="number" value={v ?? 0} onChange={(e) => set(e.target.valueAsNumber || 0)} />;
    case "bool": return <label className="flex items-center gap-2"><input type="checkbox" checked={!!v} onChange={(e) => set(e.target.checked)} className="h-4 w-4 accent-teal" />Evet</label>;
    case "select": return <select className="field" value={v ?? ""} onChange={(e) => set(e.target.value)}>{f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
    case "multiselect": return <div className="flex flex-wrap gap-3">{f.options?.map((o) => <label key={o.value} className="flex items-center gap-2"><input type="checkbox" className="accent-teal" checked={(v ?? []).includes(o.value)} onChange={(e) => set(e.target.checked ? [...(v ?? []), o.value] : (v ?? []).filter((x: string) => x !== o.value))} />{o.label}</label>)}</div>;
    case "datetime": case "date": { const val = v ? new Date(v) : null; const loc = val && !isNaN(+val) ? new Date(val.getTime() - val.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""; return <input className="field" type="datetime-local" value={loc} onChange={(e) => set(e.target.value ? new Date(e.target.value).toISOString() : null)} />; }
    case "tags": return <input className="field" value={Array.isArray(v) ? v.join(", ") : v ?? ""} onChange={(e) => set(e.target.value.split(",").map((s) => s.trim()))} />;
    case "image": case "mediaId": {
      const url = f.type === "image" ? v : v ? c.media[v] : "";
      return (<div className="flex items-center gap-3">
        {url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={url} alt="" className="h-20 w-28 border object-cover" /> : <div className="grid h-20 w-28 place-items-center border border-dashed text-xs text-ink/50">Seçilmedi</div>}
        <button type="button" className="btn-outline !min-h-10 !px-4 text-sm" onClick={() => c.pick((m) => { c.setMedia(m.id, m.url); set(f.type === "image" ? m.url : m.id); })}><ImageIcon size={15} />Seç / Yükle</button>
        {v ? <button type="button" onClick={() => set(f.type === "image" ? "" : null)} className="text-sm text-red-700">Kaldır</button> : null}</div>);
    }
    case "relation": { const o = c.rel[f.relation as keyof Opts] ?? []; return <select className="field" value={v ?? ""} onChange={(e) => set(e.target.value || null)}><option value="">— Yok —</option>{o.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</select>; }
    case "group": return <div className="space-y-4 border-l-2 border-teal/30 pl-4"><Fields fields={f.fields!} value={v ?? {}} onChange={set} /></div>;
    case "list": {
      const arr: Obj[] = v ?? [];
      const mv = (i: number, d: number) => { const n = [...arr]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; set(n); };
      return (<div className="space-y-3">
        {arr.map((it, i) => (<div key={i} className="border border-navy/15 bg-mist/60 p-4"><div className="mb-3 flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-ink/50"><span>{f.itemLabel ?? "Öğe"} {i + 1}</span>
          <span className="flex gap-1"><button type="button" aria-label="Yukarı" onClick={() => mv(i, -1)}><ArrowUp size={15} /></button><button type="button" aria-label="Aşağı" onClick={() => mv(i, 1)}><ArrowDown size={15} /></button><button type="button" aria-label="Sil" onClick={() => set(arr.filter((_, k) => k !== i))} className="text-red-700"><Trash2 size={15} /></button></span></div>
          <div className="space-y-4"><Fields fields={f.fields!} value={it} onChange={(nv) => set(arr.map((x, k) => (k === i ? nv : x)))} /></div></div>))}
        <button type="button" className="btn-outline !min-h-9 !px-4 text-sm" onClick={() => set([...arr, {}])}><Plus size={14} />{f.itemLabel ?? "Öğe"} ekle</button></div>);
    }
    case "blocks": return <BlocksEditor value={v ?? []} onChange={set} />;
  }
}

function BlocksEditor({ value, onChange }: { value: Obj[]; onChange: (v: Obj[]) => void }) {
  const [type, setType] = useState("text");
  const mv = (i: number, d: number) => { const n = [...value]; const j = i + d; if (j < 0 || j >= n.length) return; [n[i], n[j]] = [n[j], n[i]]; onChange(n); };
  return (
    <div className="space-y-4">
      {value.map((b, i) => { const spec = BLOCK_SPECS[b.type]; if (!spec) return null; return (
        <div key={i} className="border-2 border-navy/15 bg-white p-4"><div className="mb-4 flex items-center justify-between"><b className="text-sm text-navy">{i + 1}. {spec.label}</b>
          <span className="flex gap-2"><button type="button" aria-label="Yukarı" onClick={() => mv(i, -1)}><ArrowUp size={16} /></button><button type="button" aria-label="Aşağı" onClick={() => mv(i, 1)}><ArrowDown size={16} /></button><button type="button" aria-label="Sil" className="text-red-700" onClick={() => onChange(value.filter((_, k) => k !== i))}><Trash2 size={16} /></button></span></div>
          <div className="space-y-4"><Fields fields={spec.fields} value={b} onChange={(nv) => onChange(value.map((x, k) => (k === i ? { ...nv, type: b.type } : x)))} /></div></div>); })}
      <div className="flex gap-2"><select className="field !w-auto" value={type} onChange={(e) => setType(e.target.value)}>{Object.entries(BLOCK_SPECS).map(([k, s]) => <option key={k} value={k}>{s.label}</option>)}</select>
        <button type="button" className="btn-dark !min-h-11 !px-5 text-sm" onClick={() => onChange([...value, { type }])}><Plus size={15} />Blok ekle</button></div>
    </div>
  );
}

export function Fields({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: (v: Obj) => void }) {
  const { lang } = useContext(Ctx);
  return (<>{fields.map((f) => {
    const loc = f.localized;
    const raw = value?.[f.name];
    const cur = loc ? (raw?.[lang] ?? (f.type === "blocks" || f.type === "list" ? [] : "")) : raw;
    const set = (nv: unknown) => onChange({ ...value, [f.name]: loc ? { ...(raw ?? {}), [lang]: nv } : nv });
    const missing = loc && lang === "en" && !(Array.isArray(cur) ? cur.length : cur);
    return (
      <div key={f.name + (loc ? lang : "")}>
        {f.type !== "bool" || true ? <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-navy">{f.label}{f.required && <span className="text-red-600">*</span>}{loc && <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold uppercase ${missing ? "bg-amber/30" : "bg-teal/15 text-teal"}`}>{lang}{missing ? " eksik" : ""}</span>}</label> : null}
        <Single f={f} v={cur} set={set} />
        {f.hint && <p className="mt-1 text-xs text-ink/55">{f.hint}</p>}
      </div>
    );
  })}</>);
}

/* ---------- Form kabuğu ---------- */
export function EditorShell({ initial, fields, media, rel, onSave, children, actions }: {
  initial: Obj; fields: Field[]; media: Record<string, string>; rel: Opts;
  onSave: (value: Obj, intent: string) => Promise<{ ok: boolean; error?: string; id?: string } | void>; children?: React.ReactNode; actions?: { intent: string; label: string; primary?: boolean }[];
}) {
  const [value, setValue] = useState<Obj>(initial);
  const [lang, setLang] = useState<"tr" | "en">("tr");
  const [mmap, setMmap] = useState(media);
  const [picker, setPicker] = useState<{ cb: (m: { id: string; url: string }) => void; kind?: string } | null>(null);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  const ctx = useMemo(() => ({ lang, media: mmap, setMedia: (id: string, url: string) => setMmap((m) => ({ ...m, [id]: url })), pick: (cb: (m: { id: string; url: string }) => void, kind?: string) => setPicker({ cb, kind }), rel }), [lang, mmap, rel]);
  const hasLoc = fields.some((f) => f.localized || f.fields?.some((x) => x.localized));
  const act = actions ?? [{ intent: "save", label: "Kaydet", primary: true }];
  return (
    <Ctx.Provider value={ctx}>
      <div className="space-y-6">
        {hasLoc && <div className="flex items-center gap-2" role="tablist" aria-label="Dil"><span className="text-sm text-ink/60">İçerik dili:</span>
          {(["tr", "en"] as const).map((l) => <button key={l} type="button" role="tab" aria-selected={lang === l} onClick={() => setLang(l)} className={`rounded-full px-4 py-1.5 text-sm font-semibold ${lang === l ? "bg-navy text-white" : "bg-white text-navy ring-1 ring-navy/20"}`}>{l === "tr" ? "Türkçe" : "English"}</button>)}
          {lang === "en" && <span className="text-xs text-ink/60">Boş bırakılan alanlarda Türkçe içerik gösterilir.</span>}</div>}
        <div className="space-y-6 bg-white p-6 shadow-sm"><Fields fields={fields} value={value} onChange={setValue} /></div>
        {children}
        {msg && <p role="status" className={`p-3 text-sm ${msg.ok ? "bg-teal/10 text-navy" : "bg-red-50 text-red-800"}`}>{msg.text}</p>}
        <div className="sticky bottom-0 z-20 -mx-5 flex gap-3 border-t bg-white/95 p-4 backdrop-blur lg:-mx-8 lg:px-8">
          {act.map((a) => <button key={a.intent} disabled={pending} className={a.primary ? "btn-primary" : "btn-outline"} onClick={() => start(async () => { const r = await onSave(value, a.intent); setMsg(r ? { ok: r.ok, text: r.ok ? "Kaydedildi." : r.error ?? "Hata" } : { ok: true, text: "Kaydedildi." }); })}>{pending ? "…" : a.label}</button>)}
        </div>
      </div>
      {picker && <Picker kind={picker.kind} onPick={picker.cb} onClose={() => setPicker(null)} />}
    </Ctx.Provider>
  );
}
