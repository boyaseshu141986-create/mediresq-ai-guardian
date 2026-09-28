import type { EnrichedItem } from "./store";
import { predictDemand } from "./risk-engine";
import type { InventoryItem } from "./types";

/**
 * Modular AI prediction service.
 *
 * `getForecast` and `askAssistant` are the only entry points the UI uses.
 * To connect a real model later, replace their bodies with a fetch to a
 * FastAPI + scikit-learn endpoint — the return shapes stay the same.
 */

export type ForecastPoint = {
  label: string;
  actual?: number;
  predicted?: number;
  upper?: number;
  lower?: number;
};

export function buildForecastSeries(
  item: InventoryItem,
  history: { date: string; unitsConsumed: number }[],
  emergencyMultiplier = 1,
): ForecastPoint[] {
  const recent = history.slice(-21);
  const points: ForecastPoint[] = recent.map((h) => ({
    label: h.date.slice(5),
    actual: h.unitsConsumed,
  }));

  if (points.length) {
    const last = points[points.length - 1];
    last.predicted = last.actual;
    last.upper = last.actual;
    last.lower = last.actual;
  }

  for (let d = 1; d <= 14; d++) {
    const date = new Date();
    date.setDate(date.getDate() + d);
    const value = predictDemand(item, d, emergencyMultiplier) - predictDemand(item, d - 1, emergencyMultiplier);
    const wave = 1 + Math.sin(d / 3) * 0.05;
    const predicted = Math.round(value * wave);
    points.push({
      label: date.toISOString().slice(5, 10),
      predicted,
      upper: Math.round(predicted * 1.18),
      lower: Math.round(predicted * 0.84),
    });
  }
  return points;
}

export async function getForecast(
  item: InventoryItem,
  history: { date: string; unitsConsumed: number }[],
  emergencyMultiplier = 1,
) {
  // Simulated model latency — replace with a fetch to the ML service.
  await new Promise((r) => setTimeout(r, 900));
  return {
    model: "MediResQ-Forecast v0.9 (demo)",
    generatedAt: new Date().toISOString(),
    series: buildForecastSeries(item, history, emergencyMultiplier),
  };
}

const fmt = (n: number) => n.toLocaleString();

