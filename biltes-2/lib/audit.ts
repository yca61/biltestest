import { db } from "./db";
import { headers } from "next/headers";

export async function clientIp() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "unknown").trim();
}
export async function audit(userId: string | null, action: string, entity?: string, entityId?: string, detail?: string) {
  try {
    await db.auditLog.create({ data: { userId, action, entity, entityId, detail: detail?.slice(0, 500), ip: await clientIp() } });
  } catch (e) {
    console.error("audit failed", e);
  }
}
