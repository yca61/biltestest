import { z } from "zod";

export const leadSchema = z.object({
  parentName: z.string().trim().min(3, "Ad soyad gerekli").max(120),
  phone: z.string().trim().regex(/^[+()\d\s-]{10,20}$/, "Geçerli bir telefon girin"),
  email: z.string().trim().email("Geçerli bir e-posta girin").max(160),
  campusId: z.string().max(40).optional().or(z.literal("")),
  level: z.enum(["anaokulu", "ilkokul", "ortaokul", ""]).optional(),
  studentAge: z.string().trim().max(40).optional(),
  message: z.string().trim().max(2000).optional(),
  source: z.enum(["bilgi-talebi", "ziyaret", "kampus-formu"]).default("bilgi-talebi"),
  privacy: z.literal("on", { errorMap: () => ({ message: "Aydınlatma metnini onaylamalısınız" }) }),
  marketing: z.string().optional(),
  website: z.string().max(0).optional(), // honeypot
  locale: z.enum(["tr", "en"]).default("tr"),
});
