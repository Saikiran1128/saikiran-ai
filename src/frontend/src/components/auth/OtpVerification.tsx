import { Loader2, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface OtpVerificationProps {
  email: string;
  onVerified: () => void;
  onResend: () => void;
}

const OTP_LENGTH = 6;

export function OtpVerification({
  email,
  onVerified,
  onResend,
}: OtpVerificationProps) {
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    inputsRef.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft]);

  function updateDigit(index: number, value: string) {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = char;
    setDigits(next);
    setError(null);
    if (char && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
    if (e.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const pasted = e.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((c, i) => {
      next[i] = c;
    });
    setDigits(next);
    const focusIndex = Math.min(pasted.length, OTP_LENGTH - 1);
    inputsRef.current[focusIndex]?.focus();
  }

  async function verify() {
    const code = digits.join("");
    if (code.length < OTP_LENGTH) {
      setError("Enter all 6 digits.");
      return;
    }
    setVerifying(true);
    setError(null);
    // Simulated verification — any 6-digit code is accepted this version.
    await new Promise((r) => setTimeout(r, 700));
    setVerifying(false);
    onVerified();
  }

  // Auto-verify when all digits filled.
  useEffect(() => {
    if (digits.every((d) => d !== "") && !verifying) {
      void verify();
    }
    // biome-ignore lint/correctness/useExhaustiveDependencies: verify is a stable function declaration
  }, [digits, verify, verifying]);

  return (
    <Card className="glass-strong border-border/60 p-8 shadow-xl">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow">
          <ShieldCheck className="size-6" aria-hidden />
        </div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground">
          Verify it&apos;s you
        </h1>
        <p className="text-sm text-muted-foreground">
          We sent a 6-digit code to{" "}
          <span className="font-medium text-foreground">{email}</span>.
        </p>
      </div>

      <div className="mt-8 space-y-2">
        <Label htmlFor="otp-0">Verification code</Label>
        <div className="flex justify-between gap-2" onPaste={handlePaste}>
          {digits.map((d, i) => (
            <Input
              key={`otp-${i}-${d}`}
              id={i === 0 ? "otp-0" : undefined}
              ref={(el) => {
                inputsRef.current[i] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={d}
              autoComplete={i === 0 ? "one-time-code" : "off"}
              aria-label={`Digit ${i + 1}`}
              className="h-14 w-12 text-center text-lg font-semibold"
              data-ocid={`otp.input.${i + 1}`}
              onChange={(e) => updateDigit(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
            />
          ))}
        </div>
        {error && (
          <p
            className="text-xs text-destructive"
            data-ocid="otp.field_error"
            role="alert"
          >
            {error}
          </p>
        )}
      </div>

      <Button
        type="button"
        className="mt-6 w-full"
        disabled={verifying || digits.some((d) => d === "")}
        onClick={verify}
        data-ocid="otp.submit_button"
      >
        {verifying ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Verifying…
          </>
        ) : (
          "Verify & continue"
        )}
      </Button>

      <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        {secondsLeft > 0 ? (
          <span data-ocid="otp.resend_countdown">
            Resend code in {secondsLeft}s
          </span>
        ) : (
          <button
            type="button"
            onClick={() => {
              setSecondsLeft(30);
              onResend();
            }}
            className="font-medium text-primary transition-smooth hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            data-ocid="otp.resend_button"
          >
            Resend code
          </button>
        )}
      </div>
    </Card>
  );
}
