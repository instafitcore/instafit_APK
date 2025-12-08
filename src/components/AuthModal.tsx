// components/AuthModal.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  X,
  User, // Added User icon for name field
} from "lucide-react";

// --- CONSTANTS ---
const BRAND_COLOR = "#8ed26b";

// --- TYPE DEFINITIONS ---
type AuthMode = "login" | "register" | "forgot";

type AuthModalProps = {
  showAuth: boolean;
  setShowAuth: (show: boolean) => void;
  mode: AuthMode;
  setMode: (mode: AuthMode) => void;
  onAuthSuccess: () => void; // Callback to handle success (e.g., close modal, update user state)
};

export default function AuthModal({
  showAuth,
  setShowAuth,
  mode,
  setMode,
  onAuthSuccess,
}: AuthModalProps) {
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const clearAlerts = () => {
    setMessage(null);
    setError(null);
  };

  const handleClose = () => {
    setShowAuth(false);
    clearAlerts(); // Clear alerts when closing the modal
  };

  // --- AUTH HANDLERS ---

  // LOGIN
  const handleLogin = async () => {
    clearAlerts();
    if (!email || !password) return setError("Please enter email and password");
    setAuthLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) setError(authError.message || "Login failed");
      else {
        setMessage("Signed in successfully");
        setTimeout(() => {
          onAuthSuccess();
          setShowAuth(false);
        }, 700);
      }
    } catch (err: any) {
      setError(err?.message || "Login error");
    } finally {
      setAuthLoading(false);
    }
  };

  // REGISTER
  const handleRegister = async () => {
    clearAlerts();
    if (!name.trim()) return setError("Full name is required");
    if (!email) return setError("Please enter an email");
    if (!password || password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");

    setAuthLoading(true);
    try {
      // Passes name as user_metadata to store it in Supabase
      const { data, error: signError } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: { full_name: name.trim() }
        }
      });
      
      if (signError) setError(signError.message || "Signup failed");
      else {
        // Only trigger success logic if data.user exists (e.g., if auto-sign-in is configured)
        // Otherwise, stick to the email verification message.
        if (data.user) {
           setMessage("Registration successful. Please check your email to verify your account.");
        } else {
           setMessage("Signup successful. Please check your email to verify your account.");
        }
       
        // We delay closing the modal to ensure the user reads the message about email verification
        setTimeout(() => {
          setMode("login"); // Optionally switch to login after successful signup
          // setShowAuth(false); // Do not auto-close if email verification is required
        }, 3000); 
      }
    } catch (err: any) {
      setError(err?.message || "Signup error");
    } finally {
      setAuthLoading(false);
    }
  };

  // FORGOT PASSWORD
  const handleForgot = async () => {
    clearAlerts();
    if (!forgotEmail) return setError("Enter your email to reset password");
    setAuthLoading(true);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail);
      if (resetError) setError(resetError.message || "Failed to send reset email");
      else {
        setMessage("Password reset email sent. Check your inbox.");
        setTimeout(() => {
          setMode("login");
          setForgotEmail("");
        }, 2000); // Give user time to read the message
      }
    } catch (err: any) {
      setError(err?.message || "Reset error");
    } finally {
      setAuthLoading(false);
    }
  };

  if (!showAuth) return null;

  // --- RENDER HELPERS ---

  const IconWrapper: React.FC<{ Icon: React.ElementType }> = ({ Icon }) => (
    <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
  );

  return (
    // Backdrop and positioning
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Invisible overlay for background close */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300" onClick={handleClose} />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden transform transition-all duration-300 scale-100 opacity-100">
        <div className="p-6 sm:p-8">
          
          {/* Header */}
          <div className="flex flex-col items-center mb-6 relative">
            <div className="w-20 h-20 mb-2">
              <Image 
                src="/logoInstaFitCore.jpg" 
                alt="InstaFitCore Logo" 
                width={90} 
                height={90} 
                className="object-contain rounded-full" 
                priority 
              />
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
              {mode === "login" ? "Welcome Back" : mode === "register" ? "Create Account" : "Password Reset"}
            </h2>
            <p className="text-sm text-gray-500 mb-2">
              {mode === "login" ? "Sign in to access your services" : mode === "register" ? "Get started in seconds" : "Enter your email address"}
            </p>

            {/* Close Button */}
            <button 
              onClick={handleClose} 
              className="absolute top-0 right-0 p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-full hover:bg-gray-50"
              aria-label="Close authentication modal"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Alerts */}
          {error && <div className="mb-4 p-3 bg-red-100 text-red-700 font-medium rounded-lg border border-red-200">{error}</div>}
          {message && <div className="mb-4 p-3 bg-green-100 text-green-700 font-medium rounded-lg border border-green-200">{message}</div>}

          {/* LOGIN FORM */}
          {mode === "login" && (
            <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
              <div className="space-y-4">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <IconWrapper Icon={Mail} />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-1" 
                      style={{ focusRingColor: BRAND_COLOR }}
                      placeholder="you@example.com" 
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>
                
                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <IconWrapper Icon={Lock} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-1" 
                      style={{ focusRingColor: BRAND_COLOR }}
                      placeholder="••••••••"
                      autoComplete="current-password"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1" aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={authLoading} 
                className="w-full mt-6 py-2 rounded-lg font-bold text-white shadow-md disabled:opacity-50 transition-all hover:brightness-105" 
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {authLoading ? "Signing In..." : "Sign In"}
              </button>

              {/* Footer Links */}
              <div className="flex flex-col items-center justify-center mt-4 text-sm space-y-2">
                <button type="button" onClick={() => { setMode("forgot"); clearAlerts(); }} className="text-gray-600 hover:text-black hover:underline transition-colors">Forgot Password?</button>
                <div className="text-center">
                  <span className="text-gray-600">Don't have an account? </span>
                  <button type="button" onClick={() => { setMode("register"); clearAlerts(); }} className="text-black font-semibold hover:underline" style={{ color: BRAND_COLOR }}>Sign Up</button>
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === "register" && (
            <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
              <div className="space-y-4">
                {/* Name Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative">
                    <IconWrapper Icon={User} />
                    <input 
                      type="text" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-1" 
                      style={{ focusRingColor: BRAND_COLOR }}
                      placeholder="John Doe"
                      required
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <div className="relative">
                    <IconWrapper Icon={Mail} />
                    <input 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-1" 
                      style={{ focusRingColor: BRAND_COLOR }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative">
                    <IconWrapper Icon={Lock} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-1" 
                      style={{ focusRingColor: BRAND_COLOR }}
                      placeholder="Min 6 characters" 
                      autoComplete="new-password"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1" aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative">
                    <IconWrapper Icon={Lock} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      value={confirm} 
                      onChange={(e) => setConfirm(e.target.value)} 
                      className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-1" 
                      style={{ focusRingColor: BRAND_COLOR }}
                      placeholder="Confirm your password"
                      autoComplete="new-password"
                      required
                    />
                    {/* Re-use the same toggle button */}
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1" aria-label={showPassword ? "Hide password" : "Show password"}>
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={authLoading} 
                className="w-full mt-6 py-2 rounded-lg font-bold text-white shadow-md disabled:opacity-50 transition-all hover:brightness-105" 
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {authLoading ? "Signing Up..." : "Sign Up"}
              </button>

              {/* Footer Links */}
              <div className="mt-4 text-center">
                <span className="text-sm text-gray-600">Already have an account? </span>
                <button type="button" onClick={() => { setMode("login"); clearAlerts(); }} className="text-black font-semibold hover:underline" style={{ color: BRAND_COLOR }}>Sign In</button>
              </div>
            </form>
          )}

          {/* FORGOT PASSWORD FORM */}
          {mode === "forgot" && (
            <form onSubmit={(e) => { e.preventDefault(); handleForgot(); }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="relative">
                  <IconWrapper Icon={Mail} />
                  <input 
                    type="email" 
                    value={forgotEmail} 
                    onChange={(e) => setForgotEmail(e.target.value)} 
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-offset-1" 
                    style={{ focusRingColor: BRAND_COLOR }}
                    placeholder="Enter your email to reset password"
                    required
                  />
                </div>
              </div>
              
              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={authLoading} 
                className="w-full mt-2 py-2 rounded-lg font-bold text-white shadow-md disabled:opacity-50 transition-all hover:brightness-105" 
                style={{ backgroundColor: BRAND_COLOR }}
              >
                {authLoading ? "Sending..." : "Send Reset Email"}
              </button>
              
              {/* Footer Links */}
              <div className="mt-4 text-center">
                <button type="button" onClick={() => { setMode("login"); clearAlerts(); }} className="text-black font-semibold hover:underline" style={{ color: BRAND_COLOR }}>Back to Sign In</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}