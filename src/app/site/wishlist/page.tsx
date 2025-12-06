"use client";

import { useEffect, useState, useCallback } from "react";
// Ensure this path to your Supabase client is correct
import { supabase } from "@/lib/supabase-client"; 
import Image from "next/image";
import { Heart, X, ShoppingCart, Loader2, Package, ChevronRight, AlertTriangle, Info } from "lucide-react";

// --- Configuration & Styling ---
const PRIMARY_COLOR = "#8ed26b";
const ACCENT_COLOR = "#2dd4bf"; // Teal/Cyan for price text 
const LIGHT_BG = "#f9fafb"; // Very light grey background

// --- Type Definitions ---
type ServiceDetails = {
    id: number;
    service_name: string;
    installation_price: number | null; 
    dismantling_price: number | null; 
    repair_price: number | null;
    image_url: string | null;
};

type WishlistItem = {
    id: number;
    user_id: string;
    service_id: number;
    created_at: string;
    service: ServiceDetails | null; 
    isUpdating: boolean;
};

// --- Helper Functions ---

/**
 * Calculates the total unit price for a service.
 */
const calculateUnitServicePrice = (service: ServiceDetails | null): number => {
    if (!service) return 0;
    let totalPrice = 0;
    totalPrice += +(service.installation_price || 0);
    totalPrice += +(service.dismantling_price || 0);
    totalPrice += +(service.repair_price || 0);
    return totalPrice;
};

// --- Helper Components ---

/**
 * Renders a single item in the wishlist with action buttons (Premium Design).
 */
