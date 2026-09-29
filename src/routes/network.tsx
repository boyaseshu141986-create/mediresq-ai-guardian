import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Building2, MapPin, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EmptyState, RiskBadge, SectionCard } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hospitals, medicines, useStore } from "@/lib/store";
import { recommendTransfers } from "@/lib/ai-service";

export const Route = createFileRoute("/network")({
  head: () => ({
    meta: [
      { title: "Hospital Network — MediResQ AI" },
      {
        name: "description",
        content:
          "Compare medicine availability across CityCare, Sunrise, LifeLine and MediPlus hospitals and spot redistribution opportunities.",
      },
      { property: "og:title", content: "Hospital Network — MediResQ AI" },
      {
        property: "og:description",
        content: "Compare medicine stock across hospitals and redistribute surplus.",
      },
    ],
  }),
  component: NetworkPage,
});

function NetworkPage() {
  const { items, addTransfer } = useStore();
  const [medId, setMedId] = useState("m2");

  const comparison = useMemo(
    () => items.filter((i) => i.medicineId === medId).sort((a, b) => b.currentStock - a.currentStock),
    [items, medId],
  );

  const recs = useMemo(
    () => recommendTransfers(items).filter((r) => r.medicineName === medicines.find((m) => m.id === medId)?.name),
    [items, medId],
  );

  const maxStock = Math.max(1, ...comparison.map((c) => c.currentStock));

  return (
    <AppShell title="Hospital Network" subtitle="Cross-hospital inventory visibility">
      <div className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {hospitals.map((h) => {
            const hItems = items.filter((i) => i.hospitalId === h.id);
            const critical = hItems.filter(
              (i) => i.risk.riskLevel === "CRITICAL" || i.risk.riskLevel === "HIGH",
            ).length;
            const health = Math.round(
              100 - hItems.reduce((a, i) => a + i.risk.riskScore, 0) / Math.max(1, hItems.length),
            );
            return (
              <div key={h.id} className="surface-card p-4">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Building2 className="size-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{h.name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="size-3" /> {h.city} · {h.beds} beds
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Supply health</span>
                  <span className="font-bold tabular-nums">{health}%</span>
                </div>
                <Progress value={health} className="mt-1.5 h-2" />
                <div className="mt-3 flex justify-between text-xs">
                  <span className="text-muted-foreground">{hItems.length} tracked batches</span>
                  <span className={critical ? "font-semibold text-destructive" : "text-success"}>
                    {critical} at risk
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <SectionCard
          title="Compare stock across hospitals"
          description="Select a medicine to see availability network-wide"
          action={
            <Select value={medId} onValueChange={setMedId}>
              <SelectTrigger className="w-44">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {medicines.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        >
          {comparison.length === 0 ? (
            <EmptyState title="No hospital currently stocks this medicine" />
          ) : (
            <div className="space-y-3">
              {comparison.map((c) => (
                <div key={c.id} className="rounded-xl border border-border p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-semibold">{c.hospitalName}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.currentStock.toLocaleString()} {c.unit} · minimum{" "}
                        {c.minStock.toLocaleString()} · {c.risk.daysOfCover} days of cover
                      </p>
                    </div>
                    <RiskBadge level={c.risk.riskLevel} />
                  </div>
                  <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={
                        c.risk.riskLevel === "CRITICAL" || c.risk.riskLevel === "HIGH"
                          ? "h-full rounded-full bg-destructive transition-all duration-700"
                          : c.risk.riskLevel === "MEDIUM"
                            ? "h-full rounded-full bg-warning transition-all duration-700"
                            : "h-full rounded-full bg-success transition-all duration-700"
                      }
                      style={{ width: `${(c.currentStock / maxStock) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="AI redistribution recommendations"
          description="Move surplus stock to hospitals at risk"
        >
          {recs.length === 0 ? (
            <EmptyState
              title="No transfer needed for this medicine"
              description="Every hospital holds a safe buffer right now."
            />
          ) : (
            <div className="space-y-2.5">
              {recs.map((r) => (
                <div
                  key={r.id}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3"
                >
                  <Sparkles className="size-4 shrink-0 text-primary" />
                  <p className="flex-1 text-sm font-medium">{r.text}</p>
                  <Button
                    size="sm"
                    onClick={() => {
                      const from = hospitals.find((h) => h.name === r.from);
                      const to = hospitals.find((h) => h.name === r.to);
                      if (!from || !to) return;
                      addTransfer({
                        fromHospitalId: from.id,
                        toHospitalId: to.id,
                        medicineId: medId,
                        quantity: r.quantity,
                        priority: r.urgency === "Emergency" ? "Emergency" : "High",
                        reason: "AI redistribution recommendation",
                      });
                      toast.success("Transfer request created");
                    }}
                  >
                    Create transfer
                  </Button>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </AppShell>
  );
}
