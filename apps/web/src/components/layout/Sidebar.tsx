import { cn } from "@/lib/utils";
import {
  Bell,
  Home,
  LineChart,
  Package2,
  ShoppingCart,
  Users,
  ChevronDown,
  User,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import React from "react";

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
    title: "Orders",
    href: "/orders",
    icon: ShoppingCart,
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
    title: "Analytics",
    href: "/analytics",
    icon: LineChart,
  },
];

export const Sidebar = ({ className }: SidebarProps) => {
  const [openItem, setOpenItem] = React.useState<string | null>(null);

  return (
    <div className={cn("hidden border-r bg-muted/40 md:block", className)}>
      <div className="flex h-full max-h-screen flex-col gap-2">
        {/* Header */}
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6" />
            <span>Acme Inc</span>
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
                  {/* Parent item */}
                  <CollapsibleTrigger
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2 text-muted-foreground hover:text-primary transition-all"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon && <item.icon className="h-4 w-4" />}
                      {item.title}
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform",
                        openItem === item.title && "rotate-180"
                      )}
                    />
                  </CollapsibleTrigger>

                  {/* Child items */}
                  <CollapsibleContent className="ml-6 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className="flex items-center gap-2 rounded-md px-3 py-1 text-muted-foreground hover:text-primary transition-all"
                      >
                        {child.icon && (
                          <child.icon className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span>{child.title}</span>
                      </Link>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <Link
                  key={item.title}
                  href={item.href!}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.title}
                </Link>
              )
            )}
          </nav>
        </div>
      </div>
    </div>
  );
};
