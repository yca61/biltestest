import clsx from "clsx";
export const cn = clsx;
export const slugify = (s: string) =>
  s.toLocaleLowerCase("tr").replace(/ç/g, "c").replace(/ğ/g, "g").replace(/ı/g, "i").replace(/ö/g, "o").replace(/ş/g, "s").replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
export const fmtDate = (d: Date | string, locale: string) =>
  new Intl.DateTimeFormat(locale === "en" ? "en-GB" : "tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(new Date(d));
export const siteUrl = () => (process.env.SITE_URL || "http://localhost:3000").replace(/\/$/, "");
