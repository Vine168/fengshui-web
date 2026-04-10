import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bell,
  Check,
  Copy,
  RefreshCw,
  Send,
  Shield,
  ToggleLeft,
  ToggleRight,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Input, Textarea } from "./ui/Form";
import { Switch } from "./ui/Switch";
import { HttpError } from "../../lib/http";
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
  const [loading, setLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [featuresSaving, setFeaturesSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [initialConfig, setInitialConfig] = useState(DEFAULT_CONFIG);
  const [configTokenInput, setConfigTokenInput] = useState("");
  const [features, setFeatures] = useState(DEFAULT_FEATURES);
  const [initialFeatures, setInitialFeatures] = useState(DEFAULT_FEATURES);

  const chatIds = useMemo(
    () => normalizeChatIds(config.chat_ids.join("\n")),
    [config.chat_ids],
  );

  const isConfigDirty = useMemo(() => {
    const normalizedToken = configTokenInput.trim();
    const tokenChanged = normalizedToken.length > 0;
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
      setConfigTokenInput("");
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

  const handleSaveConfig = async () => {
    const normalizedChatIds = normalizeChatIds(config.chat_ids.join("\n"));

    if (normalizedChatIds.length === 0) {
      toast.error("Please add at least one chat ID");
      return;
    }

    const payload: UpdateAdminTelegramConfigInput = {
      chat_ids: normalizedChatIds,
      is_enabled: config.is_enabled,
      notify_on: config.notify_on,
      ...(configTokenInput.trim()
        ? { bot_token: configTokenInput.trim() }
        : {}),
    };

    try {
      setConfigSaving(true);
      const updatedConfig = await saveTelegramConfig(payload);

      if (!isMountedRef.current) return;

      setConfig(updatedConfig);
      setInitialConfig(updatedConfig);
      setConfigTokenInput("");
      toast.success("Telegram configuration updated");
    } catch (error) {
      if (isMountedRef.current) {
        toast.error(
          getErrorMessage(error, "Failed to update Telegram configuration"),
        );
      }
    } finally {
      if (isMountedRef.current) setConfigSaving(false);
    }
  };

  const handleSaveFeatures = async () => {
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
    if (config.chat_ids.length === 0) {
      toast.error("Add at least one chat ID before sending a test message");
      return;
    }

    try {
      setTesting(true);
      const response = await sendTelegramTestMessage();
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
  }> = [
    {
      key: "payment_paid",
      title: "Payment paid",
      description: "Notify admins when a payment is confirmed.",
    },
    {
      key: "payment_failed",
      title: "Payment failed",
      description: "Alert the team when payment processing fails.",
    },
    {
      key: "payment_verify_failed",
      title: "Verification failed",
      description: "Notify on verification errors during payment review.",
    },
    {
      key: "login_alert",
      title: "Login alert",
      description: "Send an alert when an admin signs in.",
    },
  ];

  const featureRows: Array<{
    key: FeatureField;
    title: string;
    description: string;
  }> = [
    {
      key: "mobile_otp",
      title: "Mobile OTP",
      description: "Enable Telegram support for OTP delivery workflows.",
    },
    {
      key: "payment_checkout",
      title: "Payment checkout",
      description: "Use Telegram events around checkout and payment flows.",
    },
    {
      key: "admin_broadcast_notifications",
      title: "Admin broadcasts",
      description: "Enable broadcast notifications for administrators.",
    },
    {
      key: "telegram_alerts",
      title: "Telegram alerts",
      description: "Master flag for Telegram alert delivery.",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-primary">
              Telegram Configuration
            </h2>
          </div>
        </div>

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
            disabled={loading || testing}
          >
            Send Test Message
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          label="Service"
          value={config.is_enabled ? "Enabled" : "Disabled"}
          description="Main Telegram integration switch."
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
          description="Configured destinations for notifications."
          icon={<Bell className="h-5 w-5 text-sky-500" />}
          tone="info"
        />
        <StatusCard
          label="Alerts"
          value={String(notifyEnabledCount)}
          description="Active notification triggers."
          icon={<Zap className="h-5 w-5 text-amber-500" />}
          tone="warning"
        />
        <StatusCard
          label="Source"
          value={config.source || "-"}
          description={`Updated ${formatDateTime(config.updated_at)}`}
          icon={<Shield className="h-5 w-5 text-primary" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)]">
        <Card className="overflow-hidden">
          <CardHeader className="border-b border-border/60 bg-card/30">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Telegram Bot Setup</CardTitle>
                <CardDescription>
                  Edit the bot token, target chat IDs, and event routing for the
                  currently loaded configuration.
                </CardDescription>
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Current token
                    </p>
                    <p className="mt-2 font-mono text-sm text-foreground break-all">
                      {maskToken(config.bot_token)}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Leave the input below empty to keep the current token.
                    </p>
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
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        Bot Token
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Paste a new bot token only if you want to replace the
                        current one.
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[11px]">
                      Optional update
                    </Badge>
                  </div>
                  <Input
                    value={configTokenInput}
                    onChange={(event) =>
                      setConfigTokenInput(event.target.value)
                    }
                    placeholder="Enter a new bot token"
                  />
                </div>

                <div className="space-y-3 rounded-xl border border-border/60 bg-card/30 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        Chat IDs
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        One chat ID per line. Commas are also supported.
                      </p>
                    </div>
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
                    placeholder="-1003754307755"
                    className="min-h-28 font-mono text-sm"
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
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">
                        Routing
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Enable Telegram globally and choose which admin events
                        should notify.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs">
                      <span className="text-muted-foreground">Enabled</span>
                      <Switch
                        checked={config.is_enabled}
                        onCheckedChange={(checked) =>
                          setConfig((current) => ({
                            ...current,
                            is_enabled: checked,
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {notifyRows.map((row) => {
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
                              onCheckedChange={() => updateNotifyField(row.key)}
                              disabled={!config.is_enabled}
                            />
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                  {!config.is_enabled && (
                    <p className="text-xs text-muted-foreground">
                      Telegram is disabled, so routing toggles are visible but
                      inactive until you enable the service.
                    </p>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/20 px-4 py-3">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Save configuration
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Updates the Telegram bot token, chat IDs, enabled state,
                      and alert triggers.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    onClick={handleSaveConfig}
                    isLoading={configSaving}
                    disabled={configSaving || !isConfigDirty}
                    leftIcon={<Check className="h-4 w-4" />}
                  >
                    Save Telegram Config
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="overflow-hidden">
            <CardHeader className="border-b border-border/60 bg-card/30">
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Control which platform modules can use Telegram.
              </CardDescription>
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
                      disabled={loading || featuresSaving}
                    />
                  </div>
                );
              })}
              <div className="flex items-center justify-between gap-3 rounded-xl border border-border/60 bg-card/20 px-4 py-3">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">
                    Save feature flags
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Applies the current Telegram feature availability settings.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleSaveFeatures}
                  isLoading={featuresSaving}
                  disabled={featuresSaving || !isFeaturesDirty}
                  leftIcon={<Copy className="h-4 w-4" />}
                >
                  Save Flags
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Current Routing Summary</CardTitle>
              <CardDescription>
                Quick glance at the active Telegram notification setup.
              </CardDescription>
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
