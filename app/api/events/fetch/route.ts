import { NextResponse } from "next/server";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const fredKey = process.env.FRED_API_KEY;
  const avKey = process.env.ALPHA_VANTAGE_API_KEY;

  const result: {
    fed?: number;
    fedAsOf?: string | null;
    brent?: number;
    brentAsOf?: string | null;
    brentSource?: string;
    fetchedAt: string;
  } = {
    fetchedAt: new Date().toISOString(),
  };

  // 1. Fetch Fed Funds Rate from FRED (Macro / Interest Rates)
  if (fredKey && fredKey !== "YOUR_FRED_API_KEY") {
    try {
      const fedUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=${encodeURIComponent(fredKey)}&observation_start=2024-01-01&file_type=json`;
      const fedRes = await fetch(fedUrl, { cache: "no-store", signal: AbortSignal.timeout(10000) });
      if (fedRes.ok) {
        const fedJson = await fedRes.json();
        const observations = Array.isArray(fedJson?.observations) ? fedJson.observations : [];
        const latest = [...observations].reverse().find((o) => o?.value !== "." && Number.isFinite(Number(o?.value)));
        if (latest) {
          result.fed = Number(latest.value);
          result.fedAsOf = latest.date ?? null;
        }
      }
    } catch (e) {
      console.warn("FRED Fed rate fetch warning:", e);
    }
  }

  // 2. Fetch Brent Crude Oil (Alpha Vantage primary, FRED fallback)
  let brentFound = false;

  // Try Alpha Vantage for Commodities
  if (avKey && avKey !== "YOUR_ALPHA_VANTAGE_KEY") {
    try {
      const avUrl = `https://www.alphavantage.co/query?function=BRENT&interval=daily&apikey=${encodeURIComponent(avKey)}`;
      const avRes = await fetch(avUrl, { cache: "no-store", signal: AbortSignal.timeout(10000) });
      if (avRes.ok) {
        const avJson = await avRes.json();
        const data = Array.isArray(avJson?.data) ? avJson.data : [];
        const latest = data.find((d: { value: string; date: string }) => d?.value !== "." && Number.isFinite(Number(d?.value)));
        if (latest) {
          result.brent = Number(latest.value);
          result.brentAsOf = latest.date ?? null;
          result.brentSource = "Alpha Vantage";
          brentFound = true;
        }
      }
    } catch (e) {
      console.warn("Alpha Vantage Brent fetch warning:", e);
    }
  }

  // Fallback to FRED (DCOILBRENTEU) if Alpha Vantage is not set or failed
  if (!brentFound && fredKey && fredKey !== "YOUR_FRED_API_KEY") {
    try {
      const fredOilUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=DCOILBRENTEU&api_key=${encodeURIComponent(fredKey)}&observation_start=2024-01-01&file_type=json`;
      const oilRes = await fetch(fredOilUrl, { cache: "no-store", signal: AbortSignal.timeout(10000) });
      if (oilRes.ok) {
        const oilJson = await oilRes.json();
        const observations = Array.isArray(oilJson?.observations) ? oilJson.observations : [];
        const latest = [...observations].reverse().find((o) => o?.value !== "." && Number.isFinite(Number(o?.value)));
        if (latest) {
          result.brent = Number(latest.value);
          result.brentAsOf = latest.date ?? null;
          result.brentSource = "FRED (Fallback)";
          brentFound = true;
        }
      }
    } catch (e) {
      console.warn("FRED Brent fallback warning:", e);
    }
  }

  // Write snapshot for client consumption
  try {
    const outDir = path.join(process.cwd(), "public", "events");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(path.join(outDir, "latest.json"), JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("Failed to write latest.json:", err);
  }

  return NextResponse.json({ ok: true, data: result });
}
// the end
