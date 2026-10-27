import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { db } from "./db";
import { can, type Permission } from "./permissions";

export const COOKIE = "biltes_session";
const SESSION_DAYS = 7;
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

export { validatePasswordStrength } from "./password";

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const h = await headers();
  await db.session.create({
    data: {
      tokenHash: sha(token), userId, userAgent: h.get("user-agent")?.slice(0, 200),
      ip: h.get("x-forwarded-for")?.split(",")[0]?.trim(), expiresAt: new Date(Date.now() + SESSION_DAYS * 864e5),
    },
  });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_DAYS * 86400,
  });
}

export async function destroySession() {
  const c = await cookies();
  const t = c.get(COOKIE)?.value;
  if (t) await db.session.deleteMany({ where: { tokenHash: sha(t) } });
  c.delete(COOKIE);
}

export type SessionUser = { id: string; email: string; name: string; role: Role; campusIds: string[] };

export async function currentUser(): Promise<SessionUser | null> {
  const t = (await cookies()).get(COOKIE)?.value;
  if (!t) return null;
  const s = await db.session.findUnique({
    where: { tokenHash: sha(t) },
    include: { user: { include: { campuses: { select: { id: true } } } } },
  });
  if (!s || s.expiresAt < new Date() || !s.user.active) return null;
  const u = s.user;
  return { id: u.id, email: u.email, name: u.name, role: u.role, campusIds: u.campuses.map((c) => c.id) };
}

export async function requireUser(): Promise<SessionUser> {
  const u = await currentUser();
  if (!u) redirect("/admin/login");
  return u;
}
/** Sunucu tarafı yetki kontrolü: yetki yoksa hata fırlatır (UI gizleme tek başına yeterli değildir). */
export async function requirePermission(p: Permission): Promise<SessionUser> {
  const u = await requireUser();
  if (!can(u.role, p)) throw new Error("Bu işlem için yetkiniz yok.");
  return u;
}
export const hashToken = sha;
export const newToken = () => randomBytes(32).toString("base64url");
