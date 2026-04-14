"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { cn } from "@/lib/cn";
import { LayoutDashboard, Calendar, Dumbbell, Users, LogOut, ExternalLink, Zap } from "lucide-react";

const NAV = [
  { href: "/admin",          label: "Inicio",  Icon: LayoutDashboard },
  { href: "/admin/session",  label: "Hoy",     Icon: Calendar        },
  { href: "/admin/wods",     label: "WODs",    Icon: Dumbbell        },
  { href: "/admin/athletes", label: "Atletas", Icon: Users           },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();

  function handleLogout() {
    removeToken();
    router.push("/login");
  }

  return (
    <div className="min-h-screen">
      {/* Top header */}
      <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/95 backdrop-blur-lg px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-display text-xl text-brand">COACH</span>
            <span className="rounded-full border border-brand/30 bg-brand/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-brand">
              Admin
            </span>
          </div>

          <nav className="hidden sm:flex items-center gap-1">
            {NAV.map(({ href, label, Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-colors",
                    active
                      ? "bg-brand/10 text-brand border border-brand/30"
                      : "text-zinc-500 hover:text-zinc-200"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/workout"
              className="flex items-center gap-1.5 rounded-xl border border-brand/25 bg-brand/8 px-2.5 py-1.5 text-xs font-semibold text-brand transition-colors hover:bg-brand/15"
            >
              <Zap className="h-3 w-3" />
              <span>Ver como atleta</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 text-xs text-zinc-500 hover:text-red-400 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile bottom nav (sm and below) */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 sm:hidden safe-bottom">
        <div className="mx-3 mb-3">
          <div className="flex items-center justify-around rounded-2xl border border-surface-border bg-surface/95 px-2 py-2 backdrop-blur-xl shadow-[0_-4px_30px_rgba(0,0,0,0.6)]">
            {NAV.map(({ href, label, Icon }) => {
              const active = pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex flex-col items-center gap-1 px-2 py-1"
                >
                  <Icon
                    className={cn("h-5 w-5 transition-colors", active ? "text-brand" : "text-zinc-500")}
                    strokeWidth={active ? 2.5 : 2}
                  />
                  <span className={cn("text-[10px] font-medium", active ? "text-brand" : "text-zinc-500")}>
                    {label}
                  </span>
                </Link>
              );
            })}
            {/* Ver como atleta */}
            <Link
              href="/workout"
              className="flex flex-col items-center gap-1 px-2 py-1"
            >
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/20">
                <Zap className="h-3 w-3 text-brand" strokeWidth={2.5} />
              </div>
              <span className="text-[10px] font-medium text-brand">Atleta</span>
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-2xl px-4 py-6 pb-24 sm:pb-8">
        {children}
      </main>
    </div>
  );
}
