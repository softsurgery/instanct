import React from "react";
import { ExternalLink } from "lucide-react";
import {
  Badge,
  Button,
  cn,
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

const NavButton = ({
  item,
  isActive,
  onNavigate,
}: {
  item: SideNavItem;
  isActive: boolean;
  onNavigate: (item: SideNavItem) => void;
}) => (
  <Button
    variant="ghost"
    disabled={item.disabled}
    onClick={() => onNavigate(item)}
    aria-current={isActive ? "page" : undefined}
    className={cn(
      "group relative h-9 w-full justify-between rounded-lg px-3 text-sm font-medium",
      isActive
        ? "bg-primary/10 font-semibold text-primary hover:bg-primary/10 hover:text-primary"
        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
      item.disabled && "pointer-events-none cursor-not-allowed opacity-50",
    )}
  >
    {isActive && (
      <span className="absolute top-1/2 left-0 h-3/5 w-1 -translate-y-1/2 rounded-r-full bg-primary" />
    )}

    <span className="z-10 flex min-w-0 items-center gap-2.5 pl-1">
      {item.icon && (
        <span
          className={cn(
            "shrink-0",
            isActive
              ? "text-primary"
              : "text-muted-foreground group-hover:text-foreground",
          )}
        >
          {item.icon}
        </span>
      )}
      <span className="truncate">{item.title}</span>
    </span>

    <span className="z-10 ml-2 flex shrink-0 items-center gap-2">
      {item.badge !== undefined && (
        <Badge
          variant={item.badgeVariant || (isActive ? "default" : "secondary")}
          className="h-5 px-1.5 py-0 text-[10px]"
        >
          {item.badge}
        </Badge>
      )}
      {item.external && (
        <ExternalLink className="size-3.5 shrink-0 opacity-60" />
      )}
    </span>
  </Button>
);

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
    const targetItem = flatItems.find((item) => item.href === href);
    if (targetItem) {
      handleNavigate(targetItem);
    }
  };

  const isActive = (href: string) => normalizedPath === href;

  return (
    <>
      <div className="w-full lg:hidden">
        <Select
          value={activeItem?.href || ""}
          onValueChange={handleMobileSelect}
        >
          <SelectTrigger className="h-11 w-full border-input bg-background font-medium">
            <SelectValue placeholder="Navigation">
              <div className="pointer-events-none flex items-center gap-2.5 truncate">
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
                <div className="flex w-full items-center justify-between gap-3 py-0.5">
                  <div className="flex min-w-0 items-center gap-2.5">
                    {item.icon && (
                      <span className="shrink-0 text-muted-foreground">
                        {item.icon}
                      </span>
                    )}
                    <span className="truncate text-sm font-medium">
                      {item.title}
                    </span>
                  </div>
                  {item.badge !== undefined && (
                    <Badge
                      variant={item.badgeVariant || "secondary"}
                      className="shrink-0 px-1.5 py-0 text-[10px]"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <nav
        aria-label="Sidebar navigation"
        className={cn("hidden w-full flex-col gap-1 lg:flex", className)}
        {...props}
      >
        {sections
          ? sections.map((section, sectionIdx) => (
              <div key={section.title || sectionIdx} className="space-y-1">
                {section.title && (
                  <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
                    {section.title}
                  </p>
                )}
                {section.items.map((item) => (
                  <NavButton
                    key={item.href}
                    item={item}
                    isActive={isActive(item.href)}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            ))
          : items.map((item) => (
              <NavButton
                key={item.href}
                item={item}
                isActive={isActive(item.href)}
                onNavigate={handleNavigate}
              />
            ))}
      </nav>
    </>
  );
}
