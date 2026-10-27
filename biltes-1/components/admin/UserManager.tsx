"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { saveUser } from "@/app/actions/admin";
import { ROLE_LABEL } from "@/lib/permissions";

type U = { id: string; email: string; name: string; role: string; active: boolean; lastLoginAt: string | null; campusIds: string[] };
type F = { id: string | null; email: string; name: string; role: string; active: boolean; password: string; campusIds: string[] };
export function UserManager({ users, campuses }: { users: U[]; campuses: { id: string; name: string }[] }) {
  const r = useRouter(); const [p, go] = useTransition(); const [f, setF] = useState<F | null>(null); const [err, setErr] = useState("");
  return (
    <div>
      <div className="overflow-x-auto bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="border-b bg-mist text-xs uppercase tracking-wide text-ink/60"><tr><th className="p-3">Ad</th><th>E-posta</th><th>Rol</th><th>Durum</th><th>Son giriş</th><th /></tr></thead>
        <tbody>{users.map((u) => <tr key={u.id} className="border-b last:border-0"><td className="p-3 font-medium">{u.name}</td><td>{u.email}</td><td>{ROLE_LABEL[u.role as keyof typeof ROLE_LABEL]}</td><td>{u.active ? "Aktif" : <span className="text-red-700">Pasif</span>}</td><td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("tr-TR") : "—"}</td><td><button className="text-teal" onClick={() => setF({ id: u.id, email: u.email, name: u.name, role: u.role, active: u.active, password: "", campusIds: u.campusIds })}>Düzenle</button></td></tr>)}</tbody></table></div>
      <button className="btn-primary mt-4 !min-h-10" onClick={() => setF({ id: null, email: "", name: "", role: "CONTENT_EDITOR", active: true, password: "", campusIds: [] })}>+ Kullanıcı ekle</button>
      {f && (<div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-navy/50 p-4"><div className="w-full max-w-md space-y-3 bg-white p-6">
        <h2 className="font-semibold">{f.id ? "Kullanıcıyı düzenle" : "Yeni kullanıcı"}</h2>
        <label className="block text-sm">Ad Soyad<input className="field !py-2" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></label>
        <label className="block text-sm">E-posta<input type="email" className="field !py-2" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></label>
        <label className="block text-sm">Rol<select className="field !py-2" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}>{Object.entries(ROLE_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></label>
        {f.role === "CAMPUS_MANAGER" && <fieldset className="text-sm"><legend className="mb-1">Yetkili kampüsler</legend>{campuses.map((c) => <label key={c.id} className="mr-4 inline-flex items-center gap-1.5"><input type="checkbox" className="accent-teal" checked={f.campusIds.includes(c.id)} onChange={(e) => setF({ ...f, campusIds: e.target.checked ? [...f.campusIds, c.id] : f.campusIds.filter((x) => x !== c.id) })} />{c.name}</label>)}</fieldset>}
        <label className="block text-sm">{f.id ? "Yeni parola (değiştirmek için)" : "Parola (en az 12 karakter, harf+rakam)"}<input type="password" autoComplete="new-password" className="field !py-2" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} /></label>
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="accent-teal" checked={f.active} onChange={(e) => setF({ ...f, active: e.target.checked })} />Hesap aktif</label>
        {err && <p role="alert" className="text-sm text-red-700">{err}</p>}
        <div className="flex gap-2"><button disabled={p} className="btn-primary !min-h-10" onClick={() => go(async () => { const res = await saveUser(f.id, f); if (!res.ok) setErr(res.error ?? ""); else { setErr(""); setF(null); r.refresh(); } })}>Kaydet</button><button className="btn-outline !min-h-10" onClick={() => { setF(null); setErr(""); }}>Vazgeç</button></div>
      </div></div>)}
    </div>
  );
}
