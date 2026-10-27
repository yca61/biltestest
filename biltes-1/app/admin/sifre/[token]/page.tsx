import { NewPasswordForm } from "@/components/admin/AuthForms";
export const metadata = { title: "Yeni parola" };
export default async function Page({ params }: { params: Promise<{ token: string }> }) { const { token } = await params; return (<div className="grid min-h-screen place-items-center p-5"><div className="w-full max-w-sm bg-white p-8 shadow-xl"><h1 className="mb-6 text-xl font-semibold">Yeni parola belirle</h1><NewPasswordForm token={token} /></div></div>); }
