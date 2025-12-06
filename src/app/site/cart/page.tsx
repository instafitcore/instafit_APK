"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase-client"; 
import Image from "next/image";
import { ShoppingCart, X, Plus, Minus, DollarSign, Loader2, Package, ChevronRight, AlertTriangle, CheckCircle, Info } from "lucide-react";

// --- Configuration & Styling ---
const PRIMARY_COLOR = "#8ED26B"; // REVERTED TO ORIGINAL GREEN
const ACCENT_COLOR = "#059669"; // Green for positive numbers/total
const LIGHT_BG = "#f5f7fa";
const CARD_BG = "#ffffff"; 
const BORDER_COLOR = "#e6f6dc"; // Light green border for summary (matches #8ED26B theme) 

// --- Type Definitions ---
type ServiceType = 'installation' | 'dismantling' | 'repair';

type ServiceDetails = {
    id: number;
    service_name: string;
    installation_price: number | null; 
    dismantling_price: number | null; 
    repair_price: number | null;
    image_url: string | null;
};

type CartItem = {
    id: number;
    user_id: string;
    service_id: number;
    quantity: number;
    created_at: string;
    selected_services: ServiceType[] | null; 
    service: ServiceDetails | null; 
    isUpdating: boolean; 
};

// --- Helper Functions ---

/**
 * Calculates the unit price based ONLY on the selected service types.
 */
const calculateUnitServicePrice = (
    service: ServiceDetails | null, 
    selectedServices: ServiceType[] | null
): number => {
    if (!service || !selectedServices || selectedServices.length === 0) return 0;

    let totalPrice = 0;
    
    if (selectedServices.includes('installation')) {
        totalPrice += +(service.installation_price || 0);
    }
    if (selectedServices.includes('dismantling')) {
        totalPrice += +(service.dismantling_price || 0);
    }
    if (selectedServices.includes('repair')) {
        totalPrice += +(service.repair_price || 0);
    }

    return totalPrice;
};

// --- Helper Components (Revised) ---

/**
 * Renders a single item in the cart with quantity controls and removal button.
 */
