"use client";

import BookServiceModal from "@/components/BookServiceModal";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
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
} from "lucide-react";

// Accent color
const ACCENT_COLOR = "blue";
const ACCENT_BG = `bg-${ACCENT_COLOR}-600`;
const ACCENT_HOVER = `hover:bg-${ACCENT_COLOR}-700`;
const ACCENT_TEXT = `text-${ACCENT_COLOR}-600`;
const ACCENT_RING = `focus:ring-2 focus:ring-${ACCENT_COLOR}-500`;

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
  image_url: string | null;
  installation_price: number | null;
  dismantling_price: number | null;
  repair_price: number | null;
};

// Types for fetched persistent items
type WishlistItem = {
  service_id: number;
};

type CartItem = {
  service_id: number;
  quantity: number;
};


const getBasePrice = (item: ServiceItem): number => {
  return (
    item.installation_price ||
    item.repair_price ||
    item.dismantling_price ||
    0
  );
};

// Component for a clean, repeatable filter button
const FilterButton: React.FC<{
  label: string;
  value: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, value, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors border ${active
      ? `${ACCENT_BG} text-white shadow-md`
      : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
      }`}
  >
    {label}
    {active && <X className="inline w-3 h-3 ml-2 -mr-1" />}
  </button>
);

export default function ServiceDetailsPage() {
  const params = useParams();
  const serviceId = Number(params.id);

  const [service, setService] = useState<Subcategory | null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(
    null
  );

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  // Filters / Sorting
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("default");

  // Wishlist & Cart (NOW BOTH PERSISTENT)
  const [wishlist, setWishlist] = useState<number[]>([]);
  // We use this array to manage cart quantities for correct upsert logic
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isAuthenticated = userEmail !== null;
  const disabledClass = "opacity-50 cursor-not-allowed";

  // Helper function to format the price display (removes .00 and handles null/0)
  const formatDisplayPrice = (price: number | null): string | null => {
    if (price === null || price <= 0) {
      return null;
    }
    // Use Math.floor to ensure no decimals are displayed
    return `₹${Math.floor(price)}`;
  };


  // -------------------------
  // Fetch Logged-in User, Wishlist, and Services
  // -------------------------
  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);

      // 1. Get User Session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const currentUserId = session?.user?.id || null;
      setUserId(currentUserId);
      setUserEmail(session?.user?.email || null);

      if (currentUserId) {
        // 2a. Fetch Wishlist (Persistent)
        const { data: wishlistData, error: wishlistError } = await supabase
          .from("wishlist_items") // <<< USING 'wishlist_items'
          .select("service_id")
          .eq("user_id", currentUserId);

        if (wishlistError) {
          console.error("Error fetching wishlist:", wishlistError);
        } else {
          const ids = wishlistData?.map((item: WishlistItem) => item.service_id) || [];
          setWishlist(ids);
        }

        // 2b. Fetch Cart Items (Persistent)
        const { data: cartData, error: cartError } = await supabase
          .from("cart_items") // <<< USING 'cart_items'
          .select("service_id, quantity")
          .eq("user_id", currentUserId);

        if (cartError) {
          console.error("Error fetching cart:", cartError);
        } else {
          setCartItems(cartData || []);
        }

      } else {
        setWishlist([]);
        setCartItems([]);
      }

      // 3. Load Subcategory + Services
      const { data: subData } = await supabase
        .from("subcategories")
        .select("*")
        .eq("id", serviceId)
        .single();

      setService(subData);

      if (subData) {
        const { data: servicesData } = await supabase
          .from("services")
          .select("*")
          .eq("subcategory", subData.subcategory)
          .order("service_name", { ascending: true });

        setServices(servicesData || []);
      }

      setLoading(false);
    }

    fetchInitialData();
  }, [serviceId]);

  // -------------------------
  // Wishlist Toggle (Persistent State)
  // -------------------------
  const toggleWishlist = async (service_id: number) => {
    if (!isAuthenticated || !userId) {
      alert("Please log in to add items to your Wishlist.");
      return;
    }

    const isCurrentlyWishlisted = wishlist.includes(service_id);

    if (isCurrentlyWishlisted) {
      // REMOVE from wishlist (DELETE from backend)
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", userId)
        .eq("service_id", service_id);

      if (error) {
        console.error("Error removing from wishlist:", error);
        alert("Failed to remove from wishlist. Please try again.");
        return;
      }

      // Update local state
      setWishlist((prev) => prev.filter((x) => x !== service_id));

    } else {
      // ADD to wishlist (INSERT into backend)
      const { error } = await supabase
        .from("wishlist_items")
        .insert({ user_id: userId, service_id: service_id });

      if (error) {
        console.error("Error adding to wishlist:", error);
        alert("Failed to add to wishlist. Please try again.");
        return;
      }

      // Update local state
      setWishlist((prev) => [...prev, service_id]);
    }
  };

  // -------------------------
  // Add to Cart (Persistent State - UPSERT)
  // -------------------------
  const addToCart = async (item: ServiceItem) => {
    if (!isAuthenticated || !userId) {
      alert("Please log in to add items to your Cart.");
      return;
    }

    const service_id = item.id;
    const existingCartItem = cartItems.find(c => c.service_id === service_id);
    const newQuantity = existingCartItem ? existingCartItem.quantity + 1 : 1;

    // Use upsert: insert if not exists, update if exists
    const { data, error } = await supabase
      .from("cart_items")
      .upsert(
        { user_id: userId, service_id: service_id, quantity: newQuantity },
        { onConflict: 'user_id, service_id' } // Conflict target defined by your UNIQUE constraint
      )
      .select('service_id, quantity')
      .single(); // Expecting one row back

    if (error) {
      console.error("Error adding to cart:", error);
      alert("Failed to add to cart. Please try again.");
      return;
    }

    // Update local state based on the successful database operation
    setCartItems(prevItems => {
      if (existingCartItem) {
        // Update quantity of existing item
        return prevItems.map(c =>
          c.service_id === service_id ? { ...c, quantity: newQuantity } : c
        );
      } else {
        // Add new item
        return [...prevItems, { service_id: service_id, quantity: newQuantity }];
      }
    });

    alert(`Added ${item.service_name} to cart! Quantity is now ${newQuantity}.`);
  };

  // -------------------------
  // Filter + Sorting Logic
  // -------------------------
  const filteredAndSortedServices = useMemo(() => {
    let list = [...services];

    // Search
    if (searchText) {
      list = list.filter((x) =>
        x.service_name.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter
    if (activeFilter === "install") {
      list = list.filter((x) => x.installation_price && x.installation_price > 0);
    } else if (activeFilter === "dismantle") {
      list = list.filter((x) => x.dismantling_price && x.dismantling_price > 0);
    } else if (activeFilter === "repair") {
      list = list.filter((x) => x.repair_price && x.repair_price > 0);
    }

    // Sort
    if (sortBy === "price_asc") {
      list.sort((a, b) => getBasePrice(a) - getBasePrice(b));
    } else if (sortBy === "price_desc") {
      list.sort((a, b) => getBasePrice(b) - getBasePrice(a));
    } else {
      list.sort((a, b) => a.service_name.localeCompare(b.service_name));
    }

    return list;
  }, [services, searchText, activeFilter, sortBy]);

  // -------------------------
  // Book Now Modal
  // -------------------------
  const handleBookClick = (service: ServiceItem) => {
    if (!isAuthenticated) {
      alert("Please log in to book a service.");
      return;
    }
    setSelectedService(service);
    setModalOpen(true);
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading Service Details...
      </div>
    );

  if (!service)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
        Service Not Found
      </div>
    );

  const headerStyle = {
    backgroundImage: service.image_url ? `url(${service.image_url})` : undefined,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* HEADER */}
      <header
        className={`w-full text-white py-20 relative ${!service.image_url ? ACCENT_BG : ""
          }`}
        style={headerStyle}
      >
        {service.image_url && (
          <div className="absolute inset-0 bg-black/60"></div>
        )}

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="text-sm mb-4 text-gray-200 flex items-center">
            <Home className="w-4 h-4 mr-2" />
            <span>{service.category}</span>
            <span className="mx-2">/</span>
            <span className="font-semibold">{service.subcategory}</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-extrabold flex items-center">
            <Bolt className="w-8 h-8 mr-3" style={{ color: "#8ED26B" }} />
            {service.subcategory} Services
          </h1>


          <p className="mt-4 text-lg text-gray-200 max-w-4xl">
            {service.description ||
              "Explore our premium service packages tailored for your specific needs, categorized by expertise."}
          </p>
        </div>
      </header>

      <hr className="border-gray-200" />

      {/* FILTERS AND CONTROLS */}
      <div className="bg-white sticky top-0 z-10 shadow-lg py-4 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">

          {/* Search */}
          <div className="relative w-full md:w-1/3">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`w-full p-3 pl-10 border border-gray-300 rounded-xl shadow-sm ${ACCENT_RING}`}
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-2 overflow-x-auto py-1">
            <FilterButton
              label="Installation"
              value="install"
              active={activeFilter === "install"}
              onClick={() => setActiveFilter(activeFilter === "install" ? null : "install")}
            />
            <FilterButton
              label="Dismantling"
              value="dismantle"
              active={activeFilter === "dismantle"}
              onClick={() => setActiveFilter(activeFilter === "dismantle" ? null : "dismantle")}
            />
            <FilterButton
              label="Repair"
              value="repair"
              active={activeFilter === "repair"}
              onClick={() => setActiveFilter(activeFilter === "repair" ? null : "repair")}
            />
          </div>

          {/* Sort + Cart */}
          <div className="flex items-center space-x-4">

            {/* Sort */}
            <div className="relative">
              <ListFilter className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`p-3 pl-10 border border-gray-300 rounded-xl appearance-none ${ACCENT_RING}`}
              >
                <option value="default">Default Sort</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {/* Cart Button */}
            <button
              onClick={() =>
                isAuthenticated
                  ? alert("Viewing Cart…")
                  : alert("Please log in to use the cart.")
              }
              disabled={!isAuthenticated}
              className={`relative p-3 rounded-xl border border-gray-300 transition-colors ${isAuthenticated ? "bg-white hover:bg-gray-100" : disabledClass
                }`}
              title="View Cart"
            >
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center -translate-y-1/3 translate-x-1/3 ring-2 ring-white">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SERVICES GRID */}
      <div className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold mb-8 text-gray-800">
            Available Service Packages ({filteredAndSortedServices.length})
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAndSortedServices.map((item) => {
              const isWishlisted = wishlist.includes(item.id);
              // Use the helper to get clean price strings or null
              const installationPrice = formatDisplayPrice(item.installation_price);
              const repairPrice = formatDisplayPrice(item.repair_price);
              const dismantlingPrice = formatDisplayPrice(item.dismantling_price);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 border border-gray-100 flex flex-col"
                >
                  <div className="relative w-full h-48 bg-gray-100">
                    {item.image_url ? (
                      <Image
                        src={item.image_url}
                        alt={item.service_name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 hover:scale-105"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <Wrench className="w-10 h-10" />
                      </div>
                    )}

                    {/* Wishlist Button */}
                    <button
                      onClick={() => toggleWishlist(item.id)}
                      disabled={!isAuthenticated}
                      className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${isWishlisted
                        ? "bg-red-500 text-white hover:bg-red-600"
                        : "bg-white text-gray-500 hover:text-red-500"
                        } ${!isAuthenticated ? disabledClass : ""}`}
                      title="Add to Wishlist"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                    </button>
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold mb-2 text-gray-900">
                      {item.service_name}
                    </h3>

                    {/* Pricing details - ONLY show if price is available (not null, not 0) */}
                    <div className="text-sm text-gray-600 mb-4 space-y-1 border-t pt-3 mt-auto">

                      {/* Installation Price */}
                      {installationPrice && (
                        <p className="flex justify-between font-medium">
                          <span>Installation:</span>
                          <span className="font-semibold text-green-600">
                            {installationPrice}
                          </span>
                        </p>
                      )}

                      {/* Repair Price */}
                      {repairPrice && (
                        <p className="flex justify-between">
                          <span>Repair:</span>
                          <span className="font-semibold text-gray-500">
                            {repairPrice}
                          </span>
                        </p>
                      )}

                      {/* Dismantling Price */}
                      {dismantlingPrice && (
                        <p className="flex justify-between">
                          <span>Dismantling:</span>
                          <span className="font-semibold text-gray-500">
                            {dismantlingPrice}
                          </span>
                        </p>
                      )}

                      {/* Fallback for no prices */}
                      {!installationPrice && !repairPrice && !dismantlingPrice && (
                        <p className="text-center italic text-gray-400">Price Not Listed</p>
                      )}

                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 mt-4">
                      {/* Cart Button */}
                      <button
                        onClick={() => addToCart(item)}
                        disabled={!isAuthenticated}
                        className={`p-3 rounded-xl border transition-colors flex items-center justify-center ${isAuthenticated
                          ? `border-${ACCENT_COLOR}-600 ${ACCENT_TEXT} hover:bg-${ACCENT_COLOR}-50/50`
                          : "bg-gray-200 text-gray-500 " + disabledClass
                          }`}
                        title="Add to Cart"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>

                      {/* Book Now Button */}
                      <button
                        onClick={() => handleBookClick(item)}
                        disabled={!isAuthenticated}
                        className={`flex-grow p-3 rounded-xl text-white font-semibold flex items-center justify-center shadow-lg transition-colors ${isAuthenticated
                            ? "bg-[#8ED26B] hover:bg-[#76c157] focus:outline-none" // custom green background & hover
                            : "bg-gray-400 " + disabledClass
                          }`}
                      >
                        Book Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </button>

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* BOOKING MODAL */}
      {selectedService && userEmail && (
        <BookServiceModal
          service={selectedService}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          userEmail={userEmail}
          isLoading={false}
        />
      )}
    </div>
  );
}