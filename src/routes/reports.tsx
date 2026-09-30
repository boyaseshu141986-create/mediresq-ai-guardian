import { createFileRoute } from "@tanstack/react-router";
import { useMemo } from "react";
import { Download, FileBarChart, PackageX, Recycle, Target } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { SectionCard, StatCard, chartTooltipStyle } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { hospitals, suppliers, useStore } from "@/lib/store";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Reports — MediResQ AI" },
      {
        name: "description",
        content:
          "Monthly medicine usage, shortages, wastage, expiry losses, supplier performance, transfers and AI prediction accuracy.",
      },
      { property: "og:title", content: "Reports — MediResQ AI" },
      {
        property: "og:description",
        content: "Supply chain analytics and downloadable hospital reports.",
      },
    ],
  }),
  component: ReportsPage,
});

const months = ["Apr", "May", "Jun", "Jul", "Aug", "Sep"];

function ReportsPage() {
  const { items, transfers } = useStore();

  const monthly = useMemo(
    () =>
      months.map((m, i) => ({
        month: m,
        usage: Math.round(28000 + Math.sin(i / 1.6) * 4200 + i * 900),
        shortages: Math.max(1, 12 - i + (i % 2 === 0 ? 3 : 0)),
        wastage: Math.round(1400 - i * 120 + (i % 3) * 180),
      })),
    [],
  );

  const accuracy = useMemo(
    () =>
      months.map((m, i) => ({
        month: m,
        accuracy: Math.round(78 + i * 2.2 + (i % 2 === 0 ? 1.4 : -0.8)),
      })),
    [],
  );

  const transfersByHospital = hospitals.map((h) => ({
    name: h.name.split(" ")[0],
    sent: transfers.filter((t) => t.fromHospitalId === h.id).length,
    received: transfers.filter((t) => t.toHospitalId === h.id).length,
  }));

  const supplierPerf = suppliers.map((s) => ({
    name: s.name.split(" ")[0],
    reliability: s.reliability,
    delivery: s.avgDeliveryDays * 10,
  }));

  const expiryLoss = items
    .filter((i) => i.risk.expiryRisk > 40)
    .reduce((a, i) => a + Math.round(i.currentStock * (i.risk.expiryRisk / 100) * 0.3), 0);

  const download = (name: string) =>
    toast.success(`${name} exported`, { description: "Demo export — no file leaves this session." });

  return (
    <AppShell
      title="Reports"
      subtitle="Analytics across usage, wastage, suppliers and AI accuracy"
      actions={
        <Button className="gap-2" onClick={() => download("Full supply chain report")}>
          <Download className="size-4" />
          <span className="hidden sm:inline">Download all</span>
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Monthly Usage"
            value={(monthly[monthly.length - 1]?.usage ?? 0).toLocaleString()}
            hint="units, last month"
            icon={FileBarChart}
          />
          <StatCard
            label="Monthly Shortages"
            value={monthly[monthly.length - 1]?.shortages ?? 0}
            icon={PackageX}
            tone="danger"
          />
          <StatCard
            label="Expiry Losses"
            value={expiryLoss.toLocaleString()}
            hint="units at risk"
            icon={Recycle}
            tone="warning"
          />
          <StatCard
            label="AI Prediction Accuracy"
            value={`${accuracy[accuracy.length - 1]?.accuracy ?? 0}%`}
            icon={Target}
            tone="success"
          />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <SectionCard
            title="Monthly medicine usage & shortages"
            description="Network-wide consumption vs. recorded stock-outs"
            action={
              <Button size="sm" variant="ghost" className="gap-1" onClick={() => download("Usage report")}>
                <Download className="size-3.5" /> CSV
              </Button>
            }
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar name="Units used" dataKey="usage" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                <Bar
                  name="Shortage events"
                  dataKey="shortages"
                  fill="var(--color-destructive)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard
            title="Inventory wastage & expiry losses"
            description="Units written off each month"
            action={
              <Button size="sm" variant="ghost" className="gap-1" onClick={() => download("Wastage report")}>
                <Download className="size-3.5" /> CSV
              </Button>
            }
          >
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={48} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line
                  type="monotone"
                  name="Wastage (units)"
                  dataKey="wastage"
                  stroke="var(--color-warning)"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard
            title="Supplier performance"
            description="Reliability score and delivery speed index"
            action={
              <Button size="sm" variant="ghost" className="gap-1" onClick={() => download("Supplier report")}>
                <Download className="size-3.5" /> CSV
              </Button>
            }
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={supplierPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  name="Reliability %"
                  dataKey="reliability"
                  fill="var(--color-success)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  name="Delivery index"
                  dataKey="delivery"
                  fill="var(--color-info)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard
            title="Hospital transfers"
            description="Stock sent and received per hospital"
            action={
              <Button size="sm" variant="ghost" className="gap-1" onClick={() => download("Transfer report")}>
                <Download className="size-3.5" /> CSV
              </Button>
            }
          >
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={transfersByHospital}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} allowDecimals={false} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar name="Sent" dataKey="sent" fill="var(--color-primary)" radius={[6, 6, 0, 0]} />
                <Bar
                  name="Received"
                  dataKey="received"
                  fill="var(--color-warning)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        <SectionCard
          title="AI prediction accuracy"
          description="How closely forecasts matched actual consumption"
          action={
            <Button size="sm" variant="ghost" className="gap-1" onClick={() => download("Accuracy report")}>
              <Download className="size-3.5" /> CSV
            </Button>
          }
        >
          <ResponsiveContainer width="100%" height={230}>
            <LineChart data={accuracy}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Line
                type="monotone"
                name="Accuracy %"
                dataKey="accuracy"
                stroke="var(--color-primary)"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </SectionCard>
      </div>
    </AppShell>
  );
}
