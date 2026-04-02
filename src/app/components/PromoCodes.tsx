import React, { useState } from 'react';
import { 
  Ticket, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  CheckCircle, 
  XCircle,
  Calendar,
  Percent,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Input, Select } from './ui/Form';
import { Badge } from './ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuGroup, DropdownMenuItem } from './ui/dropdown-menu';
import { Pagination } from './ui/Pagination';

interface PromoCode {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  status: 'active' | 'expired' | 'disabled';
  expiryDate: string;
  usageCount: number;
  usageLimit: number;
  maxUsesPerUser: number;
}

const INITIAL_PROMO_CODES: PromoCode[] = [
  { id: '1', code: 'WELCOME2024', type: 'percentage', value: 20, status: 'active', expiryDate: '2024-12-31', usageCount: 45, usageLimit: 1000, maxUsesPerUser: 1 },
  { id: '2', code: 'LUCKY88', type: 'fixed', value: 8.88, status: 'active', expiryDate: '2024-10-01', usageCount: 120, usageLimit: 500, maxUsesPerUser: 1 },
  { id: '3', code: 'VIP_ACCESS', type: 'percentage', value: 50, status: 'disabled', expiryDate: '2023-12-31', usageCount: 10, usageLimit: 50, maxUsesPerUser: 1 },
  { id: '4', code: 'SPRING_FEST', type: 'percentage', value: 15, status: 'expired', expiryDate: '2024-02-15', usageCount: 200, usageLimit: 200, maxUsesPerUser: 5 },
  { id: '5', code: 'SUMMER_SALE', type: 'percentage', value: 25, status: 'active', expiryDate: '2024-08-31', usageCount: 5, usageLimit: 500, maxUsesPerUser: 1 },
  { id: '6', code: 'FALL_FEST', type: 'percentage', value: 10, status: 'active', expiryDate: '2024-11-30', usageCount: 0, usageLimit: 1000, maxUsesPerUser: 1 },
  { id: '7', code: 'WINTER_WONDER', type: 'percentage', value: 30, status: 'active', expiryDate: '2024-12-25', usageCount: 0, usageLimit: 200, maxUsesPerUser: 1 },
  { id: '8', code: 'NEW_YEAR', type: 'fixed', value: 20.24, status: 'active', expiryDate: '2025-01-31', usageCount: 0, usageLimit: 2024, maxUsesPerUser: 1 },
  { id: '9', code: 'FLASH_SALE', type: 'percentage', value: 50, status: 'expired', expiryDate: '2024-03-01', usageCount: 50, usageLimit: 50, maxUsesPerUser: 1 },
  { id: '10', code: 'LOYALTY_BONUS', type: 'fixed', value: 5.00, status: 'active', expiryDate: '2024-12-31', usageCount: 150, usageLimit: 5000, maxUsesPerUser: 1 },
  { id: '11', code: 'FRIEND_REF', type: 'percentage', value: 10, status: 'active', expiryDate: '2025-12-31', usageCount: 12, usageLimit: 10000, maxUsesPerUser: 10 },
  { id: '12', code: 'BIRTHDAY', type: 'percentage', value: 20, status: 'active', expiryDate: '2024-12-31', usageCount: 88, usageLimit: 10000, maxUsesPerUser: 1 },
];

