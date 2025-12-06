"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import { User as UserIcon, Menu, X, Search, Mail, Lock, Eye, EyeOff, Heart, ShoppingCart } from "lucide-react";
import { usePathname } from "next/navigation";

type Category = {
  id: number;
  category: string;
  image_url: string | null;
};

type AuthMode = "login" | "register" | "forgot";

export default function FullNavbar() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [search, setSearch] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const [cartCount, setCartCount] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);

  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [name, setName] = useState("");
  const [forgotEmail, setForgotEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from("categories")
        .select("id, category, image_url")
        .eq("is_active", true)
        .order("id", { ascending: true });

      if (error) {
        console.error("Error fetching categories:", error.message);
        setCategories([]);
      } else {
        setCategories(data || []);
      }
      setLoadingCategories(false);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    let subscription: any;
    const init = async () => {
      const res = await supabase.auth.getUser();
      setUser(res.data.user ?? null);

      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        setUser(session?.user ?? null);
      });
      subscription = data?.subscription ?? data;
    };
    init();
    return () => subscription?.unsubscribe?.();
  }, []);

  // Fetch cart & wishlist items
  useEffect(() => {
    if (!user) {
      setCartCount(0);
      setWishlistCount(0);
      return;
    }

    const fetchCounts = async () => {
      // Cart Count
      const { count: cartTotal } = await supabase
        .from("cart")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setCartCount(cartTotal || 0);

      // Wishlist Count
      const { count: wishlistTotal } = await supabase
        .from("wishlist")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);

      setWishlistCount(wishlistTotal || 0);
    };

    fetchCounts();
  }, [user]);

  const clearAlerts = () => {
    setMessage(null);
    setError(null);
  };

  const handleLogin = async () => {
    clearAlerts();
    if (!email || !password) return setError("Please enter email and password");
    setAuthLoading(true);
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) setError(authError.message || "Login failed");
      else setTimeout(() => setShowAuth(false), 700);
    } catch (err: any) {
      setError(err?.message || "Login error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleRegister = async () => {
    clearAlerts();
    if (!name.trim()) return setError("Full name is required");
    if (!email) return setError("Please enter an email");
    if (!password || password.length < 6) return setError("Password must be at least 6 characters");
    if (password !== confirm) return setError("Passwords do not match");

    setAuthLoading(true);
    try {
      const { data, error: signError } = await supabase.auth.signUp({ email, password });
      if (signError) setError(signError.message || "Signup failed");
      else setTimeout(() => setShowAuth(false), 900);
    } catch (err: any) {
      setError(err?.message || "Signup error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgot = async () => {
    clearAlerts();
    if (!forgotEmail) return setError("Enter your email to reset password");
    setAuthLoading(true);
    try {
      const { data, error: resetError } = await supabase.auth.resetPasswordForEmail(forgotEmail);
      if (resetError) setError(resetError.message || "Failed to send reset email");
      else {
        setMessage("Password reset email sent");
        setTimeout(() => {
          setMode("login");
          setForgotEmail("");
        }, 1200);
      }
    } catch (err: any) {
      setError(err?.message || "Reset error");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowProfileDropdown(false);
    setUser(null);
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 shadow-lg sticky top-0 z-50 transition-shadow duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* ⭐ UPDATED LOGO SECTION FOR BETTER ALIGNMENT AND BRANDING ⭐
            
            1. The outer Link uses 'flex items-center' for vertical alignment.
            2. The Image component now uses the correct size to make the logo icon stand out.
            3. The site name and tagline are explicitly added next to the image.
          */}
          <Link href="/site" className="flex items-center gap-3 shrink-0">
            {/* Logo Image/Icon Holder */}
            <div className="w-14 h-14 shrink-0">
              <Image
                src="/logoInstaFit.jpg"
                alt="InstaFitCore Logo"
                width={66}
                height={66}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Text Branding */}
            <div className="leading-tight hidden sm:block">
              <div className="text-xl font-bold" style={{ color: '#8ed26b' }}>INSTAFITCORE</div>
              <div className="text-xs text-black">One Stop Solutions</div>
            </div>
          </Link>


          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-4 hidden md:block"> {/* Hide search on small screens for better layout */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6"> {/* Use lg:flex for nav links to save space */}
            <Link href="/site" className="text-gray-700 font-medium hover:text-green-600 transition-colors duration-200">
              Home
            </Link>
            <Link href="/site/services" className="text-gray-700 font-medium hover:text-green-600 transition-colors duration-200">
              Services
            </Link>
            <Link href="/site/about" className="text-gray-700 font-medium hover:text-green-600 transition-colors duration-200">
              About
            </Link>
            <Link href="/site/contact" className="text-gray-700 font-medium hover:text-green-600 transition-colors duration-200">
              Contact
            </Link>
            <Link href="/site/order-tracking" className="text-gray-700 font-medium hover:text-green-600 transition-colors duration-200">
              Track
            </Link>
          </nav>

          {/* Wishlist, Cart, Auth/Profile, and Mobile Menu */}
          <div className="flex items-center gap-4 shrink-0">

            {/* Conditional Block: Show Sign In button OR Icons/Profile */}
            {!user ? (
              // Renders when NOT logged in
              <button
                onClick={() => {
                  clearAlerts();
                  setMode("login");
                  setShowAuth(true);
                }}
                className="hidden sm:block bg-gradient-to-r text-white px-4 py-2 rounded-full font-semibold text-sm transition-all duration-200 shadow-md whitespace-nowrap"
                style={{ backgroundColor: "#8ed26b" }}
              >
                Sign Up / Sign In
              </button>

            ) : (
              // Renders when LOGGED IN: Wishlist, Cart, and Profile
              <div className="flex items-center gap-4">

                {/* Wishlist - Only visible when logged in */}
                <Link
                  href="/site/wishlist"
                  className="relative hover:scale-110 transition"
                >
                  <Heart className="w-6 h-6 text-gray-700" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                {/* Cart - Only visible when logged in */}
                <Link
                  href="/site/cart"
                  className="relative hover:scale-110 transition"
                >
                  <ShoppingCart className="w-6 h-6 text-gray-700" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shadow-sm"
                    title="Profile"
                  >
                    <UserIcon className="w-5 h-5 text-gray-700" />
                  </button>
                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-xl z-50 animate-in slide-in-from-top-2">
                      <Link
                        href="/site/profile"
                        onClick={() => setShowProfileDropdown(false)}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <UserIcon className="w-4 h-4" /> Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center gap-2"
                      >
                        <X className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md hover:bg-gray-100 transition-colors"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-inner">
            <div className="px-4 py-4 flex flex-col gap-3">
              {/* Mobile Search */}
              <div className="relative mb-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-gray-50 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <Link href="/site" className="py-2 text-gray-700 hover:text-green-600" onClick={() => setMobileOpen(false)}>
                Home
              </Link>
              <Link href="/site/services" className="py-2 text-gray-700 hover:text-green-600" onClick={() => setMobileOpen(false)}>
                Our Services
              </Link>
              <Link href="/site/about" className="py-2 text-gray-700 hover:text-green-600" onClick={() => setMobileOpen(false)}>
                About Us
              </Link>
              <Link href="/site/contact" className="py-2 text-gray-700 hover:text-green-600" onClick={() => setMobileOpen(false)}>
                Contact Us
              </Link>
              <Link href="/site/order-tracking" className="py-2 text-gray-700 hover:text-green-600" onClick={() => setMobileOpen(false)}>
                Order Tracking
              </Link>
              {!user && (
                <button
                  onClick={() => {
                    clearAlerts();
                    setMode("login");
                    setShowAuth(true);
                    setMobileOpen(false);
                  }}
                  className="mt-2 py-3 text-white rounded-full font-semibold transition-all duration-200"
                  style={{ backgroundColor: "#8ed26b" }}
                >
                  Sign Up / Sign In
                </button>

              )}
            </div>
          </div>
        )}

        {/* Categories - Only on Home Page */}
        {pathname === "/site" && (
          <div className="bg-gray-50 border-t border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-6 overflow-x-auto">
              <div className="flex gap-12 justify-center min-w-max">
                {loadingCategories ? (
                  <div className="text-center text-gray-500">Loading categories...</div>
                ) : (
                  categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/site/category/${cat.id}`}
                      className="flex flex-col items-center group cursor-pointer hover:scale-105 transition-transform duration-200 px-2"
                    >
                      <div className={`rounded-full overflow-hidden bg-gradient-to-br from-green-100 to-blue-100 shadow-md flex items-center justify-center transition-all duration-500 ${isScrolled ? "w-0 h-0 p-0 opacity-0" : "w-20 h-20 p-2 opacity-100"}`}>
                        {cat.image_url && !isScrolled && (
                          <Image
                            src={cat.image_url}
                            alt={cat.category}
                            width={80}
                            height={80}
                            className="w-full h-full object-cover rounded-full"
                          />
                        )}
                      </div>
                      <p className="font-semibold text-gray-800 text-center mt-3 text-sm group-hover:text-green-600 transition-colors duration-200">
                        {cat.category}
                      </p>
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Auth Modal */}
      {showAuth && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowAuth(false)} />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col items-center mb-6 relative">
                {/* Logo */}
                <div className="w-28 h-28 mb-4">  {/* Increased from w-20 h-20 */}
                  <Image
                    src="/logoInstaFitCore.jpg"
                    alt="InstaFitCore Logo"
                    width={212}  // match the div size
                    height={212} // match the div size
                    className="object-contain rounded-full"
                  />
                </div>

                {/* Heading */}
                <h2 className="text-2xl font-bold text-gray-900">
                  {mode === "login" ? "Sign In" : mode === "register" ? "Sign Up" : "Reset Password"}
                </h2>

                {/* Close button */}
                <button
                  onClick={() => setShowAuth(false)}
                  className="absolute top-0 right-0 mt-2 mr-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>


              {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
              {message && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{message}</div>}

              {mode === "login" && (
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(); }}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2 rounded-lg font-semibold disabled:opacity-50 transition-all duration-200"
                    style={{ backgroundColor: "#8ed26b", color: "white" }}
                  >
                    {authLoading ? "Signing In..." : "Sign In"}
                  </button>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => { setMode("forgot"); clearAlerts(); }}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="mt-2 text-center">
                    <span className="text-sm text-gray-600">Don't have an account? </span>
                    <button
                      type="button"
                      onClick={() => { setMode("register"); clearAlerts(); }}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Sign Up
                    </button>
                  </div>
                </form>
              )}

              {mode === "register" && (
                <form onSubmit={(e) => { e.preventDefault(); handleRegister(); }}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Create a password (min 6 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirm}
                        onChange={(e) => setConfirm(e.target.value)}
                        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Confirm your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2 rounded-lg font-semibold disabled:opacity-50 transition-all duration-200"
                    style={{ backgroundColor: "#8ed26b", color: "white" }}
                  >
                    {authLoading ? "Signing Up..." : "Sign Up"}
                  </button>

                  <div className="mt-4 text-center">
                    <span className="text-sm text-gray-600">Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => { setMode("login"); clearAlerts(); }}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Sign In
                    </button>
                  </div>
                </form>
              )}

              {mode === "forgot" && (
                <form onSubmit={(e) => { e.preventDefault(); handleForgot(); }}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="Enter your email to reset password"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-2 rounded-lg font-semibold disabled:opacity-50 transition-all duration-200"
                    style={{ backgroundColor: "#8ed26b", color: "white" }}
                  >
                    {authLoading ? "Sending..." : "Send Reset Email"}
                  </button>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => { setMode("login"); clearAlerts(); }}
                      className="text-sm text-green-600 hover:underline"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}