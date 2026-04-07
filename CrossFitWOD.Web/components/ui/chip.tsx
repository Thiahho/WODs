import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const chipVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:  "border-surface-border bg-surface text-zinc-400",
        active:   "border-brand bg-brand/15 text-brand",
        high:     "border-red-500/40 bg-red-500/10 text-red-400",
        moderate: "border-yellow-500/40 bg-yellow-500/10 text-yellow-400",
        low:      "border-blue-500/40 bg-blue-500/10 text-blue-400",
        deload:   "border-zinc-600/40 bg-zinc-800/40 text-zinc-500",
        success:  "border-emerald-500/40 bg-emerald-500/10 text-emerald-400",
      },
    },
    defaultVariants: { variant: "default" },
  }
);

interface ChipProps extends VariantProps<typeof chipVariants> {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

export function Chip({ variant, className, children, onClick }: ChipProps) {
  const Comp = onClick ? "button" : "span";
  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      className={cn(chipVariants({ variant }), onClick && "cursor-pointer", className)}
    >
      {children}
    </Comp>
  );
}
