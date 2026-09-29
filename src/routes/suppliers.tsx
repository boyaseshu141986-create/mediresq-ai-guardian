import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Clock, Mail, PackageCheck, Truck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { SectionCard, StatCard } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { suppliers, useStore } from "@/lib/store";
import type { Supplier } from "@/lib/types";

export const Route = createFileRoute("/suppliers")({
  head: () => ({
    meta: [
      { title: "Suppliers — MediResQ AI" },
      {
        name: "description",
        content:
          "Monitor medicine supplier reliability, average delivery time, open orders and delivery delays.",
      },
      { property: "og:title", content: "Suppliers — MediResQ AI" },
      {
        property: "og:description",
        content: "Supplier reliability and delivery performance monitoring.",
      },
    ],
  }),
  component: SuppliersPage,
});

const statusStyle = (s: Supplier["status"]) =>
  s === "Active"
    ? "bg-success/12 text-success border-success/25"
    : s === "Delayed"
      ? "bg-warning/15 text-warning-foreground border-warning/35"
      : "bg-destructive/10 text-destructive border-destructive/25";

function SuppliersPage() {
  const { items } = useStore();
  const [detail, setDetail] = useState<Supplier | null>(null);

  const avgReliability = Math.round(
    suppliers.reduce((a, s) => a + s.reliability, 0) / suppliers.length,
  );
  const openOrders = suppliers.reduce((a, s) => a + s.currentOrders, 0);
  const avgDelivery = (
    suppliers.reduce((a, s) => a + s.avgDeliveryDays, 0) / suppliers.length
  ).toFixed(1);

  return (
    <AppShell title="Suppliers" subtitle="Delivery reliability across the supply base">
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard label="Suppliers" value={suppliers.length} icon={Truck} />
          <StatCard
            label="Avg Reliability"
            value={`${avgReliability}%`}
            icon={PackageCheck}
            tone="success"
          />
          <StatCard label="Avg Delivery" value={`${avgDelivery} d`} icon={Clock} tone="info" />
          <StatCard
            label="Open Orders"
            value={openOrders}
            icon={PackageCheck}
            tone="warning"
          />
        </div>

        <SectionCard title="Supplier directory" description="Tap a supplier to view details">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  {[
                    "Supplier",
                    "Medicine Categories",
                    "Avg Delivery Time",
                    "Reliability",
                    "Current Orders",
                    "Status",
                    "",
                  ].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2.5 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {suppliers.map((s) => (
                  <tr key={s.id} className="border-b border-border/70 hover:bg-muted/50">
                    <td className="px-3 py-3 font-semibold">{s.name}</td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {s.categories.map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 tabular-nums">{s.avgDeliveryDays} days</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={s.reliability} className="h-2 w-20" />
                        <span className="tabular-nums text-xs">{s.reliability}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 tabular-nums">{s.currentOrders}</td>
                    <td className="px-3 py-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${statusStyle(s.status)}`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <Button size="sm" variant="ghost" onClick={() => setDetail(s)}>
                        Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{detail?.name}</DialogTitle>
            <DialogDescription className="flex items-center gap-1.5">
              <Mail className="size-3.5" /> {detail?.contact}
            </DialogDescription>
          </DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { l: "Reliability", v: `${detail.reliability}%` },
                  { l: "On-time rate", v: `${detail.onTimeRate}%` },
                  { l: "Avg delivery", v: `${detail.avgDeliveryDays} days` },
                  { l: "Open orders", v: detail.currentOrders },
                ].map((x) => (
                  <div key={x.l} className="rounded-xl border border-border p-3">
                    <p className="text-lg font-extrabold tabular-nums">{x.v}</p>
                    <p className="text-[11px] text-muted-foreground">{x.l}</p>
                  </div>
                ))}
              </div>
              <div>
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Supplies batches for
                </p>
                <ul className="space-y-1 text-sm">
                  {items
                    .filter((i) => i.supplierId === detail.id)
                    .slice(0, 6)
                    .map((i) => (
                      <li key={i.id} className="flex justify-between">
                        <span>
                          {i.medicineName} — {i.hospitalName}
                        </span>
                        <span className="tabular-nums text-muted-foreground">
                          {i.currentStock.toLocaleString()}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
