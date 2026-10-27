import { db } from "@/lib/db";
import { requirePermission } from "@/lib/auth";
import { UserManager } from "@/components/admin/UserManager";
export default async function Users() {
  await requirePermission("users");
  const [users, campuses] = await Promise.all([db.user.findMany({ orderBy: { createdAt: "asc" }, include: { campuses: { select: { id: true } } } }), db.campus.findMany({ select: { id: true, name: true } })]);
  return (<div><h1 className="mb-1 text-2xl font-bold">Kullanıcılar ve Roller</h1><p className="mb-6 text-sm text-ink/60">Pasif yapılan veya parolası değiştirilen kullanıcıların açık oturumları sonlandırılır. Ek 2 adımlı doğrulama (2FA) bu sürümde uygulanmamıştır; bkz. üretim kontrol listesi.</p>
    <UserManager campuses={campuses} users={users.map((u) => ({ id: u.id, email: u.email, name: u.name, role: u.role, active: u.active, lastLoginAt: u.lastLoginAt?.toISOString() ?? null, campusIds: u.campuses.map((c) => c.id) }))} /></div>);
}
