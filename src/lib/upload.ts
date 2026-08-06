import { writeFile, mkdir } from "fs/promises";
import path from "path";

const MAX_SIZE = 4 * 1024 * 1024;

// Local-disk storage — fine for this prototype, but files won't survive a
// serverless/ephemeral deploy. Swap for real blob storage (S3, Vercel Blob,
// etc.) before going to production.
export async function saveUploadedFile(
  file: File | null,
  subdir: string,
  id: string
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  if (!file.type.startsWith("image/")) {
    throw new Error("El archivo debe ser una imagen");
  }
  if (file.size > MAX_SIZE) {
    throw new Error("La imagen no puede superar los 4MB");
  }

  const ext = file.type.split("/")[1]?.split("+")[0] ?? "jpg";
  const dir = path.join(process.cwd(), "public", "uploads", subdir);
  await mkdir(dir, { recursive: true });

  const filename = `${id}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return `/uploads/${subdir}/${filename}`;
}
