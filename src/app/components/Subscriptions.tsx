import React, { useEffect, useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/Card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { Switch } from './ui/Switch';
import { DialogRoot, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from './ui/Dialog';
import { Input, Textarea } from './ui/Form';
import { CreditCard, Check, X, Shield, Crown, Sparkles, Plus, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { FormattedNumber } from './FormattedNumber';

interface Plan {
  id: number;
  name: string;
  price: string;
  duration: string;
  users: string;
  features: string[];
}

const MOCK_PLANS: Plan[] = [
  { id: 1, name: "Free Tier", price: "0.00", duration: "Lifetime", users: "8,740", features: ["Basic Elements Analysis", "Daily Horoscope", "Community Access"] },
  { id: 2, name: "Premium Monthly", price: "9.99", duration: "1 Month", users: "1,250", features: ["Advanced Feng Shui", "Lucky Colors & Directions", "No Ads", "Priority Support"] },
  { id: 3, name: "Premium Yearly", price: "99.00", duration: "1 Year", users: "850", features: ["All Premium Features", "Yearly Forecast", "Personal Consultation (1x)", "Save 20%"] },
  { id: 4, name: "Master Class", price: "299.00", duration: "Lifetime", users: "360", features: ["Full Course Access", "Certification", "Mentor Chat", "Exclusive Resources"] },
];

export const Subscriptions: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(true);
  
  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  
  // Selection
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState<Partial<Plan>>({});
  const [featureInput, setFeatureInput] = useState('');

  const fetchPlans = async () => {
    try {
      if (isMountedRef.current) setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      if (!isMountedRef.current) return;
      setPlans(MOCK_PLANS);
    } catch (error) {
      if (isMountedRef.current) {
        console.error('Failed to fetch plans', error);
        toast.error('Failed to load subscriptions');
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchPlans();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.price) {
        toast.error('Name and Price are required');
        return;
      }
      
      const newPlan = {
        ...formData,
        id: Math.floor(Math.random() * 10000),
        users: '0',
        features: formData.features || []
      } as Plan;
      
      setPlans([...plans, newPlan]);
      toast.success('Plan created successfully');
      setIsAddOpen(false);
      setFormData({});
    } catch (error) {
      toast.error('Failed to create plan');
    }
  };

  const handleUpdate = async () => {
    if (!selectedPlan) return;
    try {
      setPlans(plans.map(p => p.id === selectedPlan.id ? { ...p, ...formData } as Plan : p));
      toast.success('Plan updated successfully');
      setIsEditOpen(false);
      setSelectedPlan(null);
      setFormData({});
    } catch (error) {
      toast.error('Failed to update plan');
    }
  };

  const handleDelete = async (plan: Plan) => {
    if (!confirm(`Delete ${plan.name}?`)) return;
    try {
      setPlans(plans.filter(p => p.id !== plan.id));
      toast.success('Plan deleted successfully');
    } catch (error) {
      toast.error('Failed to delete plan');
    }
  };

  const openEdit = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData(plan);
    setIsEditOpen(true);
  };

  const addFeatureToForm = () => {
    if (!featureInput.trim()) return;
    const currentFeatures = formData.features || [];
    setFormData({ ...formData, features: [...currentFeatures, featureInput] });
    setFeatureInput('');
  };

  const removeFeatureFromForm = (index: number) => {
    const currentFeatures = formData.features || [];
    const updated = [...currentFeatures];
    updated.splice(index, 1);
    setFormData({ ...formData, features: updated });
  };

  // Helper to determine if price is numeric
  const isPriceNumeric = (price: string) => {
    const clean = price.replace(/[^0-9.-]/g, '');
    return clean && !isNaN(parseFloat(clean));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">Subscriptions</h2>
          <p className="text-muted-foreground">Manage pricing plans and feature access.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchPlans} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Refresh
          </Button>
          <Button variant="primary" onClick={() => { setFormData({ features: [] }); setIsAddOpen(true); }} leftIcon={<Plus className="w-4 h-4" />}>
            Add Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:col-span-2 overflow-hidden border-t-4 border-t-primary">
          <CardHeader>
            <CardTitle>Active Plans</CardTitle>
            <CardDescription>Current subscription tiers available to users.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-xl shadow-lg m-[0px]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border/50 bg-muted/20">
                      <TableHead className="py-3.5 px-6">Plan Name</TableHead>
                      <TableHead className="py-3.5 px-6">Price</TableHead>
                      <TableHead className="py-3.5 px-6">Duration</TableHead>
                      <TableHead className="py-3.5 px-6">Features</TableHead>
                      <TableHead className="py-3.5 px-6">Active Users</TableHead>
                      <TableHead className="py-3.5 px-6 text-center">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plans.map((plan) => (
                      <TableRow 
                        key={plan.id}
                        className="border-b border-border/30 transition-all duration-200 hover:bg-primary/5 cursor-pointer group/row"
                      >
                        <TableCell className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            {plan.name.includes('Master') || plan.name.includes('VIP') ? 
                              <Crown className="w-4 h-4 text-amber-400" /> : 
                             plan.name.includes('Premium') ? 
                              <Sparkles className="w-4 h-4 text-purple-400" /> : 
                              <Shield className="w-4 h-4 text-slate-400" />}
                            <span className="font-semibold text-foreground group-hover/row:text-primary transition-colors">
                              {plan.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="font-semibold text-sm">
                            {isPriceNumeric(plan.price) ? (
                              <FormattedNumber value={plan.price} prefix="$" />
                            ) : (
                              plan.price
                            )}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="text-sm text-muted-foreground">{plan.duration}</span>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <div className="flex gap-1 flex-wrap">
                            {plan.features && plan.features.slice(0, 2).map((f) => (
                              <Badge key={`${plan.id}-feature-${f}`} variant="outline" className="text-[10px] font-bold uppercase px-2 py-0.5">{f}</Badge>
                            ))}
                            {plan.features && plan.features.length > 2 && 
                              <Badge variant="outline" className="text-[10px] font-bold uppercase px-2 py-0.5">+{plan.features.length - 2}</Badge>}
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="font-semibold text-sm">
                            <FormattedNumber value={plan.users} />
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => { e.stopPropagation(); openEdit(plan); }}
                              className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={(e) => { e.stopPropagation(); handleDelete(plan); }} 
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
            </div>
          </CardContent>
        </Card>
      </div>

       {/* ADD/EDIT DIALOG */}
       <DialogRoot open={isAddOpen || isEditOpen} onOpenChange={(open) => {
         if (!open) {
           setIsAddOpen(false);
           setIsEditOpen(false);
         }
       }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditOpen ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
            <DialogDescription>Configure subscription tier details.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan Name</label>
              <Input 
                value={formData.name || ''} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Input 
                  value={formData.price || ''} 
                  onChange={e => setFormData({...formData, price: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Input 
                  value={formData.duration || ''} 
                  onChange={e => setFormData({...formData, duration: e.target.value})} 
                />
              </div>
            </div>
            <div className="space-y-2">
               <label className="text-sm font-medium">Features</label>
               <div className="flex gap-2">
                 <Input 
                   placeholder="Add feature..." 
                   value={featureInput}
                   onChange={e => setFeatureInput(e.target.value)}
                   onKeyDown={e => e.key === 'Enter' && addFeatureToForm()}
                 />
                 <Button type="button" onClick={addFeatureToForm} size="sm"><Plus className="w-4 h-4"/></Button>
               </div>
               <div className="flex flex-wrap gap-2 mt-2">
                 {formData.features?.map((f, i) => (
                   <Badge key={i} variant="secondary" className="gap-1 pr-1">
                     {f}
                     <button onClick={() => removeFeatureFromForm(i)} className="hover:text-destructive"><X className="w-3 h-3"/></button>
                   </Badge>
                 ))}
               </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setIsAddOpen(false); setIsEditOpen(false); }}>Cancel</Button>
            <Button variant="primary" onClick={isEditOpen ? handleUpdate : handleCreate}>
              {isEditOpen ? 'Save Changes' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};