// Yalnızca mevcut siteden DOĞRULANMIŞ bilgiler ve müşteri brifindeki metinler tohumlanır.
// Rakam, ödül, akreditasyon, fiyat, ortaklık UYDURULMAZ; eksik alanlar yönetim panelinden doldurulur.
import { PrismaClient, type Prisma } from "@prisma/client";
const db = new PrismaClient();
const L = (tr: string, en = "") => ({ tr, en });

const PAGES: [string, string, string, string][] = [
  ["kurumsal", "hakkimizda", "Hakkımızda", "About us"], ["kurumsal", "misyon-ve-vizyon", "Misyon ve Vizyon", "Mission & Vision"],
  ["kurumsal", "kurucumuzun-mesaji", "Kurucumuzun Mesajı", "Message from our Founder"], ["kurumsal", "kadromuz", "Kadromuz", "Our Staff"],
  ["kurumsal", "biltes-prensipleri", "BİLTES Prensipleri", "BİLTES Principles"], ["kurumsal", "is-birliklerimiz", "İş Birliklerimiz", "Partnerships"],
  ["kurumsal", "insan-kaynaklari", "İnsan Kaynakları", "Human Resources"], ["kurumsal", "franchise-basvuru", "Franchise Başvuru", "Franchise Enquiry"],
  ["kurumsal", "sikayet-ve-memnuniyet", "Şikayet ve Memnuniyet Formu", "Complaints & Satisfaction"],
  ["egitim", "uluslararasi-egitim-modeli", "Uluslararası Eğitim Modeli", "International Education Model"],
  ["egitim", "yabanci-dil-programi", "Yabancı Dil Programı", "Foreign Language Programme"], ["egitim", "pyp", "Primary Years Programme (PYP)", "Primary Years Programme (PYP)"],
  ["egitim", "bilim-teknoloji-egitim-sanat", "Bilim, Teknoloji, Eğitim ve Sanat", "Science, Technology, Education & Art"],
  ["hayat", "kulupler", "Kulüplerimiz", "Our Clubs"], ["hayat", "atolyeler", "Atölyelerimiz", "Our Workshops"],
  ["hayat", "psikolojik-danismanlik-ve-rehberlik", "Psikolojik Danışmanlık ve Rehberlik", "Counselling & Guidance"],
  ["hayat", "saglik-ve-beslenme", "Sağlık ve Beslenme", "Health & Nutrition"], ["hayat", "basarilarimiz", "Başarılarımız", "Our Achievements"],
  ["hayat", "veli-yorumlarimiz", "Veli Yorumlarımız", "Parent Experiences"],
  ["uluslararasi", "uluslararasi-projeler", "Uluslararası Projeler", "International Projects"], ["uluslararasi", "kulturel-programlar", "Kültürel Programlar", "Cultural Programmes"],
  ["uluslararasi", "erasmus-projeleri", "Erasmus+ Projeleri", "Erasmus+ Projects"], ["uluslararasi", "aiesec-projeleri", "AIESEC Projeleri", "AIESEC Projects"],
  ["uluslararasi", "yurtdisi-liseler", "Yurtdışı Liseler", "Overseas High Schools"], ["uluslararasi", "uluslararasi-kultur-gunleri", "Uluslararası Kültür Günleri", "International Culture Days"],
  ["kayit", "kayit-kabul-sureci", "Kayıt Kabul Süreci", "Admissions Process"], ["kayit", "bilgi-talebi", "Bilgi Talep Formu", "Information Request"],
  ["kayit", "kampus-ziyareti", "Kampüs Ziyareti Talebi", "Campus Visit Request"], ["kayit", "sik-sorulan-sorular", "Sık Sorulan Sorular", "FAQ"],
  ["yasal", "kvkk-aydinlatma-metni", "KVKK Aydınlatma Metni", "Privacy Notice (KVKK)"], ["yasal", "gizlilik-politikasi", "Gizlilik Politikası", "Privacy Policy"],
  ["yasal", "cerez-tercihleri", "Çerez Tercihleri", "Cookie Preferences"],
];

