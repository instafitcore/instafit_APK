// components/ServiceDetailsPage.tsx
"use client";

import BookServiceModal from "@/components/BookServiceModal";
import ReviewModal from "@/components/ReviewModal";
import { useEffect, useState, useMemo, useCallback } from "react";
import { useParams, useRouter } from "next/navigation"; // useRouter is already imported
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast"; // Add this if you have useToast; otherwise, use alerts
import {
  Package,
  Home,
  ArrowRight,
  Zap,
  Heart,
  ShoppingCart,
  Search,
  ListFilter,
  Bolt,
  Wrench,
  X,
  Star,
} from "lucide-react";

// --- CUSTOM COLORS (from ServicesPage.tsx) ---
const PRIMARY_COLOR = "#8ED26B";
const HOVER_COLOR = "#72b852";

// ACCENT COLORS (keep existing if needed, but prioritize PRIMARY_COLOR for cart)
const ACCENT_COLOR = "green";
const ACCENT_BG = `bg-green-600`;
const ACCENT_HOVER = `hover:bg-green-700`;
const ACCENT_TEXT = `text-green-600`;
const ACCENT_RING = `focus:ring-2 focus:ring-green-500`;


// ------------------- TYPE DEFINITIONS -------------------
type Subcategory = {
  id: number;
  subcategory: string;
  description: string | null;
  image_url: string | null;
  category: string;
};

type ServiceItem = {
  id: number;
  category: string;
  subcategory: string;
  service_name: string;
  [key: string]: any;
  image_url: string | null;
  installation_price: number | null;
  dismantling_price: number | null;
  repair_price: number | null;
};

type WishlistItem = { service_id: number };
type CartRow = { // Updated to match ServicesPage.tsx (includes selected_services)
  service_id: number;
  quantity: number;
  selected_services?: string[] | null;
};

export type ServiceReview = {
  id: number;
  rating: number;
  employee_name: string;
  service_details: string | null;
  created_at: string;
  images: string[] | null;
};

type ServiceStats = {
  averageRating: number | null;
  reviewCount: number;
  reviews: ServiceReview[];
};

// ------------------- UTILITY FUNCTIONS -------------------
const getBasePrice = (item: ServiceItem): number =>
  item.installation_price || item.repair_price || item.dismantling_price || 0;

const formatPrice = (price: number | null) => // Added from ServicesPage.tsx
  price && price > 0 ? `₹${Math.floor(price)}` : null;

const formatDisplayPrice = (price: number | null): string | null => {
  if (!price || price <= 0) return null;
  return `₹${Math.floor(price)}`;
};

// STAR RATING DISPLAY
const StarRatingDisplay: React.FC<{ rating: number; count?: number; size?: number }> = ({ rating, count, size = 5 }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center space-x-1">
      {[...Array(fullStars)].map((_, i) => (
        <Star key={`full-${i}`} className={`w-${size} h-${size} fill-yellow-400 text-yellow-400`} />
      ))}
      {hasHalfStar && (
        <div className="relative">
          <Star className={`w-${size} h-${size} fill-yellow-400 text-yellow-400`} />
          <div className="absolute top-0 right-0 overflow-hidden w-1/2">
            <Star className={`w-${size} h-${size} text-gray-300 fill-gray-300`} />
          </div>
        </div>
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star key={`empty-${i}`} className={`w-${size} h-${size} text-gray-300`} />
      ))}
      {count !== null && ( // Fixed typo: was "count !== "
        <span className="ml-2 text-sm font-semibold text-gray-800">
          {rating > 0 ? rating.toFixed(1) : "N/A"}
          {count !== null && <span className="text-gray-500 font-normal ml-1">({count})</span>}
        </span>
      )}
    </div>
  );
};

