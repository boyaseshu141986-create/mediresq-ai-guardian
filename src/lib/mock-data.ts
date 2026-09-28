import type {
  DemandRecord,
  Hospital,
  InventoryItem,
  Medicine,
  Supplier,
  SupplyAlert,
  Transfer,
} from "./types";

/**
 * Demo dataset for MediResQ AI.
 * Swap this module for a Supabase/FastAPI data source later —
 * the rest of the app only consumes the exported arrays.
 */

export const hospitals: Hospital[] = [
  { id: "h1", name: "CityCare Hospital", city: "Bengaluru", beds: 620, type: "Multi-speciality" },
  { id: "h2", name: "Sunrise Hospital", city: "Hyderabad", beds: 340, type: "General" },
  { id: "h3", name: "LifeLine Hospital", city: "Chennai", beds: 480, type: "Trauma & Critical" },
  { id: "h4", name: "MediPlus Hospital", city: "Pune", beds: 260, type: "Community" },
];

export const medicines: Medicine[] = [
  { id: "m1", name: "Paracetamol", category: "Analgesic", unit: "tablets" },
  { id: "m2", name: "Insulin", category: "Hormone", unit: "units" },
  { id: "m3", name: "Amoxicillin", category: "Antibiotic", unit: "capsules" },
  { id: "m4", name: "Azithromycin", category: "Antibiotic", unit: "tablets" },
  { id: "m5", name: "ORS", category: "Electrolyte", unit: "sachets" },
  { id: "m6", name: "Salbutamol", category: "Respiratory", unit: "inhalers" },
  { id: "m7", name: "Ceftriaxone", category: "Antibiotic", unit: "vials" },
  { id: "m8", name: "Metformin", category: "Antidiabetic", unit: "tablets" },
];

export const suppliers: Supplier[] = [
  {
    id: "s1",
    name: "MedSupply India",
    categories: ["Analgesic", "Antibiotic", "Electrolyte"],
    avgDeliveryDays: 2.4,
    reliability: 94,
    currentOrders: 12,
    status: "Active",
    contact: "orders@medsupply.in",
    onTimeRate: 92,
  },
  {
    id: "s2",
    name: "HealthCore",
    categories: ["Hormone", "Antidiabetic", "Respiratory"],
    avgDeliveryDays: 3.8,
    reliability: 88,
    currentOrders: 9,
    status: "Active",
    contact: "supply@healthcore.com",
    onTimeRate: 85,
  },
  {
    id: "s3",
    name: "PharmaConnect",
    categories: ["Antibiotic", "Respiratory", "Analgesic"],
    avgDeliveryDays: 5.6,
    reliability: 71,
    currentOrders: 6,
    status: "Delayed",
    contact: "logistics@pharmaconnect.co",
    onTimeRate: 64,
  },
];

const daysFromNow = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

type Seed = [
  medicineId: string,
  hospitalId: string,
  supplierId: string,
  currentStock: number,
  minStock: number,
  maxStock: number,
  expiryInDays: number,
  avgDailyUsage: number,
  demandGrowth: number,
];

const seeds: Seed[] = [
  ["m1", "h1", "s1", 4200, 1500, 6000, 320, 180, 0.04],
  ["m1", "h2", "s1", 900, 1000, 4000, 95, 140, 0.18],
  ["m1", "h3", "s3", 2600, 1200, 5000, 210, 155, 0.06],
  ["m2", "h1", "s2", 500, 200, 900, 180, 34, 0.05],
  ["m2", "h2", "s2", 40, 150, 700, 240, 27, 0.32],
  ["m2", "h3", "s2", 280, 160, 800, 150, 30, 0.09],
  ["m2", "h4", "s2", 150, 140, 600, 60, 26, 0.21],
  ["m3", "h1", "s1", 1800, 800, 3000, 110, 96, 0.11],
  ["m3", "h2", "s3", 420, 600, 2500, 75, 88, 0.27],
  ["m3", "h4", "s1", 1150, 500, 2200, 25, 62, 0.08],
  ["m4", "h1", "s3", 760, 600, 2400, 40, 70, 0.14],
  ["m4", "h3", "s1", 1900, 700, 3200, 260, 74, 0.03],
  ["m5", "h2", "s1", 3100, 900, 4500, 190, 120, 0.02],
  ["m5", "h4", "s1", 680, 700, 2600, 28, 95, 0.22],
  ["m6", "h1", "s2", 210, 90, 450, 140, 14, 0.07],
  ["m6", "h3", "s3", 62, 100, 400, 85, 18, 0.29],
  ["m7", "h1", "s1", 540, 250, 1100, 70, 46, 0.12],
  ["m7", "h2", "s3", 180, 220, 900, 33, 41, 0.24],
  ["m7", "h4", "s1", 410, 200, 850, 175, 33, 0.05],
  ["m8", "h1", "s2", 3300, 1200, 5200, 300, 150, 0.03],
  ["m8", "h3", "s2", 1450, 1000, 4200, 120, 138, 0.16],
  ["m8", "h4", "s2", 760, 800, 3000, 48, 102, 0.19],
];

export const inventory: InventoryItem[] = seeds.map((s, i) => ({
  id: `inv${i + 1}`,
  medicineId: s[0],
  hospitalId: s[1],
  supplierId: s[2],
  batchNumber: `BX-${2026}${String(i + 11).padStart(3, "0")}`,
  currentStock: s[3],
  minStock: s[4],
  maxStock: s[5],
  expiryDate: daysFromNow(s[6]),
  avgDailyUsage: s[7],
  demandGrowth: s[8],
}));

