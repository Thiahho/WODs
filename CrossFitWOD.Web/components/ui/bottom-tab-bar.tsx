"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Zap, User, Dumbbell, Calendar, Users } from "lucide-react";
import { cn } from "@/lib/cn";

const ATHLETE_TABS = [
  // { href: "/workout",  label: "Inicio",    Icon: Home         },
  { href: "/history",  label: "Historial", Icon: ClipboardList },
  { href: "/workout",  label: "WOD",       Icon: Zap, central: true },
  { href: "/profile",  label: "Perfil",    Icon: User         },
];

const ADMIN_TABS = [
  { href: "/admin",           label: "Inicio",   Icon: Home     },
  { href: "/admin/session",   label: "Hoy",      Icon: Calendar },
  { href: "/admin/wods",      label: "WODs",     Icon: Dumbbell, central: true },
  { href: "/admin/athletes",  label: "Atletas",  Icon: Users    },
  { href: "/profile",         label: "Perfil",   Icon: User     },
];

interface Props {
  variant?: "athlete" | "admin";
}

export function BottomTabBar({ variant = "athlete" }: Props) {
  const pathname = usePathname();
  const tabs     = variant === "admin" ? ADMIN_TABS : ATHLETE_TABS;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="mx-auto max-w-md">
        <div className="mx-3 mb-3 flex items-end justify-around rounded-2xl border border-surface-border bg-surface/98 px-2 py-2 shadow-[0_-4px_30px_rgba(0,0,0,0.6)]">
          {tabs.map(({ href, label, Icon, central }) => {
            const active = pathname === href || (href !== "/workout" && href !== "/admin" && pathname.startsWith(href));
            if (central) {
              return (
                <Link
                  key={label}
                  href={href}
                  aria-label="WOD del día"
                  className="relative -mt-6 flex flex-col items-center"
                >
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand shadow-glow animate-pulse-glow" style={{ willChange: "opacity" }}>
                    <Icon className="h-6 w-6 text-black" strokeWidth={2.5} />
                  </span>
                  <span className="mt-1 text-[10px] font-semibold text-brand">{label}</span>
                </Link>
              );
            }
            return (
              <Link
                key={href + label}
                href={href}
                aria-label={label}
                aria-current={active ? "page" : undefined}
                className="flex flex-col items-center gap-1 px-3 py-2.5 group active:opacity-70 transition-opacity"
              >
                <Icon
                  className={cn(
                    "h-5 w-5 transition-colors",
                    active ? "text-brand" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                  strokeWidth={active ? 2.5 : 2}
                />
                <span
                  className={cn(
                    "text-[10px] font-medium transition-colors",
                    active ? "text-brand" : "text-zinc-500 group-hover:text-zinc-300"
                  )}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
