import { cache } from "react";
import { db } from "./db";

export type SiteSettings = {
  siteTitle: string; siteDescription: string;
  colors: { navy: string; turquoise: string; accent: string };
  contact: { phone: string; email: string; address: string };
  social: { facebook: string; instagram: string; twitter: string; youtube: string };
  footerText: { tr: string; en: string };
  logoUrl: string; logoMobileUrl: string; faviconUrl: string;
  integrations: { veli: string; digital: string; k12: string; franchise: string; hr: string; complaint: string };
  gaId: string;
  groupImages: Record<string, string>;
};
export const DEFAULT_SETTINGS: SiteSettings = {
  siteTitle: "BİLTES Koleji", siteDescription: "Bilim, teknoloji, eğitim ve sanatla geleceği şekillendiren öğrenme yolculuğu.",
  colors: { navy: "#102B46", turquoise: "#00A5B5", accent: "#F2A444" },
  contact: { phone: "(0212) 612 12 12", email: "info@biltes.k12.tr", address: "" },
  social: { facebook: "https://facebook.com/bilteskoleji", instagram: "https://instagram.com/bilteskoleji", twitter: "https://twitter.com/bilteskoleji", youtube: "https://youtube.com/channel/UCJWeNthBkYosEEirLi4CsUA" },
  footerText: { tr: "Bilim, teknoloji, eğitim ve sanatla geleceği şekillendiren bir öğrenme yolculuğu.", en: "A learning journey shaping the future through science, technology, education and art." },
  logoUrl: "", logoMobileUrl: "", faviconUrl: "",
  integrations: { veli: "https://www.biltes.k12.tr/velimiz/", digital: "https://biltesdigital.com", k12: "https://biltes.k12net.com/Login.aspx", franchise: "/tr/kurumsal/franchise-basvuru", hr: "/tr/kurumsal/insan-kaynaklari", complaint: "/tr/kurumsal/sikayet-ve-memnuniyet" },
  gaId: "",
  groupImages: {},
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await db.websiteSetting.findMany();
  const out: Record<string, unknown> = { ...DEFAULT_SETTINGS };
  for (const r of rows) {
    const d = (DEFAULT_SETTINGS as Record<string, unknown>)[r.key];
    out[r.key] = d && typeof d === "object" && !Array.isArray(d) && typeof r.value === "object" ? { ...d, ...(r.value as object) } : r.value;
  }
  return out as SiteSettings;
});
