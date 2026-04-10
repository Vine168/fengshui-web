import React, { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Lock,
  LogOut,
  Mail,
  Moon,
  Sun,
  Check,
} from "lucide-react";
import clsx from "clsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { Button } from "./ui/Button";
import { Input } from "./ui/Form";
import { Badge } from "./ui/Badge";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
} from "./ui/Dialog";
import { ConfirmDialog } from "./ui/ConfirmDialog";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { useNavigate } from "react-router";
import { signOut } from "../../services/auth.service";
import {
  loadSettingsProfile,
  saveSettingsPassword,
  saveSettingsProfile,
} from "../../services/settingsGeneral.service";

type ConfirmAction = "save-profile" | "save-password" | "logout";

type SettingsGeneralSecurityProps = {
  onLogout?: () => Promise<void> | void;
};

export const SettingsGeneralSecurity: React.FC<
  SettingsGeneralSecurityProps
> = ({ onLogout }) => {
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);
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
  const isMountedRef = useRef(true);

  const [profileData, setProfileData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    name: "",
    role: "",
    isActive: true,
  });

  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  useEffect(() => {
    isMountedRef.current = true;

    const loadProfile = async () => {
      try {
        setProfileLoading(true);
        const profile = await loadSettingsProfile();
        if (!isMountedRef.current) {
          return;
        }

        setProfileData({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          isActive: profile.isActive,
        });
      } catch {
        if (isMountedRef.current) {
          toast.error("Failed to load profile settings");
        }
      } finally {
        if (isMountedRef.current) {
          setProfileLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const executeSaveProfile = async () => {
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      setProfileSaving(true);
      const updatedProfile = await saveSettingsProfile({
        first_name: profileData.firstName.trim(),
        last_name: profileData.lastName.trim(),
      });

      if (!isMountedRef.current) {
        return;
      }

      setProfileData((current) => ({
        ...current,
        firstName: updatedProfile.firstName,
        lastName: updatedProfile.lastName,
        email: updatedProfile.email,
        name: updatedProfile.name,
        role: updatedProfile.role,
        isActive: updatedProfile.isActive,
      }));
      toast.success("Profile updated successfully");
    } catch {
      if (isMountedRef.current) {
        toast.error("Failed to update profile");
      }
    } finally {
      if (isMountedRef.current) {
        setProfileSaving(false);
      }
    }
  };

  const handleSaveProfile = () => {
    if (!profileData.firstName.trim() || !profileData.lastName.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setConfirmDialog({
      open: true,
      title: "Confirm Profile Changes",
      description: "Are you sure you want to save the following changes?",
      confirmLabel: "Save Changes",
      action: "save-profile",
    });
  };

  const executeSavePassword = async () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    try {
      setPasswordSaving(true);
      await saveSettingsPassword({
        current_password: passwordData.current,
        new_password: passwordData.new,
        confirm_new_password: passwordData.confirm,
      });

      if (!isMountedRef.current) {
        return;
      }

      toast.success("Password changed successfully");
      setIsPasswordOpen(false);
      setPasswordData({ current: "", new: "", confirm: "" });
    } catch {
      if (isMountedRef.current) {
        toast.error("Failed to change password");
      }
    } finally {
      if (isMountedRef.current) {
        setPasswordSaving(false);
      }
    }
  };

  const handleSavePassword = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      toast.error("Please fill in all password fields");
      return;
    }
    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords do not match");
      return;
    }
    if (passwordData.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setConfirmDialog({
      open: true,
      title: "Confirm Password Update",
      description:
        "Are you sure you want to update your password? You will use the new password on your next login.",
      confirmLabel: "Update Password",
      action: "save-password",
    });
  };

  const executeLogout = async () => {
    try {
      setLogoutLoading(true);
      if (onLogout) {
        await onLogout();
        return;
      }

      await signOut();
      navigate("/login", { replace: true });
    } catch {
      toast.error("Failed to log out");
    } finally {
      if (isMountedRef.current) {
        setLogoutLoading(false);
      }
    }
  };

  const handleLogout = () => {
    setConfirmDialog({
      open: true,
      title: "Confirm Logout",
      description: "Are you sure you want to log out now?",
      confirmLabel: "Log Out",
      action: "logout",
    });
  };

  const handleConfirmDialogAction = async () => {
    if (!confirmDialog.action) {
      return;
    }

    setConfirmSubmitting(true);
    try {
      switch (confirmDialog.action) {
        case "save-profile":
          await executeSaveProfile();
          break;
        case "save-password":
          await executeSavePassword();
          break;
        case "logout":
          await executeLogout();
          break;
        default:
          break;
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

  const profileDisplayName =
    profileData.name ||
    [profileData.firstName, profileData.lastName].filter(Boolean).join(" ") ||
    "Admin";
  const profileInitials =
    `${profileData.firstName?.[0] || profileData.name?.[0] || "A"}${profileData.lastName?.[0] || ""}`.toUpperCase();

  return (
    <>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your public profile and contact details.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-3xl font-medium text-white shadow-md shadow-primary/2 border-4 border-card">
                  {profileInitials}
                </div>
                <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs text-white font-normal">Change</span>
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-lg text-foreground">
                  {profileLoading ? "Loading profile..." : profileDisplayName}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {profileData.email || "Email not available"}
                </p>
                <Badge
                  variant="outline"
                  className="mt-2 border-primary/30 text-primary bg-primary/5"
                >
                  {profileData.role || "admin"}
                </Badge>
              </div>
              <Button
                variant="danger"
                onClick={handleLogout}
                isLoading={logoutLoading}
                className="ml-auto gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 hover:text-red-400 border border-red-500/20"
              >
                <LogOut className="w-4 h-4" />
                Log Out
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-normal text-foreground">
                  First Name
                </label>
                <Input
                  value={profileData.firstName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      firstName: e.target.value,
                    })
                  }
                  disabled={profileLoading}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-normal text-foreground">
                  Last Name
                </label>
                <Input
                  value={profileData.lastName}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      lastName: e.target.value,
                    })
                  }
                  disabled={profileLoading}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-normal text-foreground">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={profileData.email}
                    readOnly
                    className="pl-9 bg-muted/40 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button
                variant="primary"
                onClick={handleSaveProfile}
                isLoading={profileSaving}
                disabled={profileLoading}
              >
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Display Theme</CardTitle>
            <CardDescription>
              Customize the appearance of your dashboard workspace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setTheme("light")}
                className={clsx(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                  theme === "light"
                    ? "bg-primary/5 border-primary shadow-sm shadow-primary/1"
                    : "bg-background border-border hover:bg-white/5 hover:border-primary/30",
                )}
              >
                <div
                  className={clsx(
                    "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
                    theme === "light"
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary",
                  )}
                >
                  <Sun className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4
                    className={clsx(
                      "font-medium",
                      theme === "light" ? "text-primary" : "text-foreground",
                    )}
                  >
                    Light Mode
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Standard brightness for daily work.
                  </p>
                </div>
                {theme === "light" && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={clsx(
                  "flex items-center gap-4 p-4 rounded-xl border transition-all text-left group",
                  theme === "dark"
                    ? "bg-primary/5 border-primary shadow-sm shadow-primary/1"
                    : "bg-background border-border hover:bg-white/5 hover:border-primary/30",
                )}
              >
                <div
                  className={clsx(
                    "w-12 h-12 rounded-lg flex items-center justify-center transition-colors",
                    theme === "dark"
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary",
                  )}
                >
                  <Moon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h4
                    className={clsx(
                      "font-medium",
                      theme === "dark" ? "text-primary" : "text-foreground",
                    )}
                  >
                    Black Mode
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Elegant luxury dark theme.
                  </p>
                </div>
                {theme === "dark" && <Check className="w-5 h-5 text-primary" />}
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password & Authentication</CardTitle>
            <CardDescription>
              Manage how you sign in to your account.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              variant="outline"
              className="justify-start gap-2 h-12 w-full hover:bg-secondary/80 transition-colors"
              onClick={() => setIsPasswordOpen(true)}
            >
              <Lock className="w-4 h-4 text-primary" />
              <div className="flex flex-col items-start">
                <span className="font-normal text-foreground">
                  Change Password
                </span>
              </div>
              <ChevronRight className="w-4 h-4 ml-auto text-muted-foreground" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <DialogRoot open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Ensure your account is secure by using a strong password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Password</label>
              <Input
                type="password"
                placeholder="Enter current password"
                value={passwordData.current}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, current: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">New Password</label>
              <Input
                type="password"
                placeholder="Enter new password"
                value={passwordData.new}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, new: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Confirm New Password
              </label>
              <Input
                type="password"
                placeholder="Confirm new password"
                value={passwordData.confirm}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirm: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsPasswordOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSavePassword}
              isLoading={passwordSaving}
            >
              Update Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </DialogRoot>

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
