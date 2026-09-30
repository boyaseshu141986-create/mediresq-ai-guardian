import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowLeftRight, Pencil, Plus, RefreshCw, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { EmptyState, RiskBadge } from "@/components/ui-bits";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { hospitals, medicines, suppliers, useStore, type EnrichedItem } from "@/lib/store";

export const Route = createFileRoute("/inventory")({
  head: () => ({
    meta: [
      { title: "Inventory — MediResQ AI" },
      {
        name: "description",
        content:
          "Search, filter and manage hospital medicine batches with live risk scoring, expiry tracking and transfer actions.",
      },
      { property: "og:title", content: "Inventory — MediResQ AI" },
      {
        property: "og:description",
        content: "Hospital medicine batch inventory with AI risk scoring and expiry tracking.",
      },
    ],
  }),
  component: InventoryPage,
});

const emptyForm = {
  medicineId: "m1",
  hospitalId: "h1",
  supplierId: "s1",
  batchNumber: "",
  currentStock: "",
  minStock: "",
  maxStock: "",
  expiryDate: "",
  avgDailyUsage: "",
};

function InventoryPage() {
  const { items, addItem, updateItem, deleteItem, addTransfer } = useStore();
  const [query, setQuery] = useState("");
  const [hospitalFilter, setHospitalFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [openForm, setOpenForm] = useState(false);
  const [editing, setEditing] = useState<EnrichedItem | null>(null);
  const [form, setForm] = useState({ ...emptyForm });
  const [deleteTarget, setDeleteTarget] = useState<EnrichedItem | null>(null);

  const filtered = useMemo(
    () =>
      items.filter((i) => {
        const q = query.toLowerCase();
        const matchQ =
          !q ||
          i.medicineName.toLowerCase().includes(q) ||
          i.batchNumber.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          i.hospitalName.toLowerCase().includes(q);
        const matchH = hospitalFilter === "all" || i.hospitalId === hospitalFilter;
        const matchR = riskFilter === "all" || i.risk.riskLevel === riskFilter;
        return matchQ && matchH && matchR;
      }),
    [items, query, hospitalFilter, riskFilter],
  );

  const openAdd = () => {
    setEditing(null);
    setForm({ ...emptyForm, expiryDate: "" });
    setOpenForm(true);
  };

  const openEdit = (item: EnrichedItem) => {
    setEditing(item);
    setForm({
      medicineId: item.medicineId,
      hospitalId: item.hospitalId,
      supplierId: item.supplierId,
      batchNumber: item.batchNumber,
      currentStock: String(item.currentStock),
      minStock: String(item.minStock),
      maxStock: String(item.maxStock),
      expiryDate: item.expiryDate,
      avgDailyUsage: String(item.avgDailyUsage),
    });
    setOpenForm(true);
  };

  const save = () => {
    if (!form.batchNumber || !form.currentStock || !form.expiryDate) {
      toast.error("Batch number, quantity and expiry date are required.");
      return;
    }
    const payload = {
      medicineId: form.medicineId,
      hospitalId: form.hospitalId,
      supplierId: form.supplierId,
      batchNumber: form.batchNumber,
      currentStock: Number(form.currentStock),
      minStock: Number(form.minStock) || 0,
      maxStock: Number(form.maxStock) || Number(form.currentStock) * 2,
      expiryDate: form.expiryDate,
      avgDailyUsage: Number(form.avgDailyUsage) || 1,
      demandGrowth: editing?.demandGrowth ?? 0.06,
    };
    if (editing) {
      updateItem(editing.id, payload);
      toast.success("Batch updated");
    } else {
      addItem(payload);
      toast.success("Medicine added to inventory");
    }
    setOpenForm(false);
  };

  return (
    <AppShell
      title="Inventory"
      subtitle="All medicine batches across the hospital network"
      actions={
        <Button className="gap-2" onClick={openAdd}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">Add Medicine</span>
        </Button>
      }
    >
      <div className="surface-card p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search medicine, batch, category or hospital…"
              className="pl-9"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <Select value={hospitalFilter} onValueChange={setHospitalFilter}>
            <SelectTrigger className="md:w-52">
              <SelectValue placeholder="Hospital" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All hospitals</SelectItem>
              {hospitals.map((h) => (
                <SelectItem key={h.id} value={h.id}>
                  {h.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger className="md:w-40">
              <SelectValue placeholder="Risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risk levels</SelectItem>
              {["SAFE", "LOW", "MEDIUM", "HIGH", "CRITICAL"].map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-4 overflow-x-auto">
          {filtered.length === 0 ? (
            <EmptyState
              title="No matching batches"
              description="Try a different search term or clear the filters."
            />
          ) : (
            <table className="w-full min-w-[1000px] text-sm">
              <thead>
                <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
                  {[
                    "Medicine",
                    "Category",
                    "Batch",
                    "Hospital",
                    "Current",
                    "Minimum",
                    "Expiry",
                    "Daily Usage",
                    "Risk",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="whitespace-nowrap px-3 py-2.5 font-semibold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => (
                  <tr key={i.id} className="border-b border-border/70 hover:bg-muted/50">
                    <td className="px-3 py-3 font-semibold">{i.medicineName}</td>
                    <td className="px-3 py-3 text-muted-foreground">{i.category}</td>
                    <td className="px-3 py-3 font-mono text-xs">{i.batchNumber}</td>
                    <td className="whitespace-nowrap px-3 py-3">{i.hospitalName}</td>
                    <td className="px-3 py-3 tabular-nums font-semibold">
                      {i.currentStock.toLocaleString()}
                    </td>
                    <td className="px-3 py-3 tabular-nums text-muted-foreground">
                      {i.minStock.toLocaleString()}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3">
                      <span
                        className={
                          i.risk.daysToExpiry <= 30 ? "font-semibold text-destructive" : undefined
                        }
                      >
                        {i.expiryDate}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">
                        {i.risk.daysToExpiry} days left
                      </span>
                    </td>
                    <td className="px-3 py-3 tabular-nums">{i.avgDailyUsage}/day</td>
                    <td className="px-3 py-3">
                      <RiskBadge level={i.risk.riskLevel} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          aria-label="Edit"
                          onClick={() => openEdit(i)}
                        >
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          aria-label="Transfer"
                          onClick={() => {
                            const donor = items
                              .filter((x) => x.medicineId === i.medicineId && x.id !== i.id)
                              .sort((a, b) => b.currentStock - a.currentStock)[0];
                            if (!donor) {
                              toast.error("No other hospital stocks this medicine.");
                              return;
                            }
                            addTransfer({
                              fromHospitalId: donor.hospitalId,
                              toHospitalId: i.hospitalId,
                              medicineId: i.medicineId,
                              quantity: Math.max(10, i.risk.recommendedOrderQty || 50),
                              priority: i.risk.riskLevel === "CRITICAL" ? "Emergency" : "High",
                              reason: `Replenish ${i.medicineName} at ${i.hospitalName}`,
                            });
                            toast.success("Transfer request created");
                          }}
                        >
                          <ArrowLeftRight className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8"
                          aria-label="Reorder"
                          onClick={() => {
                            const qty = i.risk.recommendedOrderQty || 100;
                            updateItem(i.id, { currentStock: i.currentStock + qty });
                            toast.success(
                              `Reorder placed: ${qty.toLocaleString()} ${i.unit} of ${i.medicineName}`,
                            );
                          }}
                        >
                          <RefreshCw className="size-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-8 text-destructive"
                          aria-label="Delete"
                          onClick={() => setDeleteTarget(i)}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Dialog open={openForm} onOpenChange={setOpenForm}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Batch" : "Add Medicine"}</DialogTitle>
            <DialogDescription>
              Batch-level stock record used by the AI risk engine.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Medicine Name">
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
            </Field>
            <Field label="Category">
              <Input
                readOnly
                value={medicines.find((m) => m.id === form.medicineId)?.category ?? ""}
              />
            </Field>
            <Field label="Batch Number">
              <Input
                value={form.batchNumber}
                placeholder="BX-2026001"
                onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
              />
            </Field>
            <Field label="Quantity">
              <Input
                type="number"
                value={form.currentStock}
                onChange={(e) => setForm({ ...form, currentStock: e.target.value })}
              />
            </Field>
            <Field label="Minimum Stock">
              <Input
                type="number"
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: e.target.value })}
              />
            </Field>
            <Field label="Maximum Stock">
              <Input
                type="number"
                value={form.maxStock}
                onChange={(e) => setForm({ ...form, maxStock: e.target.value })}
              />
            </Field>
            <Field label="Average Daily Usage">
              <Input
                type="number"
                value={form.avgDailyUsage}
                onChange={(e) => setForm({ ...form, avgDailyUsage: e.target.value })}
              />
            </Field>
            <Field label="Expiry Date">
              <Input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm({ ...form, expiryDate: e.target.value })}
              />
            </Field>
            <Field label="Supplier">
              <Select
                value={form.supplierId}
                onValueChange={(v) => setForm({ ...form, supplierId: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Hospital">
              <Select
                value={form.hospitalId}
                onValueChange={(v) => setForm({ ...form, hospitalId: v })}
              >
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
            </Field>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenForm(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save changes" : "Add medicine"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this batch?</AlertDialogTitle>
            <AlertDialogDescription>
              {deleteTarget &&
                `${deleteTarget.medicineName} (${deleteTarget.batchNumber}) at ${deleteTarget.hospitalName} will be removed from inventory.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteTarget) {
                  deleteItem(deleteTarget.id);
                  toast.success("Batch deleted");
                }
                setDeleteTarget(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
