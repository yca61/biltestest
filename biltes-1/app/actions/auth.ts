"use server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession, hashPassword, hashToken, newToken, validatePasswordStrength, verifyPassword, currentUser } from "@/lib/auth";
import { audit, clientIp } from "@/lib/audit";
import { rateLimit } from "@/lib/ratelimit";
import { sendMail, mailConfigured } from "@/lib/mail";

export type AuthState = { error?: string; info?: string };
const GENERIC = "E-posta veya parola hatalı.";

export async function login(_p: AuthState, fd: FormData): Promise<AuthState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const ip = await clientIp();
  if (!(await rateLimit(`login:ip:${ip}`, 20, 900)) || !(await rateLimit(`login:em:${email}`, 8, 900))) return { error: "Çok fazla deneme. 15 dakika sonra tekrar deneyin." };
  const u = await db.user.findUnique({ where: { email } });
  if (!u || !u.active) { await verifyPassword(password, "$2a$12$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidinva"); return { error: GENERIC }; }
  if (u.lockedUntil && u.lockedUntil > new Date()) return { error: "Hesap geçici olarak kilitlendi. Daha sonra tekrar deneyin." };
  if (!(await verifyPassword(password, u.passwordHash))) {
    const fails = u.failedLogins + 1;
    await db.user.update({ where: { id: u.id }, data: { failedLogins: fails, lockedUntil: fails >= 5 ? new Date(Date.now() + 15 * 60e3) : null } });
    await audit(u.id, "login.failed");
    return { error: GENERIC };
  }
  await db.user.update({ where: { id: u.id }, data: { failedLogins: 0, lockedUntil: null, lastLoginAt: new Date() } });
  await createSession(u.id);
  await audit(u.id, "login");
  redirect("/admin");
}

export async function logout() {
  const u = await currentUser();
  await destroySession();
  if (u) await audit(u.id, "logout");
  redirect("/admin/login");
}

export async function requestReset(_p: AuthState, fd: FormData): Promise<AuthState> {
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const ip = await clientIp();
  const info = "Bu e-posta kayıtlıysa sıfırlama bağlantısı gönderildi.";
  if (!(await rateLimit(`reset:${ip}`, 5, 3600))) return { error: "Çok fazla deneme." };
  const u = await db.user.findUnique({ where: { email } });
  if (u?.active) {
    const token = newToken();
    await db.passwordReset.create({ data: { userId: u.id, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 3600e3) } });
    const link = `${process.env.SITE_URL ?? ""}/admin/sifre/${token}`;
    if (mailConfigured()) await sendMail(u.email, "BİLTES Yönetim — parola sıfırlama", `Parolanızı sıfırlamak için (1 saat geçerli): ${link}`);
    else console.warn("[reset] SMTP yok; sıfırlama bağlantısı yalnızca sunucu günlüğünde:", link);
  }
  return { info };
}

export async function resetPassword(token: string, _p: AuthState, fd: FormData): Promise<AuthState> {
  const pw = String(fd.get("password") ?? "");
  const err = validatePasswordStrength(pw);
  if (err) return { error: err };
  const r = await db.passwordReset.findUnique({ where: { tokenHash: hashToken(token) } });
  if (!r || r.usedAt || r.expiresAt < new Date()) return { error: "Bağlantı geçersiz veya süresi dolmuş." };
  await db.$transaction([
    db.user.update({ where: { id: r.userId }, data: { passwordHash: await hashPassword(pw), failedLogins: 0, lockedUntil: null } }),
    db.passwordReset.update({ where: { id: r.id }, data: { usedAt: new Date() } }),
    db.session.deleteMany({ where: { userId: r.userId } }),
  ]);
  await audit(r.userId, "password.reset");
  redirect("/admin/login");
}
