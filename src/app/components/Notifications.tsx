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
import {
  Send,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  Info,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/Badge";
import { ConfirmDialog } from "./ui/ConfirmDialog";
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
  getNotification,
  listNotifications,
  previewAudience,
  sendNotification,
  updateNotificationDraft,
  type NotificationRow,
} from "../../services/notifications.service";
import { listSubscriptions } from "../../services/subscriptions.service";
import type {
  NotificationCreateInput,
  NotificationElementTarget,
  NotificationSubscriptionTarget,
} from "../../types/notification";
import type { SubscriptionPlan } from "../../types/subscription";

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

type AudienceFilter = "" | "all" | "elements" | "subscriptions" | "combined";

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

function getAudienceType(
  notification: NotificationRow,
): Exclude<AudienceFilter, ""> {
  const hasElements = notification.elements.length > 0;
  const hasSubscriptions = notification.subscriptions.length > 0;

  if (hasElements && hasSubscriptions) return "combined";
  if (hasElements) return "elements";
  if (hasSubscriptions) return "subscriptions";
  return "all";
}

function getTargetLabel(notification: NotificationRow) {
  const labels: string[] = [];

  if (notification.elements.length > 0) {
    labels.push(
      `Elements: ${notification.elements.map((value) => formatLabel(value)).join(", ")}`,
    );
  }

  if (notification.subscriptions.length > 0) {
    labels.push(
      `Subscriptions: ${notification.subscriptions
        .map((value) => formatLabel(value))
        .join(", ")}`,
    );
  }

  return labels.length > 0 ? labels.join(" • ") : "All Users";
}

