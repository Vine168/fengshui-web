import '../errorSuppression'; // MUST BE FIRST - Error suppression
import { createBrowserRouter, Navigate, Outlet, useLocation, useNavigate } from "react-router";
import { Dashboard } from "./components/Dashboard";
import { Users } from "./components/Users";
import { FengShuiRules } from "./components/FengShuiRules";
import { PromoCodes } from "./components/PromoCodes";
import { Subscriptions } from "./components/Subscriptions";
import { Notifications } from "./components/Notifications";
import { TelegramConfiguration } from "./components/TelegramConfiguration";
import { AdminUsers } from "./components/AdminUsers";
import { Settings } from "./components/Settings";
import { Login } from "./components/Login";
import React, { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { Header } from "./components/Header";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "./components/ui/sheet";
import { Menu } from "lucide-react";
import { Button } from "./components/ui/Button";
import { TooltipProvider } from "./components/ui/tooltip";

// Auth Guard Component
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [isChecking, setIsChecking] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check auth status on mount
    const checkAuth = () => {
      const authStatus = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(authStatus);
      setIsChecking(false);
    };
    
    checkAuth();
  }, []);

  if (isChecking) {
    // Return null or a loader to prevent flash of content
    return null;
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Root Layout Component
const RootLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Track current active tab based on path
  const getActiveTab = () => {
    const path = location.pathname.substring(1);
    if (path === 'home' || path === '') return 'dashboard';
    if (path === 'users') return 'users';
    if (path === 'rules') return 'rules';
    if (path === 'promo-codes') return 'promo-codes';
    if (path === 'subscriptions') return 'subscriptions';
    if (path === 'notifications') return 'notifications';
    if (path === 'telegram') return 'telegram';
    if (path === 'admin') return 'admin-users';
    if (path.startsWith('settings/general')) return 'settings-general';
    if (path.startsWith('settings/security')) return 'settings-security';
    if (path.startsWith('settings/bank')) return 'settings-bank';
    if (path.startsWith('settings')) return 'settings-general';
    return 'dashboard';
  };

  const [activeTab, setActiveTab] = useState(getActiveTab());

  // Update active tab when location changes
  useEffect(() => {
    if (isMountedRef.current) {
      setActiveTab(getActiveTab());
    }
  }, [location.pathname]);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMountedRef.current) {
      setIsMobileSidebarOpen(false);
    }
  }, [location.pathname]);
  
  const handleLogout = () => {
    if (!isMountedRef.current) return;
    localStorage.removeItem("isLoggedIn");
    navigate("/login", { replace: true });
  };

  const handleMobileNavToggle = (open: boolean) => {
    if (!isMountedRef.current) return;
    setIsMobileSidebarOpen(open);
  };
  
  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden selection:bg-primary/30">
        {/* Background Effect */}
        <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background" />
        
        {/* Desktop Sidebar */}
        <div className="hidden md:flex h-full z-20 transition-all duration-300">
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={() => {}} // Controlled by routing now
            isCollapsed={isSidebarCollapsed}
            onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full relative z-10 overflow-hidden">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
            <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                 <span className="text-primary font-bold">M</span>
               </div>
               <h1 className="font-bold text-lg text-primary tracking-wide uppercase">Master Piseth</h1>
            </div>
            
            <Sheet open={isMobileSidebarOpen} onOpenChange={handleMobileNavToggle}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-foreground hover:bg-secondary/50">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-72 border-r border-border bg-background">
                <SheetTitle className="sr-only">Mobile Navigation Menu</SheetTitle>
                <SheetDescription className="sr-only">
                  Navigation links for Master Piseth admin dashboard.
                </SheetDescription>
                <Sidebar 
                  activeTab={activeTab} 
                  setActiveTab={() => {}} 
                  onNavigate={() => setIsMobileSidebarOpen(false)} 
                  isMobile={true}
                  onToggle={() => setIsMobileSidebarOpen(false)}
                />
              </SheetContent>
            </Sheet>
          </div>

          {/* New Unified Layout from App.tsx */}
          <main className="flex-1 overflow-y-auto custom-scrollbar relative flex flex-col">
            {/* Dynamic Aura Effects */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-primary/5 via-transparent to-transparent opacity-60" />
              <div className="absolute -top-[10%] -right-[5%] w-[50%] h-[50%] bg-primary/3 rounded-full blur-[140px] animate-pulse duration-[12s]" />
              <div className="absolute -bottom-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/3 rounded-full blur-[120px] animate-pulse duration-[10s]" />
            </div>

            <div className="relative z-10 flex-1 flex flex-col min-h-full">
              {/* Main Content Viewport */}
              <div className="flex-1 w-full animate-in fade-in slide-in-from-bottom-3 duration-1000 ease-out bg-card/40 dark:bg-card/20 backdrop-blur-xl md:border-l border-border/50 px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 sm:py-6">
                <div className="max-w-[1600px] mx-auto w-full">
                  <Header onLogout={handleLogout} />
                  <Outlet />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  );
};

// Settings Wrapper
const SettingsWrapper = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const tab = location.pathname.split('/').pop() || 'general';
  const fullTab = `settings-${tab === 'settings' ? 'general' : tab}`;
  
  return <Settings onLogout={() => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login", { replace: true });
  }} activeTab={fullTab} />;
};

const LoginComponent = () => {
  const navigate = useNavigate();
  const onLogin = () => {
    localStorage.setItem("isLoggedIn", "true");
    navigate("/home", { replace: true });
  };
  return <Login onLogin={onLogin} />;
};

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: LoginComponent,
  },
  {
    path: "/",
    Component: () => (
      <AuthGuard>
        <RootLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Navigate to="/home" replace /> },
      { path: "home", Component: Dashboard },
      { path: "users", Component: Users },
      { path: "admin", Component: AdminUsers },
      { path: "rules", Component: FengShuiRules },
      { path: "promo-codes", Component: PromoCodes },
      { path: "subscriptions", Component: Subscriptions },
      { path: "notifications", Component: Notifications },
      { path: "telegram", Component: TelegramConfiguration },
      { 
        path: "settings", 
        children: [
          { index: true, element: <Navigate to="general" replace /> },
          { path: "general", Component: SettingsWrapper },
          { path: "security", Component: SettingsWrapper },
          { path: "bank", Component: SettingsWrapper },
        ]
      },
      { path: "*", Component: () => <div className="p-12 text-center text-primary/50 text-2xl font-black uppercase tracking-widest">Protocol 404: Zone Not Found</div> },
    ],
  },
]);