"use client";

import { useState, type ReactNode } from "react";
import { Menu, LogOut } from "lucide-react";
import Sidebar from "./Sidebar";

export default function AppShell({
  role,
  canAccessClasses,
  canAccessHorarios,
  canAccessPlan,
  canAccessPlanes,
  canAccessCheckin,
  planesModuleEnabled,
  classesModuleEnabled,
  horariosModuleEnabled,
  userName,
  gymLabel,
  logoutAction,
  children,
}: {
  role?: "OWNER" | "STAFF";
  canAccessClasses?: boolean;
  canAccessHorarios?: boolean;
  canAccessPlan?: boolean;
  canAccessPlanes?: boolean;
  canAccessCheckin?: boolean;
  planesModuleEnabled?: boolean;
  classesModuleEnabled?: boolean;
  horariosModuleEnabled?: boolean;
  userName?: string | null;
  gymLabel?: string;
  logoutAction: () => void;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden print:h-auto print:overflow-visible">
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setOpen(false)}
          aria-hidden
        />
      )}

      <Sidebar
        role={role}
        canAccessClasses={canAccessClasses}
        canAccessHorarios={canAccessHorarios}
        canAccessPlan={canAccessPlan}
        canAccessPlanes={canAccessPlanes}
        canAccessCheckin={canAccessCheckin}
        planesModuleEnabled={planesModuleEnabled}
        classesModuleEnabled={classesModuleEnabled}
        horariosModuleEnabled={horariosModuleEnabled}
        open={open}
        onClose={() => setOpen(false)}
      />

      <div className="flex flex-1 flex-col overflow-hidden print:overflow-visible">
        <header className="flex items-center justify-between border-b border-border bg-surface px-4 py-4 sm:px-8 print:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Abrir menú"
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-background md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            {gymLabel && (
              <p className="hidden text-sm text-muted-foreground sm:block">
                {gymLabel}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="hidden text-sm font-medium sm:inline">{userName}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:border-danger hover:text-danger sm:px-3"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </form>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-6 sm:px-8 sm:py-8 print:overflow-visible print:p-0">
          {children}
        </main>
      </div>
    </div>
  );
}
