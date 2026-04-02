import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { Input, Textarea, Select } from './ui/Form';
import { Send, History, CheckCircle, RefreshCw, Plus } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/Badge';
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/Dialog';
import { toast } from 'sonner';

interface NotificationLog {
  id: string;
  time: string;
  target: string;
  message: string;
  status: string;
}

const MOCK_LOGS: NotificationLog[] = [
  { id: '1', time: '2025-05-15T08:30:00', target: 'All Users', message: 'System Maintenance Notice', status: 'Delivered' },
  { id: '2', time: '2025-05-14T14:15:00', target: 'Missing Fire', message: 'Lucky Color Red is trending today!', status: 'Delivered' },
  { id: '3', time: '2025-05-12T09:00:00', target: 'Free Only', message: 'Upgrade to Premium 50% Off', status: 'Delivered' },
  { id: '4', time: '2025-05-10T11:45:00', target: 'Wood Element', message: 'Special Feng Shui Tips for Wood signs', status: 'Delivered' },
  { id: '5', time: '2025-05-08T16:20:00', target: 'All Users', message: 'New Feature: Daily Luck Score', status: 'Delivered' },
];

export const Notifications: React.FC = () => {
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [targetElement, setTargetElement] = useState('all');
  const [targetMissing, setTargetMissing] = useState('none');
  const [targetSub, setTargetSub] = useState('all');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    isMountedRef.current = true;
    fetchLogs();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchLogs = async () => {
    try {
      if (isMountedRef.current) setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      if (!isMountedRef.current) return;
      setLogs(MOCK_LOGS);
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Failed to fetch notifications', error);
        toast.error('Failed to load logs');
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!title || !content) {
      toast.error('Title and Content are required');
      return;
    }

    try {
      // Construct a readable target string
      let targetDesc = 'All Users';
      if (targetElement !== 'all') targetDesc = `${targetElement.charAt(0).toUpperCase() + targetElement.slice(1)} Element`;
      else if (targetMissing !== 'none') targetDesc = `Missing ${targetMissing.charAt(0).toUpperCase() + targetMissing.slice(1)}`;
      else if (targetSub !== 'all') targetDesc = `${targetSub.charAt(0).toUpperCase() + targetSub.slice(1)} Users`;

      const newNotif = {
        id: Math.random().toString(36).substr(2, 9),
        time: new Date().toISOString(),
        target: targetDesc,
        message: title,
        status: 'Delivered'
      };

      if (!isMountedRef.current) return;
      setLogs([newNotif, ...logs]);
      toast.success('Broadcast sent successfully');
      setTitle('');
      setContent('');
      setIsCreateOpen(false);
    } catch (error) {
      if (isMountedRef.current) {
        toast.error('Failed to send broadcast');
      }
    }
  };

  const resetForm = () => {
    if (!isMountedRef.current) return;
    setTitle('');
    setContent('');
    setTargetElement('all');
    setTargetMissing('none');
    setTargetSub('all');
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-end items-center">
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchLogs} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          <Button variant="primary" onClick={resetForm} leftIcon={<Plus className="w-4 h-4" />}>
            Create Broadcast
          </Button>
        </div>
      </div>

      {/* Broadcast List Only */}
      <Card className="h-full overflow-hidden border-t-4 border-t-secondary">
        <CardHeader className="border-b border-border/50 bg-secondary/5 py-4">
          <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
              <History className="w-5 h-5 text-primary" /> Recent Broadcasts
            </CardTitle>
          </div>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-transparent hover:bg-transparent border-b border-border/60">
                <TableHead className="whitespace-nowrap w-auto pl-6 text-xs uppercase tracking-wider text-muted-foreground">Time</TableHead>
                <TableHead className="whitespace-nowrap w-auto text-xs uppercase tracking-wider text-muted-foreground">Target</TableHead>
                <TableHead className="whitespace-nowrap w-auto text-xs uppercase tracking-wider text-muted-foreground">Message</TableHead>
                <TableHead className="whitespace-nowrap w-auto pr-6 text-right text-xs uppercase tracking-wider text-muted-foreground">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.length === 0 && !loading && (
                  <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-12 italic">
                    No broadcast history found.
                  </TableCell>
                </TableRow>
              )}
              {logs.map((log) => (
                <TableRow key={log.id} className="group hover:bg-secondary/10 transition-colors border-b border-border/40">
                  <TableCell className="text-muted-foreground whitespace-nowrap text-xs font-mono pl-6 py-4">
                    {new Date(log.time).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                  </TableCell>
                  <TableCell className="py-4 whitespace-nowrap">
                    <Badge variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/20 text-primary/80">
                      {log.target}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md py-4 whitespace-nowrap">
                    <div className="truncate font-medium text-foreground text-sm">{log.message}</div>
                  </TableCell>
                  <TableCell className="pr-6 text-right py-4 whitespace-nowrap">
                    <div className="inline-flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold uppercase tracking-wide bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20 shadow-[0_0_10px_-3px_rgba(16,185,129,0.3)]">
                      <CheckCircle className="w-3 h-3" />
                      {log.status}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* CREATE BROADCAST DIALOG */}
      <DialogRoot open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary">Create Broadcast</DialogTitle>
            <DialogDescription>Target specific user groups with push notifications.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-5 py-4">
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Target Audience
              </label>
              <div className="space-y-3 p-3 bg-secondary/20 rounded-lg border border-border/50">
                <Select value={targetElement} onChange={e => setTargetElement(e.target.value)} className="bg-background border-border/60 focus:border-primary/50">
                  <option value="all">All Master Elements</option>
                  <option value="wood">Wood</option>
                  <option value="fire">Fire</option>
                  <option value="earth">Earth</option>
                  <option value="metal">Metal</option>
                  <option value="water">Water</option>
                </Select>
                <Select value={targetMissing} onChange={e => setTargetMissing(e.target.value)} className="bg-background border-border/60 focus:border-primary/50">
                  <option value="none">Any Missing Element</option>
                  <option value="wood">Missing Wood</option>
                  <option value="fire">Missing Fire</option>
                  <option value="earth">Missing Earth</option>
                  <option value="metal">Missing Metal</option>
                  <option value="water">Missing Water</option>
                </Select>
                  <Select value={targetSub} onChange={e => setTargetSub(e.target.value)} className="bg-background border-border/60 focus:border-primary/50">
                  <option value="all">All Subscriptions</option>
                  <option value="free">Free Only</option>
                  <option value="premium">Premium Only</option>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                Message Details
              </label>
              <Input 
                placeholder="Subject Line..." 
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="font-medium bg-secondary/20 border-border/60 focus:border-primary/50"
              />
              <Textarea 
                placeholder="Type your message here..." 
                className="min-h-[120px] bg-secondary/20 resize-none border-border/60 focus:border-primary/50" 
                value={content}
                onChange={e => setContent(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button variant="primary" leftIcon={<Send className="w-4 h-4" />} onClick={handleSend}>
              Send Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

    </div>
  );
};