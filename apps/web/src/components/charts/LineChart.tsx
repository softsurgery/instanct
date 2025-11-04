import React from "react"
import { LineChart, Line, XAxis, YAxis, Tooltip } from "recharts"
import ChartCard from "./ChartCard"

const data = [
  { month: "Jan", uv: 400 },
  { month: "Feb", uv: 300 },
  { month: "Mar", uv: 200 },
]

export default function LineChartExample() {
  return (
    <ChartCard title="Line Chart">
      <LineChart width={300} height={200} data={data}>
        <XAxis dataKey="month" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="uv" stroke="#82ca9d" />
      </LineChart>
    </ChartCard>
  )
}
