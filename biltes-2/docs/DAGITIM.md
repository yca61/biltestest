# Dağıtım Kılavuzu

## 1. Servisler
| Servis | Öneri | Değişken |
|---|---|---|
| PostgreSQL | Neon / Supabase / AWS RDS (otomatik yedek açık) | `DATABASE_URL` |
| Medya | Cloudflare R2 / AWS S3 / Supabase Storage (S3 API) | `S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, S3_PUBLIC_URL` |
| E-posta | Postmark / SES / SMTP | `SMTP_*`, `MAIL_FROM`, `LEAD_NOTIFY_TO` |
| Barındırma | Next.js sunucu çalıştırabilen platform | `AUTH_SECRET`, `SITE_URL` |

Bucket'ta genel **okuma** açık, **yazma** yalnızca uygulama anahtarına ait olmalıdır. Dağıtım dosya sistemine kalıcı veri yazılmaz.

## 2. Adımlar
```bash
npm ci
npx prisma migrate deploy       # ilk kez: geliştirmede `npm run db:migrate -- --name init` ile migration üretip commit edin
npm run db:seed                 # yalnızca ilk kurulum (idempotent, mevcut içeriği ezmez)
ADMIN_EMAIL=… ADMIN_PASSWORD=… npm run admin:create   # parolayı bir kez girin, kabuk geçmişinden silin
npm run build && npm start
```
Netlify: resmi Next.js runtime eklentisiyle, ortam değişkenleri Site Settings'te tanımlıdır; `netlify.toml` gerekmez. Derleme komutu `npm run build`.

## 3. Alan adı geçişi
1. `SITE_URL` değerini canlı alan adına ayarlayın (canonical, sitemap, OG buna bağlıdır).
2. Panel → Yönlendirmeler: eski sitedeki her adres için 301 tanımlı olmalı (başlangıç listesi seed'dedir; eski sitenin tüm URL'lerini tarayıp eksikleri ekleyin).
3. Google Search Console'a `https://alanadi/sitemap.xml` gönderin; `robots.txt` hazırdır.
4. TLS/HTTPS platform tarafından sağlanır; HSTS başlığı uygulamada tanımlıdır.

## 4. Yedekleme ve kurtarma
- Yönetilen PostgreSQL'in günlük otomatik yedeği + noktaya dönüş (PITR) açık olsun; geri yükleme provası yılda en az bir kez yapılsın.
- Medya bucket'ında sürümleme (versioning) açın.
- Kurtarma: yeni DB'ye yedek geri yükle → `DATABASE_URL` güncelle → `prisma migrate deploy`.
