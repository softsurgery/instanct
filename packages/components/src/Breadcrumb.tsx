import { useBreadcrumb, type BreadcrumbRoute } from "@instanct/contexts";
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@instanct/ui";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@instanct/ui";
import Link from "next/link";
import React from "react";

function Crumb({
  route,
  isLast,
}: {
  route: BreadcrumbRoute;
  isLast?: boolean;
}) {
  const title = <span className="block truncate">{route.title}</span>;
  const crumb =
    route.href && !isLast ? (
      <BreadcrumbLink asChild>
        <Link href={route.href}>{title}</Link>
      </BreadcrumbLink>
    ) : (
      <BreadcrumbPage>{title}</BreadcrumbPage>
    );

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="block min-w-0 max-w-full">{crumb}</span>
      </TooltipTrigger>
      <TooltipContent
        hideArrow
        side="bottom"
        sideOffset={6}
        className="max-w-xs border bg-background text-foreground"
      >
        {route.title}
      </TooltipContent>
    </Tooltip>
  );
}

function CrumbTrail({ routes }: { routes: BreadcrumbRoute[] }) {
  return (
    <>
      {routes.map((route, index) => {
        const isLast = index === routes.length - 1;

        return (
          <React.Fragment key={`${route.title}-${route.href ?? index}`}>
            {index > 0 ? <BreadcrumbSeparator className="shrink-0" /> : null}
            <BreadcrumbItem className="min-w-0 overflow-hidden">
              <Crumb route={route} isLast={isLast} />
            </BreadcrumbItem>
          </React.Fragment>
        );
      })}
    </>
  );
}

function CollapsedTrail({ routes }: { routes: BreadcrumbRoute[] }) {
  if (routes.length <= 2) {
    return <CrumbTrail routes={routes} />;
  }

  const first = routes[0];
  const last = routes[routes.length - 1];
  const middle = routes.slice(1, -1);

  return (
    <>
      <BreadcrumbItem className="min-w-0 max-w-[40%] overflow-hidden">
        <Crumb route={first} />
      </BreadcrumbItem>
      <BreadcrumbSeparator className="shrink-0" />
      <BreadcrumbItem className="shrink-0">
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              tabIndex={0}
              className="inline-flex rounded-sm outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            >
              <BreadcrumbEllipsis className="size-4" />
            </span>
          </TooltipTrigger>
          <TooltipContent
            hideArrow
            side="bottom"
            sideOffset={6}
            className="max-w-xs border bg-background text-foreground"
          >
            {middle.map((route, index) => (
              <span
                key={`${route.title}-${route.href ?? index}`}
                className="block"
              >
                {route.title}
              </span>
            ))}
          </TooltipContent>
        </Tooltip>
      </BreadcrumbItem>
      <BreadcrumbSeparator className="shrink-0" />
      <BreadcrumbItem className="min-w-0 overflow-hidden">
        <Crumb route={last} isLast />
      </BreadcrumbItem>
    </>
  );
}

export function BreadcrumbCommon() {
  const { routes } = useBreadcrumb();
  if (!routes?.length) return null;

  return (
    <TooltipProvider delayDuration={300}>
      <Breadcrumb className="min-w-0 flex-1 overflow-hidden">
        <BreadcrumbList className="flex-nowrap md:hidden">
          <CollapsedTrail routes={routes} />
        </BreadcrumbList>
        <BreadcrumbList className="hidden flex-nowrap md:flex">
          <CrumbTrail routes={routes} />
        </BreadcrumbList>
      </Breadcrumb>
    </TooltipProvider>
  );
}
