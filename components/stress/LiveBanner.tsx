import { useEffect, useState } from "react";

export function LiveBanner() {
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const id = setInterval(() => {
      fetch("/events/latest.json")
        .then((r) => r.json())
        .then((d) => {
          const parts = [];
          if (d.brent) parts.push(`Oil = $${d.brent.toFixed(1)}`);
          if (d.fed) parts.push(`Fed = ${d.fed.toFixed(2)}%`);
          setMsg(parts.join(" • "));
        })
        .catch(() => setMsg(""));
    }, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!msg) return null;
  return (
    <div className="bg-yellow-100 text-sm p-2 border-b">
      <strong>Live update:</strong> {msg}
    </div>
  );
}