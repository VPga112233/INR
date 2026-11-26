import { LiveEventLoader } from "@/components/stress/LiveEventLoader";
import { LiveBanner } from "@/components/stress/LiveBanner";

export default function StressEngine() {
  return (
    <div className="stress">
      <LiveBanner />
      <LiveEventLoader />
      {/* existing UI components … */}
      <ScenarioInputs />
      <div className="col cq">
        <PageHeader … />
        <KpiStrip />
        <FanChart />
        <div className="duo">
          <CrisisMeter />
          <WhatThisMeans />
        </div>
        <NextSteps />
      </div>
      <RightRail />
    </div>
  );
}