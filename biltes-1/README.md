# BİLTES Koleji — Kurumsal Web Sitesi + Yönetim Paneli (CMS)

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind · PostgreSQL + Prisma · motion · TipTap · S3 uyumlu medya depolama.

Bu bir statik site değildir: halka açık site ve `/admin` paneli aynı uygulamadır ve PostgreSQL'e bağlıdır.
Panelde yapılan her değişiklik kod değiştirmeden/yeniden yayına almadan siteye yansır.

## Hızlı başlangıç (yerel geliştirme)

Gereksinimler: Node.js 22+, npm. (Docker veya kurulu PostgreSQL **gerekmez**; gömülü geliştirme veritabanı vardır.)

```bash
npm install
cp .env.example .env            # DATABASE_URL ve AUTH_SECRET'i doldurun (aşağıya bakın)
npm run db:dev                  # 1. terminal: gömülü PostgreSQL (port 54329)
npm run db:push                 # 2. terminal: şemayı uygula
npm run db:seed                 # doğrulanmış başlangıç içeriği
ADMIN_EMAIL=siz@kurum.com ADMIN_PASSWORD='en-az-12-karakter-harf-rakam1' npm run admin:create
npm run dev                     # http://localhost:3000  →  /admin
```

Gömülü veritabanı için `.env`:
`DATABASE_URL="postgresql://biltes:biltes_dev_only@localhost:54329/biltes?schema=public"` — yalnızca geliştirme içindir.

İlk yönetici parolası kodda **yoktur**; `admin:create` komutu ortam değişkeninden veya etkileşimli sorudan alır.

## Komutlar
| Komut | Amaç |
|---|---|
| `npm run build && npm start` | Üretim derlemesi |
| `npm run typecheck` | TypeScript denetimi |
| `npm run test:e2e` | Çalışan sunucuya karşı HTTP uçtan uca testleri (`BASE=...`) |
| `npm run db:migrate` | Geliştirmede migration üret (`prisma migrate dev`) |
| `npm run db:deploy` | Üretimde migration uygula |

> Bu depoda şema `prisma db push` ile doğrulanmıştır. Üretimden önce bir kez `npm run db:migrate -- --name init` çalıştırıp `prisma/migrations` klasörünü commit edin, ardından üretimde `db:deploy` kullanın.

## Mimari özeti
- `app/(site)/[locale]/…` halka açık site (`/tr`, `/en`); `app/admin/…` yönetim paneli; `app/api/…` medya ve CSV.
- Çok dilli içerik: alanlar `{"tr": "...", "en": "..."}` JSON'u olarak saklanır; İngilizce boşsa Türkçe'ye düşer ve sayfada uyarı gösterilir. Rotalar iki dilde aynıdır (`/en/kampusler`); `hreflang` ve canonical otomatik üretilir.
- Panel, **şema odaklı** bir form altyapısı kullanır (`lib/forms.ts`, `lib/resources.ts`): yeni alan eklemek tek satırdır; değerler sunucuda `lib/coerce.ts` ile doğrulanır/temizlenir (HTML için `sanitize-html`).
- Yetkilendirme: `lib/permissions.ts` rol→izin eşlemesi; **her sunucu eylemi ve sayfa `requirePermission` ile sunucuda denetler**. Kampüs Yöneticisi yalnızca atandığı kampüsleri düzenler.
- Oturum: rastgele jeton (çerezde), veritabanında SHA-256 özeti; HttpOnly + SameSite=Lax + (üretimde) Secure; 7 gün. Parola: bcrypt(12). 5 hatalı girişte 15 dk kilit, IP ve e-posta bazlı hız sınırı.
- CSRF: sunucu eylemlerinde Next.js Origin denetimi; API rotalarında `Origin` doğrulaması (`lib/csrf.ts`).
- Medya: yükleme içerik imzasıyla doğrulanır (sharp/PDF başlığı), 12 MB sınır, 2400 px'e küçültme, EXIF temizleme, WebP + JPEG/PNG sürümü; S3 uyumlu depoya yazılır. Başka yerde kullanılan dosya silinemez.
- Başvurular (CRM): sunucuda doğrulanır (zod), honeypot + hız sınırı, ayrı pazarlama izni, saklama süresi (`retainUntil`, varsayılan 2 yıl — hukuk onayına tabidir), durum/atama/not/geçmiş, rol bazlı CSV dışa aktarma (formül enjeksiyonuna karşı korumalı), tüm erişimler denetim kaydına yazılır.

## Ortam değişkenleri
`.env.example` dosyasına bakın. Yapılandırılmayan servisler **açıkça** "yapılandırılmadı" olarak görünür (Ayarlar sayfasında):
- SMTP yoksa: başvuru bildirimi ve parola sıfırlama e-postası gönderilmez (sıfırlama bağlantısı yalnızca sunucu günlüğüne yazılır).
- S3 yoksa: üretimde yükleme kapalıdır; geliştirmede `public/uploads` kullanılır (üretimde asla).

## Dağıtım (özet — ayrıntı için `docs/DAGITIM.md`)
Next.js'in sunucu tarafı çalıştığı bir ortam gerekir (Vercel, Netlify Next.js runtime, Railway, Render, Fly.io, VPS/Docker). Statik dosya yüklemek yetmez.
1. Yönetilen PostgreSQL (Neon, Supabase, RDS…) oluşturun → `DATABASE_URL`.
2. S3 uyumlu bucket (R2, S3, Supabase Storage) + genel okuma URL'i → `S3_*`.
3. SMTP sağlayıcısı → `SMTP_*`, `MAIL_FROM`, `LEAD_NOTIFY_TO`.
4. `AUTH_SECRET` (`openssl rand -base64 48`), `SITE_URL=https://www.biltes.k12.tr`.
5. Derleme: `npm ci && npm run build`; migration: `npm run db:deploy`; ilk kez: `db:seed` ve `admin:create`.
6. Alan adını yönlendirmeden önce eski site URL'leri için Yönlendirmeler (301) listesini gözden geçirin (başlangıç listesi seed ile gelir).
