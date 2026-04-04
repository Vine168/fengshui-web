import React, { useEffect, useState, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/Card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Switch } from "./ui/Switch";
import { TooltipProvider } from "./ui/tooltip";
import { ActionTooltip } from "./ui/ActionTooltip";
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/Dialog";
import { Input, Textarea } from "./ui/Form";
import {
  CreditCard,
  Check,
  X,
  Shield,
  Crown,
  Sparkles,
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { FormattedNumber } from "./FormattedNumber";
import type {
  SubscriptionPlan,
  SubscriptionPlanInput,
  SubscriptionPlanFeature,
} from "../../types/subscription";
import {
  addSubscription,
  editSubscription,
  listSubscriptions,
  removeSubscription,
} from "../../services/subscriptions.service";

export const Subscriptions: React.FC = () => {
  const TYPE_DURATION_DEFAULTS: Record<string, number> = {
    day: 1,
    week: 7,
    month: 30,
    year: 365,
    free: 36500,
  };

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const isMountedRef = useRef(true);

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Selection
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null,
  );
  const [formData, setFormData] = useState<Partial<SubscriptionPlanInput>>({});
  const [featureText, setFeatureText] = useState("");

  const getDurationByType = (planType?: string, customDuration?: number) => {
    if (!planType) return undefined;
    if (planType === "custom") {
      return customDuration && customDuration >= 1 ? customDuration : 1;
    }
    return TYPE_DURATION_DEFAULTS[planType] ?? customDuration;
  };

  const handlePlanTypeChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      plan_type: value,
      duration: getDurationByType(value, prev.duration),
    }));
  };

  const fetchPlans = async () => {
    try {
      if (isMountedRef.current) setLoading(true);

      const response = await listSubscriptions({ page: 1, limit: 100 });
      if (!isMountedRef.current) return;

      setPlans(response.plans);
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Failed to fetch plans", error);
        toast.error("Failed to load subscriptions");
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
      if (
        !formData.plan_name ||
        formData.price === undefined ||
        !formData.plan_type ||
        !formData.duration
      ) {
        toast.error("Plan name, type, price, and duration are required");
        return;
      }

      await addSubscription({
        plan_name: formData.plan_name,
        plan_type: formData.plan_type,
        price: Number(formData.price),
        duration: Number(
          getDurationByType(formData.plan_type, formData.duration),
        ),
        feature: featureText.trim() || "",
        is_active: formData.is_active ?? true,
      });

      toast.success("Plan created successfully");
      setIsAddOpen(false);
      setFormData({});
      setFeatureText("");
      await fetchPlans();
    } catch (error) {
      toast.error("Failed to create plan");
    }
  };

  const handleUpdate = async () => {
    if (!selectedPlan) return;
    try {
      await editSubscription(selectedPlan.id, {
        plan_name: formData.plan_name,
        plan_type: formData.plan_type,
        price:
          formData.price !== undefined ? Number(formData.price) : undefined,
        duration:
          formData.duration !== undefined
            ? Number(getDurationByType(formData.plan_type, formData.duration))
            : undefined,
        feature: featureText.trim() || undefined,
        is_active: formData.is_active,
      });

      toast.success("Plan updated successfully");
      setIsEditOpen(false);
      setSelectedPlan(null);
      setFormData({});
      setFeatureText("");
      await fetchPlans();
    } catch (error) {
      toast.error("Failed to update plan");
    }
  };

  const handleDelete = async (plan: SubscriptionPlan) => {
    if (!confirm(`Delete ${plan.plan_name}?`)) return;
    try {
      await removeSubscription(plan.id);
      toast.success("Plan deleted successfully");
      await fetchPlans();
    } catch (error) {
      toast.error("Failed to delete plan");
    }
  };

  const openEdit = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      plan_name: plan.plan_name,
      plan_type: plan.plan_type,
      price: plan.price,
      duration: plan.duration,
      is_active: plan.is_active,
    });
    setFeatureText(
      typeof plan.feature === "string"
        ? plan.feature
        : plan.feature
          ? JSON.stringify(plan.feature)
          : "",
    );
    setIsEditOpen(true);
  };

  const getFeatureLabel = (feature: SubscriptionPlanFeature) => {
    if (!feature) return "-";
    if (typeof feature === "string") return feature;
    return feature.description || feature.type || "-";
  };

  const getDurationLabel = (duration: number) => {
    if (duration >= 36500) return "Lifetime";
    if (duration >= 365)
      return `${Math.round(duration / 365)} Year${duration >= 730 ? "s" : ""}`;
    return `${duration} Days`;
  };

  const filteredPlans = plans.filter((plan) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return true;
    return (
      String(plan.plan_name).toLowerCase().includes(normalizedQuery) ||
      String(plan.plan_type).toLowerCase().includes(normalizedQuery) ||
      String(getFeatureLabel(plan.feature))
        .toLowerCase()
        .includes(normalizedQuery)
    );
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">
            Subscriptions
          </h2>
          <p className="text-muted-foreground">
            Manage pricing plans and feature access.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="primary"
            onClick={() => {
              setFormData({});
              setIsAddOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add Plan
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="md:col-span-2 overflow-hidden border-t-4 border-t-primary">
          <CardHeader>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Active Plans</CardTitle>
                <CardDescription>
                  Current subscription tiers available to users.
                </CardDescription>
              </div>
              <div className="w-full md:w-auto">
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search plan..."
                  className="w-full md:w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-xl shadow-lg m-[0px]">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent border-b border-border/50 bg-muted/20">
                      <TableHead className="py-3.5 px-6">Plan Name</TableHead>
                      <TableHead className="py-3.5 px-6">Type</TableHead>
                      <TableHead className="py-3.5 px-6">Price</TableHead>
                      <TableHead className="py-3.5 px-6">Duration</TableHead>
                      <TableHead className="py-3.5 px-6">Features</TableHead>
                      <TableHead className="py-3.5 px-6">
                        Active Users
                      </TableHead>
                      <TableHead className="py-3.5 px-6">Status</TableHead>
                      <TableHead className="py-3.5 px-6 text-center">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlans.length === 0 ? (
                      <TableRow className="hover:bg-transparent">
                        <TableCell
                          colSpan={8}
                          className="text-center h-32 text-muted-foreground"
                        >
                          No plans found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPlans.map((plan) => (
                        <TableRow
                          key={plan.id}
                          className="border-b border-border/30 transition-all duration-200 hover:bg-primary/5 cursor-pointer group/row"
                        >
                          <TableCell className="py-4 px-6">
                            <div className="flex items-center gap-2">
                              {plan.plan_name.includes("Master") ||
                              plan.plan_name.includes("VIP") ? (
                                <Crown className="w-4 h-4 text-amber-400" />
                              ) : plan.plan_name.includes("Premium") ? (
                                <Sparkles className="w-4 h-4 text-purple-400" />
                              ) : (
                                <Shield className="w-4 h-4 text-slate-400" />
                              )}
                              <span className="font-semibold text-foreground group-hover/row:text-primary transition-colors">
                                {plan.plan_name}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <span className="text-sm text-muted-foreground">
                              {plan.plan_type}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <span className="font-semibold text-sm">
                              <FormattedNumber value={plan.price} prefix="$" />
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <span className="text-sm text-muted-foreground">
                              {getDurationLabel(plan.duration)}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <Badge
                              variant="outline"
                              className="text-[10px] font-bold uppercase px-2 py-0.5"
                            >
                              {getFeatureLabel(plan.feature)}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <span className="font-semibold text-sm">
                              <FormattedNumber value={plan.active_users} />
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <Badge
                              variant="outline"
                              className={
                                plan.is_active
                                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500"
                                  : "border-rose-500/30 bg-rose-500/10 text-rose-500"
                              }
                            >
                              {plan.is_active ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className="py-4 px-6"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <TooltipProvider delayDuration={120}>
                              <div className="flex items-center justify-center gap-1">
                                <ActionTooltip label="Edit plan">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openEdit(plan);
                                    }}
                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                </ActionTooltip>
                                <ActionTooltip label="Delete plan">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(plan);
                                    }}
                                    className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </Button>
                                </ActionTooltip>
                              </div>
                            </TooltipProvider>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ADD/EDIT DIALOG */}
      <DialogRoot
        open={isAddOpen || isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddOpen(false);
            setIsEditOpen(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditOpen ? "Edit Plan" : "Create New Plan"}
            </DialogTitle>
            <DialogDescription>
              Configure subscription plan details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Plan Name</label>
              <Input
                value={formData.plan_name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, plan_name: e.target.value })
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plan Type</label>
                <select
                  value={formData.plan_type || ""}
                  onChange={(e) => handlePlanTypeChange(e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="" disabled>
                    Select plan type
                  </option>
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                  <option value="free">Free</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Input
                  type="number"
                  value={formData.price ?? ""}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      price:
                        e.target.value === ""
                          ? undefined
                          : Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration (days)</label>
                <Input
                  type="number"
                  value={formData.duration ?? ""}
                  min={1}
                  disabled={formData.plan_type !== "custom"}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      duration:
                        e.target.value === ""
                          ? undefined
                          : Math.max(1, Number(e.target.value)),
                    })
                  }
                />
                {formData.plan_type && formData.plan_type !== "custom" && (
                  <p className="text-xs text-muted-foreground">
                    Auto-set by type: {formData.plan_type} ={" "}
                    {getDurationByType(formData.plan_type, formData.duration)}{" "}
                    days
                  </p>
                )}
                {formData.plan_type === "custom" && (
                  <p className="text-xs text-muted-foreground">
                    Custom supports any duration greater than or equal to 1 day.
                  </p>
                )}
              </div>
              <div className="space-y-2 flex items-center gap-3 pt-7">
                <Switch
                  checked={formData.is_active ?? true}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, is_active: checked })
                  }
                />
                <label className="text-sm font-medium">Active</label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Feature</label>
              <Textarea
                placeholder="Describe features or benefits..."
                value={featureText}
                onChange={(e) => setFeatureText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                setIsAddOpen(false);
                setIsEditOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={isEditOpen ? handleUpdate : handleCreate}
            >
              {isEditOpen ? "Save Changes" : "Create Plan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};
