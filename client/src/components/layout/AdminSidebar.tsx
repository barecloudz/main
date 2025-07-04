import React from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  FileText,
  CreditCard,
  BarChart,
  Settings,
  LogOut,
  Mail,
  Cloud,
  Sparkles,
  FileText as Receipt,
  Lightbulb as LightbulbIcon,
  Presentation
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SidebarNavProps {
  isCollapsed: boolean;
  links: {
    title: string;
    label?: string;
    icon: React.ReactNode;
    variant: 'default' | 'ghost';
    href: string;
  }[];
}

function SidebarNav({ links, isCollapsed }: SidebarNavProps) {
  const [location] = useLocation();

  return (
    <div
      data-collapsed={isCollapsed}
      className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2"
    >
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        {links.map((link, index) => {
          const isActive = location === link.href;

          return (
            <Link
              key={index}
              to={link.href}
              className={cn(
                "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive 
                  ? "bg-white text-[#191919] font-bold" 
                  : "bg-primary text-white hover:bg-primary/80",
                isCollapsed ? "justify-center" : ""
              )}
            >
              {link.icon}
              {!isCollapsed && <span>{link.title}</span>}
              {!isCollapsed && link.label && (
                <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                  {link.label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export function AdminSidebar() {
  const { user } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  
  // Get user initials for avatar fallback
  const getUserInitials = (): string => {
    if (!user) return 'A';
    
    const firstName = user.firstName || '';
    const lastName = user.lastName || '';
    
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    } else if (user.email) {
      return user.email[0].toUpperCase();
    }
    
    return 'A';
  };

  return (
    <div className={cn(
      "flex h-screen flex-col border-r bg-[#191919] text-white",
      isCollapsed ? "w-[70px]" : "w-[240px]"
    )}>
      <div className="flex h-14 items-center px-4 py-2">
        <Link 
          href="/admin/dashboard" 
          className={cn(
            "flex items-center gap-2 font-semibold",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <Cloud className="h-6 w-6 text-primary" />
          {!isCollapsed && <span>BareCloudz Admin</span>}
        </Link>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto h-8 w-8"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="m9 18 6-6-6-6" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="m15 18-6-6 6-6" />
            </svg>
          )}
        </Button>
      </div>
      <Separator />
      <div className="flex-1 overflow-auto">
        <SidebarNav
          isCollapsed={isCollapsed}
          links={[
            {
              title: "Dashboard",
              icon: <LayoutDashboard className="h-4 w-4" />,
              variant: "default",
              href: "/admin/dashboard",
            },
            {
              title: "Clients",
              icon: <Users className="h-4 w-4" />,
              variant: "ghost",
              href: "/admin/clients",
            },
            {
              title: "Form Submissions",
              label: "New",
              icon: <Mail className="h-4 w-4" />,
              variant: "ghost",
              href: "/admin/forms",
            },
            {
              title: "Invoices",
              icon: <CreditCard className="h-4 w-4" />,
              variant: "ghost",
              href: "/admin/invoices",
            },
            {
              title: "Analytics",
              icon: <BarChart className="h-4 w-4" />,
              variant: "ghost",
              href: "/admin/analytics",
            },
            {
              title: "Marketing Plans",
              icon: <Sparkles className="h-4 w-4" />,
              variant: "ghost",
              href: "/admin/marketing-plans",
            },
            {
              title: "Blog",
              icon: <FileText className="h-4 w-4" />,
              variant: "ghost",
              href: "/admin/blog",
            },
            {
              title: "Settings",
              icon: <Settings className="h-4 w-4" />,
              variant: "ghost",
              href: "/admin/settings",
            },
            {
              title: "Client Portal",
              icon: <Users className="h-4 w-4" />,
              variant: "ghost",
              href: "/client/dashboard",
            },
            {
              title: "Client Invoices",
              icon: <Receipt className="h-4 w-4" />,
              variant: "ghost",
              href: "/client/invoices",
            },
            {
              title: "Client Marketing",
              icon: <LightbulbIcon className="h-4 w-4" />,
              variant: "ghost",
              href: "/client/marketing-plan",
            },
          ]}
        />
      </div>
      <Separator />
      <div className="p-4">
        {!isCollapsed && (
          <div className="flex items-center gap-2 mb-4">
            <Avatar>
              <AvatarImage src={user?.profileImageUrl} />
              <AvatarFallback>{getUserInitials()}</AvatarFallback>
            </Avatar>
            <div className="grid gap-0.5 text-sm">
              <div className="font-medium">
                {user?.firstName} {user?.lastName}
              </div>
              <div className="text-xs text-muted-foreground">
                {user?.email}
              </div>
            </div>
          </div>
        )}
        <a
          href="/api/logout"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-500/10 transition-colors w-full",
            isCollapsed ? "justify-center" : ""
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>Log out</span>}
        </a>
      </div>
    </div>
  );
}
