import type { InventoryItem, RiskLevel } from "./types";

/**
 * MediResQ AI risk engine (demo implementation).
 *
 * Inputs: current stock, minimum stock, average daily usage, predicted demand,
 * days to expiry, demand growth and an emergency multiplier.
 *
 * Replace `assessRisk` with a call to a FastAPI + scikit-learn service later;
 * the returned shape is the contract the UI depends on.
 */

export type RiskAssessment = {
  riskLevel: RiskLevel;
  riskScore: number; // 0-100
  shortageRisk: number;
  expiryRisk: number;
  demandRisk: number;
  shortageProbability: number; // 0-100
  daysOfCover: number;
  daysToExpiry: number;
  predicted7Day: number;
  predicted30Day: number;
  projectedShortfall: number;
  recommendedOrderQty: number;
  recommendedAction: string;
};

export const daysUntil = (iso: string) =>
  Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);

const clamp = (n: number, min = 0, max = 100) => Math.min(max, Math.max(min, n));

export function predictDemand(item: InventoryItem, days: number, emergencyMultiplier = 1) {
  const growthFactor = 1 + item.demandGrowth * (days / 30);
  return Math.round(item.avgDailyUsage * days * growthFactor * emergencyMultiplier);
}

export function assessRisk(item: InventoryItem, emergencyMultiplier = 1): RiskAssessment {
  const dailyUsage = Math.max(0.1, item.avgDailyUsage * emergencyMultiplier);
  const predicted7Day = predictDemand(item, 7, emergencyMultiplier);
  const predicted30Day = predictDemand(item, 30, emergencyMultiplier);
  const daysOfCover = Math.round(item.currentStock / dailyUsage);
  const daysToExpiry = daysUntil(item.expiryDate);

  // Shortage risk: how badly 7-day demand outruns usable stock + buffer.
  const buffer = Math.max(1, item.minStock);
  const coverRatio = item.currentStock / Math.max(1, predicted7Day);
  const bufferRatio = item.currentStock / buffer;
  const shortageRisk = clamp(
    (1 - coverRatio) * 70 + (bufferRatio < 1 ? (1 - bufferRatio) * 50 : 0),
  );

  // Expiry risk: stock that will expire before it can be consumed.
  const consumableBeforeExpiry = dailyUsage * Math.max(0, daysToExpiry);
  const wasteUnits = Math.max(0, item.currentStock - consumableBeforeExpiry);
  const expiryRisk = clamp(
    (wasteUnits / Math.max(1, item.currentStock)) * 70 +
      (daysToExpiry <= 30 ? (30 - Math.max(0, daysToExpiry)) * 1.2 : 0),
  );

  // Demand risk: velocity of growth vs. remaining cover.
  const demandRisk = clamp(item.demandGrowth * 180 + (daysOfCover < 14 ? 25 : 0));

  const riskScore = clamp(shortageRisk * 0.55 + demandRisk * 0.25 + expiryRisk * 0.2);

  const riskLevel: RiskLevel =
    riskScore >= 78
      ? "CRITICAL"
      : riskScore >= 58
        ? "HIGH"
        : riskScore >= 38
          ? "MEDIUM"
          : riskScore >= 20
            ? "LOW"
            : "SAFE";

  const shortageProbability = Math.round(clamp(shortageRisk * 0.8 + demandRisk * 0.3));
  const projectedShortfall = Math.max(0, predicted7Day - item.currentStock);

  const targetLevel = Math.min(item.maxStock, predicted30Day + item.minStock);
  const recommendedOrderQty = Math.max(0, Math.round((targetLevel - item.currentStock) / 10) * 10);

  let recommendedAction = "Stock levels healthy — continue routine monitoring.";
  if (riskLevel === "CRITICAL")
    recommendedAction = "Emergency reorder and request an inter-hospital transfer today.";
  else if (riskLevel === "HIGH")
    recommendedAction = "Transfer stock from a surplus hospital or raise a priority order.";
  else if (riskLevel === "MEDIUM") recommendedAction = "Schedule a replenishment order this week.";
  else if (riskLevel === "LOW") recommendedAction = "Monitor usage; no immediate action needed.";
  if (expiryRisk > 55 && shortageRisk < 40)
    recommendedAction = "Redistribute near-expiry stock to a high-demand hospital to avoid wastage.";

  return {
    riskLevel,
    riskScore: Math.round(riskScore),
    shortageRisk: Math.round(shortageRisk),
    expiryRisk: Math.round(expiryRisk),
    demandRisk: Math.round(demandRisk),
    shortageProbability,
    daysOfCover,
    daysToExpiry,
    predicted7Day,
    predicted30Day,
    projectedShortfall,
    recommendedOrderQty,
    recommendedAction,
  };
}

export const riskStyles: Record<RiskLevel, string> = {
  SAFE: "bg-success/12 text-success border-success/25",
  LOW: "bg-info/12 text-info border-info/25",
  MEDIUM: "bg-warning/15 text-warning-foreground border-warning/35",
  HIGH: "bg-destructive/10 text-destructive border-destructive/25",
  CRITICAL: "bg-destructive text-destructive-foreground border-destructive",
};
