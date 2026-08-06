import { put } from "@vercel/blob";

const MAX_SIZE = 4 * 1024 * 1024;

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
  const { url } = await put(`${subdir}/${id}.${ext}`, file, {
    access: "public",
    allowOverwrite: true,
  });

  return url;
}
