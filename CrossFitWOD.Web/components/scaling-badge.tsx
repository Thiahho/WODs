import { cn } from "@/lib/cn";

interface ScalingBadgeProps {
  factor: number;
}

export function ScalingBadge({ factor }: ScalingBadgeProps) {
  const label =
    factor < 0.9 ? "Reduciendo carga" :
    factor > 1.1 ? "Superando Rx" :
    "En Rx";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        factor < 0.9 && "bg-sky-900/50 text-sky-300",
        factor >= 0.9 && factor <= 1.1 && "bg-emerald-900/50 text-emerald-300",
        factor > 1.1 && "bg-orange-900/50 text-orange-300"
      )}
    >
      ×{factor.toFixed(1)} — {label}
    </span>
  );
}
