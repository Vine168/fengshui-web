import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Check,
  Eye,
  EyeOff,
  RefreshCw,
  Send,
  Shield,
  ToggleLeft,
  ToggleRight,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Input, Textarea } from "./ui/Form";
import { Switch } from "./ui/Switch";
import { HttpError } from "../../lib/http";
import { useAdminAccess } from "../../hooks/useAdminAccess";
import {
  loadTelegramConfig,
  loadTelegramFeatures,
  saveTelegramConfig,
  saveTelegramFeatures,
  sendTelegramTestMessage,
} from "../../services/telegram.service";
import type {
  AdminTelegramConfig,
  AdminTelegramFeatures,
  TelegramNotifyOn,
  UpdateAdminTelegramConfigInput,
} from "../../types/telegram";

const DEFAULT_NOTIFY_ON: TelegramNotifyOn = {
  payment_paid: false,
  payment_failed: false,
  payment_verify_failed: false,
  login_alert: false,
  promo_code_event: false,
  subscription_plan_event: false,
  app_user_event: false,
  system_user_event: false,
  bank_config_event: false,
  role_event: false,
  settings_event: false,
};

const DEFAULT_CONFIG: AdminTelegramConfig = {
  id: "",
  bot_token: "",
  chat_ids: [],
  is_enabled: false,
  notify_on: DEFAULT_NOTIFY_ON,
  source: "",
  updated_by: null,
  updated_at: "",
};

const DEFAULT_FEATURES: AdminTelegramFeatures = {
  mobile_otp: false,
  payment_checkout: false,
  admin_broadcast_notifications: false,
  telegram_alerts: false,
};

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

