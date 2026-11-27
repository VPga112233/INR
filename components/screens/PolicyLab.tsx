"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { rbiActions, scorecard, SNAPSHOT_DATE } from "@/lib/data/deck";
import { inr, num, shortDate, signed } from "@/lib/format";
import { useLiveTripwires } from "@/lib/hooks";
import { useStore } from "@/lib/store";
import { EChart, type EOption } from "@/components/charts/EChart";
import { COLORS } from "@/components/charts/theme";
import { Panel } from "@/components/ui/Panel";
import { Tip } from "@/components/ui/Tip";

const [LO, HI] = [80, 100];
const COLOR_DARK_RED = "#B91C1C"; // dark red
const COLOR_LESS_RED = "#EF4444"; // less red (coral/light red)
const COLOR_YELLOW = "#F59E0B";   // yellow (amber)
const COLOR_GREEN = "#10B981";    // green

const RUPEE_BANDS = [
  { from: 94.5, to: 100, label: "Weak", color: COLOR_DARK_RED },
  { from: 90, to: 94.5, label: "RBI balanced", color: COLOR_LESS_RED },
  { from: 87, to: 90, label: "Balanced", color: COLOR_YELLOW },
  { from: 80.5, to: 87, label: "Strong", color: COLOR_GREEN },
];

function rateZoneLabel(v: number) {
  if (v >= 94.5) return { text: "Weak (94.5–100)", cls: "trig" };
  if (v >= 90) return { text: "RBI balanced (90–94.5)", cls: "trig" };
  if (v >= 87) return { text: "Balanced (87–90)", cls: "watch" };
  return { text: "Strong (80.5–87)", cls: "ok" };
}

