"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";
import BookServiceModal from "@/components/BookServiceModal";
import {
  Wrench,
  Package,
  ListFilter,
  Bolt,
  Home,
  Filter,
  X,
  Heart,
  ShoppingCart,
  Star, // Added for star ratings
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

type WishlistRow = {
  service_id: number;
};

type CartRow = {
  service_id: number;
  quantity: number;
  selected_services?: string[] | null;
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

// Helper to render stars based on rating
const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating); // Number of full stars
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={`w-4 h-4 ${i <= fullStars ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    );
  }
  return <div className="flex">{stars}</div>;
};

export default function ServicesPage() {
  const searchParams = useSearchParams();
  const typeId = searchParams.get("typeId");
  const { toast } = useToast();
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [activePriceFilter, setActivePriceFilter] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // Auth + persisted states
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<CartRow[]>([]);

  // New state for average ratings (service_id -> average rating)
  const [averageRatings, setAverageRatings] = useState<Record<number, number>>({});

  // New state for mobile filters
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // New states for reviews modal
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [selectedServiceForReviews, setSelectedServiceForReviews] = useState<ServiceItem | null>(null);
  const [reviewsForService, setReviewsForService] = useState<ReviewItem[]>([]);

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const isAuthenticated = !!userId;
  const disabledClass = "opacity-50 cursor-not-allowed";

  // --- Auto-filter by typeId (from home) ---
  useEffect(() => {
    if (!typeId) return;
    if (typeId === "1") setActivePriceFilter("install");
    if (typeId === "2") setActivePriceFilter("dismantle");
    if (typeId === "3") setActivePriceFilter("repair");
  }, [typeId]);

  // --- FETCH DATA & USER PERSISTED ITEMS ---
  const fetchData = useCallback(async () => {
    setLoading(true);

    // get session
    const { data: sessionData } = await supabase.auth.getSession();
    const currentUserId = sessionData?.session?.user?.id || null;
    const currentUserEmail = sessionData?.session?.user?.email || null;
    setUserId(currentUserId);
    setUserEmail(currentUserEmail);

    // if logged in, fetch wishlist and cartItems
    if (currentUserId) {
      const { data: wishlistData, error: wishlistError } = await supabase
        .from("wishlist_items")
        .select("service_id")
        .eq("user_id", currentUserId);

      if (!wishlistError && Array.isArray(wishlistData)) {
        setWishlist(wishlistData.map((r: WishlistRow) => r.service_id));
      } else if (wishlistError) {
        console.error("Error fetching wishlist:", wishlistError);
      }

      const { data: cartData, error: cartError } = await supabase
        .from("cart_items")
        .select("service_id, quantity, selected_services")
        .eq("user_id", currentUserId);

      if (!cartError && Array.isArray(cartData)) {
        setCartItems(cartData as CartRow[]);
      } else if (cartError) {
        console.error("Error fetching cart:", cartError);
      }
    } else {
      setWishlist([]);
      setCartItems([]);
    }

    // fetch subcategories
    const { data: subData } = await supabase
      .from("subcategories")
      .select("*")
      .eq("is_active", true)
      .order("subcategory", { ascending: true });

    setSubcategories(subData || []);

    // fetch services
    const { data: serviceData } = await supabase
      .from("services")
      .select("*")
      .order("service_name", { ascending: true });

    setServices(serviceData || []);

    // Fetch approved reviews and calculate average ratings per service
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("service_reviews")
      .select("rating, bookings!inner(service_id)")
      .eq("status", "approved");

    if (!reviewsError && Array.isArray(reviewsData)) {
      const ratingsMap: Record<number, { sum: number; count: number }> = {};
      reviewsData.forEach((review: any) => {
        const serviceId = review.bookings.service_id;
        if (!ratingsMap[serviceId]) {
          ratingsMap[serviceId] = { sum: 0, count: 0 };
        }
        ratingsMap[serviceId].sum += review.rating;
        ratingsMap[serviceId].count += 1;
      });

      const avgRatings: Record<number, number> = {};
      Object.keys(ratingsMap).forEach((sid) => {
        avgRatings[parseInt(sid)] = ratingsMap[parseInt(sid)].sum / ratingsMap[parseInt(sid)].count;
      });
      setAverageRatings(avgRatings);
    } else if (reviewsError) {
      console.error("Error fetching reviews:", reviewsError);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- Fetch reviews for a specific service ---
  const fetchReviewsForService = useCallback(async (serviceId: number) => {
    const { data: reviewsData, error: reviewsError } = await supabase
      .from("service_reviews")
      .select("id, rating, employee_name, service_details, created_at, images, bookings!inner(service_id)")
      .eq("status", "approved")
      .eq("bookings.service_id", serviceId);

    if (!reviewsError && Array.isArray(reviewsData)) {
      setReviewsForService(reviewsData as ReviewItem[]);
    } else {
      console.error("Error fetching reviews for service:", reviewsError);
      setReviewsForService([]);
    }
  }, []);

  // --- Handle opening reviews modal ---
  const handleSeeReviews = (service: ServiceItem) => {
    setSelectedServiceForReviews(service);
    fetchReviewsForService(service.id);
    setIsReviewsModalOpen(true);
  };

  // --- Wishlist toggle (insert / delete) ---
  const toggleWishlist = useCallback(
    async (service_id: number) => {
      if (!isAuthenticated || !userId) {
        toast({
          title: "Login Required",
          description: "Please log in to add items to your Wishlist.",
          variant: "destructive",
        });
        return;
      }

      const isCurrentlyWishlisted = wishlist.includes(service_id);

      if (isCurrentlyWishlisted) {
        // remove from wishlist
        const { error } = await supabase
          .from("wishlist_items")
          .delete()
          .eq("user_id", userId)
          .eq("service_id", service_id);

        if (error) {
          console.error("Error removing from wishlist:", error);
          toast({
            title: "Error",
            description: "Failed to remove from wishlist. Please try again.",
            variant: "destructive",
          });
          return;
        }

        setWishlist(prev => prev.filter(x => x !== service_id));
        toast({
          title: "Removed from Wishlist",
          description: "Service removed from your wishlist.",
        });

      } else {
        // add to wishlist
        const { error } = await supabase
          .from("wishlist_items")
          .insert({ user_id: userId, service_id });

        if (error) {
          console.error("Error adding to wishlist:", error);
          toast({
            title: "Error",
            description: "Failed to add to wishlist. Please try again.",
            variant: "destructive",
          });
          return;
        }

        setWishlist(prev => [...prev, service_id]);
        toast({
          title: "Added to Wishlist",
          description: "Service added to your wishlist.",
        });
      }
    },
    [isAuthenticated, userId, wishlist, toast]
  );

  // --- Add to cart (UPSERT) ---
  const addToCart = useCallback(
    async (item: ServiceItem) => {
      if (!isAuthenticated || !userId) {
        toast({
          title: "Login Required",
          description: "Please log in to add items to your Cart.",
          variant: "destructive",
        });
        return;
      }

      const service_id = item.id;
      const existing = cartItems.find(c => c.service_id === service_id);
      const newQuantity = existing ? existing.quantity + 1 : 1;

      const { data, error } = await supabase
        .from("cart_items")
        .upsert(
          {
            user_id: userId,
            service_id,
            quantity: newQuantity,
            // selected_services left to DB default unless you want to pass a value:
            // selected_services: ['installation']
          },
          { onConflict: "user_id, service_id" }
        )
        .select("service_id, quantity")
        .single();

      if (error) {
        console.error("Error adding to cart:", error);
        toast({
          title: "Error",
          description: "Failed to add to cart. Please try again.",
          variant: "destructive",
        });
        return;
      }

      // update local state using DB response (data)
      if (data) {
        setCartItems(prev => {
          const exists = prev.find(p => p.service_id === data.service_id);
          if (exists) {
            return prev.map(p =>
              p.service_id === data.service_id ? { ...p, quantity: data.quantity } : p
            );
          } else {
            return [...prev, { service_id: data.service_id, quantity: data.quantity }];
          }
        });

        toast({
          title: "Added to Cart",
          description: `${item.service_name} quantity is now ${data.quantity}.`,
        });
      } else {
        // fallback local update
        setCartItems(prev => {
          if (existing) {
            return prev.map(c => c.service_id === service_id ? { ...c, quantity: newQuantity } : c);
          } else {
            return [...prev, { service_id, quantity: newQuantity }];
          }
        });
        alert(`Added ${item.service_name} to cart! Quantity is now ${newQuantity}.`);
      }
    },
    [isAuthenticated, userId, cartItems]
  );

  // --- Filters ---
  const filteredServices = useMemo(() => {
    let list = [...services];

    if (selectedSubcategory) {
      list = list.filter(s => s.subcategory === selectedSubcategory);
    }

    if (activePriceFilter === "install")
      list = list.filter(s => s.installation_price && s.installation_price > 0);

    if (activePriceFilter === "dismantle")
      list = list.filter(s => s.dismantling_price && s.dismantling_price > 0);

    if (activePriceFilter === "repair")
      list = list.filter(s => s.repair_price && s.repair_price > 0);

    if (searchText)
      list = list.filter(s =>
        s.service_name.toLowerCase().includes(searchText.toLowerCase())
      );

    return list;
  }, [services, selectedSubcategory, activePriceFilter, searchText]);

  const handleBookClick = (service: ServiceItem) => {
    if (!isAuthenticated) {
      alert("Please log in to book a service.");
      return;
    }
    setSelectedService(service);
    setModalOpen(true);
  };

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header
        className={`bg-[${PRIMARY_COLOR}] text-white py-16 px-6 text-center shadow-lg`}
      >
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
                      {/* Add to cart */}
                      <button
                        onClick={() => addToCart(service)}
                        disabled={!isAuthenticated}
                        className={`p-3 rounded-xl border transition-colors flex items-center justify-center ${isAuthenticated
                            ? `border-[${PRIMARY_COLOR}] text-[${PRIMARY_COLOR}] hover:bg-[${PRIMARY_COLOR}]/10`
                            : "bg-gray-200 text-gray-500 " + disabledClass
                          }`}
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>

                      {/* Book Now */}
                      <button
                        onClick={() => handleBookClick(service)}
                        className={`flex-grow p-3 rounded-xl text-white font-semibold flex items-center justify-center shadow-md ${isAuthenticated
                            ? `bg-[${PRIMARY_COLOR}] hover:bg-[${HOVER_COLOR}]`
                            : "bg-gray-400 " + disabledClass
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

      {/* MOBILE FILTER MODAL */}
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
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${PRIMARY_COLOR}]"
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

      {/* REVIEWS MODAL */}
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
