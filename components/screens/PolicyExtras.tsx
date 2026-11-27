"use client";
import { useMemo, useState } from "react";
import { scorecard } from "@/lib/data/deck";
import { EChart, tooltipBase, type EOption } from "@/components/charts/EChart";
import { COLORS, alpha } from "@/components/charts/theme";
import { Panel } from "@/components/ui/Panel";

const OC = ["#A3A3AD", COLORS.warn, COLORS.s2, "#D98B5F", "#4FB0B8"];

export function ScorecardRadar() {
  const [on, setOn] = useState<string[]>(["Big dollar sales", "FX curbs & controls", "Free float"]);
  const option = useMemo<EOption>(() => ({
    tooltip: { ...tooltipBase, trigger: "item" },
    radar: {
      indicator: scorecard.criteria.map((c) => ({ name: c, max: 3 })), radius: "64%", center: ["50%", "53%"], splitNumber: 3, shape: "polygon",
      axisName: { color: COLORS.text2, fontSize: 10 }, splitLine: { lineStyle: { color: COLORS.border } }, splitArea: { show: false }, axisLine: { lineStyle: { color: COLORS.border } },
    },
    series: [{
      type: "radar", symbol: "circle", symbolSize: 4,
      data: scorecard.options.map((o, i) => ({ o, i })).filter(({ o }) => on.includes(o.name)).map(({ o, i }) => ({
        name: `${o.name} · ${o.total}/15`, value: o.s,
        lineStyle: { color: OC[i % OC.length], width: 1.5 }, itemStyle: { color: OC[i % OC.length] }, areaStyle: { color: alpha(OC[i % OC.length], 0.08) },
      })),
    }],
  }), [on]);
  return (
    <Panel className="col-span-12 xl:col-span-5" letter="d" title="Option shapes · radar" source="Scoring, 0–3 per criterion" stamp="Toggle options below">
      <EChart option={option} height={248} />
      <div className="flex flex-wrap gap-1.5 mt-2">
        {scorecard.options.map((o, i) => {
          const a = on.includes(o.name);
          const col = OC[i % OC.length];
          return (
            <button key={o.name} className="chip h-[24px] text-11" data-active={a} onClick={() => setOn(a ? on.filter((x) => x !== o.name) : [...on, o.name])}>
              <span className="w-2 h-2" style={{ background: a ? col : "transparent", border: `1px solid ${col}` }} />
              {o.name}
            </button>
          );
        })}
      </div>
      <p className="text-11 text-text-3 mt-2">No single tool wins on every axis; every policy trades off reserves, growth, or prices.</p>
    </Panel>
  );
}
// the end
