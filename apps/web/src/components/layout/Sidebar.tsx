"use client";

import { cn } from "@/lib/utils";
import {
  Bell,
  Home,
  Users,
  ChevronDown,
  User,
  Shield,
  TableOfContents,
  Table,
  Table2,
  Cog,
  FileText,
  Bug,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@instanct/ui";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@instanct/ui";
import React from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";

interface SidebarProps {
  className?: string;
}

interface NavItem {
  title: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  children?: {
    title: string;
    icon?: React.ComponentType<{ className?: string }>;
    href: string;
  }[];
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "User Management",
    icon: Users,
    children: [
      {
        title: "Users",
        icon: User,
        href: "/user-management/users",
      },
      {
        title: "Roles",
        icon: Shield,
        href: "/user-management/roles",
      },
    ],
  },
  {
    title: "Audit Monitoring",
    icon: Bell,
    children: [
      {
        title: "Logger",
        icon: User,
        href: "/audit-monitoring/logger",
      },
      {
        title: "Bug Report",
        href: "/audit-monitoring/bug-report",
        icon: Bug,
      },
      {
        title: "Feedback",
        href: "/audit-monitoring/feedback",
        icon: MessageSquare,
      },
    ],
  },
  {
    title: "Content Management",
    icon: TableOfContents,
    children: [
      {
        title: "Application Properties",
        href: "/content-management/application-properties",
        icon: Shield,
      },
      {
        title: "Reference Types",
        href: "/content-management/reference-types",
        icon: Table2,
      },
      {
        title: "Reference Parameters",
        href: "/content-management/reference-parameters",
        icon: Table,
      },
      {
        title: "Pages",
        href: "/content-management/pages",
        icon: FileText,
      },
      {
        title: "Configuration",
        href: "/content-management/configuration",
        icon: Cog,
      },
    ],
  },
];

export const Sidebar = ({ className }: SidebarProps) => {
  const pathname = usePathname();

  const getActiveParent = (path: string) => {
    const parent = navItems.find(
      (item) =>
        item.children &&
        item.children.some((child) => path.startsWith(child.href)),
    );
    return parent ? parent.title : null;
  };

  const [prevPathname, setPrevPathname] = React.useState(pathname);
  const [openItem, setOpenItem] = React.useState<string | null>(() =>
    getActiveParent(pathname),
  );

  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setOpenItem(getActiveParent(pathname));
  }

  return (
    <div className={cn("hidden border-r md:block bg-sidebar text-sidebar-foreground", className)}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        {/* Header */}
        <div className="flex h-14 items-center border-b px-4 lg:h-15 lg:px-6">
          <Link
            href="/"
            className="flex justify-center items-center gap-2 font-semibold w-full"
          >
            <Image
              src="/logo.png"
              alt="Instanct Logo"
              width={25}
              height={25}
              className="dark:invert"
            />
            <span>Instanct</span>
          </Link>
          <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Toggle notifications</span>
          </Button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto">
          <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
            {navItems.map((item) =>
              item.children ? (
                <Collapsible
                  key={item.title}
                  open={openItem === item.title}
                  onOpenChange={(open) => setOpenItem(open ? item.title : null)}
                >
                  <CollapsibleTrigger
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 transition-all cursor-pointer",
                      openItem === item.title
                        ? "font-medium"
                        : "text-foreground hover:text-primary",
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.title}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openItem === item.title && "rotate-180",
                      )}
                    />
                  </CollapsibleTrigger>

                  <CollapsibleContent className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const isActive = pathname.startsWith(child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            "flex items-center gap-3 rounded-md px-3 py-2 transition-all",
                            isActive
                              ? "bg-primary text-muted font-medium"
                              : "text-muted-foreground hover:text-primary",
                          )}
                        >
                          {child.icon && <child.icon className="h-4 w-4" />}
                          <span>{child.title}</span>
                        </Link>
                      );
                    })}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link
                  key={item.title}
                  href={item.href!}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-all",
                    pathname.startsWith(item.href!)
                      ? "text-primary font-medium"
                      : "text-muted-foreground hover:text-primary",
                  )}
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.title}
                </Link>
              ),
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};
