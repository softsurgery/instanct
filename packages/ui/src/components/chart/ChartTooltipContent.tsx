import React from "react";

export interface ChartTooltipContentProps {
  hideLabel?: boolean;
  nameKey?: string;
}

export const ChartTooltipContent = ({
  hideLabel,
  nameKey,
}: ChartTooltipContentProps) => {
  return (
    <div className="rounded border border-gray-200 bg-white p-2 text-sm shadow-md">
      {!hideLabel && nameKey}
    </div>
  );
};
