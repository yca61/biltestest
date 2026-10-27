/** Durum değiştiren API istekleri için Origin doğrulaması (çerez tabanlı oturumda CSRF koruması). */
export function sameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  try { return new URL(origin).host === (req.headers.get("x-forwarded-host") ?? req.headers.get("host")); } catch { return false; }
}
