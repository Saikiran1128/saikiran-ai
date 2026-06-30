import { createRoute, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { LoginForm } from "@/components/auth/LoginForm";
import { OtpVerification } from "@/components/auth/OtpVerification";
import { rootRoute } from "./__root";

type Step = "login" | "forgot" | "otp";

export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("login");
  const [otpEmail, setOtpEmail] = useState("");

  function goToDashboard() {
    navigate({ to: "/dashboard" });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-12">
      {/* Ambient gradient backdrop */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[32rem] w-[32rem] -translate-x-1/2 rounded-full opacity-25 blur-3xl gradient-primary"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-20 h-[28rem] w-[28rem] rounded-full opacity-20 blur-3xl gradient-accent"
      />

      <div className="relative w-full max-w-md">
        <AnimatePresence mode="wait">
          {step === "login" && (
            <motion.div
              key="login"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <LoginForm
                onForgotPassword={() => setStep("forgot")}
                onOtpRequired={(email) => {
                  setOtpEmail(email);
                  setStep("otp");
                }}
              />
            </motion.div>
          )}

          {step === "forgot" && (
            <motion.div
              key="forgot"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <ForgotPasswordForm onBack={() => setStep("login")} />
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <OtpVerification
                email={otpEmail}
                onVerified={goToDashboard}
                onResend={() => {
                  /* Simulated resend — no real send this version. */
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
