"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import AuthModal from "@/components/AuthModal";
import useUser from "@/hooks/useUser";
import { PackageCheck } from "lucide-react";
import { MapPin } from "lucide-react";
import {
  User as UserIcon,
  CircleX,
  Loader2,
  Menu,
  X,
  Search,
  Heart,
  ShoppingCart,
  Settings,
  ChevronRight,
} from "lucide-react";

type SearchResult = {
  id: string | number;
  name: string;
  type: "category" | "subcategory" | "service_type";
  parent_category?: string;
  customUrl?: string;
};

type AuthMode = "login" | "register";

export default function FullNavbar() {
  const { user } = useUser();
  const pathname = usePathname();
  const AUTO_LOGOUT_TIME = 4 * 60 * 60 * 1000; // 4 hours in ms

  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  // Search states
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // STATIC CATEGORIES
  const staticCategories = [
    {
      id: "furniture-service",
      name: "Furniture Service",
      subtitle: "Assembly & repair",
      image_url: "/furniture-service.jpeg",
      link: "/site/services",
      subServices: [
        "Furniture Installation",
        "Furniture Dismantling",
        "Furniture Repair",
        "Re-installation",
        "Furniture Relocation Support",
      ],
    },
    {
      id: "custom-furniture",
      name: "Modular Furniture",
      subtitle: "Custom design & install",
      image_url: "/custom-furniture.jpg",
      link: "/site/services?topLevel=Customized%20Modular%20Furniture",
      subServices: [
        "Modular Bed",
        "Modular Wardrobe",
        "Wall Unit / TV Unit",
        "Sofa – Customized Size & Fabric Options",
        "Study Table & Storage",
      ],
    },
    {
      id: "custom-kitchen",
      name: "Modular Kitchen",
      subtitle: "Design, build & install",
      image_url: "/custom-kitchen.jpg",
      link: "/site/services?topLevel=Customized%20Modular%20Kitchen",
      subServices: [],
    },
    {
      id: "packer-movers",
      name: "Packer and Movers",
      subtitle: "Safe Relocation",
      image_url: "/pak.jpg",
      link: "/site/services?topLevel=Relocation%20Services",
      subServices: [],
    },
    {
      id: "b2b-request",
      name: "B2B Services",
      subtitle: "Enterprise & bulk services",
      image_url: "/b2.jpg",
      link: "/site/services?topLevel=B2B%20Services",
      subServices: [],
    },
    {
      id: "ask-expert",
      name: "Ask the Expert",
      subtitle: "Expert Guidance",
      image_url: "/exp.jpg",
      link: "/site/contact",
      subServices: [],
    },
  ];

  useEffect(() => {
    if (!user) return;

let logoutTimer: ReturnType<typeof setTimeout>;

    const resetTimer = () => {
      if (logoutTimer) clearTimeout(logoutTimer);

      logoutTimer = setTimeout(async () => {
        await supabase.auth.signOut();
        router.push("/site");
      }, AUTO_LOGOUT_TIME);
    };

    // User activity events
    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
    ];

    events.forEach((event) =>
      window.addEventListener(event, resetTimer)
    );

    // Start timer initially
    resetTimer();

    return () => {
      if (logoutTimer) clearTimeout(logoutTimer);
      events.forEach((event) =>
        window.removeEventListener(event, resetTimer)
      );
    };
  }, [user, router]);


  // Close search dropdown outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset states on route change
  useEffect(() => {
    setShowDropdown(false);
    setSearch("");
    setMobileOpen(false);
  }, [pathname]);

  // Search logic
  useEffect(() => {
    const value = search.trim().toLowerCase();
    if (!value) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);

    const timer = setTimeout(async () => {
      setIsSearching(true);

      const results: SearchResult[] = [];

      // Fixed Services Search
      if ("installation".startsWith(value) || value.startsWith("ins")) {
        results.push({ id: "install", name: "Installation Services", type: "service_type", customUrl: "/site/services?typeId=1" });
      }
      if ("repair".startsWith(value) || value.includes("fix") || value.includes("maint")) {
        results.push({ id: "repair", name: "Repair & Maintenance Services", type: "service_type", customUrl: "/site/services?typeId=3" });
      }
      if ("dismantling".startsWith(value) || value.includes("remove")) {
        results.push({ id: "dismantle", name: "Dismantling Services", type: "service_type", customUrl: "/site/services?typeId=2" });
      }

      // Database search
      try {
        const [catRes, subRes] = await Promise.all([
          supabase.from("categories").select("id, category").ilike("category", `%${value}%`).limit(3),
          supabase.from("subcategories").select("id, subcategory, category").ilike("subcategory", `%${value}%`).limit(5),
        ]);

        const dbResults: SearchResult[] = [
          ...(catRes.data ?? []).map((c): SearchResult => ({
            id: c.id,
            name: c.category,
            type: "category",
          })),
          ...(subRes.data ?? []).map((s): SearchResult => ({
            id: s.id,
            name: s.subcategory,
            type: "subcategory",
            parent_category: s.category,
          })),
        ];

        setSearchResults([...results, ...dbResults]);
      } catch (err) {
        console.error(err);
        setSearchResults(results);
      } finally {
        setIsSearching(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [search]);

  const [categoryShrunk, setCategoryShrunk] = useState(false);

  const lastScrollY = useRef(0);

  useEffect(() => {
    let isShrunk = false;

    const handleScroll = () => {
      const currentY = window.scrollY;

      // Header shadow (simple, stable)
      setIsScrolled(currentY > 80);

      // CATEGORY IMAGES — hysteresis
      if (!isShrunk && currentY > 120) {
        isShrunk = true;
        setCategoryShrunk(true);
      }

      if (isShrunk && currentY < 40) {
        isShrunk = false;
        setCategoryShrunk(false);
      }

      lastScrollY.current = currentY;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfileOpen(false);
    router.push("/site"); // Redirect to homepage after logout
  };

  return (
    <>
      <header className={`bg-white border-b border-gray-200 sticky top-0 z-50 transition-all duration-300 ${isScrolled ? "shadow-lg" : ""}`}>
        <div className="flex max-w-7xl mx-auto px-4 py-4 md:py-5 items-center gap-4 md:gap-6">
          <Link href="/site" className="flex items-center gap-1 shrink-0">
            {/* Logo Icon */}
            <div className="w-12 h-12 md:w-14 md:h-14 relative flex-shrink-0">
              <Image
                src="/logoicon.png"
                alt="Instafitcore Logo"
                width={64}
                height={64}
                priority
                className="w-full h-full object-contain"
              />
            </div>

            {/* Brand Text + Location */}
            <div className="leading-tight hidden sm:block text-right">
              {/* Brand Name */}
              <h1 className="text-lg md:text-xl font-extrabold tracking-wide text-[#90ca2e]">
                INSTAFITCORE
              </h1>

              {/* Location / Tagline */}
              <div className="flex flex-col gap-0.5 text-[11px] md:text-xs font-medium text-[#8ed26b]/80 items-end">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <p className="text-[11px] md:text-xs text-gray-500 font-bold tracking-wide">
                    One Stop Solutions
                  </p>
                </div>
              </div>
            </div>
          </Link>

          {/* SEARCH BOX - Made bigger on mobile */}
          <div className="flex-1 max-w-md md:max-w-lg mx-2 md:mx-4 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => search.length >= 2 && setShowDropdown(true)}
                placeholder="Search Installations, Repairs..."
                className="w-full pl-10 pr-10 py-3 md:py-2 rounded-full border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-[#8ed26b] outline-none text-sm md:text-base"
              />
              {search && <CircleX className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer" onClick={() => setSearch("")} />}
              {isSearching && <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
            </div>

            {showDropdown && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden z-[100] max-h-60 overflow-y-auto">
                {searchResults.length > 0 ? (
                  searchResults.map((res) => (
                    <Link
                      key={`${res.type}-${res.id}`}
                      href={
                        res.customUrl ||
                        (res.type === "category"
                          ? `/site/services?category=${encodeURIComponent(res.name)}`
                          : res.type === "subcategory"
                            ? `/site/services?subcategory=${encodeURIComponent(res.name)}&category=${encodeURIComponent(res.parent_category || "")}`
                            : `/site/services`
                        )
                      }
                      className={`flex flex-col px-4 py-3 hover:bg-[#f0f9eb] border-b last:border-0 ${res.type === "service_type" ? "bg-green-50/50" : ""}`}
                    >
                      <div className="flex items-center gap-2">
                        {res.type === "service_type" && <Settings className="w-3 h-3 text-[#8ed26b]" />}
                        <span className={`text-sm font-semibold ${res.type === "service_type" ? "text-[#8ed26b]" : "text-gray-800"}`}>{res.name}</span>
                      </div>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        {res.type === "service_type" ? "Department" : res.type === "category" ? "Category" : `In ${res.parent_category}`}
                      </span>
                    </Link>
                  ))
                ) : !isSearching && <div className="p-4 text-center text-sm text-gray-500">No results found</div>}
              </div>
            )}
          </div>

          {/* NAV LINKS - Hidden on mobile, shown in overlay */}
          <nav className="hidden lg:flex items-center gap-6 font-medium text-gray-700">
            <Link href="/site" className="hover:text-[#8ed26b]">Home</Link>
            <Link href="/site/services" className="hover:text-[#8ed26b]">Services</Link>
            <Link href="/site/about" className="hover:text-[#8ed26b]">About Us</Link>
            <Link href="/site/contact" className="hover:text-[#8ed26b]">Contact Us</Link>
          </nav>

          {/* USER / PROFILE - Icons hidden on mobile, moved to menu */}
          <div className="flex items-center gap-2 md:gap-4">
            {!user ? (
              <button onClick={() => { setMode("login"); setShowAuth(true); }} className="px-4 py-2 md:px-5 md:py-2 rounded-full text-white font-semibold bg-[#8ed26b] text-sm md:text-base">Sign In</button>
            ) : (
              <div className="flex items-center gap-2 md:gap-4">
                {/* Order Tracking, Wishlist, Cart - Hidden on mobile, shown in menu */}
                <div className="hidden md:flex gap-2 md:gap-4">
                  {/* Order Tracking Button */}
                  <Link
                    href="/site/order-tracking"
                    title="Order Tracking"
                    className="hidden md:flex items-center gap-2 px-4 py-1.5 border-2 border-[#8ed26b] text-[#8ed26b] hover:bg-[#8ed26b] hover:text-white rounded-full text-sm font-bold transition-all duration-300"
                  >
                    <span>Order Tracking</span>
                  </Link>

                  {/* Wishlist & Cart Icons */}
                  <div className="hidden md:flex gap-2">
                    <Link href="/site/wishlist" title="Wishlist" className="p-2">
                      <Heart className="w-5 h-5 md:w-6 md:h-6 text-gray-700 hover:text-[#8ed26b] transition-colors" />
                    </Link>
                    <Link href="/site/cart" title="Cart" className="p-2">
                      <ShoppingCart className="w-5 h-5 md:w-6 md:h-6 text-gray-700 hover:text-[#8ed26b] transition-colors" />
                    </Link>
                  </div>
                </div>

                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileOpen(!profileOpen)} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 hover:border-[#8ed26b]">
                    <UserIcon className="w-4 h-4 md:w-5 md:h-5 text-gray-600" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden z-[9999]">
                      <div className="px-5 py-4 border-b bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#8ed26b]/20 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-[#8ed26b]" />
                          </div>
                          <div className="leading-tight">
                            <p className="text-sm font-semibold text-gray-800">{user?.user_metadata?.full_name || "My Account"}</p>
                            <p className="text-xs text-gray-500 truncate max-w-[160px]">{user?.email}</p>
                          </div>
                        </div>
                      </div>

                      <div className="py-2">
                        <Link href="/site/profile" onClick={() => setProfileOpen(false)} className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-[#f0f9eb]">
                          <UserIcon className="w-4 h-4 text-gray-500" /> Profile
                        </Link>
                      </div>

                      <div className="border-t">
                        <button onClick={handleLogout} className="flex items-center gap-3 w-full px-5 py-3 text-sm text-red-600 hover:bg-red-50">
                          <X className="w-4 h-4" /> Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2">
              <Menu className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>
        </div>

        {/* MOBILE OVERLAY */}
        <div className={`fixed inset-0 z-[100] bg-white transition-transform ${mobileOpen ? "translate-x-0" : "translate-x-full"} lg:hidden`}>
          <div className="p-4 flex justify-between items-center border-b">
            <span className="font-bold text-[#8ed26b]">Menu</span>
            <X className="w-6 h-6 cursor-pointer" onClick={() => setMobileOpen(false)} />
          </div>
          <div className="p-6 flex flex-col gap-6">
            <Link href="/site" className="text-lg font-semibold" onClick={() => setMobileOpen(false)}>Home</Link>
            <Link href="/site/services" className="text-lg font-semibold" onClick={() => setMobileOpen(false)}>Services</Link>
            <Link href="/site/about" className="text-lg font-semibold" onClick={() => setMobileOpen(false)}>About Us</Link>
            <Link href="/site/contact" className="text-lg font-semibold" onClick={() => setMobileOpen(false)}>Contact Us</Link>

            {user && (
              <div className="mt-8 flex flex-col gap-4 border-t pt-6">
                <Link href="/site/profile" className="text-gray-800 text-base font-medium" onClick={() => setMobileOpen(false)}>Profile</Link>
                <Link href="/site/order-tracking" className="text-gray-800 text-base font-medium" onClick={() => setMobileOpen(false)}>Order Tracking</Link>
                <Link href="/site/wishlist" className="text-gray-800 text-base font-medium" onClick={() => setMobileOpen(false)}>Wishlist</Link>
                <Link href="/site/cart" className="text-gray-800 text-base font-medium" onClick={() => setMobileOpen(false)}>Cart</Link>
                <button onClick={handleLogout} className="text-left text-red-600 text-base font-medium">Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CATEGORY BAR (Home only) */}
      {pathname?.replace(/\/$/, "") === "/site" && (
        <div
          className={`sticky top-[72px] z-40 bg-white border-b border-gray-100 shadow-sm transition-all duration-300 overflow-visible ${categoryShrunk ? "py-6" : "py-4"
            }`}
        >

          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="flex justify-center gap-6 md:gap-16 lg:gap-24 transition-all duration-300
  overflow-x-auto md:overflow-x-visible
  scrollbar-hide -mx-4 px-4">

              {staticCategories.map((item) => (
                <div key={item.id} className="relative group flex flex-col items-center">
                  {/* Category Link */}
                  <Link
                    href={item.link}
                    className="flex flex-col items-center transition-all duration-300"
                  >
                    {/* Image Container */}
                    <div
                      className={`rounded-full overflow-hidden border border-gray-100 flex items-center justify-center transition-all duration-300 ease-in-out shadow-sm
                  ${categoryShrunk
                          ? "w-0 h-0 opacity-0 mb-1 scale-0"
                          : "w-16 h-16 md:w-20 md:h-20 lg:w-24 lg:h-24 mb-2 group-hover:scale-105 group-hover:border-[#8ed26b]"
                        }`}
                    >
                      <Image
                        src={item.image_url}
                        alt={item.name}
                        width={80}
                        height={80}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="h-[42px] flex flex-col items-center justify-center">
                      <p
                        className={`text-center text-[11px] md:text-sm font-semibold text-gray-800
    whitespace-nowrap overflow-hidden text-ellipsis max-w-[110px] md:max-w-[140px]
    transition-all duration-300 group-hover:text-[#8ed26b]
    ${categoryShrunk ? "mt-0" : "mt-1"}`}
                      >
                        {item.name}
                      </p>

                      <p
                        className="text-[10px] md:text-xs text-gray-500 font-medium
    whitespace-nowrap overflow-hidden text-ellipsis max-w-[110px] md:max-w-[140px]"
                      >
                        {item.subtitle}
                      </p>
                    </div>

                  </Link>


                  {/* Hover Dropdown for Sub Services */}
                  {item.subServices && item.subServices.length > 0 && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 w-64 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto scale-95 group-hover:scale-100 transform transition-all duration-300 z-50 hidden md:block">
                      {/* The white box container */}
                      <div className="bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
                        <div className="px-4 py-3">
                          <ul className="text-gray-700 text-sm space-y-2">
                            {item.subServices.map((sub, idx) => {
                              let href = item.link; // fallback

                              if (item.id === "furniture-service") {
                                if (sub === "Furniture Installation") href = "/site/services?typeId=1";
                                if (sub === "Furniture Dismantling") href = "/site/services?typeId=2";
                                if (sub === "Furniture Repair") href = "/site/services?typeId=3";
                              }

                              return (
                                <li key={idx}>
                                  <Link
                                    href={href}
                                    className="hover:text-[#8ed26b] transition-colors flex items-start gap-2"
                                  >
                                    <span className="text-[#8ed26b]">•</span>
                                    <span>{sub}</span>
                                  </Link>
                                </li>
                              );
                            })}

                          </ul>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <AuthModal showAuth={showAuth} setShowAuth={setShowAuth} initialMode={mode} />
    </>
  );
}