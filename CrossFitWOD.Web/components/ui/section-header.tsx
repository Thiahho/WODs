import { cn } from "@/lib/cn";

interface SectionHeaderProps {
  title: string;
  action?: { label: string; onClick: () => void };
  className?: string;
}

export function SectionHeader({ title, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <h2 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
        {title}
      </h2>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs font-medium text-brand hover:text-brand-light transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
