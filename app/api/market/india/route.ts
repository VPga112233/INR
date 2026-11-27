import { NextResponse } from "next/server";
import type { Feed } from "@/lib/market/types";
import { ticker, SNAPSHOT_DATE } from "@/lib/data/deck";

const FRED = "https://api.stlouisfed.org/fred/series/observations";
const KEY = process.env.FRED_API_KEY ?? "";

/** Fetch the latest non-null observation from a FRED series */
async function fredLatest(series: string): Promise<{ value: number; date: string } | null> {
  const url = `${FRED}?series_id=${series}&api_key=${KEY}&file_type=json&sort_order=desc&limit=12`;
  const r = await fetch(url, { next: { revalidate: 3600 } });
  if (!r.ok) return null;
  const json = await r.json() as { observations: { date: string; value: string }[] };
  for (const obs of json.observations) {
    const v = parseFloat(obs.value);
    if (!isNaN(v)) return { value: v, date: obs.date };
  }
  return null;
}

/** Fetch recent observations for a sparkline series (last N non-null) */
async function fredSeries(series: string, limit = 24): Promise<[string, number][]> {
  const url = `${FRED}?series_id=${series}&api_key=${KEY}&file_type=json&sort_order=desc&limit=${limit}`;
  const r = await fetch(url, { next: { revalidate: 3600 } });
  if (!r.ok) return [];
  const json = await r.json() as { observations: { date: string; value: string }[] };
  const pts = json.observations
    .filter((o) => !isNaN(parseFloat(o.value)))
    .map((o) => [o.date, parseFloat(o.value)] as [string, number]);
  return pts.reverse(); // chronological order
}

export async function GET() {
  if (!KEY) {
    return NextResponse.json({ error: "No FRED key" }, { status: 503 });
  }

  // Fetch all three in parallel — with series for sparklines
  const [in10yLatest, in10ySeries, callLatest, callSeries, reerLatest, reerSeries] = await Promise.allSettled([
    fredLatest("INDIRLTLT01STM"),
    fredSeries("INDIRLTLT01STM", 24),
    fredLatest("IRSTCI01INM156N"),
    fredSeries("IRSTCI01INM156N", 12),
    fredLatest("RBINBIS"),
    fredSeries("RBINBIS", 24),
  ]);

  const resolve = <T,>(r: PromiseSettledResult<T>, fallback: T): T =>
    r.status === "fulfilled" && r.value != null ? r.value : fallback;

  const in10yVal = resolve(in10yLatest, null);
  const in10yPts = resolve(in10ySeries, [] as [string, number][]);
  const callVal = resolve(callLatest, null);
  const callPts = resolve(callSeries, [] as [string, number][]);
  const reerVal = resolve(reerLatest, null);
  const reerPts = resolve(reerSeries, [] as [string, number][]);

  const makeChange = (pts: [string, number][]) =>
    pts.length >= 2 ? pts[pts.length - 1][1] - pts[pts.length - 2][1] : null;

  const in10yFeed: Feed = in10yVal
    ? { id: "in10y", label: "IN 10Y", value: in10yVal.value, change: makeChange(in10yPts), series: in10yPts, asOf: in10yVal.date, source: "FRED INDIRLTLT01STM", status: "live" }
    : { id: "in10y", label: "IN 10Y", value: ticker.in10y, change: null, series: [], asOf: SNAPSHOT_DATE, source: "Market snapshot", status: "snapshot" };

  const callFeed: Feed = callVal
    ? { id: "call", label: "CALL", value: callVal.value, change: makeChange(callPts), series: callPts, asOf: callVal.date, source: "FRED IRSTCI01INM156N", status: "live" }
    : { id: "call", label: "CALL", value: ticker.callRate, change: null, series: [], asOf: SNAPSHOT_DATE, source: "Market snapshot", status: "snapshot" };

  const reerFeed: Feed = reerVal
    ? { id: "reer", label: "REER", value: reerVal.value, change: makeChange(reerPts), series: reerPts, asOf: reerVal.date, source: "FRED RBINBIS", status: "live" }
    : { id: "reer", label: "REER", value: ticker.reer, change: null, series: [], asOf: SNAPSHOT_DATE, source: "Market snapshot", status: "snapshot" };

  return NextResponse.json({ in10y: in10yFeed, call: callFeed, reer: reerFeed });
}
// the end
