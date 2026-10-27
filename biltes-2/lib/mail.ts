import nodemailer from "nodemailer";

export const mailConfigured = () => !!(process.env.SMTP_HOST && process.env.MAIL_FROM);

export async function sendMail(to: string | string[], subject: string, text: string) {
  if (!mailConfigured()) {
    console.warn("[mail] SMTP yapılandırılmadı; e-posta gönderilmedi:", subject);
    return { sent: false as const, reason: "SMTP yapılandırılmadı" };
  }
  const t = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT ?? 587), secure: Number(process.env.SMTP_PORT) === 465,
    auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
  });
  await t.sendMail({ from: process.env.MAIL_FROM, to, subject, text });
  return { sent: true as const };
}
