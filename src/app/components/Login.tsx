import React, { useState, useEffect, useRef } from "react";
import { motion as Motion } from "motion/react";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/Button";
import { Input } from "./ui/Form";
import logoImage from "../../assets/0bc35e9a665193604f05247f84c75e961cc2853e.png";
import { signIn } from "../../services/auth.service";
import { HttpError } from "../../lib/http";

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const isMountedRef = useRef(true);
  const loginTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (loginTimerRef.current) clearTimeout(loginTimerRef.current);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = email.trim();
    const passwordRule =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;

    if (!passwordRule.test(password)) {
      toast.error(
        "Password must include uppercase, lowercase, number, and special character.",
      );
      return;
    }

    setIsLoading(true);
    try {
      await signIn({ email: trimmedEmail, password });
      if (!isMountedRef.current) return;
      toast.success("Logged in successfully");
      onLogin();
    } catch (error) {
      if (!isMountedRef.current) return;
      if (error instanceof HttpError) {
        const backendMessage =
          typeof error.details === "object" &&
          error.details !== null &&
          "message" in (error.details as Record<string, unknown>)
            ? String((error.details as Record<string, unknown>).message)
            : undefined;

        if (error.status === 401) {
          toast.error(backendMessage || "Invalid email or password");
        } else if (error.status === 422) {
          toast.error(
            backendMessage ||
              "Validation failed. Please check your email and password format.",
          );
        } else if (error.status === 429) {
          toast.error(
            backendMessage || "Too many attempts. Please wait and try again.",
          );
        } else {
          toast.error(backendMessage || error.message || "Login failed");
        }
      } else {
        toast.error("Unable to login. Please try again.");
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-24 h-24 mx-auto mb-6 flex items-center justify-center">
            <img
              src={logoImage}
              alt="Master Piseth"
              className="w-full h-full object-contain drop-shadow-[0_0_15px_var(--primary)]"
            />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">
            Welcome Back
          </h1>
          <p className="text-muted-foreground">
            Sign in to access the MASTER PISETH Dashboard
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground ml-1">
                Email Address
              </label>
              <div className="relative group">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="email"
                  placeholder="admin@fengshui.com"
                  className="pl-10 h-11 bg-secondary/30 border-border focus:border-primary/50 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-foreground">
                  Password
                </label>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    toast.info("Password recovery is currently disabled.");
                  }}
                  className="text-xs text-primary hover:text-primary/80 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-11 bg-secondary/30 border-border focus:border-primary/50 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-5 w-5" />
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-muted-foreground">
              By signing in, you agree to our{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Legal documents coming soon.");
                }}
                className="text-primary hover:underline text-[13px]"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toast.info("Legal documents coming soon.");
                }}
                className="text-primary hover:underline text-[13px]"
              >
                Privacy Policy
              </button>
              .
            </p>
          </div>
        </div>
      </Motion.div>
    </div>
  );
};
