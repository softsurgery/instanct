"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Home,
  Users,
  Bell,
  Folder,
  Shield,
  User as UserIcon,
  Table2,
  Table,
  Settings,
  HelpCircle,
  Search,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
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
        ? item.items?.some((child) => pathname.startsWith(child.url)) || false
        : pathname.startsWith(item.url),
  }));

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-4">
          <Image
            src="/logo.png"
            alt="Instanct Logo"
            width={30}
            height={30}
            className="dark:invert"
          />
          <div>
            <h1 className="text-lg font-bold">Instanct</h1>
            <p className="text-xs text-muted-foreground">Admin Panel</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={transformedNavMain} />
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
