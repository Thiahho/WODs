"use client";

import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export function CoachModeBanner() {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-brand/20 bg-brand/8 px-4 py-2 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-3.5 w-3.5 text-brand shrink-0" />
        <span className="text-[11px] font-semibold text-brand">
          Modo atleta
        </span>
        <span className="text-[11px] text-zinc-500">
          — estás viendo tu perfil como atleta
        </span>
      </div>
      <Link
        href="/admin"
        className="flex items-center gap-1 rounded-lg border border-brand/30 bg-brand/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-brand transition-colors hover:bg-brand/20 shrink-0"
      >
        <ArrowLeft className="h-3 w-3" />
        Panel
      </Link>
    </div>
  );
}
