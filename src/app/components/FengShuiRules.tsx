import React, { useEffect, useState, useRef } from 'react';
import { Card } from './ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/Dialog';
import { Input, Select, Textarea } from './ui/Form';
import { BookOpen, Plus, ArrowRight, AlertCircle, AlertTriangle, Info, Pencil, Trash2, RefreshCw, ArrowLeft, Save, Search, Filter, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger, DropdownMenuCheckboxItem, DropdownMenuGroup } from './ui/dropdown-menu';
import { Pagination } from './ui/Pagination';

interface Rule {
  id: number;
  condition: string;
  action: string;
  priority: string;
  status: string;
}

const MOCK_RULES: Rule[] = [
  { id: 1, condition: "Missing Element = Fire", action: "Recommend Red clothing\nSuggest South-facing sleeping position", priority: "High", status: "Active" },
  { id: 2, condition: "Missing Element = Water", action: "Recommend Blue/Black clothing\nSuggest North-facing sleeping position\nAdd water feature to living room", priority: "High", status: "Active" },
  { id: 3, condition: "Missing Element = Wood", action: "Recommend Green clothing\nSuggest East-facing sleeping position\nAdd plants to workspace", priority: "Medium", status: "Active" },
  { id: 4, condition: "Missing Element = Metal", action: "Recommend White/Gold clothing\nSuggest West-facing sleeping position", priority: "Medium", status: "Active" },
  { id: 5, condition: "Missing Element = Earth", action: "Recommend Yellow/Brown clothing\nSuggest Center/NE/SW sleeping position", priority: "Medium", status: "Active" },
  { id: 6, condition: "Bed faces Door", action: "Advise moving bed out of direct line\nUse a screen or curtain as block", priority: "Critical", status: "Active" },
  { id: 7, condition: "Mirror opposite Bed", action: "Cover mirror at night\nMove mirror to different wall", priority: "High", status: "Active" },
  { id: 8, condition: "Stove opposite Sink", action: "Place wood element (plant/green mat) between them", priority: "Medium", status: "Inactive" },
  { id: 9, condition: "Beam above Desk", action: "Move desk\nInstall false ceiling", priority: "High", status: "Active" },
  { id: 10, condition: "Clutter in Entryway", action: "Clear pathway for Qi flow\nAdd bright light", priority: "Low", status: "Active" },
];

type ViewMode = 'list' | 'create' | 'edit';

