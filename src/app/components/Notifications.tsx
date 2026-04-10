import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { Button } from "./ui/Button";
import { Input, Select, Textarea } from "./ui/Form";
import { Switch } from "./ui/Switch";
import { Send, RefreshCw, Plus, Trash2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/Badge";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/Dialog";
import { toast } from "sonner";
import { Pagination } from "./ui/Pagination";
import { HttpError } from "../../lib/http";
import {
  createNotificationDraft,
  deleteNotification,
  listNotifications,
  previewAudience,
  sendNotification,
  type NotificationRow,
} from "../../services/notifications.service";
import type {
  NotificationAccountStatus,
  NotificationCreateInput,
  NotificationElementTarget,
  NotificationTargetFilters,
  NotificationTargetOperator,
  NotificationTargetType,
  NotificationSubscriptionTarget,
} from "../../types/notification";

const PAGE_LIMIT = 20;

const ELEMENT_TARGET_VALUES: NotificationElementTarget[] = [
  "wood",
  "fire",
  "earth",
  "metal",
  "water",
];
const SUBSCRIPTION_TARGET_VALUES: NotificationSubscriptionTarget[] = [
  "all_paid",
  "free",
  "day",
  "week",
  "month",
  "year",
  "custom",
];
const ACCOUNT_STATUS_VALUES: NotificationAccountStatus[] = [
  "active",
  "inactive",
  "suspended",
];

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof HttpError) {
    const details =
      typeof error.details === "object" && error.details !== null
        ? (error.details as Record<string, unknown>)
        : {};
    const message =
      typeof details.message === "string" ? details.message : error.message;
    return message || fallback;
  }

  return fallback;
}

function getTargetLabel(notification: NotificationRow) {
  if (notification.targetType === "all") {
    return "All Users";
  }

  if (!notification.targetValue) {
    return formatLabel(notification.targetType);
  }

  return `${formatLabel(notification.targetType)}: ${formatLabel(notification.targetValue)}`;
}