export function LiveRupeePrice() {
  const f = useStore((s) => s.feeds.usdinr);
  const reer = useStore((s) => s.feeds.reer);
  const lastRefresh = useStore((s) => s.telemetry.lastRefresh);
  const live = f.status !== "snapshot";
  const v = f.value;
  const zone = rateZoneLabel(v);

  const option = useMemo<EOption>(() => {
    const t = (x: number) => (x - LO) / (HI - LO);
    const stops: [number, string][] = [
      [t(87), COLOR_GREEN],
      [t(90), COLOR_YELLOW],
      [t(94.5), COLOR_LESS_RED],
      [t(100), COLOR_DARK_RED],
    ];
    return {
      series: [
        {
          type: "gauge",
          startAngle: 0,
          endAngle: 180,
          clockwise: false,
          min: LO,
          max: HI,
          radius: "150%",
          center: ["50%", "94%"],
          splitNumber: 4,
          axisLine: { lineStyle: { width: 12, color: stops } },
          pointer: { length: "64%", width: 3, itemStyle: { color: COLORS.text } },
          anchor: { show: true, size: 9, itemStyle: { color: COLORS.text, borderColor: COLORS.panel, borderWidth: 2 } },
          axisTick: { show: false },
          splitLine: { length: 12, distance: -12, lineStyle: { color: COLORS.panel, width: 2 } },
          axisLabel: { distance: 18, color: COLORS.text3, fontSize: 10, formatter: (x: number) => `₹${x}` },
          detail: { show: false },
          data: [{ value: Math.min(HI, Math.max(80.5, v)) }],
        },
      ],
    };
  }, [v]);

  const stampTime = lastRefresh ? new Date(lastRefresh).toLocaleTimeString("en-GB", { timeZone: "Asia/Kolkata", hour12: false }) : null;

  return (
    <Panel
      className="col-span-12 lg:col-span-5 2xl:col-span-4"
      letter="a"
      title="Live rupee price"
      right={<span className={`tag ${live ? "ok" : ""}`}>{live ? "Live · 10s" : "Snapshot"}</span>}
      source={f.source}
      stamp={stampTime ? `Spot ${inr(v)} · ${stampTime} IST` : `Spot ${inr(v)} · ${shortDate(live ? f.asOf : SNAPSHOT_DATE)}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-20 text-text">
            USD/INR: <span className="mono c-brand">{inr(v)}</span> <span className="text-13 text-text-3">per $</span>
          </div>
          <div className="text-12 text-text-3 mt-0.5 flex flex-wrap items-center gap-2">
            {f.change !== null && (
              <span className={`mono ${f.change > 0 ? "c-neg" : f.change < 0 ? "c-pos" : "text-text-2"}`}>
                1D {signed(f.change)}
              </span>
            )}
            <span className="mono">REER {num(reer.value, 1)}</span>
            <span className={`tag ${zone.cls}`}>{zone.text}</span>
          </div>
        </div>
      </div>
      <EChart option={option} height={150} className="mt-2" />
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 mt-3 text-11">
        {RUPEE_BANDS.map((z) => (
          <span key={z.label} className="flex items-center gap-1.5 text-text-3">
            <span className="w-2 h-2" style={{ background: z.color }} />
            <span className="text-text-2">{z.label}</span> <span className="mono">{z.from}–{z.to}</span>
          </span>
        ))}
      </div>
    </Panel>
  );
}

export function RbiActionsTable() {
  return (
    <Panel
      className="col-span-12 lg:col-span-7 2xl:col-span-8"
      letter="b"
      title="RBI actions & policies to curb rupee depreciation"
      flush
      source="RBI MPC, FX disclosures & market operations"
      stamp={`${rbiActions.length} active measures`}
    >
      <div className="overflow-x-auto">
        <table className="tbl">
          <thead>
            <tr>
              <th>Policy / Action</th>
              <th>Tool</th>
              <th>How it curbs USD/INR rise</th>
              <th className="hidden xl:table-cell">Scale / Status</th>
              <th className="hidden 2xl:table-cell">Trade-off</th>
            </tr>
          </thead>
          <tbody>
            {rbiActions.map((a) => (
              <tr key={a.action}>
                <td className="text-text font-medium whitespace-nowrap">{a.action}</td>
                <td className="whitespace-nowrap"><span className="tag">{a.tool}</span></td>
                <td className="text-11 text-text-2 leading-[1.4]">{a.mechanism}</td>
                <td className="mono text-11 text-text whitespace-nowrap hidden xl:table-cell">{a.scale}</td>
                <td className="text-11 text-text-3 hidden 2xl:table-cell">{a.tradeoff}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

const LINKS: Record<string, string | null> = {
  "Big dollar sales": "/?rbi=50",
  "Sharp rate hikes": "/?repo=75",
  "FX curbs & controls": "/?curbs=1",
  "Gold import curbs": null,
  "Free float": "/?rbi=0&curbs=0",
};

function Squares({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-[3px]" aria-label={`${n} of 3`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={`w-[10px] h-[10px] ${i < n ? "bg-text-2" : "bg-panel-2 border border-border-2"}`} />
      ))}
    </span>
  );
}

export function Scorecard() {
  const router = useRouter();
  return (
    <Panel className="col-span-12 xl:col-span-7" letter="c" title="Policy scorecard" right={<span className="text-11 text-text-3">Click an option to load it in the Stress Engine</span>} flush source="Scoring, 0–3 per criterion" stamp="Max 15">
      <table className="tbl">
        <thead>
          <tr>
            <th>Option</th>
            {scorecard.criteria.map((c) => <th key={c} className="text-center!">{c}</th>)}
            <th className="num">Total</th>
            <th className="hidden 2xl:table-cell">Opportunity cost</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {scorecard.options.map((o) => {
            const href = LINKS[o.name];
            const row = (
              <>
                <td className="whitespace-nowrap text-text" title={o.cost}>{o.name}</td>
                {o.s.map((v, i) => <td key={i} className="text-center"><Squares n={v} /></td>)}
                <td className="num">{o.total}</td>
                <td className="text-11 max-w-[220px] truncate hidden 2xl:table-cell" title={o.cost}>{o.cost}</td>
                <td className="w-6 text-text-3">{href ? <ArrowUpRight size={14} strokeWidth={1.5} /> : null}</td>
              </>
            );
            return href ? (
              <tr key={o.name} className="cursor-pointer" onClick={() => router.push(href)}>
                {row}
              </tr>
            ) : (
              <Tip key={o.name} content="No direct lever in the model: gold curbs act through smuggling and the import basket.">
                <tr>{row}</tr>
              </Tip>
            );
          })}
        </tbody>
      </table>
      <div className="flex flex-wrap gap-2 px-3 py-2 border-t border-border">
        {scorecard.options.filter((o) => LINKS[o.name]).map((o) => (
          <Link key={o.name} href={LINKS[o.name]!} className="btn h-[24px] text-11">
            {o.name} <ArrowUpRight size={12} strokeWidth={1.5} />
          </Link>
        ))}
      </div>
    </Panel>
  );
}

export function TripwireTable() {
  const { items, fetchedAt, loading, refresh } = useLiveTripwires();
  const anyLive = items.some((x) => x.live);

  return (
    <Panel
      className="col-span-12"
      letter="e"
      title="Tripwires · watch and act"
      flush
      right={
        <div className="flex items-center gap-2">
          <span className={`tag ${anyLive ? "ok" : ""}`}>{loading && !items.length ? "FETCHING" : anyLive ? "LIVE" : "SNAPSHOT"}</span>
          <button type="button" onClick={refresh} disabled={loading} className="btn h-[22px] px-2 mono text-10">
            <RefreshCw size={11} className={loading ? "animate-spin" : ""} />
            {loading ? "REFRESHING" : "REFRESH"}
          </button>
        </div>
      }
      source="Live feeds: ECB Frankfurter & FRED"
      stamp={fetchedAt ? `Updated ${new Date(fetchedAt).toLocaleTimeString("en-GB", { hour12: false })} IST` : "Fetching live feeds"}
    >
      <table className="tbl">
        <thead>
          <tr>
            <th>Risk</th>
            <th>Live Reading</th>
            <th>Watch</th>
            <th>Act</th>
            <th className="num">Status</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 && loading ? (
            <tr>
              <td colSpan={5} className="py-4 text-center text-12 text-text-3 mono">
                Fetching live tripwire data from ECB & FRED...
              </td>
            </tr>
          ) : (
            items.map((t) => (
              <tr key={t.key}>
                <td className="text-text py-2 align-top">
                  <div className="flex items-center gap-1.5">
                    <span>{t.name}</span>
                  </div>
                  <div className={`text-10 mono mt-0.5 ${t.severity === "HIGH" ? "c-neg" : t.severity === "LIKELY" || t.severity === "MEDIUM" ? "c-warn" : "text-text-3"}`}>
                    {t.severity}
                  </div>
                </td>
                <td className="py-2 align-top">
                  <div className="mono text-12 text-text">{t.reading}</div>
                  <div className="mono text-10 text-text-3 mt-0.5">
                    {t.asOf ? `${shortDate(t.asOf)} · ` : ""}{t.source}
                  </div>
                </td>
                <td className="text-11 py-2 align-top">{t.watch}</td>
                <td className="text-11 py-2 align-top">{t.act}</td>
                <td className="num py-2 align-top">
                  <span className={`tag ${t.status === "TRIGGERED" ? "trig" : t.status === "WATCH" ? "watch" : "ok"}`}>{t.status}</span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </Panel>
  );
}
// the end
