"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Building2, LogIn, KeyRound, AlertCircle, CheckCircle2 } from "lucide-react";

import { api } from "@/lib/api-client";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

// Form Validation Schemas
const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

const forgotPasswordSchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    newPassword: z.string().min(8, "Password must be at least 8 characters long"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginFormValues = z.infer<typeof loginSchema>;
type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<{
    message: string;
    showRegisterPrompt?: boolean;
  } | null>(null);

  // Modal State for Forgot Password
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);

  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const forgotForm = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Populate data from localStorage if available
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check saved session or draft credentials
      const savedSession = localStorage.getItem("barea_session");
      const savedDraft = localStorage.getItem("barea_registration_draft");

      let prefillEmail = "";
      if (savedSession) {
        try {
          const parsed = JSON.parse(savedSession);
          if (parsed?.email) prefillEmail = parsed.email;
        } catch (e) {
          console.error("Failed to parse barea_session:", e);
        }
      }

      if (!prefillEmail && savedDraft) {
        try {
          const parsed = JSON.parse(savedDraft);
          if (parsed?.email) prefillEmail = parsed.email;
        } catch (e) {
          console.error("Failed to parse barea_registration_draft:", e);
        }
      }

      if (prefillEmail) {
        loginForm.setValue("email", prefillEmail);
      }
    }
  }, [loginForm]);

  // Handle Login Submission
  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      // Call backend API for authentication / company verification
      const response = await api.post<{
        companyId: string;
        email: string;
        companyName?: string;
        name?: string;
        token?: string;
      }>("/auth/login", {
        email: data.email,
        password: data.password,
      });

      // Save session info to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem(
          "barea_session",
          JSON.stringify({
            companyId: response.companyId,
            email: response.email,
            companyName: response.companyName || response.name || "",
            token: response.token,
          })
        );
      }

      router.push("/home");
    } catch (error: any) {
      console.error("[LoginPage] Login failed:", error);
      const isNotFound =
        error?.status === 404 ||
        (error?.message && error.message.toLowerCase().includes("not found"));

      if (isNotFound) {
        setAuthError({
          message: "Account not found. Please verify your credentials or register as a new user.",
          showRegisterPrompt: true,
        });
      } else {
        setAuthError({
          message:
            error instanceof Error
              ? error.message
              : "Invalid email or password. Please verify your credentials.",
          showRegisterPrompt: true,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password Submission
  const onForgotPasswordSubmit = async (data: ForgotPasswordFormValues) => {
    setIsResetting(true);
    setResetError(null);
    setResetSuccess(null);

    try {
      await api.post("/auth/reset-password", {
        email: data.email,
        newPassword: data.newPassword,
      });

      setResetSuccess("Password has been successfully updated! You can now log in with your new password.");
      forgotForm.reset();
      
      // Auto pre-fill the login email if reset succeeded
      loginForm.setValue("email", data.email);
    } catch (error: any) {
      console.error("[LoginPage] Reset password failed:", error);
      setResetError(
        error instanceof Error ? error.message : "Failed to reset password. Please try again."
      );
    } finally {
      setIsResetting(false);
    }
  };

  const handleOpenForgotModal = () => {
    setResetError(null);
    setResetSuccess(null);
    forgotForm.reset({
      email: loginForm.getValues("email") || "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsForgotOpen(true);
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md rounded-2xl border-border shadow-[0_18px_50px_rgba(15,23,42,0.08)]">
        <CardHeader className="space-y-3 px-6 pb-4 pt-8 text-center sm:px-8 sm:pt-8">
          <div className="mb-2 flex items-center justify-center gap-2">
            <Building2 className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold tracking-tight text-foreground">
              B_Area Marketplace
            </span>
          </div>
          <CardTitle className="text-2xl sm:text-3xl">Sign In</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Enter your email and password to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="px-6 pb-6 sm:px-8">
          {authError && (
            <div className="mb-6 p-4 rounded-xl border border-destructive/20 bg-destructive/10 text-destructive text-sm space-y-2">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{authError.message}</span>
              </div>
              {authError.showRegisterPrompt && (
                <div className="pt-2 flex items-center gap-2 border-t border-destructive/20">
                  <span className="text-xs">New to B_Area?</span>
                  <Link
                    href="/register"
                    className="text-xs font-semibold underline hover:opacity-80"
                  >
                    Register here
                  </Link>
                </div>
              )}
            </div>
          )}

          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-5">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="john@company.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Password</FormLabel>
                      <button
                        type="button"
                        onClick={handleOpenForgotModal}
                        className="text-xs text-primary font-medium hover:underline focus:outline-none"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  "Signing in..."
                ) : (
                  <>
                    Sign In <LogIn className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          </Form>
        </CardContent>

        <CardFooter className="px-6 pb-8 pt-0 sm:px-8 flex justify-center border-t border-border mt-4">
          <p className="text-sm text-muted-foreground pt-4">
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              className="text-primary font-semibold hover:underline"
            >
              Register here
            </Link>
          </p>
        </CardFooter>
      </Card>

      {/* Forgot Password Modal */}
      <Dialog open={isForgotOpen} onOpenChange={setIsForgotOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 text-primary mb-1">
              <KeyRound className="w-5 h-5" />
              <DialogTitle className="text-xl">Reset Password</DialogTitle>
            </div>
            <DialogDescription>
              Enter your email address and create a new password below.
            </DialogDescription>
          </DialogHeader>

          {resetSuccess ? (
            <div className="py-4 space-y-4">
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm flex items-start gap-2">
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{resetSuccess}</span>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => setIsForgotOpen(false)}
                  className="w-full"
                >
                  Close & Back to Login
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <Form {...forgotForm}>
              <form
                onSubmit={forgotForm.handleSubmit(onForgotPasswordSubmit)}
                className="space-y-4 py-2"
              >
                {resetError && (
                  <div className="p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{resetError}</span>
                  </div>
                )}

                <FormField
                  control={forgotForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="john@company.com"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={forgotForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={forgotForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter className="pt-2 sm:justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsForgotOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isResetting}>
                    {isResetting ? "Saving..." : "Update Password"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
