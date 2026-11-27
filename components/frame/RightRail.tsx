"use client";
import { Activity, AlertTriangle, BookLock, Droplets, Landmark, RefreshCw, ShoppingBasket, type LucideIcon } from "lucide-react";
import { idealRupee, rupeeAnchors, SNAPSHOT_DATE } from "@/lib/data/deck";
import { inr, num, shortDate, signed } from "@/lib/format";
import { useLiveTripwires, useModel } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import { Panel } from "@/components/ui/Panel";
import { Spark } from "@/components/ui/Spark";
import { COLORS } from "@/components/charts/theme";
import type { TripStatus } from "@/lib/model/model";
import { useState } from "react";
import { WireFeed } from "./Wire";

function RangeBar({ label, lo, hi, v, ideal }: { label: string; lo: number; hi: number; v: number; ideal?: [number, number] }) {
  const span = hi - lo || 1;
  const p = (x: number) => Math.min(100, Math.max(0, ((x - lo) / span) * 100));
  return (
    <div className="py-2">
      <div className="flex justify-between text-11 mb-2">
        <span className="text-text-3">{label}</span>
        <span className="mono text-text-2">{num(lo)} – {num(hi)}</span>
      </div>
      <div className="rbar">
        {ideal && <div className="zone" style={{ left: `${p(ideal[0])}%`, width: `${p(ideal[1]) - p(ideal[0])}%` }} />}
        <div className="mk" style={{ left: `calc(${p(v)}% - 1px)` }} />
      </div>
      <div className="flex justify-between mono text-10 text-text-3 mt-1.5">
        <span>LOW</span>
        <span>HIGH</span>
      </div>
    </div>
  );
}

export function RupeeSnapshot() {
  const f = useStore((s) => s.feeds.usdinr);
  const live = f.status !== "snapshot";
  const s = f.series;
  const v = f.value;
  // 52-week range from live data if available, else anchor points within the last year
  const yr = s.filter(([d]) => d >= "2025-11-10");
  const vals52 = (yr.length ? yr : rupeeAnchors.filter((a) => a.date >= "2025-11-10").map((a) => [a.date, a.value] as [string, number])).map((x) => x[1]);
  const lo52 = Math.min(...vals52, v);
  const hi52 = Math.max(...vals52, v);
  const allFY = [...rupeeAnchors.map((a) => a.value), ...s.map((x) => x[1])];
  const loFY = Math.min(...allFY);
  const hiFY = Math.max(...allFY);
  const [ilo, ihi] = idealRupee.ideal;
  const gap = v - ihi;
  const up = (f.change ?? 0) > 0;

  return (
    <Panel
      title="Rupee Snapshot"
      right={<span className={`tag ${live ? "ok" : ""}`}>{live ? "Live" : "Snapshot"}</span>}
      source={live ? f.source : "Market snapshot"}
      stamp={`As of ${shortDate(live ? f.asOf : SNAPSHOT_DATE)}`}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <div className="text-11 text-text-3 tracking-[0.06em] mb-1">USD/INR · ₹ PER $</div>
          <div className="mono text-36 leading-none text-text">{num(v)}</div>
          {f.change !== null && (
            <div className="mt-2 flex items-center gap-2">
              <span className={`delta ${f.change === 0 ? "flat" : up ? "neg" : "pos"}`}>{signed(f.change)}</span>
              <span className="text-11 text-text-3">{up ? "Rupee weaker" : f.change === 0 ? "Unchanged" : "Rupee stronger"} vs prior {live ? "fix" : "anchor"}</span>
            </div>
          )}
        </div>
        <Spark data={s.slice(-60).map((x) => x[1])} width={96} height={40} color={COLORS.brandSoft} fill />
      </div>
      <div className="mt-3 border-t border-border pt-1">
        <RangeBar label="52-week range" lo={lo52} hi={hi52} v={v} />
        <RangeBar label="Since FY26 start (Apr 2025)" lo={loFY} hi={hiFY} v={v} />
        <RangeBar label="Ideal ₹85–88 on ₹80–100" lo={80} hi={100} v={v} ideal={[ilo, ihi]} />
      </div>
      <div className="mt-2 grid grid-cols-2 border border-border rounded-sm">
        <div className="p-2.5 border-r border-border">
          <div className="text-10 text-text-3 tracking-[0.06em]">GAP TO IDEAL CEILING</div>
          <div className="mono text-16 text-text mt-0.5">{gap > 0 ? `${inr(gap)}` : "Inside zone"}</div>
        </div>
        <div className="p-2.5">
          <div className="text-10 text-text-3 tracking-[0.06em]">AS % OF ₹88</div>
          <div className="mono text-16 text-text mt-0.5">{gap > 0 ? `${num((gap / ihi) * 100, 1)}%` : "0.0%"}</div>
        </div>
      </div>
    </Panel>
  );
}

