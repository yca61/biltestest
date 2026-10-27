import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { MenuManager } from "@/components/admin/MenuManager";
export default async function Menus() {
  await requirePermission("menus");
  const menus = await db.menu.findMany({ include: { items: true } });
  return (<div className="max-w-3xl space-y-10"><div><h1 className="text-2xl font-bold">Menü Yönetimi</h1><p className="text-sm text-ink/60">Sürükleyip bırakarak sıralayın. Bağlantılar yerel (örn. <code>/kampusler</code>) veya harici olabilir; dil öneki otomatik eklenir.</p></div>
    {menus.map((m) => <section key={m.id}><h2 className="mb-3 font-semibold">{m.name}</h2><MenuManager menuId={m.id} items={JSON.parse(JSON.stringify(m.items))} /></section>)}</div>);
}
