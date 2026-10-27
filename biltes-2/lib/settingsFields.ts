import type { Field } from "./forms";
export const SETTINGS_FIELDS: Field[] = [
  { name: "siteTitle", label: "Site başlığı", type: "text" },
  { name: "siteDescription", label: "Varsayılan site açıklaması (SEO)", type: "textarea" },
  { name: "logoUrl", label: "Logo", type: "image" }, { name: "logoMobileUrl", label: "Mobil logo", type: "image" }, { name: "faviconUrl", label: "Favicon", type: "image" },
  { name: "colors", label: "Kurumsal renkler (HEX)", type: "group", fields: [{ name: "navy", label: "Lacivert", type: "text" }, { name: "turquoise", label: "Ana vurgu (düğmeler, bağlantılar)", type: "text" }, { name: "accent", label: "Vurgu", type: "text" }] },
  { name: "contact", label: "İletişim bilgileri", type: "group", fields: [{ name: "phone", label: "Telefon", type: "text" }, { name: "email", label: "E-posta", type: "email" }, { name: "address", label: "Adres", type: "textarea" }] },
  { name: "social", label: "Sosyal medya", type: "group", fields: [{ name: "facebook", label: "Facebook", type: "url" }, { name: "instagram", label: "Instagram", type: "url" }, { name: "twitter", label: "X / Twitter", type: "url" }, { name: "youtube", label: "YouTube", type: "url" }] },
  { name: "footerText", label: "Alt bilgi metni", type: "textarea", localized: true },
  { name: "integrations", label: "Entegrasyon bağlantıları", type: "group", fields: [
    { name: "veli", label: "Veli Portalı", type: "url" }, { name: "digital", label: "BİLTES Digital", type: "url" }, { name: "k12", label: "K12", type: "url" },
    { name: "franchise", label: "Franchise başvuru", type: "url" }, { name: "hr", label: "İnsan Kaynakları", type: "url" }, { name: "complaint", label: "Şikayet ve memnuniyet", type: "url" }] },
  { name: "groupImages", label: "Bölüm başlık görselleri (görseli olmayan sayfalarda kullanılır)", type: "group", fields: [{ name: "kurumsal", label: "Kurumsal", type: "image" }, { name: "egitim", label: "Eğitim", type: "image" }, { name: "hayat", label: "BİLTES'te Yaşam", type: "image" }, { name: "uluslararasi", label: "Uluslararası", type: "image" }, { name: "kayit", label: "Kayıt", type: "image" }] },
  { name: "gaId", label: "Google Analytics ölçüm kimliği (yalnızca çerez onayından sonra yüklenir)", type: "text" },
];