function formatLabel(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDateTime(value: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function maskToken(token: string) {
  if (!token) return "Not configured";
  if (token.length <= 8) return token;
  return `${token.slice(0, 6)}••••${token.slice(-4)}`;
}

function normalizeChatIds(value: string) {
  return value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean)
    .filter((item, index, array) => array.indexOf(item) === index);
}

function notifyOnSummary(notifyOn: TelegramNotifyOn) {
  return Object.entries(notifyOn)
    .filter(([, enabled]) => enabled)
    .map(([key]) => formatLabel(key))
    .join(", ");
}

type NotifyField = keyof TelegramNotifyOn;
type FeatureField = keyof AdminTelegramFeatures;

type StatusCardProps = {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  tone?: "default" | "success" | "warning" | "info";
};

function StatusCard({
  label,
  value,
  description,
  icon,
  tone = "default",
}: StatusCardProps) {
  const toneClasses =
    tone === "success"
      ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-500"
      : tone === "warning"
        ? "border-amber-500/25 bg-amber-500/10 text-amber-500"
        : tone === "info"
          ? "border-sky-500/25 bg-sky-500/10 text-sky-500"
          : "border-border/60 bg-card/40 text-foreground";

  return (
    <Card className={`border ${toneClasses}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              {label}
            </p>
            <p className="text-2xl font-semibold tabular-nums">{value}</p>
            <p className="text-xs text-muted-foreground">{description}</p>
          </div>
          <div className="rounded-full border border-white/10 bg-background/40 p-2">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export const TelegramConfiguration: React.FC = () => {
  const isMountedRef = useRef(true);
  const { hasAnyPermission, isSuperUser } = useAdminAccess();
  const [loading, setLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [featuresSaving, setFeaturesSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [initialConfig, setInitialConfig] = useState(DEFAULT_CONFIG);
  const [configTokenInput, setConfigTokenInput] = useState("");
  const [showToken, setShowToken] = useState(true);
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [initialFeatures, setInitialFeatures] = useState(DEFAULT_FEATURES);

  const chatIds = useMemo(
    () => normalizeChatIds(config.chat_ids.join("\n")),
    [config.chat_ids],
  );

  const isConfigDirty = useMemo(() => {
    const normalizedToken = configTokenInput.trim();
    const initialToken = initialConfig.bot_token.trim();
    const tokenChanged = normalizedToken !== initialToken;
    const currentChatIds = normalizeChatIds(config.chat_ids.join("\n"));
    const initialChatIds = normalizeChatIds(initialConfig.chat_ids.join("\n"));

    return (
      tokenChanged ||
      config.is_enabled !== initialConfig.is_enabled ||
      JSON.stringify(config.notify_on) !==
        JSON.stringify(initialConfig.notify_on) ||
      JSON.stringify(currentChatIds) !== JSON.stringify(initialChatIds)
    );
  }, [config, initialConfig, configTokenInput]);

  const isFeaturesDirty = useMemo(() => {
    return JSON.stringify(features) !== JSON.stringify(initialFeatures);
  }, [features, initialFeatures]);

  const notifyEnabledCount = useMemo(
    () => Object.values(config.notify_on).filter(Boolean).length,
    [config.notify_on],
  );

  const canUpdateTelegram =
    isSuperUser || hasAnyPermission(["telegram.update"]);
  const canSendTest =
    isSuperUser || hasAnyPermission(["telegram.connect", "telegram.update"]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [configResponse, featuresResponse] = await Promise.all([
        loadTelegramConfig(),
        loadTelegramFeatures(),
      ]);

      if (!isMountedRef.current) return;

      setConfig(configResponse);
      setInitialConfig(configResponse);
      setConfigTokenInput(configResponse.bot_token ?? "");
      setFeatures(featuresResponse);
      setInitialFeatures(featuresResponse);
    } catch (error) {
      if (isMountedRef.current) {
        toast.error(getErrorMessage(error, "Failed to load Telegram settings"));
      }
    } finally {
      if (isMountedRef.current) setLoading(false);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    loadData();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const updateNotifyField = (field: NotifyField) => {
    setConfig((current) => ({
      ...current,
      notify_on: {
        ...current.notify_on,
        [field]: !current.notify_on[field],
      },
    }));
  };

  const updateFeatureField = (field: FeatureField) => {
    setFeatures((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const persistConfig = async (showSuccessToast: boolean) => {
    if (!canUpdateTelegram) {
      toast.error("You do not have permission to update Telegram settings");
      return null;
    }

    const normalizedChatIds = normalizeChatIds(config.chat_ids.join("\n"));

    if (normalizedChatIds.length === 0) {
      toast.error("Please add at least one chat ID");
      return null;
    }

    const payload: UpdateAdminTelegramConfigInput = {
      chat_ids: normalizedChatIds,
      is_enabled: config.is_enabled,
      notify_on: config.notify_on,
      bot_token: configTokenInput.trim(),
    };

    try {
      setConfigSaving(true);
      const updatedConfig = await saveTelegramConfig(payload);

      if (!isMountedRef.current) return null;

      setConfig(updatedConfig);
      setInitialConfig(updatedConfig);
      setConfigTokenInput(updatedConfig.bot_token ?? "");

      if (showSuccessToast) {
        toast.success("Telegram configuration updated");
      }

      return updatedConfig;
    } catch (error) {
      if (isMountedRef.current) {
        toast.error(
          getErrorMessage(error, "Failed to update Telegram configuration"),
        );
      }
      return null;
    } finally {
      if (isMountedRef.current) setConfigSaving(false);
    }
  };

  const handleSaveConfig = async () => {
    await persistConfig(true);
  };

  const handleSaveFeatures = async () => {
    if (!canUpdateTelegram) {
      toast.error("You do not have permission to update Telegram features");
      return;
    }

    try {
      setFeaturesSaving(true);
      const updatedFeatures = await saveTelegramFeatures(features);

      if (!isMountedRef.current) return;

      setFeatures(updatedFeatures);
      setInitialFeatures(updatedFeatures);
      toast.success("Telegram features updated");
    } catch (error) {
      if (isMountedRef.current) {
        toast.error(
          getErrorMessage(error, "Failed to update Telegram features"),
        );
      }
    } finally {
      if (isMountedRef.current) setFeaturesSaving(false);
    }
  };

  const handleTest = async () => {
    if (!canSendTest) {
      toast.error("You do not have permission to send Telegram test");
      return;
    }

    const normalizedChatIds = normalizeChatIds(config.chat_ids.join("\n"));

    if (normalizedChatIds.length === 0) {
      toast.error("Add at least one chat ID before sending a test message");
      return;
    }

    if (isConfigDirty && canUpdateTelegram) {
      const updated = await persistConfig(false);
      if (!updated) return;
    }

    if (isConfigDirty && !canUpdateTelegram) {
      toast.message("Testing with saved settings", {
        description:
          "Unsaved changes cannot be applied because your role cannot update Telegram settings.",
      });
    }

    try {
      setTesting(true);
      const response = await sendTelegramTestMessage(normalizedChatIds[0]);
      if (!isMountedRef.current) return;
      toast.success(`${response.message} to ${response.data.sent_to}`);
    } catch (error) {
      if (isMountedRef.current) {
        toast.error(getErrorMessage(error, "Failed to send test message"));
      }
    } finally {
      if (isMountedRef.current) setTesting(false);
    }
  };

  const notifyRows: Array<{
    key: NotifyField;
    title: string;
    description: string;
  }> = Object.keys(config.notify_on).map((key) => {
    const typedKey = key as NotifyField;
    const titles: Record<string, string> = {
      payment_paid: "Payment paid",
      payment_failed: "Payment failed",
      payment_verify_failed: "Verification failed",
      login_alert: "Login alert",
      promo_code_event: "Promo code",
      subscription_plan_event: "Subscription plan",
      app_user_event: "App user",
      system_user_event: "System user",
      bank_config_event: "Bank config",
      role_event: "Role",
      settings_event: "Settings",
    };

    return {
      key: typedKey,
      title: titles[key] ?? formatLabel(key),
      description: "Notification event",
    };
  });

  const notifyGroups = useMemo(() => {
    type NotifyGroupKey = "payments" | "users" | "system" | "other";
    const sections: Array<{
      key: NotifyGroupKey;
      title: string;
      rows: typeof notifyRows;
    }> = [
      { key: "payments", title: "Payments", rows: [] },
      { key: "users", title: "Users", rows: [] },
      { key: "system", title: "System", rows: [] },
      { key: "other", title: "Other", rows: [] },
    ];

    const byKey: Record<string, NotifyGroupKey> = {
      payment_paid: "payments",
      payment_failed: "payments",
      payment_verify_failed: "payments",
      promo_code_event: "payments",
      subscription_plan_event: "payments",
      login_alert: "users",
      app_user_event: "users",
      system_user_event: "users",
      bank_config_event: "system",
      role_event: "system",
      settings_event: "system",
    };

    for (const row of notifyRows) {
      const sectionKey = byKey[row.key] ?? "other";
      const section = sections.find((item) => item.key === sectionKey);
      if (section) section.rows.push(row);
    }

    return sections.filter((section) => section.rows.length > 0);
  }, [notifyRows]);

  const featureRows: Array<{
    key: FeatureField;
    title: string;
    description: string;
  }> = [
    {
      key: "mobile_otp",
      title: "Mobile OTP",
      description: "OTP delivery via Telegram",
    },
    {
      key: "payment_checkout",
      title: "Payment checkout",
      description: "Payment flow notifications",
    },
    {
      key: "admin_broadcast_notifications",
      title: "Admin broadcasts",
      description: "Broadcast to administrators",
    },
    {
      key: "telegram_alerts",
      title: "Telegram alerts",
      description: "Master toggle for all alerts",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-primary">
          Telegram
        </h2>

        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            leftIcon={<RefreshCw className="h-4 w-4" />}
            onClick={loadData}
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            leftIcon={<Send className="h-4 w-4" />}
            onClick={handleTest}
            isLoading={testing}
            disabled={loading || testing || configSaving || !canSendTest}
          >
            Test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          label="Service"
          value={config.is_enabled ? "Enabled" : "Disabled"}
          description="Integration status"
          icon={
            config.is_enabled ? (
              <Check className="h-5 w-5 text-emerald-500" />
            ) : (
              <ToggleLeft className="h-5 w-5 text-muted-foreground" />
            )
          }
          tone={config.is_enabled ? "success" : "warning"}
        />
        <StatusCard
          label="Chat IDs"
          value={String(config.chat_ids.length)}
          description="Destinations"
          icon={<Bell className="h-5 w-5 text-sky-500" />}
          tone="info"
        />
        <StatusCard
          label="Notifications"
          value={String(notifyEnabledCount)}
          description="Active triggers"
          icon={<Zap className="h-5 w-5 text-amber-500" />}
          tone="warning"
        />
        <StatusCard
          label="Updated"
          value={config.source || "-"}
          description={formatDateTime(config.updated_at)}
          icon={<Shield className="h-5 w-5 text-primary" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-card/30">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Bot Setup</CardTitle>
              </div>
              <Badge variant="outline" className="w-fit">
                {config.id
                  ? `Config ${config.id.slice(0, 8)}`
                  : "No config loaded"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {loading ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-border/70 bg-background/30 text-sm text-muted-foreground">
                Loading Telegram configuration...
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Current token
                    </p>
                    <p className="mt-2 font-mono text-sm text-foreground break-all">
                      {showToken
                        ? config.bot_token || "Not configured"
                        : maskToken(config.bot_token)}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowToken((current) => !current)}
                      className="mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      {showToken ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                      {showToken ? "Hide" : "Show"}
                    </button>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Current chat IDs
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {chatIds.length > 0 ? (
                        chatIds.map((chatId) => (
                          <Badge
                            key={chatId}
                            variant="outline"
                            className="font-mono"
                          >
                            {chatId}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          No chat IDs
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Updated by
                    </p>
                    <p className="mt-2 text-sm font-medium">
                      {config.updated_by || "-"}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {formatDateTime(config.updated_at)}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-border/60 bg-card/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-foreground">
                      Bot Token
                    </h4>
                    <Badge variant="outline" className="text-[11px]">
                      Optional
                    </Badge>
                  </div>
                  <Input
                    type={showToken ? "text" : "password"}
                    value={configTokenInput}
                    onChange={(event) =>
                      setConfigTokenInput(event.target.value)
                    }
                    placeholder="Bot token"
                    disabled={!canUpdateTelegram}
                  />
                </div>

                <div className="space-y-3 rounded-xl border border-border/60 bg-card/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-foreground">
                      Chat IDs
                    </h4>
                    <Badge variant="outline" className="text-[11px]">
                      {chatIds.length} target{chatIds.length === 1 ? "" : "s"}
                    </Badge>
                  </div>
                  <Textarea
                    value={config.chat_ids.join("\n")}
                    onChange={(event) =>
                      setConfig((current) => ({
                        ...current,
                        chat_ids: normalizeChatIds(event.target.value),
                      }))
                    }
                    placeholder="-1001234567890"
                    className="min-h-28 font-mono text-sm"
                    disabled={!canUpdateTelegram}
                  />
                  <div className="flex flex-wrap gap-2">
                    {chatIds.length === 0 ? (
                      <Badge variant="outline">No chat IDs set</Badge>
                    ) : (
                      chatIds.map((chatId) => (
                        <Badge
                          key={chatId}
                          variant="outline"
                          className="font-mono"
                        >
                          {chatId}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-3 rounded-xl border border-border/60 bg-card/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-foreground">
                      Event Routing
                    </h4>
                    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs">
                      <span className="text-muted-foreground">Active</span>
                      <Switch
                        checked={config.is_enabled}
                        onCheckedChange={(checked) =>
                          setConfig((current) => ({
                            ...current,
                            is_enabled: checked,
                          }))
                        }
                        disabled={!canUpdateTelegram}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {notifyGroups.map((group) => (
                      <div key={group.key} className="space-y-2">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                          {group.title}
                        </p>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                          {group.rows.map((row) => {
                            const enabled = config.notify_on[row.key];
                            return (
                              <motion.div
                                key={row.key}
                                whileHover={{ y: -2 }}
                                transition={{ duration: 0.18 }}
                                className="rounded-xl border border-border/60 bg-background/40 p-4"
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="space-y-1">
                                    <p className="font-medium text-foreground">
                                      {row.title}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {row.description}
                                    </p>
                                  </div>
                                  <Switch
                                    checked={enabled}
                                    onCheckedChange={() =>
                                      updateNotifyField(row.key)
                                    }
                                    disabled={
                                      !config.is_enabled || !canUpdateTelegram
                                    }
                                  />
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  {!config.is_enabled && (
                    <p className="text-xs text-muted-foreground">
                      Disabled — enable service to activate routing.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/20 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    Save configuration
                  </p>
                  <Button
                    variant="primary"
                    onClick={handleSaveConfig}
                    isLoading={configSaving}
                    disabled={
                      configSaving || !isConfigDirty || !canUpdateTelegram
                    }
                    leftIcon={<Check className="h-4 w-4" />}
                  >
                    Save
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/60 bg-card/30">
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-4">
              {featureRows.map((row) => {
                const enabled = features[row.key];
                return (
                  <div
                    key={row.key}
                    className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-background/40 p-4"
                  >
                    <div className="space-y-1">
                      <p className="font-medium text-foreground">{row.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {row.description}
                      </p>
                    </div>
                    <Switch
                      checked={enabled}
                      onCheckedChange={() => updateFeatureField(row.key)}
                      disabled={loading || featuresSaving || !canUpdateTelegram}
                    />
                  </div>
                );
              })}
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/20 px-4 py-3">
                <p className="text-sm font-medium text-foreground">
                  Save features
                </p>
                <Button
                  variant="outline"
                  onClick={handleSaveFeatures}
                  isLoading={featuresSaving}
                  disabled={
                    featuresSaving || !isFeaturesDirty || !canUpdateTelegram
                  }
                  leftIcon={<Check className="h-4 w-4" />}
                >
                  Save
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Active notifications
                </p>
                <p className="mt-2 text-sm text-foreground">
                  {notifyOnSummary(config.notify_on) || "None enabled"}
                </p>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Chat destinations
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {chatIds.length > 0 ? (
                    chatIds.map((chatId) => (
                      <Badge
                        key={chatId}
                        variant="outline"
                        className="font-mono"
                      >
                        {chatId}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      No destinations configured
                    </span>
                  )}
                </div>
              </div>
              <div className="rounded-xl border border-border/60 bg-background/40 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  Integration status
                </p>
                <div className="mt-2 flex items-center gap-2">
                  {config.is_enabled ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <ToggleRight className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="text-sm text-foreground">
                    {config.is_enabled ? "Ready for delivery" : "Disabled"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
