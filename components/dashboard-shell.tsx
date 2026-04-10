'use client';

import * as React from 'react';
import { AppSidebar } from '@/components/sidebar/app-sidebar';
import { ModeToggle } from '@/components/ui/toggle-theme';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface DashboardShellProps {
  header?: React.ReactNode;
  children: React.ReactNode;
}

export function DashboardShell({ header, children }: DashboardShellProps) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            {header}
          </div>
          <div className="ml-auto" />
          <div className="pr-4">
            <ModeToggle />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
