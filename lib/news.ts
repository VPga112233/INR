// Live world macro & FX news wire.
// Monitors global macroeconomic events and calculates estimated rupee impacts.
import type { Delta } from "./model/clamp";

export type Severity = "HIGH" | "MEDIUM" | "LOW";
export type Snap = { usdinr: number; cpi: number; crisis: number; reserves: number; cad: number; liquidity: number };

export type NewsItem = {
  id: string;
  ts: number;
  category: string;
  headline: string;
  body: string;
  severity: Severity;
  delta: Delta;
  effect: string;
  rupeeImpact: string;
  inrDelta: number;
  tone: "bad" | "good";
  source?: string;
  applied?: boolean;
  before?: Snap;
  after?: Snap;
};

type T = (r: () => number) => Omit<NewsItem, "id" | "ts">;
const pick = (r: () => number, lo: number, hi: number, step = 1) =>
  Math.round((lo + r() * (hi - lo)) / step) * step;

const TEMPLATES: T[] = [
  (r) => {
    const x = pick(r, 4, 8);
    const dInr = +(x * 0.055).toFixed(2);
    return {
      category: "CRUDE OIL",
      headline: `Brent crude surges +$${x}/bbl as Middle East shipping risks escalate`,
      body: "Insurance war-risk premiums surge near the Strait of Hormuz; Indian refiners face higher landed crude costs.",
      severity: x >= 6 ? "HIGH" : "MEDIUM",
      delta: { brent: x },
      effect: `Brent +$${x}/bbl`,
      rupeeImpact: `+₹${dInr} / $ (Rupee weakens)`,
      inrDelta: dInr,
      tone: "bad",
      source: "Energy & Commodities Wire",
    };
  },
  (r) => {
    const x = pick(r, 3, 7);
    const dInr = -(x * 0.05).toFixed(2);
    return {
      category: "CRUDE OIL",
      headline: `Brent slides −$${x}/bbl after OPEC+ confirms gradual output increase`,
      body: "Cooling global crude prices relieve India's oil import bill (~88% crude import reliance) and curb imported inflation.",
      severity: "MEDIUM",
      delta: { brent: -x },
      effect: `Brent −$${x}/bbl`,
      rupeeImpact: `−₹${Math.abs(+dInr).toFixed(2)} / $ (Rupee strengthens)`,
      inrDelta: +dInr,
      tone: "good",
      source: "OPEC Market Monitor",
    };
  },
  () => {
    const dInr = 0.22;
    return {
      category: "US FED & 10Y",
      headline: "Hawkish Fed commentary lifts US 10-year Treasury yield to 4.91%",
      body: "Widening US rate expectations compress the US-India yield spread (currently ~247 bps) and spark emerging market capital outflows.",
      severity: "HIGH",
      delta: { fed: 25 },
      effect: "US 10Y +25 bps",
      rupeeImpact: `+₹${dInr} / $ (Rupee weakens)`,
      inrDelta: dInr,
      tone: "bad",
      source: "Federal Reserve & Fixed Income",
    };
  },
  () => {
    const dInr = -0.19;
    return {
      category: "US FED & 10Y",
      headline: "Softer US labor & PCE inflation data pushes Treasury yields down 18 bps",
      body: "Cooler US macro indicators curb dollar strength and ease foreign investor liquidation pressure across Asian debt.",
      severity: "MEDIUM",
      delta: { fed: -25 },
      effect: "US 10Y −25 bps",
      rupeeImpact: `−₹${Math.abs(dInr).toFixed(2)} / $ (Rupee strengthens)`,
      inrDelta: dInr,
      tone: "good",
      source: "US Macro / BLS Data",
    };
  },
  (r) => {
    const x = pick(r, 2, 5, 0.5);
    const dInr = +(x * 0.09).toFixed(2);
    return {
      category: "FPI CAPITAL",
      headline: `Foreign portfolio investors pull $${x}B from equities amid tech rotation`,
      body: "Outflows concentrated in financials and IT sectors increase domestic demand for dollar remittances.",
      severity: x >= 3.5 ? "HIGH" : "MEDIUM",
      delta: { fpi: -x },
      effect: `FPI outflow −$${x}B`,
      rupeeImpact: `+₹${dInr} / $ (Rupee weakens)`,
      inrDelta: dInr,
      tone: "bad",
      source: "NSDL / Depository Flow Tracker",
    };
  },
  (r) => {
    const x = pick(r, 2, 6, 0.5);
    const dInr = -(x * 0.08).toFixed(2);
    return {
      category: "FPI CAPITAL",
      headline: `Global funds pump +$${x}B (+₹${Math.round(x * 8300)} Cr) into Indian equities`,
      body: "Massive November FPI buying surge (record ₹1.22L+ Cr monthly inflow) injects dollar supply directly into the spot screen.",
      severity: "MEDIUM",
      delta: { fpi: x },
      effect: `FPI inflow +$${x}B`,
      rupeeImpact: `−₹${Math.abs(+dInr).toFixed(2)} / $ (Rupee strengthens)`,
      inrDelta: +dInr,
      tone: "good",
      source: "NSDL / Equity Flow Monitor",
    };
  },
  (r) => {
    const x = pick(r, 2, 4);
    const dInr = -0.15;
    return {
      category: "RBI INTERVENTION",
      headline: `RBI PSU banks sell $${x}B in spot FX to defend psychological ₹93 line`,
      body: "State-run banks step in on the central bank's behalf to absorb heavy intraday corporate importer bids and cap sharp swings.",
      severity: "MEDIUM",
      delta: { rbi: x },
      effect: `RBI sells $${x}B spot`,
      rupeeImpact: `−₹0.15 / $ (Volatility calmed)`,
      inrDelta: dInr,
      tone: "good",
      source: "RBI Dealing Desk / Market Reports",
    };
  },
  () => {
    const dInr = 0.24;
    return {
      category: "DOLLAR INDEX (DXY)",
      headline: "US Dollar Index (DXY) pushes past 104.2 on resilient US consumer strength",
      body: "Broad dollar rally puts passive depreciatory pressure across emerging market Asian peers including INR, IDR, and THB.",
      severity: "MEDIUM",
      delta: { brent: 2, fed: 10 },
      effect: "DXY +1.2 pts",
      rupeeImpact: `+₹${dInr} / $ (Rupee weakens)`,
      inrDelta: dInr,
      tone: "bad",
      source: "ICE Dollar Index & FX",
    };
  },
  () => {
    const dInr = -0.14;
    return {
      category: "RBI LIQUIDITY",
      headline: "RBI rolls back daily CRR maintenance from 99% to 90%, releasing ₹40,000 Cr",
      body: "Eases banking system liquidity deficit (−₹47,641 Cr) and pulls call money rates back inside the 5.50%–5.75% corridor without policy hikes.",
      severity: "MEDIUM",
      delta: { curbs: false },
      effect: "CRR relaxed (₹40K Cr injected)",
      rupeeImpact: `−₹0.14 / $ (Domestic rate relief)`,
      inrDelta: dInr,
      tone: "good",
      source: "Reserve Bank of India Circular",
    };
  },
  () => {
    const dInr = 0.18;
    return {
      category: "INFLATION",
      headline: "October CPI jumps to 6.09% (CFPI food inflation 8.94%), breaching RBI 6% band",
      body: "Surge in vegetable prices (onions +116%, garlic +60%) delays rate cut expectations and heightens imported inflation scrutiny.",
      severity: "HIGH",
      delta: { food: 0.5 },
      effect: "CPI breaches 6% ceiling",
      rupeeImpact: `+₹${dInr} / $ (Inflation pressure)`,
      inrDelta: dInr,
      tone: "bad",
      source: "MoSPI Press Information Bureau",
    };
  },
  () => {
    const dInr = -0.16;
    return {
      category: "BILATERAL TRADE",
      headline: "India & UAE settle major crude shipment in local currencies (INR/AED)",
      body: "Direct rupee-invoiced energy trade bypasses the spot dollar clearing screen, reducing seasonal dollar requisition by oil PSUs.",
      severity: "LOW",
      delta: { rbi: -1 },
      effect: "INR trade window active",
      rupeeImpact: `−₹0.16 / $ (Dollar demand eased)`,
      inrDelta: dInr,
      tone: "good",
      source: "Ministry of Commerce & Industry",
    };
  },
  () => {
    const dInr = 0.15;
    return {
      category: "TRADE DEFICIT",
      headline: "Festive gold import demand accelerates; October trade deficit widens",
      body: "Higher bullion imports and seasonal demand lift the trade deficit, temporarily widening current account dollar requirements.",
      severity: "MEDIUM",
      delta: { brent: 3 },
      effect: "Gold import surge",
      rupeeImpact: `+₹${dInr} / $ (Trade deficit drag)`,
      inrDelta: dInr,
      tone: "bad",
      source: "Trade & Customs Data",
    };
  },
];

let n = 0;
export function makeNews(seed = Math.random): NewsItem {
  const t = TEMPLATES[Math.floor(seed() * TEMPLATES.length)];
  n += 1;
  return { id: `live-${Date.now()}-${n}`, ts: Date.now(), ...t(seed) };
}
// the end
