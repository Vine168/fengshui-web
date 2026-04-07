import {
  getAdminBankConfig,
  testAdminBankConfig,
  updateAdminBankConfig,
} from '../api/settingsBank.api';
import type { AdminBankConfig, UpdateAdminBankConfigInput } from '../types/settings';

export type SettingsBankConfig = {
  id: string;
  provider: string;
  merchantId: string;
  merchantName: string;
  merchantCity: string;
  accountId: string;
  acquiringBank: string;
  defaultCurrency: string;
  environment: string;
  apiKey: string;
  apiUrl: string;
  webhookUrl: string;
  storeLabel: string;
  terminalLabel: string;
  mobileNumber: string;
  categoryCode: string;
  qrTtlMinutes: number;
  createdAt: string;
  updatedAt: string;
};

function normalizeBankConfig(config: AdminBankConfig): SettingsBankConfig {
  return {
    id: config.id,
    provider: config.provider,
    merchantId: config.merchant_id || '',
    merchantName: config.merchant_name || '',
    merchantCity: config.merchant_city || '',
    accountId: config.account_id || '',
    acquiringBank: config.acquiring_bank || '',
    defaultCurrency: config.default_currency || 'usd',
    environment: config.environment || 'production',
    apiKey: config.api_key || '',
    apiUrl: config.api_url || '',
    webhookUrl: config.webhook_url || '',
    storeLabel: config.store_label || '',
    terminalLabel: config.terminal_label || '',
    mobileNumber: config.mobile_number || '',
    categoryCode: config.category_code || '',
    qrTtlMinutes: config.qr_ttl_minutes || 15,
    createdAt: config.created_at,
    updatedAt: config.updated_at,
  };
}

export async function loadSettingsBankConfig() {
  const response = await getAdminBankConfig();
  return normalizeBankConfig(response.data);
}

export async function saveSettingsBankConfig(payload: UpdateAdminBankConfigInput) {
  const response = await updateAdminBankConfig(payload);
  return normalizeBankConfig(response.data);
}

export async function testSettingsBankConnection() {
  return testAdminBankConfig();
}
