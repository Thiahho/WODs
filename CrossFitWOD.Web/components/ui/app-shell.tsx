"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomTabBar } from "./bottom-tab-bar";
<<<<<<< HEAD
import { getRole, getMode, setMode } from "@/lib/auth";
import { LayoutDashboard } from "lucide-react";
=======
import { CoachModeBanner } from "./coach-mode-banner";
import { getRole } from "@/lib/auth";
>>>>>>> claude/crossfit-mobile-design-iMPDq

const NO_BAR_ROUTES = ["/login", "/register", "/setup", "/logout"];

export function AppShell({ children }: { children: React.ReactNode }) {
<<<<<<< HEAD
  const pathname = usePathname();
  const router   = useRouter();

  const isAdmin = pathname.startsWith("/admin");
  const hideBar = NO_BAR_ROUTES.includes(pathname) || isAdmin;

  const [athleteMode, setAthleteMode] = useState(false);

  useEffect(() => {
    setAthleteMode(getRole() === "admin" && getMode() === "athlete");
  }, [pathname]);

  function handleReturnToCoach() {
    setMode("coach");
    router.push("/admin");
  }

  return (
    <>
      {/* Banner modo atleta — solo para coaches fuera de /admin */}
      {athleteMode && !isAdmin && (
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-brand/20 bg-brand/5 px-4 py-2 backdrop-blur">
          <span className="text-xs font-semibold text-brand">⚡ Modo entrenamiento</span>
          <button
            onClick={handleReturnToCoach}
            className="flex items-center gap-1 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <LayoutDashboard className="h-3 w-3" />
            Volver al panel
          </button>
        </div>
      )}

      <div className={hideBar ? "" : "pb-safe"}>
        {children}
      </div>

      {!hideBar && <BottomTabBar variant="athlete" />}
=======
  const pathname   = usePathname();
  const hideBar    = NO_BAR_ROUTES.includes(pathname);
  const isAdminPath = pathname.startsWith("/admin");
  const isCoach    = getRole() === "admin";
  const coachMode  = isCoach && !isAdminPath && !NO_BAR_ROUTES.includes(pathname);

  return (
    <>
      {coachMode && <CoachModeBanner />}
      <div className={hideBar ? "" : "pb-safe"}>
        {children}
      </div>
      {!hideBar && <BottomTabBar variant={isAdminPath ? "admin" : "athlete"} />}
>>>>>>> claude/crossfit-mobile-design-iMPDq
    </>
  );
}
