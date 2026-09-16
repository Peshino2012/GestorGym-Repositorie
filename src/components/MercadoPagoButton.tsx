"use client";

import { useState, useTransition, type ReactNode } from "react";
import { X } from "lucide-react";
import { createMercadoPagoLink } from "@/app/(app)/cobros/actions";

// Shows the Mercado Pago link as a QR instead of opening it — the socio
// scans it with their own phone and pays there, nobody has to hand a
// device back and forth at the front desk. The cobro itself only gets
// marked paid later, on its own, when Mercado Pago calls our webhook (the
// socio might scan but not finish, or the notification might take a
// moment), so this modal is just a way to display the code, not a
// confirmation of anything.
export default function MercadoPagoButton({
  paymentId,
  memberName,
  className,
  children,
}: {
  paymentId: string;
  memberName: string;
  className?: string;
  children: ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [qr, setQr] = useState<{ url: string; qrDataUrl: string } | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      try {
        const result = await createMercadoPagoLink(paymentId);
        setQr(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Algo salió mal.");
      }
    });
  }

  return (
    <>
      <div className="flex flex-col items-end gap-1">
        <button type="button" disabled={pending} className={className} onClick={handleClick}>
          {children}
        </button>
        {error && (
          <span className="max-w-[9rem] text-right text-[10px] font-medium text-danger">{error}</span>
        )}
      </div>

      {qr && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setQr(null)}
        >
          <div
            className="flex w-full max-w-xs flex-col items-center gap-4 rounded-2xl bg-surface p-6 text-center shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex w-full items-center justify-between">
              <p className="text-sm font-semibold">Cobrar a {memberName}</p>
              <button
                type="button"
                aria-label="Cerrar"
                onClick={() => setQr(null)}
                className="rounded-lg p-1 text-muted-foreground transition-colors hover:bg-background"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* eslint-disable-next-line @next/next/no-img-element -- data: URL, not an optimizable remote image */}
            <img src={qr.qrDataUrl} alt="Código QR para pagar con Mercado Pago" className="rounded-lg" />

            <p className="text-xs text-muted-foreground">
              Que el socio lo escanee con la cámara o la app de Mercado Pago. El cobro se marca pagado
              solo, apenas Mercado Pago confirme el pago.
            </p>

            <a
              href={qr.url}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-primary hover:underline"
            >
              O abrir el link directamente
            </a>
          </div>
        </div>
      )}
    </>
  );
}
