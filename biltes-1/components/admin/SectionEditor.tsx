"use client";
import { useRouter } from "next/navigation";
import { EditorShell } from "./FormKit";
import { discardDraft, saveHomeSection } from "@/app/actions/admin";
import type { Field } from "@/lib/forms";

export function SectionEditor({ k, initial, fields, media, hasDraft }: { k: string; initial: Record<string, unknown>; fields: Field[]; media: Record<string, string>; hasDraft: boolean }) {
  const router = useRouter();
  return (
    <>
      <EditorShell initial={initial} fields={fields} media={media} rel={{ campus: [], category: [], page: [] }}
        actions={[{ intent: "draft", label: "Taslak kaydet" }, { intent: "publish", label: "Yayınla", primary: true }]}
        onSave={async (v, intent) => { const r = await saveHomeSection(k, v, intent); router.refresh(); return r; }} />
      <div className="mt-4 flex gap-4 text-sm"><a className="text-teal underline" href="/tr?preview=1" target="_blank">Taslağı önizle</a>{hasDraft && <button className="text-red-700 underline" onClick={async () => { await discardDraft(k); router.refresh(); }}>Taslağı at</button>}</div>
    </>
  );
}
