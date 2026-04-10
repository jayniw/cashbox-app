'use client';

import * as React from 'react';

import { NavMain } from '@/components/sidebar/nav-main';
import { NavUser } from '@/components/sidebar/nav-user';
import { TeamSwitcher } from '@/components/sidebar/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import {
  AudioLinesIcon,
  BookOpenIcon,
  BracesIcon,
  GalleryVerticalEndIcon,
  HandshakeIcon,
  PackageIcon,
  SignpostIcon,
  TerminalIcon,
  TerminalSquareIcon,
  UserIcon,
  UserKeyIcon,
} from 'lucide-react';

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
    {
      title: 'Partners',
    },
    {
      title: 'Socios',
      url: '/dashboard/partners',
      icon: <HandshakeIcon />,
    },
    {
      title: 'Operaciones',
      url: '/dashboard/operations',
      icon: <TerminalIcon />,
    },
    { title: 'Payment methods' },
    {
      title: 'Métodos de pago',
      url: '/dashboard/payment-methods',
      icon: <PackageIcon />,
    },
    {
      title: 'Providers',
    },
    {
      title: 'Proveedores',
      url: '/dashboard/payment-method-providers',
      icon: <PackageIcon />,
    },
    {
      title: 'Gateways',
      url: '/dashboard/payment-gateways',
      icon: <SignpostIcon />,
    },
    {
      title: 'Users',
    },
    {
      title: 'Usuarios',
      url: '/dashboard/users',
      icon: <UserIcon />,
    },
    {
      title: 'Roles',
      url: '/dashboard/roles',
      icon: <UserKeyIcon />,
    },
    {
      title: 'Terminales',
      url: '/dashboard/terminals',
      icon: <TerminalSquareIcon />,
    },

    {
      title: 'Documentation',
    },
    {
      title: 'Swagger UI',
      url: '/docs',
      icon: <BookOpenIcon />,
    },
    {
      title: 'Open Api',
      url: '/api/openapi',
      icon: <BracesIcon />,
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
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
