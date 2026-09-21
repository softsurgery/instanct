"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  Home,
  Users,
  Bell,
  Folder,
  Settings,
  HelpCircle,
  Link as LinkIcon,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";
import Link from "next/link";

// This is sample data.
const data = {
  user: {
    name: "Admin",
    email: "admin@example.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "User Management",
      url: "#",
      icon: Users,
      items: [
        {
          title: "Users",
          url: "/user-management/users",
        },
        {
          title: "Roles",
          url: "/user-management/roles",
        },
      ],
    },
    {
      title: "Audit Monitoring",
      url: "#",
      icon: Bell,
      items: [
        {
          title: "Logger",
          url: "/audit-monitoring/logger",
        },
      ],
    },
    {
      title: "Content Management",
      url: "#",
      icon: Folder,
      items: [
        {
          title: "Configuration",
          url: "/content-management/configuration",
        },
        {
          title: "Reference Types",
          url: "/content-management/reference-types",
        },
        {
          title: "Reference Parameters",
          url: "/content-management/reference-parameters",
        },
      ],
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
    {
      title: "Help",
      url: "/help",
      icon: HelpCircle,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // Transform the navMain data to include isActive state based on current path
  const transformedNavMain = data.navMain.map((item) => ({
    ...item,
    isActive:
      item.url === "#"
        ? item.items?.some((child) =>
            pathname.startsWith(child.url as string),
          ) || false
        : pathname.startsWith(item.url),
  }));

  const { open, toggleSidebar } = useSidebar();

  const hoverToggledRef = React.useRef(false);

  const handleMouseEnter = (
    e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
  ) => {
    e.stopPropagation();
    if (!open) {
      toggleSidebar();
      hoverToggledRef.current = true;
    }
  };

  const handleMouseLeave = (
    e: React.MouseEvent<HTMLDivElement, globalThis.MouseEvent>,
  ) => {
    e.stopPropagation();
    if (hoverToggledRef.current) {
      toggleSidebar();
      hoverToggledRef.current = false;
    }
  };

  return (
    <Sidebar
      collapsible="icon"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Instanct Logo"
                    width={40}
                    height={40}
                    className="dark:invert"
                  />
                </div>
                {open && (
                  <div className="flex flex-col gap-0.5 leading-none">
                    <span className="font-bold">Instanct</span>
                    <span className="text-xs text-muted-foreground">
                      Admin Panel
                    </span>
                  </div>
                )}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={transformedNavMain} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