const MENU: { label: [string, string]; url: string; children?: [string, string, string][] }[] = [
  { label: ["Ana Sayfa", "Home"], url: "/" },
  { label: ["Kurumsal", "About"], url: "/kurumsal", children: PAGES.filter((p) => p[0] === "kurumsal" && !["franchise-basvuru", "sikayet-ve-memnuniyet"].includes(p[1])).map((p) => [p[2], p[3], `/kurumsal/${p[1]}`]) },
  { label: ["Kampüslerimiz", "Campuses"], url: "/kampusler" },
  { label: ["Eğitim Programlarımız", "Education"], url: "/egitim", children: [["Anaokulu", "Preschool", "/egitim/anaokulu"], ["İlkokul", "Primary School", "/egitim/ilkokul"], ["Ortaokul", "Middle School", "/egitim/ortaokul"], ...PAGES.filter((p) => p[0] === "egitim").map((p) => [p[2], p[3], `/egitim/${p[1]}`] as [string, string, string])] },
  { label: ["BİLTES'te Yaşam", "Life at BİLTES"], url: "/hayat", children: [...PAGES.filter((p) => p[0] === "hayat" && p[1] !== "veli-yorumlarimiz").map((p) => [p[2], p[3], `/hayat/${p[1]}`] as [string, string, string]), ["Etkinlikler", "Events", "/etkinlikler"], ["Foto Galeri", "Photo Gallery", "/galeri"], ["Veli Yorumlarımız", "Parent Experiences", "/hayat/veli-yorumlarimiz"]] },
  { label: ["Uluslararası", "International"], url: "/uluslararasi", children: PAGES.filter((p) => p[0] === "uluslararasi").map((p) => [p[2], p[3], `/uluslararasi/${p[1]}`]) },
  { label: ["Haberler & Duyurular", "News"], url: "/haberler" },
  { label: ["İletişim", "Contact"], url: "/iletisim" },
];

const HOME: Record<string, Prisma.InputJsonValue> = {
  about: { eyebrow: L("BİLTES KOLEJİ", "BİLTES KOLEJİ"), title: L("Bilim, teknoloji, eğitim ve sanatla çocuklarımızın geleceğini birlikte kuruyoruz.", ""), text: L("BİLTES Koleji, akademik başarıyı mutlulukla buluşturan bütüncül bir eğitim anlayışını benimser. Bilim, Teknoloji, Eğitim ve Sanat; okulumuzun adını ve yaklaşımını oluşturan dört temel değerdir.", ""), ctaLabel: L("BİLTES'i Keşfedin", "Discover BİLTES"), ctaUrl: "/kurumsal/hakkimizda", image1: "", image2: "" },
  pillars: { items: [
    { title: L("BİLİM", "SCIENCE"), text: L("Merak eden, sorgulayan ve araştıran nesiller için bilimsel düşünce kültürü.", ""), image: "" },
    { title: L("TEKNOLOJİ", "TECHNOLOGY"), text: L("Teknolojiyi tüketen değil, üreten ve doğru kullanan bireyler.", ""), image: "" },
    { title: L("EĞİTİM", "EDUCATION"), text: L("Her çocuğun bireysel gelişimini merkeze alan planlı ve hedef odaklı eğitim.", ""), image: "" },
    { title: L("SANAT", "ART"), text: L("Yaratıcılığı, estetik duyarlılığı ve kendini ifade etme becerisini geliştiren sanat etkinlikleri.", ""), image: "" } ] },
  programs: { eyebrow: L("EĞİTİM PROGRAMLARIMIZ", "OUR PROGRAMMES"), title: L("Her yaşın öğrenme yolculuğuna özel bir yaklaşım", "") },
  campuses: { eyebrow: L("KAMPÜSLERİMİZ", "OUR CAMPUSES"), title: L("Çocuğunuza en yakın BİLTES'i keşfedin", ""), text: L("", "") },
  approach: { title: L("Eğitim Yaklaşımımız", "Our Educational Approach"), items: [
    { title: L("Uluslararası Eğitim Yaklaşımı", "International Education Approach"), text: L("", ""), image: "", url: "/egitim/uluslararasi-egitim-modeli" },
    { title: L("PYP / İlk Yıllar Programı", "PYP / Primary Years Programme"), text: L("PYP, 3–12 yaş için küresel bakış açısına sahip, empati kuran ve yaşam boyu öğrenen bireyler yetiştirmeyi hedefleyen uluslararası bir eğitim modelidir.", ""), image: "", url: "/egitim/pyp" },
    { title: L("Yabancı Dil Eğitimi", "Foreign Language Education"), text: L("", ""), image: "", url: "/egitim/yabanci-dil-programi" },
    { title: L("Teknoloji ve Kodlama", "Technology & Coding"), text: L("", ""), image: "", url: "/egitim/bilim-teknoloji-egitim-sanat" },
    { title: L("Sanat ve Yaratıcılık", "Art & Creativity"), text: L("", ""), image: "", url: "/hayat/atolyeler" },
    { title: L("Akademik Gelişim", "Academic Development"), text: L("", ""), image: "", url: "/egitim/ilkokul" } ] },
  life: { title: L("BİLTES'te Hayat, Sınıfların Ötesinde.", "Life at BİLTES, Beyond the Classroom."), items: ["Dans", "Drama", "Bale", "Buz Pateni", "Satranç", "Kodlama", "Spor", "Sanat Atölyeleri"].map((t) => ({ title: L(t, ""), image: "" })) },
  achievements: { eyebrow: L("BAŞARILARIMIZ", "ACHIEVEMENTS"), title: L("Öğrencilerimizin ve okulumuzun başarıları", "") },
  news: { eyebrow: L("HABERLER & DUYURULAR", "NEWS & EVENTS"), title: L("BİLTES'ten Haberler", "News from BİLTES") },
  testimonials: { eyebrow: L("VELİ GÖRÜŞLERİ", "PARENT EXPERIENCES"), title: L("Ailelerimiz BİLTES'i anlatıyor", "") },
  cta: { title: L("Çocuğunuzun Geleceğine Birlikte Yön Verelim.", "Let's Shape Your Child's Future Together."), text: L("BİLTES Koleji eğitim yaklaşımını yakından tanımak ve kayıt süreçlerimiz hakkında bilgi almak için bizimle iletişime geçin.", "Contact us to get to know the BİLTES Koleji approach and learn about our enrolment process."), btn1Label: L("Bilgi Talep Et", "Request Information"), btn1Url: "/kayit/bilgi-talebi", btn2Label: L("Kampüslerimizi Keşfet", "Explore Our Campuses"), btn2Url: "/kampusler", image: "" },
};