const renderStars = (rating: number) => {
  const stars = [];
  const fullStars = Math.floor(rating);
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

// FILTER BUTTON COMPONENT
const FilterButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({
  label,
  active,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border 
      ${active
        ? "bg-[#8ED26B] text-white shadow-md border-[#8ED26B]"
        : "bg-white text-gray-700 hover:bg-[#d0f0c0] border-gray-300"
      }`}
  >
    {label}
    {active && <X className="inline w-3 h-3 ml-2 -mr-1" />}
  </button>
);

// ------------------- MAIN COMPONENT -------------------
export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter(); // Already imported
  const { toast } = useToast(); // Add this if available; otherwise, use alerts
  const serviceId = Number(params.id);

  const [service, setService] = useState<Subcategory | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);
  const [serviceStats, setServiceStats] = useState<ServiceStats>({ averageRating: null, reviewCount: 0, reviews: [] });

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [wishlist, setWishlist] = useState<number[]>([]);
  const [cartItems, setCartItems] = useState<CartRow[]>([]); // Updated type
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);

  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("default");

  const [averageRatings, setAverageRatings] = useState<Record<number, number>>({});
  const [isReviewsModalOpen, setIsReviewsModalOpen] = useState(false);
  const [selectedServiceForReviews, setSelectedServiceForReviews] = useState<ServiceItem | null>(null);
  const [reviewsForService, setReviewsForService] = useState<ServiceReview[]>([]);

  // NEW: Cart Selection Modal State (from ServicesPage.tsx)
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [selectedServiceForCart, setSelectedServiceForCart] = useState<ServiceItem | null>(null);
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>([]);

  const isAuthenticated = !!userId; // Updated to match
  const disabledClass = "opacity-50 cursor-not-allowed";

  // ------------------- FETCH REVIEWS FOR SUBCATEGORY -------------------
  const fetchReviewsForSubcategory = useCallback(async (subcategoryName: string) => {
    const { data: serviceIdsData } = await supabase
      .from("services")
      .select("id")
      .eq("subcategory", subcategoryName);

    const serviceIds = serviceIdsData?.map((s) => s.id) || [];
    if (!serviceIds.length) return;

    const { data: reviewsData, error } = await supabase
      .from("service_reviews")
      .select("id, rating, employee_name, service_details, created_at, images, service_id")
      .eq("is_approved", true);

    if (error) {
      console.error("Error fetching reviews:", error);
      return;
    }

    const ratingsMap: Record<number, { sum: number; count: number }> = {};

    reviewsData.forEach((review) => {
      if (!review.service_id) return;
      if (!serviceIds.includes(review.service_id)) return;

      if (!ratingsMap[review.service_id]) {
        ratingsMap[review.service_id] = { sum: 0, count: 0 };
      }

      ratingsMap[review.service_id].sum += review.rating;
      ratingsMap[review.service_id].count++;
    });

    // Build averageRatings per service
    const avgRatings: Record<number, number> = {};
    Object.keys(ratingsMap).forEach((sid) => {
      avgRatings[+sid] =
        ratingsMap[+sid].sum / ratingsMap[+sid].count;
    });

    setAverageRatings(avgRatings);

    // Subcategory summary
    const allSubcategoryReviews = reviewsData.filter(
      (r) => serviceIds.includes(r.service_id)
    );

    const totalRating = allSubcategoryReviews.reduce(
      (sum, r) => sum + r.rating,
      0
    );

    setServiceStats({
      averageRating:
        allSubcategoryReviews.length > 0
          ? totalRating / allSubcategoryReviews.length
          : null,
      reviewCount: allSubcategoryReviews.length,
      reviews: allSubcategoryReviews,
    });
  }, []);


  // ------------------- FETCH REVIEWS FOR A SERVICE -------------------
  const fetchReviewsForService = useCallback(async (serviceId: number) => {
    const { data, error } = await supabase
      .from("service_reviews")
      .select("id, rating, employee_name, service_details, created_at, images")
      .eq("is_approved", true)
      .eq("service_id", serviceId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading service reviews:", error);
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

  // ------------------- MODIFIED: CART MODAL HANDLERS (from ServicesPage.tsx) -------------------
  const confirmAddToCart = useCallback(
    async (item: ServiceItem, selected_services: string[]) => {
      if (!isAuthenticated || !userId) {
        toast ? toast({
          title: "Login Required",
          description: "Please log in to add items to your Cart.",
          variant: "destructive",
        }) : alert("Login required!");
        return;
      }

      const service_id = item.id;
      const existing = cartItems.find(c => c.service_id === service_id);
      const newQuantity = existing ? existing.quantity + 1 : 1;

      const servicesToSave = selected_services.length > 0 ? selected_services : null;

      const { data, error } = await supabase
        .from("cart_items")
        .upsert(
          {
            user_id: userId,
            service_id,
            quantity: newQuantity,
            selected_services: servicesToSave,
          },
          { onConflict: "user_id, service_id" }
        )
        .select("service_id, quantity, selected_services")
        .single();

      if (error) {
        console.error("Error adding to cart:", error);
        toast ? toast({
          title: "Error",
          description: "Failed to add to cart. Please try again.",
          variant: "destructive",
        }) : alert("Error adding to cart!");
        return;
      }

      if (data) {
        setCartItems(prev => {
          const exists = prev.find(p => p.service_id === data.service_id);
          const newItem: CartRow = {
            service_id: data.service_id,
            quantity: data.quantity,
            selected_services: data.selected_services
          };

          if (exists) {
            return prev.map(p =>
              p.service_id === data.service_id ? newItem : p
            );
          } else {
            return [...prev, newItem];
          }
        });

        toast ? toast({
          title: "Added to Cart",
          description: `${item.service_name} added with ${servicesToSave ? servicesToSave.join(', ') : 'default'} services. Quantity is now ${data.quantity}.`,
        }) : alert("Added to Cart!");
        setIsCartModalOpen(false);
      }
    },
    [isAuthenticated, userId, cartItems, toast]
  );

  // ------------------- MODIFIED: Handle Cart Button Click (from ServicesPage.tsx) -------------------
  const handleCartClick = (service: ServiceItem, isInCart: boolean) => {
    if (!isAuthenticated) {
      toast ? toast({
        title: "Login Required",
        description: "Please log in to add items to your Cart.",
        variant: "destructive",
      }) : alert("Login required!");
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

  // ------------------- WISHLIST TOGGLE -------------------
  const toggleWishlist = async (service_id: number) => {
    if (!isAuthenticated || !userId) {
      toast ? toast({
        title: "Login Required",
        description: "Please log in to add items to your Wishlist.",
        variant: "destructive",
      }) : alert("Login required!");
      return;
    }
    const isWishlisted = wishlist.includes(service_id);
    if (isWishlisted) {
      await supabase.from("wishlist_items").delete().eq("user_id", userId).eq("service_id", service_id);
      setWishlist((prev) => prev.filter((id) => id !== service_id));
    } else {
      await supabase.from("wishlist_items").insert({ user_id: userId, service_id });
      setWishlist((prev) => [...prev, service_id]);
    }
  };

  // ... (previous code remains unchanged up to here)

  // ------------------- FETCH INITIAL DATA -------------------
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const currentUserId = session?.user?.id || null;
      setUserId(currentUserId);
      setUserEmail(session?.user?.email || null);

      if (currentUserId) {
        const { data: wishlistData } = await supabase.from("wishlist_items").select("service_id").eq("user_id", currentUserId);
        setWishlist(wishlistData?.map((x: WishlistItem) => x.service_id) || []);

        const { data: cartData } = await supabase.from("cart_items").select("service_id, quantity, selected_services").eq("user_id", currentUserId);
        setCartItems(cartData as CartRow[] || []);
      }

      const { data: subData } = await supabase.from("subcategories").select("*").eq("id", serviceId).single();
      setService(subData);

      if (subData) {
        await fetchReviewsForSubcategory(subData.subcategory);
        const { data: servicesData } = await supabase.from("services").select("*").eq("subcategory", subData.subcategory).order("service_name");
        setServices(servicesData || []);
      }

      setLoading(false);
    }
    fetchInitialData();
  }, [serviceId, fetchReviewsForSubcategory]);

  // ------------------- FILTER + SORT -------------------
  const filteredAndSortedServices = useMemo(() => {
    let list = [...services];
    if (searchText) list = list.filter((x) => x.service_name.toLowerCase().includes(searchText.toLowerCase()));
    if (activeFilter) list = list.filter((x) => {
      const price = (x as any)[activeFilter + "_price"];
      return price && price > 0;
    });


    if (sortBy === "price_asc") list.sort((a, b) => getBasePrice(a) - getBasePrice(b));
    else if (sortBy === "price_desc") list.sort((a, b) => getBasePrice(b) - getBasePrice(a));
    else list.sort((a, b) => a.service_name.localeCompare(b.service_name));
    return list;
  }, [services, searchText, activeFilter, sortBy]);

  // ------------------- BOOK NOW -------------------
  const handleBookClick = (service: ServiceItem) => {
    if (!isAuthenticated) {
      toast ? toast({
        title: "Login Required",
        description: "Please log in to book a service.",
        variant: "destructive",
      }) : alert("Login required!");
      return;
    }
    setSelectedService(service);
    setModalOpen(true);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-xl">Loading Service Details...</div>;
  if (!service) return <div className="min-h-screen flex items-center justify-center text-xl text-red-500">Service Not Found</div>;

  const headerStyle = { backgroundImage: service.image_url ? `url(${service.image_url})` : undefined, backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className={`w-full text-white py-20 relative ${!service.image_url ? ACCENT_BG : ""}`} style={headerStyle}>
        {service.image_url && <div className="absolute inset-0 bg-black/60"></div>}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm mb-4 text-gray-200 flex items-center">
            <Home className="w-4 h-4 mr-2" /> {service.category} / <span className="font-semibold">{service.subcategory}</span>
          </nav>
          <h1 className="text-4xl md:text-5xl font-extrabold flex items-center">
            <Bolt className="w-8 h-8 mr-3" style={{ color: "#8ED26B" }} /> {service.subcategory} Services
          </h1>
          <div className="mt-2 flex items-center space-x-4">
            {serviceStats.averageRating && serviceStats.averageRating > 0 ? (
              <>
                <StarRatingDisplay rating={serviceStats.averageRating} count={serviceStats.reviewCount} size={6} />
                <button onClick={() => setReviewModalOpen(true)} className="text-sm text-yellow-300 hover:text-white transition-colors underline font-medium">
                  ({serviceStats.reviewCount} Reviews)
                </button>
              </>
            ) : (
              <p className="text-sm text-gray-300">No reviews yet.</p>
            )}
          </div>
          <p className="mt-4 text-lg text-gray-200 max-w-4xl">{service.description || "Explore our premium service packages tailored for your specific needs."}</p>
        </div>
      </header>

      {/* FILTERS */}
      <div className="bg-white sticky top-0 z-10 shadow-lg py-4 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search services..." value={searchText} onChange={(e) => setSearchText(e.target.value)} className={`w-full p-3 pl-10 border border-gray-300 rounded-xl shadow-sm ${ACCENT_RING}`} />
          </div>

          <div className="flex space-x-2 overflow-x-auto py-1">
            <FilterButton label="Installation" active={activeFilter === "installation"} onClick={() => setActiveFilter(activeFilter === "installation" ? null : "installation")} />
            <FilterButton label="Dismantling" active={activeFilter === "dismantling"} onClick={() => setActiveFilter(activeFilter === "dismantling" ? null : "dismantling")} />
            <FilterButton label="Repair" active={activeFilter === "repair"} onClick={() => setActiveFilter(activeFilter === "repair" ? null : "repair")} />
          </div>


          <div className="flex items-center space-x-4">
            <div className="relative">
              <ListFilter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className={`p-3 pl-10 border border-gray-300 rounded-xl appearance-none ${ACCENT_RING}`}>
                <option value="default">Default Sort</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* SERVICES GRID */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">Available Service Packages ({filteredAndSortedServices.length})</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAndSortedServices.map((item) => {
              const isWishlisted = wishlist.includes(item.id);
              const isInCart = cartItems.some(cartItem => cartItem.service_id === item.id); // Check if in cart
              const installationPrice = formatDisplayPrice(item.installation_price);
              const repairPrice = formatDisplayPrice(item.repair_price);
              const dismantlingPrice = formatDisplayPrice(item.dismantling_price);
              return (
                <div key={item.id} className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border flex flex-col">
                  <div className="relative w-full h-48 bg-gray-100">
                    {item.image_url ? <Image src={item.image_url} alt={item.service_name} fill sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" className="object-cover transition-transform duration-500 hover:scale-105" /> : <div className="flex items-center justify-center h-full text-gray-400"><Wrench className="w-10 h-10" /></div>}

                    <button onClick={() => toggleWishlist(item.id)} disabled={!isAuthenticated} className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${isWishlisted ? "bg-red-500 text-white hover:bg-red-600" : "bg-white text-gray-500 hover:text-red-500"} ${!isAuthenticated ? disabledClass : ""}`} title="Add to Wishlist">
                      <Heart className="w-5 h-5 fill-current" />
                    </button>

                    {averageRatings[item.id] && <button onClick={() => handleSeeReviews(item)} className="absolute bottom-2 right-2 px-3 py-1.5 bg-black/70 text-white backdrop-blur-md rounded-full text-xs font-medium flex items-center gap-1 hover:bg-black/90 transition-all z-10">⭐ {averageRatings[item.id].toFixed(1)} • See Reviews</button>}
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">{item.service_name}</h3>

                    {averageRatings[item.id] && <div className="flex items-center gap-1 mt-1">{renderStars(averageRatings[item.id])}<span className="text-sm text-gray-600">({averageRatings[item.id].toFixed(1)})</span></div>}

                    <div className="text-sm text-gray-600 mb-4 space-y-1 border-t pt-3 mt-auto">
                      {installationPrice && <p className="flex justify-between font-medium"><span>Installation:</span><span className="font-semibold text-green-600">{installationPrice}</span></p>}
                      {repairPrice && <p className="flex justify-between"><span>Repair:</span><span className="font-semibold text-gray-500">{repairPrice}</span></p>}
                      {dismantlingPrice && <p className="flex justify-between"><span>Dismantling:</span><span className="font-semibold text-gray-500">{dismantlingPrice}</span></p>}
                      {!installationPrice && !repairPrice && !dismantlingPrice && <p className="text-center italic text-gray-400">Price Not Listed</p>}
                    </div>

                    <div className="flex space-x-3 mt-4">
                      {/* MODIFIED: Cart Button with Color Change and Navigation */}
                      <button
                        onClick={() => handleCartClick(item, isInCart)}
                        disabled={!isAuthenticated}
                        className={`p-3 rounded-xl border transition-colors flex items-center justify-center 
                        ${isInCart
                            ? `border-red-500 text-white bg-red-500 hover:bg-red-600`
                            : isAuthenticated
                              ? `border-[${PRIMARY_COLOR}] text-[${PRIMARY_COLOR}] hover:bg-[${PRIMARY_COLOR}]/10`
                              : "bg-gray-200 text-gray-500 " + disabledClass
                          }`}
                        title={isInCart ? "Service added to Cart (Click to modify)" : "Add service to Cart"}
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>

                      <button
                        onClick={() => handleBookClick(item)}
                        disabled={!isAuthenticated}
                        className={`flex-grow p-3 rounded-xl text-white font-semibold flex items-center justify-center shadow-lg transition-colors ${!isAuthenticated ? "bg-gray-400 opacity-50 cursor-not-allowed" : ""}`}
                        style={isAuthenticated ? {
                          backgroundColor: PRIMARY_COLOR,
                          hover: { backgroundColor: HOVER_COLOR }
                        } : {}}

                      >
                        Book Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>
                    </div>
                    {!isAuthenticated && <p className="text-xs text-red-500 mt-2 text-center">Sign in to add to wishlist or cart</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOOKING MODAL */}
      {selectedService && userEmail && <BookServiceModal service={selectedService} isOpen={modalOpen} onClose={() => setModalOpen(false)} userEmail={userEmail} isLoading={false} />}

      {/* SUBCATEGORY REVIEW MODAL */}
      {service && serviceStats.reviews.length > 0 && <ReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} subcategory={service.subcategory} reviews={serviceStats.reviews} averageRating={serviceStats.averageRating} />}

      {/* SERVICE REVIEWS MODAL */}
      {isReviewsModalOpen && selectedServiceForReviews && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-11/12 max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Reviews for {selectedServiceForReviews.service_name}</h3>
              <button onClick={() => setIsReviewsModalOpen(false)} className="text-gray-500 hover:text-gray-700"><X className="w-6 h-6" /></button>
            </div>
            {reviewsForService.length === 0 ? <p className="text-gray-600">No reviews available.</p> : <div className="space-y-4">{reviewsForService.map((review) => (<div key={review.id} className="border-b pb-4">
              <div className="flex items-center gap-2 mb-2">{renderStars(review.rating)}<span className="text-sm text-gray-600">({review.rating})</span></div>
              <p className="text-sm font-semibold">Employee: {review.employee_name}</p>
              <p className="text-sm text-gray-700">{review.service_details || "No details provided."}</p>
              <p className="text-xs text-gray-500">Reviewed on {new Date(review.created_at).toLocaleDateString()}</p>
              {review.images && review.images.length > 0 && <div className="flex gap-2 mt-2">{review.images.map((img, idx) => (<img key={idx} src={img} alt="Review image" className="w-16 h-16 object-cover rounded" />))}</div>}
            </div>))}</div>}
          </div>
        </div>
      )}

      {/* MODIFIED: CART SELECTION MODAL (from ServicesPage.tsx) */}
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
    </div>
  );
}
