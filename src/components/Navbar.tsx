"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import {
  User as UserIcon, UserCircle,
  ChevronDown,
  Menu,
  X,
  Search, LogOut,
  Heart,
  ShoppingCart,
  Loader2,
  CircleX,
  ChevronRight,
  Settings, // Icon for technical services
} from "lucide-react";
import { usePathname } from "next/navigation";
import AuthModal from "@/components/AuthModal";

type Category = {
  id: number;
  category: string;
  image_url: string | null;
};

type Subcategory = {
  id: number;
  subcategory: string;
};

type SearchResult = {
  id: number | string;
  name: string;
  type: "category" | "subcategory" | "service_type";
  parent_category?: string;
  customUrl?: string; // For specialized links like typeId=1
};

type AuthMode = "login" | "register";

export default function FullNavbar() {
  const [user, setUser] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [mode, setMode] = useState<AuthMode>("login");
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  // Profile dropdown state
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Search States
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Removed hover states for subcategories since dropdown is removed

  // Close search on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
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

  // Handle scroll shadow
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 80);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);


  // Removed fetch subcategories effect since dropdown is removed

  // --- LOGIC FOR INSTALLATION / REPAIR SEARCH ---
  // --- FIXED LOGIC FOR INSTALLATION / REPAIR SEARCH ---
  useEffect(() => {
    const value = search.trim().toLowerCase();

    if (value.length === 0) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);

    const timer = setTimeout(async () => {
      setIsSearching(true);

      const results: SearchResult[] = [];

      // 🔥 INSTALLATION — SHOW FROM "i", "in", "ins"
      if ("installation".startsWith(value) || value.startsWith("ins")) {
        results.push({
          id: "install",
          name: "Installation Services",
          type: "service_type",
          customUrl: "/site/services?typeId=1",
        });
      }

      // 🔧 REPAIR
      if (
        "repair".startsWith(value) ||
        value.includes("fix") ||
        value.includes("maint")
      ) {
        results.push({
          id: "repair",
          name: "Repair & Maintenance Services",
          type: "service_type",
          customUrl: "/site/services?typeId=2",
        });
      }

      // 🧹 DISMANTLING
      if (
        "dismantling".startsWith(value) ||
        value.includes("remove")
      ) {
        results.push({
          id: "dismantle",
          name: "Dismantling Services",
          type: "service_type",
          customUrl: "/site/services?typeId=3",
        });
      }

      // 🗄️ DATABASE SEARCH (SECONDARY)
      try {
        const [catRes, subRes] = await Promise.all([
          supabase
            .from("categories")
            .select("id, category")
            .ilike("category", `%${value}%`)
            .limit(3),

          supabase
            .from("subcategories")
            .select("id, subcategory, category")
            .ilike("subcategory", `%${value}%`)
            .limit(5),
        ]);

        const dbResults: SearchResult[] = [
          ...(catRes.data || []).map((c) => ({
            id: c.id,
            name: c.category,
            type: "category",
          })),
          ...(subRes.data || []).map((s) => ({
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
    }, 150); // faster response

    return () => clearTimeout(timer);
  }, [search]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setProfileOpen(false);
  };

  // Function to get the correct href based on category name
  const getCategoryHref = (category: string, id: number) => {
    const lowerCat = category.toLowerCase();
    if (lowerCat === "customized modular furniture") {
      return "/site/request/customized-modular-furniture";
    } else if (lowerCat === "customized modular kitchen") {
      return "/site/request/customized-modular-kitchen";
    } else if (lowerCat === "packer and movers") {
      return "/site/request/packer-and-movers";
    } else if (lowerCat === "b2b service requirement request") {
      return "/site/request/b2b-service-requirement";
    } else {
      return `/site/category/${id}`;
    }
  };


  const staticCategories = [
    {
      id: "furniture-service",
      name: "Furniture Service",
      image_url: "/furniture-service.jpeg", // replace with actual image path
      link: "/site/category",
    },
    {
      id: "custom-furniture",
      name: "Customized Modular Furniture",
      image_url: "/custom-furniture.jpg", // replace with actual image path
      link: "/site/request/customized-modular-furniture",
    },
    {
      id: "custom-kitchen",
      name: "Customized Modular Kitchen",
      image_url: "/custom-kitchen.jpg",
      link: "/site/request/customized-modular-kitchen",
    },
    {
      id: "packer-movers",
      name: "Packer and Movers",
      image_url: "/packer-movers.jpg",
      link: "/site/request/packer-and-movers",
    },
    {
      id: "b2b-request",
      name: "B2B Service",
      image_url: "/b2b-request.jpeg",
      link: "/site/request/b2b-service-requirement",
    },
  ];


  return (
    <>
      <header className={`bg-white border-b border-gray-200 sticky top-0 z-50 transition-all ${isScrolled ? "shadow-md" : ""}`}>
        <div className="hidden md:flex max-w-7xl mx-auto px-4 py-3 items-center gap-6">
          <Link href="/site" className="flex items-center gap-3 shrink-0">
            <div className="w-14 h-14 relative shrink-0">
              <Image src="/logoInstaFit.jpg" alt="Logo" width={66} height={66} className="w-full h-full object-contain" />
            </div>
            <div className="leading-tight">
              <div className="text-xl font-bold text-[#8ed26b]">INSTAFITCORE</div>
              <div className="text-xs text-black">One Stop Solutions</div>
            </div>
          </Link>

          {/* SEARCH BOX */}
          <div className="flex-1 max-w-md mx-4 relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => search.length >= 2 && setShowDropdown(true)}
                placeholder="Search Installations, Repairs..."
                className="w-full pl-10 pr-10 py-2 rounded-full border border-gray-300 bg-gray-50 focus:ring-2 focus:ring-[#8ed26b] outline-none"
              />
              {search && <CircleX className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 cursor-pointer" onClick={() => setSearch("")} />}
              {isSearching && <Loader2 className="absolute right-10 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-gray-400" />}
            </div>

            {showDropdown && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden z-[100]">
                {searchResults.length > 0 ? (
                  searchResults.map((res) => (
                    <Link
                      key={`${res.type}-${res.id}`}
                      href={res.customUrl || (res.type === "category" ? `/site/category/${res.id}` : `/site/services/${res.id}`)}
                      className={`flex flex-col px-4 py-3 hover:bg-[#f0f9eb] border-b last:border-0 ${res.type === "service_type" ? "bg-green-50/50" : "" // Highlight department links
                        }`} >
                      <div className="flex items-center gap-2">
                        {res.type === "service_type" && <Settings className="w-3 h-3 text-[#8ed26b]" />}
                        <span className={`text-sm font-semibold ${res.type === "service_type" ? "text-[#8ed26b]" : "text-gray-800"}`}>
                          {res.name}
                        </span>
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

          <nav className="hidden lg:flex items-center gap-6 font-medium text-gray-700">
            <Link href="/site" className="hover:text-[#8ed26b]">Home</Link>

            <Link href="/site/services" className="hover:text-[#8ed26b]">
              Services
            </Link>

            <Link href="/site/about" className="hover:text-[#8ed26b]">
              About Us
            </Link>

            <Link href="/site/contact" className="hover:text-[#8ed26b]">
              Contact Us
            </Link>
          </nav>


          <div className="flex items-center gap-4">
            {!user ? (
              <button onClick={() => { setMode("login"); setShowAuth(true); }} className="px-5 py-2 rounded-full text-white font-semibold bg-[#8ed26b]">Sign In</button>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/site/wishlist"><Heart className="w-6 h-6 text-gray-700" /></Link>
                <Link href="/site/cart"><ShoppingCart className="w-6 h-6 text-gray-700" /></Link>
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 hover:border-[#8ed26b]"
                  >
                    <UserIcon className="w-5 h-5 text-gray-600" />
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-200 shadow-2xl rounded-2xl overflow-hidden z-50">

                      {/* USER INFO */}
                      <div className="px-5 py-4 border-b bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#8ed26b]/20 flex items-center justify-center">
                            <UserIcon className="w-5 h-5 text-[#8ed26b]" />
                          </div>
                          <div className="leading-tight">
                            <p className="text-sm font-semibold text-gray-800">
                              {user?.user_metadata?.full_name || "My Account"}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[160px]">
                              {user?.email}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* MENU ITEMS */}
                      <div className="py-2">
                        <Link
                          href="/site/profile"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-[#f0f9eb]"
                        >
                          <UserIcon className="w-4 h-4 text-gray-500" />
                          Profile
                        </Link>

                        <Link
                          href="/site/order-tracking"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-3 px-5 py-3 text-sm text-gray-700 hover:bg-[#f0f9eb]"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                          Order Tracking
                        </Link>
                      </div>

                      {/* LOGOUT */}
                      <div className="border-t">
                        <button
                          onClick={handleLogout}
                          className="flex items-center gap-3 w-full px-5 py-3 text-sm text-red-600 hover:bg-red-50"
                        >
                          <X className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}

                </div>

              </div>
            )}
            <button onClick={() => setMobileOpen(true)} className="md:hidden"><Menu className="w-6 h-6" /></button>
          </div>
        </div>

        {/* MOBILE OVERLAY */}
        <div className={`fixed inset-0 z-[100] bg-white transition-transform ${mobileOpen ? "translate-x-0" : "translate-x-full"} md:hidden`}>
          <div className="p-4 flex justify-between items-center border-b">
            <span className="font-bold text-[#8ed26b]">Menu</span>
            <X className="w-6 h-6" onClick={() => setMobileOpen(false)} />
          </div>
          <div className="p-6 flex flex-col gap-6">
            <Link href="/site" className="text-lg font-semibold">Home</Link>

            <Link href="/site/services" className="text-lg font-semibold">
              Services
            </Link>

            <Link href="/site/about-us" className="text-lg font-semibold">
              About Us
            </Link>

            <Link href="/site/contact-us" className="text-lg font-semibold">
              Contact Us
            </Link>

            {/* PROFILE & TRACKING LINKS */}
            {user && (
              <div className="mt-8 flex flex-col gap-4 border-t pt-6">
                <Link href="/site/profile" className="text-gray-800 text-base font-medium">Profile</Link>
                <Link href="/site/order-tracking" className="text-gray-800 text-base font-medium">Order Tracking</Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* CATEGORY BAR (Only on Home) */}
      {pathname === "/site" && (
        <div className="sticky top-[72px] z-40 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <div className="flex gap-10 justify-center min-w-max relative">
              <div className="flex gap-10 justify-center min-w-max relative">
                {staticCategories.map((item) => (
                  <div key={item.id} className="relative">
                    <Link href={item.link} className="flex flex-col items-center group">
                      <div className={`rounded-full border-2 border-transparent group-hover:border-[#8ed26b] transition-all overflow-hidden ${isScrolled ? "w-0 h-0 opacity-0" : "w-16 h-16 md:w-20 md:h-20"}`}>
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          width={80}
                          height={80}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="font-semibold text-gray-800 text-xs mt-2 group-hover:text-[#8ed26b] text-center">
                        {item.name}
                      </p>

                    </Link>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </div>
      )}

      <AuthModal showAuth={showAuth} setShowAuth={setShowAuth} initialMode={mode} />
    </>
  );
}