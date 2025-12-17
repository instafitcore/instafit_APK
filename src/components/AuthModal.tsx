// components/AuthModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import { Mail, X, User } from "lucide-react";
import { useToast } from "@/components/Toast";

const BRAND_COLOR = "#8ed26b";

type Mode = "login" | "register" | "verify";

type AuthModalProps = {
  showAuth: boolean;
  setShowAuth: (s: boolean) => void;
  initialMode?: "login" | "register";
  onAuthSuccess?: () => void;
};

export default function AuthModal({
  showAuth,
  setShowAuth,
  initialMode = "login",
  onAuthSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<Mode>(initialMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast(); // <-- fixed

  // OTP related
  const OTP_LEN = 6; // 8-digit code
  const [otp, setOtp] = useState<string[]>(Array(OTP_LEN).fill(""));
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const resendIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (resendTimer > 0) {
      const id = window.setInterval(() => {
        setResendTimer((t) => {
          if (t <= 1) {
            window.clearInterval(id);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      resendIntervalRef.current = id;
      return () => window.clearInterval(id);
    }
  }, [resendTimer]);

  useEffect(() => {
    if (mode === "verify") inputsRef.current[0]?.focus();
  }, [mode]);

  const clearAlerts = () => {
    setMessage(null);
    setError(null);
  };

  const closeModal = () => {
    setShowAuth(false);
    setMode(initialMode);
    setEmail("");
    setName("");
    setOtp(Array(OTP_LEN).fill(""));
    setSentTo(null);
    clearAlerts();
    setResendTimer(0);
  };

  // --- OTP helpers ---
  const handleOtpChange = (index: number, value: string) => {
    clearAlerts();
    const filtered = value.replace(/\D/g, "");
    if (!filtered) {
      setOtp((o) => {
        const copy = [...o];
        copy[index] = "";
        return copy;
      });
      return;
    }

    if (filtered.length > 1) {
      const digits = filtered.slice(0, OTP_LEN).split("");
      setOtp((o) => {
        const copy = [...o];
        for (let i = 0; i < OTP_LEN; i++) {
          copy[i] = digits[i] ?? copy[i];
        }
        return copy;
      });
      const nextIndex = Math.min(OTP_LEN - 1, filtered.length - 1);
      inputsRef.current[nextIndex]?.focus();
      return;
    }

    setOtp((o) => {
      const copy = [...o];
      copy[index] = filtered;
      return copy;
    });
    if (filtered && index < OTP_LEN - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === "Backspace") {
      if (otp[idx] === "") {
        if (idx > 0) inputsRef.current[idx - 1]?.focus();
      } else {
        setOtp((o) => {
          const c = [...o];
          c[idx] = "";
          return c;
        });
      }
    } else if (e.key === "ArrowLeft") {
      if (idx > 0) inputsRef.current[idx - 1]?.focus();
    } else if (e.key === "ArrowRight") {
      if (idx < OTP_LEN - 1) inputsRef.current[idx + 1]?.focus();
    }
  };

  const fullOtpString = () => otp.join("");

  // --- send OTP ---
  const sendOtp = async () => {
    clearAlerts();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Please enter a valid email address", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const options =
        mode === "register"
          ? { options: { data: { full_name: name.trim() } } }
          : undefined;

      const { error: signErr } = await supabase.auth.signInWithOtp({
        email,
        ...(options ?? {}),
      } as any);

      if (signErr) {
        toast({ title: signErr.message || "Failed to send OTP", variant: "destructive" });
      } else {
        toast({ title: `OTP sent to ${email}`, variant: "success" });
        setSentTo(email);
        setMode("verify");
        setOtp(Array(OTP_LEN).fill(""));
        setResendTimer(600);
      }
    } catch (err: any) {
      setError(err?.message || "Error sending OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    if (resendTimer > 0) return;
    await sendOtp();
  };

  // --- verify OTP ---
  const verifyOtp = async () => {
    clearAlerts();
    const code = fullOtpString();
    if (code.length !== OTP_LEN) {
      setError("Enter the 8-digit code");
      return;
    }
    if (!sentTo) {
      setError("No email to verify. Please request OTP again.");
      return;
    }

    setIsVerifying(true);
    try {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email: sentTo,
        token: code,
        type: "email",
      });

      if (verifyError) {
        toast({ title: verifyError.message || "OTP verification failed", variant: "destructive" });
      } else {
        toast({ title: "Authenticated successfully", variant: "success" });
        if (onAuthSuccess) onAuthSuccess();
        setTimeout(closeModal, 700);
      }
    } catch (err: any) {
      setError(err?.message || "Verification error");
    } finally {
      setIsVerifying(false);
    }
  };

  const formatTime = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  const mm = m.toString().padStart(2, "0");
  const ss = s.toString().padStart(2, "0");
  return `${mm}:${ss}`;
};


  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData("Text").replace(/\D/g, "").slice(0, OTP_LEN);
    if (!text) return;
    const digits = text.split("");
    setOtp((o) => {
      const c = [...o];
      for (let i = 0; i < OTP_LEN; i++) c[i] = digits[i] ?? "";
      return c;
    });
    const last = Math.min(OTP_LEN - 1, text.length - 1);
    inputsRef.current[last]?.focus();
    e.preventDefault();
  };

  if (!showAuth) return null;

  const IconWrapper: React.FC<{ Icon: React.ElementType }> = ({ Icon }) => (
    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
  );

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
        onClick={closeModal}
      />
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col items-center mb-6 relative">
            <div className="w-20 h-20 mb-2">
              <Image
                src="/logoInstaFitCore.jpg"
                alt="Logo"
                width={90}
                height={90}
                className="object-contain rounded-full"
                priority
              />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
              {mode === "login"
                ? "Login with OTP"
                : mode === "register"
                  ? "Register with OTP"
                  : "Verify OTP"}
            </h2>
            <p className="text-sm text-gray-500 mb-2 text-center">
              {mode === "login"
                ? "Enter your email to receive a 8-digit login code"
                : mode === "register"
                  ? "Enter name & email to receive a 8-digit signup code"
                  : `We've sent a 8-digit code to ${sentTo ?? email}.`}
            </p>

            <button
              onClick={closeModal}
              className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full"
              aria-label="Close authentication modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-300">
              {error}
            </div>
          )}

          {mode !== "verify" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendOtp();
              }}
            >
              <div className="space-y-4">
                {mode === "register" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full name
                    </label>
                    <div className="relative">
                      <IconWrapper Icon={User} />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-1"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <IconWrapper Icon={Mail} />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-1"
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-2 rounded-lg font-bold text-white shadow-md disabled:opacity-50 transition-all hover:brightness-105"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {loading ? "Sending..." : mode === "login" ? "Send OTP" : "Send OTP & Register"}
              </button>

              <div className="mt-3 text-sm text-center">
                {mode === "login" ? (
                  <>
                    <span className="text-gray-600">Don't have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("register");
                        clearAlerts();
                      }}
                      className="text-black font-semibold hover:underline"
                      style={{ color: BRAND_COLOR }}
                    >
                      Sign Up
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-gray-600">Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setMode("login");
                        clearAlerts();
                      }}
                      className="text-black font-semibold hover:underline"
                      style={{ color: BRAND_COLOR }}
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </form>
          )}

          {mode === "verify" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 8-digit code
                </label>

                <div
                  onPaste={handlePaste}
                  className="flex items-center justify-center gap-2"
                  aria-label="OTP entry"
                >
                  {Array.from({ length: OTP_LEN }).map((_, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputsRef.current[idx] = el;
                      }}
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength={1}
                      value={otp[idx] ?? ""}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(e, idx)}
                      className="w-12 h-12 text-center text-xl border rounded-md focus:outline-none focus:ring-2"
                      style={{ borderColor: "#e5e7eb" }}
                      aria-label={`Digit ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between mt-3 text-sm">
                  <div>
                    <button
                      type="button"
                      onClick={() => {
                        setMode(initialMode);
                        setOtp(Array(OTP_LEN).fill(""));
                        clearAlerts();
                      }}
                      className="text-gray-600 hover:underline"
                    >
                      Edit email
                    </button>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      onClick={resendOtp}
                      disabled={resendTimer > 0}
                      className="text-sm font-semibold hover:underline disabled:opacity-50"
                      style={{ color: BRAND_COLOR }}
                    >
{resendTimer > 0 ? `Resend in ${formatTime(resendTimer)}` : "Resend code"}
                    </button>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={verifyOtp}
                disabled={isVerifying}
                className="w-full py-2 rounded-lg font-bold text-white shadow-md disabled:opacity-50 transition-all hover:brightness-105"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {isVerifying ? "Verifying..." : "Verify & Continue"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
