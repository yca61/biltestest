import { ResetRequestForm } from "@/components/admin/AuthForms";
export const metadata = { title: "Parola sıfırlama" };
export default function Page() { return (<div className="grid min-h-screen place-items-center p-5"><div className="w-full max-w-sm bg-white p-8 shadow-xl"><h1 className="mb-6 text-xl font-semibold">Parola sıfırlama</h1><ResetRequestForm /></div></div>); }
