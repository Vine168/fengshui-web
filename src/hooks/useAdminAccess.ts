import { useEffect, useMemo, useState } from 'react';
import { me, type MeAdmin } from '../api/auth.api';
import { getStoredPermissions, getStoredUser } from '../services/auth.service';

const FULL_ACCESS_ROLES = new Set(['admin', 'super_admin', 'super-admin', 'super admin']);
const FULL_ACCESS_PERMISSION = '*';
const ACCESS_UPDATED_EVENT = 'admin-access-updated';

function collectPermissionKeys(source: unknown): string[] {
  if (!source || typeof source !== 'object') {
    return [];
  }

  const record = source as Record<string, unknown>;
  const keys = new Set<string>();

  const addValue = (value: unknown) => {
    if (typeof value === 'string' && value.trim()) {
      keys.add(value.trim());
    }
    if (Array.isArray(value)) {
      value.forEach(addValue);
    }
    if (value && typeof value === 'object') {
      const nested = value as Record<string, unknown>;
      addValue(nested.key);
      addValue(nested.permission_key);
      addValue(nested.permission_keys);
      addValue(nested.permissions);
    }
  };

  addValue(record.permissions);
  addValue(record.permission_keys);
  addValue(record.permissionKeys);
  addValue(record.role);
  addValue(record.roles);

  return [...keys];
}

function getRoleName(source: unknown) {
  if (!source || typeof source !== 'object') {
    return '';
  }

  const record = source as Record<string, unknown>;
  const role = record.role;

  if (typeof role === 'string') {
    return role;
  }

  if (role && typeof role === 'object') {
    const roleRecord = role as Record<string, unknown>;
    return String(roleRecord.name || roleRecord.role_name || '');
  }

  return String(record.role_name || record.roleName || '');
}

export function useAdminAccess() {
  const [admin, setAdmin] = useState<unknown>(() => getStoredUser());
  const [permissions, setPermissions] = useState<string[]>([]);
  const [isLoadingAccess, setIsLoadingAccess] = useState(true);

  useEffect(() => {
    let active = true;

    const loadAccess = async () => {
      try {
        const response = await me();
        if (!active) {
          return;
        }

        setAdmin(response.data.admin);
        setPermissions(response.data.permissions || []);
      } catch {
        if (!active) {
          return;
        }

        const storedAdmin = getStoredUser();
        const storedPermissions = getStoredPermissions();
        setAdmin(storedAdmin);
        setPermissions([...new Set([...storedPermissions, ...collectPermissionKeys(storedAdmin)])]);
      } finally {
        if (active) {
          setIsLoadingAccess(false);
        }
      }
    };

    loadAccess();

    const handleAccessUpdate = () => {
      const storedAdmin = getStoredUser();
      const storedPermissions = getStoredPermissions();
      setAdmin(storedAdmin);
      setPermissions([...new Set([...storedPermissions, ...collectPermissionKeys(storedAdmin)])]);
      setIsLoadingAccess(false);
    };

    window.addEventListener(ACCESS_UPDATED_EVENT, handleAccessUpdate);
    window.addEventListener('storage', handleAccessUpdate);

    return () => {
      active = false;
      window.removeEventListener(ACCESS_UPDATED_EVENT, handleAccessUpdate);
      window.removeEventListener('storage', handleAccessUpdate);
    };
  }, []);

  const permissionKeys = useMemo(() => [...new Set([...permissions, ...collectPermissionKeys(admin)])], [admin, permissions]);
  const roleName = useMemo(() => getRoleName(admin), [admin]);

  const isSuperUser = permissionKeys.includes(FULL_ACCESS_PERMISSION) || FULL_ACCESS_ROLES.has(roleName.toLowerCase()) || FULL_ACCESS_ROLES.has(String((admin as MeAdmin | null)?.role || '').toLowerCase());

  const hasPermission = (permissionKey: string) => {
    if (!permissionKey) {
      return false;
    }

    if (isSuperUser || permissionKeys.includes(FULL_ACCESS_PERMISSION)) {
      return true;
    }

    return permissionKeys.includes(permissionKey);
  };

  const hasAnyPermission = (keys: string[]) => keys.some((key) => hasPermission(key));

  return {
    admin,
    roleName,
    permissionKeys,
    isSuperUser,
    isLoadingAccess,
    hasPermission,
    hasAnyPermission,
  };
}
