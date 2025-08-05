"use client"

import * as React from "react"
import {
  IconCamera,
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileAi,
  IconFileDescription,
  IconFileWord,
  IconFolder,
  IconHelp,
  IconInnerShadowTop,
  IconListDetails,
  IconReport,
  IconSearch,
  IconSettings,
  IconUsers,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { UserButton } from "@clerk/nextjs"
import Image from "next/image"

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Analises",
      url: "#",
      icon: IconChartBar,
    },
    {
      title: "Usinas",
      url: "#",
      icon: IconFolder,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <a href="#" className="flex flex-col items-center justify-center">
              <div className="text-sm leading-tight">
                <Image
                  src="/logo.png"
                  width={100}
                  height={10}
                  alt="NE"
                  className="p-4"
                />
                <p className="text-xs text-muted-foreground">Versão Beta</p>
              </div>
            </a>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <UserButton
          showName={true}
          appearance={{
            elements: {
              userButtonBox: "flex items-center gap-2",
              userButtonOuterIdentifier: `font-semibold`,
              userButtonTrigger: "focus:shadow-none focus:outline-none",
            },
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
