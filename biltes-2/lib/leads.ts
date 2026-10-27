import type { Prisma } from "@prisma/client";
export type LeadQuery = { q?: string; status?: string; campus?: string; from?: string; to?: string; assignee?: string };
export function leadWhere(sp: LeadQuery): Prisma.LeadWhereInput {
  const w: Prisma.LeadWhereInput = {};
  if (sp.status) w.status = sp.status as never;
  if (sp.campus) w.campusId = sp.campus;
  if (sp.assignee) w.assigneeId = sp.assignee === "none" ? null : sp.assignee;
  if (sp.from || sp.to) w.createdAt = { ...(sp.from ? { gte: new Date(sp.from) } : {}), ...(sp.to ? { lte: new Date(sp.to + "T23:59:59") } : {}) };
  if (sp.q) w.OR = [{ parentName: { contains: sp.q, mode: "insensitive" } }, { email: { contains: sp.q, mode: "insensitive" } }, { phone: { contains: sp.q } }];
  return w;
}
