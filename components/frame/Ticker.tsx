"use client";
import { num, signed } from "@/lib/format";
import { useStore } from "@/lib/store";
import { Spark } from "@/components/ui/Spark";
import { COLORS } from "@/components/charts/theme";
import { Tip } from "@/components/ui/Tip";
import type { Feed } from "@/lib/market/types";

const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

type Item = { k: string; label: string; value: number; d: number; unit?: string; change: number | null; series: number[]; live: boolean; up: "bad" | "good" | "neutral"; note: string; asOf: string };

const fromFeed = (f: Feed, k: string, label: string, d: number, up: Item["up"], unit = ""): Item => ({
  k, label, value: f.value, d, unit, change: f.change, series: f.series.slice(-30).map((x) => x[1]), live: f.status !== "snapshot", up, note: f.source, asOf: f.asOf,
});

export function Ticker() {
  const feeds = useStore((s) => s.feeds);
  const items: Item[] = [
    fromFeed(feeds.usdinr, "usdinr", "USD/INR", 2, "bad"),
    fromFeed(feeds.brent, "brent", "BRENT", 1, "bad", "$"),
    fromFeed(feeds.us10y, "us10y", "US 10Y", 2, "bad"),
    fromFeed(feeds.in10y, "in10y", "IN 10Y", 2, "bad"),
    fromFeed(feeds.usd, "usd", feeds.usd.status === "snapshot" ? "DOLLAR IDX" : "BROAD USD", feeds.usd.status === "snapshot" ? 0 : 2, "bad"),
    fromFeed(feeds.call, "call", "CALL", 2, "bad"),
    fromFeed(feeds.reer, "reer", "REER", 1, "neutral"),
  ];
  return (
    <div className="tape" role="marquee" aria-label="Market ticker">
      <div className="tape-track">
      {[...items, ...items].map((it, idx) => {
        const ch = it.change;
        const tone = ch === null || Math.abs(ch) < 1e-9 || it.up === "neutral" ? "flat" : (ch > 0) === (it.up === "good") ? "pos" : "neg";
        const col = tone === "pos" ? COLORS.pos : tone === "neg" ? COLORS.neg : COLORS.text3;
        return (
          <Tip key={`${it.k}-${idx}`} content={<><div className="text-text">{it.label}</div><div>{it.note}</div><div className="mono text-text-3">As of {it.asOf} · {it.live ? "Live feed" : "Snapshot"}</div></>}>
            <div className="tape-item">
              <span className={`src-tag ${it.live ? "live" : ""}`}>{it.live ? "L" : "S"}</span>
              <span className="text-text-3 text-11 tracking-[0.04em]">{it.label}</span>
              <span className="mono text-text">{it.unit}{num(it.value, it.d)}</span>
              {ch !== null ? <span className={`mono text-11 ${tone === "pos" ? "c-pos" : tone === "neg" ? "c-neg" : "text-text-3"}`}>{signed(ch, it.d === 0 ? 1 : it.d)}</span> : <span className="mono text-11 text-text-3">{MONTHS[Number(it.asOf.slice(5, 7)) - 1]}</span>}
              <Spark data={it.series} color={col} />
            </div>
          </Tip>
        );
      })}
      </div>
    </div>
  );
}
// the end
