import type { Permission } from "./permissions";
import { type Field, STATUS_OPTIONS, LEVEL_OPTIONS, PAGE_GROUPS, seoFields } from "./forms";

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
const tr = (v: unknown) => (v && typeof v === "object" ? ((v as Row).tr ?? "") : (v as string) ?? "");
const st = (v: string) => STATUS_OPTIONS.find((o) => o.value === v)?.label ?? v;
const dt = (v: unknown) => (v ? new Date(v as string).toLocaleString("tr-TR", { dateStyle: "medium", timeStyle: "short" }) : "—");

export type Resource = {
  key: string; model: string; label: string; singular: string; perm: Permission; fields: Field[];
  columns: { label: string; get: (r: Row) => string }[]; titleOf: (r: Row) => string;
  orderBy: Row; slugFrom?: string; hasStatus?: boolean; revisions?: boolean; publicUrl?: (r: Row) => string | null;
  campusScoped?: boolean; noCreate?: boolean; noDelete?: boolean;
};

const status: Field = { name: "status", label: "Durum", type: "select", options: STATUS_OPTIONS };
const publishAt: Field = { name: "publishAt", label: "Yayın zamanı (boşsa hemen)", type: "datetime", hint: "Gelecek bir tarih verirseniz içerik o zamana kadar görünmez." };
const sortOrder: Field = { name: "sortOrder", label: "Sıra", type: "number" };

