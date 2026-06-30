import { Fingerprint, Loader2, Lock, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginFormProps {
  onForgotPassword: () => void;
  onOtpRequired: (email: string) => void;
}

export function LoginForm({ onForgotPassword, onOtpRequired }: LoginFormProps) {
  const loginWithEmail = useAuth((s) => s.loginWithEmail);
  const loginWithII = useAuth((s) => s.loginWithII);
  const { login: iiLogin } = useInternetIdentity();

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [iiError, setIiError] = useState<string | null>(null);
  const [iiLoading, setIiLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    mode: "onBlur",
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginFormValues) {
    setSubmitError(null);
    // Simulated auth — no real credential check this version. After "verify",
    // surface the OTP step (the store still marks the user authenticated; the
    // OTP screen is a UX gate before navigating to /dashboard).
    await new Promise((r) => setTimeout(r, 600));
    try {
      loginWithEmail(values.email, values.password);
      onOtpRequired(values.email);
    } catch {
      setSubmitError("Unable to sign in. Please check your credentials.");
    }
  }

  async function handleII() {
    setIiError(null);
    setIiLoading(true);
    try {
      // iiLogin() returns void in this version of @icp-sdk/auth; the auth
      // store's loginWithII sets a mock II user without needing the principal.
      await iiLogin();
      loginWithII("ii-principal-mock");
      onOtpRequired("ii-principal");
    } catch {
      setIiError("Internet Identity login failed. Please try again.");
    } finally {
      setIiLoading(false);
    }
  }

  return (
    <Card className="glass-strong border-border/60 p-8 shadow-xl">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow">
          <Lock className="size-6" aria-hidden />
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your workspace to continue.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 space-y-4"
        noValidate
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              className="pl-9"
              aria-invalid={!!errors.email}
              data-ocid="login.email_input"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />
          </div>
          {errors.email && (
            <p
              className="text-xs text-destructive"
              data-ocid="login.email.field_error"
            >
              {errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-medium text-primary transition-smooth hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
              data-ocid="login.forgot_password_link"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              className="pl-9"
              aria-invalid={!!errors.password}
              data-ocid="login.password_input"
              {...register("password", {
                required: "Password is required",
                minLength: { value: 6, message: "At least 6 characters" },
              })}
            />
          </div>
          {errors.password && (
            <p
              className="text-xs text-destructive"
              data-ocid="login.password.field_error"
            >
              {errors.password.message}
            </p>
          )}
        </div>

        {submitError && (
          <div
            className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
            data-ocid="login.error_state"
            role="alert"
          >
            {submitError}
          </div>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={isSubmitting}
          data-ocid="login.submit_button"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Signing in…
            </>
          ) : (
            "Sign In"
          )}
        </Button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-xs uppercase tracking-wide text-muted-foreground">
            or
          </span>
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        className="w-full gap-2"
        disabled={iiLoading}
        data-ocid="login.ii_button"
        onClick={handleII}
      >
        {iiLoading ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Fingerprint className="size-4" aria-hidden />
        )}
        Continue with Internet Identity
      </Button>

      {iiError && (
        <div
          className="mt-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
          data-ocid="login.ii.error_state"
          role="alert"
        >
          {iiError}
        </div>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By continuing you agree to our Terms & Privacy Policy.
      </p>
    </Card>
  );
}

export const loginCardMotion = {
  initial: { opacity: 0, y: 24, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

export const MotionLoginForm = motion(LoginForm);