export function askAssistant(question: string, items: EnrichedItem[]): string {
  const q = question.toLowerCase();

  const byRisk = [...items].sort((a, b) => b.risk.riskScore - a.risk.riskScore);

  if (/expir/.test(q)) {
    const soon = items
      .filter((i) => i.risk.daysToExpiry <= 45)
      .sort((a, b) => a.risk.daysToExpiry - b.risk.daysToExpiry)
      .slice(0, 5);
    if (!soon.length) return "No batches are expiring within the next 45 days. ";
    return (
      "Batches approaching expiry:\n" +
      soon
        .map(
          (i) =>
            `• ${i.medicineName} (${i.batchNumber}) at ${i.hospitalName} — ${fmt(i.currentStock)} ${i.unit} in ${i.risk.daysToExpiry} days`,
        )
        .join("\n") +
      "\nSuggested action: redistribute near-expiry stock to hospitals with higher daily usage."
    );
  }

  if (/excess|surplus|which hospital has/.test(q)) {
    const name = items.find((i) => q.includes(i.medicineName.toLowerCase()))?.medicineName;
    const pool = name ? items.filter((i) => i.medicineName === name) : items;
    const surplus = pool
      .filter((i) => i.currentStock > i.minStock * 2)
      .sort((a, b) => b.currentStock - a.currentStock)
      .slice(0, 4);
    if (!surplus.length) return "No hospital currently holds meaningful surplus for that medicine.";
    return (
      `Hospitals with surplus${name ? ` of ${name}` : ""}:\n` +
      surplus
        .map(
          (i) =>
            `• ${i.hospitalName} — ${fmt(i.currentStock)} ${i.unit} (minimum ${fmt(i.minStock)}), ${i.risk.daysOfCover} days of cover`,
        )
        .join("\n")
    );
  }

  if (/reorder|order|how much/.test(q)) {
    const need = byRisk.filter((i) => i.risk.recommendedOrderQty > 0).slice(0, 5);
    return (
      "Recommended reorder quantities (based on 30-day predicted demand + safety buffer):\n" +
      need
        .map(
          (i) =>
            `• ${i.medicineName} at ${i.hospitalName} — order ${fmt(i.risk.recommendedOrderQty)} ${i.unit}`,
        )
        .join("\n")
    );
  }

  if (/alert|critical/.test(q)) {
    const crit = byRisk.filter((i) => i.risk.riskLevel === "CRITICAL" || i.risk.riskLevel === "HIGH");
    return (
      `${crit.length} items are in a critical or high-risk state:\n` +
      crit
        .slice(0, 6)
        .map(
          (i) =>
            `• ${i.risk.riskLevel}: ${i.medicineName} at ${i.hospitalName} — ${i.risk.daysOfCover} days of cover, shortage probability ${i.risk.shortageProbability}%`,
        )
        .join("\n")
    );
  }

  if (/transfer/.test(q)) {
    const recs = recommendTransfers(items).slice(0, 4);
    if (!recs.length) return "No transfers are needed right now — all hospitals hold safe buffers.";
    return (
      "Recommended hospital-to-hospital transfers:\n" +
      recs.map((r) => `• ${r.text}`).join("\n")
    );
  }

  if (/risk|shortage|run out/.test(q)) {
    const top = byRisk.slice(0, 5);
    return (
      "Highest shortage-risk items right now:\n" +
      top
        .map(
          (i) =>
            `• ${i.medicineName} at ${i.hospitalName} — ${i.risk.riskLevel}, ${i.risk.shortageProbability}% shortage probability, cover for ${i.risk.daysOfCover} days`,
        )
        .join("\n")
    );
  }

  if (/hello|hi\b|help|what can you/.test(q)) {
    return "I'm the MediResQ Assistant. Ask me about shortage risk, expiring batches, surplus stock across hospitals, reorder quantities, transfers or critical alerts. I only handle supply-chain questions — not clinical advice.";
  }

  const top = byRisk[0];
  return `I couldn't match that to a supply-chain query. Here's the current headline: ${top.medicineName} at ${top.hospitalName} is ${top.risk.riskLevel} with a ${top.risk.shortageProbability}% shortage probability. Try asking about expiry, surplus stock, reorders or transfers.`;
}

export type TransferRecommendation = {
  id: string;
  medicineName: string;
  from: string;
  to: string;
  quantity: number;
  text: string;
  urgency: "Emergency" | "High" | "Normal";
};

export function recommendTransfers(items: EnrichedItem[]): TransferRecommendation[] {
  const recs: TransferRecommendation[] = [];
  const deficits = items
    .filter((i) => i.risk.riskLevel === "CRITICAL" || i.risk.riskLevel === "HIGH")
    .sort((a, b) => b.risk.riskScore - a.risk.riskScore);

  deficits.forEach((need) => {
    const donor = items
      .filter(
        (i) =>
          i.medicineId === need.medicineId &&
          i.hospitalId !== need.hospitalId &&
          i.currentStock > i.minStock * 1.6 &&
          (i.risk.riskLevel === "SAFE" || i.risk.riskLevel === "LOW"),
      )
      .sort((a, b) => b.currentStock - a.currentStock)[0];
    if (!donor) return;
    const gap = Math.max(need.minStock - need.currentStock, need.risk.projectedShortfall);
    const quantity = Math.max(10, Math.round(Math.min(gap, donor.currentStock - donor.minStock) / 10) * 10);
    if (quantity <= 0) return;
    recs.push({
      id: `${need.id}-${donor.id}`,
      medicineName: need.medicineName,
      from: donor.hospitalName,
      to: need.hospitalName,
      quantity,
      urgency: need.risk.riskLevel === "CRITICAL" ? "Emergency" : "High",
      text: `Transfer ${fmt(quantity)} ${need.unit} of ${need.medicineName} from ${donor.hospitalName} to ${need.hospitalName}.`,
    });
  });

  return recs;
}
