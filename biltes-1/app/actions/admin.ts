"use server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { requirePermission, requireUser, hashPassword, validatePasswordStrength } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { audit } from "@/lib/audit";
import { RESOURCES } from "@/lib/resources";
import { coerceObject, safeUrl } from "@/lib/coerce";
import { HOME_SECTIONS } from "@/lib/forms";
import { SETTINGS_FIELDS } from "@/lib/settingsFields";
import { cleanText } from "@/lib/sanitize";
import { slugify } from "@/lib/utils";

type R = { ok: boolean; error?: string; id?: string };
const refresh = () => revalidatePath("/", "layout");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const model = (name: string) => (db as any)[name];
const VIRTUAL = ["galleryItems"];

async function uniqueSlug(res: string, base: string, exclude: string | null, extra: Record<string, unknown>) {
  const m = model(RESOURCES[res].model);
  let s = slugify(base) || "icerik", n = 1;
  while (await m.findFirst({ where: { slug: s, ...extra, ...(exclude ? { id: { not: exclude } } : {}) }, select: { id: true } })) s = `${slugify(base)}-${++n}`;
  return s;
}

export async function saveResource(key: string, id: string | null, value: Record<string, unknown>): Promise<R> {
  const res = RESOURCES[key];
  if (!res) return { ok: false, error: "Bilinmeyen kaynak" };
  const user = await requirePermission(res.perm);
  try {
    if (key === "campuses") {
      if (id ? !(can(user.role, "campus.all") || user.campusIds.includes(id)) : !can(user.role, "campus.all")) return { ok: false, error: "Bu kampüs için yetkiniz yok." };
    }
    const data = coerceObject(res.fields, value) as Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
    for (const f of res.fields) if (["datetime", "date"].includes(f.type)) data[f.name] = data[f.name] ? new Date(data[f.name]) : null;
    for (const f of res.fields) if (f.required && (f.localized ? !data[f.name]?.tr : !data[f.name])) return { ok: false, error: `“${f.label}” zorunludur.` };
    const gallery = data.galleryItems as { mediaId: string | null }[] | undefined;
    VIRTUAL.forEach((v) => delete data[v]);
    if (key === "testimonials" && data.status === "PUBLISHED" && !data.consent) return { ok: false, error: "Yayın izni işaretlenmeden görüş yayınlanamaz." };
    if (key === "hero") data.overlay = Math.min(90, Math.max(0, data.overlay ?? 45));
    if (res.slugFrom) {
      const t = data[res.slugFrom]; const base = data.slug || (typeof t === "object" ? t?.tr : t);
      data.slug = await uniqueSlug(key, String(base || ""), id, key === "pages" ? { group: data.group } : {});
    }
    if (key === "redirects") {
      if (!data.fromPath.startsWith("/") || !data.toPath) return { ok: false, error: "Yollar / ile başlamalıdır." };
      data.fromPath = "/" + data.fromPath.split("/").filter(Boolean).join("/");
    }
    if (key === "news" && data.status === "PUBLISHED" && !data.publishAt) data.publishAt = new Date();
    let saved;
    if (id) {
      if (key === "pages") {
        const prev = await db.page.findUnique({ where: { id } });
        if (prev) {
          await db.pageRevision.create({ data: { pageId: id, snapshot: prev as unknown as Prisma.InputJsonValue, authorId: user.id } });
          const old = await db.pageRevision.findMany({ where: { pageId: id }, orderBy: { createdAt: "desc" }, skip: 30, select: { id: true } });
          if (old.length) await db.pageRevision.deleteMany({ where: { id: { in: old.map((o) => o.id) } } });
        }
      }
      saved = await model(res.model).update({ where: { id }, data });
    } else {
      if (key === "news") data.authorId = user.id;
      saved = await model(res.model).create({ data });
    }
    if (key === "campuses" && gallery) {
      await db.campusGallery.deleteMany({ where: { campusId: saved.id } });
      const rows = gallery.filter((g) => g.mediaId).map((g, i) => ({ campusId: saved.id, mediaId: g.mediaId!, sortOrder: i }));
      if (rows.length) await db.campusGallery.createMany({ data: rows });
    }
    await audit(user.id, id ? "update" : "create", key, saved.id, res.titleOf(saved));
    refresh();
    return { ok: true, id: saved.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: "Kaydedilemedi. Alanları kontrol edin (ör. aynı adres zaten kullanılıyor olabilir)." };
  }
}

export async function deleteResource(key: string, id: string): Promise<R> {
  const res = RESOURCES[key];
  const user = await requirePermission(res.perm);
  if (key === "campuses" && !can(user.role, "campus.all")) return { ok: false, error: "Yetkiniz yok." };
  try {
    await model(res.model).delete({ where: { id } });
    await audit(user.id, "delete", key, id);
    refresh();
    return { ok: true };
  } catch { return { ok: false, error: "Silinemedi (başka içerik tarafından kullanılıyor olabilir)." }; }
}

