// Deck snapshot data. Figures are taken exactly from the team's final deck
// (The Black Swans · MacroMinds 3.0). Do not edit values here without the team.

export const SNAPSHOT_DATE = "2026-11-27";

export const ticker = {
  usdinr: 92.98, brent: 95.48, us10y: 4.91, in10y: 7.17, dollarIndex: 104.2,
  repo: 5.50, sdf: 5.25, msf: 5.75, callRate: 5.76, reservesB: 700.9,
  cpi: 6.09, wpi: 11.4, fwdPremium1M: 7.62, reer: 91.3, fedFunds: "3.75–4.00",
};

export type Anchor = { date: string; value: number; label?: string };

export const rupeeAnchors: Anchor[] = [ // snapshot fallback: anchor points only, label as "anchor points, not daily data"
  { date: "2025-04-01", value: 87.0, label: "FY26 start" },
  { date: "2026-05-15", value: 96.96, label: "Record low (May 2026)" },
  { date: "2026-10-29", value: 95.26, label: "Pre-midterms" },
  { date: "2026-11-27", value: 92.98, label: "27 Nov 2026 (Spot close)" },
];

export const events = [
  { date: "2026-03-02", label: "Hormuz shut" },
  { date: "2026-05-15", label: "Record low ₹96.96" },
  { date: "2026-07-01", label: "Ceasefire" },
  { date: "2026-09-15", label: "Fed hikes to 3.75–4.00%" },
  { date: "2026-10-07", label: "RBI hike: repo 5.50%" },
  { date: "2026-10-22", label: "Bank liquidity ~₹0" },
  { date: "2026-11-06", label: "US midterms: $4B FPI inflow in a week" },
  { date: "2026-11-12", label: "Oct CPI breaches 6% ceiling at 6.09%" },
  { date: "2026-11-20", label: "Forex reserves at $700.9B (16-wk low)" },
  { date: "2026-11-27", label: "RBI relaxes CRR to 90% (₹40K Cr injected); FPI Nov record ₹1.22L+ Cr" },
];

export const brent2026: Anchor[] = [
  { date: "2026-02-20", value: 72.9 }, { date: "2026-03-31", value: 118.4, label: "Peak" },
  { date: "2026-07-01", value: 71.6, label: "Ceasefire" }, { date: "2026-10-15", value: 113.2, label: "Re-escalation" },
  { date: "2026-11-28", value: 95.48, label: "28 Nov anchor" },
];

export const reservesWeekly: [string, number][] = [ // $B, week ending
  ["2026-02-20", 723.0], ["2026-02-27", 728.5], ["2026-03-27", 691.1], ["2026-05-01", 690.7],
  ["2026-08-07", 707.0], ["2026-08-28", 740.8], ["2026-09-04", 785.7], ["2026-09-25", 747.6],
  ["2026-10-02", 734.6], ["2026-10-23", 721.4], ["2026-11-06", 712.1], ["2026-11-13", 705.3], ["2026-11-20", 700.9],
];

export const fpiMonthly: [string, number][] = [ // $B net equity flow
  ["Apr", 1.2], ["May", -2.4], ["Jun", -1.8], ["Jul", 0.5], ["Aug", -3.1], ["Sep", -4.8],
  ["Oct", -8.2], ["Nov", 14.8],
];
export const fpiKpis = { outflowMonths: "7 of 11", marchRecord: "₹1.18L Cr", nov2to9Inflow: "₹53.7K Cr", novTotalInflow: "₹1.22L+ Cr (All-time high)", in10y: "7.48% → 7.17%" };

export const liquidity: [string, number][] = [ // ₹ lakh crore
  ["Feb–Mar", 2.5], ["23 Mar", -0.7], ["7 Sep", 11.6], ["22 Oct", 0], ["6 Nov", 2.3], ["20 Nov", 0.4], ["27 Nov", -0.42],
];

export const rbiDefence = { netSpotSalesFY26B: 53, forwardShortBookB: 103, grossSalesFY26B: 195, reserveDrainB: 51, rupeesPerBillionCr: 9400 };

export const importBasketFY26: [string, number][] = [["Crude oil", 25], ["Electronics/Semiconductors", 15], ["Gold", 10], ["Others", 50]];
export const outflowDriversQ1FY27 = {
  totalB: 15.2,
  split: [["FPI equity flight", 50], ["Income repatriation", 25], ["ECB debt servicing", 15], ["LRS outward remittances", 10]] as [string, number][],
};

export const twinDeficits = [ // combined fiscal deficit % GDP, CAD $B
  { fy: "FY23", fiscal: 9.2, cadB: -67 }, { fy: "FY24", fiscal: 8.6, cadB: -23 }, { fy: "FY25", fiscal: 7.8, cadB: -31 },
  { fy: "FY26", fiscal: 7.4, cadB: -42 }, { fy: "FY27E", fiscal: 7.5, cadB: -48 },
];

