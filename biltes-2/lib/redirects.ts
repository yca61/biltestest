import { notFound, permanentRedirect, redirect } from "next/navigation";
import { db } from "./db";

/** Bilinmeyen adresler için: önce Redirect tablosuna (eski site URL'leri) bak, yoksa 404. */
export async function notFoundOr301(path: string): Promise<never> {
  const clean = "/" + path.split("/").filter(Boolean).join("/");
  const stripped = clean.replace(/^\/(tr|en)(?=\/|$)/, "") || "/";
  const r = await db.redirect.findFirst({ where: { fromPath: { in: [clean, stripped, stripped + "/"] } } });
  if (r) {
    await db.redirect.update({ where: { id: r.id }, data: { hits: { increment: 1 } } }).catch(() => {});
    const to = r.toPath.startsWith("/") && !/^\/(tr|en)(\/|$)/.test(r.toPath) && !r.toPath.startsWith("//") ? "/tr" + r.toPath : r.toPath;
    return r.permanent ? permanentRedirect(to) : redirect(to);
  }
  return notFound();
}
