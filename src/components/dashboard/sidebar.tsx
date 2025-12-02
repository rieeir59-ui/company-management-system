'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { memo } from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarSeparator,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard,
  Users,
  Settings,
  User,
  LogOut,
  KeyRound,
  FileText,
  Database,
  FileUp,
  ClipboardCheck,
  Calendar,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useCurrentUser } from '@/context/UserContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/employee', label: 'Employees', icon: Users },
    { href: '/dashboard/team', label: 'Our Team', icon: User },
    { href: '/dashboard/about-me', label: 'About Me', icon: User },
    { href: '/dashboard/services', label: 'Services', icon: FileText },
    { href: '/dashboard/upload-files', label: 'Upload Files', icon: FileUp },
    { href: '/dashboard/files-record', label: 'Files Record', icon: Database },
    { href: '/dashboard/data-entry', label: 'Data Entry', icon: FileUp, roles: ['admin'] },
    { href: '/dashboard/saved-records', label: 'Saved Records', icon: Database, roles: ['admin', 'software-engineer', 'ceo'] },
    { href: '/dashboard/settings', label: 'Settings', icon: Settings, roles: ['software-engineer', 'admin'] },
    { href: '/dashboard/credentials', label: 'Credentials', icon: KeyRound, roles: ['software-engineer', 'admin'] },
  ];
  
const getInitials = (name: string) => {
    if (!name) return '';
    const nameParts = name.split(' ');
    if (nameParts.length > 1 && nameParts[nameParts.length - 1]) {
        return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
    }
    return name[0] ? name[0].toUpperCase() : '';
}

// Memoized Menu to prevent re-renders on path changes
const MemoizedSidebarMenu = memo(({ visibleMenuItems }: { visibleMenuItems: typeof menuItems }) => {
  const pathname = usePathname();
  return (
    <SidebarMenu>
      {visibleMenuItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <Link href={item.href} passHref>
              <SidebarMenuButton
                  isActive={pathname === item.href}
                  className={cn(pathname === item.href && 'bg-sidebar-accent text-sidebar-accent-foreground', 'group-data-[collapsible=icon]:justify-center')}
                  tooltip={item.label}
              >
                  <item.icon className="size-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
              </SidebarMenuButton>
          </Link>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
});
MemoizedSidebarMenu.displayName = 'MemoizedSidebarMenu';

export default function DashboardSidebar() {
  const { user: currentUser, logout } = useCurrentUser();
  const { toast } = useToast();
  const router = useRouter();

  const handleLogout = React.useCallback(() => {
    logout();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
    router.push('/login');
  }, [logout, router, toast]);

  const visibleMenuItems = menuItems.filter(item => {
    if (!item.roles) return true;
    return currentUser && item.roles.includes(currentUser.department);
  });
  
  return (
      <Sidebar side="left" collapsible="icon">
        <SidebarHeader className="p-4">
            <Link href="/dashboard" className="flex items-center gap-2 text-primary font-bold text-2xl font-headline">
                <Users className="w-8 h-8" />
                <span className="group-data-[collapsible=icon]:hidden">RI-HUB</span>
            </Link>
        </SidebarHeader>
        <SidebarContent className="p-2">
           {currentUser && (
            <>
              <div className="flex flex-col items-center text-center p-4 group-data-[collapsible=icon]:hidden">
                <Avatar className="h-16 w-16 mb-2 border-2 border-primary">
                    <AvatarFallback className="bg-secondary text-secondary-foreground font-bold text-2xl">
                    {getInitials(currentUser.name)}
                    </AvatarFallback>
                </Avatar>
                <p className="font-semibold text-sidebar-foreground">{currentUser.name}</p>
              </div>
              <SidebarSeparator />
            </>
          )}
          <MemoizedSidebarMenu visibleMenuItems={visibleMenuItems} />
        </SidebarContent>
        <SidebarFooter className="p-2">
            <SidebarSeparator />
            <SidebarMenu>
                <SidebarMenuItem>
                     <Button onClick={handleLogout} variant="ghost" className="w-full justify-start gap-2 group-data-[collapsible=icon]:justify-center">
                        <LogOut className="size-5" />
                        <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                    </Button>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
  );
}