const CartItemCard: React.FC<{ 
    item: CartItem; 
    onUpdateQuantity: (id: number, newQuantity: number) => void;
    onUpdateSelectedServices: (id: number, newSelections: ServiceType[]) => void;
    onRemove: (id: number) => void;
}> = ({ item, onUpdateQuantity, onUpdateSelectedServices, onRemove }) => {
    
    const unitPrice = calculateUnitServicePrice(item.service, item.selected_services);
    const subtotal = item.quantity * unitPrice;
    const isServiceMissing = !item.service;
    
    const availableServices: { key: ServiceType, name: string, price: number }[] = useMemo(() => {
        const services: { key: ServiceType, name: string, price: number }[] = [];
        if (item.service) {
            if (item.service.installation_price && item.service.installation_price > 0) {
                services.push({ key: 'installation', name: 'Installation', price: item.service.installation_price });
            }
            if (item.service.dismantling_price && item.service.dismantling_price > 0) {
                services.push({ key: 'dismantling', name: 'Dismantling', price: item.service.dismantling_price });
            }
            if (item.service.repair_price && item.service.repair_price > 0) {
                services.push({ key: 'repair', name: 'Repair', price: item.service.repair_price });
            }
        }
        return services;
    }, [item.service]);

    // Handle Checkbox Change
    const handleServiceToggle = (key: ServiceType, isChecked: boolean) => {
        let newSelections = Array.isArray(item.selected_services) ? [...item.selected_services] : [];
        
        if (isChecked) {
            if (!newSelections.includes(key)) {
                newSelections.push(key);
            }
        } else {
            newSelections = newSelections.filter(serviceKey => serviceKey !== key);
        }
        onUpdateSelectedServices(item.id, newSelections);
    };

    return (
        <div 
            className="flex flex-col p-6 bg-white rounded-2xl shadow-xl border-l-4 transition-all duration-300 hover:shadow-2xl relative"
            style={{ borderLeftColor: isServiceMissing ? '#f59e0b' : PRIMARY_COLOR }}
        >
            {/* Remove Button (Positioned Top Right) */}
            <button
                onClick={() => onRemove(item.id)}
                disabled={item.isUpdating}
                className="absolute top-4 right-4 p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-red-50 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition z-10"
                title="Remove Item"
            >
                <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col sm:flex-row items-start w-full min-w-0 pr-12">
                
                {/* Image / Placeholder */}
                <div className="flex-shrink-0 relative w-24 h-24 mr-6 border rounded-xl overflow-hidden shadow-md">
                    {item.service?.image_url ? (
                        <Image
                            src={item.service.image_url}
                            alt={item.service.service_name || "Service Image"}
                            fill
                            style={{ objectFit: 'cover' }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <Package className="w-10 h-10" />
                        </div>
                    )}
                </div>

                {/* Service Info & Selection */}
                <div className="flex-1 min-w-0 pt-1">
                    <h3 className="text-xl font-extrabold text-gray-900 truncate mb-1">
                        {item.service?.service_name || "Service Not Found"}
                    </h3>
                    
                    <p className="text-sm font-semibold text-gray-600 mb-2">
                        Base Price: <span className="font-extrabold text-lg" style={{ color: ACCENT_COLOR }}>₹{unitPrice.toFixed(2)}</span>
                    </p>

                    {/* Service Selection Checkboxes */}
                    {availableServices.length > 0 && (
                        <div className="bg-white p-3 rounded-lg border border-gray-200 mt-3 shadow-inner">
                            <p className="text-sm font-bold text-gray-700 mb-2 flex items-center">
                                <Info className="w-4 h-4 mr-1 text-gray-500" /> Choose Options:
                            </p>
                            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
                                {availableServices.map(detail => (
                                    <label key={detail.key} className="flex items-center space-x-2 cursor-pointer transition hover:text-gray-800">
                                        <input
                                            type="checkbox"
                                            checked={item.selected_services?.includes(detail.key) || false}
                                            onChange={(e) => handleServiceToggle(detail.key, e.target.checked)}
                                            disabled={item.isUpdating || isServiceMissing}
                                            className="form-checkbox h-4 w-4 border-gray-300 rounded focus:ring-0"
                                            style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                                        />
                                        <span className="font-medium">{detail.name}</span>
                                        <span className="text-xs text-gray-500"> (₹{detail.price.toFixed(2)})</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Quantity Controls & Final Price Footer */}
            <div className="flex items-center justify-between w-full mt-6 pt-4 border-t border-gray-100">
                
                {/* Quantity */}
                <div className="flex items-center space-x-3">
                    <span className="text-sm font-semibold text-gray-700">Quantity:</span>
                    <div className="flex items-center space-x-1 border border-gray-300 rounded-full p-1 bg-gray-50">
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || item.isUpdating || isServiceMissing}
                            className="p-1 text-gray-600 hover:bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="text-base font-extrabold w-6 text-center text-gray-900">
                            {item.isUpdating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" style={{ color: PRIMARY_COLOR }} /> : item.quantity}
                        </span>
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.isUpdating || isServiceMissing}
                            className="p-1 text-gray-600 hover:bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                {/* Final Subtotal */}
                <div className="text-right flex items-center space-x-2">
                    <p className="text-lg text-gray-500 font-medium">Item Subtotal:</p>
                    <p className="text-3xl font-extrabold" style={{ color: PRIMARY_COLOR }}>
                        ₹{subtotal.toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
};

// =========================================================================
//                             Main Component (CartPage)
// =========================================================================

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // --- Data Fetching Logic (Two-Step Fetch) ---
    const fetchCartItems = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        const { data: sessionData } = await supabase.auth.getSession();
        const userId = sessionData?.session?.user?.id;

        if (!userId) {
            setError("Please log in to view your cart.");
            setCartItems([]);
            setLoading(false);
            return;
        }

        // 1. Fetch cart items for the user, including 'selected_services'
        const { data: cartData, error: cartError } = await supabase
            .from("cart_items")
            .select("*, selected_services")
            .eq("user_id", userId);

        if (cartError) {
            setError("Failed to load cart items. Please check RLS policy on 'cart_items'.");
            setLoading(false);
            return;
        }
        
        if (!cartData || cartData.length === 0) {
            setCartItems([]);
            setLoading(false);
            return;
        }

        // 2. Fetch service details
        const serviceIds = cartData.map((item: any) => item.service_id);
        const { data: servicesData, error: servicesError } = await supabase
            .from("services")
            .select("id, service_name, installation_price, image_url, dismantling_price, repair_price")
            .in("id", serviceIds);

        if (servicesError) {
            setError("Failed to load service details. Please check RLS policy on 'services'.");
            setLoading(false);
            return;
        }

        // 3. Merge and set state
        const serviceMap = new Map(servicesData.map((s: any) => [s.id, s]));

        const merged: CartItem[] = cartData.map((item: any) => ({
            ...item,
            service: serviceMap.get(item.service_id) || null,
            // Ensure selected_services is an array, default to empty array if null
            selected_services: item.selected_services || [], 
            isUpdating: false,
        }));

        setCartItems(merged);
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    // --- Cart Actions & Calculations ---

    const cartTotal = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            const unitPrice = calculateUnitServicePrice(item.service, item.selected_services);
            return sum + (item.quantity * unitPrice);
        }, 0);
    }, [cartItems]);

    const handleUpdateSelectedServices = useCallback(async (itemId: number, newSelections: ServiceType[]) => {
        setCartItems(prev => prev.map(item => 
            item.id === itemId ? { ...item, isUpdating: true } : item
        ));
        
        const { error } = await supabase
            .from('cart_items')
            .update({ selected_services: newSelections })
            .eq('id', itemId);

        if (error) {
            console.error("Selected services update error:", error);
            setError(`Failed to update service selection: ${error.message}`);
        }
        
        // Update local state regardless of error to quickly reflect change, but reset updating flag
        setCartItems(prev => prev.map(item => 
            item.id === itemId ? { ...item, selected_services: newSelections, isUpdating: false } : item
        ));

    }, []);

    const handleUpdateQuantity = useCallback(async (itemId: number, newQuantity: number) => {
        if (newQuantity < 1) return;
        
        setCartItems(prev => prev.map(item => 
            item.id === itemId ? { ...item, isUpdating: true } : item
        ));
        
        const { error } = await supabase
            .from('cart_items')
            .update({ quantity: newQuantity })
            .eq('id', itemId);

        if (error) {
            console.error("Quantity update error:", error);
            setError(`Failed to update quantity: ${error.message}`);
        } else {
            setCartItems(prev => prev.map(item => 
                item.id === itemId ? { ...item, quantity: newQuantity, isUpdating: false } : item
            ));
        }
    }, []);

    const handleRemoveItem = useCallback(async (itemId: number) => {
        if (!confirm("Are you sure you want to remove this item?")) return;
        
        setCartItems(prev => prev.map(item => 
            item.id === itemId ? { ...item, isUpdating: true } : item
        ));

        const { error } = await supabase
            .from('cart_items')
            .delete()
            .eq('id', itemId);

        if (error) {
            console.error("Remove item error:", error);
            setError(`Failed to remove item: ${error.message}`);
            setCartItems(prev => prev.map(item => 
                item.id === itemId ? { ...item, isUpdating: false } : item
            ));
        } else {
            setCartItems(prev => prev.filter(item => item.id !== itemId));
        }
    }, []);
    
    const handleCheckout = () => {
        const hasUnselectedItems = cartItems.some(item => 
            !item.service || (item.selected_services && item.selected_services.length === 0)
        );

        if (hasUnselectedItems) {
            alert("Please select at least one service option (Installation, Dismantling, or Repair) for all items before checking out.");
            return;
        }

        alert(`Proceeding to checkout with total of ₹${cartTotal.toFixed(2)}.`);
    };

    // --- Render Loading/Error/Empty States ---
    if (loading) return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-20">
            <Loader2 className={`animate-spin h-12 w-12 mb-4`} style={{ color: PRIMARY_COLOR }} />
            <p className="text-xl font-medium text-gray-600">Loading your cart...</p>
        </div>
    );
    
    if (error) return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-20">
            <div className="p-8 bg-red-50 border border-red-300 text-red-700 rounded-xl flex flex-col items-center shadow-lg max-w-lg mx-auto">
                <AlertTriangle className="w-8 h-8 mb-3" />
                <span className="text-xl font-bold mb-3">System Error</span>
                <span className="text-center font-medium">{error}</span>
            </div>
            <button
                onClick={fetchCartItems}
                className="mt-6 px-8 py-3 text-white font-semibold rounded-full shadow-lg transition duration-300 hover:shadow-xl"
                style={{ backgroundColor: PRIMARY_COLOR }}
            >
                Try Refreshing
            </button>
        </div>
    );
    
    if (cartItems.length === 0) return (
        <div className="text-center py-24 bg-white rounded-2xl shadow-2xl max-w-4xl mx-auto mt-12 border-t-4" style={{ borderColor: PRIMARY_COLOR }}>
            <Package className="w-16 h-16 text-slate-400 mx-auto mb-6" />
            <p className="text-slate-700 text-2xl font-bold mb-3">Your cart is empty.</p>
            <p className="text-slate-500 text-lg mb-6">Looks like you haven't added any services yet.</p>
            <a 
                href="/services" 
                className={`inline-block mt-4 px-8 py-3 text-white font-semibold rounded-full shadow-xl transition duration-300 hover:scale-[1.02]`}
                style={{ backgroundColor: PRIMARY_COLOR }}
            >
                Explore Services
                <ChevronRight className="w-5 h-5 inline ml-2" />
            </a>
        </div>
    );
    
    // --- Main Cart View ---
    return (
        <div className="min-h-screen bg-gray-50 px-4 py-12 sm:py-20">
            <div className="max-w-6xl mx-auto">
                
                {/* Header */}
                <div className="flex items-center bg-white p-6 sm:p-8 rounded-2xl shadow-xl mb-10 border-t-4" style={{ borderColor: PRIMARY_COLOR }}>
                    <ShoppingCart className={`w-8 h-8 sm:w-10 sm:h-10 mr-4`} style={{ color: PRIMARY_COLOR }} />
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                        Shopping Cart ({cartItems.length})
                    </h1>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Column 1 & 2: Item List */}
                    <div className="lg:col-span-2 space-y-6">
                        {cartItems.map((item) => (
                            <CartItemCard 
                                key={item.id} 
                                item={item}
                                onUpdateQuantity={handleUpdateQuantity}
                                onUpdateSelectedServices={handleUpdateSelectedServices}
                                onRemove={handleRemoveItem}
                            />
                        ))}
                    </div>

                    {/* Column 3: Summary Panel (FIXED HEIGHT/SCROLL) */}
                    <div 
                        className="lg:col-span-1 sticky top-8" 
                        // The max-h-screen and overflow-y-auto fix the container height issue. 
                        // The max height is calculated to fit within the viewport, minus the top offset.
                        style={{ top: '2rem' }} // Ensures alignment with the top of the grid
                    >
                        <div 
                            className="p-6 sm:p-8 rounded-2xl shadow-2xl max-h-[calc(100vh-4rem)] overflow-y-auto"
                            style={{ backgroundColor: BORDER_COLOR, border: `2px solid ${PRIMARY_COLOR}` }}
                        >
                            <h2 className="text-2xl font-bold mb-6 border-b pb-3 text-gray-800 flex items-center">
                                <DollarSign className="w-5 h-5 mr-2" /> Order Summary
                            </h2>
                            
                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between text-gray-700 text-lg">
                                    <p>Items Total</p>
                                    <p className="font-bold">₹{cartTotal.toFixed(2)}</p>
                                </div>
                                <div className="flex justify-between text-gray-700 text-lg">
                                    <p>Taxes & Fees</p>
                                    <p className="font-bold">₹0.00</p> 
                                </div>
                                <div className="flex justify-between text-gray-700 text-lg border-t border-gray-400 pt-4">
                                    <p>Discount</p>
                                    <p className="font-bold text-red-600">- ₹0.00</p> 
                                </div>
                            </div>
                            
                            <div className="flex justify-between items-center text-3xl font-extrabold border-t-2 border-gray-500 pt-4">
                                <p>Total Payable</p>
                                <p style={{ color: PRIMARY_COLOR }} className="flex items-center">
                                    ₹{cartTotal.toFixed(2)}
                                </p>
                            </div>

                            <button
                                onClick={handleCheckout}
                                disabled={cartItems.length === 0 || cartTotal === 0}
                                className={`w-full mt-8 py-4 text-white text-xl font-bold rounded-xl shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-[1.01] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed`}
                                style={{ backgroundColor: PRIMARY_COLOR }}
                            >
                                Proceed to Checkout
                                <ChevronRight className="w-6 h-6 ml-2" />
                            </button>
                            
                            <div className="mt-6 p-3 text-sm rounded-lg text-gray-600 bg-white border border-gray-200 flex items-center">
                                <Info className="w-4 h-4 mr-2 flex-shrink-0" />
                                <span className="font-medium">Prices are subject to final service inspection.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}