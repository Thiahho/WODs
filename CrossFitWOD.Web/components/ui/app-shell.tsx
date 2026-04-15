"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BottomTabBar } from "./bottom-tab-bar";
import { CoachModeBanner } from "./coach-mode-banner";
import { getRole } from "@/lib/auth";

const NO_BAR_ROUTES = ["/login", "/register", "/setup", "/logout"];

export function AppShell({ children }: { children: React.ReactNode }) {
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
    </>
  );
}
