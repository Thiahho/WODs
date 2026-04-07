import { cn } from "@/lib/cn";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?:  string;
  accent?: boolean;
  className?: string;
}

export function StatCard({ label, value, sub, accent, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-4 flex flex-col gap-1",
        accent
          ? "border-brand/30 bg-brand/5"
          : "border-surface-border bg-surface",
        className
      )}
    >
      <span className="text-[10px] font-semibold uppercase tracking-widest text-zinc-500">
        {label}
      </span>
      <span
        className={cn(
          "text-2xl font-display leading-none",
          accent ? "text-brand glow-text" : "text-zinc-50"
        )}
      >
        {value}
      </span>
      {sub && (
        <span className="text-[11px] text-zinc-500">{sub}</span>
      )}
    </div>
  );
}
