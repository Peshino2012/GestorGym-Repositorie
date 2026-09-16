"use client";

import { useState, useTransition, type ReactNode } from "react";
import { createMercadoPagoLink } from "@/app/(app)/cobros/actions";

// Opens the Mercado Pago link in a new tab once it's generated — the cobro
// itself only gets marked paid later, on its own, when Mercado Pago calls
// our webhook (the socio might close this tab without finishing, or pay
// but the notification takes a moment).
export default function MercadoPagoButton({
  paymentId,
  className,
  children,
}: {
  paymentId: string;
  className?: string;
  children: ReactNode;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        className={className}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              const url = await createMercadoPagoLink(paymentId);
              window.open(url, "_blank");
            } catch (err) {
              setError(err instanceof Error ? err.message : "Algo salió mal.");
            }
          });
        }}
      >
        {children}
      </button>
      {error && (
        <span className="max-w-[9rem] text-right text-[10px] font-medium text-danger">{error}</span>
      )}
    </div>
  );
}
