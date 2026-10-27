import { requirePermission } from "@/lib/auth";
import { MediaLibrary } from "@/components/admin/MediaLibrary";
import { storageMode } from "@/lib/storage";
export default async function Media() {
  await requirePermission("media");
  const m = storageMode();
  return (<div><h1 className="mb-4 text-2xl font-bold">Medya Kitaplığı</h1>
    {m !== "s3" && <p className="mb-4 bg-amber/20 p-4 text-sm">{m === "local" ? "Geliştirme modu: dosyalar yerel diske yazılıyor. Üretimde S3 uyumlu depolama (S3_* değişkenleri) zorunludur." : "Medya depolama yapılandırılmadı; yükleme devre dışı. .env.example içindeki S3_* değişkenlerini tanımlayın."}</p>}
    <MediaLibrary /></div>);
}
