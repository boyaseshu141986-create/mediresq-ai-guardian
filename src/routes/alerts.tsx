import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AlertTriangle, BellRing, CalendarClock, CheckCircle2, Siren, TrendingUp, Truck } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EmptyState, SectionCard, SeverityBadge, StatCard } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hospitals, medicines, useStore } from "@/lib/store";
import type { AlertSeverity, AlertType, SupplyAlert } from "@/lib/types";

export const Route = createFileRoute("/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts — MediResQ AI" },
      {
        name: "description",
        content:
          "Centralised supply-chain alerts: stock shortages, predicted shortages, expiry warnings, demand spikes and supplier delays.",
      },
      { property: "og:title", content: "Alerts — MediResQ AI" },
      {
        property: "og:description",
        content: "Centralised hospital supply-chain alerting with severity filtering.",
      },
    ],
  }),
  component: AlertsPage,
});

const typeIcon: Record<AlertType, typeof AlertTriangle> = {
  "Stock Shortage": AlertTriangle,
  "Predicted Shortage": TrendingUp,
  "Expiry Warning": CalendarClock,
  "Demand Spike": TrendingUp,
  "Supplier Delay": Truck,
  Emergency: Siren,
};

function AlertsPage() {
  const { alerts, acknowledgeAlert, items } = useStore();
  const [severity, setSeverity] = useState<"all" | AlertSeverity>("all");
  const [type, setType] = useState<"all" | AlertType>("all");

  // Live alerts derived from the risk engine, merged with the seeded feed.
  const derived = useMemo<SupplyAlert[]>(
    () =>
      items
        .filter((i) => i.risk.riskLevel === "CRITICAL" || i.risk.riskLevel === "HIGH")
        .slice(0, 6)
        .map((i) => ({
          id: `auto-${i.id}`,
          type: "Predicted Shortage" as AlertType,
          severity: (i.risk.riskLevel === "CRITICAL" ? "Critical" : "High") as AlertSeverity,
          message: `${i.medicineName} at ${i.hospitalName} has ${i.risk.daysOfCover} days of cover — ${i.risk.shortageProbability}% shortage probability.`,
          hospitalId: i.hospitalId,
          medicineId: i.medicineId,
          createdAt: new Date().toISOString().slice(0, 10),
          acknowledged: false,
        })),
    [items],
  );

  const all = useMemo(() => {
    const seen = new Set(alerts.map((a) => a.message));
    return [...alerts, ...derived.filter((d) => !seen.has(d.message))];
  }, [alerts, derived]);

  const visible = all.filter(
    (a) => (severity === "all" || a.severity === severity) && (type === "all" || a.type === type),
  );

  const count = (s: AlertSeverity) => all.filter((a) => a.severity === s).length;

  return (
    <AppShell title="Alerts" subtitle="Every supply-chain signal in one feed">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Critical" value={count("Critical")} icon={Siren} tone="danger" />
          <StatCard label="High" value={count("High")} icon={AlertTriangle} tone="danger" />
          <StatCard label="Medium" value={count("Medium")} icon={BellRing} tone="warning" />
          <StatCard label="Low" value={count("Low")} icon={BellRing} tone="info" />
        </div>

        <SectionCard
          title="Alert feed"
          description={`${visible.length} alerts shown`}
          action={
            <div className="flex gap-2">
              <Select value={severity} onValueChange={(v) => setSeverity(v as typeof severity)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All severity</SelectItem>
                  {(["Critical", "High", "Medium", "Low"] as AlertSeverity[]).map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                <SelectTrigger className="hidden w-44 sm:flex">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  {(Object.keys(typeIcon) as AlertType[]).map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          }
        >
          {visible.length === 0 ? (
            <EmptyState title="No alerts match these filters" description="Try a wider filter." />
          ) : (
            <div className="space-y-2.5">
              {visible.map((a) => {
                const Icon = typeIcon[a.type];
                return (
                  <div
                    key={a.id}
                    className={`flex flex-wrap items-start gap-3 rounded-xl border p-3.5 ${
                      a.severity === "Critical" && !a.acknowledged
                        ? "border-destructive/30 bg-destructive/5"
                        : "border-border"
                    } ${a.acknowledged ? "opacity-60" : ""}`}
                  >
                    <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <Icon className="size-4 text-muted-foreground" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{a.message}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {a.type}
                        {a.hospitalId
                          ? ` · ${hospitals.find((h) => h.id === a.hospitalId)?.name}`
                          : ""}
                        {a.medicineId
                          ? ` · ${medicines.find((m) => m.id === a.medicineId)?.name}`
                          : ""}{" "}
                        · {a.createdAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <SeverityBadge severity={a.severity} />
                      {a.acknowledged ? (
                        <span className="flex items-center gap-1 text-[11px] font-medium text-success">
                          <CheckCircle2 className="size-3.5" /> Acknowledged
                        </span>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            acknowledgeAlert(a.id);
                            toast.success("Alert acknowledged");
                          }}
                        >
                          Acknowledge
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