const ICONS: Record<string, LucideIcon> = {
  oil: Droplets,
  fed: Landmark,
  spread: Activity,
  liquidity: BookLock,
  book: BookLock,
  cpi: ShoppingBasket,
  plan: AlertTriangle,
};
const cls = (s: TripStatus) => (s === "TRIGGERED" ? "trig" : s === "WATCH" ? "watch" : "ok");

export function TripwireList({ bare }: { bare?: boolean }) {
  const o = useModel();
  const [mode, setMode] = useState<"live" | "scenario">("live");
  const { items: liveItems, loading, refresh } = useLiveTripwires();

  const rows =
    mode === "live"
      ? liveItems.map((t) => ({
          key: t.key,
          name: t.name,
          reading: t.reading,
          threshold: t.watch,
          status: t.status,
        }))
      : o.trips;

  const n = rows.filter((t) => t.status !== "OK").length;
  const list = (
    <>
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-panel-2">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMode("live")}
            className={`chip h-[20px] px-1.5 mono text-10`}
            data-active={mode === "live"}
          >
            LIVE
          </button>
          <button
            type="button"
            onClick={() => setMode("scenario")}
            className={`chip h-[20px] px-1.5 mono text-10`}
            data-active={mode === "scenario"}
          >
            SCENARIO
          </button>
        </div>
        {mode === "live" && (
          <button type="button" onClick={refresh} disabled={loading} className="btn h-[20px] px-1.5 mono text-10">
            <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
            {loading ? "..." : "SYNC"}
          </button>
        )}
      </div>
      <ul>
        {mode === "live" && rows.length === 0 && loading ? (
          <li className="px-3 py-4 text-center mono text-11 text-text-3">Fetching live tripwires...</li>
        ) : (
          rows.map((t) => {
            const Icon = ICONS[t.key] ?? AlertTriangle;
            return (
              <li key={t.key} className="flex items-center gap-3 px-3 h-[52px] border-b border-border last:border-b-0">
                <span className="w-7 h-7 shrink-0 rounded-sm border border-border-2 bg-panel-2 flex items-center justify-center text-text-2">
                  <Icon size={14} strokeWidth={1.5} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-12 text-text truncate">{t.name}</div>
                  <div className="text-11 text-text-3 truncate">
                    <span className="mono text-text-2">{t.reading}</span> · {t.threshold}
                  </div>
                </div>
                <span className={`tag ${cls(t.status)}`}>{t.status}</span>
              </li>
            );
          })
        )}
      </ul>
    </>
  );
  if (bare) return list;
  return (
    <Panel title="Tripwires" right={<span className="mono text-11 text-text-3">{n} active</span>} source={mode === "live" ? "Live feeds: ECB & FRED" : "Risk register, scenario-linked"} stamp={mode === "live" ? "Live" : "Model estimate"} flush>
      {list}
    </Panel>
  );
}

function RailTabs() {
  const [tab, setTab] = useState<"trip" | "wire">("trip");
  const n = useStore((s) => s.wire.items.length);
  return (
    <section className="panel">
      <div className="rtabs">
        <button data-active={tab === "trip"} onClick={() => setTab("trip")}>Tripwires</button>
        <button data-active={tab === "wire"} onClick={() => setTab("wire")}>Wire{n ? ` · ${n}` : ""}</button>
      </div>
      {tab === "trip" ? <TripwireList bare /> : <WireFeed />}
    </section>
  );
}

export function RightRail() {
  return (
    <aside className="rail col" aria-label="Rupee snapshot, tripwires and news wire">
      <RupeeSnapshot />
      <RailTabs />
    </aside>
  );
}
// the end
