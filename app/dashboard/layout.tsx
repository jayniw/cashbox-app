import { AppSidebar } from '@/components/app-sidebar';
import { MainHeader } from '@/components/header';
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { ModeToggle } from '@/components/ui/toggle-theme';

export const metadata = {
  title: 'Dashboard',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="h-screen">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border bg-background/90 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <MainHeader />
          </div>
          <div className="ml-auto" />
          <div className="pr-4">
            <ModeToggle />
          </div>
        </header>
        <div className="flex-1 min-w-0 overflow-auto p-4 pt-2 w-full">
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
