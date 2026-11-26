import { useEffect } from "react";
import { useStore } from "@/lib/store";

export function LiveEventLoader() {
  const setScenario = useStore((s) => s.setScenario);

  useEffect(() => {
    const id = setInterval(() => {
      fetch("/events/latest.json")
        .then((r) => r.json())
        .then((data) => {
          setScenario((prev) => ({
            ...prev,
            // keep existing oil price (brent) unchanged – only update Fed rate
            fed: data.fed ?? prev.fed
          }));
        })
        .catch(console.error);
    }, 60_000); // every minute
    return () => clearInterval(id);
  }, [setScenario]);

  return null; // component only runs the side‑effect
}