"use client";

import { usePathname } from "next/navigation";
import { BottomTabBar } from "./bottom-tab-bar";

const NO_BAR_ROUTES = ["/login", "/register", "/setup"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideBar  = NO_BAR_ROUTES.includes(pathname);
  const isAdmin  = pathname.startsWith("/admin");

  return (
    <>
      <div className={hideBar ? "" : "pb-safe"}>
        {children}
      </div>
      {!hideBar && <BottomTabBar variant={isAdmin ? "admin" : "athlete"} />}
    </>
  );
}
