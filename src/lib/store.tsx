import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  demandHistory,
  hospitals,
  initialAlerts,
  initialTransfers,
  inventory as seedInventory,
  medicines,
  suppliers,
} from "./mock-data";
import { assessRisk, type RiskAssessment } from "./risk-engine";
import type { InventoryItem, SupplyAlert, Transfer } from "./types";

export type EnrichedItem = InventoryItem & {
  medicineName: string;
  category: string;
  unit: string;
  hospitalName: string;
  supplierName: string;
  risk: RiskAssessment;
};

type Session = { email: string; name: string; demo: boolean } | null;

type Store = {
  session: Session;
  login: (email: string, demo?: boolean) => void;
  logout: () => void;
  ready: boolean;

  emergencyMode: boolean;
  setEmergencyMode: (v: boolean) => void;
  emergencyMultiplier: number;

  inventory: InventoryItem[];
  items: EnrichedItem[];
  addItem: (item: Omit<InventoryItem, "id">) => void;
  updateItem: (id: string, patch: Partial<InventoryItem>) => void;
  deleteItem: (id: string) => void;

  transfers: Transfer[];
  addTransfer: (t: Omit<Transfer, "id" | "createdAt" | "status">) => void;
  updateTransferStatus: (id: string, status: Transfer["status"]) => void;

  alerts: SupplyAlert[];
  acknowledgeAlert: (id: string) => void;
};

const StoreContext = createContext<Store | null>(null);

const SESSION_KEY = "mediresq.session";

export function StoreProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session>(null);
  const [ready, setReady] = useState(false);
  const [emergencyMode, setEmergencyMode] = useState(false);
  const [inventory, setInventory] = useState<InventoryItem[]>(seedInventory);
  const [transfers, setTransfers] = useState<Transfer[]>(initialTransfers);
  const [alerts, setAlerts] = useState<SupplyAlert[]>(initialAlerts);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const login = useCallback((email: string, demo = false) => {
    const next: Session = {
      email,
      name: demo ? "Demo Supply Manager" : email.split("@")[0] || "Supply Manager",
      demo,
    };
    setSession(next);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }, []);

  const logout = useCallback(() => {
    setSession(null);
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const emergencyMultiplier = emergencyMode ? 1.35 : 1;

  const items = useMemo<EnrichedItem[]>(
    () =>
      inventory.map((item) => {
        const med = medicines.find((m) => m.id === item.medicineId);
        return {
          ...item,
          medicineName: med?.name ?? "Unknown",
          category: med?.category ?? "General",
          unit: med?.unit ?? "units",
          hospitalName: hospitals.find((h) => h.id === item.hospitalId)?.name ?? "Unknown",
          supplierName: suppliers.find((s) => s.id === item.supplierId)?.name ?? "Unassigned",
          risk: assessRisk(item, emergencyMultiplier),
        };
      }),
    [inventory, emergencyMultiplier],
  );

  const value: Store = {
    session,
    login,
    logout,
    ready,
    emergencyMode,
    setEmergencyMode,
    emergencyMultiplier,
    inventory,
    items,
    addItem: (item) => setInventory((prev) => [{ ...item, id: `inv${Date.now()}` }, ...prev]),
    updateItem: (id, patch) =>
      setInventory((prev) => prev.map((i) => (i.id === id ? { ...i, ...patch } : i))),
    deleteItem: (id) => setInventory((prev) => prev.filter((i) => i.id !== id)),
    transfers,
    addTransfer: (t) =>
      setTransfers((prev) => [
        {
          ...t,
          id: `t${Date.now()}`,
          status: "Pending",
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]),
    updateTransferStatus: (id, status) =>
      setTransfers((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t))),
    alerts,
    acknowledgeAlert: (id) =>
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))),
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export { demandHistory, hospitals, medicines, suppliers };
