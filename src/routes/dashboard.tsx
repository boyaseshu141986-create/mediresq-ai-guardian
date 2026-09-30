import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  Boxes,
  CalendarClock,
  Gauge,
  PackageX,
  Siren,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { SectionCard, SeverityBadge, StatCard } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { demandHistory, suppliers, useStore } from "@/lib/store";
import { recommendTransfers } from "@/lib/ai-service";
import { predictDemand } from "@/lib/risk-engine";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — MediResQ AI" },
      {
        name: "description",
        content:
          "Live view of hospital medicine stock levels, predicted shortages, expiring batches and AI supply chain health.",
      },
      { property: "og:title", content: "Dashboard — MediResQ AI" },
      {
        property: "og:description",
        content: "Live hospital supply chain health, shortage predictions and AI recommendations.",
      },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { items, transfers, alerts, emergencyMode, setEmergencyMode, emergencyMultiplier } =
    useStore();

  const stats = useMemo(() => {
    const low = items.filter((i) => i.currentStock < i.minStock * 1.25).length;
    const critical = items.filter((i) => i.risk.riskLevel === "CRITICAL").length;
    const predicted = items.filter((i) => i.risk.projectedShortfall > 0).length;
    const expiring = items.filter((i) => i.risk.daysToExpiry <= 45).length;
    const pending = transfers.filter((t) => t.status !== "Completed").length;
    const resilience = Math.round(
      100 - items.reduce((acc, i) => acc + i.risk.riskScore, 0) / Math.max(1, items.length) * 0.9,
    );
    return { low, critical, predicted, expiring, pending, resilience, total: items.length };
  }, [items, transfers]);

  const consumptionTrend = useMemo(() => {
    const byDate = new Map<string, number>();
    demandHistory.forEach((d) => byDate.set(d.date, (byDate.get(d.date) ?? 0) + d.unitsConsumed));
    return [...byDate.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, units]) => ({ date: date.slice(5), units }));
  }, []);

  const forecastData = useMemo(() => {
    const history = consumptionTrend.slice(-14).map((d) => ({ ...d, predicted: undefined as number | undefined }));
    const totalDaily = items.reduce((a, i) => a + i.avgDailyUsage, 0);
    const future = Array.from({ length: 14 }, (_, k) => {
      const d = new Date();
      d.setDate(d.getDate() + k + 1);
      const value = items.reduce(
        (a, i) =>
          a + predictDemand(i, k + 1, emergencyMultiplier) - predictDemand(i, k, emergencyMultiplier),
        0,
      );
      return { date: d.toISOString().slice(5, 10), units: undefined, predicted: Math.round(value) };
    });
    const lastPoint = history[history.length - 1];
    if (lastPoint) lastPoint.predicted = lastPoint.units;
    return { series: [...history, ...future], totalDaily };
  }, [consumptionTrend, items, emergencyMultiplier]);

  const riskDistribution = useMemo(() => {
    const levels = ["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
    const colors = {
      SAFE: "var(--color-success)",
      LOW: "var(--color-info)",
      MEDIUM: "var(--color-warning)",
      HIGH: "var(--color-destructive)",
      CRITICAL: "var(--color-navy)",
    };
    return levels
      .map((l) => ({
        name: l,
        value: items.filter((i) => i.risk.riskLevel === l).length,
        fill: colors[l],
      }))
      .filter((d) => d.value > 0);
  }, [items]);

  const supplierPerf = suppliers.map((s) => ({
    name: s.name.split(" ")[0],
    reliability: s.reliability,
    onTime: s.onTimeRate,
  }));

  const criticalAlerts = alerts
    .filter((a) => a.severity === "Critical" || a.severity === "High")
    .slice(0, 4);
  const recommendations = recommendTransfers(items).slice(0, 4);

  const emergencyStats = {
    demandIncrease: 35,
    criticalMedicines: Math.max(stats.critical, 8),
    hospitalsAffected: 4,
    emergencyStock: 72,
  };

  return (
    <AppShell
      title="Supply Chain Command Center"
      subtitle="AI-Powered Healthcare Supply Chain Resilience Platform"
      actions={
        <Button
          variant={emergencyMode ? "destructive" : "outline"}
          className="gap-2"
          onClick={() => {
            setEmergencyMode(!emergencyMode);
            toast[emergencyMode ? "success" : "warning"](
              emergencyMode ? "Emergency mode deactivated" : "Emergency supply mode activated",
            );
          }}
        >
          <Siren className="size-4" />
          <span className="hidden sm:inline">
            {emergencyMode ? "Exit Emergency" : "Emergency Mode"}
          </span>
        </Button>
      }
    >
      <div className="space-y-5">
        {/* AI Supply Chain Health */}
        <section className="surface-card brand-gradient overflow-hidden p-5 text-primary-foreground sm:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center">
            <div className="lg:w-72">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary-foreground/80">
                <Gauge className="size-4" /> AI Supply Chain Health
              </p>
              <p className="mt-3 text-5xl font-extrabold tabular-nums">{stats.resilience}%</p>
              <p className="text-sm text-primary-foreground/80">Overall Resilience Score</p>
              <Progress
                value={stats.resilience}
                className="mt-3 h-2 bg-white/20 [&>div]:bg-white"
              />
            </div>
            <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: "Predicted Shortages", value: stats.predicted },
                { label: "Critical Medicines", value: stats.critical },
                { label: "Expiring Soon", value: stats.expiring },
                { label: "Pending Transfers", value: stats.pending },
              ].map((s) => (
                <div key={s.label} className="rounded-xl bg-white/12 p-3 backdrop-blur">
                  <p className="text-2xl font-extrabold tabular-nums">{s.value}</p>
                  <p className="text-[11px] text-primary-foreground/80">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {emergencyMode && (
          <section className="surface-card border-destructive/40 bg-destructive/5 p-5">
            <div className="flex items-center gap-2 text-destructive">
              <Siren className="size-5 animate-pulse" />
              <h2 className="text-sm font-extrabold uppercase tracking-widest">
                Emergency Supply Mode
              </h2>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { label: "Demand Increase", value: `${emergencyStats.demandIncrease}%` },
                { label: "Critical Medicines", value: emergencyStats.criticalMedicines },
                { label: "Hospitals Affected", value: emergencyStats.hospitalsAffected },
                { label: "Available Emergency Stock", value: `${emergencyStats.emergencyStock}%` },
              ].map((s) => (
                <div key={s.label} className="rounded-xl border border-destructive/20 bg-card p-3">
                  <p className="text-xl font-extrabold text-destructive tabular-nums">{s.value}</p>
                  <p className="text-[11px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {[
                ...recommendations.slice(0, 2).map((r) => r.text),
                "Prioritize critical medicines for distribution over routine restocking.",
                "Increase supplier orders by 35% for antibiotics and respiratory categories.",
              ].map((t) => (
                <li key={t} className="flex gap-2">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <span>{t}</span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* KPI cards */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Total Medicines" value={stats.total} icon={Boxes} hint="Tracked batches" />
          <StatCard label="Low Stock" value={stats.low} icon={TrendingUp} tone="warning" />
          <StatCard label="Critical Stock" value={stats.critical} icon={PackageX} tone="danger" />
          <StatCard
            label="Predicted Shortages"
            value={stats.predicted}
            icon={Activity}
            tone="danger"
            hint="Next 7 days"
          />
          <StatCard
            label="Expiring Soon"
            value={stats.expiring}
            icon={CalendarClock}
            tone="warning"
            hint="Within 45 days"
          />
          <StatCard
            label="Pending Transfers"
            value={stats.pending}
            icon={ArrowLeftRight}
            tone="info"
          />
        </div>

        {/* Charts */}
        <div className="grid gap-4 xl:grid-cols-2">
          <SectionCard
            title="Medicine Consumption Trend"
            description="Total units consumed across the hospital network (30 days)"
          >
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={consumptionTrend}>
                <defs>
                  <linearGradient id="grad-units" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area
                  type="monotone"
                  dataKey="units"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  fill="url(#grad-units)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard
            title="AI Demand Forecast"
            description="Actual vs. model-predicted network demand (next 14 days)"
          >
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={forecastData.series}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  name="Actual"
                  dataKey="units"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  name="AI Forecast"
                  dataKey="predicted"
                  stroke="var(--color-warning)"
                  strokeWidth={2.5}
                  strokeDasharray="5 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard
            title="Inventory Risk Distribution"
            description="Batches grouped by AI risk level"
          >
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={3}
                >
                  {riskDistribution.map((d) => (
                    <Cell key={d.name} fill={d.fill} />
                  ))}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard
            title="Supplier Delivery Performance"
            description="Reliability and on-time delivery rate"
          >
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={supplierPerf}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar
                  name="Reliability %"
                  dataKey="reliability"
                  fill="var(--color-primary)"
                  radius={[6, 6, 0, 0]}
                />
                <Bar
                  name="On-time %"
                  dataKey="onTime"
                  fill="var(--color-success)"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </SectionCard>
        </div>

        {/* Alerts + recommendations */}
        <div className="grid gap-4 xl:grid-cols-2">
          <SectionCard
            title="Critical Alerts"
            description="Issues needing attention today"
            action={
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/alerts">
                  View all <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            }
          >
            <div className="space-y-2.5">
              {criticalAlerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-start gap-3 rounded-xl border border-border p-3"
                >
                  <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{a.message}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{a.type}</p>
                  </div>
                  <SeverityBadge severity={a.severity} />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="AI Recommendations"
            description="Suggested redistribution and reorder actions"
            action={
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/transfers">
                  Transfers <ArrowRight className="size-3.5" />
                </Link>
              </Button>
            }
          >
            <div className="space-y-2.5">
              {recommendations.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No redistribution needed — all hospitals hold safe buffers.
                </p>
              )}
              {recommendations.map((r) => (
                <div
                  key={r.id}
                  className="flex items-start gap-3 rounded-xl border border-primary/20 bg-primary/5 p-3"
                >
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  <p className="flex-1 text-sm font-medium">{r.text}</p>
                  <span className="rounded-full bg-primary/12 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {r.urgency}
                  </span>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        {/* Story strip */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              k: "Problem",
              v: "Medicine shortages and uneven distribution across hospitals.",
            },
            { k: "AI", v: "Forecast future demand and score shortage risk per batch." },
            { k: "Action", v: "Recommend reorders and hospital-to-hospital transfers." },
            { k: "Impact", v: "Fewer emergency stock-outs and less expiry wastage." },
          ].map((s) => (
            <div key={s.k} className="surface-card p-4">
              <p className="text-[11px] font-bold uppercase tracking-widest text-primary">{s.k}</p>
              <p className="mt-1.5 text-sm text-muted-foreground">{s.v}</p>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

export const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid var(--color-border)",
  background: "var(--color-card)",
  fontSize: 12,
  boxShadow: "var(--shadow-card)",
};
