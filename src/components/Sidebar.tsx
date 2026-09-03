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
  canAccessPlanes = true,
  canAccessCheckin = true,
  open = false,
  onClose,
}: {
  role?: "OWNER" | "STAFF";
  canAccessClasses?: boolean;
  canAccessHorarios?: boolean;
  canAccessPlanes?: boolean;
  canAccessCheckin?: boolean;
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const items = NAV.filter((item) => {
    if (item.ownerOnly && role !== "OWNER") return false;
    if (role === "OWNER") return true;
    if (item.requires === "classes" && !canAccessClasses) return false;
    if (item.requires === "horarios" && !canAccessHorarios) return false;
    if (item.requires === "planes" && !canAccessPlanes) return false;
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
          PULSO <span className="font-normal text-sidebar-muted">gestor</span>
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
