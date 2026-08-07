"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CreditCard,
  AlertTriangle,
  CalendarDays,
  Tag,
  GraduationCap,
  Images,
  UserCog,
  Settings,
  Zap,
  X,
} from "lucide-react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, ownerOnly: false, requiresClasses: false },
  { href: "/socios", label: "Socios", icon: Users, ownerOnly: false, requiresClasses: false },
  { href: "/cobros", label: "Cobros", icon: CreditCard, ownerOnly: false, requiresClasses: false },
  { href: "/riesgo", label: "Riesgo", icon: AlertTriangle, ownerOnly: false, requiresClasses: false },
  { href: "/clases", label: "Clases", icon: CalendarDays, ownerOnly: false, requiresClasses: true },
  { href: "/planes", label: "Planes", icon: Tag, ownerOnly: true, requiresClasses: false },
  { href: "/profesores", label: "Profesores", icon: GraduationCap, ownerOnly: true, requiresClasses: false },
  { href: "/galeria", label: "Galería", icon: Images, ownerOnly: true, requiresClasses: false },
  { href: "/usuarios", label: "Usuarios", icon: UserCog, ownerOnly: true, requiresClasses: false },
  { href: "/configuracion", label: "Configuración", icon: Settings, ownerOnly: true, requiresClasses: false },
];

export default function Sidebar({
  role,
  classesEnabled = false,
  open = false,
  onClose,
}: {
  role?: "OWNER" | "STAFF";
  classesEnabled?: boolean;
  open?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const items = NAV.filter(
    (item) => (!item.ownerOnly || role === "OWNER") && (!item.requiresClasses || classesEnabled)
  );

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
