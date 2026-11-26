"use client";
import { useEffect, useState } from "react";

export function LiveBanner() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const load = () => {
      fetch("/events/latest.json", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (!d) return;
          const parts: string[] = [];
          if (typeof d.fed === "number" && Number.isFinite(d.fed)) {
            parts.push(`Fed Funds Rate = ${d.fed.toFixed(2)}%`);
          }
          setMsg(parts.join(" • "));
        })
        .catch(() => setMsg(""));
    };

    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!msg) return null;
  return (
    <div
      style={{
        background: "rgba(245, 158, 11, 0.12)",
        border: "1px solid rgba(245, 158, 11, 0.35)",
        color: "#fbbf24",
        padding: "6px 12px",
        borderRadius: "6px",
        fontSize: "12px",
        marginBottom: "8px",
      }}
    >
      <strong>LIVE FRED UPDATE:</strong> {msg}
    </div>
  );
}
// the end
