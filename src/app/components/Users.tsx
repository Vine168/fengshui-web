import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion as Motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/Dialog';
import { Input, Select } from './ui/Form';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuGroup } from './ui/dropdown-menu';
import { Search, Filter, Pencil, Trash2, Plus, XCircle, Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { format, subDays, subMonths, isWithinInterval, startOfDay, endOfDay, isValid } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "./ui/utils";
import { Pagination } from './ui/Pagination';

interface User {
  id: string;
  name: string;
  element: string;
  missing: string;
  subscription: string;
  lastLogin: string;
  status: string;
  email?: string;
}

const MOCK_USERS: User[] = [
  { id: '1', name: 'Sokha Chan', email: 'sokha.chan@gmail.com', element: 'Fire', missing: 'Water', subscription: 'Pro', lastLogin: '2025-05-15 09:30', status: 'Active' },
  { id: '2', name: 'Visal Kim', email: 'visal.kim@yahoo.com', element: 'Wood', missing: 'Metal', subscription: 'Free', lastLogin: '2025-05-14 14:20', status: 'Active' },
  { id: '3', name: 'Bopha Ly', email: 'bopha.ly@outlook.com', element: 'Earth', missing: 'Wood', subscription: 'Enterprise', lastLogin: '2025-05-15 08:45', status: 'Active' },
  { id: '4', name: 'Dara Heng', email: 'dara.heng@gmail.com', element: 'Metal', missing: 'Fire', subscription: 'Free', lastLogin: '2025-05-10 11:15', status: 'Inactive' },
  { id: '5', name: 'Srey Mao', email: 'srey.mao@gmail.com', element: 'Water', missing: 'Earth', subscription: 'Pro', lastLogin: '2025-05-15 10:00', status: 'Active' },
  { id: '6', name: 'Vannak Oum', email: 'vannak.oum@cammail.kh', element: 'Fire', missing: 'Water', subscription: 'Pro', lastLogin: '2025-05-12 16:30', status: 'Suspended' },
  { id: '7', name: 'Neary Keo', email: 'neary.keo@gmail.com', element: 'Wood', missing: 'Metal', subscription: 'Free', lastLogin: '2025-05-13 09:15', status: 'Active' },
  { id: '8', name: 'Rithy Sam', email: 'rithy.sam@yahoo.com', element: 'Earth', missing: 'Wood', subscription: 'Pro', lastLogin: '2025-05-15 07:20', status: 'Active' },
  { id: '9', name: 'Sophea Nuon', email: 'sophea.nuon@gmail.com', element: 'Metal', missing: 'Fire', subscription: 'Enterprise', lastLogin: '2025-05-14 18:45', status: 'Active' },
  { id: '10', name: 'Chea Vuthy', email: 'chea.vuthy@outlook.com', element: 'Water', missing: 'Earth', subscription: 'Free', lastLogin: '2025-05-11 13:10', status: 'Inactive' },
  { id: '11', name: 'Nary Khon', email: 'nary.khon@gmail.com', element: 'Fire', missing: 'Water', subscription: 'Pro', lastLogin: '2025-05-15 11:30', status: 'Active' },
  { id: '12', name: 'Sovann Ty', email: 'sovann.ty@yahoo.com', element: 'Wood', missing: 'Metal', subscription: 'Free', lastLogin: '2025-05-13 15:40', status: 'Active' },
];

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const isMountedRef = useRef(true);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  // Selection State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<User & { password: string }>>({});

  // Filter State
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [subscriptionFilter, setSubscriptionFilter] = useState<string[]>([]);
  
  // Date Filter State
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'custom'>('month');

  useEffect(() => {
    isMountedRef.current = true;
    fetchUsers(true);
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Update date range when timeRange selection changes
  useEffect(() => {
    const today = new Date();
    let newDate: DateRange | undefined;
    if (timeRange === 'today') {
      newDate = { from: today, to: today };
    } else if (timeRange === 'week') {
      newDate = { from: subDays(today, 7), to: today };
    } else if (timeRange === 'month') {
      newDate = { from: subMonths(today, 1), to: today };
    }
    
    if (newDate && isMountedRef.current) {
      setDate(newDate);
    }
  }, [timeRange]);

  const fetchUsers = async (showLoading = true) => {
    try {
      if (showLoading && isMountedRef.current) setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      if (!isMountedRef.current) return;
      setUsers(MOCK_USERS);
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Failed to fetch users', error);
        if (showLoading) toast.error('Failed to load users');
      }
    } finally {
      if (showLoading && isMountedRef.current) setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.email || !formData.password) {
        toast.error('Name, Email, and Password are required');
        return;
      }
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        email: formData.email,
        status: formData.status || 'Active',
        element: formData.element || 'Unknown',
        missing: formData.missing || 'None',
        subscription: formData.subscription || 'Free',
        lastLogin: format(new Date(), 'yyyy-MM-dd HH:mm')
      };
      
      setUsers([newUser, ...users]);
      toast.success('User created successfully');
      setIsAddOpen(false);
      setFormData({});
    } catch (error) {
      toast.error('Failed to create user');
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;
    try {
      setUsers(users.map(u => u.id === selectedUser.id ? { ...u, ...formData } as User : u));
      toast.success('User updated successfully');
      setIsEditOpen(false);
      setSelectedUser(null);
      setFormData({});
    } catch (error) {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      setUsers(users.filter(u => u.id !== selectedUser.id));
      toast.success('User deleted successfully');
      setIsDeleteOpen(false);
      setSelectedUser(null);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(user.status);
    const matchesSubscription = subscriptionFilter.length === 0 || subscriptionFilter.includes(user.subscription);
    
    const matchesDate = (() => {
      if (!date?.from) return true;
      if (!user.lastLogin) return false;
      
      const loginDate = new Date(user.lastLogin);
      if (!isValid(loginDate)) return true;
      
      const start = startOfDay(date.from);
      const end = date.to ? endOfDay(date.to) : endOfDay(date.from);
      
      return isWithinInterval(loginDate, { start, end });
    })();

    return matchesSearch && matchesStatus && matchesSubscription && matchesDate;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <Button variant="primary" onClick={() => { setFormData({}); setIsAddOpen(true); }} leftIcon={<Plus className="w-4 h-4" />}>
          Add New User
        </Button>
      </div>

      <Card className="p-6 overflow-hidden bg-card/40 dark:bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl relative group/card">
        {/* Subtle background glow effects */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none opacity-50 group-hover/card:opacity-70 transition-opacity duration-700" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none opacity-50 group-hover/card:opacity-70 transition-opacity duration-700" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center flex-1 gap-2 max-w-sm w-full relative">
               <div className="absolute left-3.5 flex items-center pointer-events-none">
                 <Search className="w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
               </div>
               <Input 
                 placeholder="Search users by name or email..." 
                 value={searchQuery}
                 onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                 className="pl-10 h-10 bg-black/5 dark:bg-black/40 border-white/10 hover:border-white/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all rounded-xl w-full"
               />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filter Container */}
              <div className="flex items-center p-1 bg-black/5 dark:bg-black/40 border border-white/10 rounded-xl gap-1 shadow-inner backdrop-blur-md">
                {(['today', 'week', 'month'] as const).map((range) => (
                  <Button 
                    key={range}
                    variant={timeRange === range ? 'primary' : 'ghost'} 
                    size="sm" 
                    onClick={() => setTimeRange(range)}
                    className={cn(
                      "h-8 px-4 text-xs font-semibold rounded-lg transition-all duration-300",
                      timeRange === range 
                        ? "shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]" 
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5 border-transparent"
                    )}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Button>
                ))}
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={timeRange === 'custom' ? 'primary' : 'ghost'}
                      size="sm"
                      className={cn(
                        "h-8 px-4 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2",
                        timeRange === 'custom' 
                          ? "shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]" 
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5 border-transparent"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {date?.from ? (
                        date.to ? (
                          <span className="truncate max-w-[120px]">
                            {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}
                          </span>
                        ) : (
                          format(date.from, "MMM dd")
                        )
                      ) : (
                        <span>Custom</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-secondary/95 backdrop-blur-2xl border-white/10 shadow-2xl" align="end">
                    <Calendar
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={(newDate) => {
                        setDate(newDate);
                        if (newDate) {
                          setTimeRange('custom');
                        }
                      }}
                      numberOfMonths={1}
                      initialFocus
                      className="bg-transparent"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {(statusFilter.length > 0 || subscriptionFilter.length > 0) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => {
                    setStatusFilter([]);
                    setSubscriptionFilter([]);
                    setCurrentPage(1);
                  }}
                  className="h-10 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 transition-all gap-2 px-3 rounded-xl border border-rose-500/20"
                >
                  <XCircle className="w-4 h-4" />
                  Clear
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant={statusFilter.length > 0 || subscriptionFilter.length > 0 ? 'primary' : 'outline'} 
                    size="sm" 
                    className={cn(
                      "h-10 transition-all px-4 rounded-xl gap-2",
                      statusFilter.length > 0 || subscriptionFilter.length > 0
                        ? "shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30"
                    )}
                  >
                    <Filter className="w-4 h-4" />
                    Filter
                    {(statusFilter.length > 0 || subscriptionFilter.length > 0) && (
                      <span className="flex h-2 w-2 rounded-full bg-black/40 shadow-sm" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-secondary/95 backdrop-blur-2xl border-white/10 shadow-2xl">
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-2 py-2">Filter by Status</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {['Active', 'Inactive', 'Suspended'].map((status) => (
                      <DropdownMenuCheckboxItem
                        key={status}
                        checked={statusFilter.includes(status)}
                        onCheckedChange={(checked) => {
                          if (checked) setStatusFilter([...statusFilter, status]);
                          else setStatusFilter(statusFilter.filter(s => s !== status));
                          setCurrentPage(1);
                        }}
                        className="focus:bg-primary/10 focus:text-primary transition-colors py-2"
                      >
                        {status}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-2 py-2">Filter by Plan</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {['Free', 'Pro', 'Enterprise'].map((sub) => (
                      <DropdownMenuCheckboxItem
                         key={sub}
                         checked={subscriptionFilter.includes(sub)}
                         onCheckedChange={(checked) => {
                           if (checked) setSubscriptionFilter([...subscriptionFilter, sub]);
                           else setSubscriptionFilter(subscriptionFilter.filter(s => s !== sub));
                           setCurrentPage(1);
                         }}
                         className="focus:bg-primary/10 focus:text-primary transition-colors py-2"
                      >
                        {sub}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-xl shadow-lg">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/50 bg-muted/20">
                    <TableHead className="py-3.5 px-6">User Profile</TableHead>
                    <TableHead className="py-3.5 px-6">Status</TableHead>
                    <TableHead className="py-3.5 px-6">Plan</TableHead>
                    <TableHead className="py-3.5 px-6">Element</TableHead>
                    <TableHead className="py-3.5 px-6">Activity</TableHead>
                    <TableHead className="py-3.5 px-6 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && users.length === 0 ? (
                     <TableRow className="hover:bg-transparent">
                       <TableCell colSpan={6} className="text-center h-48">
                       <div className="flex flex-col items-center gap-3">
                         <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                         <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">Loading users...</span>
                       </div>
                     </TableCell>
                     </TableRow>
                  ) : paginatedUsers.length === 0 ? (
                     <TableRow className="hover:bg-transparent">
                       <TableCell colSpan={6} className="text-center h-48 text-muted-foreground">
                         No users found matching your search.
                       </TableCell>
                     </TableRow>
                  ) : (
                     <AnimatePresence mode="popLayout">
                       {paginatedUsers.map((user, index) => (
                         <Motion.tr
                           key={user.id}
                           initial={{ opacity: 0, y: 5 }}
                           animate={{ opacity: 1, y: 0 }}
                           exit={{ opacity: 0, scale: 0.98 }}
                           transition={{ duration: 0.2, delay: index * 0.02 }}
                           onClick={() => {
                             setSelectedUser(user);
                             setFormData(user);
                             setIsEditOpen(true);
                           }}
                           className="border-b border-border/30 transition-all duration-200 hover:bg-primary/5 cursor-pointer group/row"
                         >
                           <TableCell className="py-4 px-6">
                             <div className="flex flex-col gap-0.5">
                               <span className="font-semibold text-sm text-foreground group-hover/row:text-primary transition-colors">
                                 {user.name}
                               </span>
                               <span className="text-xs text-muted-foreground">
                                 {user.email}
                               </span>
                             </div>
                           </TableCell>
                           <TableCell className="py-4 px-6">
                             <Badge 
                               variant="outline" 
                               className={cn(
                                 "rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                                 user.status === 'Active' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                                 user.status === 'Inactive' && "bg-amber-500/10 text-amber-400 border-amber-500/30",
                                 user.status === 'Suspended' && "bg-rose-500/10 text-rose-400 border-rose-500/30"
                               )}
                             >
                               {user.status}
                             </Badge>
                           </TableCell>
                           <TableCell className="py-4 px-6">
                             <span className={cn(
                               "text-sm font-semibold",
                               user.subscription === 'Enterprise' && "text-primary",
                               user.subscription === 'Pro' && "text-foreground",
                               user.subscription === 'Free' && "text-muted-foreground"
                             )}>
                               {user.subscription}
                             </span>
                           </TableCell>
                           <TableCell className="py-4 px-6">
                             <div className="flex items-center gap-2">
                               <div className={cn(
                                 "w-2 h-2 rounded-full",
                                 user.element === 'Fire' && "bg-rose-500",
                                 user.element === 'Water' && "bg-blue-500",
                                 user.element === 'Wood' && "bg-emerald-500",
                                 user.element === 'Metal' && "bg-zinc-300",
                                 user.element === 'Earth' && "bg-amber-700"
                               )} />
                               <span className="text-sm text-foreground/90">{user.element}</span>
                             </div>
                           </TableCell>
                           <TableCell className="py-4 px-6">
                             <span className="text-xs text-muted-foreground tabular-nums">
                               {user.lastLogin}
                             </span>
                           </TableCell>
                           <TableCell className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                             <div className="flex items-center justify-center gap-1">
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setSelectedUser(user);
                                   setFormData(user);
                                   setIsEditOpen(true);
                                 }}
                               >
                                 <Pencil className="w-3.5 h-3.5" />
                               </Button>
                               <Button 
                                 variant="ghost" 
                                 size="icon" 
                                 className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                 onClick={(e) => {
                                   e.stopPropagation();
                                   setSelectedUser(user);
                                   setIsDeleteOpen(true);
                                 }}
                               >
                                 <Trash2 className="w-3.5 h-3.5" />
                               </Button>
                             </div>
                           </TableCell>
                         </Motion.tr>
                       ))}
                     </AnimatePresence>
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="border-t border-border/50 bg-card/20 backdrop-blur-sm">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredUsers.length}
                itemsPerPage={itemsPerPage}
                itemName="users"
              />
            </div>
          </div>
        </div>
      </Card>

      <DialogRoot open={isAddOpen} onOpenChange={setIsAddOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Add New User</DialogTitle>
             <DialogDescription>Enter the details for the new user account.</DialogDescription>
           </DialogHeader>
           <div className="grid gap-5 py-4">
             <div className="space-y-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium text-foreground/90">Full Name</label>
                 <Input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Sokha Chan" />
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-foreground/90">Email Address</label>
                   <Input value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
                 </div>
                 <div className="space-y-2">
                   <label className="text-sm font-medium text-foreground/90">Password</label>
                   <Input type="password" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" />
                 </div>
               </div>
             </div>

             <div className="h-px bg-border/50 my-1" />

             <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/90">Date of Birth</label>
                  <Input 
                    type="date" 
                    value={(formData as any).dob || ''} 
                    onChange={e => {
                      const dob = e.target.value;
                      let element = '';
                      if (dob) {
                        const year = parseInt(dob.split('-')[0]);
                        const lastDigit = year % 10;
                        if ([0, 1].includes(lastDigit)) element = 'Metal';
                        else if ([2, 3].includes(lastDigit)) element = 'Water';
                        else if ([4, 5].includes(lastDigit)) element = 'Wood';
                        else if ([6, 7].includes(lastDigit)) element = 'Fire';
                        else if ([8, 9].includes(lastDigit)) element = 'Earth';
                      }
                      setFormData({...formData, ['dob' as any]: dob, element});
                    }} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/90">Time of Birth</label>
                  <Input 
                    type="time" 
                    value={(formData as any).birthTime || ''} 
                    onChange={e => setFormData({...formData, ['birthTime' as any]: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/90">Feng Shui Element</label>
                  <Input 
                    value={formData.element || ''} 
                    readOnly 
                    className="bg-primary/10 border-primary/20 text-primary font-semibold" 
                    placeholder="Auto-calculated" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground/90">Account Status</label>
                  <Select value={formData.status || 'Active'} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Suspended">Suspended</option>
                  </Select>
                </div>
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
             <Button onClick={handleCreate}>Create User</Button>
           </DialogFooter>
         </DialogContent>
      </DialogRoot>

      <DialogRoot open={isEditOpen} onOpenChange={setIsEditOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Edit User</DialogTitle>
             <DialogDescription>Update the user's information below.</DialogDescription>
           </DialogHeader>
           <div className="grid gap-4 py-4">
             <div className="space-y-2">
               <label className="text-sm font-medium">Name</label>
               <Input value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Email</label>
               <Input value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Password</label>
               <Input type="password" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="Leave blank to keep current" />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                 <label className="text-sm font-medium">Element</label>
                 <Input value={formData.element || ''} onChange={e => setFormData({...formData, element: e.target.value})} />
               </div>
               <div className="space-y-2">
                 <label className="text-sm font-medium">Subscription</label>
                 <Input value={formData.subscription || ''} onChange={e => setFormData({...formData, subscription: e.target.value})} />
               </div>
             </div>
             <div className="space-y-2">
               <label className="text-sm font-medium">Status</label>
               <Select value={formData.status || 'Active'} onChange={e => setFormData({...formData, status: e.target.value})}>
                 <option value="Active">Active</option>
                 <option value="Inactive">Inactive</option>
                 <option value="Suspended">Suspended</option>
               </Select>
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
             <Button onClick={handleUpdate}>Save Changes</Button>
           </DialogFooter>
         </DialogContent>
      </DialogRoot>

      <DialogRoot open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Delete User</DialogTitle>
             <DialogDescription className="py-4">
               Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
             </DialogDescription>
           </DialogHeader>
           <DialogFooter>
             <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
             <Button variant="danger" onClick={handleDelete}>Delete User</Button>
           </DialogFooter>
         </DialogContent>
      </DialogRoot>
    </div>
  );
};