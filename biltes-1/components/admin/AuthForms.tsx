"use client";
import { useActionState } from "react";
import Link from "next/link";
import { login, requestReset, resetPassword, type AuthState } from "@/app/actions/auth";

const Msg = ({ s }: { s: AuthState }) => (s.error ? <p role="alert" className="text-sm text-red-700">{s.error}</p> : s.info ? <p role="status" className="text-sm text-teal">{s.info}</p> : null);
export function LoginForm() {
  const [s, a, p] = useActionState(login, {} as AuthState);
  return (<form action={a} className="space-y-4">
    <div><label htmlFor="email" className="mb-1 block text-sm font-medium">E-posta</label><input id="email" name="email" type="email" required autoComplete="username" className="field" /></div>
    <div><label htmlFor="password" className="mb-1 block text-sm font-medium">Parola</label><input id="password" name="password" type="password" required autoComplete="current-password" className="field" /></div>
    <Msg s={s} /><button disabled={p} className="btn-dark w-full">{p ? "…" : "Giriş yap"}</button>
    <Link href="/admin/sifre-sifirla" className="block text-center text-sm text-teal underline">Parolamı unuttum</Link></form>);
}
export function ResetRequestForm() {
  const [s, a, p] = useActionState(requestReset, {} as AuthState);
  return (<form action={a} className="space-y-4"><div><label htmlFor="email" className="mb-1 block text-sm font-medium">E-posta</label><input id="email" name="email" type="email" required className="field" /></div><Msg s={s} /><button disabled={p} className="btn-dark w-full">Bağlantı gönder</button></form>);
}
export function NewPasswordForm({ token }: { token: string }) {
  const [s, a, p] = useActionState(resetPassword.bind(null, token), {} as AuthState);
  return (<form action={a} className="space-y-4"><div><label htmlFor="password" className="mb-1 block text-sm font-medium">Yeni parola (en az 12 karakter, harf ve rakam)</label><input id="password" name="password" type="password" minLength={12} required autoComplete="new-password" className="field" /></div><Msg s={s} /><button disabled={p} className="btn-dark w-full">Parolayı kaydet</button></form>);
}
