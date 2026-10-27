# Üretim Hazırlık Kontrol Listesi

## Yapıldı (bu sürümde)
- [x] Sunucu tarafı yetki denetimi, rol→izin matrisi, kampüs kapsamı
- [x] bcrypt(12), oturum özeti DB'de, kilitleme, hız sınırı, denetim kaydı
- [x] İçerik imzasıyla dosya doğrulama, boyut sınırı, EXIF temizleme, kullanımdaki dosya silme koruması
- [x] HTML temizleme (sanitize-html), URL şeması beyaz listesi, CSV enjeksiyonu koruması
- [x] Güvenlik başlıkları (HSTS, nosniff, frame, referrer, permissions)
- [x] KVKK: ayrı pazarlama izni, minimum veri, saklama süresi alanı, silme/temizleme akışı, erişim denetim kaydı
- [x] Analitik yalnızca çerez onayından sonra yüklenir
- [x] sitemap.xml, robots.txt, canonical, hreflang, OG/Twitter, JSON-LD, breadcrumb, 301 tablosu

## Yayın öncesi YAPILMASI GEREKENLER
- [ ] **Hukuk incelemesi:** KVKK aydınlatma metni, gizlilik politikası, çerez metni (şu an boş sayfalar) ve saklama süresi (2 yıl varsayımı)
- [ ] Gerçek logo (ve logodan kesin marka renkleri) → Ayarlar. Renkler şu an **önerilen** değerlerdir
- [ ] Gerçek fotoğraflar; kampüs adresleri, kademeleri, harita bağlantıları (mevcut sitede adres yoktu, boş bırakıldı)
- [ ] Mevcut sitedeki sayfa içeriklerinin taşınması (iç sayfalar boş başlatıldı; mevcut site metinleri tek tek doğrulanıp girilmeli). "Göktürk beşinci kampüs" ifadesi eski sitede 3 kampüsle çelişiyor → doğrulayın
- [ ] SMTP + `LEAD_NOTIFY_TO` + test başvurusu ile e-posta bildirimi doğrulaması
- [ ] S3 bucket + CDN; yükleme testi
- [ ] `prisma migrate` geçmişi üretip commit etme (`db push` yalnızca geliştirmede)
- [ ] Yedek geri yükleme provası
- [ ] İngilizce içeriklerin insan çevirisi ve yayını
- [ ] Erişilebilirlik (axe/NVDA), Lighthouse ve gerçek cihaz testleri; hero görsellerinin boyut/LCP ayarı
- [ ] Üretimde parola sıfırlama için SMTP zorunlu

## Bilinen kapsam dışı / sınırlamalar (dürüst durum)
- **2 adımlı doğrulama (TOTP)** uygulanmadı (talep "isteğe bağlı" idi).
- **AVIF** üretilmiyor; WebP + JPEG/PNG üretiliyor.
- Menü/sıralama sürükle-bırak yalnızca Menüler'de; anasayfa bölümleri ok düğmeleriyle sıralanır.
- Anasayfa "önizleme" taslağı, giriş yapmış kullanıcıya `/tr?preview=1` ile gösterilir; sayfa/haber için ayrı taslak önizleme sayfa yayın durumuna bağlıdır (Taslak durumdaki sayfa herkese kapalıdır).
- Çeviri modeli JSON alanlarıdır; ayrı bir `Translation`/`Permission`/`Role`/`FormDefinition` tablosu yoktur (rol/izin kodda, formlar kodda tanımlıdır).
- Sürekli entegrasyon, otomatik tarayıcı testleri (Playwright) ve yük testi eklenmedi; yalnızca HTTP uçtan uca betiği vardır.
