import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  BookOpen, 
  CreditCard, 
  Bell, 
  Settings,
  Send,
  Ticket,
  Lock,
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Building
} from 'lucide-react';
import clsx from 'clsx';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Button } from './ui/Button';
import { filterFigmaProps } from './ui/utils';
import logoImage from 'figma:asset/0bc35e9a665193604f05247f84c75e961cc2853e.png';

import { useNavigate } from 'react-router';

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onNavigate?: () => void;
  isCollapsed?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/home' },
  { id: 'users', label: 'App Users', icon: Users, path: '/users' },
  { id: 'rules', label: 'Feng Shui Rules', icon: BookOpen, path: '/rules' },
  { id: 'promo-codes', label: 'Promo Codes', icon: Ticket, path: '/promo-codes' },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, path: '/subscriptions' },
  { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
  { id: 'telegram', label: 'Telegram Notify', icon: Send, path: '/telegram' },
  { id: 'admin-users', label: 'User System', icon: ShieldCheck, path: '/admin' },
  { id: 'settings-general', label: 'General Settings', icon: Settings, path: '/settings/general' },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  onNavigate,
  isCollapsed = false,
  onToggle,
  isMobile = false
}) => {
  const navigate = useNavigate();
  return (
    <div className={clsx(
      "h-full bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border shrink-0 shadow-2xl z-20 transition-[width] duration-300 ease-in-out",
      isMobile ? "w-full" : (isCollapsed ? "w-20" : "w-full md:w-64")
    )}>
      <div className={clsx(
        "flex items-center border-b border-sidebar-border transition-all duration-300 ease-in-out",
        (isCollapsed && !isMobile) ? "p-[15px] justify-center" : "p-[15px] gap-3 justify-center"
      )}>
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-12 h-12 flex-shrink-0">
            <img 
              src={logoImage} 
              alt="MASTER PISETH" 
              className="w-full h-full object-contain" 
            />
          </div>
          {(!isCollapsed || isMobile) && (
            <div className="min-w-0">
              <h1 className="font-bold text-lg tracking-wide text-primary text-[16px] truncate">
                MASTER PISETH
              </h1>
              <p className="text-xs text-sidebar-foreground/60 uppercase tracking-widest truncate">Admin Panel v1.0.1</p>
            </div>
          )}
        </div>
        
        {isMobile && (
          <button
            onClick={onToggle}
            className="p-2 rounded-md hover:bg-sidebar-accent/50 text-sidebar-foreground transition-colors ml-auto"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar flex flex-col px-[12px] pt-[24px] pb-[0px]">
        <div className="flex-1 space-y-1">
          {menuItems
            .filter(item => item.id !== 'settings-security')
            .map((item) => {
              // Rename General Settings to just Settings
              const isSettings = item.id === 'settings-general';
              const label = isSettings ? 'Settings' : item.label;
              
              // Highlight Settings if on any its tabs (General, Security, Bank)
              const isActive = activeTab === item.id || 
                (isSettings && (activeTab === 'settings-security' || activeTab === 'settings-bank'));
              
              return (
                <div key={item.id} className="space-y-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button
                        type="button"
                        onClick={() => {
                          navigate(item.path || '/');
                          onNavigate?.();
                        }}
                        aria-label={label}
                        aria-current={isActive ? 'page' : undefined}
                        className={clsx(
                          "w-full flex items-center transition-all duration-300 relative group rounded-md",
                          isActive
                            ? "bg-sidebar-accent text-sidebar-primary shadow-lg shadow-sidebar-primary/10 ring-1 ring-sidebar-primary/20" 
                            : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                          (isCollapsed && !isMobile) ? "justify-center px-2 py-3" : "gap-3 px-4 py-3"
                        )}
                      >
                        {isActive && (
                          <div
                            className={clsx(
                              "absolute inset-y-0 left-0 bg-sidebar-primary rounded-full shadow-[0_0_8px_var(--sidebar-primary)]",
                              (isCollapsed && !isMobile) ? "w-1 my-2 left-1" : "w-1 my-2"
                            )}
                          />
                        )}
                        
                        <item.icon className={clsx("w-5 h-5 relative z-10", isActive ? "text-sidebar-primary" : "group-hover:text-sidebar-primary/80 transition-colors")} />
                        
                        {(!isCollapsed || isMobile) && (
                          <span className={clsx("font-medium relative z-10 whitespace-nowrap flex-1 text-left", isActive ? "font-semibold" : "")}>
                            {label}
                          </span>
                        )}
                      </button>
                    </TooltipTrigger>
                    {isCollapsed && !isMobile && (
                      <TooltipContent side="right">
                        {label}
                      </TooltipContent>
                    )}
                  </Tooltip>
                </div>
              );
            })}
        </div>

        {/* System Version info at the bottom of the scrollable area */}
        
      </nav>

      {!isMobile && (
        <div className="p-4 border-t border-sidebar-border mt-auto transition-all duration-300 flex justify-center">
          <button
            onClick={onToggle}
            className={clsx(
              "flex items-center rounded-md hover:bg-sidebar-accent/50 text-sidebar-foreground transition-all duration-300",
              isCollapsed ? "p-2 gap-0 justify-center" : "w-full px-4 py-3 gap-3 justify-center"
            )}
            aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <ChevronRight className="w-5 h-5 flex-shrink-0" /> : <ChevronLeft className="w-5 h-5 flex-shrink-0" />}
            <span className={clsx(
              "font-medium whitespace-nowrap text-[15px] font-normal transition-all duration-300 overflow-hidden",
              isCollapsed ? "max-w-0 opacity-0" : "max-w-[150px] opacity-100"
            )}>
              Collapse Sidebar
            </span>
          </button>
        </div>
      )}
    </div>
  );
};