export const headline = {
  recordLow: 96.96, recordLowWhen: "May 2026", tradeGapB: -333.2, combinedFiscal: 7.4, cadPctGDP: 0.6,
  spreadBps: 251, savingsVsInvestment: "30.4% vs 32.8%", interestBill: "₹14.04L Cr (26.3% of budget)",
  crudeReliance: 88, q1OilBillB: 60.6, oilBillYoYB: 11.4, goldBillB: 72, goldTonnes: "757T → 721T",
  fpiEquityExit: "₹3.08T (Jan–Sep) / ₹3.64T (to 12 Oct)", foreignStake: "14.7% (14-year low)", asiaWorstCY26: -7,
  netCapitalOutflowQ1B: 15.2, bopB: -8.13, primaryIncomeB: -10.5, capitalShockB: -32.7,
  externalDebtB: 778, stDebtPctReserves: 23, oneYearDuesPctReserves: 50.5, reservesToDebt: "91% → 86%",
};

export const corporate = {
  ecbTotalB: 255, ecbUnhedgedB: 87, unhedgedPct: 34, fwdPremiumPath: [5.58, 7.62], refinancingCliffB: 120, cliffDate: "2028-03-31",
  techImportB: ">100", passThrough: "10% depreciation adds 30–40 bps to CPI", cpi: 6.09, ruralFood: 9.09,
  liquidityChain: ["₹11.6L Cr surplus (7 Sep)", "FX & VRRR drain ~₹11L Cr in six weeks", "~₹0 (22 Oct)", "Rebuilt to ₹2.3L Cr (6 Nov)", "Deficit −₹47,641 Cr (25 Nov)", "Call touches 5.76% vs 5.75% MSF"],
  fundingStress: ["5.76% call rate on 25 Nov, exceeding the 5.75% MSF", "System liquidity swings to ₹47,641 Cr deficit", "RBI rolls back daily CRR from 99% to 90% (27 Nov)", "Short-term CD rates +40–50 bps"],
  cdRates: "+40–50 bps in November", surplusFall: "Swung to ₹47.6K Cr deficit",
};

export const inflationSplit: [string, number][] = [["Food", 8.94], ["Villages", 6.63], ["Cities", 5.41]]; // Oct 2026 (released Nov 2026)

export const idealRupee = {
  ideal: [85, 88], today: 94, reerEquilibrium: "98–100", gap: "8% (REER)",
  zones: [ { from: 100, to: 94.3, label: "Too weak" }, { from: 94.3, to: 88, label: "Risky" }, { from: 88, to: 85, label: "IDEAL" },
           { from: 85, to: 80, label: "Risky" }, { from: 80, to: 75, label: "Too strong" } ],
  comparison: {
    columns: ["₹75–80", "₹85–88", "₹94–100"],
    rows: [ ["Petrol & imports", "Cheapest", "Manageable", "Costliest"], ["Exports & jobs", "Orders lost", "Competitive", "Tariff-capped"],
            ["Family prices", "Lowest", "Stable", "Up sharply"], ["RBI's dollars", "Burnt to hold it", "Rebuilt ($750B+)", "Drained (−$51B)"],
            ["Verdict", "Overvalued: REER 108–115", "True equilibrium", "Undervalued: REER 87–92"] ],
  },
  road: ["Bring FPI back: 2–3 yr tax lock-in", "Smooth spikes: sell $ only to calm panic", "Cool inflation: hold 5.50% repo; cut CPI to 4%", "Shrink $ bills: ethanol, gold bonds, trade in ₹"],
  result: "₹ strengthens from ₹94.26 to ₹85–88 as flows return & oil cools",
};

export const scorecard = { // 0–3 per criterion: Calms the ₹, Saves dollars, Guards growth, Curbs prices, Easy to do
  criteria: ["Calms the ₹", "Saves dollars", "Guards growth", "Curbs prices", "Easy to do"],
  options: [
    { name: "Big dollar sales", s: [3,1,2,2,2], total: 10, cost: "$51B of reserves gone in one month" },
    { name: "Sharp rate hikes", s: [2,3,1,2,2], total: 10, cost: "Growth forecasts cut to 6.0–6.9%" },
    { name: "FX curbs & controls", s: [2,3,2,1,2], total: 10, cost: "Hedging costs jumped to 7.62%" },
    { name: "Gold import curbs", s: [1,2,2,1,1], total: 7, cost: "Smuggling rose 35% after past hikes" },
    { name: "Free float", s: [1,3,3,1,3], total: 11, cost: "Prices up; unhedged firms hurt" },
  ] as { name: string; s: number[]; total: number; cost: string }[],
};

