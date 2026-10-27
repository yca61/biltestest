// Temel uçtan uca HTTP testleri (çalışan sunucuya karşı): BASE=http://localhost:3000 npm run test:e2e
const BASE = process.env.BASE ?? "http://localhost:3000";
let fail = 0;
async function t(name: string, fn: () => Promise<boolean | string>) {
  try { const r = await fn(); if (r === true) console.log("✓", name); else { fail++; console.log("✗", name, r); } } catch (e) { fail++; console.log("✗", name, e); }
}
const get = (p: string, init?: RequestInit) => fetch(BASE + p, { redirect: "manual", ...init });
for (const p of ["/tr", "/en", "/tr/kampusler", "/tr/kampusler/sadabad", "/tr/kampusler/gokturk", "/tr/egitim/anaokulu", "/tr/egitim/ilkokul", "/tr/egitim/pyp", "/tr/kurumsal/hakkimizda", "/tr/kurumsal", "/tr/kayit/bilgi-talebi", "/tr/iletisim", "/tr/haberler", "/tr/etkinlikler", "/tr/galeri", "/tr/hayat/basarilarimiz", "/en/kurumsal/misyon-ve-vizyon", "/sitemap.xml", "/robots.txt", "/admin/login"])
  await t(`200 ${p}`, async () => { const r = await get(p); return r.status === 200 || `status ${r.status}`; });
await t("TR sayfada hreflang+canonical", async () => { const h = await (await get("/tr/kampusler")).text(); return (h.includes(`hrefLang="en"`) && h.includes('rel="canonical"')) || "eksik"; });
await t("Başlık h1 hero metni", async () => (await (await get("/tr")).text()).includes("Mutlulukla Başarıya Taşır!") || "yok");
await t("/ → /tr", async () => { const r = await get("/"); return (r.status === 308 && r.headers.get("location")!.endsWith("/tr")) || `${r.status}`; });
await t("Eski URL 301 zinciri /basarilarimiz", async () => { const r1 = await get("/basarilarimiz"); const r2 = await get(new URL(r1.headers.get("location")!, BASE).pathname); return (r2.status === 308 && r2.headers.get("location")!.includes("/tr/hayat/basarilarimiz")) || `${r1.status}->${r2.status} ${r2.headers.get("location")}`; });
await t("Bilinmeyen sayfa 404", async () => (await get("/tr/yok/hic")).status === 404 || "404 değil");
await t("/admin giriş yoksa yönlendirir", async () => { const r = await get("/admin"); return (r.status === 307 && r.headers.get("location")!.includes("/admin/login")) || `${r.status}`; });
await t("Medya API oturumsuz 403", async () => (await get("/api/media")).status === 403 || "403 değil");
await t("Medya yükleme Origin'siz reddedilir", async () => { const r = await get("/api/media", { method: "POST", body: new FormData() }); return r.status === 403 || `${r.status}`; });
await t("CSV export oturumsuz 403", async () => (await get("/api/leads/export")).status === 403 || "403 değil");
await t("Güvenlik başlıkları", async () => { const r = await get("/tr"); return (r.headers.get("x-content-type-options") === "nosniff" && !!r.headers.get("strict-transport-security")) || "eksik"; });
console.log(fail ? `\n${fail} test başarısız` : "\nTüm testler geçti");
process.exit(fail ? 1 : 0);
