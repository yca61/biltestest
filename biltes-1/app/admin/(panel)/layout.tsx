import Link from "next/link";
import { LayoutDashboard, FileText, Building2, GraduationCap, Newspaper, CalendarDays, Trophy, Users2, Quote, Image as Img, Inbox, Menu as MenuIcon, Settings, Shield, ScrollText, Home, Layers, ArrowRightLeft, LogOut, ExternalLink } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { can, ROLE_LABEL, type Permission } from "@/lib/permissions";
import { logout } from "@/app/actions/auth";

const NAV: { href: string; label: string; icon: typeof Home; perm: Permission; group?: string }[] = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard, perm: "campus.own" },
  { href: "/admin/anasayfa", label: "Anasayfa Oluşturucu", icon: Home, perm: "content", group: "İçerik" },
  { href: "/admin/r/hero", label: "Hero Slaytları", icon: Layers, perm: "content" },
  { href: "/admin/r/pages", label: "Sayfalar", icon: FileText, perm: "content" },
  { href: "/admin/r/campuses", label: "Kampüsler", icon: Building2, perm: "campus.own" },
  { href: "/admin/r/programs", label: "Eğitim Programları", icon: GraduationCap, perm: "content" },
  { href: "/admin/r/news", label: "Haber & Duyurular", icon: Newspaper, perm: "content" },
  { href: "/admin/r/categories", label: "Haber Kategorileri", icon: Newspaper, perm: "content" },
  { href: "/admin/r/events", label: "Etkinlikler", icon: CalendarDays, perm: "content" },
  { href: "/admin/r/achievements", label: "Başarılar", icon: Trophy, perm: "content" },
  { href: "/admin/r/clubs", label: "Kulüp & Atölyeler", icon: Users2, perm: "content" },
  { href: "/admin/r/testimonials", label: "Veli Görüşleri", icon: Quote, perm: "content" },
  { href: "/admin/medya", label: "Medya Kitaplığı", icon: Img, perm: "media", group: "Kaynaklar" },
  { href: "/admin/menuler", label: "Menüler", icon: MenuIcon, perm: "menus" },
  { href: "/admin/r/redirects", label: "Yönlendirmeler", icon: ArrowRightLeft, perm: "redirects" },
  { href: "/admin/leads", label: "Başvurular (CRM)", icon: Inbox, perm: "leads.view", group: "Kayıt" },
  { href: "/admin/ayarlar", label: "Site Ayarları", icon: Settings, perm: "settings", group: "Sistem" },
  { href: "/admin/kullanicilar", label: "Kullanıcılar", icon: Shield, perm: "users" },
  { href: "/admin/denetim", label: "Denetim Kayıtları", icon: ScrollText, perm: "audit" },
];

export default async function Panel({ children }: { children: React.ReactNode }) {
  const u = await requireUser();
  const items = NAV.filter((n) => can(u.role, n.perm));
  return (
    <div className="min-h-screen lg:flex">
      <aside className="bg-navy text-white lg:sticky lg:top-0 lg:h-screen lg:w-64 lg:shrink-0 lg:overflow-y-auto">
        <div className="flex items-center justify-between p-5 lg:block"><Link href="/admin" className="font-display text-xl font-extrabold">BİLTES<span className="ml-2 text-[10px] tracking-[.3em] text-teal">YÖNETİM</span></Link></div>
        <nav aria-label="Yönetim menüsü" className="flex gap-1 overflow-x-auto px-3 pb-3 lg:block lg:space-y-0.5 lg:pb-8">
          {items.map((n) => (
            <div key={n.href} className="shrink-0">
              {n.group && <p className="mb-1 mt-5 hidden px-3 text-[10px] font-semibold uppercase tracking-widest text-white/40 lg:block">{n.group}</p>}
              <Link href={n.href} className="flex items-center gap-3 whitespace-nowrap rounded-md px-3 py-2 text-sm text-white/80 transition hover:bg-white/10 hover:text-white"><n.icon size={16} />{n.label}</Link>
            </div>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 flex-1">
        <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-navy/10 bg-white px-5">
          <a href="/tr" target="_blank" className="flex items-center gap-2 text-sm text-teal"><ExternalLink size={14} />Siteyi görüntüle</a>
          <div className="flex items-center gap-4 text-sm"><span className="hidden sm:block"><b>{u.name}</b> <span className="text-ink/50">· {ROLE_LABEL[u.role]}</span></span>
            <form action={logout}><button className="flex items-center gap-1 text-ink/70 hover:text-navy"><LogOut size={15} />Çıkış</button></form></div>
        </div>
        <main className="p-5 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