export const Notifications: React.FC = () => {
  const isMountedRef = useRef(true);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: PAGE_LIMIT,
    total_pages: 1,
  });

  const [statusFilter, setStatusFilter] = useState<
    "" | "draft" | "sent" | "failed"
  >("");
  const [targetFilter, setTargetFilter] = useState<"" | NotificationTargetType>(
    "",
  );

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sendTarget, setSendTarget] = useState<NotificationRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NotificationRow | null>(
    null,
  );
  const [useAdvancedTargeting, setUseAdvancedTargeting] = useState(false);
  const [confirmZeroAudienceSend, setConfirmZeroAudienceSend] = useState(false);

  const [form, setForm] = useState<{
    title: string;
    body: string;
    targetType: NotificationTargetType;
    elementTargets: NotificationElementTarget[];
    subscriptionTargets: NotificationSubscriptionTarget[];
    targetOperator: NotificationTargetOperator;
    accountStatus: NotificationAccountStatus[];
    activeState: "all" | "active" | "inactive";
  }>({
    title: "",
    body: "",
    targetType: "all",
    elementTargets: [],
    subscriptionTargets: [],
    targetOperator: "and",
    accountStatus: [],
    activeState: "all",
  });

  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusCounts = useMemo(() => {
    return notifications.reduce(
      (acc, item) => {
        if (item.status === "draft") acc.draft += 1;
        if (item.status === "sent") acc.sent += 1;
        if (item.status === "failed") acc.failed += 1;
        return acc;
      },
      { draft: 0, sent: 0, failed: 0 },
    );
  }, [notifications]);

  const selectedTargetValue = useMemo(() => {
    if (form.targetType === "element") {
      return form.elementTargets[0] || "";
    }
    if (form.targetType === "subscription") {
      return form.subscriptionTargets[0] || "";
    }
    return "";
  }, [form.targetType, form.elementTargets, form.subscriptionTargets]);

  const advancedTargetFilters = useMemo(() => {
    const filters: NotificationTargetFilters = {};

    if (form.elementTargets.length > 0) {
      filters.element = form.elementTargets;
    }
    if (form.subscriptionTargets.length > 0) {
      filters.subscription = form.subscriptionTargets;
    }
    if (form.accountStatus.length > 0) {
      filters.account_status = form.accountStatus;
    }
    if (form.activeState === "active") {
      filters.is_active = true;
    }
    if (form.activeState === "inactive") {
      filters.is_active = false;
    }

    return filters;
  }, [
    form.elementTargets,
    form.subscriptionTargets,
    form.accountStatus,
    form.activeState,
  ]);

  const hasAdvancedFilters = useMemo(
    () => Object.keys(advancedTargetFilters).length > 0,
    [advancedTargetFilters],
  );

  const toggleElementTarget = (value: NotificationElementTarget) => {
    setForm((current) => ({
      ...current,
      elementTargets: current.elementTargets.includes(value)
        ? current.elementTargets.filter((item) => item !== value)
        : [...current.elementTargets, value],
    }));
  };

  const toggleSubscriptionTarget = (value: NotificationSubscriptionTarget) => {
    setForm((current) => ({
      ...current,
      subscriptionTargets: current.subscriptionTargets.includes(value)
        ? current.subscriptionTargets.filter((item) => item !== value)
        : [...current.subscriptionTargets, value],
    }));
  };

  const toggleAccountStatus = (value: NotificationAccountStatus) => {
    setForm((current) => {
      const exists = current.accountStatus.includes(value);
      return {
        ...current,
        accountStatus: exists
          ? current.accountStatus.filter((item) => item !== value)
          : [...current.accountStatus, value],
      };
    });
  };

  const fetchNotifications = async (page = currentPage) => {
    try {
      if (isMountedRef.current) setLoading(true);

      const response = await listNotifications({
        page,
        limit: PAGE_LIMIT,
        status: statusFilter || undefined,
        target_type: targetFilter || undefined,
      });

      if (!isMountedRef.current) return;

      setNotifications(response.notifications);
      setPagination(response.pagination);
    } catch (error) {
      if (isMountedRef.current) {
        toast.error(getErrorMessage(error, "Failed to load notifications"));
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    fetchNotifications(1);
    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchNotifications(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, statusFilter, targetFilter]);

  useEffect(() => {
    if (!isCreateOpen) {
      return;
    }

    const runPreview = async () => {
      if (
        !useAdvancedTargeting &&
        form.targetType !== "all" &&
        !selectedTargetValue
      ) {
        setPreviewCount(null);
        setPreviewLabel(null);
        return;
      }

      if (useAdvancedTargeting && !hasAdvancedFilters) {
        setPreviewCount(null);
        setPreviewLabel(null);
        return;
      }

      setPreviewLoading(true);
      try {
        const preview = await previewAudience(
          useAdvancedTargeting
            ? {
                target_operator: form.targetOperator,
                target_filters: advancedTargetFilters,
              }
            : {
                target_type: form.targetType,
                target_value:
                  form.targetType === "all" || !selectedTargetValue
                    ? undefined
                    : selectedTargetValue,
              },
        );
        if (isMountedRef.current) {
          setPreviewCount(preview.count);
          setPreviewLabel(preview.label);
        }
      } catch (error) {
        if (isMountedRef.current) {
          setPreviewCount(null);
          setPreviewLabel(null);
          toast.error(
            getErrorMessage(error, "Failed to preview target audience"),
          );
        }
      } finally {
        if (isMountedRef.current) setPreviewLoading(false);
      }
    };

    runPreview();
  }, [
    form.targetType,
    form.targetOperator,
    selectedTargetValue,
    advancedTargetFilters,
    hasAdvancedFilters,
    useAdvancedTargeting,
    isCreateOpen,
  ]);

  const resetForm = () => {
    setForm({
      title: "",
      body: "",
      targetType: "all",
      elementTargets: [],
      subscriptionTargets: [],
      targetOperator: "and",
      accountStatus: [],
      activeState: "all",
    });
    setPreviewCount(null);
    setPreviewLabel(null);
    setConfirmZeroAudienceSend(false);
  };

  const openCreate = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const handleCreateDraft = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and body are required");
      return;
    }

    if (
      !useAdvancedTargeting &&
      form.targetType !== "all" &&
      !selectedTargetValue
    ) {
      toast.error("Target value is required for this target type");
      return;
    }

    if (useAdvancedTargeting && previewCount === 0) {
      toast.error("Audience preview is zero. Adjust filters before saving.");
      return;
    }

    if (useAdvancedTargeting && !hasAdvancedFilters) {
      toast.error("Select at least one advanced filter before saving.");
      return;
    }

    const legacyTargetValue =
      form.targetType === "element"
        ? form.elementTargets[0]
        : form.targetType === "subscription"
          ? form.subscriptionTargets[0]
          : undefined;

    const payload: NotificationCreateInput = useAdvancedTargeting
      ? {
          title: form.title.trim(),
          body: form.body.trim(),
          target_operator: form.targetOperator,
          target_filters: advancedTargetFilters,
        }
      : {
          title: form.title.trim(),
          body: form.body.trim(),
          target_type: form.targetType,
          ...(form.targetType !== "all" && legacyTargetValue
            ? { target_value: legacyTargetValue }
            : {}),
        };

    setIsCreating(true);
    try {
      await createNotificationDraft(payload);
      toast.success("Notification draft created");
      setIsCreateOpen(false);
      resetForm();
      setCurrentPage(1);
      await fetchNotifications(1);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to create notification draft"),
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleSendDraft = async () => {
    if (!sendTarget) return;

    if (sendTarget.recipientCount === 0 && !confirmZeroAudienceSend) {
      setConfirmZeroAudienceSend(true);
      toast.warning("Audience is zero. Click send again to confirm.");
      return;
    }

    setIsSending(true);
    try {
      await sendNotification(sendTarget.id);
      toast.success("Notification sent");
      setSendTarget(null);
      setConfirmZeroAudienceSend(false);
      await fetchNotifications(currentPage);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to send notification"));
    } finally {
      setIsSending(false);
    }
  };

  const handleDeleteNotification = async () => {
    if (!deleteTarget) return;

    setIsDeleting(true);
    try {
      await deleteNotification(deleteTarget.id);
      toast.success("Notification deleted");
      setDeleteTarget(null);
      await fetchNotifications(currentPage);
    } catch (error) {
      toast.error(getErrorMessage(error, "Failed to delete notification"));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Notifications</h2>
          <p className="text-sm text-muted-foreground">
            Create drafts, preview recipients, send, and manage history.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(
                event.target.value as "" | "draft" | "sent" | "failed",
              );
              setCurrentPage(1);
            }}
            className="w-[150px]"
          >
            <option value="">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="failed">Failed</option>
          </Select>

          <Select
            value={targetFilter}
            onChange={(event) => {
              setTargetFilter(
                event.target.value as "" | NotificationTargetType,
              );
              setCurrentPage(1);
            }}
            className="w-[170px]"
          >
            <option value="">All Targets</option>
            <option value="all">All Users</option>
            <option value="element">Element</option>
            <option value="subscription">Subscription</option>
          </Select>

          <Button
            variant="outline"
            onClick={() => fetchNotifications(currentPage)}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={openCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create Draft
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Drafts on this page</p>
            <p className="text-2xl font-semibold tabular-nums">
              {statusCounts.draft}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Sent on this page</p>
            <p className="text-2xl font-semibold tabular-nums text-green-600">
              {statusCounts.sent}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Failed on this page</p>
            <p className="text-2xl font-semibold tabular-nums text-rose-600">
              {statusCounts.failed}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="h-full overflow-hidden">
        <CardHeader className="py-4">
          <CardTitle className="text-lg">Notification History</CardTitle>
          <CardDescription>
            Only key fields are shown for faster admin actions.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-transparent hover:bg-transparent border-b border-border/60">
                  <TableHead>Title</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="pr-6 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center h-32 text-muted-foreground"
                    >
                      Loading notifications...
                    </TableCell>
                  </TableRow>
                ) : notifications.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center h-32 text-muted-foreground"
                    >
                      No notifications found.
                    </TableCell>
                  </TableRow>
                ) : (
                  notifications.map((notification) => (
                    <TableRow
                      key={notification.id}
                      className="border-b border-border/40"
                    >
                      <TableCell className="font-semibold text-foreground whitespace-nowrap max-w-[220px] truncate">
                        {notification.title || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getTargetLabel(notification)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            notification.status === "sent"
                              ? "border-green-500/30 bg-green-500/15 text-green-600"
                              : notification.status === "failed"
                                ? "border-rose-500/30 bg-rose-500/15 text-rose-600"
                                : "border-orange-500/30 bg-orange-500/15 text-orange-400"
                          }
                        >
                          {formatLabel(notification.status)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {notification.recipientCount}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {notification.createdAt
                          ? new Date(notification.createdAt).toLocaleString()
                          : "-"}
                      </TableCell>
                      <TableCell
                        className="pr-6"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={notification.status !== "draft"}
                            className="h-8"
                            leftIcon={<Send className="h-3.5 w-3.5" />}
                            onClick={() => {
                              setConfirmZeroAudienceSend(false);
                              setSendTarget(notification);
                            }}
                          >
                            Send
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={notification.status === "sent"}
                            className="h-8 w-8 text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10"
                            onClick={() => setDeleteTarget(notification)}
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

          {pagination.total_pages > 1 && (
            <div className="border-t border-border/50 bg-card/20 backdrop-blur-sm">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.total_pages}
                onPageChange={setCurrentPage}
                totalItems={pagination.total}
                itemsPerPage={pagination.limit}
                itemName="notifications"
              />
            </div>
          )}
        </CardContent>
      </Card>

      <DialogRoot
        open={isCreateOpen}
        onOpenChange={(open) => {
          setIsCreateOpen(open);
          if (!open) {
            resetForm();
          }
        }}
      >
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Notification Draft</DialogTitle>
            <DialogDescription>
              Fill message content and choose targeting. Advanced filters are
              optional.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    title: event.target.value,
                  }))
                }
                placeholder="System Notice"
                maxLength={255}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Body</label>
              <Textarea
                value={form.body}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    body: event.target.value,
                  }))
                }
                placeholder="Message content..."
                className="min-h-28"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/10 px-3 py-2">
                <div>
                  <p className="text-sm font-medium">Advanced Filters</p>
                  <p className="text-xs text-muted-foreground">
                    Use when you need multiple target conditions.
                  </p>
                </div>
                <Switch
                  checked={useAdvancedTargeting}
                  onCheckedChange={setUseAdvancedTargeting}
                />
              </div>

              {!useAdvancedTargeting ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Type</label>
                    <Select
                      value={form.targetType}
                      onChange={(event) =>
                        setForm((current) => ({
                          ...current,
                          targetType: event.target
                            .value as NotificationTargetType,
                        }))
                      }
                    >
                      <option value="all">All</option>
                      <option value="element">Element</option>
                      <option value="subscription">Subscription</option>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Target Value</label>
                    <Select
                      value={selectedTargetValue}
                      disabled={form.targetType === "all"}
                      onChange={(event) =>
                        setForm((current) =>
                          current.targetType === "element"
                            ? {
                                ...current,
                                elementTargets: event.target.value
                                  ? [
                                      event.target
                                        .value as NotificationElementTarget,
                                    ]
                                  : [],
                              }
                            : {
                                ...current,
                                subscriptionTargets: event.target.value
                                  ? [
                                      event.target
                                        .value as NotificationSubscriptionTarget,
                                    ]
                                  : [],
                              },
                        )
                      }
                    >
                      <option value="">Select value</option>
                      {(form.targetType === "element"
                        ? ELEMENT_TARGET_VALUES
                        : SUBSCRIPTION_TARGET_VALUES
                      ).map((value) => (
                        <option key={value} value={value}>
                          {formatLabel(value)}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 rounded-lg border border-border/60 bg-muted/10 p-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Operator</label>
                      <Select
                        value={form.targetOperator}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            targetOperator: event.target
                              .value as NotificationTargetOperator,
                          }))
                        }
                      >
                        <option value="and">AND</option>
                        <option value="or">OR</option>
                      </Select>
                      {form.targetOperator === "or" && (
                        <p className="text-xs text-orange-400">
                          OR can target a larger audience.
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Account Activity
                      </label>
                      <Select
                        value={form.activeState}
                        onChange={(event) =>
                          setForm((current) => ({
                            ...current,
                            activeState: event.target.value as
                              | "all"
                              | "active"
                              | "inactive",
                          }))
                        }
                      >
                        <option value="all">All Accounts</option>
                        <option value="active">Active Only</option>
                        <option value="inactive">Inactive Only</option>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Element Targets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ELEMENT_TARGET_VALUES.map((value) => {
                        const selected = form.elementTargets.includes(value);
                        return (
                          <Button
                            key={value}
                            type="button"
                            variant={selected ? "primary" : "outline"}
                            size="sm"
                            onClick={() => toggleElementTarget(value)}
                          >
                            {formatLabel(value)}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Subscription Targets
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUBSCRIPTION_TARGET_VALUES.map((value) => {
                        const selected =
                          form.subscriptionTargets.includes(value);
                        return (
                          <Button
                            key={value}
                            type="button"
                            variant={selected ? "primary" : "outline"}
                            size="sm"
                            onClick={() => toggleSubscriptionTarget(value)}
                          >
                            {formatLabel(value)}
                          </Button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Account Status
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {ACCOUNT_STATUS_VALUES.map((value) => {
                        const selected = form.accountStatus.includes(value);
                        return (
                          <Button
                            key={value}
                            type="button"
                            variant={selected ? "primary" : "outline"}
                            size="sm"
                            onClick={() => toggleAccountStatus(value)}
                          >
                            {formatLabel(value)}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-lg border border-border/60 bg-muted/10 p-3 text-sm">
              {previewLoading
                ? "Previewing audience..."
                : previewCount !== null
                  ? `${previewLabel ? `${previewLabel} • ` : ""}Estimated recipients: ${previewCount}`
                  : useAdvancedTargeting && !hasAdvancedFilters
                    ? "Select at least one advanced filter to preview audience."
                    : "Select a complete target to preview audience."}
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              variant="primary"
              onClick={handleCreateDraft}
              disabled={isCreating}
            >
              {isCreating ? "Saving..." : "Save Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot
        open={Boolean(sendTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setSendTarget(null);
            setConfirmZeroAudienceSend(false);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Send Notification</DialogTitle>
            <DialogDescription>
              {sendTarget
                ? `Send \"${sendTarget.title}\" to ${getTargetLabel(sendTarget)} now?`
                : "Send this draft now?"}
            </DialogDescription>
            {sendTarget?.recipientCount === 0 && (
              <p className="text-xs text-orange-400">
                This draft currently has zero recipients.
              </p>
            )}
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              variant="primary"
              onClick={handleSendDraft}
              disabled={isSending}
            >
              {isSending
                ? "Sending..."
                : sendTarget?.recipientCount === 0 && !confirmZeroAudienceSend
                  ? "Confirm Send"
                  : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Notification</DialogTitle>
            <DialogDescription>
              {deleteTarget
                ? `Are you sure you want to delete \"${deleteTarget.title}\"?`
                : "Are you sure you want to delete this notification?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              variant="danger"
              onClick={handleDeleteNotification}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};