async function main() {
  const secret = (k: string, v: Prisma.InputJsonValue) => db.websiteSetting.upsert({ where: { key: k }, create: { key: k, value: v }, update: {} });
  await secret("siteTitle", "BİLTES Koleji");

  // Sayfalar (içerik boş: yönetim panelinden doldurulur)
  let i = 0;
  for (const [group, slug, tr, en] of PAGES) {
    await db.page.upsert({ where: { group_slug: { group, slug } }, update: {}, create: { group, slug, title: L(tr, en), status: "PUBLISHED", sortOrder: i++, blocks: { tr: [], en: [] } } });
  }
  // Eğitim kademeleri
  const progs: [string, string, string, string][] = [
    ["anaokulu", "Anaokulu", "Çocuk gelişimi, merak, keşif ve erken öğrenme.", "anaokulu"], ["ilkokul", "İlkokul", "Akademik temeller, öğrenme özgüveni ve bireysel gelişim.", "ilkokul"],
    ["ortaokul", "Ortaokul", "Akademik başarı, kişisel gelişim ve gelecek eğitime hazırlık.", "ortaokul"],
  ];
  for (const [n, [slug, title, sum, level]] of progs.entries()) {
    await db.educationProgram.upsert({ where: { slug }, update: {}, create: { slug, title: L(title, { anaokulu: "Preschool", ilkokul: "Primary School", ortaokul: "Middle School" }[slug]!), summary: L(sum), level, status: "PUBLISHED", sortOrder: n, body: { tr: [], en: [] } } });
  }
  // Kampüsler (yalnızca mevcut sitede listelenenler; adres vb. eksik — panelden girilecek)
  const campuses: [string, string, string[]][] = [["sadabad", "Sadabad", []], ["sadabad-anaokulu", "Sadabad Anaokulu", ["anaokulu"]], ["gokturk", "Göktürk", []]];
  for (const [n, [slug, name, levels]] of campuses.entries()) {
    const s = slug;
    await db.campus.upsert({ where: { slug: s }, update: {}, create: { slug: s, name, levels, status: "PUBLISHED", sortOrder: n, phone: "(0212) 612 12 12", email: "info@biltes.k12.tr" } });
  }
  await db.newsCategory.upsert({ where: { slug: "okuldan-haberler" }, update: {}, create: { slug: "okuldan-haberler", name: L("Okuldan Haberler", "School News") } });
  await db.newsCategory.upsert({ where: { slug: "duyurular" }, update: {}, create: { slug: "duyurular", name: L("Duyurular", "Announcements") } });

  // Hero
  if (!(await db.heroSlide.count())) {
    await db.heroSlide.create({ data: { title: L("Mutlulukla Başarıya Taşır!", "Carrying Children to Success, Happily!"), subtitle: L("Bilim, teknoloji, eğitim ve sanatla geleceği şekillendiren bir öğrenme yolculuğu.", "A learning journey shaping the future through science, technology, education and art."), ctaLabel: L("BİLTES'i Keşfedin", "Discover BİLTES"), ctaUrl: "/kurumsal/hakkimizda", overlay: 50 } });
  }
  // Anasayfa bölümleri
  let o = 0;
  for (const [key, data] of Object.entries(HOME)) await db.homeSection.upsert({ where: { key }, update: {}, create: { key, data, sortOrder: o++ } });

  // Menüler
  for (const [id, name] of [["header", "Ana menü"], ["utility", "Üst çubuk"], ["footer-legal", "Alt bağlantılar"]]) await db.menu.upsert({ where: { id }, update: {}, create: { id, name } });
  if (!(await db.menuItem.count())) {
    let n = 0;
    for (const m of MENU) {
      const p = await db.menuItem.create({ data: { menuId: "header", label: L(m.label[0], m.label[1]), url: m.url, sortOrder: n++ } });
      let c = 0;
      for (const [tr, en, url] of m.children ?? []) await db.menuItem.create({ data: { menuId: "header", parentId: p.id, label: L(tr, en), url, sortOrder: c++ } });
    }
    const util: [string, string, string, boolean][] = [["Veli Portalı", "Parent Portal", "https://www.biltes.k12.tr/velimiz/", true], ["BİLTES Digital", "BİLTES Digital", "https://biltesdigital.com", true], ["K12", "K12", "https://biltes.k12net.com/Login.aspx", true], ["İnsan Kaynakları", "Human Resources", "/kurumsal/insan-kaynaklari", false], ["Franchise Başvuru", "Franchise", "/kurumsal/franchise-basvuru", false], ["İletişim", "Contact", "/iletisim", false]];
    for (const [k, [tr, en, url, external]] of util.entries()) await db.menuItem.create({ data: { menuId: "utility", label: L(tr, en), url, external, sortOrder: k } });
    const legal: [string, string, string][] = [["KVKK", "KVKK", "/yasal/kvkk-aydinlatma-metni"], ["Gizlilik Politikası", "Privacy Policy", "/yasal/gizlilik-politikasi"], ["Çerez Tercihleri", "Cookie Preferences", "/yasal/cerez-tercihleri"]];
    for (const [k, [tr, en, url]] of legal.entries()) await db.menuItem.create({ data: { menuId: "footer-legal", label: L(tr, en), url, sortOrder: k } });
  }
  // Mevcut sitenin adreslerinden 301
  const redirects: [string, string][] = [
    ["/kurumsal", "/tr/kurumsal/hakkimizda"], ["/kurumsal/misyon-ve-vizyon", "/tr/kurumsal/misyon-ve-vizyon"], ["/kurucumuzun-mesaji", "/tr/kurumsal/kurucumuzun-mesaji"],
    ["/kurumsal/kadromuz", "/tr/kurumsal/kadromuz"], ["/kurumsal/biltes-prensipleri", "/tr/kurumsal/biltes-prensipleri"], ["/kampusler", "/tr/kampusler"],
    ["/bilteste-egitim", "/tr/egitim"], ["/bilteste-hayat", "/tr/hayat"], ["/basarilarimiz", "/tr/hayat/basarilarimiz"], ["/veli-yorumlarimiz", "/tr/hayat/veli-yorumlarimiz"],
    ["/foto-galeri", "/tr/galeri"], ["/biltesuluslararasi", "/tr/uluslararasi"], ["/yurtdisi-liseler", "/tr/uluslararasi/yurtdisi-liseler"], ["/aiesec-projeleri", "/tr/uluslararasi/aiesec-projeleri"],
    ["/uluslararasi-kultur-gunleri", "/tr/uluslararasi/uluslararasi-kultur-gunleri"], ["/erasmus-projeleri", "/tr/uluslararasi/erasmus-projeleri"],
    ["/franchise-basvuru-formu", "/tr/kurumsal/franchise-basvuru"], ["/sikayet-ve-memnuniyet-formu", "/tr/kurumsal/sikayet-ve-memnuniyet"], ["/ik-basvuru-form", "/tr/kurumsal/insan-kaynaklari"],
  ];
  for (const [fromPath, toPath] of redirects) await db.redirect.upsert({ where: { fromPath }, update: {}, create: { fromPath, toPath } });
  console.log("Tohumlama tamamlandı.");
}
main().finally(() => db.$disconnect());
