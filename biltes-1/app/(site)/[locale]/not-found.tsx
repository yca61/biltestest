import Link from "next/link";
export default function NotFound() {
  return (
    <div className="wrap grid min-h-[70vh] place-items-center pt-40 text-center">
      <div><p className="eyebrow">404</p><h1 className="mt-3 text-5xl font-extrabold">Sayfa bulunamadı</h1><p className="mt-4 text-ink/70">Aradığınız sayfa taşınmış veya kaldırılmış olabilir.</p><Link href="/tr" className="btn-primary mt-8">Ana Sayfa</Link></div>
    </div>
  );
}
