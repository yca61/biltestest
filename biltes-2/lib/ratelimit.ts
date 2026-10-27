import { db } from "./db";

/** Veritabanı tabanlı sabit pencere sınırlayıcı (çoklu örnekte de çalışır). true = izin verildi. */
export async function rateLimit(key: string, max: number, windowSec: number): Promise<boolean> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + windowSec * 1000);
  const row = await db.rateLimit.upsert({
    where: { key },
    create: { key, count: 1, resetAt },
    update: {},
  });
  if (row.resetAt < now) {
    await db.rateLimit.update({ where: { key }, data: { count: 1, resetAt } });
    return true;
  }
  const upd = await db.rateLimit.update({ where: { key }, data: { count: { increment: 1 } } });
  return upd.count <= max;
}
