import React, { useEffect, useRef, useState } from "react";
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
  Users,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/Card";
import { Button } from "./ui/Button";
import { Input, Select } from "./ui/Form";
import { Badge } from "./ui/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "./ui/dropdown-menu";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/Dialog";
import { TooltipProvider } from "./ui/tooltip";
import { ActionTooltip } from "./ui/ActionTooltip";
import { Pagination } from "./ui/Pagination";
import type { PromoCodeInput } from "../../types/promoCode";
import {
  addPromoCode,
  editPromoCodeById,
  listPromoCodes,
  removePromoCodeById,
  type PromoCodeRow,
} from "../../services/promoCodes.service";

type PromoCodeForm = Partial<PromoCodeInput> & { id?: string };

export const PromoCodes: React.FC = () => {
  const [promoCodes, setPromoCodes] = useState<PromoCodeRow[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const isMountedRef = useRef(true);
  const [selectedCode, setSelectedCode] = useState<PromoCodeRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PromoCodeRow | null>(null);
  const [statusTarget, setStatusTarget] = useState<PromoCodeRow | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;

  // Filter & Sort State
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof PromoCodeRow;
    direction: "asc" | "desc";
  } | null>(null);

  // New Code Form State
  const [newCode, setNewCode] = useState<PromoCodeForm>({
    code: "",
    discount_type: "percentage",
    discount_value: 0,
    status: "active",
    expires_at: "",
    total_usage_limit: 100,
    max_uses_per_user: 1,
  });

  const fetchPromoCodes = async () => {
    try {
      const sortMap: Partial<Record<keyof PromoCodeRow, string>> = {
        code: "code",
        value: "discount_value",
        usageCount: "used_count",
        expiryDate: "expires_at",
      };

      const response = await listPromoCodes({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery || undefined,
        status: statusFilter
          ? (statusFilter as "active" | "expired" | "disabled")
          : undefined,
        discount_type: typeFilter
          ? typeFilter === "amount"
            ? "amount"
            : "percentage"
          : undefined,
        sort_by: sortConfig?.key ? sortMap[sortConfig.key] : undefined,
        sort_order: sortConfig?.direction,
      });
      if (!isMountedRef.current) return;
      setPromoCodes(response.codes);
      setTotalItems(response.pagination.total);
      setTotalPages(response.pagination.total_pages);
    } catch (error) {
      if (isMountedRef.current) {
        toast.error("Failed to load promo codes");
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    void fetchPromoCodes();
    return () => {
      isMountedRef.current = false;
    };
  }, [currentPage, searchQuery, statusFilter, typeFilter, sortConfig]);

  const openCreate = () => {
    setSelectedCode(null);
    setIsEditing(false);
    setNewCode({
      code: "",
      discount_type: "percentage",
      discount_value: 0,
      status: "active",
      expires_at: "",
      total_usage_limit: 100,
      max_uses_per_user: 1,
    });
    setIsCreating(true);
  };

  const openEdit = async (code: PromoCodeRow) => {
    setSelectedCode(code);
    setIsEditing(true);
    setNewCode({
      id: code.id,
      code: code.code,
      discount_type: code.type === "fixed" ? "amount" : "percentage",
      discount_value: code.value,
      status: code.status,
      expires_at: code.expiryDate.slice(0, 10),
      total_usage_limit: code.usageLimit,
      max_uses_per_user: code.maxUsesPerUser,
    });
    setIsCreating(true);
  };

  const handleCreate = async () => {
    if (
      !newCode.code ||
      newCode.discount_value === undefined ||
      !newCode.expires_at
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    const payload = {
      code: newCode.code.toUpperCase(),
      discount_type: newCode.discount_type || "percentage",
      discount_value: Number(newCode.discount_value),
      total_usage_limit: Number(newCode.total_usage_limit) || 100,
      expires_at: new Date(newCode.expires_at).toISOString(),
      max_uses_per_user: Number(newCode.max_uses_per_user) || 1,
      status: newCode.status as "active" | "expired" | "disabled" | undefined,
    };

    try {
      if (isEditing && selectedCode) {
        await editPromoCodeById(selectedCode.id, payload);
        toast.success("Promo code updated successfully");
      } else {
        await addPromoCode(payload);
        toast.success("Promo code created successfully");
      }
      setIsCreating(false);
      setIsEditing(false);
      setSelectedCode(null);
      setNewCode({
        code: "",
        discount_type: "percentage",
        discount_value: 0,
        status: "active",
        expires_at: "",
        total_usage_limit: 100,
        max_uses_per_user: 1,
      });
      setCurrentPage(1);
      await fetchPromoCodes();
    } catch (error) {
      toast.error(
        isEditing
          ? "Failed to update promo code"
          : "Failed to create promo code",
      );
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removePromoCodeById(id);
      toast.success("Promo code deleted");
      await fetchPromoCodes();
    } catch (error) {
      toast.error("Failed to delete promo code");
    }
  };

  const toggleStatus = async (code: PromoCodeRow) => {
    try {
      await editPromoCodeById(code.id, {
        status: code.status === "active" ? "disabled" : "active",
      });
      toast.success("Status updated");
      await fetchPromoCodes();
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleSort = (key: keyof PromoCodeRow) => {
    let direction: "asc" | "desc" = "asc";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "asc"
    ) {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const paginatedCodes = promoCodes;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">
            Promo Codes
          </h2>
        </div>
        <Button
          variant="primary"
          onClick={openCreate}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Create New Code
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4 m-[0px]">
          <div className="relative w-full md:w-64">
            <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search codes..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<Filter className="w-4 h-4" />}
                >
                  Filter
                  {(statusFilter.length > 0 || typeFilter.length > 0) && (
                    <span className="ml-1 rounded-full bg-primary w-2 h-2" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                <DropdownMenuGroup>
                  {["active", "expired", "disabled"].map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilter === status}
                      onCheckedChange={(checked) => {
                        setStatusFilter(checked ? status : "");
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
                  {["percentage", "amount"].map((type) => (
                    <DropdownMenuCheckboxItem
                      key={type}
                      checked={typeFilter === type}
                      onCheckedChange={(checked) => {
                        setTypeFilter(checked ? type : "");
                        setCurrentPage(1);
                      }}
                    >
                      {type === "percentage" ? "Percentage" : "Fixed Amount"}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<MoreVertical className="w-4 h-4" />}
                >
                  Sort
                  {sortConfig && (
                    <span className="ml-1 text-xs text-muted-foreground">
                      ({sortConfig.key})
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleSort("expiryDate")}>
                    Expiry Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("usageCount")}>
                    Usage Count
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("value")}>
                    Discount Value
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleSort("code")}>
                    Code Name
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {(statusFilter.length > 0 || typeFilter.length > 0) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setStatusFilter("");
                  setTypeFilter("");
                  setCurrentPage(1);
                }}
                className="text-muted-foreground hover:text-foreground"
                leftIcon={<XCircle className="w-4 h-4" />}
              >
                Clear
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-2xl border border-border/50 overflow-hidden bg-card/30 backdrop-blur-xl shadow-lg m-[0px]">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-b border-border/50 bg-muted/20">
                    <TableHead
                      className="py-3.5 px-6 cursor-pointer hover:text-primary"
                      onClick={() => handleSort("code")}
                    >
                      Promo Code{" "}
                      {sortConfig?.key === "code" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead
                      className="py-3.5 px-6 cursor-pointer hover:text-primary"
                      onClick={() => handleSort("value")}
                    >
                      Discount{" "}
                      {sortConfig?.key === "value" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="py-3.5 px-6">Status</TableHead>
                    <TableHead
                      className="py-3.5 px-6 cursor-pointer hover:text-primary"
                      onClick={() => handleSort("usageCount")}
                    >
                      Total Usage{" "}
                      {sortConfig?.key === "usageCount" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="py-3.5 px-6">Limit/User</TableHead>
                    <TableHead
                      className="py-3.5 px-6 cursor-pointer hover:text-primary"
                      onClick={() => handleSort("expiryDate")}
                    >
                      Expires{" "}
                      {sortConfig?.key === "expiryDate" &&
                        (sortConfig.direction === "asc" ? "↑" : "↓")}
                    </TableHead>
                    <TableHead className="py-3.5 px-6 text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedCodes.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={7}
                        className="text-center h-48 text-muted-foreground"
                      >
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
                            <span className="font-semibold text-foreground group-hover/row:text-primary transition-colors">
                              {code.code}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="font-semibold text-sm">
                            {code.type === "percentage"
                              ? `${code.value}%`
                              : `$${code.value.toFixed(2)}`}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <Badge
                            variant="outline"
                            className={
                              code.status === "active"
                                ? "bg-green-500/20 text-green-600 border-0 text-[10px] font-bold uppercase px-2.5 py-0.5"
                                : code.status === "expired"
                                  ? "bg-orange-500/20 text-orange-600 border-0 text-[10px] font-bold uppercase px-2.5 py-0.5"
                                  : "bg-slate-500/20 text-slate-500 border-0 text-[10px] font-bold uppercase px-2.5 py-0.5"
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
                          <span className="text-sm text-muted-foreground">
                            {code.maxUsesPerUser}
                          </span>
                        </TableCell>
                        <TableCell className="py-4 px-6">
                          <span className="text-sm text-muted-foreground">
                            {code.expiryDate}
                          </span>
                        </TableCell>
                        <TableCell
                          className="py-4 px-6"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <TooltipProvider delayDuration={120}>
                            <div className="flex items-center justify-center gap-1">
                              <ActionTooltip
                                label={
                                  code.status === "expired"
                                    ? "Expired code"
                                    : code.status === "active"
                                      ? "Disable code"
                                      : "Enable code"
                                }
                              >
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  disabled={code.status === "expired"}
                                  className={
                                    code.status === "expired"
                                      ? "h-8 w-8 cursor-not-allowed text-muted-foreground/50 opacity-50"
                                      : "h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                                  }
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (code.status === "expired") {
                                      return;
                                    }
                                    setStatusTarget(code);
                                  }}
                                >
                                  {code.status === "active" ? (
                                    <XCircle className="w-3.5 h-3.5" />
                                  ) : (
                                    <CheckCircle className="w-3.5 h-3.5" />
                                  )}
                                </Button>
                              </ActionTooltip>
                              <ActionTooltip label="Edit code">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void openEdit(code);
                                  }}
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </Button>
                              </ActionTooltip>
                              <ActionTooltip label="Delete code">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setDeleteTarget(code);
                                  }}
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

            <div className="border-t border-border/50 bg-card/20 backdrop-blur-sm">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                itemName="codes"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <DialogRoot
        open={isCreating}
        onOpenChange={(open) => {
          setIsCreating(open);
          if (!open) {
            setIsEditing(false);
            setSelectedCode(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Promo Code" : "Create New Promo Code"}
            </DialogTitle>
            <DialogDescription>
              Configure the details for this promotion.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Code Name
              </label>
              <div className="relative">
                <Ticket className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="e.g. SUMMER2024"
                  className="pl-9 uppercase"
                  value={newCode.code}
                  onChange={(e) =>
                    setNewCode({
                      ...newCode,
                      code: e.target.value.toUpperCase(),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Discount Type
              </label>
              <Select
                value={newCode.discount_type}
                onChange={(e) =>
                  setNewCode({
                    ...newCode,
                    discount_type: e.target.value as "percentage" | "amount",
                  })
                }
              >
                <option value="percentage">Percentage (%)</option>
                <option value="amount">Fixed Amount ($)</option>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Discount Value
              </label>
              <div className="relative">
                {newCode.discount_type === "amount" ? (
                  <span className="absolute left-3 top-2.5 text-sm text-muted-foreground">
                    $
                  </span>
                ) : (
                  <Percent className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                )}
                <Input
                  type="number"
                  placeholder="0"
                  className="pl-9"
                  value={newCode.discount_value}
                  onChange={(e) =>
                    setNewCode({
                      ...newCode,
                      discount_value: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Expiry Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="pl-9"
                  value={newCode.expires_at}
                  onChange={(e) =>
                    setNewCode({ ...newCode, expires_at: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Total Usage Limit
              </label>
              <Input
                type="number"
                placeholder="100"
                value={newCode.total_usage_limit}
                onChange={(e) =>
                  setNewCode({
                    ...newCode,
                    total_usage_limit: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Max Uses Per User
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  placeholder="1"
                  className="pl-9"
                  value={newCode.max_uses_per_user}
                  onChange={(e) =>
                    setNewCode({
                      ...newCode,
                      max_uses_per_user: Number(e.target.value),
                    })
                  }
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button
                variant="ghost"
                onClick={() => {
                  setIsCreating(false);
                  setIsEditing(false);
                  setSelectedCode(null);
                }}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button variant="primary" onClick={handleCreate}>
              {isEditing ? "Save Changes" : "Create Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Promo Code</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Are you sure you want to delete ${deleteTarget.code}? This action cannot be undone.`
                : "Are you sure you want to delete this promo code? This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="danger"
              onClick={async () => {
                if (!deleteTarget) {
                  return;
                }
                await handleDelete(deleteTarget.id);
                setDeleteTarget(null);
              }}
            >
              Delete Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot
        open={Boolean(statusTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setStatusTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {statusTarget?.status === "active"
                ? "Disable Promo Code"
                : "Enable Promo Code"}
            </DialogTitle>
            <DialogDescription>
              {statusTarget
                ? `Are you sure you want to ${statusTarget.status === "active" ? "disable" : "enable"} ${statusTarget.code}?`
                : "Are you sure you want to change this promo code status?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" onClick={() => setStatusTarget(null)}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="primary"
              onClick={async () => {
                if (!statusTarget) {
                  return;
                }
                await toggleStatus(statusTarget);
                setStatusTarget(null);
              }}
            >
              {statusTarget?.status === "active"
                ? "Disable Code"
                : "Enable Code"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};
