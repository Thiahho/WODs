import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const buttonVariants = cva(
  "inline-flex w-full items-center justify-center rounded-2xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
  {
    variants: {
      variant: {
        brand:   "bg-brand text-black hover:bg-brand-light shadow-glow hover:shadow-glow-lg active:scale-[0.98]",
        outline: "border border-brand/50 text-brand bg-transparent hover:bg-brand/10 hover:border-brand",
        ghost:   "border border-surface-border text-zinc-400 bg-surface hover:border-zinc-600 hover:text-zinc-200",
        danger:  "bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30",
      },
      size: {
        sm: "px-4 py-2.5 text-sm",
        md: "px-4 py-3.5 text-sm",
        lg: "px-4 py-4 text-base",
      },
    },
    defaultVariants: { variant: "brand", size: "md" },
  }
);

interface PrimaryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function PrimaryButton({ variant, size, className, children, ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {children}
    </button>
  );
}
