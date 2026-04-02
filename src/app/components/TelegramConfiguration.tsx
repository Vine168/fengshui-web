import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input, Textarea } from './ui/Form';
import { MessageCircle, Copy, RefreshCcw, Send, CheckCircle2, Settings, Play, Pause, Bell, Plus, Trash2, FileText, Check, Info } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from './ui/utils';
import { Badge } from './ui/Badge';
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from './ui/table';
import { DialogRoot, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/Dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';
import { Checkbox } from './ui/checkbox';

interface TelegramGroup {
  id: string;
  name: string;
  chatId: string;
  events: string[];
}

const EVENT_TYPES = [
  { id: 'new_user', label: 'New User', color: 'purple' as const },
  { id: 'buy_plan', label: 'Buy Plan', color: 'success' as const },
  { id: 'daily_report', label: 'Daily Report', color: 'warning' as const },
];

const DEFAULT_TEMPLATES = {
  new_user: "🆕 *New User Registered*\n\nUser: {{username}}\nEmail: {{email}}\nDate: {{date}}\n\n#NewUser",
  buy_plan: "💰 *New Purchase*\n\nPlan: {{plan_name}}\nAmount: {{amount}}\nUser: {{username}}\n\n#Sale",
  daily_report: "📊 *Daily Report*\n\nDate: {{date}}\nNew Users: {{new_users_count}}\nRevenue: {{revenue}}\nActive Users: {{active_users}}"
};

export const TelegramConfiguration: React.FC = () => {
  const [botToken, setBotToken] = useState('123456789:ABCdefGHIjklMN0pqrSTUVwxyz');
  const isMountedRef = useRef(true);
  
  // Groups State
  const [groups, setGroups] = useState<TelegramGroup[]>([
    { id: '1', name: 'Admin Alerts', chatId: '-100123456789', events: ['new_user', 'buy_plan', 'daily_report'] }
  ]);
  const [isAddGroupOpen, setIsAddGroupOpen] = useState(false);
  const [newGroup, setNewGroup] = useState<{name: string, chatId: string, events: string[]}>({ 
    name: '', 
    chatId: '', 
    events: ['new_user', 'buy_plan'] 
  });

  // Templates State
  const [templates, setTemplates] = useState(DEFAULT_TEMPLATES);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleSaveTemplates = () => {
    if (!isMountedRef.current) return;
    toast.success('Message templates saved successfully');
  };

  const handleAddGroup = () => {
    if (!isMountedRef.current) return;
    if (!newGroup.name || !newGroup.chatId) {
      toast.error('Please fill in name and chat ID');
      return;
    }
    if (newGroup.events.length === 0) {
      toast.error('Please select at least one notification type');
      return;
    }
    setGroups([...groups, { id: Date.now().toString(), ...newGroup }]);
    setNewGroup({ name: '', chatId: '', events: ['new_user', 'buy_plan'] });
    setIsAddGroupOpen(false);
    toast.success('Group added successfully');
  };

  const handleRemoveGroup = (id: string) => {
    if (!isMountedRef.current) return;
    setGroups(groups.filter(g => g.id !== id));
    toast.success('Group removed');
  };

  const toggleEvent = (eventId: string) => {
    if (!isMountedRef.current) return;
    setNewGroup(prev => {
      const exists = prev.events.includes(eventId);
      return {
        ...prev,
        events: exists ? prev.events.filter(e => e !== eventId) : [...prev.events, eventId]
      };
    });
  };

  const sendTestMessage = (type: string, group?: TelegramGroup) => {
    if (!isMountedRef.current) return;
    if (groups.length === 0) {
      toast.error('No groups configured to send test message');
      return;
    }
    
    const targetGroups = group ? [group] : groups.filter(g => g.events.includes(type));
    
    if (targetGroups.length === 0) {
      toast.warning(`No groups subscribed to '${EVENT_TYPES.find(e => e.id === type)?.label}' notifications`);
      return;
    }

    const groupNames = targetGroups.map(g => g.name).join(', ');
    toast.success(`Test '${EVENT_TYPES.find(e => e.id === type)?.label}' message sent to: ${groupNames}`);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Telegram Bot Settings */}
        <Card className="relative overflow-hidden bg-card/40 dark:bg-black/40 backdrop-blur-xl border border-white/10 p-8 space-y-8 shadow-2xl group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-all duration-700" />
          
          <div className="relative">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary animate-pulse" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground/90 tracking-tight">Bot Authentication</h3>
                <p className="text-muted-foreground/60 text-xs uppercase tracking-widest font-black mt-0.5">Primary Gateway Protocol</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 ml-1">Secure Bot Token</label>
             <div className="relative group/input">
               <Input 
                 value={botToken} 
                 onChange={(e) => setBotToken(e.target.value)}
                 className="h-12 font-mono text-sm bg-black/5 dark:bg-black/40 border-white/10 focus:border-primary/30 transition-all pl-4 pr-12 rounded-xl"
                 placeholder="123456789:ABC..."
                 type="password"
               />
               <div className="absolute right-4 top-1/2 -translate-y-1/2 text-white/10 group-focus-within/input:text-primary/40 transition-colors">
                  <Check className="w-4 h-4" />
               </div>
             </div>
             <p className="text-[10px] text-muted-foreground/40 italic ml-1">Issued via Telegram @BotFather protocol</p>
          </div>

          {/* Premium Info Box */}
          <div className="bg-primary/5 border border-primary/10 rounded-2xl p-5 relative overflow-hidden group/info">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover/info:opacity-100 transition-opacity duration-500" />
            <h4 className="text-primary font-bold text-xs flex items-center gap-2 mb-3 tracking-wider uppercase">
               <div className="w-1 h-3 bg-primary rounded-full shadow-[0_0_8px_rgba(212,175,55,0.06)]" />
               Initialization Protocol:
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
              {[
                { step: "01", text: "Locate @BotFather on the Telegram network" },
                { step: "02", text: "Execute /newbot command sequence" },
                { step: "03", text: "Deploy the generated API Token above" },
                { step: "04", text: "Integrate bot into target communication node" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs text-foreground/70">
                  <span className="text-[10px] font-black text-primary/40">{item.step}</span>
                  <span className="h-px w-4 bg-white/[0.05]" />
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Telegram Groups & Channels */}
        <Card className="bg-card/40 dark:bg-black/40 backdrop-blur-xl border border-white/10 p-8 space-y-8 shadow-2xl overflow-hidden">
          <div className="flex justify-between items-center mb-2">
             <div className="flex items-center gap-4">
              <div className="w-1.5 h-8 bg-primary rounded-full shadow-[0_0_15px_rgba(212,175,55,0.03)]" />
              <div>
                <h3 className="text-xl font-bold text-foreground/90 tracking-tight">Communication Nodes</h3>
                <p className="text-muted-foreground/60 text-xs uppercase tracking-widest font-black mt-0.5">Active Destinations</p>
              </div>
            </div>
            <Button 
              variant="primary" 
              className="shadow-[0_0_20px_rgba(212,175,55,0.02)] font-bold text-xs uppercase tracking-widest h-10 px-6 rounded-xl"
              onClick={() => setIsAddGroupOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Node
            </Button>
          </div>

          <div className="relative -mx-8">
            {groups.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 mx-8 text-center space-y-4 rounded-3xl border border-dashed border-white/5 bg-black/20">
                 <div className="w-20 h-20 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10">
                    <Bell className="w-8 h-8 text-primary/20" />
                 </div>
                 <div>
                  <p className="font-bold text-foreground/60 tracking-tight">No Active Nodes</p>
                  <p className="text-xs text-muted-foreground/40 mt-1">Standby for group integration</p>
                 </div>
              </div>
            ) : (
              <Table className="border-t border-white/[0.03]">
                <TableHeader className="bg-white/[0.02]">
                  <TableRow className="border-b-white/[0.05] hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 py-5 pl-8">Network Node</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 py-5">Access Protocols</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/60 py-5 pr-8 text-right">Ops</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.map((group) => (
                    <TableRow key={group.id} className="border-b-white/[0.02] hover:bg-white/[0.03] group/row transition-colors">
                      <TableCell className="py-5 pl-8">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/5 border border-primary/10 flex items-center justify-center text-xs font-black text-primary/40 group-hover/row:text-primary transition-colors">
                            {group.name.substring(0, 2).toUpperCase()}
                          </div>
                          <div className="space-y-1">
                            <p className="font-bold text-foreground/90 leading-none">{group.name}</p>
                            <div className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-500/40" />
                              <p className="text-[10px] text-muted-foreground/30 font-mono tracking-tighter uppercase">{group.chatId}</p>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-5">
                        <div className="flex flex-wrap gap-1.5">
                          {group.events
                            .map(eventId => EVENT_TYPES.find(e => e.id === eventId))
                            .filter((event): event is typeof EVENT_TYPES[number] => event !== undefined)
                            .map(event => (
                              <Badge key={event.id} variant="outline" className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0 h-4 border-white/5 bg-white/[0.02] text-muted-foreground/50">
                                {event.label}
                              </Badge>
                            ))}
                        </div>
                      </TableCell>
                      <TableCell className="py-5 pr-8 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-lg text-primary/60 hover:text-primary hover:bg-primary/10 transition-all"
                            onClick={() => sendTestMessage('new_user', group)}
                          >
                            <Send className="w-3.5 h-3.5" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 w-8 p-0 rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition-all"
                            onClick={() => handleRemoveGroup(group.id)}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>

        {/* RIGHT COLUMN: Message Templates */}
        <Card className="bg-card/40 dark:bg-black/40 backdrop-blur-xl border border-white/10 p-8 min-h-[600px] flex flex-col shadow-2xl relative overflow-hidden group/templates">
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full -mr-32 -mb-32 pointer-events-none" />
          
          <div className="flex justify-between items-center mb-10 relative z-10">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground/90 tracking-tight">Signal Templates</h3>
                <p className="text-muted-foreground/60 text-xs uppercase tracking-widest font-black mt-0.5">Payload Formatting Protocols</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="border-white/10 hover:border-primary/40 hover:text-primary transition-all text-xs font-black uppercase tracking-widest rounded-xl px-5"
              onClick={handleSaveTemplates}
            >
              <Check className="w-4 h-4 mr-2" />
              Commit Changes
            </Button>
          </div>

          <Tabs defaultValue="new_user" className="flex-1 flex flex-col relative z-10">
                        <TabsList className="w-full bg-white/[0.02] border border-white/[0.05] p-1.5 mb-8 rounded-2xl max-w-2xl backdrop-blur-md">
              {EVENT_TYPES.map(type => (
                <TabsTrigger 
                  key={type.id} 
                  value={type.id} 
                  className="flex-1 text-[11px] font-black uppercase tracking-[0.15em] text-white/40 data-[state=active]:bg-primary data-[state=active]:text-black data-[state=active]:shadow-[0_0_15px_rgba(212,175,55,0.03)] rounded-xl transition-all duration-300 py-2.5"
                >
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {EVENT_TYPES.map(type => (
              <TabsContent key={type.id} value={type.id} className="flex-1 flex flex-col space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="flex-1 relative group/editor">
                  <div className="absolute -inset-0.5 bg-gradient-to-br from-primary/10 via-transparent to-primary/10 rounded-2xl opacity-0 group-hover/editor:opacity-100 transition-opacity duration-500" />
                  <Textarea 
                    className="relative min-h-[400px] font-mono text-sm leading-relaxed resize-none p-6 bg-black/5 dark:bg-black/60 border border-white/10 focus:border-primary/30 rounded-2xl transition-all shadow-inner custom-scrollbar" 
                    value={templates[type.id as keyof typeof templates]}
                    onChange={(e) => setTemplates({...templates, [type.id]: e.target.value})}
                  />
                  <div className="absolute bottom-6 right-6 flex gap-2">
                     <Button 
                       variant="secondary" 
                       className="h-10 px-4 rounded-xl border border-white/10 bg-black/5 dark:bg-black/60 backdrop-blur-md hover:border-primary/40 hover:text-primary transition-all group/test shadow-2xl"
                       onClick={() => sendTestMessage(type.id)}
                     >
                       <Send className="w-3.5 h-3.5 mr-2 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                       <span className="text-[10px] font-black uppercase tracking-widest">Transmit Test Signal</span>
                     </Button>
                  </div>
                </div>
                
                {/* Variables Cheat Sheet */}
                <div className="bg-primary/5 rounded-2xl p-6 space-y-4 border border-primary/10">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-[10px] uppercase tracking-[0.3em] text-primary/60 flex items-center gap-2">
                      <Info className="w-3.5 h-3.5" />
                      Injection Ready Variables
                    </p>
                    <span className="text-[9px] text-primary/30 font-medium">Protocol Optimized</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                    {type.id === 'new_user' && (
                      <>
                        {['username', 'email', 'date', 'ip'].map(v => (
                          <code key={v} className="bg-black/5 dark:bg-black/40 px-2 py-1.5 rounded-lg border border-white/10 text-primary/80 text-[10px] font-mono text-center hover:border-primary/20 transition-colors">{'{{' + v + '}}'}</code>
                        ))}
                      </>
                    )}
                    {type.id === 'buy_plan' && (
                      <>
                        {['username', 'plan_name', 'amount', 'currency'].map(v => (
                          <code key={v} className="bg-black/5 dark:bg-black/40 px-2 py-1.5 rounded-lg border border-white/10 text-primary/80 text-[10px] font-mono text-center hover:border-primary/20 transition-colors">{'{{' + v + '}}'}</code>
                        ))}
                      </>
                    )}
                    {type.id === 'daily_report' && (
                      <>
                         {['date', 'new_users_count', 'revenue', 'active_users'].map(v => (
                          <code key={v} className="bg-black/5 dark:bg-black/40 px-2 py-1.5 rounded-lg border border-white/10 text-primary/80 text-[10px] font-mono text-center hover:border-primary/20 transition-colors">{'{{' + v + '}}'}</code>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </div>

      <DialogRoot open={isAddGroupOpen} onOpenChange={setIsAddGroupOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Telegram Group</DialogTitle>
            <DialogDescription>
              Configure a new group for receiving notifications.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Group Name</label>
              <Input 
                placeholder="e.g. Alerts Channel" 
                value={newGroup.name}
                onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Chat ID</label>
              <Input 
                placeholder="e.g. -100123456789" 
                value={newGroup.chatId}
                onChange={(e) => setNewGroup({...newGroup, chatId: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Notification Types</label>
              <div className="space-y-2 border border-border rounded-lg p-3 bg-secondary/5">
                {EVENT_TYPES.map(event => (
                  <div key={event.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`event-${event.id}`} 
                      checked={newGroup.events.includes(event.id)}
                      onCheckedChange={() => toggleEvent(event.id)}
                    />
                    <label 
                      htmlFor={`event-${event.id}`} 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {event.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddGroupOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddGroup}>Add Group</Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};