export const RESOURCES: Record<string, Resource> = {
  pages: {
    key: "pages", model: "page", label: "Sayfalar", singular: "Sayfa", perm: "content", orderBy: [{ group: "asc" }, { sortOrder: "asc" }], slugFrom: "title", hasStatus: true, revisions: true,
    titleOf: (r) => tr(r.title), publicUrl: (r) => `/tr/${r.group}/${r.slug}`,
    columns: [{ label: "Başlık", get: (r) => tr(r.title) }, { label: "Bölüm", get: (r) => r.group }, { label: "Adres", get: (r) => `/${r.group}/${r.slug}` }, { label: "Durum", get: (r) => st(r.status) }],
    fields: [
      { name: "title", label: "Başlık", type: "text", localized: true, required: true },
      { name: "group", label: "Bölüm", type: "select", options: PAGE_GROUPS },
      { name: "slug", label: "URL adı (slug)", type: "slug", hint: "Boş bırakılırsa başlıktan üretilir." },
      { name: "summary", label: "Özet", type: "textarea", localized: true },
      { name: "coverId", label: "Kapak görseli", type: "mediaId" },
      { name: "blocks", label: "İçerik blokları", type: "blocks", localized: true },
      seoFields, status, publishAt, sortOrder,
    ],
  },
  campuses: {
    key: "campuses", model: "campus", label: "Kampüsler", singular: "Kampüs", perm: "campus.own", orderBy: { sortOrder: "asc" }, slugFrom: "name", hasStatus: true, campusScoped: true,
    titleOf: (r) => r.name, publicUrl: (r) => `/tr/kampusler/${r.slug}`,
    columns: [{ label: "Kampüs", get: (r) => r.name }, { label: "Telefon", get: (r) => r.phone ?? "—" }, { label: "Durum", get: (r) => st(r.status) }],
    fields: [
      { name: "name", label: "Kampüs adı", type: "text", required: true },
      { name: "slug", label: "URL adı (slug)", type: "slug" },
      { name: "location", label: "Konum (ilçe/semt)", type: "text", localized: true },
      { name: "description", label: "Açıklama", type: "textarea", localized: true },
      { name: "address", label: "Adres", type: "textarea" },
      { name: "phone", label: "Telefon", type: "text" },
      { name: "email", label: "E-posta", type: "email" },
      { name: "levels", label: "Eğitim kademeleri", type: "multiselect", options: LEVEL_OPTIONS },
      { name: "features", label: "Kampüs özellikleri (satır satır)", type: "list", itemLabel: "Özellik", fields: [{ name: "text", label: "Özellik", type: "text", localized: true }] },
      { name: "mainImageId", label: "Ana görsel", type: "mediaId" },
      { name: "galleryItems", label: "Fotoğraf galerisi", type: "list", itemLabel: "Fotoğraf", fields: [{ name: "mediaId", label: "Görsel", type: "mediaId" }] },
      { name: "videoUrl", label: "Tanıtım videosu (YouTube/Vimeo)", type: "url" },
      { name: "mapEmbedUrl", label: "Google Maps gömme (embed) adresi", type: "url", hint: "Google Maps → Paylaş → Haritayı yerleştir → src adresi" },
      { name: "mapLinkUrl", label: "Google Maps bağlantısı", type: "url" },
      seoFields, status, sortOrder,
    ],
  },
  programs: {
    key: "programs", model: "educationProgram", label: "Eğitim Programları", singular: "Program", perm: "content", orderBy: { sortOrder: "asc" }, slugFrom: "title", hasStatus: true,
    titleOf: (r) => tr(r.title), publicUrl: (r) => `/tr/egitim/${r.slug}`,
    columns: [{ label: "Program", get: (r) => tr(r.title) }, { label: "Kademe", get: (r) => r.level }, { label: "Durum", get: (r) => st(r.status) }],
    fields: [
      { name: "title", label: "Başlık", type: "text", localized: true, required: true },
      { name: "slug", label: "URL adı (slug)", type: "slug" },
      { name: "level", label: "Kademe", type: "select", options: [...LEVEL_OPTIONS, { value: "diger", label: "Diğer" }] },
      { name: "summary", label: "Kısa tanıtım", type: "textarea", localized: true },
      { name: "imageId", label: "Görsel", type: "mediaId" },
      { name: "body", label: "Program içeriği (müfredat vb.)", type: "blocks", localized: true },
      seoFields, status, sortOrder,
    ],
  },
  news: {
    key: "news", model: "newsArticle", label: "Haber ve Duyurular", singular: "Haber", perm: "content", orderBy: { createdAt: "desc" }, slugFrom: "title", hasStatus: true,
    titleOf: (r) => tr(r.title), publicUrl: (r) => `/tr/haberler/${r.slug}`,
    columns: [{ label: "Başlık", get: (r) => tr(r.title) }, { label: "Tür", get: (r) => r.kind }, { label: "Yayın", get: (r) => dt(r.publishAt ?? r.createdAt) }, { label: "Durum", get: (r) => st(r.status) }],
    fields: [
      { name: "title", label: "Başlık", type: "text", localized: true, required: true },
      { name: "slug", label: "URL adı (slug)", type: "slug" },
      { name: "kind", label: "Tür", type: "select", options: [{ value: "haber", label: "Haber" }, { value: "duyuru", label: "Duyuru" }] },
      { name: "excerpt", label: "Özet", type: "textarea", localized: true },
      { name: "body", label: "İçerik", type: "rich", localized: true },
      { name: "coverId", label: "Kapak görseli", type: "mediaId" },
      { name: "categoryId", label: "Kategori", type: "relation", relation: "category" },
      { name: "campusId", label: "Kampüs (isteğe bağlı)", type: "relation", relation: "campus" },
      { name: "tags", label: "Etiketler (virgülle)", type: "tags" },
      { name: "featured", label: "Öne çıkan", type: "bool" },
      seoFields, status, publishAt,
    ],
  },
  categories: {
    key: "categories", model: "newsCategory", label: "Haber Kategorileri", singular: "Kategori", perm: "content", orderBy: { slug: "asc" }, slugFrom: "name",
    titleOf: (r) => tr(r.name), columns: [{ label: "Kategori", get: (r) => tr(r.name) }, { label: "Slug", get: (r) => r.slug }],
    fields: [{ name: "name", label: "Ad", type: "text", localized: true, required: true }, { name: "slug", label: "URL adı", type: "slug" }],
  },
  events: {
    key: "events", model: "event", label: "Etkinlikler", singular: "Etkinlik", perm: "content", orderBy: { startsAt: "desc" }, slugFrom: "title", hasStatus: true,
    titleOf: (r) => tr(r.title), publicUrl: (r) => `/tr/etkinlikler/${r.slug}`,
    columns: [{ label: "Etkinlik", get: (r) => tr(r.title) }, { label: "Tarih", get: (r) => dt(r.startsAt) }, { label: "Durum", get: (r) => st(r.status) }],
    fields: [
      { name: "title", label: "Başlık", type: "text", localized: true, required: true },
      { name: "slug", label: "URL adı (slug)", type: "slug" },
      { name: "startsAt", label: "Başlangıç", type: "datetime", required: true }, { name: "endsAt", label: "Bitiş", type: "datetime" },
      { name: "location", label: "Mekân", type: "text" }, { name: "campusId", label: "Kampüs", type: "relation", relation: "campus" },
      { name: "description", label: "Açıklama", type: "textarea", localized: true },
      { name: "imageId", label: "Etkinlik görseli", type: "mediaId" }, { name: "registerUrl", label: "Kayıt bağlantısı", type: "url" },
      seoFields, status,
    ],
  },
  achievements: {
    key: "achievements", model: "achievement", label: "Başarılar", singular: "Başarı", perm: "content", orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }], hasStatus: true,
    titleOf: (r) => tr(r.title), columns: [{ label: "Başarı", get: (r) => tr(r.title) }, { label: "Kategori", get: (r) => r.category }, { label: "Yıl", get: (r) => String(r.year ?? "—") }, { label: "Durum", get: (r) => st(r.status) }],
    fields: [
      { name: "title", label: "Başlık", type: "text", localized: true, required: true },
      { name: "category", label: "Kategori", type: "select", options: [{ value: "akademik", label: "Akademik" }, { value: "yarisma", label: "Yarışma" }, { value: "sanat-spor", label: "Sanat ve Spor" }, { value: "proje", label: "Öğrenci Projesi" }, { value: "kurumsal", label: "Kurumsal" }] },
      { name: "summary", label: "Açıklama", type: "textarea", localized: true }, { name: "year", label: "Yıl", type: "number" },
      { name: "imageId", label: "Görsel", type: "mediaId" }, status, sortOrder,
    ],
  },
  clubs: {
    key: "clubs", model: "club", label: "Kulüp ve Atölyeler", singular: "Kulüp/Atölye", perm: "content", orderBy: { sortOrder: "asc" }, slugFrom: "title", hasStatus: true,
    titleOf: (r) => tr(r.title), columns: [{ label: "Ad", get: (r) => tr(r.title) }, { label: "Tür", get: (r) => r.kind }, { label: "Durum", get: (r) => st(r.status) }],
    fields: [
      { name: "title", label: "Ad", type: "text", localized: true, required: true }, { name: "slug", label: "URL adı", type: "slug" },
      { name: "kind", label: "Tür", type: "select", options: [{ value: "kulup", label: "Kulüp" }, { value: "atolye", label: "Atölye" }, { value: "spor", label: "Spor" }, { value: "sanat", label: "Sanat" }] },
      { name: "summary", label: "Açıklama", type: "textarea", localized: true }, { name: "imageId", label: "Görsel", type: "mediaId" }, status, sortOrder,
    ],
  },
  testimonials: {
    key: "testimonials", model: "testimonial", label: "Veli Görüşleri", singular: "Görüş", perm: "content", orderBy: { sortOrder: "asc" }, hasStatus: true,
    titleOf: (r) => r.author, columns: [{ label: "Veli", get: (r) => r.author }, { label: "İzin", get: (r) => (r.consent ? "Var" : "YOK") }, { label: "Durum", get: (r) => st(r.status) }],
    fields: [
      { name: "author", label: "Ad (yayın izniyle, örn. 'A. Y.')", type: "text", required: true }, { name: "relation", label: "Sıfat", type: "text", localized: true },
      { name: "quote", label: "Görüş", type: "textarea", localized: true, required: true },
      { name: "campusId", label: "Kampüs", type: "relation", relation: "campus" }, { name: "photoId", label: "Fotoğraf (isteğe bağlı)", type: "mediaId" },
      { name: "videoUrl", label: "Video (isteğe bağlı)", type: "url" },
      { name: "consent", label: "Yayın izni yazılı olarak alındı", type: "bool", hint: "İşaretlenmeden yayına alınamaz." }, status, sortOrder,
    ],
  },
  hero: {
    key: "hero", model: "heroSlide", label: "Hero Slaytları", singular: "Slayt", perm: "content", orderBy: { sortOrder: "asc" },
    titleOf: (r) => tr(r.title), columns: [{ label: "Başlık", get: (r) => tr(r.title) }, { label: "Aktif", get: (r) => (r.enabled ? "Evet" : "Hayır") }, { label: "Sıra", get: (r) => String(r.sortOrder) }],
    fields: [
      { name: "title", label: "Başlık", type: "text", localized: true, required: true }, { name: "subtitle", label: "Alt metin", type: "textarea", localized: true },
      { name: "ctaLabel", label: "Düğme yazısı", type: "text", localized: true }, { name: "ctaUrl", label: "Düğme bağlantısı", type: "url" },
      { name: "desktopId", label: "Masaüstü görseli", type: "mediaId" }, { name: "mobileId", label: "Mobil görseli", type: "mediaId" },
      { name: "videoUrl", label: "Arka plan videosu (mp4 adresi, isteğe bağlı)", type: "url" },
      { name: "overlay", label: "Karartma yoğunluğu (0-90)", type: "number" },
      { name: "enabled", label: "Aktif", type: "bool" }, { name: "publishAt", label: "Yayın başlangıcı", type: "datetime" }, { name: "unpublishAt", label: "Yayın bitişi", type: "datetime" }, sortOrder,
    ],
  },
  redirects: {
    key: "redirects", model: "redirect", label: "Yönlendirmeler (301)", singular: "Yönlendirme", perm: "redirects", orderBy: { fromPath: "asc" },
    titleOf: (r) => r.fromPath, columns: [{ label: "Eski adres", get: (r) => r.fromPath }, { label: "Yeni adres", get: (r) => r.toPath }, { label: "Kalıcı", get: (r) => (r.permanent ? "301" : "302") }, { label: "Kullanım", get: (r) => String(r.hits) }],
    fields: [{ name: "fromPath", label: "Eski yol (örn. /kurumsal/kadromuz)", type: "text", required: true }, { name: "toPath", label: "Yeni yol", type: "text", required: true }, { name: "permanent", label: "Kalıcı (301)", type: "bool" }],
  },
};
