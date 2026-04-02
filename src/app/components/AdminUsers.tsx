import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'motion/react';
import { PlusCircle, Shield, Edit, Trash2, RefreshCw, Edit2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Input, Select } from './ui/Form';
import { 
  Plus, 
  Search, 
  MoreVertical, 
  ShieldCheck, 
  UserCog, 
  Mail, 
  Lock,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from './ui/dropdown-menu';
import { 
  DialogRoot, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter, 
  DialogClose 
} from './ui/Dialog';
import { toast } from 'sonner';

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'Super Admin' | 'Admin' | 'Editor';
  status: 'Active' | 'Inactive';
  lastActive: string;
}

const MOCK_ADMINS: AdminUser[] = [
  { id: '1', name: 'Master Piseth', email: 'master@piseth.com', role: 'Super Admin', status: 'Active', lastActive: 'Online Now' },
  { id: '2', name: 'Sokha Admin', email: 'sokha.admin@piseth.com', role: 'Admin', status: 'Active', lastActive: '2 hours ago' },
  { id: '3', name: 'Dara Editor', email: 'dara.editor@piseth.com', role: 'Editor', status: 'Active', lastActive: '5 mins ago' },
  { id: '4', name: 'Vichea Admin', email: 'vichea@piseth.com', role: 'Admin', status: 'Inactive', lastActive: '3 days ago' },
];

export const AdminUsers: React.FC = () => {
  const [admins, setAdmins] = useState<AdminUser[]>(MOCK_ADMINS);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Editor' as AdminUser['role'],
    password: ''
  });

  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddUser = () => {
    if (!formData.name || !formData.email) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    const newUser: AdminUser = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name,
      email: formData.email,
      role: formData.role,
      status: 'Active',
      lastActive: 'Never'
    };
    
    setAdmins([...admins, newUser]);
    setIsAddOpen(false);
    setFormData({ name: '', email: '', role: 'Editor', password: '' });
    toast.success(`User ${formData.name} created as ${formData.role}`);
  };

  const handleDelete = (id: string) => {
    const admin = admins.find(a => a.id === id);
    if (admin?.role === 'Super Admin') {
      toast.error('Cannot delete Super Admin');
      return;
    }
    setAdmins(admins.filter(a => a.id !== id));
    toast.success('User removed from system');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground/90">User System</h2>
          <p className="text-muted-foreground mt-1">Manage administrative access and roles for the dashboard.</p>
        </div>
        <Button 
          variant="primary" 
          onClick={() => setIsAddOpen(true)}
          className="shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)]"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create New User
        </Button>
      </div>

      <div className="flex items-center gap-4 max-w-md">
        <div className="relative flex-1 group">
          <Input 
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-black/5 dark:bg-black/40 border-white/10 focus:border-primary/50 transition-all rounded-xl"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      <Card className="border-white/10 bg-card/40 dark:bg-black/40 backdrop-blur-xl shadow-2xl overflow-hidden group/card relative">
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none opacity-50" />
        
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/5 bg-black/20 hover:bg-black/20">
              <TableHead className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">System User</TableHead>
              <TableHead className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">Access Role</TableHead>
              <TableHead className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">Status</TableHead>
              <TableHead className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">Last Active</TableHead>
              <TableHead className="py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-primary/50 pr-8">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout">
              {filteredAdmins.map((admin, index) => (
                <Motion.tr 
                  key={admin.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group/row border-b border-white/5 hover:bg-white/[0.03] transition-colors"
                >
                  <TableCell className="py-5">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/20 flex items-center justify-center border border-white/10 group-hover/row:border-primary/30 transition-all">
                        <UserCog className="w-5 h-5 text-primary/70" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground/90">{admin.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Mail className="w-3 h-3" />
                          {admin.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {admin.role === 'Super Admin' && <ShieldCheck className="w-4 h-4 text-primary" />}
                      {admin.role === 'Admin' && <Shield className="w-4 h-4 text-primary" />}
                      {admin.role === 'Editor' && <Edit2 className="w-4 h-4 text-muted-foreground" />}
                      <span className={cn(
                        "text-sm font-medium",
                        admin.role === 'Super Admin' ? "text-primary" : 
                        admin.role === 'Admin' ? "text-primary" : "text-muted-foreground"
                      )}>
                        {admin.role}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn(
                      "rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest",
                      admin.status === 'Active' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                    )}>
                      {admin.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground tabular-nums">
                    {admin.lastActive}
                  </TableCell>
                  <TableCell className="text-right pr-8">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10 rounded-lg">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 bg-secondary/95 backdrop-blur-2xl border-white/10 shadow-2xl">
                        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 px-2 py-2">Account Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary transition-colors py-2 gap-2">
                          <Edit2 className="w-4 h-4" /> Edit Permissions
                        </DropdownMenuItem>
                        <DropdownMenuItem className="focus:bg-primary/10 focus:text-primary transition-colors py-2 gap-2">
                          <Lock className="w-4 h-4" /> Reset Password
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-white/5" />
                        <DropdownMenuItem 
                          disabled={admin.role === 'Super Admin'}
                          onClick={() => handleDelete(admin.id)}
                          className="focus:bg-rose-500/10 text-rose-400 focus:text-rose-400 transition-colors py-2 gap-2"
                        >
                          <Trash2 className="w-4 h-4" /> Terminate Access
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </Motion.tr>
              ))}
            </AnimatePresence>
          </TableBody>
        </Table>
      </Card>

      {/* Create User Dialog */}
      <DialogRoot open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md bg-card/90 dark:bg-black/90 backdrop-blur-2xl border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-primary" />
              Create System User
            </DialogTitle>
            <DialogDescription>Assign administrative credentials and set access privileges.</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Full Legal Name</label>
              <Input 
                placeholder="e.g. Sokha Piseth"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-black/5 dark:bg-black/40 border-white/10 focus:border-primary/50 transition-all rounded-xl"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Corporate Email</label>
              <Input 
                type="email"
                placeholder="email@masterpiseth.com"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="bg-black/5 dark:bg-black/40 border-white/10 focus:border-primary/50 transition-all rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Access Privilege Role</label>
              <Select 
                value={formData.role}
                onChange={(e: any) => setFormData({...formData, role: e.target.value})}
                className="bg-black/5 dark:bg-black/40 border-white/10 focus:border-primary/50 transition-all rounded-xl"
              >
                <option value="Admin">Admin (Full Control)</option>
                <option value="Editor">Editor (Limited Access)</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground/80">Temporary Password</label>
              <Input 
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="bg-black/5 dark:bg-black/40 border-white/10 focus:border-primary/50 transition-all rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground italic">The user will be prompted to change this upon first login.</p>
            </div>
          </div>

          <DialogFooter className="gap-3">
            <DialogClose asChild>
              <Button variant="ghost" className="hover:bg-white/5">Cancel</Button>
            </DialogClose>
            <Button 
              variant="primary" 
              onClick={handleAddUser}
              className="shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]"
            >
              Confirm Authorization
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};