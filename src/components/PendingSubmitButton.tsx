"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";

// Must be a child of the <form> it guards — useFormStatus reads the
// nearest parent form's submission state. Disables the button the instant
// it's clicked, closing the double-click window that a plain <button
// type="submit"> leaves open (nothing stops a second click before the
// page re-renders with fresh data).
export default function PendingSubmitButton({
  children,
  className,
  ...props
}: {
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className} {...props}>
      {children}
    </button>
  );
}
