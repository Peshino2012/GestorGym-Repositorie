"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-danger-bg text-danger">
        <AlertTriangle className="h-7 w-7" />
      </div>
      <div>
        <h1 className="text-lg font-bold">Algo salió mal</h1>
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">
          {error.message || "Ocurrió un error inesperado."}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-all duration-150 hover:opacity-90 active:scale-[0.97]"
        >
          Reintentar
        </button>
        <a
          href="/dashboard"
          className="rounded-lg border border-border px-4 py-2.5 text-sm font-semibold transition-colors hover:bg-background"
        >
          Ir al dashboard
        </a>
      </div>
    </div>
  );
}
