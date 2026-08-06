import Image from "next/image";
import { Trash2 } from "lucide-react";
import { requireOwner } from "@/lib/authz";
import { db } from "@/lib/db";
import { createGalleryPhoto, deleteGalleryPhoto } from "./actions";

export default async function GaleriaPage() {
  await requireOwner();

  const photos = await db.galleryPhoto.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Galería</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Estas fotos se muestran en la galería de tu sitio público.
        </p>
      </div>

      <form
        action={createGalleryPhoto}
        className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-6 sm:flex-row sm:items-end"
      >
        <div className="flex-1">
          <label htmlFor="photo" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Foto
          </label>
          <input
            id="photo"
            name="photo"
            type="file"
            accept="image/*"
            required
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-3 file:py-1.5 file:text-xs file:font-semibold focus:border-primary"
          />
        </div>
        <div className="flex-1">
          <label htmlFor="caption" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Descripción (opcional)
          </label>
          <input
            id="caption"
            name="caption"
            placeholder="Ej: Sala de musculación"
            className="w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-sm outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
        >
          Subir foto
        </button>
      </form>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((p) => (
          <div
            key={p.id}
            className="group relative overflow-hidden rounded-2xl border border-border bg-surface"
          >
            <Image
              src={p.url}
              alt={p.caption ?? "Foto del gimnasio"}
              width={300}
              height={300}
              className="aspect-square w-full object-cover"
            />
            {p.caption && (
              <p className="truncate px-3 py-2 text-xs text-muted-foreground">{p.caption}</p>
            )}
            <form action={deleteGalleryPhoto.bind(null, p.id)}>
              <button
                type="submit"
                aria-label="Eliminar foto"
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </form>
          </div>
        ))}
        {photos.length === 0 && (
          <div className="col-span-full rounded-2xl border border-border bg-surface p-10 text-center text-sm text-muted-foreground">
            Todavía no subiste ninguna foto.
          </div>
        )}
      </div>
    </div>
  );
}
