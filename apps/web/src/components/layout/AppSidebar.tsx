"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Home, Users, Bell, Folder, Settings, HelpCircle } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center gap-2">
                <div className="flex aspect-square size-8 items-center justify-center">
                  <Image
                    src="/logo.png"
                    alt="Instanct Logo"
                    width={24}
                    height={24}
                    className="dark:invert"
                  />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-semibold">Instanct</span>
                  <span className="text-xs text-muted-foreground">
                    Admin Panel
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={transformedNavMain} />
      </SidebarContent>
      <SidebarFooter>
        {/* You can add NavUser here if you want */}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
