import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";
import { writeFileSync } from "fs";

const OIL_URL = `https://commodities-api.com/api/latest?base=USD&symbols=BRENT&apikey=${process.env.OIL_API_KEY}`;
const FED_URL = `https://api.stlouisfed.org/fred/series/observations?series_id=FEDFUNDS&api_key=${process.env.FRED_API_KEY}&observation_start=2024-01-01`;

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
// Removed Oil price fetch – only Fed rate is needed
    const fedRes = await fetch(FED_URL);
    const fedJson = await fedRes.json();
    const latestObs = fedJson?.observations?.slice(-1)[0];
    const fedRate = Number(latestObs?.value ?? 0);

    const payload = { fed: fedRate, fetchedAt: new Date().toISOString() };
    const outPath = `${process.cwd()}/public/events/latest.json`;
    writeFileSync(outPath, JSON.stringify(payload, null, 2));

    return NextResponse.json({ ok: true, data: payload });
  } catch (e) {
    console.error("Event fetch error", e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}