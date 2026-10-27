import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "../globals.css";

const display = Plus_Jakarta_Sans({ subsets: ["latin", "latin-ext"], variable: "--font-display" });
const body = Inter({ subsets: ["latin", "latin-ext"], variable: "--font-body" });
export const metadata: Metadata = { title: { default: "Yönetim Paneli", template: "%s | BİLTES Yönetim" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <html lang="tr" className={`${display.variable} ${body.variable}`}><body className="bg-[#F3F6F9]">{children}</body></html>;
}