export type RbiAction = {
  action: string;
  tool: string;
  mechanism: string;
  scale: string;
  tradeoff: string;
};

export const rbiActions: RbiAction[] = [
  {
    action: "Spot dollar sales & smoothing",
    tool: "FX Intervention",
    mechanism: "PSU banks sell dollars into volatility spikes to absorb excess demand and slow sharp daily USD/INR jumps.",
    scale: "$53B net / $195B gross FY26 sales",
    tradeoff: "Drains ~₹9,400 Cr banking liquidity per $1B sold",
  },
  {
    action: "Short forward book & NDF intervention",
    tool: "Forwards",
    mechanism: "Caps near-term spot reserve drain by settling dollar sales forward while defending key psychological rupee levels.",
    scale: "$103B reported (~$200B est.)",
    tradeoff: "Reduces usable reserves as forward maturities roll due",
  },
  {
    action: "NOP caps, NDF ban & $5M curbs",
    tool: "FX Controls",
    mechanism: "Restricts bank Net Open Positions (NOP), offshore NDF arbitrage, and discretionary intraday dollar buying (FERR).",
    scale: "Active since Oct 2026",
    tradeoff: "Pushed 1M forward hedging premium up to 7.62%",
  },
  {
    action: "Repo hold at 5.50% & VRRR drain",
    tool: "Rates & Liquidity",
    mechanism: "Keeps call rate tight near 5.69%–5.75% MSF ceiling via VRRR and FX drain, raising rupee carry cost against FX shorts.",
    scale: "Repo 5.50% · SDF 5.25% · MSF 5.75%",
    tradeoff: "Tighter domestic funding pushes short-term CD rates +40–50 bps",
  },
  {
    action: "FCNR(B) & Buy/Sell USD-INR swaps",
    tool: "Swaps & Inflows",
    mechanism: "Attracts foreign-currency NRI deposits and injects rupee liquidity against temporary dollar inflows.",
    scale: "Swap window active",
    tradeoff: "Creates future dollar repayment obligations at maturity",
  },
  {
    action: "Oil-PSU dollar window & rupee trade",
    tool: "Flow Routing",
    mechanism: "Routes lumpy PSU crude-oil importer dollar demand off the spot screen and promotes INR-invoiced bilateral trade.",
    scale: "Q1 oil bill $60.6B · 88% crude reliance",
    tradeoff: "Requires sustained FX buffer and exporter/importer adoption",
  },
];



export const tripwires = [
  { name: "Oil shock returns", severity: "HIGH", watch: "Brent above $120 for two weeks", act: "Reopen oil-firm dollar window; draw oil stocks" },
  { name: "Fed hikes again", severity: "LIKELY", watch: "US 10-year back above 5%", act: "Follow only if core inflation keeps rising" },
  { name: "Hidden forward book", severity: "HIGH", watch: "~$200B owed shrinks usable reserves", act: "Let forwards expire slowly; keep FCNR buffer" },
  { name: "Food-led stagflation", severity: "MEDIUM", watch: "CPI above 6%, led by food prices", act: "Supply steps first, not more rate hikes" },
];



export const sources = [ // show in Sources screen; add URLs where known
  "RBI: BoP press release Q1 FY27; MPC October 2026 resolution; Annual Report 2025-26",
  "PIB / MoSPI: CPI September 2026", "Livemint: Union Budget 2026-27; Malhotra on the rupee (7 Oct)",
  "Reuters: Governor on reserves (8 Apr 2026)", "Chartforest (RBI data): External debt, June 2026",
  "BBC: US-India trade deal", "CNBC: Curbs on dollar demand (10 Oct); forward book (16 Oct, Ambit)",
  "Business Standard: Record FPI outflows (13 Oct); Rajan on reserves (27 Oct); Economic Survey 2026",
  "BusinessToday: Rupee after US midterms (10 Nov)", "ETBFSI: RBI's record FY26 defence", "BusinessLine: Spot and forward dollar sales",
  "Indian Express: FCNR(B) swap window", "Moody's via TradingView: forward premiums", "MUFG via FXStreet: FX curbs and hedging",
  "India Today: gold curbs", "ANI / ICICI: liquidity and bond yields (10 Nov)", "Rediff: How RBI fights the rupee fall",
  "Bank of Baroda: imported inflation (2025)", "IGIDR WP-2022-012", "Bhat (2022), IJFE", "Urbanomics: external exposure",
  "Finnovate: FY26 trade data; NOP cap and NDF ban", "Wright Research: cost of defending the rupee", "PolicyCircle: strategic oil reserves",
  "Icra via IPA: oil-firm losses", "CNBC-TV18: hike or protect growth?", "OneTradeJournal: 2013 taper-tantrum data",
  "Live feeds: ECB reference rates via Frankfurter; FRED (St. Louis Fed)",
];
// the end
