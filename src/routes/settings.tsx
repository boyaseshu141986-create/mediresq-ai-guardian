import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Database, Server, Siren } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { SectionCard } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { hospitals, useStore } from "@/lib/store";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MediResQ AI" },
      {
        name: "description",
        content:
          "Configure the default hospital, alert thresholds, emergency mode and the AI prediction service endpoint.",
      },
      { property: "og:title", content: "Settings — MediResQ AI" },
      {
        property: "og:description",
        content: "Platform configuration for MediResQ AI.",
      },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { session, emergencyMode, setEmergencyMode } = useStore();
  const [hospital, setHospital] = useState("h1");
  const [threshold, setThreshold] = useState("14");
  const [expiryWindow, setExpiryWindow] = useState("30");
  const [notify, setNotify] = useState(true);

  return (
    <AppShell title="Settings" subtitle="Platform configuration">
      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Profile" description="Signed-in account">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Name</Label>
              <Input readOnly value={session?.name ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input readOnly value={session?.email ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Primary hospital</Label>
              <Select value={hospital} onValueChange={setHospital}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {hospitals.map((h) => (
                    <SelectItem key={h.id} value={h.id}>
                      {h.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Risk thresholds" description="Tune when the engine raises alerts">
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Low-cover warning (days of stock)</Label>
              <Input
                type="number"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Expiry warning window (days)</Label>
              <Input
                type="number"
                value={expiryWindow}
                onChange={(e) => setExpiryWindow(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border p-3">
              <div>
                <p className="text-sm font-medium">Critical alert notifications</p>
                <p className="text-xs text-muted-foreground">Toast alerts for critical risk items</p>
              </div>
              <Switch checked={notify} onCheckedChange={setNotify} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-destructive/25 bg-destructive/5 p-3">
              <div className="flex items-center gap-2">
                <Siren className="size-4 text-destructive" />
                <div>
                  <p className="text-sm font-medium">Emergency supply mode</p>
                  <p className="text-xs text-muted-foreground">Raises demand projections by 35%</p>
                </div>
              </div>
              <Switch checked={emergencyMode} onCheckedChange={setEmergencyMode} />
            </div>
            <Button onClick={() => toast.success("Settings saved")}>Save settings</Button>
          </div>
        </SectionCard>

        <SectionCard
          title="AI prediction service"
          description="Where forecasts come from"
          className="xl:col-span-2"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-border p-3.5">
              <Server className="mt-0.5 size-4 text-primary" />
              <div>
                <p className="text-sm font-semibold">MediResQ-Forecast v0.9 (demo)</p>
                <p className="text-xs text-muted-foreground">
                  Runs in the browser using the built-in risk engine. Swap in a Python FastAPI +
                  scikit-learn endpoint later — the prediction service is a single module with a
                  fixed response shape.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-border p-3.5">
              <Database className="mt-0.5 size-4 text-primary" />
              <div>
                <p className="text-sm font-semibold">Demo data source</p>
                <p className="text-xs text-muted-foreground">
                  4 hospitals, 8 medicines, 3 suppliers, 22 inventory batches and 480 demand
                  records. Connect a hosted database to persist changes across sessions.
                </p>
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
}
