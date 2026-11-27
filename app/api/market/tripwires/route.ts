import { NextResponse } from "next/server";
import { fetchJson, yearAgo } from "@/lib/market/server";
import { ticker } from "@/lib/data/deck";
import type { TripStatus } from "@/lib/model/model";

export const dynamic = "force-dynamic";

export type LiveTripwireItem = {
  key: string;
  name: string;
  severity: "HIGH" | "LIKELY" | "MEDIUM" | "LOW";
  reading: string;
  watch: string;
  act: string;
  status: TripStatus;
  asOf: string;
  source: string;
  live: boolean;
};

type FredObs = { observations: { date: string; value: string }[] };
type FrankLatest = { date: string; rates: { INR: number } };

async function fetchFredRecent(seriesId: string, apiKey: string, limit = 15): Promise<[string, number][]> {
  const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${seriesId}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=${limit}`;
  const json = await fetchJson<FredObs>(url);
  return (json.observations ?? [])
    .filter((o) => o.value !== "." && o.value !== "" && Number.isFinite(Number(o.value)))
    .map((o) => [o.date, Number(o.value)] as [string, number])
    .reverse();
}

async function fetchUsdInrLatest(): Promise<{ value: number; date: string } | null> {
  try {
    const res = await fetch("https://query1.finance.yahoo.com/v8/finance/chart/USDINR=X?interval=1m&range=1d", {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0", accept: "application/json" },
    });
    if (res.ok) {
      const json = (await res.json()) as { chart?: { result?: Array<{ meta?: { regularMarketPrice?: number; regularMarketTime?: number } }> } };
      const meta = json?.chart?.result?.[0]?.meta;
      if (typeof meta?.regularMarketPrice === "number" && Number.isFinite(meta.regularMarketPrice)) {
        const dt = new Date((meta.regularMarketTime ?? Date.now() / 1000) * 1000).toISOString().slice(0, 10);
        return { value: meta.regularMarketPrice, date: dt };
      }
    }
  } catch {
    // fallback to Frankfurter
  }
  for (const host of ["https://api.frankfurter.dev/v1", "https://api.frankfurter.app"]) {
    try {
      const data = await fetchJson<FrankLatest>(`${host}/latest?base=USD&symbols=INR`, 0);
      if (Number.isFinite(data?.rates?.INR)) {
        return { value: data.rates.INR, date: data.date };
      }
    } catch {
      // try next host
    }
  }
  return null;
}

export async function GET() {
  const fredKey = process.env.FRED_API_KEY;
  const hasFred = Boolean(fredKey && fredKey !== "YOUR_FRED_API_KEY");

  const [usdinrRes, brentRes, us10yRes, fedTargetRes, in10yRes, callRes, reerRes] = await Promise.allSettled([
    fetchUsdInrLatest(),
    hasFred ? fetchFredRecent("DCOILBRENTEU", fredKey!, 15) : Promise.resolve([]),
    hasFred ? fetchFredRecent("DGS10", fredKey!, 10) : Promise.resolve([]),
    hasFred ? fetchFredRecent("DFEDTARU", fredKey!, 5) : Promise.resolve([]),
    hasFred ? fetchFredRecent("INDIRLTLT01STM", fredKey!, 6) : Promise.resolve([]),
    hasFred ? fetchFredRecent("IRSTCI01INM156N", fredKey!, 6) : Promise.resolve([]),
    hasFred ? fetchFredRecent("RBINBIS", fredKey!, 6) : Promise.resolve([]),
  ]);

  const getPts = (r: PromiseSettledResult<[string, number][]>) => (r.status === "fulfilled" ? r.value : []);

  const usdinr = usdinrRes.status === "fulfilled" ? usdinrRes.value : null;
  const brentPts = getPts(brentRes);
  const us10yPts = getPts(us10yRes);
  const fedPts = getPts(fedTargetRes);
  const in10yPts = getPts(in10yRes);
  const callPts = getPts(callRes);
  const reerPts = getPts(reerRes);

  const brentLast = brentPts.at(-1);
  const brentVal = brentLast?.[1] ?? ticker.brent;
  const brentDaysOver120 = brentPts.slice(-10).filter(([, v]) => v > 120).length;
  const oilStatus: TripStatus = brentVal > 120 || brentDaysOver120 >= 5 ? "TRIGGERED" : brentVal > 110 ? "WATCH" : "OK";

  const us10yLast = us10yPts.at(-1);
  const us10yVal = us10yLast?.[1] ?? ticker.us10y;
  const fedLast = fedPts.at(-1);
  const fedVal = fedLast?.[1] ?? 4.0;
  const fedStatus: TripStatus = us10yVal >= 5.0 || fedVal > 4.25 ? "TRIGGERED" : us10yVal >= 4.75 ? "WATCH" : "OK";

  const inrVal = usdinr?.value ?? ticker.usdinr;
  const in10yLast = in10yPts.at(-1);
  const in10yVal = in10yLast?.[1] ?? ticker.in10y;
  const spreadBps = Math.round((in10yVal - us10yVal) * 100);
  const fxStatus: TripStatus = inrVal >= 97 || spreadBps < 200 ? "TRIGGERED" : inrVal >= 94 || spreadBps < 230 ? "WATCH" : "OK";

  const callLast = callPts.at(-1);
  const callVal = callLast?.[1] ?? ticker.callRate;
  const reerLast = reerPts.at(-1);
  const reerVal = reerLast?.[1] ?? ticker.reer;
  const liqStatus: TripStatus = callVal > ticker.msf ? "TRIGGERED" : callVal >= 5.65 || reerVal < 92 ? "WATCH" : "OK";

  const items: LiveTripwireItem[] = [
    {
      key: "oil",
      name: "Oil shock",
      severity: oilStatus === "TRIGGERED" ? "HIGH" : oilStatus === "WATCH" ? "LIKELY" : "LOW",
      reading: `Brent $${brentVal.toFixed(2)}/bbl`,
      watch: "Brent > $110 watch · > $120 triggered",
      act: "Reopen oil-firm dollar window; draw strategic oil buffer",
      status: oilStatus,
      asOf: brentLast?.[0] ?? yearAgo(),
      source: "FRED · DCOILBRENTEU",
      live: Boolean(brentLast),
    },
    {
      key: "fed",
      name: "Fed & US 10Y pressure",
      severity: fedStatus === "TRIGGERED" ? "HIGH" : fedStatus === "WATCH" ? "LIKELY" : "MEDIUM",
      reading: `US 10Y ${us10yVal.toFixed(2)}% · Fed ${fedVal.toFixed(2)}%`,
      watch: "US 10Y ≥ 4.75% watch · ≥ 5.00% triggered",
      act: "Hold liquidity tight; intervene only on disorderly FX moves",
      status: fedStatus,
      asOf: us10yLast?.[0] ?? fedLast?.[0] ?? "",
      source: "FRED · DGS10 & DFEDTARU",
      live: Boolean(us10yLast || fedLast),
    },
    {
      key: "spread",
      name: "Rupee & Ind–US spread",
      severity: fxStatus === "TRIGGERED" ? "HIGH" : fxStatus === "WATCH" ? "MEDIUM" : "LOW",
      reading: `₹${inrVal.toFixed(2)} · Spread ${spreadBps} bps`,
      watch: "USD/INR ≥ ₹94 or spread < 230 bps watch · ≥ ₹97 triggered",
      act: "Deploy spot/forward dollar smoothing and FCNR(B) swap window",
      status: fxStatus,
      asOf: usdinr?.date ?? in10yLast?.[0] ?? "",
      source: "ECB Frankfurter · FRED INDIRLTLT01STM",
      live: Boolean(usdinr || in10yLast),
    },
    {
      key: "liquidity",
      name: "Call rate & REER stress",
      severity: liqStatus === "TRIGGERED" ? "HIGH" : liqStatus === "WATCH" ? "MEDIUM" : "LOW",
      reading: `Call ${callVal.toFixed(2)}% · REER ${reerVal.toFixed(1)}`,
      watch: "Call ≥ 5.65% or REER < 92 watch · Call > 5.75% MSF triggered",
      act: "Inject VRRR/repo liquidity if call breaches MSF; ease curbs gradually",
      status: liqStatus,
      asOf: callLast?.[0] ?? reerLast?.[0] ?? "",
      source: "FRED · IRSTCI01INM156N & RBINBIS",
      live: Boolean(callLast || reerLast),
    },
  ];

  return NextResponse.json({
    ok: true,
    fetchedAt: new Date().toISOString(),
    items,
  });
}
// the end
