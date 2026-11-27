import { LiveRupeePrice, RbiActionsTable, Scorecard, TripwireTable } from "@/components/screens/PolicyLab";
import { ScorecardRadar } from "@/components/screens/PolicyExtras";
import { PageHeader, SectionLabel } from "@/components/ui/PageHeader";

export default function PolicyLab() {
  return (
    <div className="screen">
      <PageHeader index="08" group="POLICY" title="RBI policies" />
      <div className="g12">
        <LiveRupeePrice />
        <RbiActionsTable />
        <SectionLabel n="02" title="Choosing the tools" desc="Comparing RBI policy tools and trade-offs" />
        <Scorecard />
        <ScorecardRadar />
        <SectionLabel n="03" title="Live tripwires & guard-rails" />
        <TripwireTable />
      </div>
    </div>
  );
}
// the end
