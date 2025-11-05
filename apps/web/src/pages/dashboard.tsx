"use client";

import React from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { ChartPieSimple } from "@/components/charts/PieChart";
import LineChartExample from "@/components/charts/LineChart";
import { ChartRadialLabel } from "@/components/charts/ChartRadial";
import { ChartRadarLinesOnly } from "@/components/charts/RadarChart";

export default function Dashboard() {
  return (
    <div className="min-h-screen w-full p-4">
      <Tabs defaultValue="overview" className="w-full">
        {/* Onglets */}
        <TabsList className="flex justify-center gap-4 mb-6">
          <TabsTrigger value="overview">Vue densemble</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytique">Analytique</TabsTrigger>
        </TabsList>

        {/* Tab 1 : Overview */}
        <TabsContent
          value="overview"
          className="overflow-y-auto overflow-x-hidden h-[calc(100vh-160px)]"
        >
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full max-w-full">
            <ChartPieSimple />
            <LineChartExample />
            <ChartRadialLabel />
            <ChartRadarLinesOnly />
          </div>
        </TabsContent>

        {/* Tab 2 : Performance */}
        <TabsContent
          value="performance"
          className="overflow-y-auto overflow-x-hidden h-[calc(100vh-160px)]"
        >
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full max-w-full">
            <ChartRadialLabel />
            <LineChartExample />
          </div>
        </TabsContent>

        {/* Tab 3 : Analytique */}
        <TabsContent
          value="analytique"
          className="overflow-y-auto overflow-x-hidden h-[calc(100vh-160px)]"
        >
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 w-full max-w-full">
            <ChartPieSimple />
            <ChartRadarLinesOnly />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
