import { brent2026, rupeeAnchors, SNAPSHOT_DATE, ticker } from "@/lib/data/deck";
import type { Feed, FeedId } from "./types";

const last2 = (s: [string, number][]) => (s.length > 1 ? s[s.length - 1][1] - s[s.length - 2][1] : null);

export function snapshotFeed(id: FeedId): Feed {
  switch (id) {
    case "usdinr": {
      const series = rupeeAnchors.map((a) => [a.date, a.value] as [string, number]);
      return { id, label: "USD/INR", value: ticker.usdinr, change: last2(series), series, asOf: SNAPSHOT_DATE, source: "Market snapshot", status: "snapshot", anchors: true };
    }
    case "brent": {
      const series = brent2026.map((a) => [a.date, a.value] as [string, number]);
      return { id, label: "Brent", value: ticker.brent, change: null, series, asOf: "2026-11-28", source: "Market snapshot", status: "snapshot", anchors: true };
    }
    case "us10y":
      return { id, label: "US 10Y", value: ticker.us10y, change: null, series: [], asOf: SNAPSHOT_DATE, source: "Market snapshot", status: "snapshot", anchors: true };
    case "usd":
      return { id, label: "Dollar index", value: ticker.dollarIndex, change: null, series: [], asOf: SNAPSHOT_DATE, source: "Market snapshot", status: "snapshot", anchors: true };
    case "in10y":
      return { id, label: "IN 10Y", value: ticker.in10y, change: null, series: [], asOf: SNAPSHOT_DATE, source: "Market snapshot", status: "snapshot" };
    case "call":
      return { id, label: "CALL", value: ticker.callRate, change: null, series: [], asOf: SNAPSHOT_DATE, source: "Market snapshot", status: "snapshot" };
    case "reer":
      return { id, label: "REER", value: ticker.reer, change: null, series: [], asOf: SNAPSHOT_DATE, source: "Market snapshot", status: "snapshot" };
  }
}
// the end
