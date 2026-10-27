import { db } from "./db";

/** Yayında olan ve yayın zamanı gelmiş kayıtlar. */
export const live = () => ({ status: "PUBLISHED" as const, OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }] });
export const liveSimple = { status: "PUBLISHED" as const };

export const getMenu = async (id: string) => {
  const items = await db.menuItem.findMany({ where: { menuId: id, enabled: true }, orderBy: { sortOrder: "asc" } });
  return items.filter((i) => !i.parentId).map((i) => ({ ...i, children: items.filter((c) => c.parentId === i.id) }));
};
export type MenuNode = Awaited<ReturnType<typeof getMenu>>[number];

export const getHomeSections = async () => {
  const rows = await db.homeSection.findMany({ orderBy: { sortOrder: "asc" } });
  return rows;
};
export const getHeroSlides = () =>
  db.heroSlide.findMany({
    where: { enabled: true, AND: [{ OR: [{ publishAt: null }, { publishAt: { lte: new Date() } }] }, { OR: [{ unpublishAt: null }, { unpublishAt: { gt: new Date() } }] }] },
    orderBy: { sortOrder: "asc" }, include: { desktop: true, mobile: true },
  });
export const getCampuses = () => db.campus.findMany({ where: liveSimple, orderBy: { sortOrder: "asc" }, include: { mainImage: true } });
