"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  AlertTriangle,
  CalendarDays,
  Clock,
  Tag,
  GraduationCap,
  Images,
  UserCog,
  Settings,
  Zap,
  X,
  IdCard,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, ownerOnly: false, requires: null },
  { href: "/socios", label: "Socios", icon: Users, ownerOnly: false, requires: null },
  { href: "/ingresos", label: "Registro", icon: IdCard, ownerOnly: false, requires: "checkin" as const },
  { href: "/cobros", label: "Cobros", icon: CreditCard, ownerOnly: false, requires: null },
  { href: "/riesgo", label: "Riesgo", icon: AlertTriangle, ownerOnly: false, requires: null },
  { href: "/clases", label: "Clases", icon: CalendarDays, ownerOnly: false, requires: "classes" as const },
  { href: "/horarios", label: "Horarios", icon: Clock, ownerOnly: false, requires: "horarios" as const },
  { href: "/plan", label: "Plan", icon: Tag, ownerOnly: false, requires: "plan" as const },
  { href: "/planes", label: "Planes", icon: Tag, ownerOnly: false, requires: "planes" as const },
  { href: "/profesores", label: "Profesores", icon: GraduationCap, ownerOnly: true, requires: null },
  { href: "/galeria", label: "Galería", icon: Images, ownerOnly: true, requires: null },
  { href: "/usuarios", label: "Usuarios", icon: UserCog, ownerOnly: true, requires: null },
  { href: "/configuracion", label: "Configuración", icon: Settings, ownerOnly: true, requires: null },
];

export default function Sidebar({
  role,
  canAccessClasses = true,
  canAccessHorarios = true,
  canAccessPlan = true,
  canAccessPlanes = true,
  canAccessCheckin = true,
  planesModuleEnabled = false,
  classesModuleEnabled = false,
  horariosModuleEnabled = false,
  open = false,
  onClose,
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
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  // "/plan" and "/planes" are mutually exclusive per viewer, not per gym —
  // "/planes" (the paid module) wins for THIS user only if the gym has it
  // AND they personally have that permission; "/plan" is the fallback
  // whenever either of those isn't true, as long as they have the "/plan"
  // permission. Same underlying Plan row(s) either way, so nothing is lost
  // switching between them.
  const hasPlanesAccess = role === "OWNER" || canAccessPlanes;
  const showPlanes = planesModuleEnabled && hasPlanesAccess;
  const hasPlanAccess = role === "OWNER" || canAccessPlan;
  const showPlan = !showPlanes && hasPlanAccess;

  // Clases and Horarios are paid modules too — unlike Plan/Planes there's
  // no free fallback, so the gym-level flag blocks everyone, owner
  // included; the per-user permission only matters once the gym has it.
  const showClasses = classesModuleEnabled && (role === "OWNER" || canAccessClasses);
  const showHorarios = horariosModuleEnabled && (role === "OWNER" || canAccessHorarios);

  const items = NAV.filter((item) => {
    if (item.href === "/clases") return showClasses;
    if (item.href === "/horarios") return showHorarios;
    if (item.href === "/plan") return showPlan;
    if (item.href === "/planes") return showPlanes;
    if (item.ownerOnly && role !== "OWNER") return false;
    if (role === "OWNER") return true;
    if (item.requires === "checkin" && !canAccessCheckin) return false;
    return true;
  });

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 flex h-full w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-out print:hidden md:static md:z-auto md:w-60 md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-between px-6 py-6">
        <div className="flex items-center gap-1.5 text-lg font-bold tracking-tight">
          <Zap className="h-4 w-4 fill-primary text-primary" strokeWidth={0} />
          Cauccen <span className="font-normal text-sidebar-muted">gestor</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar menú"
          className="rounded-lg p-1.5 text-sidebar-muted transition-colors hover:bg-white/5 hover:text-sidebar-foreground md:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {items.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-sidebar-muted hover:translate-x-0.5 hover:bg-white/5 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-4 w-4 transition-transform duration-200 group-hover:scale-110" />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
