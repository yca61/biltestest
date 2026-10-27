import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { LoginForm } from "@/components/admin/AuthForms";
export const metadata = { title: "Giriş" };
export default async function Login() {
  if (await currentUser()) redirect("/admin");
  return (<div className="grid min-h-screen place-items-center p-5"><div className="w-full max-w-sm bg-white p-8 shadow-xl"><p className="font-display text-2xl font-extrabold text-navy">BİLTES<span className="ml-2 text-[10px] tracking-[.3em] text-teal">YÖNETİM</span></p><h1 className="mb-6 mt-6 text-xl font-semibold">Giriş</h1><LoginForm /></div></div>);
}
