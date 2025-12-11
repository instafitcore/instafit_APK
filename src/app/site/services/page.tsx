"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import BookServiceModal from "@/components/BookServiceModal";
import {
  Wrench,
  Package,
  ListFilter,
  Bolt,
  Filter,
  X,
  Heart,
  ShoppingCart,
  Star,
} from "lucide-react";

// --- CUSTOM COLORS ---
const PRIMARY_COLOR = "#8ED26B";
const HOVER_COLOR = "#72b852";

// --- TYPES ---
type ServiceItem = {
  id: number;
  category: string;
  subcategory: string;
  service_name: string;
  image_url: string | null;
  installation_price: number | null;
  dismantling_price: number | null;
  repair_price: number | null;
};

type Subcategory = {
  id: number;
  category: string;
  subcategory: string;
  description: string | null;
  image_url: string | null;
};

type WishlistRow = { service_id: number };
type CartRow = {
  service_id: number;
  quantity: number;
  selected_services?: string[] | null;
};

// Raw type for fetching reviews with service_id directly
type ReviewRaw = {
  rating: number;
  service_id: number;
};

type ReviewItem = {
  id: number;
  rating: number;
  employee_name: string;
  service_details: string | null;
  created_at: string;
  images: string[] | null;
};

// --- HELPER ---
const formatPrice = (price: number | null) =>
  price && price > 0 ? `₹${Math.floor(price)}` : null;

