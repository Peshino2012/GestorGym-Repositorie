"use client";

import { ReactNode } from "react";

export default function WhatsAppButton({
  phone,
  message,
  className,
  children,
}: {
  phone: string;
  message: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="submit"
      className={className}
      onClick={() => {
        const digits = phone.replace(/\D/g, "");
        if (!digits) return;
        window.open(
          `https://wa.me/${digits}?text=${encodeURIComponent(message)}`,
          "_blank"
        );
      }}
    >
      {children}
    </button>
  );
}
