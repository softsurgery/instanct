import React from "react";
import {
  Badge,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@instanct/ui";
import { useRouter, usePathname } from "next/navigation";

export type SideNavItem = {
  href: string;
  title: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeVariant?: "default" | "secondary" | "destructive" | "outline";
  disabled?: boolean;
  external?: boolean;
  description?: string;
};

export type SideNavSection = {
  title: string;
  items: SideNavItem[];
};

export interface SideNavProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "onSelect"
> {
  items?: SideNavItem[];
  sections?: SideNavSection[];
  onSelect?: (item: SideNavItem) => void;
  activeHref?: string;
}

export function SideNav({
  className,
  items = [],
  sections,
  onSelect,
  activeHref,
  ...props
}: SideNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const flatItems = React.useMemo(
    () => (sections ? sections.flatMap((section) => section.items) : items),
    [sections, items],
  );

  const normalizedPath = React.useMemo(() => {
    if (activeHref) return activeHref;
    if (pathname) return pathname;
    if (typeof window !== "undefined" && window.location) {
      return window.location.pathname;
    }
    return "";
  }, [activeHref, pathname]);

  const activeItem = React.useMemo(
    () =>
      flatItems.find((item) => item.href === normalizedPath) || flatItems[0],
    [flatItems, normalizedPath],
  );

  const handleNavigate = (item: SideNavItem) => {
    if (item.disabled) return;

    if (onSelect) {
      onSelect(item);
      return;
    }

    if (item.external) {
      window.open(item.href, "_blank", "noopener,noreferrer");
    } else if (item.href && item.href !== "#" && router) {
      router.push(item.href);
    }
  };

  const handleMobileSelect = (href: string) => {
    const targetItem = flatItems.find((i) => i.href === href);
    if (targetItem) {
      handleNavigate(targetItem);
    }
  };

  return (
    <Select value={activeItem?.href || ""} onValueChange={handleMobileSelect}>
      <SelectTrigger className="h-11 w-full bg-background border-input font-medium">
        <SelectValue placeholder="Navigation">
          <div className="flex items-center gap-2.5 truncate pointer-events-none">
            {activeItem?.icon && (
              <span className="shrink-0">{activeItem.icon}</span>
            )}
            <span className="truncate">
              {activeItem?.title || "Navigation"}
            </span>
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {flatItems.map((item) => (
          <SelectItem
            key={item.href}
            value={item.href}
            disabled={item.disabled}
          >
            <div className="flex items-center justify-between w-full gap-3 py-0.5">
              <div className="flex items-center gap-2.5 min-w-0">
                {item.icon && (
                  <span className="shrink-0 text-muted-foreground">
                    {item.icon}
                  </span>
                )}
                <span className="font-medium text-sm truncate">
                  {item.title}
                </span>
              </div>
              {item.badge !== undefined && (
                <Badge
                  variant={item.badgeVariant || "secondary"}
                  className="text-[10px] px-1.5 py-0 shrink-0"
                >
                  {item.badge}
                </Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
