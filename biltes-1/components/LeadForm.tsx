"use client";
import { startTransition, useActionState } from "react";
import { submitLead, type LeadState } from "@/app/actions/lead";
import { UI, type Locale } from "@/lib/i18n";
import Link from "next/link";

export function LeadForm({ locale, campuses, source = "bilgi-talebi", defaultCampusId = "" }: { locale: Locale; campuses: { id: string; name: string }[]; source?: "bilgi-talebi" | "ziyaret" | "kampus-formu"; defaultCampusId?: string }) {
  const [state, action, pending] = useActionState<LeadState, FormData>(submitLead, { ok: false });
  const t = UI[locale];
  if (state.ok) return <div role="status" className="rounded-lg border border-teal/30 bg-teal/5 p-8 text-lg text-navy">{t.thanks}</div>;
  const e = state.errors ?? {};
  const Err = ({ k }: { k: string }) => (e[k] ? <p role="alert" className="mt-1 text-sm text-red-700">{e[k]}</p> : null);
  const lbl = "mb-1.5 block text-sm font-medium text-navy";
  return (
    <form onSubmit={(e) => { e.preventDefault(); const fd = new FormData(e.currentTarget); startTransition(() => action(fd)); }} className="grid gap-5 md:grid-cols-2" noValidate>
      <input type="hidden" name="source" value={source} /><input type="hidden" name="locale" value={locale} />
      <div className="hidden" aria-hidden><label>Web sitesi<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <div className="md:col-span-2"><label className={lbl} htmlFor="parentName">{t.name} *</label><input id="parentName" name="parentName" required autoComplete="name" className="field" /><Err k="parentName" /></div>
      <div><label className={lbl} htmlFor="phone">{t.phone} *</label><input id="phone" name="phone" type="tel" required autoComplete="tel" className="field" /><Err k="phone" /></div>
      <div><label className={lbl} htmlFor="email">{t.email} *</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /><Err k="email" /></div>
      <div><label className={lbl} htmlFor="campusId">{t.campus}</label>
        <select id="campusId" name="campusId" defaultValue={defaultCampusId} className="field"><option value="">{t.select}</option>{campuses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
      <div><label className={lbl} htmlFor="level">{t.level}</label>
        <select id="level" name="level" className="field"><option value="">{t.select}</option><option value="anaokulu">{locale === "tr" ? "Anaokulu" : "Preschool"}</option><option value="ilkokul">{locale === "tr" ? "İlkokul" : "Primary"}</option><option value="ortaokul">{locale === "tr" ? "Ortaokul" : "Middle school"}</option></select></div>
      <div className="md:col-span-2"><label className={lbl} htmlFor="studentAge">{t.age}</label><input id="studentAge" name="studentAge" className="field" maxLength={40} /></div>
      <div className="md:col-span-2"><label className={lbl} htmlFor="message">{t.message}</label><textarea id="message" name="message" rows={4} className="field" maxLength={2000} /></div>
      <div className="space-y-3 md:col-span-2">
        <label className="flex gap-3 text-sm leading-6"><input type="checkbox" name="privacy" required className="mt-1.5 h-4 w-4 accent-teal" /><span>{t.privacy} (<Link href={`/${locale}/yasal/kvkk-aydinlatma-metni`} className="text-teal underline" target="_blank">KVKK</Link>) *</span></label><Err k="privacy" />
        <label className="flex gap-3 text-sm leading-6"><input type="checkbox" name="marketing" className="mt-1.5 h-4 w-4 accent-teal" /><span>{t.marketing}</span></label>
      </div>
      {state.message && <p role="alert" className="text-red-700 md:col-span-2">{state.message}</p>}
      <div className="md:col-span-2"><button disabled={pending} className="btn-primary w-full md:w-auto">{pending ? "…" : t.sendRequest}</button></div>
    </form>
  );
}
