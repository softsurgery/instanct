import React from "react";
import { cn } from "../lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../components/sheet";
import { useRTL } from "./useRTL";

interface UseSheetOptions {
  children?: React.ReactNode | ((isOpen: boolean) => React.ReactNode);
  title?: React.ReactNode;
  description?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  overlayClassName?: string;
  onToggle?: () => void;
  side?: "top" | "right" | "bottom" | "left";
  showCloseButton?: boolean;
  animated?: boolean;
}

export function useSheet({
  children,
  title,
  description,
  className,
  headerClassName,
  overlayClassName,
  onToggle,
  side,
  showCloseButton,
  animated = true,
}: UseSheetOptions) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { isRTL } = useRTL();
  const resolvedSide = side ?? (isRTL ? "left" : "right");

  const openSheet = () => setIsOpen(true);
  const closeSheet = () => setIsOpen(false);

  const SheetFragment = (
    <Sheet
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) onToggle?.();
      }}
    >
      <SheetContent
        side={resolvedSide}
        showCloseButton={showCloseButton}
        overlayClassName={cn(
          !animated &&
            "!duration-0 data-[state=open]:!duration-0 data-[state=closed]:!duration-0",
          overlayClassName,
        )}
        className={cn(
          "overflow-y-auto",
          !animated &&
            "transition-none !duration-0 data-[state=open]:!duration-0 data-[state=closed]:!duration-0",
          className,
        )}
      >
        {(title || description) && (
          <SheetHeader className={headerClassName}>
            {title && <SheetTitle>{title}</SheetTitle>}
            {description && <SheetDescription>{description}</SheetDescription>}
          </SheetHeader>
        )}
        {typeof children === "function" ? children(isOpen) : children}
      </SheetContent>
    </Sheet>
  );

  return { SheetFragment, openSheet, closeSheet, isOpen };
}
