import React, { useEffect, useState, useRef, useCallback } from "react";
import { motion as Motion, AnimatePresence } from "motion/react";
import { Card } from "./ui/Card";
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
import { Input, Select } from "./ui/Form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
} from "./ui/dropdown-menu";
import {
  Search,
  Filter,
  Pencil,
  Trash2,
  Plus,
  XCircle,
  Calendar as CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import { format, subDays, subMonths } from "date-fns";
import { DateRange } from "react-day-picker";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { cn } from "./ui/utils";
import { Pagination } from "./ui/Pagination";
import type { User } from "../../types/user";
import {
  listUsersMobile,
  deleteUser,
  updateUserStatus,
} from "../../services/users.service";
import { HttpError } from "../../lib/http";

// Fallback mock data only used if API fails (removed for production)

export const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const isMountedRef = useRef(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // Dialog States
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  // Selection State
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Filter State
  const [statusFilter, setStatusFilter] = useState<
    "active" | "inactive" | "suspended" | ""
  >("");
  const [planFilter, setPlanFilter] = useState<string>("");
  const [availablePlans, setAvailablePlans] = useState<
    Array<{ id: string; name: string }>
  >([]);

  // Date Filter State
  const [date, setDate] = useState<DateRange | undefined>({
    from: subMonths(new Date(), 1),
    to: new Date(),
  });
  const [timeRange, setTimeRange] = useState<
    "today" | "week" | "month" | "custom"
  >("month");

  useEffect(() => {
    isMountedRef.current = true;
    fetchUsers(1);
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fetch users when filters change
  useEffect(() => {
    if (currentPage === 1) {
      fetchUsers(1);
    } else {
      setCurrentPage(1);
    }
  }, [searchQuery, statusFilter, planFilter, timeRange, date]);

  // Update date range when timeRange selection changes
  useEffect(() => {
    const today = new Date();
    let newDate: DateRange | undefined;
    if (timeRange === "today") {
      newDate = { from: today, to: today };
    } else if (timeRange === "week") {
      newDate = { from: subDays(today, 7), to: today };
    } else if (timeRange === "month") {
      newDate = { from: subMonths(today, 1), to: today };
    }

    if (newDate && isMountedRef.current) {
      setDate(newDate);
      setCurrentPage(1);
    }
  }, [timeRange]);

  const fetchUsers = async (page: number = 1) => {
    try {
      if (isMountedRef.current) setLoading(true);

      const params: any = {
        page,
        limit: itemsPerPage,
      };

      if (searchQuery) params.search = searchQuery;
      if (statusFilter) params.status = statusFilter;
      if (planFilter) params.plan_id = planFilter;
      if (timeRange === "custom" && date?.from && date?.to) {
        params.date_filter = "custom";
        params.start_date = format(date.from, "yyyy-MM-dd");
        params.end_date = format(date.to, "yyyy-MM-dd");
      } else if (timeRange !== "custom") {
        params.date_filter = timeRange;
      }

      const response = await listUsersMobile(params);

      if (!isMountedRef.current) return;

      setUsers(response.users);
      setTotalItems(response.pagination.total);
      setTotalPages(response.pagination.total_pages);
      setAvailablePlans(response.availablePlans);
    } catch (error) {
      if (isMountedRef.current) {
        console.error("Failed to fetch users", error);
        toast.error("Failed to load users");
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  const handleStatusChange = async (
    user: User,
    status: "active" | "inactive" | "suspended",
  ) => {
    try {
      await updateUserStatus(user.id, status);
      toast.success("User status updated successfully");
      await fetchUsers(currentPage);
    } catch (error) {
      if (error instanceof HttpError && error.status === 422) {
        toast.error("Invalid status value");
      } else {
        toast.error("Failed to update user status");
      }
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await deleteUser(selectedUser.id);
      toast.success("User deleted successfully");
      setIsDeleteOpen(false);
      setSelectedUser(null);
      await fetchUsers(currentPage);
    } catch (error) {
      toast.error("Failed to delete user");
    }
  };

  // Backend handles filtering, sorting, and pagination
  const paginatedUsers = users;

  const getPlanName = (planId?: string) => {
    if (!planId) return "-";
    const matchedPlan = availablePlans.find((plan) => plan.id === planId);
    return matchedPlan?.name || planId;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
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
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 h-10 bg-black/5 dark:bg-black/40 border-white/10 hover:border-white/20 focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all rounded-xl w-full"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {/* Date Filter Container */}
              <div className="flex items-center p-1 bg-black/5 dark:bg-black/40 border border-white/10 rounded-xl gap-1 shadow-inner backdrop-blur-md">
                {(["today", "week", "month"] as const).map((range) => (
                  <Button
                    key={range}
                    variant={timeRange === range ? "primary" : "ghost"}
                    size="sm"
                    onClick={() => setTimeRange(range)}
                    className={cn(
                      "h-8 px-4 text-xs font-semibold rounded-lg transition-all duration-300",
                      timeRange === range
                        ? "shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]"
                        : "text-muted-foreground hover:text-primary hover:bg-primary/5 border-transparent",
                    )}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </Button>
                ))}

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={timeRange === "custom" ? "primary" : "ghost"}
                      size="sm"
                      className={cn(
                        "h-8 px-4 text-xs font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2",
                        timeRange === "custom"
                          ? "shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]"
                          : "text-muted-foreground hover:text-primary hover:bg-primary/5 border-transparent",
                      )}
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                      {date?.from ? (
                        date.to ? (
                          <span className="truncate max-w-[120px]">
                            {format(date.from, "MMM dd")} -{" "}
                            {format(date.to, "MMM dd")}
                          </span>
                        ) : (
                          format(date.from, "MMM dd")
                        )
                      ) : (
                        <span>Custom</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 bg-secondary/95 backdrop-blur-2xl border-white/10 shadow-2xl"
                    align="end"
                  >
                    <Calendar
                      mode="range"
                      defaultMonth={date?.from}
                      selected={date}
                      onSelect={(newDate) => {
                        setDate(newDate);
                        if (newDate) {
                          setTimeRange("custom");
                        }
                      }}
                      numberOfMonths={1}
                      initialFocus
                      className="bg-transparent"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {(statusFilter || planFilter) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStatusFilter("");
                    setPlanFilter("");
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
                    variant={statusFilter || planFilter ? "primary" : "outline"}
                    size="sm"
                    className={cn(
                      "h-10 transition-all px-4 rounded-xl gap-2",
                      statusFilter || planFilter
                        ? "shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]"
                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-primary/30",
                    )}
                  >
                    <Filter className="w-4 h-4" />
                    Filter
                    {(statusFilter || planFilter) && (
                      <span className="flex h-2 w-2 rounded-full bg-black/40 shadow-sm" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-secondary/95 backdrop-blur-2xl border-white/10 shadow-2xl"
                >
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-2 py-2">
                    Filter by Status
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {["active", "inactive", "suspended"].map((status) => (
                      <DropdownMenuCheckboxItem
                        key={status}
                        checked={statusFilter === status}
                        onCheckedChange={(checked) => {
                          setStatusFilter(checked ? (status as any) : "");
                        }}
                        className="focus:bg-primary/10 focus:text-primary transition-colors py-2"
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 px-2 py-2">
                    Filter by Plan
                  </DropdownMenuLabel>
                  <DropdownMenuGroup>
                    {availablePlans.map((plan) => (
                      <DropdownMenuCheckboxItem
                        key={plan.id}
                        checked={planFilter === plan.id}
                        onCheckedChange={(checked) => {
                          setPlanFilter(checked ? plan.id : "");
                        }}
                        className="focus:bg-primary/10 focus:text-primary transition-colors py-2"
                      >
                        {plan.name}
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
                    <TableHead className="py-3.5 px-6">User Name</TableHead>
                    <TableHead className="py-3.5 px-6">Gender</TableHead>
                    <TableHead className="py-3.5 px-6">Phone Number</TableHead>
                    <TableHead className="py-3.5 px-6">Status</TableHead>
                    <TableHead className="py-3.5 px-6">Plan</TableHead>
                    <TableHead className="py-3.5 px-6 text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading && users.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell colSpan={6} className="text-center h-48">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                          <span className="text-xs font-medium tracking-widest uppercase text-muted-foreground">
                            Loading users...
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : paginatedUsers.length === 0 ? (
                    <TableRow className="hover:bg-transparent">
                      <TableCell
                        colSpan={6}
                        className="text-center h-48 text-muted-foreground"
                      >
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
                          className="border-b border-border/30 transition-all duration-200 hover:bg-primary/5 group/row"
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
                            <span className="text-sm text-foreground/90 capitalize">
                              {user.sex || "-"}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <span className="text-sm text-foreground/90 tabular-nums">
                              {(
                                user as {
                                  phone?: string;
                                  phone_number?: string;
                                }
                              ).phone_number ||
                                (
                                  user as {
                                    phone?: string;
                                    phone_number?: string;
                                  }
                                ).phone ||
                                "-"}
                            </span>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-md px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border",
                                user.status === "active" &&
                                  "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                                user.status === "inactive" &&
                                  "bg-amber-500/10 text-amber-400 border-amber-500/30",
                                user.status === "suspended" &&
                                  "bg-rose-500/10 text-rose-400 border-rose-500/30",
                              )}
                            >
                              {user.status.charAt(0).toUpperCase() +
                                user.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-4 px-6">
                            <span className="text-sm text-foreground/90">
                              {user.plan_name || getPlanName(user.plan_id)}
                            </span>
                          </TableCell>
                          <TableCell
                            className="py-4 px-6"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Pencil className="w-3.5 h-3.5" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                  align="end"
                                  className="w-44"
                                >
                                  <DropdownMenuLabel>
                                    Update Status
                                  </DropdownMenuLabel>
                                  <DropdownMenuSeparator />
                                  {(
                                    ["active", "inactive", "suspended"] as const
                                  ).map((statusOption) => (
                                    <DropdownMenuCheckboxItem
                                      key={statusOption}
                                      checked={user.status === statusOption}
                                      onSelect={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        void handleStatusChange(
                                          user,
                                          statusOption,
                                        );
                                      }}
                                    >
                                      {statusOption.charAt(0).toUpperCase() +
                                        statusOption.slice(1)}
                                    </DropdownMenuCheckboxItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
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
                onPageChange={(page) => {
                  setCurrentPage(page);
                  fetchUsers(page);
                }}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                itemName="users"
              />
            </div>
          </div>
        </div>
      </Card>

      <DialogRoot open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription className="py-4">
              Are you sure you want to delete{" "}
              <strong>{selectedUser?.name}</strong>? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};
