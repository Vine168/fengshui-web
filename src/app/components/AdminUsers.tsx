import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion as Motion, AnimatePresence } from "motion/react";
import {
  ArrowLeftRight,
  BadgePlus,
  CheckCircle2,
  Edit,
  KeyRound,
  Lock,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Trash2,
  UserCog,
  Users,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { Button } from "./ui/Button";
import { Badge } from "./ui/Badge";
import { Input, Select, Textarea } from "./ui/Form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "./ui/Dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import { TooltipProvider } from "./ui/tooltip";
import { ActionTooltip } from "./ui/ActionTooltip";
import { Pagination } from "./ui/Pagination";
import { cn } from "./ui/utils";
import { HttpError } from "../../lib/http";
import { useAdminAccess } from "../../hooks/useAdminAccess";
import {
  addAdminUser,
  changeAdminStatus,
  editAdminUser,
  listAdminUsers,
  removeAdminUser,
  resetAdminPassword,
  setAdminRole,
  type AdminUserRow,
} from "../../services/adminUsers.service";
import {
  addRole,
  editRole,
  listRolePermissions,
  listRoles,
  removeRole,
  type RoleRow,
} from "../../services/roles.service";

type TabKey = "admins" | "roles";

type AdminFormState = {
  name: string;
  email: string;
  password: string;
  roleId: string;
  status: "active" | "inactive" | "suspended";
};

type RoleFormState = {
  name: string;
  description: string;
  permissionKeys: string[];
};

type PermissionGroup = {
  label: string;
  permissions: Array<{
    key: string;
    name: string;
    description: string;
    group: string;
  }>;
};

const ADMIN_PAGE_SIZE = 10;
const ROLE_PAGE_SIZE = 10;
const ADMIN_STATUS_OPTIONS: Array<"active" | "inactive" | "suspended"> = [
  "active",
  "inactive",
  "suspended",
];

const DEFAULT_ADMIN_FORM: AdminFormState = {
  name: "",
  email: "",
  password: "",
  roleId: "",
  status: "active",
};

const DEFAULT_ROLE_FORM: RoleFormState = {
  name: "",
  description: "",
  permissionKeys: [],
};

function titleCase(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const normalized = value.trim();
  if (!normalized) {
    return "";
  }

  return normalized
    .split(/[_\s.-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function groupPermissions(
  permissions: Array<{
    key: string;
    name: string;
    description: string;
    group: string;
  }>,
) {
  const groups = new Map<string, PermissionGroup>();

  for (const permission of permissions) {
    const groupKey = permission.group || "general";
    const existing = groups.get(groupKey) || {
      label: titleCase(groupKey),
      permissions: [],
    };
    existing.permissions.push(permission);
    groups.set(groupKey, existing);
  }

  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, group]) => ({
      ...group,
      permissions: group.permissions.sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    }));
}

function formatRoleBadge(role: RoleRow) {
  return role.isSystem ? "System" : "Custom";
}

function getHttpErrorMessage(error: unknown, fallback: string) {
  if (error instanceof HttpError) {
    const backendMessage =
      typeof error.details === "object" &&
      error.details !== null &&
      "message" in (error.details as Record<string, unknown>)
        ? String((error.details as Record<string, unknown>).message)
        : undefined;

    return backendMessage || error.message || fallback;
  }

  return fallback;
}

function AdminUserFormDialog({
  open,
  onOpenChange,
  mode,
  initialValue,
  roleOptions,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialValue: AdminFormState;
  roleOptions: Array<{ id: string; name: string }>;
  onSubmit: (value: AdminFormState) => Promise<void>;
}) {
  const [form, setForm] = useState<AdminFormState>(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(initialValue);
    }
  }, [initialValue, open]);

  const handleSubmit = async () => {
    if (
      !form.name.trim() ||
      !form.email.trim() ||
      (mode === "create" && !form.password.trim()) ||
      !form.roleId
    ) {
      toast.error("Please complete all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getHttpErrorMessage(
          error,
          mode === "create"
            ? "Failed to create admin user"
            : "Failed to update admin user",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl bg-card/95 backdrop-blur-2xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-primary" />
            {mode === "create" ? "Create Admin User" : "Edit Admin User"}
          </DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Create the admin account first, then attach a role so permissions come from the role."
              : "Update the admin profile and move the user to a different role if needed."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground/80">
              Full Name
            </label>
            <Input
              value={form.name}
              onChange={(event) =>
                setForm((current) => ({ ...current, name: event.target.value }))
              }
              placeholder="e.g. Sokha Piseth"
            />
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground/80">
              Email
            </label>
            <Input
              type="email"
              value={form.email}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              placeholder="admin@example.com"
            />
          </div>

          {mode === "create" && (
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground/80">
                Temporary Password
              </label>
              <Input
                type="password"
                value={form.password}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    password: event.target.value,
                  }))
                }
                placeholder="Temporary password"
              />
            </div>
          )}

          {mode === "edit" && (
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground/80">
                Status
              </label>
              <Select
                value={form.status}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    status: event.target.value as AdminFormState["status"],
                  }))
                }
              >
                {ADMIN_STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {titleCase(status)}
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <label className="text-sm font-medium text-foreground/80">
              Role
            </label>
            <Select
              value={form.roleId}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  roleId: event.target.value,
                }))
              }
            >
              <option key="role-placeholder" value="">
                Select a role
              </option>
              {roleOptions.map((role, index) => (
                <option key={`${role.id || "role"}-${index}`} value={role.id}>
                  {role.name}
                </option>
              ))}
            </Select>
            <p className="text-xs text-muted-foreground">
              Permissions are inherited from the selected role.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <DialogClose asChild>
            <Button variant="ghost" className="hover:bg-white/5">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Create Admin"
                : "Save Changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}

