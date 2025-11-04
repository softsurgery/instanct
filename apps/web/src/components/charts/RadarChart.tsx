"use client"

import React from "react"
import { TrendingUp } from "lucide-react"
import { PolarAngleAxis, PolarGrid, Radar, RadarChart, Tooltip } from "recharts"

import {
Card,
CardContent,
CardDescription,
CardFooter,
CardHeader,
CardTitle,
} from "@/components/ui/card"

export interface ChartConfig {
[key: string]: { label?: string; color?: string }
}

interface ChartContainerProps {
children: React.ReactNode
className?: string
}

export const ChartContainer = ({ children, className }: ChartContainerProps) => (

  <div className={`relative ${className || ""}`}>{children}</div>
)

// Tooltip minimal pour Recharts
interface ChartTooltipContentProps {
hideLabel?: boolean
nameKey?: string
}

export const ChartTooltipContent = ({ hideLabel, nameKey }: ChartTooltipContentProps) => {
if (hideLabel) return null
return <div className="bg-white p-2 rounded shadow border text-sm">{nameKey}</div>
}

export const ChartTooltip = ({ cursor, content }: { cursor?: boolean; content: React.ReactNode }) => {
return <Tooltip cursor={cursor} content={() => content} />
}

// Données pour le radar chart
const chartData = [
{ month: "January", desktop: 186, mobile: 160 },
{ month: "February", desktop: 185, mobile: 170 },
{ month: "March", desktop: 207, mobile: 180 },
{ month: "April", desktop: 173, mobile: 160 },
{ month: "May", desktop: 160, mobile: 190 },
{ month: "June", desktop: 174, mobile: 204 },
]

export const ChartRadarLinesOnly = () => {
return ( <Card> <CardHeader className="items-center pb-4"> <CardTitle>Radar Chart - Lines Only</CardTitle> <CardDescription>
Showing total visitors for the last 6 months </CardDescription> </CardHeader>

```
  <CardContent className="pb-0">
    <ChartContainer className="mx-auto">
      <RadarChart width={250} height={250} data={chartData}>
        <PolarAngleAxis dataKey="month" />
        <PolarGrid radialLines={false} />
        <Radar
          dataKey="desktop"
          stroke="#f87171"
          fillOpacity={0}
          strokeWidth={2}
        />
        <Radar
          dataKey="mobile"
          stroke="#60a5fa"
          fillOpacity={0}
          strokeWidth={2}
        />
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel={false} />} />
      </RadarChart>
    </ChartContainer>
  </CardContent>

  <CardFooter className="flex-col gap-2 text-sm">
    <div className="flex items-center gap-2 leading-none font-medium">
      Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
    </div>
    <div className="text-muted-foreground flex items-center gap-2 leading-none">
      January - June 2024
    </div>
  </CardFooter>
</Card>
)
}