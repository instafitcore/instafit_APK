// FullNavbar.tsx (Combined Desktop + Mobile Navbar)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import {
  User as UserIcon,
  Menu,
  X,
  Search,
  MapPin,
  Heart,
  ShoppingCart,
} from "lucide-react";
import { usePathname } from "next/navigation";
import AuthModal from "@/components/AuthModal";

type Category = {
  id: number;
  category: string;
  image_url: string | null;
};

type AuthMode = "login" | "register" | "forgot";

export default function FullNavbar() {
  // Shared states
  const [user, setUser] = useState<any>(null);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartCount, setCartCount] = useState(0);

  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const pathname = usePathname();

  // Desktop specific
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Mobile specific
  const [mobileOpen, setMobileOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Scroll shadow behaviour
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch categories (desktop only)
  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, category, image_url")
        .eq("is_active", true)
        .order("id", { ascending: true });

      setCategories(data || []);
      setLoadingCategories(false);
    };

    fetchCategories();
  }, []);

  // User + auth listener
  useEffect(() => {
    const init = async () => {
      const res = await supabase.auth.getUser();
      setUser(res.data.user ?? null);
    };
    init();

    const { data } = supabase.auth.onAuthStateChange((_e, session) =>
      setUser(session?.user ?? null)
    );

    return () => data.subscription.unsubscribe();
  }, []);

  // Fetch wishlist + cart counts
  useEffect(() => {
    if (!user) return;

    const fetchCounts = async () => {
      const wish = await supabase
        .from("wishlist")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setWishlistCount(wish.count || 0);

      const cart = await supabase
        .from("cart")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id);
      setCartCount(cart.count || 0);
    };

    fetchCounts();
  }, [user]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowProfileDropdown(false);
  };

  return (
    <>
      {/* ---------------------------- NAVBAR ---------------------------- */}
      <header
        className={`bg-white border-b border-gray-200 sticky top-0 z-50 transition-shadow duration-300 ${
          isScrolled ? "shadow-md" : ""
        }`}
      >
        {/* DESKTOP NAVBAR */}
        <div className="hidden md:flex max-w-7xl mx-auto px-4 py-3 items-center gap-6">

          {/* Logo */}
          <Link href="/site" className="flex items-center gap-3 shrink-0">
            <div className="w-14 h-14 shrink-0">
              <Image
                src="/logoInstaFit.jpg"
                alt="InstaFitCore Logo"
                width={66}
                height={66}
                className="w-full h-full object-contain"
              />
            </div>
            <div className="leading-tight hidden sm:block">
              <div className="text-xl font-bold" style={{ color: "#8ed26b" }}>
                INSTAFITCORE
              </div>
              <div className="text-xs text-black">One Stop Solutions</div>
            </div>
          </Link>

          {/* Search */}
          <div className="flex-1 max-w-md mx-4 hidden lg:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="What are you looking for?"
                className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-[#8ed26b]"
              />
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden lg:flex items-center gap-6">
            <Link href="/site">Home</Link>
            <Link href="/site/services">Services</Link>
            <Link href="/site/about">About</Link>
            <Link href="/site/contact">Contact</Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4 shrink-0">
            {!user ? (
              <button
                onClick={() => {
                  setMode("login");
                  setShowAuth(true);
                }}
                className="hidden sm:block px-4 py-2 rounded-full text-white font-semibold"
                style={{ backgroundColor: "#8ed26b" }}
              >
                Sign Up / Sign In
              </button>
            ) : (
              <div className="flex items-center gap-4">

                <Link href="/site/wishlist" className="relative">
                  <Heart className="w-6 h-6 text-gray-700" />
                  {wishlistCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </Link>

                <Link href="/site/cart" className="relative">
                  <ShoppingCart className="w-6 h-6 text-gray-700" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs px-2 rounded-full">
                      {cartCount}
                    </span>
                  )}
                </Link>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    onClick={() =>
                      setShowProfileDropdown(!showProfileDropdown)
                    }
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                  >
                    <UserIcon className="w-5 h-5" />
                  </button>

                  {showProfileDropdown && (
                    <div className="absolute right-0 mt-2 w-48 bg-white border shadow-xl rounded-lg">
                      <Link
                        href="/site/profile"
                        className="flex px-4 py-3 gap-2"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <UserIcon className="w-4 h-4 text-green-600" />
                        Profile
                      </Link>

                      <Link
                        href="/site/order-tracking"
                        className="flex px-4 py-3 gap-2"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <MapPin className="w-4 h-4 text-green-600" />
                        Track Order
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className="flex w-full px-4 py-3 gap-2"
                      >
                        <X className="w-4 h-4 text-green-600" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ------------------ MOBILE NAVBAR ------------------ */}
<div className="flex md:hidden items-center justify-between px-4 py-3 bg-white border-b shadow-sm sticky top-0 z-50">

  {/* LOGO */}
  <Link href="/site" className="flex items-center gap-2">
    <div className="w-12 h-12 relative">
      <Image
        src="/logoInstaFit.jpg"
        alt="InstaFitCore Logo"
        fill
        className="object-contain"
      />
    </div>
    <span className="font-bold text-lg" style={{ color: "#8ed26b" }}>
      INSTAFITCORE
    </span>
  </Link>

  {/* RIGHT ICONS */}
  <div className="flex items-center gap-4">

    {/* Wishlist */}
    {user && (
      <Link href="/site/wishlist" className="relative p-2 rounded-full hover:bg-gray-100 transition">
        <Heart className="w-6 h-6 text-gray-700" />
        {wishlistCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
            {wishlistCount}
          </span>
        )}
      </Link>
    )}

    {/* Cart */}
    {user && (
      <Link href="/site/cart" className="relative p-2 rounded-full hover:bg-gray-100 transition">
        <ShoppingCart className="w-6 h-6 text-gray-700" />
        {cartCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            {cartCount}
          </span>
        )}
      </Link>
    )}

    {/* Mobile Menu Button */}
    <button
      onClick={() => setMobileOpen(true)}
      className="p-2 rounded-full hover:bg-gray-100 transition"
      aria-label="Open menu"
    >
      <Menu className="w-6 h-6 text-gray-700" />
    </button>
  </div>
</div>


        {/* MOBILE DRAWER */}
        {mobileOpen && (
          <div
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 bg-black/40 z-40"
          />
        )}

        <div
          className={`fixed top-0 right-0 h-full w-3/4 bg-white z-50 shadow-xl transition-transform duration-300 ${
            mobileOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          {/* Drawer Header */}
          <div className="flex justify-between px-4 py-4 border-b">
            <span className="text-lg font-semibold">Menu</span>
            <button onClick={() => setMobileOpen(false)}>
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="flex items-center border rounded-lg px-3 py-2 gap-2">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                placeholder="Search here..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full outline-none text-sm"
              />
            </div>
          </div>

          {/* Drawer Links */}
          <nav className="px-4 flex flex-col gap-3">
            <Link href="/site" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/site/services" onClick={() => setMobileOpen(false)}>Our Services</Link>
            <Link href="/site/about" onClick={() => setMobileOpen(false)}>About Us</Link>
            <Link href="/site/contact" onClick={() => setMobileOpen(false)}>Contact Us</Link>
            <Link href="/site/order-tracking" onClick={() => setMobileOpen(false)}>Order Tracking</Link>
          </nav>

          {/* Auth Button */}
          {!user && (
            <div className="px-4 mt-6">
              <button
                onClick={() => {
                  setMode("login");
                  setShowAuth(true);
                  setMobileOpen(false);
                }}
                className="w-full py-3 rounded-full font-semibold text-white"
                style={{ backgroundColor: "#8ed26b" }}
              >
                Sign Up / Sign In
              </button>
            </div>
          )}

          {/* Bottom Icons */}
          {user && (
            <div className="mt-8 px-6 flex justify-between border-t pt-4">
              <Link href="/site/profile"><UserIcon /></Link>
              <Link href="/site/order-tracking"><MapPin /></Link>
            </div>
          )}
        </div>
      </header>

      {/* Category carousel only on homepage */}
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

      {/* Auth Modal */}
      <AuthModal
        showAuth={showAuth}
        setShowAuth={setShowAuth}
        mode={mode}
        setMode={setMode}
      />
    </>
  );
}
