export type RiskLevel = "SAFE" | "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type Hospital = {
  id: string;
  name: string;
  city: string;
  beds: number;
  type: string;
};

export type Supplier = {
  id: string;
  name: string;
  categories: string[];
  avgDeliveryDays: number;
  reliability: number; // 0-100
  currentOrders: number;
  status: "Active" | "Delayed" | "Suspended";
  contact: string;
  onTimeRate: number;
};

export type Medicine = {
  id: string;
  name: string;
  category: string;
  unit: string;
};

export type InventoryItem = {
  id: string;
  medicineId: string;
  hospitalId: string;
  supplierId: string;
  batchNumber: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  expiryDate: string; // ISO
  avgDailyUsage: number;
  demandGrowth: number; // e.g. 0.12 = +12%
};

export type DemandRecord = {
  id: string;
  medicineId: string;
  hospitalId: string;
  date: string; // ISO
  unitsConsumed: number;
};

export type TransferStatus = "Pending" | "Approved" | "In Transit" | "Completed";

export type Transfer = {
  id: string;
  fromHospitalId: string;
  toHospitalId: string;
  medicineId: string;
  quantity: number;
  priority: "Low" | "Normal" | "High" | "Emergency";
  reason: string;
  status: TransferStatus;
  createdAt: string;
};

export type AlertType =
  | "Stock Shortage"
  | "Predicted Shortage"
  | "Expiry Warning"
  | "Demand Spike"
  | "Supplier Delay"
  | "Emergency";

export type AlertSeverity = "Critical" | "High" | "Medium" | "Low";

export type SupplyAlert = {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  message: string;
  hospitalId?: string;
  medicineId?: string;
  createdAt: string;
  acknowledged: boolean;
};
