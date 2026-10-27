import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { can } from "@/lib/permissions";
import { RESOURCES } from "@/lib/resources";
import { relOptions, mediaMap } from "@/lib/adminData";
import { ResourceEditor } from "@/components/admin/ResourceEditor";

const dflt: Record<string, Record<string, unknown>> = {
  pages: { group: "kurumsal", status: "DRAFT", blocks: { tr: [], en: [] } }, campuses: { status: "DRAFT", levels: [] }, programs: { level: "anaokulu", status: "DRAFT", body: { tr: [], en: [] } },
  news: { kind: "haber", status: "DRAFT" }, events: { status: "DRAFT" }, hero: { enabled: true, overlay: 45 }, redirects: { permanent: true }, achievements: { status: "DRAFT" }, clubs: { status: "DRAFT" }, testimonials: { status: "DRAFT" },
};

export default async function Edit({ params }: { params: Promise<{ resource: string; id: string }> }) {
  const { resource, id } = await params;
  const res = RESOURCES[resource];
  if (!res) notFound();
  const user = await requirePermission(res.perm);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const m = (db as any)[res.model];
  const isNew = id === "yeni";
  let row: Record<string, any> | null = null; // eslint-disable-line @typescript-eslint/no-explicit-any
  if (!isNew) {
    row = await m.findUnique({ where: { id }, ...(resource === "campuses" ? { include: { gallery: { orderBy: { sortOrder: "asc" } } } } : {}) });
    if (!row) notFound();
    if (resource === "campuses") { if (!(can(user.role, "campus.all") || user.campusIds.includes(id))) notFound(); row.galleryItems = row.gallery.map((g: { mediaId: string }) => ({ mediaId: g.mediaId })); delete row.gallery; }
  } else if (resource === "campuses" && !can(user.role, "campus.all")) notFound();
  const initial = JSON.parse(JSON.stringify(row ?? dflt[resource] ?? {}));
  const [rel, media, revs] = await Promise.all([
    relOptions(), mediaMap(res.fields, initial),
    resource === "pages" && !isNew ? db.pageRevision.findMany({ where: { pageId: id }, orderBy: { createdAt: "desc" }, take: 30 }) : Promise.resolve([]),
  ]);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">{isNew ? `Yeni ${res.singular}` : res.titleOf(row!) || res.singular}</h1>
      <ResourceEditor resource={resource} id={isNew ? null : id} initial={initial} fields={res.fields} media={media} rel={rel}
        canDelete={!res.noDelete && !(resource === "campuses" && !can(user.role, "campus.all"))} publicUrl={row && res.publicUrl ? res.publicUrl(row) : null}
        revisions={revs.map((r) => ({ id: r.id, at: r.createdAt.toLocaleString("tr-TR") }))} />
    </div>
  );
}
