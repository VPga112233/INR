"use client";

import { useEffect, useState, useCallback } from "react";
import { useStore } from "@/lib/store";
import { Panel } from "@/components/ui/Panel";
import { num, signed } from "@/lib/format";
import { Spark } from "@/components/ui/Spark";
import { COLORS } from "@/components/charts/theme";

type LiveData = {
  fed?: number;
  fedAsOf?: string | null;
  brent?: number;
  brentAsOf?: string | null;
  brentSource?: string;
  fetchedAt?: string;
};

export function LiveMarketPulse() {
  const [data, setData] = useState<LiveData | null>(null);
  const [loading, setLoading] = useState(false);
  const [applied, setApplied] = useState(false);

  const feeds = useStore((s) => s.feeds);
  const setParam = useStore((s) => s.setParam);

  const usdinrFeed = feeds?.usdinr;

  const fetchLive = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events/fetch", { cache: "no-store" });
      if (res.ok) {
        const json = await res.json();
        if (json?.ok && json.data) {
          setData(json.data);
        }
      }
    } catch (e) {
      console.warn("LiveMarketPulse fetch error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLive();
    const interval = setInterval(fetchLive, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchLive]);

  // Auto-sync live market feeds to engine base parameters
  useEffect(() => {
    if (data?.brent && typeof data.brent === "number") {
      setParam("brent", Math.round(data.brent * 100) / 100);
    }
  }, [data?.brent, setParam]);

  const applyToEngine = () => {
    if (data?.brent) {
      setParam("brent", Math.round(data.brent * 100) / 100);
    }
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  return (
    <Panel
      letter="0"
      title="Live Global Data Pulse"
      stamp="3 active feeds"
      source="Alpha Vantage · FRED · ECB via Frankfurter"
      right={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchLive}
            disabled={loading}
            className="btn h-[24px] px-2 mono text-10 text-text-3 hover:text-text"
          >
            {loading ? "FETCHING..." : "REFRESH"}
          </button>
          <button
            type="button"
            onClick={applyToEngine}
            className="btn h-[24px] px-2.5 mono text-10 font-medium border-brand text-brand hover:bg-brand/10 transition-colors"
          >
            {applied ? "APPLIED ✓" : "SYNC WITH ENGINE"}
          </button>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Metric 1: Brent Crude Oil */}
        <div className="p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="kpi-l">Brent Crude Oil</span>
            <span className="tag text-10">{data?.brentSource || "Alpha Vantage"}</span>
          </div>
          <div className="kpi-v">
            ${data?.brent ? num(data.brent, 2) : "--"}
            <small>/bbl</small>
          </div>
          <div className="flex items-center justify-between text-11 mt-1.5 text-text-3">
            <span className="mono">As of {data?.brentAsOf || "Latest trade"}</span>
            <span className="delta flat">Live Spot</span>
          </div>
        </div>

        {/* Metric 2: Fed Funds Rate */}
        <div className="p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="kpi-l">US Fed Funds Rate</span>
            <span className="tag text-10">FRED</span>
          </div>
          <div className="kpi-v">
            {data?.fed ? num(data.fed, 2) : "--"}
            <small>%</small>
          </div>
          <div className="flex items-center justify-between text-11 mt-1.5 text-text-3">
            <span className="mono">As of {data?.fedAsOf || "Daily release"}</span>
            <span className="delta flat">Daily Effective</span>
          </div>
        </div>

        {/* Metric 3: USD / INR */}
        <div className="p-3 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="kpi-l">USD/INR Reference</span>
            <span className="tag text-10">Live 10s</span>
          </div>
          <div className="kpi-v">
            ₹{usdinrFeed?.value ? num(usdinrFeed.value, 2) : "--"}
          </div>
          <div className="flex items-center justify-between text-11 mt-1.5 text-text-3">
            <span className="mono">As of {usdinrFeed?.asOf || "Daily reference"}</span>
            {usdinrFeed?.change != null ? (
              <span className={`delta ${usdinrFeed.change > 0 ? "neg" : usdinrFeed.change < 0 ? "pos" : "flat"}`}>
                {signed(usdinrFeed.change, 2)}
              </span>
            ) : (
              <span className="delta flat">0.00</span>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
// the end
