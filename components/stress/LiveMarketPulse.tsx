"use client";

import { useEffect, useState, useCallback } from "react";
import { useStore } from "@/lib/store";

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

  const applyToEngine = () => {
    if (data?.brent) {
      setParam("brent", Math.round(data.brent * 10) / 10);
    }
    setApplied(true);
    setTimeout(() => setApplied(false), 2500);
  };

  return (
    <div
      style={{
        background: "linear-gradient(180deg, rgba(20, 21, 26, 0.95) 0%, rgba(13, 14, 18, 0.98) 100%)",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        borderRadius: "8px",
        padding: "14px 18px",
        marginBottom: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.35)",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span
            style={{
              display: "inline-block",
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#10b981",
              boxShadow: "0 0 10px #10b981",
            }}
          />
          <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", color: "#e5e7eb" }}>
            LIVE GLOBAL DATA PULSE
          </span>
          <span
            style={{
              fontSize: "10px",
              background: "rgba(16, 185, 129, 0.15)",
              color: "#34d399",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              padding: "1px 6px",
              borderRadius: "4px",
            }}
          >
            ACTIVE FEEDS
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button
            onClick={fetchLive}
            disabled={loading}
            style={{
              background: "transparent",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#9ca3af",
              fontSize: "11px",
              padding: "3px 8px",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            {loading ? "Refreshing..." : "↻ Refresh"}
          </button>
          <button
            onClick={applyToEngine}
            style={{
              background: applied ? "#059669" : "rgba(59, 130, 246, 0.15)",
              border: `1px solid ${applied ? "#10b981" : "rgba(59, 130, 246, 0.4)"}`,
              color: applied ? "#ffffff" : "#60a5fa",
              fontSize: "11px",
              fontWeight: 600,
              padding: "3px 10px",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.2s ease",
            }}
          >
            {applied ? "✓ Shock Applied" : "⚡ Sync with Engine"}
          </button>
        </div>
      </div>

      {/* 3 Metric Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "12px",
        }}
      >
        {/* Metric 1: Brent Oil */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "6px",
            padding: "10px 14px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              🛢️ Brent Crude Oil
            </span>
            <span style={{ fontSize: "9px", color: "#60a5fa" }}>{data?.brentSource || "Alpha Vantage"}</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#f3f4f6" }}>
              {data?.brent ? `$${data.brent.toFixed(2)}` : "--"}
            </span>
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>/ bbl</span>
          </div>
          <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>
            As of: {data?.brentAsOf || "Latest trade"}
          </div>
        </div>

        {/* Metric 2: Fed Funds Rate */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "6px",
            padding: "10px 14px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              🏦 US Fed Funds Rate
            </span>
            <span style={{ fontSize: "9px", color: "#a78bfa" }}>FRED</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#f3f4f6" }}>
              {data?.fed ? `${data.fed.toFixed(2)}%` : "--"}
            </span>
            <span style={{ fontSize: "11px", color: "#9ca3af" }}>target level</span>
          </div>
          <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>
            As of: {data?.fedAsOf || "Official release"}
          </div>
        </div>

        {/* Metric 3: USD / INR */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
            borderRadius: "6px",
            padding: "10px 14px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
            <span style={{ fontSize: "10px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              🇮🇳 USD / INR Spot
            </span>
            <span style={{ fontSize: "9px", color: "#34d399" }}>ECB / Frankfurter</span>
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#f3f4f6" }}>
              {usdinrFeed?.value ? `₹${usdinrFeed.value.toFixed(2)}` : "--"}
            </span>
            {usdinrFeed?.change != null && (
              <span
                style={{
                  fontSize: "11px",
                  color: usdinrFeed.change >= 0 ? "#f87171" : "#34d399",
                }}
              >
                {usdinrFeed.change >= 0 ? `+${usdinrFeed.change.toFixed(2)}` : usdinrFeed.change.toFixed(2)}
              </span>
            )}
          </div>
          <div style={{ fontSize: "10px", color: "#6b7280", marginTop: "2px" }}>
            As of: {usdinrFeed?.asOf || "Daily reference"}
          </div>
        </div>
      </div>
    </div>
  );
}
// the end
