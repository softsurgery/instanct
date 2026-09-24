import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@instanct/ui/components/avatar";
import { cn } from "@instanct/lib";
import { DataTableCellVariant } from "../types";
import { Star } from "lucide-react";

interface DataTableCellProps {
  className?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  variant?: DataTableCellVariant;
  color?: string;
  maxStars?: number;
}

export default function DataTableCell({
  className,
  variant,
  value,
  color = "fill-yellow-400 text-yellow-400",
  maxStars = 5,
}: DataTableCellProps) {
  if (variant === DataTableCellVariant.TEXT) {
    return <div className={className}>{value}</div>;
  } else if (variant === DataTableCellVariant.NUMBER) {
    return <div className={className}>{value}</div>;
  } else if (variant === DataTableCellVariant.DATE) {
    return <div className={className}>{value}</div>;
  } else if (variant === DataTableCellVariant.DATE_TIME) {
    if (!value) return <div className={className}>No Date</div>;
    return (
      <div className="flex items-start flex-col">
        <div>{value?.toLocaleDateString()}</div>
        <div className="text-muted-foreground">
          {value?.toLocaleTimeString()}
        </div>
      </div>
    );
  } else if (variant === DataTableCellVariant.AVATAR) {
    return (
      <Avatar className={cn("w-24 h-24", className)}>
        <AvatarImage src={value?.src || value?.url} />
        <AvatarFallback>{value?.fallback}</AvatarFallback>
      </Avatar>
    );
  } else if (variant === DataTableCellVariant.RATING) {
    if (value === undefined) return <span className={className}>N/A</span>;
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {Array.from({ length: maxStars }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "w-4 h-4",
              i < (value as number)
                ? color
                : "text-muted-foreground/30",
            )}
          />
        ))}
      </div>
    );
  }
  return <div className={className}>{value}</div>;
}
