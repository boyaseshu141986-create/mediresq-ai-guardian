import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EmptyState, SectionCard, StatusBadge } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { hospitals, medicines, useStore } from "@/lib/store";
import type { Transfer, TransferStatus } from "@/lib/types";

export const Route = createFileRoute("/transfers")({
  head: () => ({
    meta: [
      { title: "Transfers — MediResQ AI" },
      {
        name: "description",
        content:
          "Create, approve and track hospital-to-hospital medicine transfers with priority and status workflow.",
      },
      { property: "og:title", content: "Transfers — MediResQ AI" },
      {
        property: "og:description",
        content: "Hospital-to-hospital medicine transfer management.",
      },
    ],
  }),
  component: TransfersPage,
});

const statuses: TransferStatus[] = ["Pending", "Approved", "In Transit", "Completed"];
const nextStatus: Record<TransferStatus, TransferStatus | null> = {
  Pending: "Approved",
  Approved: "In Transit",
  "In Transit": "Completed",
  Completed: null,
};

function TransfersPage() {
  const { transfers, addTransfer, updateTransferStatus } = useStore();
  const [form, setForm] = useState({
    from: "h1",
    to: "h2",
    medicineId: "m2",
    quantity: "100",
    priority: "High" as Transfer["priority"],
    reason: "",
  });
  const [confirm, setConfirm] = useState<Transfer | null>(null);
  const [filter, setFilter] = useState<"all" | TransferStatus>("all");

  const visible = transfers.filter((t) => filter === "all" || t.status === filter);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.from === form.to) return toast.error("Source and destination must differ.");
    if (!Number(form.quantity)) return toast.error("Enter a valid quantity.");
    addTransfer({
      fromHospitalId: form.from,
      toHospitalId: form.to,
      medicineId: form.medicineId,
      quantity: Number(form.quantity),
      priority: form.priority,
      reason: form.reason || "Manual transfer request",
    });
    toast.success("Transfer request submitted");
    setForm({ ...form, quantity: "100", reason: "" });
  };

  const name = (id: string) => hospitals.find((h) => h.id === id)?.name ?? "—";
  const med = (id: string) => medicines.find((m) => m.id === id)?.name ?? "—";

  return (
    <AppShell title="Transfers" subtitle="Hospital-to-hospital medicine redistribution">
      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <SectionCard title="New transfer request" description="Move stock between hospitals">
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs">From Hospital</Label>
              <Select value={form.from} onValueChange={(v) => setForm({ ...form, from: v })}>
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
            <div className="space-y-1.5">
              <Label className="text-xs">To Hospital</Label>
              <Select value={form.to} onValueChange={(v) => setForm({ ...form, to: v })}>
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
            <div className="space-y-1.5">
              <Label className="text-xs">Medicine</Label>
              <Select
                value={form.medicineId}
                onValueChange={(v) => setForm({ ...form, medicineId: v })}
              >
                <SelectTrigger>
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
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Quantity</Label>
                <Input
                  type="number"
                  value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Priority</Label>
                <Select
                  value={form.priority}
                  onValueChange={(v) => setForm({ ...form, priority: v as Transfer["priority"] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Low", "Normal", "High", "Emergency"].map((p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Reason</Label>
              <Textarea
                rows={3}
                placeholder="Why is this transfer needed?"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full gap-2">
              <Plus className="size-4" /> Submit request
            </Button>
          </form>
        </SectionCard>

        <SectionCard
          title="Transfer pipeline"
          description={`${transfers.length} total requests`}
          action={
            <Select value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          }
        >
          {visible.length === 0 ? (
            <EmptyState title="No transfers in this state" />
          ) : (
            <div className="space-y-2.5">
              {visible.map((t) => (
                <div key={t.id} className="rounded-xl border border-border p-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                      <span>{med(t.medicineId)}</span>
                      <span className="text-muted-foreground">· {t.quantity.toLocaleString()} units</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={
                          t.priority === "Emergency"
                            ? "rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-bold text-destructive"
                            : "rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
                        }
                      >
                        {t.priority}
                      </span>
                      <StatusBadge status={t.status} />
                    </div>
                  </div>
                  <p className="mt-2 flex flex-wrap items-center gap-1.5 text-sm">
                    <span>{name(t.fromHospitalId)}</span>
                    <ArrowRight className="size-3.5 text-primary" />
                    <span>{name(t.toHospitalId)}</span>
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {t.reason} · raised {t.createdAt}
                  </p>
                  {nextStatus[t.status] && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-3"
                      onClick={() => setConfirm(t)}
                    >
                      Mark as {nextStatus[t.status]}
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      <AlertDialog open={!!confirm} onOpenChange={(o) => !o && setConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Update transfer status?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirm &&
                `${med(confirm.medicineId)} (${confirm.quantity} units) from ${name(confirm.fromHospitalId)} to ${name(confirm.toHospitalId)} will move to "${nextStatus[confirm.status]}".`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirm) {
                  const next = nextStatus[confirm.status];
                  if (next) {
                    updateTransferStatus(confirm.id, next);
                    toast.success(`Transfer marked as ${next}`);
                  }
                }
                setConfirm(null);
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