const WishlistItemCard: React.FC<{ 
    item: WishlistItem; 
    onRemove: (id: number) => void;
    onMoveToCart: (item: WishlistItem) => void;
}> = ({ item, onRemove, onMoveToCart }) => {
    
    const unitPrice = calculateUnitServicePrice(item.service);
    const isServiceMissing = !item.service;
    
    const priceDetails: { name: string, price: number }[] = item.service ? [
        { name: "Installation", price: +(item.service.installation_price || 0) },
        { name: "Dismantling", price: +(item.service.dismantling_price || 0) },
        { name: "Repair", price: +(item.service.repair_price || 0) },
    ].filter(d => d.price > 0) : [];

    // --- Image Source Logic ---
    const imageSource = item.service?.image_url || null;
    // Check if the source is a Base64 string to handle the unoptimized prop
    const isBase64 = imageSource ? imageSource.startsWith('data:image/') : false;


    return (
        <div 
            className={`flex flex-col md:flex-row items-stretch p-6 bg-white rounded-2xl shadow-lg transition-shadow duration-300 hover:shadow-xl border border-gray-200 relative`}
        >
            
            {/* Image / Placeholder */}
            <div className="flex-shrink-0 relative w-full h-40 sm:w-32 sm:h-32 mr-6 mb-4 md:mb-0 rounded-xl overflow-hidden shadow-md">
                {imageSource ? (
                    <Image
                        src={imageSource} 
                        alt={item.service?.service_name || "Service Image"}
                        layout="fill"
                        objectFit="cover"
                        unoptimized={isBase64} // Disable optimization for Base64 images
                        className="transition-transform duration-500 hover:scale-105"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <Package className="w-10 h-10" />
                    </div>
                )}
            </div>

            {/* Service Info & Price Breakdown */}
            <div className="flex-1 min-w-0 pr-4 py-1">
                <h3 className="text-2xl font-extrabold text-gray-900 truncate mb-1">
                    {item.service?.service_name || "Service Not Found"}
                </h3>
                
                {isServiceMissing ? (
                    <p className="text-sm font-semibold text-red-500 flex items-center mb-4">
                        <AlertTriangle className="w-4 h-4 mr-1" /> Service details are incomplete or unavailable.
                    </p>
                ) : (
                    <>
                        <p className="text-xl font-bold text-gray-700 mb-3 flex items-center">
                            Estimated Cost: <span className="text-3xl font-extrabold ml-2" style={{ color: ACCENT_COLOR }}>₹{unitPrice.toFixed(2)}</span>
                        </p>
                        
                        {priceDetails.length > 0 && (
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-200">
                                <span className="font-semibold text-gray-700">Details:</span>
                                {priceDetails.map(detail => (
                                    <span key={detail.name} className="flex items-center" title={`${detail.name} cost`}>
                                        <Info className="w-3 h-3 mr-1 text-gray-400" />
                                        {detail.name}: <span className="font-bold ml-1">₹{detail.price.toFixed(2)}</span>
                                    </span>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col justify-center items-end space-y-3 pt-4 md:pt-0 md:pl-6 w-full md:w-56 border-t md:border-t-0 border-gray-100">
                {/* Move to Cart Button */}
                <button
                    onClick={() => onMoveToCart(item)}
                    disabled={item.isUpdating || isServiceMissing}
                    className={`w-full py-3 text-white font-bold rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center hover:shadow-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed`}
                    style={{ backgroundColor: PRIMARY_COLOR }}
                >
                    {item.isUpdating ? (
                         <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    ) : (
                         <ShoppingCart className="w-5 h-5 mr-2" />
                    )}
                    {item.isUpdating ? 'Moving...' : 'Move to Cart'}
                </button>
                
                {/* Remove Button */}
                <button
                    onClick={() => onRemove(item.id)}
                    disabled={item.isUpdating}
                    className="w-full py-3 text-red-600 bg-red-50 font-semibold rounded-xl hover:bg-red-100 transition duration-300 disabled:opacity-50 border border-red-200"
                    title="Remove from Wishlist"
                >
                    <X className="w-4 h-4 inline mr-2" /> Remove
                </button>
            </div>
        </div>
    );
};

// =========================================================================
//                             Main Component (WishlistPage)
// =========================================================================

export default function WishlistPage() {
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching Logic ---
    const fetchWishlistItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;

        if (!userId) {
            setError("Please log in to view your wishlist.");
            setWishlistItems([]);
            setLoading(false);
            return;
        }

        // 1. Fetch wishlist items
        const { data: wishlistData, error: wishlistError } = await supabase
            .from("wishlist_items") 
            .select("*")
            .eq("user_id", userId);

        if (wishlistError) {
            console.error("Error fetching wishlist:", wishlistError);
            setError("Failed to load wishlist items.");
            setLoading(false);
            return;
        }
        
        if (!wishlistData || wishlistData.length === 0) {
            setWishlistItems([]);
            setLoading(false);
            return;
        }

        // 2. Fetch service details
        const serviceIds = wishlistData.map((item: any) => item.service_id);
        const { data: servicesData, error: servicesError } = await supabase
            .from("services")
            .select("id, service_name, installation_price, image_url, dismantling_price, repair_price")
            .in("id", serviceIds);

        if (servicesError) {
            console.error("Error fetching services:", servicesError);
            setError("Failed to load service details.");
            setLoading(false);
            return;
        }

        // 3. Merge and set state
        const serviceMap = new Map(servicesData.map((s: any) => [s.id, s]));

        const merged: WishlistItem[] = wishlistData.map((item: any) => ({
            ...item,
            service: serviceMap.get(item.service_id) || null,
            isUpdating: false,
        }));

        setWishlistItems(merged);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchWishlistItems();
    }, [fetchWishlistItems]);

    // --- Wishlist Actions ---

    const handleRemoveItem = useCallback(async (itemId: number) => {
        setWishlistItems(prev => prev.map(item => 
            item.id === itemId ? { ...item, isUpdating: true } : item
        ));

        const { error } = await supabase
            .from('wishlist_items')
            .delete()
            .eq('id', itemId);

        if (error) {
            console.error("Remove item error:", error);
            setError(`Failed to remove item: ${error.message}`);
            setWishlistItems(prev => prev.map(item => 
                item.id === itemId ? { ...item, isUpdating: false } : item
            ));
        } else {
            setWishlistItems(prev => prev.filter(item => item.id !== itemId));
        }
    }, []);
    
    const handleMoveToCart = useCallback(async (item: WishlistItem) => {
        const userId = item.user_id;

        if (!item.service) {
            alert("Cannot move item without service details.");
            return;
        }

        setWishlistItems(prev => prev.map(i => 
            i.id === item.id ? { ...i, isUpdating: true } : i
        ));
        
        // 1. Insert/Update Cart Items
        const { error: insertError } = await supabase
            .from('cart_items')
            .upsert({
                user_id: userId,
                service_id: item.service_id,
                quantity: 1,
            }, { onConflict: ['user_id', 'service_id'] });


        if (insertError) {
            console.error("Move to cart error:", insertError);
            setError(`Failed to move item to cart: ${insertError.message}`);
            setWishlistItems(prev => prev.map(i => 
                i.id === item.id ? { ...i, isUpdating: false } : i
            ));
            return;
        }

        // 2. Remove from Wishlist Items
        const { error: deleteError } = await supabase
            .from('wishlist_items')
            .delete()
            .eq('id', item.id);

        if (deleteError) {
            console.error("Warning: Failed to delete item from wishlist after moving:", deleteError);
            // Optionally, show a toast/alert that the delete failed but the move succeeded
        }
        
        // 3. Update local state
        setWishlistItems(prev => prev.filter(i => i.id !== item.id));

    }, []);

    // --- Render Loading/Error/Empty States ---

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center py-20" style={{ backgroundColor: LIGHT_BG }}>
                <Loader2 className={`animate-spin h-12 w-12 mb-4`} style={{ color: PRIMARY_COLOR }} />
                <p className="text-xl font-medium text-gray-600">Loading your wishlist...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col justify-center items-center py-20" style={{ backgroundColor: LIGHT_BG }}>
                <div className="p-6 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center shadow-lg max-w-lg mx-auto">
                    <AlertTriangle className="w-6 h-6 mr-3" />
                    <span className="text-lg font-medium">{error}</span>
                </div>
                <button
                    onClick={fetchWishlistItems}
                    className="mt-6 px-6 py-3 text-white font-semibold rounded-lg shadow-md transition duration-300"
                    style={{ backgroundColor: PRIMARY_COLOR }}
                >
                    Try Refreshing
                </button>
            </div>
        );
    }
    
    if (wishlistItems.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-2xl shadow-2xl max-w-4xl mx-auto mt-10 border-t-8" style={{borderColor: PRIMARY_COLOR}}>
                <Heart className="w-16 h-16 text-red-500 mx-auto mb-6" />
                <p className="text-slate-600 text-2xl font-semibold mb-2">Your wishlist is empty.</p>
                <p className="text-slate-500 mb-6">Start saving the services you love!</p>
                <a 
                    href="/services" 
                    className={`inline-block mt-4 px-8 py-3 text-white font-bold rounded-full shadow-lg transition duration-300 hover:scale-[1.05]`}
                    style={{ backgroundColor: PRIMARY_COLOR }}
                >
                    Explore Services
                    <ChevronRight className="w-4 h-4 inline ml-2" />
                </a>
            </div>
        );
    }

    // --- Main Wishlist View ---
    return (
        <div className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
            <div className="max-w-6xl mx-auto px-4 py-12 sm:py-20">
                
                {/* Header */}
                <div className="flex items-center bg-white p-6 rounded-2xl shadow-xl mb-10 border-l-8" style={{ borderColor: PRIMARY_COLOR }}>
                    <Heart className={`w-8 h-8 mr-4 text-red-500`} />
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        My Saved Services ({wishlistItems.length})
                    </h1>
                </div>
                
                {/* Item List */}
                <div className="space-y-6">
                    {wishlistItems.map((item) => (
                        <WishlistItemCard 
                            key={item.id} 
                            item={item}
                            onRemove={handleRemoveItem}
                            onMoveToCart={handleMoveToCart}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}