export const FengShuiRules: React.FC = () => {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const isMountedRef = useRef(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter State
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  // Dialog States (only for delete now)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selection State
  const [selectedRule, setSelectedRule] = useState<Rule | null>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Rule>>({});

  const fetchRules = async () => {
    try {
      if (isMountedRef.current) setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 600));
      if (!isMountedRef.current) return;
      setRules(MOCK_RULES);
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Failed to fetch rules', error);
        toast.error('Failed to load rules');
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchRules();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleCreate = async () => {
    try {
      if (!formData.condition || !formData.action) {
        toast.error('Condition and Action are required');
        return;
      }
      
      const newRule: Rule = {
        id: Math.floor(Math.random() * 10000),
        condition: formData.condition,
        action: formData.action,
        priority: formData.priority || 'Medium',
        status: formData.status || 'Active'
      };
      
      setRules([newRule, ...rules]);
      toast.success('Rule created successfully');
      setViewMode('list');
      setFormData({});
    } catch (error) {
      toast.error('Failed to create rule');
    }
  };

  const handleUpdate = async () => {
    if (!selectedRule) return;
    try {
      setRules(rules.map(r => r.id === selectedRule.id ? { ...r, ...formData } as Rule : r));
      toast.success('Rule updated successfully');
      setViewMode('list');
      setSelectedRule(null);
      setFormData({});
    } catch (error) {
      toast.error('Failed to update rule');
    }
  };

  const handleDelete = async () => {
    if (!selectedRule) return;
    try {
      setRules(rules.filter(r => r.id !== selectedRule.id));
      toast.success('Rule deleted successfully');
      setIsDeleteOpen(false);
      setSelectedRule(null);
    } catch (error) {
      toast.error('Failed to delete rule');
    }
  };

  const openEdit = (rule: Rule) => {
    setSelectedRule(rule);
    setFormData(rule);
    setViewMode('edit');
  };

  const openCreate = () => {
    setSelectedRule(null);
    setFormData({});
    setViewMode('create');
  };

  const openDelete = (rule: Rule) => {
    setSelectedRule(rule);
    setIsDeleteOpen(true);
  };

  const filteredRules = rules.filter(rule => {
    const matchesSearch = 
      (rule.condition || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
      (rule.action || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter.length === 0 || priorityFilter.includes(rule.priority);
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(rule.status);
    return matchesSearch && matchesPriority && matchesStatus;
  });

  // Pagination Logic
  const totalPages = Math.ceil(filteredRules.length / itemsPerPage);
  const paginatedRules = filteredRules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const renderForm = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="sticky top-0 z-10 bg-background pb-4 pt-2 mb-6 flex items-center justify-between gap-4 border-b border-border/40">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setViewMode('list')} leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back
          </Button>
          <div className="h-6 w-px bg-border" />
          <div>
            <h2 className="text-2xl font-bold text-primary tracking-tight">
              {viewMode === 'create' ? 'Add Rule' : 'Edit Rule'}
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
           <Button variant="ghost" onClick={() => setViewMode('list')}>
              Cancel
            </Button>
           <Button variant="primary" onClick={viewMode === 'create' ? handleCreate : handleUpdate} leftIcon={<Save className="w-4 h-4" />}>
              {viewMode === 'create' ? 'Create' : 'Save'}
            </Button>
        </div>
      </div>

      <Card className="w-full border-t-4 border-t-primary p-6">
        <div className="space-y-6">
           <div className="space-y-3">
            <label className="text-sm font-medium">Condition (Logic)</label>
            <div className="flex gap-2 items-start relative z-20">
              <div className="grow relative group">
                <Input 
                  value={formData.condition || ''} 
                  onChange={e => setFormData({...formData, condition: e.target.value})} 
                  placeholder="e.g. Bed aligns with door..."
                  className="w-full"
                  autoComplete="off"
                />
                
                {/* Suggestions Dropdown */}
                <div className="absolute top-full left-0 w-full bg-popover border border-border rounded-md shadow-lg mt-1 hidden group-focus-within:block max-h-[200px] overflow-y-auto z-50">
                  <div className="p-1">
                    <div className="px-2 py-1.5 text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70 bg-secondary/20 rounded-sm mb-1">
                      Suggestions
                    </div>
                    {[
                      "Missing Element = Fire",
                      "Missing Element = Water", 
                      "Bed faces Door",
                      "Mirror opposite Bed",
                      "Stove opposite Sink",
                      "Beam above Desk",
                      "Clutter in Entryway"
                    ].filter(item => 
                      !formData.condition || 
                      (item.toLowerCase().includes(formData.condition.toLowerCase()) && item !== formData.condition)
                    ).length === 0 ? (
                       <div className="px-2 py-2 text-xs text-muted-foreground italic text-center">
                         No matching suggestions
                       </div>
                    ) : (
                      [
                        "Missing Element = Fire",
                        "Missing Element = Water", 
                        "Bed faces Door",
                        "Mirror opposite Bed",
                        "Stove opposite Sink",
                        "Beam above Desk",
                        "Clutter in Entryway"
                      ].filter(item => 
                        !formData.condition || 
                        (item.toLowerCase().includes(formData.condition.toLowerCase()) && item !== formData.condition)
                      ).map((text) => (
                        <div 
                          key={text}
                          className="px-2 py-1.5 text-sm rounded-sm hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors flex items-center gap-2"
                          onMouseDown={(e) => {
                            e.preventDefault(); 
                            setFormData({...formData, condition: text});
                          }}
                        >
                           <BookOpen className="w-3 h-3 text-muted-foreground/50" />
                           {text}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-1 shrink-0">
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  className="h-9 px-2 text-xs font-bold text-muted-foreground hover:text-primary"
                  onClick={() => setFormData(prev => ({ ...prev, condition: (prev.condition || '').trim() + ' AND ' }))}
                  title="Add AND condition"
                >
                  AND
                </Button>
                <Button 
                  type="button" 
                  variant="secondary" 
                  size="sm" 
                  className="h-9 px-2 text-xs font-bold text-muted-foreground hover:text-primary"
                  onClick={() => setFormData(prev => ({ ...prev, condition: (prev.condition || '').trim() + ' OR ' }))}
                  title="Add OR condition"
                >
                  OR
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Action Results (Remedies)</label>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">List Mode</span>
            </div>
            
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar bg-secondary/5 rounded-lg p-2 border border-border/50">
              {(formData.action ? formData.action.split('\n') : ['']).map((line, index, arr) => (
                <div key={`action-line-${index}`} className="flex gap-2 items-center group">
                  <div className="w-6 h-6 rounded-full bg-secondary/50 text-[10px] font-bold text-muted-foreground flex items-center justify-center border border-border shrink-0">
                    {index + 1}
                  </div>
                  <Input 
                    value={line} 
                    onChange={(e) => {
                      const newLines = [...(formData.action ? formData.action.split('\n') : [''])];
                      newLines[index] = e.target.value;
                      setFormData({...formData, action: newLines.join('\n')});
                    }}
                    placeholder={`Remedy #${index + 1}...`}
                    className="grow bg-background rounded-[6px]"
                  />
                  {arr.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        const newLines = (formData.action || '').split('\n').filter((_, i) => i !== index);
                        setFormData({...formData, action: newLines.join('\n')});
                      }}
                      className="w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Remove line"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full border-dashed text-muted-foreground hover:text-primary hover:border-primary/50"
              onClick={() => {
                 setFormData(prev => ({ 
                    ...prev, 
                    action: prev.action ? prev.action + '\n' : '' 
                  }));
              }}
            >
              <Plus className="w-4 h-4 mr-2" /> Add Another Result
            </Button>


          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Priority</label>
              <Select value={formData.priority || 'Medium'} onChange={e => setFormData({...formData, priority: e.target.value})}>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={formData.status || 'Active'} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>
          </div>


        </div>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {viewMode === 'list' ? (
        <div className="space-y-6 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h2 className="text-3xl font-bold text-primary tracking-tight">Feng Shui Rules</h2>
              <p className="text-muted-foreground">Logic engine for automated recommendations.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={fetchRules} leftIcon={<RefreshCw className="w-4 h-4" />}>
                Refresh
              </Button>
              <Button variant="primary" onClick={openCreate} leftIcon={<Plus className="w-4 h-4" />}>
                Add Rule
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden border-t-4 border-t-primary">
            <div className="p-4 border-b border-border flex flex-col md:flex-row gap-4 justify-between items-center bg-card">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input 
                  type="text" 
                  placeholder="Search rules..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-input border border-input rounded-xl py-2 pl-10 pr-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                 {(priorityFilter.length > 0 || statusFilter.length > 0) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => {
                      setPriorityFilter([]);
                      setStatusFilter([]);
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
                      {(priorityFilter.length > 0 || statusFilter.length > 0) && (
                        <span className="ml-1 rounded-full bg-primary w-2 h-2" />
                      )}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>Priority</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      {['Critical', 'High', 'Medium', 'Low'].map((p) => (
                        <DropdownMenuCheckboxItem
                          key={p}
                          checked={priorityFilter.includes(p)}
                          onCheckedChange={(checked) => {
                            if (checked) setPriorityFilter([...priorityFilter, p]);
                            else setPriorityFilter(priorityFilter.filter(x => x !== p));
                            setCurrentPage(1);
                          }}
                        >
                          {p}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Status</DropdownMenuLabel>
                    <DropdownMenuGroup>
                      {['Active', 'Inactive'].map((s) => (
                        <DropdownMenuCheckboxItem
                           key={s}
                           checked={statusFilter.includes(s)}
                           onCheckedChange={(checked) => {
                             if (checked) setStatusFilter([...statusFilter, s]);
                             else setStatusFilter(statusFilter.filter(x => x !== s));
                             setCurrentPage(1);
                           }}
                        >
                          {s}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-xl shadow-lg px-[0px] pt-[20px] pb-[0px]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border/50 bg-muted/20">
                      <TableHead className="py-3.5 px-6">Condition</TableHead>
                      <TableHead className="py-3.5 px-6">Results / Actions</TableHead>
                      <TableHead className="py-3.5 px-6">Priority</TableHead>
                      <TableHead className="py-3.5 px-6">Status</TableHead>
                      <TableHead className="py-3.5 px-6 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedRules.length === 0 && !loading && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="text-center h-48 text-muted-foreground">
                          <div className="flex flex-col items-center gap-3">
                            <BookOpen className="w-8 h-8 text-muted-foreground/50" />
                            <p>No matching rules found.</p>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                    {paginatedRules.map((rule) => (
                      <TableRow 
                        key={rule.id} 
                        onClick={() => openEdit(rule)}
                        className="border-b border-border/30 transition-all duration-200 hover:bg-primary/5 cursor-pointer group/row"
                      >
                        <TableCell className="py-4 px-6">
                          <div className="font-mono text-xs font-semibold text-primary bg-primary/5 px-3 py-2 rounded-lg border border-primary/20 inline-flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                            <span>{rule.condition}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex flex-wrap gap-x-2 gap-y-1 text-sm text-foreground/90">
                            {(rule.action || '').split('\n').filter(Boolean).map((act, i) => (
                               <span key={`rule-${rule.id}-action-${i}`} className="inline-flex items-center">
                                {i > 0 && <span className="text-muted-foreground/40 mx-1">•</span>}
                                {act}
                              </span>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge 
                            variant={rule.priority === 'Critical' ? 'error' : rule.priority === 'High' ? 'warning' : 'purple'} 
                            className="gap-1.5 py-1 px-2.5 font-semibold text-[10px] uppercase tracking-wider"
                          >
                            {rule.priority === 'Critical' && <AlertCircle className="w-3 h-3" />}
                            {rule.priority === 'High' && <AlertTriangle className="w-3 h-3" />}
                            {(rule.priority === 'Medium' || rule.priority === 'Low') && <Info className="w-3 h-3" />}
                            {rule.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge 
                            variant={rule.status === 'Active' ? 'success' : 'default'} 
                            className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5"
                          >
                            {rule.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => { e.stopPropagation(); openEdit(rule); }} 
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => { e.stopPropagation(); openDelete(rule); }} 
                              className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              <div className="border-t border-border/50 bg-card/20 backdrop-blur-sm">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  totalItems={filteredRules.length}
                  itemsPerPage={itemsPerPage}
                  itemName="rules"
                />
              </div>
            </div>
          </Card>
        </div>
      ) : (
        renderForm()
      )}

       {/* DELETE CONFIRMATION */}
      <DialogRoot open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Rule?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this rule? This may affect automated recommendations.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>Cancel</Button>
            <Button variant="danger" onClick={handleDelete} leftIcon={<Trash2 className="w-4 h-4" />}>
              Delete Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};