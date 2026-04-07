import React, { useEffect, useRef, useState } from "react";
import { Building, Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/Card";
import { Badge } from "./ui/Badge";
import { Input } from "./ui/Form";
import { Button } from "./ui/Button";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { toast } from "sonner";
import {
  loadSettingsBankConfig,
  saveSettingsBankConfig,
  testSettingsBankConnection,
} from "../../services/settingsBank.service";

const DEFAULT_BANK_DATA = {
  id: "",
  provider: "bakong_khqr",
  merchantId: "",
  merchantName: "",
  merchantCity: "",
  accountId: "",
  acquiringBank: "",
  defaultCurrency: "usd",
  environment: "production",
  apiKey: "",
  apiUrl: "",
  webhookUrl: "",
  storeLabel: "",
  terminalLabel: "",
  mobileNumber: "",
  categoryCode: "",
  qrTtlMinutes: 15,
  createdAt: "",
  updatedAt: "",
};

type ConfirmAction = "save-bank-config";

export const SettingsBankConfig: React.FC = () => {
  const isMountedRef = useRef(true);
  const [confirmSubmitting, setConfirmSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    action: ConfirmAction | null;
  }>({
    open: false,
    title: "",
    description: "",
    confirmLabel: "Confirm",
    action: null,
  });

  const [bankData, setBankData] = useState({
    ...DEFAULT_BANK_DATA,
  });
  const [initialBankData, setInitialBankData] = useState({
    ...DEFAULT_BANK_DATA,
  });
  const [isBankConfigLoading, setIsBankConfigLoading] = useState(true);
  const [isBankLoading, setIsBankLoading] = useState(false);
  const [isBankEditing, setIsBankEditing] = useState(false);

  useEffect(() => {
    isMountedRef.current = true;

    const loadBankConfig = async () => {
      try {
        setIsBankConfigLoading(true);
        const config = await loadSettingsBankConfig();
        if (!isMountedRef.current) {
          return;
        }

        setBankData(config);
        setInitialBankData(config);
      } catch {
        if (isMountedRef.current) {
          toast.error("Failed to load bank configuration");
        }
      } finally {
        if (isMountedRef.current) {
          setIsBankConfigLoading(false);
        }
      }
    };

    loadBankConfig();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const executeSaveBankConfig = async () => {
    if (
      !bankData.accountId.trim() ||
      !bankData.merchantName.trim() ||
      !bankData.merchantCity.trim()
    ) {
      toast.error("Please fill in all required bank configuration fields");
      return;
    }

    try {
      setIsBankLoading(true);
      const updatedConfig = await saveSettingsBankConfig({
        account_id: bankData.accountId.trim(),
        merchant_name: bankData.merchantName.trim(),
        merchant_city: bankData.merchantCity.trim(),
        merchant_id: bankData.merchantId,
        acquiring_bank: bankData.acquiringBank,
        default_currency: bankData.defaultCurrency,
        store_label: bankData.storeLabel,
        terminal_label: bankData.terminalLabel,
        mobile_number: bankData.mobileNumber,
        category_code: bankData.categoryCode,
        qr_ttl_minutes: bankData.qrTtlMinutes,
      });

      if (!isMountedRef.current) {
        return;
      }

      setBankData(updatedConfig);
      setInitialBankData(updatedConfig);
      setIsBankEditing(false);
      toast.success("Bank configuration saved successfully");
    } catch {
      if (isMountedRef.current) {
        toast.error("Failed to save bank configuration");
      }
    } finally {
      if (isMountedRef.current) {
        setIsBankLoading(false);
      }
    }
  };

  const handleSaveBankConfig = () => {
    if (
      !bankData.accountId.trim() ||
      !bankData.merchantName.trim() ||
      !bankData.merchantCity.trim()
    ) {
      toast.error("Please fill in all required bank configuration fields");
      return;
    }

    setConfirmDialog({
      open: true,
      title: "Confirm Bank Configuration",
      description:
        "Are you sure you want to save the following bank configuration?",
      confirmLabel: "Save Configuration",
      action: "save-bank-config",
    });
  };

  const handleTestBankConnection = () => {
    toast.promise(testSettingsBankConnection(), {
      loading: "Testing connection to Bakong...",
      success: "Connection successful!",
      error: "Connection failed",
    });
  };

  const handleConfirmDialogAction = async () => {
    if (!confirmDialog.action) {
      return;
    }

    setConfirmSubmitting(true);
    try {
      if (confirmDialog.action === "save-bank-config") {
        await executeSaveBankConfig();
      }
    } finally {
      if (isMountedRef.current) {
        setConfirmSubmitting(false);
      }
      setConfirmDialog((current) => ({
        ...current,
        open: false,
        action: null,
      }));
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Bakong Payment Gateway
                  <Badge
                    variant="outline"
                    className="bg-red-500/10 text-red-500 border-red-500/20"
                  >
                    KHQR Supported
                  </Badge>
                </CardTitle>
              </div>
              <img
                src="https://bakong.nbc.org.kh/images/logo.svg"
                alt="Bakong"
                className="h-8 opacity-80"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-4">
                <div className="p-2 rounded-full bg-emerald-500/20 text-emerald-500">
                  <Check className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-medium text-emerald-500">
                    Service Active
                  </h4>
                  <p className="text-sm text-emerald-500/80">
                    Connected to Bakong{" "}
                    {bankData.environment === "production"
                      ? "Production"
                      : "Sandbox"}{" "}
                    Environment
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-background/50 border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                  onClick={handleTestBankConnection}
                >
                  Test Connection
                </Button>
                <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
                  Connected
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-normal text-muted-foreground uppercase tracking-wider">
                  Merchant Details
                </h4>

                <div className="space-y-2">
                  <label className="text-sm font-normal">Account ID</label>
                  <Input
                    placeholder="Enter Account ID"
                    value={bankData.accountId}
                    onChange={(e) =>
                      setBankData({
                        ...bankData,
                        accountId: e.target.value,
                      })
                    }
                    disabled={
                      isBankConfigLoading || isBankLoading || !isBankEditing
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-normal">Merchant Name</label>
                  <Input
                    placeholder="Enter Merchant Name"
                    value={bankData.merchantName}
                    onChange={(e) =>
                      setBankData({
                        ...bankData,
                        merchantName: e.target.value,
                      })
                    }
                    disabled={
                      isBankConfigLoading || isBankLoading || !isBankEditing
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-normal">Merchant City</label>
                  <Input
                    placeholder="Enter Merchant City"
                    value={bankData.merchantCity}
                    onChange={(e) =>
                      setBankData({
                        ...bankData,
                        merchantCity: e.target.value,
                      })
                    }
                    disabled={
                      isBankConfigLoading || isBankLoading || !isBankEditing
                    }
                  />
                </div>
              </div>

              <div className="space-y-4"></div>
            </div>

            <div className="pt-4 flex justify-end gap-3 border-t border-white/10">
              {!isBankEditing ? (
                <Button
                  variant="primary"
                  disabled={isBankConfigLoading || isBankLoading}
                  onClick={() => setIsBankEditing(true)}
                >
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    disabled={isBankConfigLoading || isBankLoading}
                    onClick={() => {
                      setBankData(initialBankData);
                      setIsBankEditing(false);
                      toast.info("Changes discarded");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={handleSaveBankConfig}
                    isLoading={isBankLoading}
                    disabled={isBankConfigLoading}
                  >
                    Save Configuration
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        title={confirmDialog.title}
        description={confirmDialog.description}
        confirmLabel={confirmDialog.confirmLabel}
        isLoading={confirmSubmitting}
        onConfirm={handleConfirmDialogAction}
        onOpenChange={(open: boolean) => {
          if (!open) {
            setConfirmDialog((current) => ({
              ...current,
              open: false,
              action: null,
            }));
          }
        }}
      />
    </>
  );
};
