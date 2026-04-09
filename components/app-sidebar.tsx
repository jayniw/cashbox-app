'use client';

import * as React from 'react';

import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  GalleryVerticalEndIcon,
  AudioLinesIcon,
  TerminalIcon,
  TerminalSquareIcon,
  BotIcon,
  UsersIcon,
  BookOpenIcon,
  FrameIcon,
  PieChartIcon,
  MapIcon,
} from 'lucide-react';

// This is sample data.
const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  teams: [
    {
      name: 'Acme Inc',
      logo: <GalleryVerticalEndIcon />,
      plan: 'Enterprise',
    },
    {
      name: 'Acme Corp.',
      logo: <AudioLinesIcon />,
      plan: 'Startup',
    },
    {
      name: 'Evil Corp.',
      logo: <TerminalIcon />,
      plan: 'Free',
    },
  ],
  navMain: [
    // {
    //   title: 'Playground',
    //   url: '#',
    //   icon: <TerminalSquareIcon />,
    //   isActive: true,
    //   items: [
    //     {
    //       title: 'History',
    //       url: '#',
    //     },
    //     {
    //       title: 'Starred',
    //       url: '#',
    //     },
    //     {
    //       title: 'Settings',
    //       url: '#',
    //     },
    //   ],
    // },
    {
      title: 'Partners',
      url: '/dashboard/partners',
      icon: <GalleryVerticalEndIcon />,
    },
    {
      title: 'Terminales',
      url: '/dashboard/terminals',
      icon: <TerminalIcon />,
    },
    {
      title: 'Operaciones',
      url: '/dashboard/operations',
      icon: <TerminalSquareIcon />,
    },
    {
      title: 'Usuarios',
      url: '/dashboard/users',
      icon: <UsersIcon />,
    },
    {
      title: 'Roles',
      url: '/dashboard/roles',
      icon: <BotIcon />,
    },
    {
      title: 'API Documentación',
      url: '/docs',
      icon: <BookOpenIcon />,
    },
    // {
    //   title: 'Models',
    //   url: '#',
    //   icon: <BotIcon />,
    //   items: [
    //     {
    //       title: 'Genesis',
    //       url: '#',
    //     },
    //     {
    //       title: 'Explorer',
    //       url: '#',
    //     },
    //     {
    //       title: 'Quantum',
    //       url: '#',
    //     },
    //   ],
    // },
    // {
    //   title: 'Settings',
    //   url: '#',
    //   icon: <Settings2Icon />,
    //   items: [
    //     {
    //       title: 'General',
    //       url: '#',
    //     },
    //     {
    //       title: 'Team',
    //       url: '#',
    //     },
    //     {
    //       title: 'Billing',
    //       url: '#',
    //     },
    //     {
    //       title: 'Limits',
    //       url: '#',
    //     },
    //   ],
    // },
  ],
  projects: [
    {
      name: 'Design Engineering',
      url: '#',
      icon: <FrameIcon />,
    },
    {
      name: 'Sales & Marketing',
      url: '#',
      icon: <PieChartIcon />,
    },
    {
      name: 'Travel',
      url: '#',
      icon: <MapIcon />,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar
      collapsible="icon"
      {...props}
    >
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
