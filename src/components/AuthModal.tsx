"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import { Mail, X, User, Loader2, KeyRound, ArrowLeft, Timer } from "lucide-react";
import { useToast } from "@/components/Toast";
import { useRouter } from "next/navigation";

const BRAND_COLOR = "#8ed26b";
type AuthMode = "login" | "register";

// Define the props interface
interface AuthModalProps {
  showAuth: boolean;
  setShowAuth: (s: boolean) => void;
  onAuthSuccess?: () => void;
  initialMode?: AuthMode;
}

export default function AuthModal({
  showAuth,
  setShowAuth,
  onAuthSuccess,
  initialMode = "login",  // Default to "login" if not provided
}: AuthModalProps) {
  const router = useRouter();
  const { toast } = useToast();

  // Initialize mode with the initialMode prop
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  // Countdown state
  const [countdown, setCountdown] = useState(0);

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const closeModal = () => {
    setShowAuth(false);
    setEmail("");
    setName("");
    setToken("");
    setShowOtpInput(false);
    setLoading(false);
    setCountdown(0);
  };

const handleSendOtp = async (e: React.FormEvent) => {
  e.preventDefault();
  if (countdown > 0) return;
  setLoading(true);

  const normalizedEmail = email.trim().toLowerCase();

  try {
    // 1. CALL THE DATABASE FUNCTION to check auth.users directly
    const { data: userExists, error: rpcError } = await supabase.rpc('check_user_exists', {
      email_to_check: normalizedEmail,
    });

    if (rpcError) throw rpcError;

    // 2. LOGIC: Prevent registration if they already exist
    if (mode === "register" && userExists) {
      setLoading(false);
      return toast({ 
        title: "Account Exists", 
        description: "This email is already registered. Please login instead.", 
        variant: "destructive" 
      });
    }

    // 3. LOGIC: Prevent login if account doesn't exist
    if (mode === "login" && !userExists) {
      setLoading(false);
      return toast({ 
        title: "No Account Found", 
        description: "No account found with this email. Please register first.", 
        variant: "destructive" 
      });
    }

    // 4. Send the OTP
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        shouldCreateUser: mode === "register", // Strict creation control
        data: mode === "register" ? { full_name: name } : undefined,
      },
    });

    if (otpError) throw otpError;

    setShowOtpInput(true);
    setCountdown(60);
    toast({ title: "OTP Sent", description: "Check your email inbox." });

  } catch (err: any) {
    toast({ title: "Auth Error", description: err.message, variant: "destructive" });
  } finally {
    setLoading(false);
  }
};

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token,
        type: "email",
      });

      if (error) throw error;

      toast({ title: "Success!", description: "You are now logged in." });
      onAuthSuccess?.();
      router.push("/site");
      closeModal();
      router.refresh();
    } catch (err: any) {
      toast({ title: "Invalid Code", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (!showAuth) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />

      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden p-8">
        <button onClick={closeModal} className="absolute right-6 top-6 text-gray-400 hover:text-black">
          <X size={24} />
        </button>

        <div className="flex flex-col items-center mb-8">
          <Image src="/instlogo.png" alt="Logo" width={200} height={80} className="mb-4" />
          <h2 className="text-2xl font-bold">
            {showOtpInput ? "Verify Code" : mode === "login" ? "Welcome Back" : "Create Account"}
          </h2>
          <p className="text-gray-500 text-sm text-center mt-1">
            {showOtpInput ? `Sent to ${email}` : "Enter your details to receive an OTP"}
          </p>
        </div>

        <form onSubmit={showOtpInput ? handleVerifyOtp : handleSendOtp} className="space-y-4">
          {!showOtpInput ? (
            <>
              {mode === "register" && (
                <div className="relative">
                  <User className="absolute left-4 top-4 text-gray-400" size={18} />
                  <input
                    required
                    type="text"
                    placeholder="Full Name"
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-[#8ed26b]"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-4 text-gray-400" size={18} />
                <input
                  required
                  type="email"
                  placeholder="Email Address"
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-[#8ed26b]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </>
          ) : (
            <div className="relative">
              <KeyRound className="absolute left-4 top-4 text-gray-400" size={18} />
              <input
                required
                type="text"
                placeholder="000000"
                className="w-full pl-12 pr-4 py-4 bg-gray-50 rounded-2xl outline-none border border-transparent focus:border-[#8ed26b] tracking-[0.5em] font-bold text-center text-xl"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                maxLength={6}
              />
            </div>
          )}

          <button
            disabled={loading || (countdown > 0 && !showOtpInput)}
            className="w-full py-4 rounded-2xl text-white font-bold shadow-lg transition-all hover:opacity-90 flex justify-center items-center disabled:bg-gray-300"
            style={{ backgroundColor: loading || (countdown > 0 && !showOtpInput) ? undefined : BRAND_COLOR }}
          >
            {loading ? (
              <Loader2 className="animate-spin" />
            ) : showOtpInput ? (
              "Verify & Login"
            ) : countdown > 0 ? (
              `Resend in ${countdown}s`
            ) : mode === "login" ? (
              "Send Login Code"
            ) : (
              "Register Now"
            )}
          </button>
        </form>

        {showOtpInput && countdown > 0 && (
          <p className="mt-4 text-center text-sm text-gray-400 flex items-center justify-center gap-2">
            <Timer size={14} /> Resend available in {countdown} seconds
          </p>
        )}
        
        {showOtpInput && countdown === 0 && (
           <button 
           onClick={handleSendOtp}
           className="mt-4 w-full text-center text-sm font-bold"
           style={{ color: BRAND_COLOR }}
         >
           Resend New Code
         </button>
        )}

        {!showOtpInput && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === "login" ? "register" : "login")}
              className="text-sm font-semibold"
              style={{ color: BRAND_COLOR }}
            >
              {mode === "login" ? "Don't have an account? Sign Up" : "Already have an account? Log In"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}