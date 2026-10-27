import type { Role } from "@prisma/client";

export type Permission =
  | "content" | "media" | "settings" | "menus" | "users" | "audit"
  | "campus.all" | "campus.own" | "leads.view" | "leads.export" | "redirects";

const MAP: Record<Role, Permission[]> = {
  SUPER_ADMIN: ["content", "media", "settings", "menus", "users", "audit", "campus.all", "campus.own", "leads.view", "leads.export", "redirects"],
  CONTENT_EDITOR: ["content", "media", "menus", "campus.own", "campus.all"],
  CAMPUS_MANAGER: ["campus.own", "media"],
  ADMISSIONS: ["leads.view", "leads.export"],
};
export const can = (role: Role, p: Permission) => MAP[role].includes(p);
export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Süper Yönetici", CONTENT_EDITOR: "İçerik Editörü", CAMPUS_MANAGER: "Kampüs Yöneticisi", ADMISSIONS: "Kayıt Personeli",
};
export const STATUS_LABEL = { NEW: "Yeni Başvuru", CONTACTED: "İletişime Geçildi", APPOINTMENT: "Randevu Planlandı", MET: "Görüşme Tamamlandı", ENROLLING: "Kayıt Sürecinde", CLOSED: "Sonuçlandı" } as const;
