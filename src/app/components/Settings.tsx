import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Lock, 
  Mail, 
  Smartphone,
  Check,
  ChevronRight,
  LogOut,
  RefreshCw,
  Eye,
  EyeOff,
  Building,
  Sun,
  Moon,
  Monitor
} from 'lucide-react';
import clsx from 'clsx';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Form';
import { Badge } from './ui/Badge';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/Dialog';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';

import { useNavigate } from 'react-router';

interface SettingsProps {
  onLogout?: () => void;
  activeTab?: string;
}

export const Settings: React.FC<SettingsProps> = ({ onLogout, activeTab: initialTab }) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const isMountedRef = useRef(true);
  
  // General Profile State
  const [profileData, setProfileData] = useState({
    firstName: 'Piseth',
    lastName: 'Feng',
    email: 'master.piseth@fengshui.com',
    language: 'en',
    timezone: 'asia'
  });

  // Password Change State
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Bank Config State
  const [bankData, setBankData] = useState({
    merchantId: 'MER000123456',
    merchantName: 'Master Piseth Shop',
    accountId: 'piseth_shop@bakong',
    environment: 'production',
    apiKey: 'sk_live_8374928374928374',
    webhookUrl: 'https://api.masterpiseth.com/webhooks/bakong'
  });
  const [isBankLoading, setIsBankLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Active Sessions State (Mock)
  const [sessions, setSessions] = useState([
    { id: '1', device: 'MacBook Pro 16"', location: 'Phnom Penh, Cambodia', time: 'Active now', icon: Globe, current: true },
    { id: '2', device: 'iPhone 13 Pro', location: 'Phnom Penh, Cambodia', time: '2 hours ago', icon: Smartphone, current: false },
  ]);

  useEffect(() => {
    isMountedRef.current = true;
    if (initialTab) {
      const cleanTabId = initialTab.replace('settings-', '');
      // If user comes from 'security', redirect to 'general' view
      if (cleanTabId === 'security') {
        setActiveTab('general');
      } else if (['general', 'bank'].includes(cleanTabId)) {
        setActiveTab(cleanTabId);
      }
    }
    return () => {
      isMountedRef.current = false;
    };
  }, [initialTab]);

  const handleSaveProfile = () => {
    // Basic validation
    if (!profileData.firstName || !profileData.lastName || !profileData.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    const timer = setTimeout(() => {
      if (!isMountedRef.current) return;
      setIsLoading(false);
      toast.success('Profile settings saved successfully');
    }, 1000);
    return () => clearTimeout(timer);
  };

  const handleSavePassword = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error('New passwords do not match');
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    
    // Simulate API call
    const timer = setTimeout(() => {
      if (!isMountedRef.current) return;
      toast.success('Password updated successfully');
      setIsPasswordOpen(false);
      setPasswordData({ current: '', new: '', confirm: '' });
    }, 800);
    return () => clearTimeout(timer);
  };

  const handleTerminateSession = (id: string) => {
    if (confirm('Are you sure you want to log out this device?')) {
      setSessions(sessions.filter(s => s.id !== id));
      toast.success('Session terminated');
    }
  };

  const handleSaveBankConfig = () => {
    if (!bankData.merchantId || !bankData.accountId || !bankData.apiKey) {
      toast.error('Please fill in all required bank configuration fields');
      return;
    }

    setIsBankLoading(true);
    const timer = setTimeout(() => {
      if (!isMountedRef.current) return;
      setIsBankLoading(false);
      toast.success('Bank configuration saved successfully');
    }, 1500);
    return () => clearTimeout(timer);
  };

  const handleTestBankConnection = () => {
    toast.promise(
      new Promise((resolve) => {
        const timer = setTimeout(() => {
          resolve(true);
        }, 2000);
        return () => clearTimeout(timer);
      }),
      {
        loading: 'Testing connection to Bakong...',
        success: 'Connection successful! Merchant ID verified.',
        error: 'Connection failed',
      }
    );
  };

  const handleRegenerateApiKey = () => {
    if (confirm('Are you sure you want to regenerate your API Key? This will invalidate the current key immediately.')) {
      const newKey = 'sk_live_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setBankData({ ...bankData, apiKey: newKey });
      toast.success('New API Key generated');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h2 className="text-3xl font-medium tracking-tight text-primary">Settings</h2>
          <p className="text-muted-foreground">Manage your account preferences and system configurations.</p>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-white/10 overflow-x-auto no-scrollbar">
        {[
          { id: 'general', label: 'General & Security', icon: Globe },
          { id: 'bank', label: 'Bank Config', icon: Building },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              navigate(`/settings/${tab.id}`);
            }}
            className={clsx(
              "px-6 py-3 text-sm font-normal transition-all relative whitespace-nowrap flex items-center gap-2",
              activeTab === tab.id 
                ? "text-primary border-b-2 border-primary" 
                : "text-muted-foreground hover:text-foreground hover:bg-white/5"
            )}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {activeTab === 'general' && (
                <div className="space-y-6">
                  {/* General Tab Content */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Update your public profile and contact details.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="relative group cursor-pointer">
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-3xl font-medium text-white shadow-md shadow-primary/2 border-4 border-card">
                            MP
                          </div>
                          <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-xs text-white font-normal">Change</span>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-medium text-lg text-foreground">Master Piseth</h3>
                          <p className="text-muted-foreground text-sm">{profileData.email}</p>
                          <Badge variant="outline" className="mt-2 border-primary/30 text-primary bg-primary/5">Super Admin</Badge>
                        </div>
                        <Button 
                          variant="danger" 
                          onClick={onLogout}
                          className="ml-auto gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-normal text-foreground">First Name</label>
                          <Input 
                            value={profileData.firstName}
                            onChange={(e) => setProfileData({...profileData, firstName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-normal text-foreground">Last Name</label>
                          <Input 
                            value={profileData.lastName}
                            onChange={(e) => setProfileData({...profileData, lastName: e.target.value})}
                          />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="text-sm font-normal text-foreground">Email Address</label>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input 
                              value={profileData.email}
                              onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                              className="pl-9" 
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-4">
                        <Button 
                          variant="primary" 
                          onClick={handleSaveProfile}
                          isLoading={isLoading}
                        >
                          Save Changes
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Theme Settings Card */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Display Theme</CardTitle>
                      <CardDescription>Customize the appearance of your dashboard workspace.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                          onClick={() => setTheme('light')}
                          className={clsx(
                            "flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                            theme === 'light' 
                              ? "bg-primary/5 border-primary shadow-sm shadow-primary/1" 
                              : "bg-background border-border hover:bg-white/5 hover:border-primary/30"
                          )}
                        >
                          <div className={clsx(
                            "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
                            theme === 'light' ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                          )}>
                            <Sun className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className={clsx("font-medium", theme === 'light' ? "text-primary" : "text-foreground")}>Light Mode</h4>
                            <p className="text-xs text-muted-foreground">Standard brightness for daily work.</p>
                          </div>
                          {theme === 'light' && <Check className="w-5 h-5 text-primary" />}
                        </button>

                        <button
                          onClick={() => setTheme('dark')}
                          className={clsx(
                            "flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                            theme === 'dark' 
                              ? "bg-primary/5 border-primary shadow-sm shadow-primary/1" 
                              : "bg-background border-border hover:bg-white/5 hover:border-primary/30"
                          )}
                        >
                          <div className={clsx(
                            "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
                            theme === 'dark' ? "bg-primary text-white" : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                          )}>
                            <Moon className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className={clsx("font-medium", theme === 'dark' ? "text-primary" : "text-foreground")}>Black Mode</h4>
                            <p className="text-xs text-muted-foreground">Elegant luxury dark theme.</p>
                          </div>
                          {theme === 'dark' && <Check className="w-5 h-5 text-primary" />}
                        </button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Security Section (Merged) */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Password & Authentication</CardTitle>
                      <CardDescription>Manage how you sign in to your account.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Button 
                        variant="outline" 
                        className="justify-start gap-2 h-12 w-full hover:bg-secondary/80 transition-colors"
                        onClick={() => setIsPasswordOpen(true)}
                      >
                        <Lock className="w-4 h-4 text-primary" />
                        <div className="flex flex-col items-start">
                          <span className="font-normal text-foreground">Change Password</span>
                        </div>
                        <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
                      </Button>
                    </CardContent>
                  </Card>

                  
                </div>
              )}

              {activeTab === 'bank' && (
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            Bakong Payment Gateway
                            <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">KHQR Supported</Badge>
                          </CardTitle>
                          <CardDescription>Configure Bakong Open API settings for payment processing.</CardDescription>
                        </div>
                        <img 
                          src="https://bakong.nbc.org.kh/images/logo.svg" 
                          alt="Bakong" 
                          className="h-8 opacity-80"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <div className="flex items-center gap-4">
                          <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-500">
                            <Check className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="font-medium text-emerald-500">Service Active</h4>
                            <p className="text-sm text-emerald-500/80">Connected to Bakong {bankData.environment === 'production' ? 'Production' : 'Sandbox'} Environment</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="bg-background/50 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                            onClick={handleTestBankConnection}
                          >
                            Test Connection
                          </Button>
                          <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">Connected</Badge>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <h4 className="text-sm font-normal text-muted-foreground uppercase tracking-wider">Merchant Details</h4>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-normal">Merchant ID</label>
                            <Input 
                              placeholder="Enter Merchant ID" 
                              value={bankData.merchantId}
                              onChange={(e) => setBankData({...bankData, merchantId: e.target.value})}
                            />
                            <p className="text-xs text-muted-foreground">Unique identifier assigned by Bakong.</p>
                          </div>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-normal">Merchant Name</label>
                            <Input 
                              placeholder="Enter Merchant Name" 
                              value={bankData.merchantName}
                              onChange={(e) => setBankData({...bankData, merchantName: e.target.value})}
                            />
                            <p className="text-xs text-muted-foreground">Name that appears on customer bank statements.</p>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-normal">Bakong Account ID</label>
                            <Input 
                              placeholder="Enter Account ID" 
                              value={bankData.accountId}
                              onChange={(e) => setBankData({...bankData, accountId: e.target.value})}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="text-sm font-normal text-muted-foreground uppercase tracking-wider">API Configuration</h4>
                          
                          <div className="space-y-2">
                            <label className="text-sm font-normal">Environment</label>
                            <Select 
                              value={bankData.environment}
                              onChange={(e) => setBankData({...bankData, environment: e.target.value})}
                            >
                              <option value="production">Production (Live)</option>
                              <option value="sandbox">Sandbox (Testing)</option>
                            </Select>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-normal">API Key</label>
                            <div className="relative">
                              <Input 
                                type={showApiKey ? "text" : "password"} 
                                value={bankData.apiKey}
                                readOnly 
                                className="pr-10 font-mono bg-muted/50 text-muted-foreground" 
                              />

                              <button 
                                type="button"
                                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                                onClick={() => setShowApiKey(!showApiKey)}
                              >
                                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="text-sm font-normal">Webhook URL</label>
                            <Input 
                              value={bankData.webhookUrl}
                              onChange={(e) => setBankData({...bankData, webhookUrl: e.target.value})}
                            />
                            <p className="text-xs text-muted-foreground">URL for receiving payment notifications.</p>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
                        <Button 
                          variant="ghost"
                          onClick={() => {
                            setBankData({
                              merchantId: 'MER000123456',
                              merchantName: 'Master Piseth Shop',
                              accountId: 'piseth_shop@bakong',
                              environment: 'production',
                              apiKey: 'sk_live_8374928374928374',
                              webhookUrl: 'https://api.masterpiseth.com/webhooks/bakong'
                            });
                            toast.info('Changes discarded');
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          variant="primary"
                          onClick={handleSaveBankConfig}
                          isLoading={isBankLoading}
                        >
                          Save Configuration
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <DialogRoot open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>Ensure your account is secure by using a strong password.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input 
                type="password" 
                placeholder="Enter current password"
                value={passwordData.current}
                onChange={(e) => setPasswordData({...passwordData, current: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input 
                type="password" 
                placeholder="Enter new password"
                value={passwordData.new}
                onChange={(e) => setPasswordData({...passwordData, new: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Confirm New Password</label>
              <Input 
                type="password" 
                placeholder="Confirm new password"
                value={passwordData.confirm}
                onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPasswordOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSavePassword}>Update Password</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};