/** Deterministic pseudo-random so charts look realistic but stable across renders. */
const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
};

export const demandHistory: DemandRecord[] = (() => {
  const records: DemandRecord[] = [];
  let n = 0;
  medicines.forEach((med, mi) => {
    const hospitalsForMed = inventory.filter((i) => i.medicineId === med.id);
    hospitalsForMed.slice(0, 2).forEach((inv, hi) => {
      for (let d = 29; d >= 0; d--) {
        const date = new Date();
        date.setDate(date.getDate() - d);
        const base = inv.avgDailyUsage;
        const seasonal = Math.sin((d / 30) * Math.PI * 2) * base * 0.12;
        const noise = (rand(mi * 100 + hi * 30 + d) - 0.5) * base * 0.22;
        const trend = (30 - d) * base * (inv.demandGrowth / 60);
        records.push({
          id: `dh${++n}`,
          medicineId: med.id,
          hospitalId: inv.hospitalId,
          date: date.toISOString().slice(0, 10),
          unitsConsumed: Math.max(1, Math.round(base + seasonal + noise + trend)),
        });
      }
    });
  });
  return records;
})();

export const initialTransfers: Transfer[] = [
  {
    id: "t1",
    fromHospitalId: "h1",
    toHospitalId: "h2",
    medicineId: "m2",
    quantity: 100,
    priority: "Emergency",
    reason: "Predicted insulin stock-out within 4 days",
    status: "In Transit",
    createdAt: daysFromNow(-1),
  },
  {
    id: "t2",
    fromHospitalId: "h3",
    toHospitalId: "h4",
    medicineId: "m7",
    quantity: 120,
    priority: "High",
    reason: "Ceftriaxone below minimum threshold",
    status: "Approved",
    createdAt: daysFromNow(-2),
  },
  {
    id: "t3",
    fromHospitalId: "h1",
    toHospitalId: "h3",
    medicineId: "m6",
    quantity: 60,
    priority: "High",
    reason: "Respiratory demand spike after seasonal surge",
    status: "Pending",
    createdAt: daysFromNow(-1),
  },
  {
    id: "t4",
    fromHospitalId: "h2",
    toHospitalId: "h4",
    medicineId: "m5",
    quantity: 400,
    priority: "Normal",
    reason: "ORS surplus redistribution",
    status: "Completed",
    createdAt: daysFromNow(-6),
  },
  {
    id: "t5",
    fromHospitalId: "h1",
    toHospitalId: "h2",
    medicineId: "m3",
    quantity: 300,
    priority: "High",
    reason: "Amoxicillin shortfall at Sunrise Hospital",
    status: "Pending",
    createdAt: daysFromNow(0),
  },
  {
    id: "t6",
    fromHospitalId: "h3",
    toHospitalId: "h2",
    medicineId: "m1",
    quantity: 800,
    priority: "Normal",
    reason: "Paracetamol buffer top-up",
    status: "Pending",
    createdAt: daysFromNow(0),
  },
];

export const initialAlerts: SupplyAlert[] = [
  {
    id: "a1",
    type: "Predicted Shortage",
    severity: "Critical",
    message: "Insulin predicted to run out in 4 days at Sunrise Hospital.",
    hospitalId: "h2",
    medicineId: "m2",
    createdAt: daysFromNow(0),
    acknowledged: false,
  },
  {
    id: "a2",
    type: "Demand Spike",
    severity: "High",
    message: "Amoxicillin demand increased significantly (+27%) at Sunrise Hospital.",
    hospitalId: "h2",
    medicineId: "m3",
    createdAt: daysFromNow(0),
    acknowledged: false,
  },
  {
    id: "a3",
    type: "Expiry Warning",
    severity: "Medium",
    message: "1,150 units of Amoxicillin at MediPlus Hospital expire within 30 days.",
    hospitalId: "h4",
    medicineId: "m3",
    createdAt: daysFromNow(-1),
    acknowledged: false,
  },
  {
    id: "a4",
    type: "Supplier Delay",
    severity: "High",
    message: "PharmaConnect deliveries running 5.6 days on average — 3 orders delayed.",
    createdAt: daysFromNow(-1),
    acknowledged: false,
  },
  {
    id: "a5",
    type: "Stock Shortage",
    severity: "Critical",
    message: "Salbutamol at LifeLine Hospital is below minimum stock (62 of 100).",
    hospitalId: "h3",
    medicineId: "m6",
    createdAt: daysFromNow(-2),
    acknowledged: false,
  },
  {
    id: "a6",
    type: "Expiry Warning",
    severity: "Low",
    message: "680 sachets of ORS at MediPlus Hospital expire within 30 days.",
    hospitalId: "h4",
    medicineId: "m5",
    createdAt: daysFromNow(-3),
    acknowledged: true,
  },
  {
    id: "a7",
    type: "Emergency",
    severity: "Critical",
    message: "Regional emergency drill: verify critical medicine buffers across 4 hospitals.",
    createdAt: daysFromNow(-4),
    acknowledged: true,
  },
];

export const medicineById = (id: string) => medicines.find((m) => m.id === id);
export const hospitalById = (id: string) => hospitals.find((h) => h.id === id);
export const supplierById = (id: string) => suppliers.find((s) => s.id === id);
