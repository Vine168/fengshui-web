export type AdminSettingsProfile = {
  id: string;
  email: string;
  role: string;
  name: string;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type AdminSettingsProfileResponse = {
  code: number;
  message: string;
  data: AdminSettingsProfile;
};

export type UpdateAdminSettingsProfileInput = {
  first_name: string;
  last_name: string;
  email?: string;
};

export type ChangeAdminSettingsPasswordInput = {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
};

export type AdminSettingsActionResponse = {
  code: number;
  message: string;
};

export type AdminBankConfig = {
  id: string;
  provider: string;
  merchant_id: string;
  merchant_name: string;
  merchant_city: string;
  account_id: string;
  acquiring_bank: string;
  default_currency: string;
  environment: string;
  api_key: string | null;
  api_url: string | null;
  webhook_url: string | null;
  store_label: string;
  terminal_label: string;
  mobile_number: string;
  category_code: string;
  qr_ttl_minutes: number;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
};

export type AdminBankConfigResponse = {
  code: number;
  message: string;
  data: AdminBankConfig;
};

export type UpdateAdminBankConfigInput = {
  account_id: string;
  merchant_name: string;
  merchant_city: string;
  merchant_id: string;
  acquiring_bank: string;
  default_currency: string;
  store_label: string;
  terminal_label: string;
  mobile_number: string;
  category_code: string;
  qr_ttl_minutes: number;
};