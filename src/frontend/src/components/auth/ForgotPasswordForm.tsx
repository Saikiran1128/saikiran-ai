import { ArrowLeft, CheckCircle2, Loader2, Mail } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ForgotPasswordValues {
  email: string;
}

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export function ForgotPasswordForm({ onBack }: ForgotPasswordFormProps) {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordValues>({
    mode: "onBlur",
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    // Simulated reset — no real email send this version.
    await new Promise((r) => setTimeout(r, 700));
    void values;
    setSent(true);
  }

  return (
    <Card className="glass-strong border-border/60 p-8 shadow-xl">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow">
          <Mail className="size-6" aria-hidden />
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Reset your password
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mt-8 flex flex-col items-center gap-4 text-center"
          data-ocid="forgot_password.success_state"
        >
          <CheckCircle2 className="size-12 text-success" aria-hidden />
          <div className="space-y-1">
            <p className="font-medium text-foreground">Check your inbox</p>
            <p className="text-sm text-muted-foreground">
              If an account exists for that email, a reset link is on its way.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={onBack}
            data-ocid="forgot_password.back_button"
          >
            <ArrowLeft className="size-4" aria-hidden />
            Back to sign in
          </Button>
        </motion.div>
      ) : (
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-4"
          noValidate
        >
          <div className="space-y-2">
            <Label htmlFor="forgot-email">Email</Label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                id="forgot-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className="pl-9"
                aria-invalid={!!errors.email}
                data-ocid="forgot_password.email_input"
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
                data-ocid="forgot_password.email.field_error"
              >
                {errors.email.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            data-ocid="forgot_password.submit_button"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden />
                Sending link…
              </>
            ) : (
              "Send reset link"
            )}
          </Button>

          <button
            type="button"
            onClick={onBack}
            className="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            data-ocid="forgot_password.back_link"
          >
            <ArrowLeft className="size-3.5" aria-hidden />
            Back to sign in
          </button>
        </form>
      )}
    </Card>
  );
}
