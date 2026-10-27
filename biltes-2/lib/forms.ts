// Yönetim paneli form şemaları. Hem istemcide (form çizimi) hem sunucuda (doğrulama/temizleme) kullanılır.
export type Opt = { value: string; label: string };
export type FieldType =
  | "text" | "textarea" | "rich" | "number" | "bool" | "select" | "datetime" | "date" | "image" | "mediaId"
  | "url" | "tags" | "list" | "group" | "blocks" | "slug" | "relation" | "multiselect" | "email";

export type Field = {
  name: string; label: string; type: FieldType;
  localized?: boolean; required?: boolean; hint?: string;
  options?: Opt[]; fields?: Field[]; relation?: "campus" | "category" | "page";
  itemLabel?: string; max?: number;
};

export const LEVEL_OPTIONS: Opt[] = [
  { value: "anaokulu", label: "Anaokulu" }, { value: "ilkokul", label: "İlkokul" }, { value: "ortaokul", label: "Ortaokul" },
];
export const STATUS_OPTIONS: Opt[] = [
  { value: "DRAFT", label: "Taslak" }, { value: "PUBLISHED", label: "Yayında" }, { value: "ARCHIVED", label: "Arşivlendi" },
];
export const PAGE_GROUPS: Opt[] = [
  { value: "kurumsal", label: "Kurumsal" }, { value: "egitim", label: "Eğitim" }, { value: "hayat", label: "BİLTES'te Yaşam" },
  { value: "uluslararasi", label: "Uluslararası" }, { value: "kayit", label: "Kayıt" }, { value: "yasal", label: "Yasal" },
];

const link: Field[] = [
  { name: "label", label: "Düğme yazısı", type: "text", localized: true },
  { name: "url", label: "Bağlantı", type: "url" },
];

export const BLOCK_SPECS: Record<string, { label: string; fields: Field[] }> = {
  text: { label: "Metin", fields: [{ name: "title", label: "Başlık", type: "text" }, { name: "html", label: "İçerik", type: "rich" }] },
  imageText: {
    label: "Metin + Görsel",
    fields: [
      { name: "title", label: "Başlık", type: "text" }, { name: "html", label: "İçerik", type: "rich" }, { name: "image", label: "Görsel", type: "image" },
      { name: "alt", label: "Görsel alt metni", type: "text" }, { name: "imageRight", label: "Görsel sağda", type: "bool" },
    ],
  },
  gallery: { label: "Galeri", fields: [{ name: "title", label: "Başlık", type: "text" }, { name: "images", label: "Görseller", type: "list", itemLabel: "Görsel", fields: [{ name: "src", label: "Görsel", type: "image" }, { name: "alt", label: "Alt metin", type: "text" }] }] },
  video: { label: "Video", fields: [{ name: "title", label: "Başlık", type: "text" }, { name: "url", label: "YouTube / Vimeo adresi", type: "url" }] },
  accordion: { label: "Akordeon", fields: [{ name: "title", label: "Başlık", type: "text" }, { name: "items", label: "Maddeler", type: "list", itemLabel: "Madde", fields: [{ name: "q", label: "Soru / başlık", type: "text" }, { name: "a", label: "Yanıt", type: "textarea" }] }] },
  cta: { label: "Çağrı (CTA)", fields: [{ name: "title", label: "Başlık", type: "text" }, { name: "text", label: "Metin", type: "textarea" }, { name: "label", label: "Düğme yazısı", type: "text" }, { name: "url", label: "Bağlantı", type: "url" }] },
  stats: { label: "İstatistikler (doğrulanmış)", fields: [{ name: "title", label: "Başlık", type: "text" }, { name: "items", label: "Değerler", type: "list", itemLabel: "Değer", fields: [{ name: "value", label: "Değer", type: "text" }, { name: "label", label: "Etiket", type: "text" }] }] },
  cards: { label: "Kartlar", fields: [{ name: "title", label: "Başlık", type: "text" }, { name: "items", label: "Kartlar", type: "list", itemLabel: "Kart", fields: [{ name: "title", label: "Başlık", type: "text" }, { name: "text", label: "Metin", type: "textarea" }, { name: "image", label: "Görsel", type: "image" }, { name: "url", label: "Bağlantı", type: "url" }] }] },
  features: { label: "Özellik ızgarası", fields: [{ name: "title", label: "Başlık", type: "text" }, { name: "items", label: "Özellikler", type: "list", itemLabel: "Özellik", fields: [{ name: "title", label: "Başlık", type: "text" }, { name: "text", label: "Metin", type: "textarea" }] }] },
  timeline: { label: "Zaman çizelgesi", fields: [{ name: "title", label: "Başlık", type: "text" }, { name: "items", label: "Olaylar", type: "list", itemLabel: "Olay", fields: [{ name: "date", label: "Tarih / yıl", type: "text" }, { name: "title", label: "Başlık", type: "text" }, { name: "text", label: "Açıklama", type: "textarea" }] }] },
  quote: { label: "Alıntı", fields: [{ name: "text", label: "Alıntı", type: "textarea" }, { name: "author", label: "Kaynak", type: "text" }] },
  download: { label: "Belge indirme", fields: [{ name: "title", label: "Başlık", type: "text" }, { name: "items", label: "Belgeler", type: "list", itemLabel: "Belge", fields: [{ name: "label", label: "Ad", type: "text" }, { name: "url", label: "PDF / dosya (Medya Kitaplığı)", type: "image" }] }] },
};

