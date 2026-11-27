import { NextResponse } from "next/server";
import { fallback, fetchJson, remember, yearAgo } from "@/lib/market/server";
import { snapshotFeed } from "@/lib/market/snapshot";
import type { Feed } from "@/lib/market/types";

export const dynamic = "force-dynamic";

type FrankSeries = { start_date: string; end_date: string; rates: Record<string, { INR: number }> };
type YahooChart = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number;
        chartPreviousClose?: number;
        regularMarketTime?: number;
      };
    }>;
  };
};

const HOSTS = ["https://api.frankfurter.dev/v1", "https://api.frankfurter.app"];
const YAHOO_URL = "https://query1.finance.yahoo.com/v8/finance/chart/USDINR=X?interval=1m&range=1d";

async function fetchYahooLive(): Promise<{ price: number; prevClose: number | null; date: string; timeIso: string } | null> {
  try {
    const res = await fetch(YAHOO_URL, {
      cache: "no-store",
      signal: AbortSignal.timeout(8000),
      headers: { "User-Agent": "Mozilla/5.0", accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as YahooChart;
    const meta = json?.chart?.result?.[0]?.meta;
    const price = meta?.regularMarketPrice;
    if (typeof price !== "number" || !Number.isFinite(price)) return null;
    const prevClose = typeof meta?.chartPreviousClose === "number" && Number.isFinite(meta.chartPreviousClose) ? meta.chartPreviousClose : null;
    const ts = typeof meta?.regularMarketTime === "number" ? meta.regularMarketTime * 1000 : Date.now();
    const dt = new Date(ts);
    return {
      price,
      prevClose,
      date: dt.toISOString().slice(0, 10),
      timeIso: dt.toISOString(),
    };
  } catch {
    return null;
  }
}

async function fetchFrankfurterHistory(): Promise<[string, number][]> {
  const from = yearAgo();
  for (const host of HOSTS) {
    try {
      const data = await fetchJson<FrankSeries>(`${host}/${from}..?base=USD&symbols=INR`, 300);
      const series = Object.keys(data.rates)
        .sort()
        .map((d) => [d, data.rates[d].INR] as [string, number])
        .filter(([, v]) => Number.isFinite(v));
      if (series.length >= 2) return series;
    } catch {
      // try next host
    }
  }
  return [];
}

export async function GET() {
  const [liveTick, history] = await Promise.all([fetchYahooLive(), fetchFrankfurterHistory()]);

  if (liveTick) {
    const series = [...history];
    if (series.length > 0 && series[series.length - 1][0] === liveTick.date) {
      series[series.length - 1] = [liveTick.date, liveTick.price];
    } else {
      series.push([liveTick.date, liveTick.price]);
    }
    const prev = liveTick.prevClose ?? (series.length >= 2 ? series[series.length - 2][1] : liveTick.price);
    const feed: Feed = {
      id: "usdinr",
      label: "USD/INR",
      value: liveTick.price,
      change: liveTick.price - prev,
      series,
      asOf: liveTick.date,
      source: "Live spot (Yahoo Finance · 30s) & ECB history",
      status: "live",
    };
    return NextResponse.json(remember(feed));
  }

  if (history.length >= 2) {
    const last = history[history.length - 1];
    const feed: Feed = {
      id: "usdinr",
      label: "USD/INR",
      value: last[1],
      change: last[1] - history[history.length - 2][1],
      series: history,
      asOf: last[0],
      source: "ECB reference rate via Frankfurter",
      status: "live",
    };
    return NextResponse.json(remember(feed));
  }

  return NextResponse.json(fallback("usdinr", snapshotFeed("usdinr")));
}
// the end
