"use client"

import React from "react"
import { TrendingUp } from "lucide-react"
import { RadialBarChart, RadialBar, LabelList, Tooltip } from "recharts"
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

// Optionnel : ChartTooltipContent minimal
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

// Données fixes pour le radial chart
const chartData = [
{ browser: "chrome", visitors: 275, fill: "#f87171" }, // rouge
{ browser: "safari", visitors: 200, fill: "#60a5fa" }, // bleu
{ browser: "firefox", visitors: 187, fill: "#34d399" }, // vert
{ browser: "edge", visitors: 173, fill: "#facc15" }, // jaune
{ browser: "other", visitors: 90, fill: "#a78bfa" }, // violet
]

export function ChartRadialLabel() {
return ( <Card className="flex flex-col"> <CardHeader className="items-center pb-0"> <CardTitle>Radial Chart - Label</CardTitle> <CardDescription>January - June 2024</CardDescription> </CardHeader>

  <CardContent className="flex-1 pb-0">
    <ChartContainer className="mx-auto">
      <RadialBarChart
        width={250}
        height={250}
        data={chartData}
        startAngle={-90}
        endAngle={270}
        innerRadius={20}
        outerRadius={100}
      >
        <RadialBar dataKey="visitors" background>
          <LabelList
            position="insideStart"
            dataKey="browser"
            className="fill-white capitalize"
            fontSize={12}
          />
        </RadialBar>
        <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel={false} />} />
      </RadialBarChart>
    </ChartContainer>
  </CardContent>

  <CardFooter className="flex-col gap-2 text-sm">
    <div className="flex items-center gap-2 leading-none font-medium">
      Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
    </div>
    <div className="text-muted-foreground leading-none">
      Showing total visitors for the last 6 months
    </div>
  </CardFooter>
</Card>
)
}
