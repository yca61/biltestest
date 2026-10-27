import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { HOME_SECTIONS } from "@/lib/forms";
import { SectionEditor } from "@/components/admin/SectionEditor";

export default async function Section({ params }: { params: Promise<{ key: string }> }) {
  await requirePermission("content");
  const { key } = await params;
  const spec = HOME_SECTIONS[key];
  const row = await db.homeSection.findUnique({ where: { key } });
  if (!spec || !row) notFound();
  return (<div><h1 className="mb-6 text-2xl font-bold">{spec.label}</h1><SectionEditor k={key} fields={spec.fields} media={{}} hasDraft={row.draft != null} initial={(row.draft ?? row.data) as Record<string, unknown>} /></div>);
}
