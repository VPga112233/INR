import { NextResponse } from "next/server";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey || apiKey === "YOUR_FRED_API_KEY") {
    return NextResponse.json(
      { ok: false, error: "FRED_API_KEY is not configured in .env.local" },
      { status: 500 }
    );
  }

  const fedUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=${encodeURIComponent(apiKey)}&observation_start=2024-01-01&file_type=json`;

  try {
    const fedRes = await fetch(fedUrl, { cache: "no-store" });
    if (!fedRes.ok) {
      throw new Error(`FRED API returned ${fedRes.status}`);
    }
    const fedJson = await fedRes.json();
    const observations = Array.isArray(fedJson?.observations) ? fedJson.observations : [];
    const latestObs = [...observations].reverse().find((o) => o?.value !== "." && Number.isFinite(Number(o?.value)));
    if (!latestObs) {
      throw new Error("No valid FEDFUNDS observation found");
    }
    const fedRate = Number(latestObs.value);

    const payload = {
      fed: fedRate,
      asOf: latestObs.date ?? null,
      fetchedAt: new Date().toISOString(),
    };

    const outDir = path.join(process.cwd(), "public", "events");
    mkdirSync(outDir, { recursive: true });
    writeFileSync(path.join(outDir, "latest.json"), JSON.stringify(payload, null, 2));

    return NextResponse.json({ ok: true, data: payload });
  } catch (e) {
    console.error("Event fetch error", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
