"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { updateLead, deleteLead } from "@/app/actions/admin";
import { STATUS_LABEL } from "@/lib/permissions";

export function LeadPanel({ id, status, assigneeId, staff, canDelete }: { id: string; status: string; assigneeId: string | null; staff: { id: string; name: string }[]; canDelete: boolean }) {
  const r = useRouter(); const [p, go] = useTransition(); const [note, setNote] = useState("");
  const upd = (patch: Parameters<typeof updateLead>[1]) => go(async () => { await updateLead(id, patch); r.refresh(); });
  return (
    <div className="space-y-5 bg-white p-5 shadow-sm">
      <div><label className="mb-1 block text-sm font-medium">Durum</label><select disabled={p} value={status} onChange={(e) => upd({ status: e.target.value })} className="field">{Object.entries(STATUS_LABEL).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
      <div><label className="mb-1 block text-sm font-medium">Atanan personel</label><select disabled={p} value={assigneeId ?? ""} onChange={(e) => upd({ assigneeId: e.target.value || null })} className="field"><option value="">— Atanmamış —</option>{staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
      <div><label className="mb-1 block text-sm font-medium">İç not ekle</label><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="field" /><button disabled={p || !note.trim()} onClick={() => { upd({ note }); setNote(""); }} className="btn-dark mt-2 !min-h-10">Notu kaydet</button></div>
      {canDelete && <button className="text-sm text-red-700 underline" onClick={() => confirm("Bu başvuru kalıcı olarak silinsin mi? (KVKK silme talebi)") && go(async () => { await deleteLead(id); r.push("/admin/leads"); })}>Başvuruyu kalıcı sil</button>}
    </div>
  );
}
