import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Brain, Loader2, Sparkles, TrendingUp } from "lucide-react";
import {
  Area,
  ComposedChart,
  CartesianGrid,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { RiskBadge, SectionCard, StatCard, chartTooltipStyle } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { demandHistory, useStore } from "@/lib/store";
import { buildForecastSeries, getForecast, type ForecastPoint } from "@/lib/ai-service";
import { Activity, Boxes, CalendarRange, Percent, ShoppingCart } from "lucide-react";

export const Route = createFileRoute("/predictions")({
  head: () => ({
    meta: [
      { title: "AI Predictions — MediResQ AI" },
      {
        name: "description",
        content:
          "Forecast 7-day and 30-day medicine demand, shortage probability and recommended order quantities per hospital batch.",
      },
      { property: "og:title", content: "AI Predictions — MediResQ AI" },
      {
        property: "og:description",
        content: "Medicine demand forecasting and shortage-risk scoring for hospitals.",
      },
    ],
  }),
  component: PredictionsPage,
});

function PredictionsPage() {
  const { items, emergencyMultiplier, addTransfer } = useStore();
  const [selectedId, setSelectedId] = useState<string>(
    () => [...items].sort((a, b) => b.risk.riskScore - a.risk.riskScore)[0]?.id ?? "",
  );
  const [series, setSeries] = useState<ForecastPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("MediResQ-Forecast v0.9 (demo)");

  const item = items.find((i) => i.id === selectedId) ?? items[0];

  const history = useMemo(
    () =>
      demandHistory
        .filter((d) => d.medicineId === item?.medicineId && d.hospitalId === item?.hospitalId)
        .map((d) => ({ date: d.date, unitsConsumed: d.unitsConsumed })),
    [item],
  );

  useEffect(() => {
    if (item) setSeries(buildForecastSeries(item, history, emergencyMultiplier));
  }, [item, history, emergencyMultiplier]);

  const generate = async () => {
    if (!item) return;
    setLoading(true);
    const res = await getForecast(item, history, emergencyMultiplier);
    setSeries(res.series);
    setModel(res.model);
    setLoading(false);
    toast.success(`Prediction generated for ${item.medicineName}`);
  };

  if (!item) {
    return (
      <AppShell title="AI Predictions" subtitle="Demand forecasting">
        <p className="text-sm text-muted-foreground">Add inventory to generate predictions.</p>
      </AppShell>
    );
  }

  const r = item.risk;

  return (
    <AppShell
      title="AI Predictions"
      subtitle={`${model} — forecasting demand and shortage risk`}
      actions={
        <Button className="gap-2" onClick={generate} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Brain className="size-4" />}
          <span className="hidden sm:inline">Generate AI Prediction</span>
        </Button>
      }
    >
      <div className="space-y-5">
        <div className="surface-card flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <span className="text-sm font-semibold">Select medicine batch</span>
          <Select value={selectedId} onValueChange={setSelectedId}>
            <SelectTrigger className="sm:w-[420px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {items.map((i) => (
                <SelectItem key={i.id} value={i.id}>
                  {i.medicineName} — {i.hospitalName} ({i.batchNumber})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="sm:ml-auto">
            <RiskBadge level={r.riskLevel} />
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
          <StatCard
            label="Current Stock"
            value={item.currentStock.toLocaleString()}
            hint={item.unit}
            icon={Boxes}
          />
          <StatCard
            label="Avg Daily Usage"
            value={item.avgDailyUsage}
            hint={`${r.daysOfCover} days of cover`}
            icon={Activity}
            tone="info"
          />
          <StatCard
            label="Predicted 7-Day"
            value={r.predicted7Day.toLocaleString()}
            icon={TrendingUp}
            tone="warning"
          />
          <StatCard
            label="Predicted 30-Day"
            value={r.predicted30Day.toLocaleString()}
            icon={CalendarRange}
            tone="warning"
          />
          <StatCard
            label="Shortage Probability"
            value={`${r.shortageProbability}%`}
            icon={Percent}
            tone={r.shortageProbability > 60 ? "danger" : "success"}
          />
          <StatCard
            label="Recommended Order"
            value={r.recommendedOrderQty.toLocaleString()}
            hint={item.unit}
            icon={ShoppingCart}
            tone="primary"
          />
        </div>

        <SectionCard
          title={`Demand forecast — ${item.medicineName} at ${item.hospitalName}`}
          description="Last 21 days of actual consumption and the next 14 days of predicted demand with a confidence band"
        >
          {loading ? (
            <Skeleton className="h-[320px] w-full rounded-xl" />
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <ComposedChart data={series}>
                <defs>
                  <linearGradient id="band" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-warning)" stopOpacity={0.25} />
                    <stop offset="100%" stopColor="var(--color-warning)" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} width={40} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Area
                  type="monotone"
                  name="Upper bound"
                  dataKey="upper"
                  stroke="none"
                  fill="url(#band)"
                />
                <Line
                  type="monotone"
                  name="Actual demand"
                  dataKey="actual"
                  stroke="var(--color-primary)"
                  strokeWidth={2.5}
                  dot={false}
                />
                <Line
                  type="monotone"
                  name="Predicted demand"
                  dataKey="predicted"
                  stroke="var(--color-warning)"
                  strokeWidth={2.5}
                  strokeDasharray="5 4"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard title="Risk breakdown" description="Weighted components of the risk score">
            <div className="space-y-4">
              {[
                { label: "Shortage risk", value: r.shortageRisk },
                { label: "Demand risk", value: r.demandRisk },
                { label: "Expiry risk", value: r.expiryRisk },
                { label: "Overall risk", value: r.riskScore },
              ].map((b) => (
                <div key={b.label}>
                  <div className="mb-1 flex justify-between text-xs">
                    <span className="font-medium">{b.label}</span>
                    <span className="tabular-nums text-muted-foreground">{b.value}%</span>
                  </div>
                  <Progress value={b.value} className="h-2" />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard
            title="AI recommendation"
            description="Generated from stock, usage, growth and expiry signals"
            className="lg:col-span-2"
          >
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="mt-0.5 size-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">{r.recommendedAction}</p>
                  <p className="mt-1.5 text-sm text-muted-foreground">
                    {item.medicineName} at {item.hospitalName} holds{" "}
                    {item.currentStock.toLocaleString()} {item.unit} against a predicted 7-day demand
                    of {r.predicted7Day.toLocaleString()} {item.unit}
                    {r.projectedShortfall > 0
                      ? ` — a projected shortfall of ${r.projectedShortfall.toLocaleString()} ${item.unit}.`
                      : " — cover is sufficient for the next week."}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => toast.success(`Order raised for ${r.recommendedOrderQty} ${item.unit}`)}
                >
                  Order {r.recommendedOrderQty.toLocaleString()} {item.unit}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const donor = items
                      .filter((x) => x.medicineId === item.medicineId && x.id !== item.id)
                      .sort((a, b) => b.currentStock - a.currentStock)[0];
                    if (!donor) {
                      toast.error("No other hospital stocks this medicine.");
                      return;
                    }
                    addTransfer({
                      fromHospitalId: donor.hospitalId,
                      toHospitalId: item.hospitalId,
                      medicineId: item.medicineId,
                      quantity: Math.max(10, r.recommendedOrderQty || 50),
                      priority: r.riskLevel === "CRITICAL" ? "Emergency" : "High",
                      reason: `AI prediction: ${r.shortageProbability}% shortage probability`,
                    });
                    toast.success("Transfer request created");
                  }}
                >
                  Request transfer instead
                </Button>
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </AppShell>
  );
}
