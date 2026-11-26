"use client";
import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function LiveEventLoader() {
  const setParam = useStore((s) => s.setParam);

  useEffect(() => {
    const load = () => {
      fetch("/events/latest.json", { cache: "no-store" })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (data && typeof data.fed === "number" && Number.isFinite(data.fed)) {
            setParam("fed", data.fed);
          }
        })
        .catch(() => {});
    };

    load();
    const id = setInterval(load, 60_000);
    return () => clearInterval(id);
  }, [setParam]);

  return null;
}
