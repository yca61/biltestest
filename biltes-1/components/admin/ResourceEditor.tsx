"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { EditorShell } from "./FormKit";
import { deleteResource, duplicatePage, restoreRevision, saveResource } from "@/app/actions/admin";
import type { Field } from "@/lib/forms";

type Rel = { campus: { value: string; label: string }[]; category: { value: string; label: string }[]; page: { value: string; label: string }[] };
export function ResourceEditor({ resource, id, initial, fields, media, rel, canDelete, publicUrl, revisions }: {
  resource: string; id: string | null; initial: Record<string, unknown>; fields: Field[]; media: Record<string, string>; rel: Rel; canDelete: boolean; publicUrl?: string | null;
  revisions?: { id: string; at: string }[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  return (
    <div className="space-y-6">
      <EditorShell initial={initial} fields={fields} media={media} rel={rel}
        onSave={async (v) => { const r = await saveResource(resource, id, v); if (r.ok && !id && r.id) router.replace(`/admin/r/${resource}/${r.id}`); else router.refresh(); return r; }}>
        {id && (
          <div className="flex flex-wrap items-center gap-4 bg-white p-4 text-sm">
            {publicUrl && <a href={publicUrl} target="_blank" className="text-teal underline">Sitede görüntüle / önizle</a>}
            {resource === "pages" && <button className="text-teal underline" disabled={pending} onClick={() => start(async () => { const r = await duplicatePage(id); if (r.id) router.push(`/admin/r/pages/${r.id}`); })}>Sayfayı çoğalt</button>}
            {canDelete && <button className="text-red-700 underline" disabled={pending} onClick={() => confirm("Bu kayıt kalıcı olarak silinsin mi?") && start(async () => { const r = await deleteResource(resource, id); if (r.ok) router.push(`/admin/r/${resource}`); else alert(r.error); })}>Sil</button>}
          </div>
        )}
        {revisions && revisions.length > 0 && (
          <details className="bg-white p-4 text-sm"><summary className="cursor-pointer font-medium">Revizyon geçmişi ({revisions.length})</summary>
            <ul className="mt-3 space-y-2">{revisions.map((r) => <li key={r.id} className="flex items-center justify-between"><span>{r.at}</span><button className="text-teal underline" onClick={() => confirm("Bu sürüme dönülsün mü? (Mevcut içerik de revizyon olarak saklanmaz)") && start(async () => { await restoreRevision(r.id); router.refresh(); })}>Geri yükle</button></li>)}</ul></details>
        )}
      </EditorShell>
    </div>
  );
}
