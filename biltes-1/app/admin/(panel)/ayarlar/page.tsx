import { requirePermission } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { SettingsEditor } from "@/components/admin/SettingsEditor";
import { mailConfigured } from "@/lib/mail";
import { storageMode } from "@/lib/storage";

export default async function Settings() {
  await requirePermission("settings");
  const s = await getSettings();
  const st = storageMode();
  return (
    <div className="max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold">Site Ayarları</h1>
      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <div className={`p-4 text-sm ${mailConfigured() ? "bg-teal/10" : "bg-amber/20"}`}><b>E-posta (SMTP):</b> {mailConfigured() ? "yapılandırıldı" : "YAPILANDIRILMADI — başvuru bildirimleri gönderilmez"}</div>
        <div className={`p-4 text-sm ${st === "s3" ? "bg-teal/10" : "bg-amber/20"}`}><b>Medya depolama:</b> {st === "s3" ? "S3 uyumlu bulut depolama" : st === "local" ? "YEREL (yalnızca geliştirme)" : "YAPILANDIRILMADI — yükleme kapalı"}</div>
      </div>
      <SettingsEditor initial={JSON.parse(JSON.stringify(s))} />
    </div>
  );
}