export const PromoCodes: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>(INITIAL_PROMO_CODES);
  const [isCreating, setIsCreating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // Set lower for demo purposes since we have limited mock data

  // Filter & Sort State
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof PromoCode, direction: 'asc' | 'desc' } | null>(null);

  // New Code Form State
  const [newCode, setNewCode] = useState<Partial<PromoCode>>({
    code: '',
    type: 'percentage',
    value: 0,
    status: 'active',
    expiryDate: '',
    usageLimit: 100,
    maxUsesPerUser: 1
  });

  const handleCreate = () => {
    if (!newCode.code || !newCode.value || !newCode.expiryDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const createdCode: PromoCode = {
      id: Math.random().toString(36).substr(2, 9),
      code: newCode.code.toUpperCase(),
      type: newCode.type as 'percentage' | 'fixed',
      value: Number(newCode.value),
      status: 'active',
      expiryDate: newCode.expiryDate,
      usageCount: 0,
      usageLimit: Number(newCode.usageLimit) || 100,
      maxUsesPerUser: Number(newCode.maxUsesPerUser) || 1
    };

    setPromoCodes([createdCode, ...promoCodes]);
    setIsCreating(false);
    setNewCode({ code: '', type: 'percentage', value: 0, status: 'active', expiryDate: '', usageLimit: 100, maxUsesPerUser: 1 });
    toast.success('Promo code created successfully');
    setCurrentPage(1); // Reset to first page to see new item
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this promo code?')) {
      setPromoCodes(promoCodes.filter(p => p.id !== id));
      toast.success('Promo code deleted');
    }
  };

  const toggleStatus = (id: string) => {
    setPromoCodes(promoCodes.map(p => {
      if (p.id === id) {
        return { ...p, status: p.status === 'active' ? 'disabled' : 'active' };
      }
      return p;
    }));
    toast.success('Status updated');
  };

  const handleSort = (key: keyof PromoCode) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredCodes = promoCodes
    .filter(code => {
      const matchesSearch = code.code.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(code.status);
      const matchesType = typeFilter.length === 0 || typeFilter.includes(code.type);
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      if (!sortConfig) return 0;
      
      const { key, direction } = sortConfig;
      
      if (a[key] < b[key]) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

  // Pagination Logic
  const totalPages = Math.ceil(filteredCodes.length / itemsPerPage);
  const paginatedCodes = filteredCodes.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Promo Codes</h2>
          <p className="text-muted-foreground mt-1">Manage discounts and promotional offers.</p>
        </div>
        <Button variant="primary" onClick={() => setIsCreating(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Create New Code
        </Button>
      </div>

      {isCreating && (
        <Card className="border-primary/20 bg-primary/5 animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle>Create New Promo Code</CardTitle>
            <CardDescription>Configure the details for your new promotion.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Code Name</label>
                <div className="relative">
                  <Ticket className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="e.g. SUMMER2024" 
                    className="pl-9 uppercase"
                    value={newCode.code}
                    onChange={(e) => setNewCode({...newCode, code: e.target.value.toUpperCase()})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Discount Type</label>
                <Select 
                  value={newCode.type}
                  onChange={(e) => setNewCode({...newCode, type: e.target.value as 'percentage' | 'fixed'})}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount ($)</option>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Discount Value</label>
                <div className="relative">
                   {newCode.type === 'fixed' ? (
                     <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">$</span>
                   ) : (
                     <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                   )}
                   <Input 
                    type="number" 
                    placeholder="0" 
                    className="pl-9"
                    value={newCode.value}
                    onChange={(e) => setNewCode({...newCode, value: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Expiry Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="date" 
                    className="pl-9"
                    value={newCode.expiryDate}
                    onChange={(e) => setNewCode({...newCode, expiryDate: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Total Usage Limit</label>
                <Input 
                  type="number" 
                  placeholder="100"
                  value={newCode.usageLimit}
                  onChange={(e) => setNewCode({...newCode, usageLimit: Number(e.target.value)})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Max Uses Per User</label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    type="number" 
                    placeholder="1"
                    className="pl-9"
                    value={newCode.maxUsesPerUser}
                    onChange={(e) => setNewCode({...newCode, maxUsesPerUser: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setIsCreating(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleCreate}>Create Code</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4 m-[0px]">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search codes..." 
              className="pl-8"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            />
          </div>
          <div className="flex gap-2">
            {(statusFilter.length > 0 || typeFilter.length > 0) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setStatusFilter([]);
                  setTypeFilter([]);
                  setCurrentPage(1);
                }}
                className="text-muted-foreground hover:text-foreground"
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Clear
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" leftIcon={<Filter className="w-4 h-4" />}>
                  Filter
                  {(statusFilter.length > 0 || typeFilter.length > 0) && (
                    <span className="ml-1 rounded-full bg-primary w-2 h-2" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {['active', 'expired', 'disabled'].map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilter.includes(status)}
                      onCheckedChange={(checked) => {
                        if (checked) setStatusFilter([...statusFilter, status]);
                        else setStatusFilter(statusFilter.filter(s => s !== status));
                        setCurrentPage(1);
                      }}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {['percentage', 'fixed'].map((type) => (
                    <DropdownMenuCheckboxItem
                       key={type}
                       checked={typeFilter.includes(type)}
                       onCheckedChange={(checked) => {
                         if (checked) setTypeFilter([...typeFilter, type]);
                         else setTypeFilter(typeFilter.filter(t => t !== type));
                         setCurrentPage(1);
                       }}
                    >
                      {type === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" leftIcon={<MoreVertical className="w-4 h-4" />}>
                  Sort
                  {sortConfig && <span className="ml-1 text-xs text-muted-foreground">({sortConfig.key})</span>}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleSort('expiryDate')}>
                    Expiry Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('usageCount')}>
                    Usage Count
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('value')}>
                    Discount Value
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort('code')}>
                    Code Name
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-xl shadow-lg m-[0px]">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/50 bg-muted/20">
                    <TableHead className="py-3.5 px-6 cursor-pointer hover:text-primary" onClick={() => handleSort('code')}>
                      Promo Code {sortConfig?.key === 'code' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="py-3.5 px-6 cursor-pointer hover:text-primary" onClick={() => handleSort('value')}>
                      Discount {sortConfig?.key === 'value' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="py-3.5 px-6">Status</TableHead>
                    <TableHead className="py-3.5 px-6 cursor-pointer hover:text-primary" onClick={() => handleSort('usageCount')}>
                      Total Usage {sortConfig?.key === 'usageCount' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="py-3.5 px-6">Limit/User</TableHead>
                    <TableHead className="py-3.5 px-6 cursor-pointer hover:text-primary" onClick={() => handleSort('expiryDate')}>
                      Expires {sortConfig?.key === 'expiryDate' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
                    </TableHead>
                    <TableHead className="py-3.5 px-6 text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCodes.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={7} className="text-center h-48 text-muted-foreground">
                        No promo codes found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedCodes.map((code) => (
                      <TableRow 
                        key={code.id} 
                        className="border-b border-border/30 transition-all duration-200 hover:bg-primary/5 cursor-pointer group/row"
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <Ticket className="w-4 h-4 text-primary" />
                            <span className="font-semibold text-foreground group-hover/row:text-primary transition-colors">{code.code}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="font-semibold text-sm">
                            {code.type === 'percentage' ? `${code.value}%` : `$${code.value.toFixed(2)}`}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge 
                            className={
                              code.status === 'active' ? 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30 border-0 text-[10px] font-bold uppercase px-2.5 py-0.5' : 
                              code.status === 'expired' ? 'bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 border-0 text-[10px] font-bold uppercase px-2.5 py-0.5' :
                              'bg-slate-500/20 text-slate-500 hover:bg-slate-500/30 border-0 text-[10px] font-bold uppercase px-2.5 py-0.5'
                            }
                          >
                            {code.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="text-sm text-muted-foreground tabular-nums">
                            {code.usageCount} / {code.usageLimit}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="text-sm text-muted-foreground">{code.maxUsesPerUser}</span>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="text-sm text-muted-foreground">{code.expiryDate}</span>
                        </TableCell>
                        <TableCell className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                              onClick={(e) => { e.stopPropagation(); toggleStatus(code.id); }}
                              title={code.status === 'active' ? "Disable" : "Enable"}
                            >
                              {code.status === 'active' ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                              onClick={(e) => { e.stopPropagation(); handleDelete(code.id); }}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="border-t border-border/50 bg-card/20 backdrop-blur-sm">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={filteredCodes.length}
                itemsPerPage={itemsPerPage}
                itemName="codes"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};