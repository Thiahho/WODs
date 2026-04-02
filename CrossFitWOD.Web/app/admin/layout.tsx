"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { removeToken } from "@/lib/auth";
import { cn } from "@/lib/cn";

const NAV = [
  { href: "/admin",           label: "Inicio"   },
  { href: "/admin/athletes",  label: "Atletas"  },
  { href: "/admin/wods",      label: "WODs"     },
  { href: "/admin/session",   label: "Hoy"      },
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
      <header className="border-b border-zinc-800 bg-zinc-950 px-4 py-3">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <nav className="flex items-center gap-1">
            <span className="mr-4 text-sm font-bold text-orange-500">Admin</span>
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm transition-colors",
                  pathname === n.href
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:text-zinc-200"
                )}
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/workout" className="text-xs text-zinc-500 hover:text-zinc-300">
              Ver como atleta
            </Link>
            <button
              onClick={handleLogout}
              className="text-xs text-zinc-500 hover:text-zinc-300"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