function formatDateTime(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

export const Notifications: React.FC = () => {
  const isMountedRef = useRef(true);
  const draftCountRequestIdRef = useRef(0);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [customPlans, setCustomPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [customPlansLoading, setCustomPlansLoading] = useState(false);
  const [customPlansQuery, setCustomPlansQuery] = useState("");

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
  const [audienceFilter, setAudienceFilter] = useState<AudienceFilter>("");

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isUpdateConfirmOpen, setIsUpdateConfirmOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<NotificationRow | null>(null);
  const [sendTarget, setSendTarget] = useState<NotificationRow | null>(null);
  const [sendSuccessTarget, setSendSuccessTarget] =
    useState<NotificationRow | null>(null);
  const [alreadySentTarget, setAlreadySentTarget] =
    useState<NotificationRow | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<NotificationRow | null>(
    null,
  );
  const [confirmZeroAudienceSend, setConfirmZeroAudienceSend] = useState(false);

  const [form, setForm] = useState<{
    title: string;
    body: string;
    elementTargets: NotificationElementTarget[];
    subscriptionTargets: NotificationSubscriptionTarget[];
    subscriptionPlanIds: string[];
  }>({
    title: "",
    body: "",
    elementTargets: [],
    subscriptionTargets: [],
    subscriptionPlanIds: [],
  });

  const [previewCount, setPreviewCount] = useState<number | null>(null);
  const [previewLabel, setPreviewLabel] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draftRecipientCounts, setDraftRecipientCounts] = useState<
    Record<string, number>
  >({});

  const canSaveDraft = useMemo(() => {
    return Boolean(form.title.trim() && form.body.trim());
  }, [form.title, form.body]);

  const filteredNotifications = useMemo(() => {
    if (!audienceFilter) return notifications;
    return notifications.filter(
      (notification) => getAudienceType(notification) === audienceFilter,
    );
  }, [notifications, audienceFilter]);

  const statusCounts = useMemo(() => {
    return filteredNotifications.reduce(
      (acc, notification) => {
        acc[notification.status] += 1;
        return acc;
      },
      { draft: 0, sent: 0, failed: 0 },
    );
  }, [filteredNotifications]);

  const isCustomSubscriptionSelected = useMemo(
    () => form.subscriptionTargets.includes("custom"),
    [form.subscriptionTargets],
  );

  const filteredCustomPlans = useMemo(() => {
    const query = customPlansQuery.trim().toLowerCase();
    if (!query) return customPlans;
    return customPlans.filter((plan) =>
      plan.plan_name.toLowerCase().includes(query),
    );
  }, [customPlans, customPlansQuery]);

  const selectedCustomPlanNames = useMemo(() => {
    if (form.subscriptionPlanIds.length === 0) return [] as string[];

    const planMap = new Map(
      customPlans.map((plan) => [plan.id, plan.plan_name]),
    );
    return form.subscriptionPlanIds.map((id) => planMap.get(id) || id);
  }, [customPlans, form.subscriptionPlanIds]);

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
      subscriptionPlanIds:
        value === "custom" && current.subscriptionTargets.includes(value)
          ? []
          : current.subscriptionPlanIds,
    }));
  };

  const toggleSubscriptionPlanId = (planId: string) => {
    setForm((current) => ({
      ...current,
      subscriptionPlanIds: current.subscriptionPlanIds.includes(planId)
        ? current.subscriptionPlanIds.filter((id) => id !== planId)
        : [...current.subscriptionPlanIds, planId],
    }));
  };

  const hydrateDraftRecipientCounts = async (
    rows: NotificationRow[],
    requestId: number,
  ) => {
    const draftsToPreview = rows.filter(
      (row) => row.status === "draft" && row.recipientCount === null,
    );

    if (draftsToPreview.length === 0) {
      if (
        isMountedRef.current &&
        draftCountRequestIdRef.current === requestId
      ) {
        setDraftRecipientCounts({});
      }
      return;
    }

    const previewResults = await Promise.all(
      draftsToPreview.map(async (row) => {
        try {
          const preview = await previewAudience({
            ...(row.elements.length > 0 ? { elements: row.elements } : {}),
            ...(row.subscriptions.length > 0
              ? { subscriptions: row.subscriptions }
              : {}),
            ...(row.subscriptionPlanIds.length > 0
              ? { subscription_plan_ids: row.subscriptionPlanIds }
              : {}),
          });

          return [row.id, preview.count] as const;
        } catch {
          return null;
        }
      }),
    );

    if (!isMountedRef.current || draftCountRequestIdRef.current !== requestId) {
      return;
    }

    const nextCounts: Record<string, number> = {};
    for (const result of previewResults) {
      if (!result) continue;
      const [id, count] = result;
      nextCounts[id] = count;
    }

    setDraftRecipientCounts(nextCounts);
  };

  const fetchNotifications = async (page = currentPage) => {
    try {
      if (isMountedRef.current) setLoading(true);
      const requestId = Date.now();
      draftCountRequestIdRef.current = requestId;

      const response = await listNotifications({
        page,
        limit: PAGE_LIMIT,
        status: statusFilter || undefined,
      });

      if (!isMountedRef.current) return;

      setNotifications(response.notifications);
      setPagination(response.pagination);
      void hydrateDraftRecipientCounts(response.notifications, requestId);
    } catch (error) {
      if (isMountedRef.current) {
        toast.error(getErrorMessage(error, "Failed to load notifications"));
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  const fetchCustomPlans = async () => {
    try {
      if (isMountedRef.current) setCustomPlansLoading(true);

      const response = await listSubscriptions({ page: 1, limit: 100 });
      if (!isMountedRef.current) return;

      setCustomPlans(
        response.plans.filter((plan) => plan.plan_type === "custom"),
      );
    } catch (error) {
      if (isMountedRef.current) {
        toast.error(getErrorMessage(error, "Failed to load custom plans"));
      }
    } finally {
      if (isMountedRef.current) setCustomPlansLoading(false);
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
  }, [currentPage, statusFilter]);

  useEffect(() => {
    if (
      !isCreateOpen ||
      !isCustomSubscriptionSelected ||
      customPlans.length > 0
    ) {
      return;
    }
    fetchCustomPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCreateOpen, isCustomSubscriptionSelected]);

  useEffect(() => {
    if (!isCreateOpen) {
      return;
    }

    const runPreview = async () => {
      setPreviewLoading(true);
      try {
        const preview = await previewAudience({
          ...(form.elementTargets.length > 0
            ? { elements: form.elementTargets }
            : {}),
          ...(form.subscriptionTargets.length > 0
            ? { subscriptions: form.subscriptionTargets }
            : {}),
          ...(form.subscriptionPlanIds.length > 0
            ? { subscription_plan_ids: form.subscriptionPlanIds }
            : {}),
        });
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
    form.elementTargets,
    form.subscriptionTargets,
    form.subscriptionPlanIds,
    isCreateOpen,
  ]);

  const resetForm = () => {
    setForm({
      title: "",
      body: "",
      elementTargets: [],
      subscriptionTargets: [],
      subscriptionPlanIds: [],
    });
    setCustomPlansQuery("");
    setPreviewCount(null);
    setPreviewLabel(null);
    setConfirmZeroAudienceSend(false);
  };

  const openCreate = () => {
    resetForm();
    setEditTarget(null);
    setIsCreateOpen(true);
  };

  const openEdit = (notification: NotificationRow) => {
    if (notification.status !== "draft") {
      toast.error("Only draft notifications can be edited");
      return;
    }

    setEditTarget(notification);
    setForm({
      title: notification.title,
      body: notification.body,
      elementTargets: notification.elements,
      subscriptionTargets: notification.subscriptions,
      subscriptionPlanIds: notification.subscriptionPlanIds,
    });
    setCustomPlansQuery("");
    setPreviewCount(null);
    setPreviewLabel(null);
    setConfirmZeroAudienceSend(false);
    setIsCreateOpen(true);
  };

  const handleCreateDraft = async () => {
    if (!form.title.trim() || !form.body.trim()) {
      toast.error("Title and body are required");
      return;
    }

    const payload: NotificationCreateInput = {
      title: form.title.trim(),
      body: form.body.trim(),
      elements: form.elementTargets,
      subscriptions: form.subscriptionTargets,
      subscription_plan_ids: form.subscriptionPlanIds,
    };

    setIsCreating(true);
    try {
      if (editTarget) {
        await updateNotificationDraft(editTarget.id, payload);
        toast.success("Notification draft updated");
      } else {
        await createNotificationDraft(payload);
        toast.success("Notification draft created");
      }
      setIsCreateOpen(false);
      setIsUpdateConfirmOpen(false);
      resetForm();
      setEditTarget(null);
      setCurrentPage(1);
      await fetchNotifications(1);
    } catch (error) {
      if (editTarget && error instanceof HttpError && error.status === 403) {
        toast.error(
          "You do not have permission to update notifications (notifications.update).",
        );
        return;
      }

      toast.error(
        getErrorMessage(
          error,
          editTarget
            ? "Failed to update notification draft"
            : "Failed to create notification draft",
        ),
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleSaveDraftClick = () => {
    if (isCreating || !canSaveDraft) {
      return;
    }

    if (editTarget) {
      setIsUpdateConfirmOpen(true);
      return;
    }

    void handleCreateDraft();
  };

  const handleSendDraft = async () => {
    if (!sendTarget) return;
    if (isSending) return;

    let latestNotification: NotificationRow;
    try {
      latestNotification = await getNotification(sendTarget.id);
    } catch (error) {
      toast.error(
        getErrorMessage(error, "Failed to validate notification status"),
      );
      return;
    }

    const resolvedRecipientCount =
      latestNotification.recipientCount ??
      draftRecipientCounts[latestNotification.id] ??
      sendTarget.recipientCount;

    if (latestNotification.status === "sent") {
      setAlreadySentTarget(latestNotification);
      setSendTarget(null);
      setConfirmZeroAudienceSend(false);
      await fetchNotifications(currentPage);
      return;
    }

    if (latestNotification.status === "failed") {
      toast.error(
        "This notification is in failed status. Update or duplicate it as draft before sending.",
      );
      setSendTarget(null);
      setConfirmZeroAudienceSend(false);
      await fetchNotifications(currentPage);
      return;
    }

    if (resolvedRecipientCount === 0) {
      toast.error(
        "This notification has zero recipients and cannot be sent. Update audience targets and try again.",
      );
      setSendTarget(null);
      setConfirmZeroAudienceSend(false);
      return;
    }

    setIsSending(true);
    try {
      const sentNotification = await sendNotification(sendTarget.id);
      if (isMountedRef.current) {
        setNotifications((current) =>
          current.map((item) =>
            item.id === sentNotification.id ? sentNotification : item,
          ),
        );
        setDraftRecipientCounts((current) => {
          const next = { ...current };
          delete next[sentNotification.id];
          return next;
        });
      }
      setSendSuccessTarget(sentNotification);
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
    if (isDeleting) return;

    setIsDeleting(true);
    try {
      await deleteNotification(deleteTarget.id);
      if (isMountedRef.current) {
        const deletedId = deleteTarget.id;
        setNotifications((current) =>
          current.filter((item) => item.id !== deletedId),
        );
        setDraftRecipientCounts((current) => {
          const next = { ...current };
          delete next[deletedId];
          return next;
        });
      }
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
          <div>
            <h2 className="text-3xl font-bold text-primary tracking-tight">
              Notifications
            </h2>
          </div>
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
            value={audienceFilter}
            onChange={(event) => {
              setAudienceFilter(event.target.value as AudienceFilter);
            }}
            className="w-[190px]"
          >
            <option value="">All Audiences</option>
            <option value="all">All Users</option>
            <option value="elements">Elements</option>
            <option value="subscriptions">Subscriptions</option>
            <option value="combined">Combined</option>
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
            <p className="text-xs text-muted-foreground">Drafts in view</p>
            <p className="text-2xl font-semibold tabular-nums">
              {statusCounts.draft}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Sent in view</p>
            <p className="text-2xl font-semibold tabular-nums text-green-600">
              {statusCounts.sent}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Failed in view</p>
            <p className="text-2xl font-semibold tabular-nums text-rose-600">
              {statusCounts.failed}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="h-full overflow-hidden">
        <CardHeader className="py-4">
          <CardTitle className="text-lg">Notification History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-transparent hover:bg-transparent border-b border-border/60">
                  <TableHead>Title</TableHead>
                  <TableHead>Body</TableHead>
                  <TableHead>Elements</TableHead>
                  <TableHead>Subscriptions</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Recipients</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="pr-6 text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center h-32 text-muted-foreground"
                    >
                      Loading notifications...
                    </TableCell>
                  </TableRow>
                ) : notifications.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center h-32 text-muted-foreground"
                    >
                      No notifications found.
                    </TableCell>
                  </TableRow>
                ) : filteredNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={9}
                      className="text-center h-32 text-muted-foreground"
                    >
                      No notifications match this audience filter.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotifications.map((notification) => (
                    <TableRow
                      key={notification.id}
                      className="border-b border-border/40"
                    >
                      <TableCell className="max-w-[260px]">
                        <p className="font-semibold text-foreground whitespace-nowrap truncate">
                          {notification.title || "-"}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-[240px]">
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.body || "-"}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-[240px]">
                        <div className="flex flex-wrap gap-1.5">
                          {notification.elements.length === 0 ? (
                            <Badge variant="outline" className="text-xs">
                              All
                            </Badge>
                          ) : (
                            notification.elements.map((value) => (
                              <Badge
                                key={`${notification.id}-element-${value}`}
                                variant="outline"
                                className="text-xs"
                              >
                                {formatLabel(value)}
                              </Badge>
                            ))
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[260px]">
                        <div className="flex flex-wrap gap-1.5">
                          {notification.subscriptions.length === 0 ? (
                            <Badge variant="outline" className="text-xs">
                              All
                            </Badge>
                          ) : (
                            notification.subscriptions.map((value) => (
                              <Badge
                                key={`${notification.id}-sub-${value}`}
                                variant="outline"
                                className="text-xs"
                              >
                                {formatLabel(value)}
                              </Badge>
                            ))
                          )}
                        </div>
                        {notification.subscriptionPlanIds.length > 0 && (
                          <p className="mt-1 text-[11px] text-muted-foreground truncate">
                            Custom plans:{" "}
                            {notification.subscriptionPlanIds.length}
                          </p>
                        )}
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
                        {notification.recipientCount ??
                          draftRecipientCounts[notification.id] ??
                          (notification.status === "draft"
                            ? "Calculating..."
                            : "-")}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {notification.createdByName || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDateTime(notification.createdAt)}
                      </TableCell>
                      <TableCell
                        className="pr-6"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={notification.status !== "draft"}
                            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted"
                            onClick={() => openEdit(notification)}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={notification.status === "sent"}
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
            setIsUpdateConfirmOpen(false);
            resetForm();
            setEditTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editTarget
                ? "Edit Notification Draft"
                : "Create Notification Draft"}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? "Update the draft content and audience before sending."
                : "Create a draft notification and choose the target audience."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            <div className="rounded-xl border border-border/60 bg-card/30 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold tracking-wide text-foreground/90">
                  Message
                </h4>
                <Badge variant="outline" className="text-[11px]">
                  Required
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Title</label>
                  <span className="text-xs text-muted-foreground">
                    {form.title.length}/255
                  </span>
                </div>
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
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Body</label>
                  <span className="text-xs text-muted-foreground">
                    {form.body.length} chars
                  </span>
                </div>
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
            </div>

            <div className="space-y-3 rounded-xl border border-border/60 bg-card/30 p-4">
              <div>
                <h4 className="text-sm font-semibold tracking-wide text-foreground/90">
                  Audience
                </h4>
              </div>

              <div className="space-y-3 rounded-lg border border-border/60 bg-muted/10 p-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Element Targets</label>
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
                      const selected = form.subscriptionTargets.includes(value);
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

                {isCustomSubscriptionSelected && (
                  <div className="space-y-2 rounded-md border border-border/60 bg-background/40 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-sm font-medium">
                        Custom Plans
                      </label>
                      <span className="text-xs text-muted-foreground">
                        {form.subscriptionPlanIds.length} selected
                      </span>
                    </div>
                    <Input
                      value={customPlansQuery}
                      onChange={(event) =>
                        setCustomPlansQuery(event.target.value)
                      }
                      placeholder="Search custom plan name..."
                    />
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
                      {customPlansLoading ? (
                        <p className="text-xs text-muted-foreground">
                          Loading custom plans...
                        </p>
                      ) : filteredCustomPlans.length === 0 ? (
                        <p className="text-xs text-muted-foreground">
                          No custom plans found.
                        </p>
                      ) : (
                        filteredCustomPlans.map((plan) => {
                          const selected = form.subscriptionPlanIds.includes(
                            plan.id,
                          );
                          return (
                            <Button
                              key={plan.id}
                              type="button"
                              variant={selected ? "primary" : "outline"}
                              size="sm"
                              onClick={() => toggleSubscriptionPlanId(plan.id)}
                              title={plan.id}
                            >
                              {plan.plan_name}
                            </Button>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="">
                {previewLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Fetching latest recipient estimate from server...
                  </p>
                ) : previewCount !== null ? (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">
                      {previewLabel || "Matched audience"}
                    </p>
                    <p className="text-sm text-foreground">
                      Estimated recipients:
                      <span className="ml-1 font-semibold tabular-nums">
                        {previewCount}
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Select element/subscription targets to preview, or leave
                    both empty for all users.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-card/20 px-3 py-2 text-xs">
              <span className="text-muted-foreground">
                Draft will not send until you click Send in history.
              </span>
              <Badge variant={canSaveDraft ? "default" : "outline"}>
                {canSaveDraft ? "Ready to Save" : "Incomplete"}
              </Badge>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              variant="primary"
              onClick={handleSaveDraftClick}
              disabled={isCreating || !canSaveDraft}
            >
              {isCreating
                ? "Saving..."
                : editTarget
                  ? "Update Draft"
                  : "Save Draft"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <ConfirmDialog
        open={isUpdateConfirmOpen}
        title="Confirm Draft Update"
        description="Are you sure you want to update this draft notification?"
        confirmLabel="Update Draft"
        isLoading={isCreating}
        onConfirm={handleCreateDraft}
        onOpenChange={setIsUpdateConfirmOpen}
      />

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
            {sendTarget?.recipientCount === null && (
              <p className="text-xs text-muted-foreground">
                Recipient count is not precomputed for this draft.
              </p>
            )}
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
              disabled={isSending || sendTarget?.recipientCount === 0}
            >
              {isSending ? "Sending..." : "Send"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot
        open={Boolean(sendSuccessTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setSendSuccessTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15 text-green-600">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <DialogTitle className="text-center">
              Notification Sent Successfully
            </DialogTitle>
            <DialogDescription className="text-center">
              {sendSuccessTarget
                ? `\"${sendSuccessTarget.title}\" has been sent.`
                : "The notification has been sent."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="primary"
              onClick={() => setSendSuccessTarget(null)}
              className="w-full"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot
        open={Boolean(alreadySentTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setAlreadySentTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-sky-500/15 text-sky-600">
              <Info className="h-7 w-7" />
            </div>
            <DialogTitle className="text-center">
              Notification Already Sent
            </DialogTitle>
            <DialogDescription className="text-center">
              {alreadySentTarget
                ? `\"${alreadySentTarget.title}\" was already sent before.`
                : "This notification was already sent before."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="primary"
              onClick={() => setAlreadySentTarget(null)}
              className="w-full"
            >
              Done
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
