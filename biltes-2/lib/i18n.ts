export const LOCALES = ["tr", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";
export type L = { tr?: string; en?: string } | null | undefined;

export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);

/** Yerelleştirilmiş JSON alanını döndürür; çeviri yoksa Türkçe'ye düşer. */
export function tx(v: unknown, locale: Locale): string {
  if (!v) return "";
  if (typeof v === "string") return v;
  const o = v as Record<string, string | undefined>;
  return (o[locale] || o[DEFAULT_LOCALE] || "").toString();
}
/** Blok dizisi vb. için aynı mantık. */
export function txAny<T>(v: unknown, locale: Locale, fallback: T): T {
  if (!v || typeof v !== "object") return fallback;
  const o = v as Record<string, T | undefined>;
  const cand = o[locale];
  if (Array.isArray(cand) ? cand.length : cand) return cand as T;
  return (o[DEFAULT_LOCALE] as T) ?? fallback;
}
export const hasTranslation = (v: unknown, locale: Locale) =>
  !!(v && typeof v === "object" && (v as Record<string, unknown>)[locale]);

export const UI = {
  tr: {
    discover: "Keşfet", readMore: "Devamını Oku", allNews: "Tüm Haberler", requestInfo: "Bilgi ve Kayıt Talebi",
    campuses: "Kampüslerimiz", home: "Ana Sayfa", contact: "İletişim", phone: "Telefon", email: "E-posta", address: "Adres",
    sendRequest: "Talebi Gönder", name: "Veli Ad Soyad", level: "İlgilenilen Eğitim Kademesi", campus: "İlgilenilen Kampüs",
    age: "Öğrenci yaşı veya sınıfı", message: "Mesajınız", privacy: "Aydınlatma metnini okudum, kişisel verilerimin başvuru değerlendirmesi amacıyla işlenmesini kabul ediyorum.",
    marketing: "Kampanya ve etkinlik duyurularının tarafıma iletilmesini isteğe bağlı olarak onaylıyorum.",
    thanks: "Talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.", all: "Tümü", select: "Seçiniz",
    skip: "İçeriğe geç", upcoming: "Yaklaşan Etkinlikler", past: "Geçmiş Etkinlikler", noContent: "Bu bölüm için henüz içerik eklenmedi.",
    translationPending: "Bu sayfanın İngilizce çevirisi henüz yayınlanmadı; Türkçe içerik gösteriliyor.",
    pause: "Duraklat", play: "Oynat", prev: "Önceki", next: "Sonraki", menu: "Menü", close: "Kapat",
  },
  en: {
    discover: "Discover", readMore: "Read more", allNews: "All news", requestInfo: "Information & Enrolment",
    campuses: "Our Campuses", home: "Home", contact: "Contact", phone: "Phone", email: "Email", address: "Address",
    sendRequest: "Send request", name: "Parent full name", level: "Education level of interest", campus: "Campus of interest",
    age: "Student age or grade", message: "Your message", privacy: "I have read the privacy notice and consent to my personal data being processed to evaluate this enquiry.",
    marketing: "I optionally agree to receive campaign and event announcements.",
    thanks: "Your request has been received. We will contact you shortly.", all: "All", select: "Select",
    skip: "Skip to content", upcoming: "Upcoming events", past: "Past events", noContent: "No content has been added to this section yet.",
    translationPending: "The English version of this page is not published yet; showing the Turkish content.",
    pause: "Pause", play: "Play", prev: "Previous", next: "Next", menu: "Menu", close: "Close",
  },
} as const;
export type UIKey = keyof (typeof UI)["tr"];
export const ui = (locale: Locale) => UI[locale];
