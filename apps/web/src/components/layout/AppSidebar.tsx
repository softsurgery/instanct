"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Home, Users, Bell, Folder, Settings, HelpCircle } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavMain } from "./NavMain";

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
          title: "Application Properties",
          url: "/content-management/application-properties",
        },
        {
          title: "Reference Types",
          url: "/content-management/reference-types",
        },
        {
          title: "Reference Parameters",
          url: "/content-management/reference-parameters",
        },
        {
          title: "Configuration",
          url: "/content-management/configuration",
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
      <SidebarHeader className="flex flex-row gap-4">
        <Image src="/logo.png" width={40} height={40} alt="Instanct" />
        {open && (
          <div>
            <h1 className="font-bold">Instanct</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={transformedNavMain} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
