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