const FilterButton: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 whitespace-nowrap ${active
      ? `bg-[${PRIMARY_COLOR}] text-white shadow-md hover:bg-[${HOVER_COLOR}]`
      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
      }`}
  >
    {label} {active && <X className="w-3 h-3" />}
  </button>
);

// Render stars for ratings
const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`w-4 h-4 ${i <= fullStars ? "text-yellow-400 fill-current" : "text-gray-300"}`}
      />
    );
  }
  return <div className="flex">{stars}</div>;
};

// --- COMPONENT ---
export default function ServicesPage() {
  const searchParams = useSearchParams();
  const typeId = searchParams.get("typeId");
  const { toast } = useToast();
  const router = useRouter();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Reviews Modal State
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [selectedServiceForReviews, setSelectedServiceForReviews] = useState<ServiceItem | null>(null);
  const [reviewsForService, setReviewsForService] = useState<ReviewItem[]>([]);

  // Cart Modal State
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [selectedServiceForCart, setSelectedServiceForCart] = useState<ServiceItem | null>(null);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);

  // Filters & Search
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [activePriceFilter, setActivePriceFilter] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  // Auth + persisted states
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<CartRow[]>([]);

  // Ratings state
  const [averageRatings, setAverageRatings] = useState<Record<number, number>>({});

  // Mobile filters
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const isAuthenticated = !!userId;
  const disabledClass = "opacity-50 cursor-not-allowed";

  // Auto-filter by typeId
  useEffect(() => {
    if (!typeId) return;
    if (typeId === "1") setActivePriceFilter("install");
    if (typeId === "2") setActivePriceFilter("dismantle");
    if (typeId === "3") setActivePriceFilter("repair");
  }, [typeId]);

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    setLoading(true);

    // Get session
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id || null;
    const currentUserEmail = sessionData?.session?.user?.email || null;
    setUserId(currentUserId);
    setUserEmail(currentUserEmail);

    // Fetch wishlist & cart
    if (currentUserId) {
      const { data: wishlistData } = await supabase
        .from("wishlist_items")
        .select("service_id")
        .eq("user_id", currentUserId);
      setWishlist(wishlistData?.map((r: WishlistRow) => r.service_id) || []);

      const { data: cartData } = await supabase
        .from("cart_items")
        .select("service_id, quantity, selected_services")
        .eq("user_id", currentUserId);
      setCartItems(cartData as CartRow[] || []);
    }

    // Fetch subcategories
    const { data: subData } = await supabase
      .from("subcategories")
      .select("*")
      .eq("is_active", true)
      .order("subcategory", { ascending: true });
    setSubcategories(subData || []);

    // Fetch services
    const { data: serviceData } = await supabase
      .from("services")
      .select("*")
      .order("service_name", { ascending: true });
    setServices(serviceData || []);

    // Fetch approved reviews and calculate average ratings
    // ... existing code ...

    // Fetch approved reviews and calculate average ratings
    // Fetch approved reviews and calculate average ratings
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("service_reviews")
      .select("rating, service_id")
      .eq("status", "approved");

    if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
    } else if (reviewsData) {
      const ratingsMap: Record<number, { sum: number; count: number }> = {};

      reviewsData.forEach((review: any) => {
        const serviceId = review.service_id;
        if (!serviceId) return;

        if (!ratingsMap[serviceId]) ratingsMap[serviceId] = { sum: 0, count: 0 };
        ratingsMap[serviceId].sum += review.rating;
        ratingsMap[serviceId].count++;
      });

      const avgRatings: Record<number, number> = {};
      for (const sid in ratingsMap) {
        avgRatings[+sid] =
          ratingsMap[sid].sum / ratingsMap[sid].count;
      }

      setAverageRatings(avgRatings);
    }


    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Fetch reviews for a service ---
  const fetchReviewsForService = useCallback(async (serviceId: number) => {
    const { data, error } = await supabase
      .from("service_reviews")
      .select("id, rating, employee_name, service_details, created_at, images")
      .eq("is_approved", true)
      .eq("service_id", serviceId) // filter by service
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews for service:", error);
      setReviewsForService([]);
    } else {
      setReviewsForService(data || []);
    }
  }, []);

  const handleSeeReviews = (service: ServiceItem) => {
    setSelectedServiceForReviews(service);
    fetchReviewsForService(service.id);
    setIsReviewsModalOpen(true);
  };

  // --- Wishlist ---
  const toggleWishlist = useCallback(async (service_id: number) => {
    if (!isAuthenticated || !userId) {
      toast({ title: "Login Required", description: "Please log in.", variant: "destructive" });
      return;
    }

    const isWishlisted = wishlist.includes(service_id);
    if (isWishlisted) {
      await supabase.from("wishlist_items").delete().eq("user_id", userId).eq("service_id", service_id);
      setWishlist(prev => prev.filter(x => x !== service_id));
      toast({ title: "Removed from Wishlist" });
    } else {
      await supabase.from("wishlist_items").insert({ user_id: userId, service_id });
      setWishlist(prev => [...prev, service_id]);
      toast({ title: "Added to Wishlist" });
    }
  }, [isAuthenticated, userId, wishlist, toast]);

  // --- Add to Cart ---
  const confirmAddToCart = useCallback(async (item: ServiceItem, selected_services: string[]) => {
    if (!isAuthenticated || !userId) {
      toast({ title: "Login Required", description: "Please log in.", variant: "destructive" });
      return;
    }

    const service_id = item.id;
    const existing = cartItems.find(c => c.service_id === service_id);
    const newQuantity = existing ? existing.quantity + 1 : 1;

    const servicesToSave = selected_services.length > 0 ? selected_services : null;

    const { data, error } = await supabase
      .from("cart_items")
      .upsert({ user_id: userId, service_id, quantity: newQuantity, selected_services: servicesToSave }, { onConflict: "user_id, service_id" })
      .select("service_id, quantity, selected_services")
      .single();

    if (error) {
      console.error("Error adding to cart:", error);
      toast({ title: "Error", description: "Failed to add to cart.", variant: "destructive" });
      return;
    }

    if (data) {
      setCartItems(prev => {
        const exists = prev.find(p => p.service_id === data.service_id);
        const newItem: CartRow = { service_id: data.service_id, quantity: data.quantity, selected_services: data.selected_services };
        if (exists) return prev.map(p => p.service_id === data.service_id ? newItem : p);
        return [...prev, newItem];
      });
      toast({ title: "Added to Cart", description: `${item.service_name} added. Quantity now ${data.quantity}.` });
      setIsCartModalOpen(false);
    }
  }, [isAuthenticated, userId, cartItems, toast]);

  const handleCartClick = (service: ServiceItem, isInCart: boolean) => {
    if (!isAuthenticated) {
      toast({ title: "Login Required", description: "Please log in.", variant: "destructive" });
      return;
    }
    if (isInCart) {
      router.push("/site/cart");
      return;
    }
    setSelectedServiceForCart(service);
    setSelectedServiceTypes([]);
    setIsCartModalOpen(true);
  };

  // --- Filtered Services ---
  const filteredServices = useMemo(() => {
    let list = [...services];
    if (selectedSubcategory) list = list.filter(s => s.subcategory === selectedSubcategory);
    if (activePriceFilter === "install") list = list.filter(s => s.installation_price && s.installation_price > 0);
    if (activePriceFilter === "dismantle") list = list.filter(s => s.dismantling_price && s.dismantling_price > 0);
    if (activePriceFilter === "repair") list = list.filter(s => s.repair_price && s.repair_price > 0);
    if (searchText) list = list.filter(s => s.service_name.toLowerCase().includes(searchText.toLowerCase()));
    return list;
  }, [services, selectedSubcategory, activePriceFilter, searchText]);

  const handleBookClick = (service: ServiceItem) => {
    if (!isAuthenticated) { alert("Please log in."); return; }
    setSelectedService(service);
    setModalOpen(true);
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-primary-green text-white py-16 px-6 text-center shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center gap-4">
          {/* Centered Content */}
          <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-3 justify-center">
            <Bolt className="w-7 h-7" /> Premium Service Catalogue
          </h1>
          <p className="text-sm opacity-90 max-w-md">
            Find the perfect solution from our installation, repair & dismantling services.
          </p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 py-12 px-4 sm:px-6 lg:px-8">
        {/* SIDEBAR - Hidden on mobile */}
        <aside className="hidden lg:block w-64 bg-white rounded-2xl shadow-xl p-5 h-fit sticky top-6">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-800">
            <Filter className="w-5 h-5 text-gray-600" /> Categories
          </h2>
          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={`w-full text-left px-4 py-2 rounded-xl font-medium border-2 ${selectedSubcategory === null
                  ? "bg-primary-green text-white border-primary-green"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent"
                  }`}
              >
                All Services
              </button>
            </li>
            {subcategories.map((subcat) => (
              <li key={subcat.id}>
                <button
                  onClick={() => setSelectedSubcategory(subcat.subcategory)}
                  className={`w-full text-left px-4 py-2 rounded-xl ${selectedSubcategory === subcat.subcategory
                    ? "bg-primary-green text-white font-semibold shadow-md"
                    : "hover:bg-gray-100 text-gray-700"
                    }`}
                >
                  {subcat.subcategory}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          {/* MOBILE FILTER BUTTON */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 px-4 py-3 rounded-xl shadow-sm"
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium text-gray-700">Filters</span>
            </button>
          </div>

          {/* DESKTOP FILTER BAR */}
          <div className="hidden lg:flex mb-8 p-4 bg-white rounded-xl shadow-md justify-between items-center gap-4">
            <input
              type="text"
              placeholder="Search by service name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`w-1/3 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${PRIMARY_COLOR}]`}
            />

            <div className="flex space-x-2">
              <FilterButton label="Installation" active={activePriceFilter === "install"} onClick={() => setActivePriceFilter(activePriceFilter === "install" ? null : "install")} />
              <FilterButton label="Dismantling" active={activePriceFilter === "dismantle"} onClick={() => setActivePriceFilter(activePriceFilter === "dismantle" ? null : "dismantle")} />
              <FilterButton label="Repair" active={activePriceFilter === "repair"} onClick={() => setActivePriceFilter(activePriceFilter === "repair" ? null : "repair")} />
            </div>
          </div>

          {/* SERVICES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {loading ? (
              <p className="text-center text-gray-600 col-span-full py-10">
                <ListFilter className="inline w-6 h-6 animate-spin text-gray-400 mr-2" />
                Loading services...
              </p>
            ) : filteredServices.length === 0 ? (
              <div className="text-center col-span-full p-10 bg-white rounded-xl shadow-inner">
                <p className="text-xl font-medium text-gray-600">No Services Found</p>
              </div>
            ) : (
              filteredServices.map(service => {
                const isWishlisted = wishlist.includes(service.id);
                const isInCart = cartItems.some(item => item.service_id === service.id);
                return (
                  <div
                    key={service.id}
                    className="bg-white rounded-2xl shadow-lg p-5 flex flex-col relative"
                  >
                    {/* Wishlist Heart */}
                    <button
                      onClick={() => toggleWishlist(service.id)}
                      className={`absolute top-3 right-3 z-20 p-2 rounded-full shadow-md transition-colors 
                                                ${isWishlisted ? "bg-red-500 text-white" : "bg-white text-gray-500 hover:text-red-500"} 
                                                ${!isAuthenticated ? "opacity-50 cursor-not-allowed" : ""}`}
                      title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
                    >
                      <Heart className="w-5 h-5" />
                    </button>

                    {/* IMAGE BLOCK */}
                    <div className="w-full h-40 bg-gray-100 rounded-xl overflow-hidden mb-4 relative">
                      {service.image_url ? (
                        <img
                          src={service.image_url}
                          className="w-full h-full object-cover"
                          alt=""
                        />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400">
                          <Package className="w-8 h-8" />
                          <span className="text-xs mt-2">No Image</span>
                        </div>
                      )}

                      {/* ⭐ SEE REVIEWS BUTTON */}
                      {averageRatings[service.id] && (
                        <button
                          onClick={() => handleSeeReviews(service)}
                          className="absolute bottom-2 right-2 px-3 py-1.5
                                                        bg-black/70 text-white backdrop-blur-md
                                                        rounded-full text-xs font-medium flex items-center gap-1
                                                        hover:bg-black/90 transition-all z-10"
                        >
                          ⭐ {averageRatings[service.id].toFixed(1)} • See Reviews
                        </button>
                      )}
                    </div>

                    {/* NAME */}
                    <h2 className="text-xl font-bold">{service.service_name}</h2>
                    <p className="text-sm text-gray-500">
                      {service.category} → {service.subcategory}
                    </p>

                    {/* STAR RATING */}
                    {averageRatings[service.id] && (
                      <div className="flex items-center gap-1 mt-1">
                        {renderStars(averageRatings[service.id])}
                        <span className="text-sm text-gray-600">
                          ({averageRatings[service.id].toFixed(1)})
                        </span>
                      </div>
                    )}

                    {/* PRICES */}
                    <div className="mt-auto pt-4 border-t text-sm space-y-2 text-gray-700">
                      {formatPrice(service.installation_price) && (
                        <p className="flex justify-between">
                          <span>
                            <Wrench className="inline w-4 h-4 mr-1 text-blue-500" />
                            Installation:
                          </span>
                          <span className="font-bold text-green-600 text-lg">
                            {formatPrice(service.installation_price)}
                          </span>
                        </p>
                      )}

                      {formatPrice(service.dismantling_price) && (
                        <p className="flex justify-between">
                          <span>Dismantling:</span>
                          <span>{formatPrice(service.dismantling_price)}</span>
                        </p>
                      )}

                      {formatPrice(service.repair_price) && (
                        <p className="flex justify-between">
                          <span>Repair:</span>
                          <span>{formatPrice(service.repair_price)}</span>
                        </p>
                      )}
                    </div>

                    {/* ACTION BUTTONS */}
                    <div className="flex gap-3 mt-5">
                      {/* Add to cart - NOW OPENS MODAL */}
                      <button
                        onClick={() => handleCartClick(service, isInCart)}
                        disabled={!isAuthenticated}
                        className={`p-3 rounded-xl border transition-colors flex items-center justify-center 
        ${isInCart // This condition makes the button solid red
                            ? `border-red-500 text-white bg-red-500 hover:bg-red-600`
                            : isAuthenticated
                              ? `border-[${PRIMARY_COLOR}] text-[${PRIMARY_COLOR}] hover:bg-[${PRIMARY_COLOR}]/10`
                              : "bg-gray-200 text-gray-500 " + disabledClass
                          }`}
                        title={isInCart ? "Service added to Cart (Click to modify)" : "Add service to Cart"}
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>

                      {/* Book Now */}
                      <button
                        onClick={() => handleBookClick(service)}
                        className={`flex-grow p-3 rounded-xl text-white font-semibold flex items-center justify-center shadow-md ${isAuthenticated
                          ? "bg-primary-green hover:bg-hover-green"
                          : "bg-gray-400 opacity-50 cursor-not-allowed"
                          }`}
                        disabled={!isAuthenticated}
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </main>
      </div>

      {/* MOBILE FILTER MODAL (existing) */}
      {showMobileFilters && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 lg:hidden">
          <div className="bg-white rounded-2xl p-6 w-11/12 max-w-md max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Filters</h3>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Search */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search by service name..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className={`w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${PRIMARY_COLOR}]`}
              />
            </div>

            {/* Categories */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Categories</h4>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => setSelectedSubcategory(null)}
                    className={`w-full text-left px-4 py-2 rounded-xl font-medium border-2 ${selectedSubcategory === null
                      ? `bg-[${PRIMARY_COLOR}] text-white border-[${PRIMARY_COLOR}]`
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent"
                      }`}
                  >
                    All Services
                  </button>
                </li>
                {subcategories.map(subcat => (
                  <li key={subcat.id}>
                    <button
                      onClick={() => setSelectedSubcategory(subcat.subcategory)}
                      className={`w-full text-left px-4 py-2 rounded-xl ${selectedSubcategory === subcat.subcategory
                        ? `bg-[${PRIMARY_COLOR}] text-white font-semibold shadow-md`
                        : "hover:bg-gray-100 text-gray-700"
                        }`}
                    >
                      {subcat.subcategory}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Filters */}
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Service Types</h4>
              <div className="flex flex-wrap gap-2">
                <FilterButton label="Installation" active={activePriceFilter === "install"} onClick={() => setActivePriceFilter(activePriceFilter === "install" ? null : "install")} />
                <FilterButton label="Dismantling" active={activePriceFilter === "dismantle"} onClick={() => setActivePriceFilter(activePriceFilter === "dismantle" ? null : "dismantle")} />
                <FilterButton label="Repair" active={activePriceFilter === "repair"} onClick={() => setActivePriceFilter(activePriceFilter === "repair" ? null : "repair")} />
              </div>
            </div>

            <button
              onClick={() => setShowMobileFilters(false)}
              className={`w-full p-3 rounded-xl text-white font-semibold bg-[${PRIMARY_COLOR}] hover:bg-[${HOVER_COLOR}]`}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* ⭐ NEW: CART SELECTION MODAL */}
      {isCartModalOpen && selectedServiceForCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-11/12 max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-gray-600" />
                Select Services for {selectedServiceForCart.service_name}
              </h3>
              <button
                onClick={() => setIsCartModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="mb-4 text-gray-600">Choose the type(s) of service you need for this item.</p>

            <div className="space-y-4">
              {/* Installation */}
              {formatPrice(selectedServiceForCart.installation_price) && (
                <label className="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    className={`w-5 h-5 text-[${PRIMARY_COLOR}] rounded focus:ring-[${PRIMARY_COLOR}]`}
                    checked={selectedServiceTypes.includes("installation")}
                    onChange={() => {
                      setSelectedServiceTypes(prev =>
                        prev.includes("installation")
                          ? prev.filter(t => t !== "installation")
                          : [...prev, "installation"]
                      );
                    }}
                  />
                  <span className="font-medium text-lg flex-grow">Installation</span>
                  <span className="text-green-600 font-bold text-lg">{formatPrice(selectedServiceForCart.installation_price)}</span>
                </label>
              )}

              {/* Dismantling */}
              {formatPrice(selectedServiceForCart.dismantling_price) && (
                <label className="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    className={`w-5 h-5 text-[${PRIMARY_COLOR}] rounded focus:ring-[${PRIMARY_COLOR}]`}
                    checked={selectedServiceTypes.includes("dismantling")}
                    onChange={() => {
                      setSelectedServiceTypes(prev =>
                        prev.includes("dismantling")
                          ? prev.filter(t => t !== "dismantling")
                          : [...prev, "dismantling"]
                      );
                    }}
                  />
                  <span className="font-medium text-lg flex-grow">Dismantling</span>
                  <span className="text-green-600 font-bold text-lg">{formatPrice(selectedServiceForCart.dismantling_price)}</span>
                </label>
              )}

              {/* Repair */}
              {formatPrice(selectedServiceForCart.repair_price) && (
                <label className="flex items-center space-x-3 p-4 border rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                  <input
                    type="checkbox"
                    className={`w-5 h-5 text-[${PRIMARY_COLOR}] rounded focus:ring-[${PRIMARY_COLOR}]`}
                    checked={selectedServiceTypes.includes("repair")}
                    onChange={() => {
                      setSelectedServiceTypes(prev =>
                        prev.includes("repair")
                          ? prev.filter(t => t !== "repair")
                          : [...prev, "repair"]
                      );
                    }}
                  />
                  <span className="font-medium text-lg flex-grow">Repair</span>
                  <span className="text-green-600 font-bold text-lg">{formatPrice(selectedServiceForCart.repair_price)}</span>
                </label>
              )}
            </div>

            <button
              onClick={() => confirmAddToCart(selectedServiceForCart, selectedServiceTypes)}
              disabled={selectedServiceTypes.length === 0}
              className={`w-full mt-6 p-4 rounded-xl text-white font-semibold flex items-center justify-center shadow-md transition-all 
                                ${selectedServiceTypes.length > 0
                  ? `bg-[${PRIMARY_COLOR}] hover:bg-[${HOVER_COLOR}]`
                  : "bg-gray-400 opacity-70 cursor-not-allowed"
                }`}
            >
              Add to Cart ({selectedServiceTypes.length} Service{selectedServiceTypes.length !== 1 ? 's' : ''})
            </button>
          </div>
        </div>
      )}

      {/* REVIEWS MODAL (existing) */}
      {isReviewsModalOpen && selectedServiceForReviews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Reviews for {selectedServiceForReviews.service_name}</h3>
              <button
                onClick={() => setIsReviewsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {reviewsForService.length === 0 ? (
              <p className="text-gray-600">No reviews available.</p>
            ) : (
              <div className="space-y-4">
                {reviewsForService.map(review => (
                  <div key={review.id} className="border-b pb-4">
                    <div className="flex items-center gap-2 mb-2">
                      {renderStars(review.rating)}
                      <span className="text-sm text-gray-600">({review.rating})</span>
                    </div>
                    <p className="text-sm font-semibold">Employee: {review.employee_name}</p>
                    <p className="text-sm text-gray-700">{review.service_details || "No details provided."}</p>
                    <p className="text-xs text-gray-500">Reviewed on {new Date(review.created_at).toLocaleDateString()}</p>
                    {review.images && review.images.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {review.images.map((img, idx) => (
                          <img key={idx} src={img} alt="Review image" className="w-16 h-16 object-cover rounded" />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* BOOKING MODAL (existing) */}
      {selectedService && (
        <BookServiceModal
          service={selectedService}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          userEmail={userEmail || undefined}
        />
      )}
    </div>
  );
}