function ResetPasswordDialog({
  open,
  onOpenChange,
  admin,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: AdminUserRow | null;
  onSubmit: (password: string) => Promise<void>;
}) {
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setPassword("");
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!password.trim()) {
      toast.error("Enter a new password");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(password);
      onOpenChange(false);
    } catch (error) {
      toast.error(getHttpErrorMessage(error, "Failed to reset password"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-card/95 backdrop-blur-2xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Lock className="w-6 h-6 text-primary" />
            Reset Password
          </DialogTitle>
          <DialogDescription>
            {admin
              ? `Set a new password for ${admin.name}.`
              : "Set a new password for this admin user."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 py-4">
          <label className="text-sm font-medium text-foreground/80">
            New Password
          </label>
          <Input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter new password"
          />
        </div>

        <DialogFooter className="gap-3">
          <DialogClose asChild>
            <Button variant="ghost" className="hover:bg-white/5">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Resetting..." : "Reset Password"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}

function RoleFormDialog({
  open,
  onOpenChange,
  mode,
  initialValue,
  permissions,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialValue: RoleFormState;
  permissions: Array<{
    key: string;
    name: string;
    description: string;
    group: string;
  }>;
  onSubmit: (value: RoleFormState) => Promise<void>;
}) {
  const [form, setForm] = useState<RoleFormState>(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const groupedPermissions = useMemo(
    () => groupPermissions(permissions),
    [permissions],
  );

  useEffect(() => {
    if (open) {
      setForm(initialValue);
    }
  }, [initialValue, open]);

  const togglePermission = (key: string) => {
    setForm((current) => ({
      ...current,
      permissionKeys: current.permissionKeys.includes(key)
        ? current.permissionKeys.filter(
            (permissionKey) => permissionKey !== key,
          )
        : [...current.permissionKeys, key],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      toast.error("Role name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(
        getHttpErrorMessage(
          error,
          mode === "create" ? "Failed to create role" : "Failed to update role",
        ),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden bg-card/95 backdrop-blur-2xl border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            {mode === "create" ? "Create Role" : "Edit Role"}
          </DialogTitle>
          <DialogDescription>
            Pick the permissions this role should carry. System roles remain
            read-only.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 overflow-y-auto max-h-[65vh] py-2 pr-1">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground/80">
                Role Name
              </label>
              <Input
                value={form.name}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="e.g. Content Editor"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium text-foreground/80">
                Description
              </label>
              <Textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="Short role description"
                className="min-h-24"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  Permission Checklist
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Selected keys are saved in permission_keys.
                </p>
              </div>
              <Badge
                variant="outline"
                className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest"
              >
                {form.permissionKeys.length} selected
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {groupedPermissions.map((group) => (
                <div
                  key={group.label}
                  className="rounded-2xl border border-white/10 bg-card/50 p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground capitalize">
                        {group.label}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {group.permissions.length} permissions
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 text-xs"
                      onClick={() => {
                        const keys = group.permissions.map(
                          (permission) => permission.key,
                        );
                        setForm((current) => ({
                          ...current,
                          permissionKeys: current.permissionKeys.includes(
                            keys[0],
                          )
                            ? current.permissionKeys.filter(
                                (key) => !keys.includes(key),
                              )
                            : [
                                ...new Set([
                                  ...current.permissionKeys,
                                  ...keys,
                                ]),
                              ],
                        }));
                      }}
                    >
                      Toggle Group
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {group.permissions.map((permission) => (
                      <label
                        key={permission.key}
                        className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/5 bg-black/10 p-3 transition-colors hover:bg-black/20"
                      >
                        <Checkbox
                          checked={form.permissionKeys.includes(permission.key)}
                          onCheckedChange={() =>
                            togglePermission(permission.key)
                          }
                          className="mt-0.5"
                        />
                        <span className="space-y-1">
                          <span className="block text-sm font-medium text-foreground">
                            {permission.name}
                          </span>
                          <span className="block text-xs text-muted-foreground">
                            {permission.description || permission.key}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <DialogClose asChild>
            <Button variant="ghost" className="hover:bg-white/5">
              Cancel
            </Button>
          </DialogClose>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Saving..."
              : mode === "create"
                ? "Create Role"
                : "Save Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </DialogRoot>
  );
}

export const AdminUsers: React.FC<{ initialTab?: TabKey }> = ({
  initialTab = "admins",
}) => {
  const { hasPermission, isSuperUser } = useAdminAccess();
  const canManageRoles = hasPermission("roles.manage");
  const canCreateAdmins = hasPermission("admin_users.create");
  const canUpdateAdmins = hasPermission("admin_users.update");
  const canDeleteAdmins = hasPermission("admin_users.delete");
  const canResetPasswords =
    hasPermission("admin_users.reset_password") || isSuperUser;

  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const [admins, setAdmins] = useState<AdminUserRow[]>([]);
  const [adminPagination, setAdminPagination] = useState({
    page: 1,
    limit: ADMIN_PAGE_SIZE,
    total: 0,
    total_pages: 1,
  });
  const [adminLoading, setAdminLoading] = useState(true);
  const [adminSearch, setAdminSearch] = useState("");
  const [adminStatusFilter, setAdminStatusFilter] = useState<
    "" | "active" | "inactive" | "suspended"
  >("");
  const [adminRoleFilter, setAdminRoleFilter] = useState("");
  const [adminPage, setAdminPage] = useState(1);

  const [roles, setRoles] = useState<RoleRow[]>([]);
  const [rolePagination, setRolePagination] = useState({
    page: 1,
    limit: ROLE_PAGE_SIZE,
    total: 0,
    total_pages: 1,
  });
  const [roleLoading, setRoleLoading] = useState(true);
  const [roleSearch, setRoleSearch] = useState("");
  const [rolePage, setRolePage] = useState(1);

  const [permissions, setPermissions] = useState<
    Array<{ key: string; name: string; description: string; group: string }>
  >([]);

  const [isAdminFormOpen, setIsAdminFormOpen] = useState(false);
  const [isRoleFormOpen, setIsRoleFormOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [adminDeleteTarget, setAdminDeleteTarget] =
    useState<AdminUserRow | null>(null);
  const [roleDeleteTarget, setRoleDeleteTarget] = useState<RoleRow | null>(
    null,
  );
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUserRow | null>(null);
  const [selectedRole, setSelectedRole] = useState<RoleRow | null>(null);

  const [adminFormMode, setAdminFormMode] = useState<"create" | "edit">(
    "create",
  );
  const [adminFormInitial, setAdminFormInitial] =
    useState<AdminFormState>(DEFAULT_ADMIN_FORM);
  const [roleFormMode, setRoleFormMode] = useState<"create" | "edit">("create");
  const [roleFormInitial, setRoleFormInitial] =
    useState<RoleFormState>(DEFAULT_ROLE_FORM);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadAdmins = async (page = adminPage) => {
    try {
      setAdminLoading(true);
      const response = await listAdminUsers({
        page,
        limit: ADMIN_PAGE_SIZE,
        search: adminSearch || undefined,
        status: adminStatusFilter || undefined,
        role_id: adminRoleFilter || undefined,
      });

      if (!mountedRef.current) {
        return;
      }

      setAdmins(response.admins);
      setAdminPagination(response.pagination);
    } catch (error) {
      if (mountedRef.current) {
        toast.error(getHttpErrorMessage(error, "Failed to load admin users"));
      }
    } finally {
      if (mountedRef.current) {
        setAdminLoading(false);
      }
    }
  };

  const loadRoles = async (page = rolePage) => {
    try {
      setRoleLoading(true);
      const [roleResponse, permissionList] = await Promise.all([
        listRoles({
          page,
          limit: ROLE_PAGE_SIZE,
          search: roleSearch || undefined,
        }),
        listRolePermissions(),
      ]);

      if (!mountedRef.current) {
        return;
      }

      setRoles(roleResponse.roles);
      setRolePagination(roleResponse.pagination);
      setPermissions(permissionList);
    } catch (error) {
      if (mountedRef.current) {
        toast.error(getHttpErrorMessage(error, "Failed to load roles"));
      }
    } finally {
      if (mountedRef.current) {
        setRoleLoading(false);
      }
    }
  };

  useEffect(() => {
    loadAdmins(1);
    loadRoles(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "admins") {
      loadAdmins(adminPage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminPage, adminSearch, adminStatusFilter, adminRoleFilter, activeTab]);

  useEffect(() => {
    if (activeTab === "roles") {
      loadRoles(rolePage);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rolePage, roleSearch, activeTab]);

  useEffect(() => {
    if (activeTab === "roles" && !canManageRoles) {
      setActiveTab("admins");
    }
  }, [activeTab, canManageRoles]);

  const roleOptions = useMemo(
    () => roles.map((role) => ({ id: role.id, name: role.name })),
    [roles],
  );
  const groupedPermissions = useMemo(
    () => groupPermissions(permissions),
    [permissions],
  );

  const openCreateAdmin = () => {
    setAdminFormMode("create");
    setAdminFormInitial({
      ...DEFAULT_ADMIN_FORM,
      roleId: roleOptions[0]?.id || "",
    });
    setSelectedAdmin(null);
    setIsAdminFormOpen(true);
  };

  const openEditAdmin = (admin: AdminUserRow) => {
    setAdminFormMode("edit");
    setAdminFormInitial({
      name: admin.name,
      email: admin.email,
      password: "",
      roleId: admin.roleId,
      status: admin.status,
    });
    setSelectedAdmin(admin);
    setIsAdminFormOpen(true);
  };

  const openCreateRole = () => {
    setRoleFormMode("create");
    setRoleFormInitial(DEFAULT_ROLE_FORM);
    setSelectedRole(null);
    setIsRoleFormOpen(true);
  };

  const openEditRole = (role: RoleRow) => {
    setRoleFormMode("edit");
    setRoleFormInitial({
      name: role.name,
      description: role.description,
      permissionKeys: role.permissionKeys,
    });
    setSelectedRole(role);
    setIsRoleFormOpen(true);
  };

  const handleAdminFormSubmit = async (value: AdminFormState) => {
    if (adminFormMode === "create") {
      await addAdminUser({
        name: value.name,
        email: value.email,
        password: value.password,
        role_id: value.roleId || undefined,
        status: value.status,
      });
      toast.success("Admin user created");
    } else if (selectedAdmin) {
      await editAdminUser(selectedAdmin.id, {
        name: value.name,
        email: value.email,
        status: value.status,
      });

      if (value.roleId && value.roleId !== selectedAdmin.roleId) {
        await setAdminRole(selectedAdmin.id, { role_id: value.roleId });
      }

      toast.success("Admin user updated");
    }

    await loadAdmins(adminPagination.page);
  };

  const handleResetPassword = async (password: string) => {
    if (!selectedAdmin) {
      return;
    }

    await resetAdminPassword(selectedAdmin.id, { password });
    toast.success("Password reset");
  };

  const handleAdminStatusToggle = async (admin: AdminUserRow) => {
    const nextStatus = admin.status === "active" ? "inactive" : "active";
    await changeAdminStatus(admin.id, nextStatus);
    toast.success(`Admin marked as ${nextStatus}`);
    await loadAdmins(adminPagination.page);
  };

  const handleDeleteAdmin = async (admin: AdminUserRow) => {
    await removeAdminUser(admin.id);
    toast.success("Admin user deleted");
    await loadAdmins(adminPagination.page);
  };

  const handleRoleFormSubmit = async (value: RoleFormState) => {
    if (roleFormMode === "create") {
      await addRole({
        name: value.name,
        description: value.description,
        permission_keys: value.permissionKeys,
      });
      toast.success("Role created");
    } else if (selectedRole) {
      await editRole(selectedRole.id, {
        name: value.name,
        description: value.description,
        permission_keys: value.permissionKeys,
      });
      toast.success("Role updated");
    }

    await loadRoles(rolePagination.page);
  };

  const handleDeleteRole = async (role: RoleRow) => {
    if (role.isSystem) {
      toast.error("System roles cannot be deleted");
      return;
    }

    await removeRole(role.id);
    toast.success("Role deleted");
    await loadRoles(rolePagination.page);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-primary">
            <Users className="h-3.5 w-3.5" />
            Access Control
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground/90">
            Admin User Management
          </h2>
          <p className="text-muted-foreground">
            Manage admin accounts, assign roles, and control permission-driven
            access from one place.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {canCreateAdmins && (
            <Button
              variant="primary"
              onClick={openCreateAdmin}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Admin
            </Button>
          )}
          {canManageRoles && (
            <Button
              variant="outline"
              onClick={openCreateRole}
              leftIcon={<BadgePlus className="w-4 h-4" />}
            >
              Create Role
            </Button>
          )}
          <Button
            variant="ghost"
            onClick={() => {
              loadAdmins(adminPagination.page);
              loadRoles(rolePagination.page);
            }}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as TabKey)}
        className="space-y-6"
      >
        <TabsList className="w-full justify-start rounded-2xl bg-black/10 p-1">
          <TabsTrigger value="admins" className="flex-none px-4">
            Admin Users
          </TabsTrigger>
          {canManageRoles && (
            <TabsTrigger value="roles" className="flex-none px-4">
              Roles
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="admins" className="space-y-6">
          <Card className="relative overflow-hidden border-white/10 bg-card/40 backdrop-blur-xl shadow-2xl">
            <div className="absolute top-0 right-0 -mr-24 -mt-24 h-80 w-80 rounded-full bg-primary/10 blur-[100px] opacity-50" />
            <CardHeader className="relative z-10">
              <CardTitle>Admin Users</CardTitle>
              <CardDescription>
                Search, filter, create, and manage admin accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="relative z-10 space-y-4">
              <div className="grid gap-3 lg:grid-cols-4">
                <div className="relative lg:col-span-2">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={adminSearch}
                    onChange={(event) => {
                      setAdminSearch(event.target.value);
                      setAdminPage(1);
                    }}
                    placeholder="Search admins by name or email"
                    className="pl-10"
                  />
                </div>

                <Select
                  value={adminStatusFilter}
                  onChange={(event) => {
                    setAdminStatusFilter(
                      event.target.value as
                        | ""
                        | "active"
                        | "inactive"
                        | "suspended",
                    );
                    setAdminPage(1);
                  }}
                >
                  <option key="" value="">
                    All statuses
                  </option>
                  {ADMIN_STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {titleCase(status)}
                    </option>
                  ))}
                </Select>

                <Select
                  value={adminRoleFilter}
                  onChange={(event) => {
                    setAdminRoleFilter(event.target.value);
                    setAdminPage(1);
                  }}
                >
                  <option key="all-roles" value="">
                    All roles
                  </option>
                  {roles.map((role, index) => (
                    <option
                      key={`${role.id || "role"}-${index}`}
                      value={role.id}
                    >
                      {role.name}
                    </option>
                  ))}
                </Select>
              </div>

              <div className="overflow-hidden rounded-2xl border border-white/10">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b border-white/5 bg-black/20 hover:bg-black/20">
                      <TableHead className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">
                        Admin
                      </TableHead>
                      <TableHead className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">
                        Role
                      </TableHead>
                      <TableHead className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">
                        Status
                      </TableHead>
                      <TableHead className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">
                        Last Active
                      </TableHead>
                      <TableHead className="py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-primary/50 pr-8">
                        Actions
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence mode="popLayout">
                      {adminLoading ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-10 text-center text-muted-foreground"
                          >
                            Loading admin users...
                          </TableCell>
                        </TableRow>
                      ) : admins.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="py-10 text-center text-muted-foreground"
                          >
                            No admin users found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        admins.map((admin, index) => (
                          <Motion.tr
                            key={`${admin.id || admin.email || "admin"}-${index}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="group/row border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                          >
                            <TableCell className="py-5">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-gradient-to-br from-primary/20 to-primary/5">
                                  <UserCog className="h-5 w-5 text-primary/80" />
                                </div>
                                <div>
                                  <div className="font-semibold text-foreground/90">
                                    {admin.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {admin.email}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {admin.isSystemRole ? (
                                  <ShieldCheck className="h-4 w-4 text-primary" />
                                ) : (
                                  <Shield className="h-4 w-4 text-muted-foreground" />
                                )}
                                <span className="text-sm font-medium">
                                  {admin.roleName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest",
                                  admin.status === "active"
                                    ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                                    : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
                                )}
                              >
                                {titleCase(admin.status)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground tabular-nums">
                              {admin.lastActive}
                            </TableCell>
                            <TableCell className="pr-8 text-right">
                              <TooltipProvider delayDuration={120}>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <ActionTooltip label="Admin actions">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-lg hover:bg-white/10"
                                      >
                                        <MoreVertical className="h-4 w-4" />
                                      </Button>
                                    </ActionTooltip>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-56 bg-secondary/95 backdrop-blur-2xl border-white/10 shadow-2xl"
                                  >
                                    <DropdownMenuLabel className="px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                      Account Actions
                                    </DropdownMenuLabel>
                                    {canUpdateAdmins && (
                                      <React.Fragment key="edit">
                                        <DropdownMenuItem
                                          onClick={() => openEditAdmin(admin)}
                                          className="gap-2 py-2 focus:bg-primary/10 focus:text-primary"
                                        >
                                          <Edit className="h-4 w-4" /> Edit
                                          Admin
                                        </DropdownMenuItem>
                                      </React.Fragment>
                                    )}
                                    {canUpdateAdmins && (
                                      <React.Fragment key="assign-role">
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedAdmin(admin);
                                            setAdminFormMode("edit");
                                            setAdminFormInitial({
                                              name: admin.name,
                                              email: admin.email,
                                              password: "",
                                              roleId: admin.roleId,
                                              status: admin.status,
                                            });
                                            setIsAdminFormOpen(true);
                                          }}
                                          className="gap-2 py-2 focus:bg-primary/10 focus:text-primary"
                                        >
                                          <ArrowLeftRight className="h-4 w-4" />{" "}
                                          Assign Role
                                        </DropdownMenuItem>
                                      </React.Fragment>
                                    )}
                                    {canResetPasswords && (
                                      <React.Fragment key="reset-password">
                                        <DropdownMenuItem
                                          onClick={() => {
                                            setSelectedAdmin(admin);
                                            setIsResetPasswordOpen(true);
                                          }}
                                          className="gap-2 py-2 focus:bg-primary/10 focus:text-primary"
                                        >
                                          <KeyRound className="h-4 w-4" /> Reset
                                          Password
                                        </DropdownMenuItem>
                                      </React.Fragment>
                                    )}
                                    {canUpdateAdmins && (
                                      <React.Fragment key="toggle-status">
                                        <DropdownMenuItem
                                          onClick={() =>
                                            handleAdminStatusToggle(admin)
                                          }
                                          className="gap-2 py-2 focus:bg-primary/10 focus:text-primary"
                                        >
                                          {admin.status === "active" ? (
                                            <XCircle className="h-4 w-4" />
                                          ) : (
                                            <CheckCircle2 className="h-4 w-4" />
                                          )}
                                          {admin.status === "active"
                                            ? "Deactivate"
                                            : "Activate"}
                                        </DropdownMenuItem>
                                      </React.Fragment>
                                    )}
                                    {canDeleteAdmins && !admin.isSystemRole && (
                                      <React.Fragment key="delete">
                                        <DropdownMenuSeparator className="bg-white/5" />
                                        <DropdownMenuItem
                                          onClick={() =>
                                            setAdminDeleteTarget(admin)
                                          }
                                          className="gap-2 py-2 text-rose-400 focus:bg-rose-500/10 focus:text-rose-400"
                                        >
                                          <Trash2 className="h-4 w-4" /> Delete
                                          Admin
                                        </DropdownMenuItem>
                                      </React.Fragment>
                                    )}
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TooltipProvider>
                            </TableCell>
                          </Motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </div>

              {adminPagination.total_pages > 1 && (
                <Pagination
                  currentPage={adminPagination.page}
                  totalPages={adminPagination.total_pages}
                  onPageChange={setAdminPage}
                  totalItems={adminPagination.total}
                  itemsPerPage={adminPagination.limit}
                  itemName="admins"
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {canManageRoles && (
          <TabsContent value="roles" className="space-y-6">
            <Card className="relative overflow-hidden border-white/10 bg-card/40 backdrop-blur-xl shadow-2xl">
              <div className="absolute top-0 right-0 -mr-24 -mt-24 h-80 w-80 rounded-full bg-primary/10 blur-[100px] opacity-50" />
              <CardHeader className="relative z-10">
                <CardTitle>Role Management</CardTitle>
                <CardDescription>
                  Create and maintain roles using backend permissions from the
                  permission list endpoint.
                </CardDescription>
              </CardHeader>
              <CardContent className="relative z-10 space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      value={roleSearch}
                      onChange={(event) => {
                        setRoleSearch(event.target.value);
                        setRolePage(1);
                      }}
                      placeholder="Search roles by name or description"
                      className="pl-10"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-3">
                    <Badge
                      variant="outline"
                      className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-widest"
                    >
                      {groupedPermissions.length} permission groups
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
                  <div className="overflow-hidden rounded-2xl border border-white/10">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b border-white/5 bg-black/20 hover:bg-black/20">
                          <TableHead className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">
                            Role
                          </TableHead>
                          <TableHead className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">
                            Permissions
                          </TableHead>
                          <TableHead className="py-4 text-[10px] font-black uppercase tracking-[0.2em] text-primary/50">
                            Type
                          </TableHead>
                          <TableHead className="py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-primary/50 pr-8">
                            Actions
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {roleLoading ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="py-10 text-center text-muted-foreground"
                            >
                              Loading roles...
                            </TableCell>
                          </TableRow>
                        ) : roles.length === 0 ? (
                          <TableRow>
                            <TableCell
                              colSpan={4}
                              className="py-10 text-center text-muted-foreground"
                            >
                              No roles found.
                            </TableCell>
                          </TableRow>
                        ) : (
                          roles.map((role, index) => (
                            <Motion.tr
                              key={`${role.id || role.name || "role"}-${index}`}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.03 }}
                              className="group/row border-b border-white/5 transition-colors hover:bg-white/[0.03]"
                            >
                              <TableCell className="py-5">
                                <div className="space-y-1">
                                  <div className="font-semibold text-foreground/90">
                                    {role.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {role.description || "No description"}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className="rounded-full border-white/10 bg-white/5 px-3 py-1 text-xs"
                                >
                                  {role.permissionCount} permissions
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "rounded-lg px-2 py-0.5 text-[9px] font-black uppercase tracking-widest",
                                    role.isSystem
                                      ? "border-primary/20 bg-primary/10 text-primary"
                                      : "border-zinc-500/20 bg-zinc-500/10 text-zinc-400",
                                  )}
                                >
                                  {formatRoleBadge(role)}
                                </Badge>
                              </TableCell>
                              <TableCell className="pr-8 text-right">
                                <TooltipProvider delayDuration={120}>
                                  <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                      <ActionTooltip label="Role actions">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-8 w-8 rounded-lg hover:bg-white/10"
                                        >
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </ActionTooltip>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-52 bg-secondary/95 backdrop-blur-2xl border-white/10 shadow-2xl"
                                    >
                                      <DropdownMenuLabel className="px-2 py-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
                                        Role Actions
                                      </DropdownMenuLabel>
                                      <DropdownMenuItem
                                        disabled={role.isSystem}
                                        onClick={() => openEditRole(role)}
                                        className="gap-2 py-2 focus:bg-primary/10 focus:text-primary"
                                      >
                                        <Edit className="h-4 w-4" /> Edit Role
                                      </DropdownMenuItem>
                                      <DropdownMenuItem
                                        disabled={role.isSystem}
                                        onClick={() =>
                                          setRoleDeleteTarget(role)
                                        }
                                        className="gap-2 py-2 text-rose-400 focus:bg-rose-500/10 focus:text-rose-400"
                                      >
                                        <Trash2 className="h-4 w-4" /> Delete
                                        Role
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </TooltipProvider>
                              </TableCell>
                            </Motion.tr>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  <div className="space-y-4 rounded-2xl border border-white/10 bg-card/50 p-4">
                    <div>
                      <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        Permission Viewer
                      </h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        This section renders the permission list returned by GET
                        /api/v1/admin/roles/permissions/list.
                      </p>
                    </div>

                    <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1 custom-scrollbar">
                      {groupedPermissions.map((group) => (
                        <div
                          key={group.label}
                          className="rounded-2xl border border-white/10 bg-black/20 p-4 space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <h4 className="font-semibold text-foreground capitalize">
                                {group.label}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {group.permissions.length} keys
                              </p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {group.permissions.map((permission) => (
                              <div
                                key={permission.key}
                                className="rounded-xl border border-white/5 bg-white/5 p-3"
                              >
                                <div className="text-sm font-medium text-foreground">
                                  {permission.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {permission.description || permission.key}
                                </div>
                                <div className="mt-2 inline-flex rounded-full border border-white/10 bg-black/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-primary/70">
                                  {permission.key}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {rolePagination.total_pages > 1 && (
                  <Pagination
                    currentPage={rolePagination.page}
                    totalPages={rolePagination.total_pages}
                    onPageChange={setRolePage}
                    totalItems={rolePagination.total}
                    itemsPerPage={rolePagination.limit}
                    itemName="roles"
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      <AdminUserFormDialog
        open={isAdminFormOpen}
        onOpenChange={setIsAdminFormOpen}
        mode={adminFormMode}
        initialValue={adminFormInitial}
        roleOptions={roleOptions}
        onSubmit={handleAdminFormSubmit}
      />

      <RoleFormDialog
        open={isRoleFormOpen}
        onOpenChange={setIsRoleFormOpen}
        mode={roleFormMode}
        initialValue={roleFormInitial}
        permissions={permissions}
        onSubmit={handleRoleFormSubmit}
      />

      <ResetPasswordDialog
        open={isResetPasswordOpen}
        onOpenChange={setIsResetPasswordOpen}
        admin={selectedAdmin}
        onSubmit={handleResetPassword}
      />

      <DialogRoot
        open={Boolean(adminDeleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setAdminDeleteTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-lg bg-card/95 backdrop-blur-2xl border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-rose-400" />
              Delete Admin User
            </DialogTitle>
            <DialogDescription>
              {adminDeleteTarget
                ? `This will permanently remove ${adminDeleteTarget.name}.`
                : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-3">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="hover:bg-white/5"
                onClick={() => setAdminDeleteTarget(null)}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="danger"
              onClick={async () => {
                if (!adminDeleteTarget) {
                  return;
                }
                try {
                  await handleDeleteAdmin(adminDeleteTarget);
                  setAdminDeleteTarget(null);
                } catch (error) {
                  toast.error(
                    getHttpErrorMessage(error, "Failed to delete admin user"),
                  );
                }
              }}
            >
              Delete Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

      <DialogRoot
        open={Boolean(roleDeleteTarget)}
        onOpenChange={(open) => {
          if (!open) {
            setRoleDeleteTarget(null);
          }
        }}
      >
        <DialogContent className="max-w-lg bg-card/95 backdrop-blur-2xl border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-rose-400" />
              Delete Role
            </DialogTitle>
            <DialogDescription>
              {roleDeleteTarget
                ? `This will permanently remove the ${roleDeleteTarget.name} role.`
                : "This action cannot be undone."}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="gap-3">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="hover:bg-white/5"
                onClick={() => setRoleDeleteTarget(null)}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="danger"
              onClick={async () => {
                if (!roleDeleteTarget) {
                  return;
                }
                try {
                  await handleDeleteRole(roleDeleteTarget);
                  setRoleDeleteTarget(null);
                } catch (error) {
                  toast.error(
                    getHttpErrorMessage(error, "Failed to delete role"),
                  );
                }
              }}
            >
              Delete Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>
    </div>
  );
};