export async function duplicatePage(id: string) {
  const user = await requirePermission("content");
  const p = await db.page.findUnique({ where: { id } });
  if (!p) return { ok: false };
  let slug = `${p.slug}-kopya`, n = 1;
  while (await db.page.findFirst({ where: { group: p.group, slug } })) slug = `${p.slug}-kopya-${++n}`;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { id: _i, createdAt: _c, updatedAt: _u, ...rest } = p;
  const c = await db.page.create({ data: { ...rest, slug, status: "DRAFT", title: { tr: `${(p.title as { tr?: string }).tr} (kopya)`, en: "" } } as Prisma.PageUncheckedCreateInput });
  await audit(user.id, "duplicate", "pages", c.id);
  return { ok: true, id: c.id };
}

export async function restoreRevision(revId: string): Promise<R> {
  const user = await requirePermission("content");
  const r = await db.pageRevision.findUnique({ where: { id: revId } });
  if (!r) return { ok: false, error: "Bulunamadı" };
  const s = r.snapshot as Record<string, unknown>;
  await db.page.update({ where: { id: r.pageId }, data: { title: s.title as Prisma.InputJsonValue, summary: (s.summary ?? undefined) as Prisma.InputJsonValue, blocks: s.blocks as Prisma.InputJsonValue, seo: (s.seo ?? undefined) as Prisma.InputJsonValue } });
  await audit(user.id, "restore", "pages", r.pageId, revId);
  refresh();
  return { ok: true };
}

/* ---- Anasayfa ---- */
export async function saveHomeSection(key: string, value: Record<string, unknown>, intent: string): Promise<R> {
  const user = await requirePermission("content");
  const spec = HOME_SECTIONS[key];
  if (!spec) return { ok: false, error: "Bilinmeyen bölüm" };
  const data = coerceObject(spec.fields, value) as Prisma.InputJsonValue;
  await db.homeSection.update({ where: { key }, data: intent === "publish" ? { data, draft: Prisma.DbNull } : { draft: data } });
  await audit(user.id, intent === "publish" ? "publish" : "draft", "home", key);
  refresh();
  return { ok: true };
}
export async function discardDraft(key: string) {
  await requirePermission("content");
  await db.homeSection.update({ where: { key }, data: { draft: Prisma.DbNull } });
  revalidatePath("/admin/anasayfa");
}
export async function toggleSection(key: string, visible: boolean) { const u = await requirePermission("content"); await db.homeSection.update({ where: { key }, data: { visible } }); await audit(u.id, "visibility", "home", key, String(visible)); refresh(); revalidatePath("/admin/anasayfa"); }
export async function moveSection(key: string, dir: -1 | 1) {
  const u = await requirePermission("content");
  const all = await db.homeSection.findMany({ orderBy: { sortOrder: "asc" } });
  const i = all.findIndex((s) => s.key === key), j = i + dir;
  if (i < 0 || j < 0 || j >= all.length) return;
  [all[i], all[j]] = [all[j], all[i]];
  await db.$transaction(all.map((s, k) => db.homeSection.update({ where: { key: s.key }, data: { sortOrder: k } })));
  await audit(u.id, "reorder", "home", key); refresh(); revalidatePath("/admin/anasayfa");
}