export const seoFields: Field = {
  name: "seo", label: "SEO", type: "group",
  fields: [
    { name: "title", label: "Meta başlık", type: "text", localized: true },
    { name: "description", label: "Meta açıklama", type: "textarea", localized: true },
    { name: "ogImage", label: "Paylaşım görseli", type: "image" },
  ],
};

export const HOME_SECTIONS: Record<string, { label: string; fields: Field[] }> = {
  about: { label: "BİLTES Hakkında", fields: [
    { name: "eyebrow", label: "Üst etiket", type: "text", localized: true }, { name: "title", label: "Başlık", type: "textarea", localized: true },
    { name: "text", label: "Giriş metni", type: "textarea", localized: true }, ...link.map((f) => ({ ...f, name: "cta" + f.name[0].toUpperCase() + f.name.slice(1) })),
    { name: "image1", label: "Ana görsel", type: "image" }, { name: "image2", label: "İkinci (örtüşen) görsel", type: "image" },
  ] },
  pillars: { label: "Dört Sütun", fields: [{ name: "items", label: "Sütunlar", type: "list", itemLabel: "Sütun", fields: [
    { name: "title", label: "Başlık", type: "text", localized: true }, { name: "text", label: "Açıklama", type: "textarea", localized: true }, { name: "image", label: "Görsel (isteğe bağlı)", type: "image" },
  ] }] },
  programs: { label: "Eğitim Programları", fields: [{ name: "eyebrow", label: "Üst etiket", type: "text", localized: true }, { name: "title", label: "Başlık", type: "text", localized: true }] },
  campuses: { label: "Kampüslerimiz", fields: [{ name: "eyebrow", label: "Üst etiket", type: "text", localized: true }, { name: "title", label: "Başlık", type: "text", localized: true }, { name: "text", label: "Açıklama", type: "textarea", localized: true }] },
  approach: { label: "Eğitim Yaklaşımı", fields: [{ name: "title", label: "Başlık", type: "text", localized: true }, { name: "items", label: "Başlıklar (yalnızca doğrulanmış içerik)", type: "list", itemLabel: "Başlık", fields: [
    { name: "title", label: "Başlık", type: "text", localized: true }, { name: "text", label: "Açıklama", type: "textarea", localized: true }, { name: "image", label: "Görsel", type: "image" }, { name: "url", label: "Detay bağlantısı", type: "url" },
  ] }] },
  life: { label: "BİLTES'te Yaşam", fields: [{ name: "title", label: "Başlık", type: "text", localized: true }, { name: "items", label: "Etkinlik alanları", type: "list", itemLabel: "Alan", fields: [
    { name: "title", label: "Ad", type: "text", localized: true }, { name: "image", label: "Görsel", type: "image" },
  ] }] },
  achievements: { label: "Başarılarımız", fields: [{ name: "eyebrow", label: "Üst etiket", type: "text", localized: true }, { name: "title", label: "Başlık", type: "text", localized: true }] },
  news: { label: "Haberler", fields: [{ name: "eyebrow", label: "Üst etiket", type: "text", localized: true }, { name: "title", label: "Başlık", type: "text", localized: true }] },
  testimonials: { label: "Veli Görüşleri", fields: [{ name: "eyebrow", label: "Üst etiket", type: "text", localized: true }, { name: "title", label: "Başlık", type: "text", localized: true }] },
  cta: { label: "Kayıt Çağrısı", fields: [
    { name: "title", label: "Başlık", type: "textarea", localized: true }, { name: "text", label: "Metin", type: "textarea", localized: true },
    { name: "btn1Label", label: "Düğme 1 yazısı", type: "text", localized: true }, { name: "btn1Url", label: "Düğme 1 bağlantısı", type: "url" },
    { name: "btn2Label", label: "Düğme 2 yazısı", type: "text", localized: true }, { name: "btn2Url", label: "Düğme 2 bağlantısı", type: "url" },
    { name: "image", label: "Arka plan görseli", type: "image" },
  ] },
};
