import React from "react";

interface ChartTooltipProps {
  cursor?: boolean | object;
  content?: React.ReactNode;
}

export function ChartTooltip({ content }: ChartTooltipProps) {
  return <>{content}</>;
}
