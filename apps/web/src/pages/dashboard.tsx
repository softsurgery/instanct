import React from "react";
import { ChartPieSimple } from "@/components/charts/PieChart";
import LineChartExample from "@/components/charts/LineChart";
import { ChartRadialLabel } from "@/components/charts/ChartRadial";
import { ChartRadarLinesOnly } from "@/components/charts/RadarChart";

export default function Dashboard() {
  return (
    <div className="min-h-screen p-4 overflow-auto grid gap-4 grid-cols-1 md:grid-cols-2">
      <ChartPieSimple />
      <LineChartExample />
      <ChartRadialLabel />
      <ChartRadarLinesOnly />
    </div>
  );
}
