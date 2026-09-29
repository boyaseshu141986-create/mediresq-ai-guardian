import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { riskStyles } from "@/lib/risk-engine";
import type { RiskLevel, TransferStatus, AlertSeverity } from "@/lib/types";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = "primary",
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon: LucideIcon;
  tone?: "primary" | "success" | "warning" | "danger" | "info";
}) {
  const tones = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/12 text-success",
    warning: "bg-warning/15 text-warning-foreground",
    danger: "bg-destructive/10 text-destructive",
    info: "bg-info/12 text-info",
  } as const;

  return (
    <div className="surface-card p-4 transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1.5 text-2xl font-extrabold tabular-nums">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-xl", tones[tone])}>
          <Icon className="size-[18px]" />
        </span>
      </div>
    </div>
  );
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold tracking-wide",
        riskStyles[level],
      )}
    >
      {level}
    </span>
  );
}

const statusStyles: Record<TransferStatus, string> = {
  Pending: "bg-warning/15 text-warning-foreground border-warning/35",
  Approved: "bg-info/12 text-info border-info/30",
  "In Transit": "bg-primary/10 text-primary border-primary/25",
  Completed: "bg-success/12 text-success border-success/25",
};

export function StatusBadge({ status }: { status: TransferStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        statusStyles[status],
      )}
    >
      {status}
    </span>
  );
}

const severityStyles: Record<AlertSeverity, string> = {
  Critical: "bg-destructive text-destructive-foreground border-destructive",
  High: "bg-destructive/10 text-destructive border-destructive/25",
  Medium: "bg-warning/15 text-warning-foreground border-warning/35",
  Low: "bg-info/12 text-info border-info/25",
};

export function SeverityBadge({ severity }: { severity: AlertSeverity }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide",
        severityStyles[severity],
      )}
    >
      {severity}
    </span>
  );
}

export function SectionCard({
  title,
  description,
  action,
  className,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section className={cn("surface-card p-4 sm:p-5", className)}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-bold">{title}</h2>
          {description && <p className="text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ title, description }: { title: string; description?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-6 py-12 text-center">
      <p className="text-sm font-semibold">{title}</p>
      {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
    </div>
  );
}

export const chartTooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-border)",
  background: "var(--color-card)",
  fontSize: 12,
  boxShadow: "var(--shadow-card)",
};
