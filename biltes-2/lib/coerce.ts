import { cleanHtml, cleanText } from "./sanitize";
import type { Field } from "./forms";
import { BLOCK_SPECS } from "./forms";

const LOCS = ["tr", "en"] as const;
const SAFE_URL = /^(https?:\/\/|\/|mailto:|tel:|#)/i;
export const safeUrl = (s: unknown) => {
  const v = typeof s === "string" ? s.trim() : "";
  return v && SAFE_URL.test(v) ? v.slice(0, 2000) : "";
};

function one(f: Field, v: unknown): unknown {
  switch (f.type) {
    case "text": case "slug": case "email": return cleanText(String(v ?? "")).slice(0, 500);
    case "textarea": return cleanText(String(v ?? "")).slice(0, 8000);
    case "rich": return cleanHtml(String(v ?? "")).slice(0, 200000);
    case "number": { const n = Number(v); return Number.isFinite(n) ? Math.trunc(n) : 0; }
    case "bool": return v === true || v === "true" || v === "on";
    case "select": { const ok = (f.options ?? []).some((o) => o.value === v); return ok ? v : f.options?.[0]?.value ?? ""; }
    case "multiselect": return Array.isArray(v) ? v.filter((x) => (f.options ?? []).some((o) => o.value === x)) : [];
    case "datetime": case "date": { if (!v) return null; const d = new Date(String(v)); return isNaN(+d) ? null : d.toISOString(); }
    case "image": case "url": return safeUrl(v);
    case "mediaId": case "relation": return typeof v === "string" && /^[a-z0-9]{10,40}$/i.test(v) ? v : null;
    case "tags": return (Array.isArray(v) ? v : String(v ?? "").split(",")).map((t) => cleanText(String(t))).filter(Boolean).slice(0, 30);
    case "group": return coerceObject(f.fields ?? [], v);
    case "list": return (Array.isArray(v) ? v : []).slice(0, f.max ?? 60).map((it) => coerceObject(f.fields ?? [], it));
    case "blocks": return (Array.isArray(v) ? v : []).slice(0, 80).flatMap((b) => {
      const type = (b as { type?: string })?.type;
      const spec = type && BLOCK_SPECS[type];
      return spec ? [{ type, ...coerceObject(spec.fields, b) }] : [];
    });
  }
}

export function coerceField(f: Field, v: unknown): unknown {
  if (f.localized) {
    const src = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const l of LOCS) out[l] = one(f, src[l]);
    return out;
  }
  return one(f, v);
}
export function coerceObject(fields: Field[], v: unknown): Record<string, unknown> {
  const src = (v && typeof v === "object" ? v : {}) as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const f of fields) out[f.name] = coerceField(f, src[f.name]);
  return out;
}
