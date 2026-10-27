import { PutObjectCommand, DeleteObjectCommand, S3Client } from "@aws-sdk/client-s3";
import fs from "node:fs/promises";
import path from "node:path";

export const storageMode = () =>
  process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID ? "s3" : process.env.NODE_ENV === "production" ? "none" : "local";

let client: S3Client | null = null;
const s3 = () =>
  (client ??= new S3Client({
    region: process.env.S3_REGION || "auto", endpoint: process.env.S3_ENDPOINT || undefined, forcePathStyle: !!process.env.S3_ENDPOINT,
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID!, secretAccessKey: process.env.S3_SECRET_ACCESS_KEY! },
  }));

export async function putObject(key: string, body: Buffer, contentType: string): Promise<string> {
  const mode = storageMode();
  if (mode === "s3") {
    await s3().send(new PutObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key, Body: body, ContentType: contentType, CacheControl: "public, max-age=31536000, immutable" }));
    return `${(process.env.S3_PUBLIC_URL || "").replace(/\/$/, "")}/${key}`;
  }
  if (mode === "local") {
    const file = path.join(process.cwd(), "public", "uploads", key);
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, body);
    return `/uploads/${key}`;
  }
  throw new Error("Medya depolama yapılandırılmadı (S3_* ortam değişkenlerini tanımlayın).");
}

export async function deleteObject(key: string) {
  const mode = storageMode();
  if (mode === "s3") await s3().send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET!, Key: key }));
  else if (mode === "local") await fs.rm(path.join(process.cwd(), "public", "uploads", key), { force: true });
}