/* ---- Ayarlar ---- */
export async function saveSettings(value: Record<string, unknown>): Promise<R> {
  const user = await requirePermission("settings");
  const data = coerceObject(SETTINGS_FIELDS, value);
  const c = data.colors as Record<string, string>;
  for (const k of Object.keys(c)) if (!/^#[0-9a-f]{6}$/i.test(c[k])) return { ok: false, error: "Renkler #RRGGBB biçiminde olmalıdır." };
  await db.$transaction(Object.entries(data).map(([key, v]) => db.websiteSetting.upsert({ where: { key }, create: { key, value: v as Prisma.InputJsonValue }, update: { value: v as Prisma.InputJsonValue } })));
  await audit(user.id, "update", "settings");
  refresh();
  return { ok: true };
}

/* ---- Menüler ---- */
export async function saveMenuItem(id: string | null, menuId: string, v: { trLabel: string; enLabel: string; url: string; external: boolean; enabled: boolean; parentId: string | null }): Promise<R> {
  const u = await requirePermission("menus");
  const url = safeUrl(v.url);
  if (!url || !cleanText(v.trLabel)) return { ok: false, error: "Etiket ve geçerli bir bağlantı gerekli." };
  const data = { label: { tr: cleanText(v.trLabel), en: cleanText(v.enLabel) }, url, external: v.external, enabled: v.enabled, parentId: v.parentId || null };
  if (id) await db.menuItem.update({ where: { id }, data });
  else { const n = await db.menuItem.count({ where: { menuId, parentId: data.parentId } }); await db.menuItem.create({ data: { ...data, menuId, sortOrder: n } }); }
  await audit(u.id, id ? "update" : "create", "menu", id ?? undefined, url); refresh(); revalidatePath("/admin/menuler");
  return { ok: true };
}
export async function deleteMenuItem(id: string) { const u = await requirePermission("menus"); await db.menuItem.delete({ where: { id } }); await audit(u.id, "delete", "menu", id); refresh(); revalidatePath("/admin/menuler"); }
export async function reorderMenu(ids: string[]) { const u = await requirePermission("menus"); await db.$transaction(ids.map((id, i) => db.menuItem.update({ where: { id }, data: { sortOrder: i } }))); await audit(u.id, "reorder", "menu"); refresh(); revalidatePath("/admin/menuler"); }

/* ---- Kullanıcılar ---- */
export async function saveUser(id: string | null, v: { email: string; name: string; role: string; active: boolean; password?: string; campusIds: string[] }): Promise<R> {
  const actor = await requirePermission("users");
  if (!["SUPER_ADMIN", "CONTENT_EDITOR", "CAMPUS_MANAGER", "ADMISSIONS"].includes(v.role)) return { ok: false, error: "Geçersiz rol" };
  const email = v.email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) return { ok: false, error: "Geçersiz e-posta" };
  if (id === actor.id && (!v.active || v.role !== "SUPER_ADMIN")) return { ok: false, error: "Kendi rolünüzü veya durumunuzu düşüremezsiniz." };
  const campuses = { set: v.campusIds.map((c) => ({ id: c })) };
  try {
    if (id) {
      const data: Prisma.UserUpdateInput = { email, name: cleanText(v.name), role: v.role as never, active: v.active, campuses };
      if (v.password) { const e = validatePasswordStrength(v.password); if (e) return { ok: false, error: e }; data.passwordHash = await hashPassword(v.password); }
      await db.user.update({ where: { id }, data });
      if (!v.active || v.password) await db.session.deleteMany({ where: { userId: id } });
    } else {
      const e = validatePasswordStrength(v.password ?? ""); if (e) return { ok: false, error: e };
      await db.user.create({ data: { email, name: cleanText(v.name), role: v.role as never, active: v.active, passwordHash: await hashPassword(v.password!), campuses: { connect: v.campusIds.map((c) => ({ id: c })) } } });
    }
  } catch { return { ok: false, error: "Kaydedilemedi (e-posta zaten kayıtlı olabilir)." }; }
  await audit(actor.id, id ? "user.update" : "user.create", "user", id ?? undefined, `${email} ${v.role}`);
  revalidatePath("/admin/kullanicilar");
  return { ok: true };
}

/* ---- Leads ---- */
export async function updateLead(id: string, patch: { status?: string; assigneeId?: string | null; note?: string }): Promise<R> {
  const u = await requirePermission("leads.view");
  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) return { ok: false, error: "Bulunamadı" };
  if (patch.status && patch.status !== lead.status) {
    await db.lead.update({ where: { id }, data: { status: patch.status as never } });
    await db.leadEvent.create({ data: { leadId: id, type: "status", detail: `${lead.status} → ${patch.status}`, actorId: u.id } });
  }
  if (patch.assigneeId !== undefined && patch.assigneeId !== lead.assigneeId) {
    await db.lead.update({ where: { id }, data: { assigneeId: patch.assigneeId || null } });
    await db.leadEvent.create({ data: { leadId: id, type: "assigned", detail: patch.assigneeId || "atama kaldırıldı", actorId: u.id } });
  }
  if (patch.note?.trim()) {
    await db.leadNote.create({ data: { leadId: id, authorId: u.id, body: cleanText(patch.note).slice(0, 4000) } });
    await db.leadEvent.create({ data: { leadId: id, type: "note", actorId: u.id } });
  }
  await audit(u.id, "lead.update", "lead", id);
  revalidatePath(`/admin/leads/${id}`);
  return { ok: true };
}
export async function deleteLead(id: string) { const u = await requirePermission("users"); await db.lead.delete({ where: { id } }); await audit(u.id, "lead.delete", "lead", id); revalidatePath("/admin/leads"); }
export async function purgeExpiredLeads() { const u = await requirePermission("users"); const r = await db.lead.deleteMany({ where: { retainUntil: { lt: new Date() } } }); await audit(u.id, "lead.purge", "lead", undefined, String(r.count)); revalidatePath("/admin/leads"); return r.count; }
void requireUser;
