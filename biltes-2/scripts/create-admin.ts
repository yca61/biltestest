// İlk Süper Yönetici oluşturma. Parola kodda tutulmaz:
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run admin:create
// ya da değişkenler yoksa etkileşimli sorar.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";
import { validatePasswordStrength } from "../lib/password";

async function ask(q: string) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const a = await rl.question(q);
  rl.close();
  return a.trim();
}
async function main() {
  const email = (process.env.ADMIN_EMAIL || (await ask("Yönetici e-posta: "))).toLowerCase();
  const password = process.env.ADMIN_PASSWORD || (await ask("Parola (en az 12 karakter, harf+rakam): "));
  const name = process.env.ADMIN_NAME || "Süper Yönetici";
  const err = validatePasswordStrength(password);
  if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error("Geçersiz e-posta.");
  if (err) throw new Error(err);
  const db = new PrismaClient();
  const passwordHash = await bcrypt.hash(password, 12);
  await db.user.upsert({ where: { email }, create: { email, name, passwordHash, role: "SUPER_ADMIN" }, update: { passwordHash, role: "SUPER_ADMIN", active: true, failedLogins: 0, lockedUntil: null } });
  console.log(`Süper Yönetici hazır: ${email}`);
  await db.$disconnect();
}
main().catch((e) => { console.error(e.message); process.exit(1); });
