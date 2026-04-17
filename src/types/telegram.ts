export type TelegramNotifyOn = Record<string, boolean>;

export type AdminTelegramConfig = {
  id: string;
  bot_token: string;
  chat_ids: string[];
  is_enabled: boolean;
  notify_on: TelegramNotifyOn;
  source: string;
  updated_by: string | null;
  updated_at: string;
};

export type AdminTelegramConfigResponse = {
  code: number;
  message: string;
  data: AdminTelegramConfig;
};

export type UpdateAdminTelegramConfigInput = {
  bot_token?: string;
  chat_ids: string[];
  is_enabled: boolean;
  notify_on: TelegramNotifyOn;
};

export type AdminTelegramFeatures = {
  mobile_otp: boolean;
  payment_checkout: boolean;
  admin_broadcast_notifications: boolean;
  telegram_alerts: boolean;
};

export type AdminTelegramFeaturesResponse = {
  code: number;
  message: string;
  data: AdminTelegramFeatures;
};

export type UpdateAdminTelegramFeaturesInput = AdminTelegramFeatures;

export type TelegramTestMessageInput = {
  chat_id?: string;
};

export type AdminTelegramTestResponse = {
  code: number;
  message: string;
  data: {
    sent_to: string;
  };
};