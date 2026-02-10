"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase-client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";
import {
    ShoppingCart,
    X,
    Plus,
    Minus,
    IndianRupee,
    Loader2,
    Package,
    ChevronRight,
    AlertTriangle,
    Info,
    MapPin,
} from "lucide-react";

const PRIMARY_COLOR = "#8ED26B";
const ACCENT_COLOR = "#059669";
const LIGHT_BG = "#f5f7fa";
const BORDER_COLOR = "#e6f6dc";

const TAX_RATE = 0.18;

type ServiceType = "installation" | "dismantling" | "repair";

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

// Updated to match modal's ServiceAddress
type ServiceAddress = {
    fullName: string;
    mobile: string;
    alternateMobile: string;
    flatHousePlot: string;
    floor: string;
    buildingApartment: string;
    streetLocality: string;
    areaZone: string;
    landmark: string;
    cityTown: string;
    state: string;
    pincode: string;
};

const calculateUnitServicePrice = (
    service: ServiceDetails | null,
    selectedServices: ServiceType[] | null
): number => {
    if (!service || !selectedServices || selectedServices.length === 0) return 0;
    let totalPrice = 0;
    if (selectedServices.includes("installation"))
        totalPrice += +(service.installation_price || 0);
    if (selectedServices.includes("dismantling"))
        totalPrice += +(service.dismantling_price || 0);
    if (selectedServices.includes("repair"))
        totalPrice += +(service.repair_price || 0);
    return totalPrice;
};

const loadRazorpay = (): Promise<void> =>
    new Promise((resolve, reject) => {
        const scriptId = "razorpay-js";
        if (document.getElementById(scriptId)) return resolve();

        const script = document.createElement("script");
        script.id = scriptId;
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Razorpay SDK failed to load."));
        document.body.appendChild(script);
    });

// Updated AddressForm to match modal's structure
const AddressForm: React.FC<{
    fields: ServiceAddress;
    setFields: React.Dispatch<React.SetStateAction<ServiceAddress>>;
    errors: { [key: string]: string };
    disabled: boolean;
}> = ({ fields, setFields, errors, disabled }) => {
    const handleChange = (key: keyof ServiceAddress, value: string) => {
        setFields((prev) => ({ ...prev, [key]: value }));
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Customer Name *
                </label>
                <input
                    type="text"
                    value={fields.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                    disabled={disabled}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.fullName ? "border-red-500" : "border-gray-300"
                        }`}
                />
                {errors.fullName && (
                    <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                </label>
                <input
                    type="text"
                    value={fields.pincode}
                    onChange={(e) =>
                        handleChange(
                            "pincode",
                            e.target.value.replace(/\D/g, "").slice(0, 6)
                        )
                    }
                    disabled={disabled}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.pincode ? "border-red-500" : "border-gray-300"
                        }`}
                />
                {errors.pincode && (
                    <p className="text-red-500 text-sm mt-1">{errors.pincode}</p>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mobile Number *
                </label>
                <input
                    type="tel"
                    value={fields.mobile}
                    onChange={(e) =>
                        handleChange("mobile", e.target.value.replace(/\D/g, "").slice(0, 10))
                    }
                    disabled={disabled}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.mobile ? "border-red-500" : "border-gray-300"
                        }`}
                />
                {errors.mobile && (
                    <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Flat / House / Plot No *
                </label>
                <input
                    type="text"
                    value={fields.flatHousePlot}
                    onChange={(e) => handleChange("flatHousePlot", e.target.value)}
                    disabled={disabled}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.flatHousePlot ? "border-red-500" : "border-gray-300"
                        }`}
                />
                {errors.flatHousePlot && (
                    <p className="text-red-500 text-sm mt-1">{errors.flatHousePlot}</p>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Floor
                </label>
                <input
                    type="text"
                    value={fields.floor}
                    onChange={(e) => handleChange("floor", e.target.value)}
                    disabled={disabled}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Building Name
                </label>
                <input
                    type="text"
                    value={fields.buildingApartment}
                    onChange={(e) => handleChange("buildingApartment", e.target.value)}
                    disabled={disabled}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street / Locality *
                </label>
                <input
                    type="text"
                    value={fields.streetLocality}
                    onChange={(e) => handleChange("streetLocality", e.target.value)}
                    disabled={disabled}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.streetLocality ? "border-red-500" : "border-gray-300"
                        }`}
                />
                {errors.streetLocality && (
                    <p className="text-red-500 text-sm mt-1">{errors.streetLocality}</p>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Area / Zone
                </label>
                <input
                    type="text"
                    value={fields.areaZone}
                    onChange={(e) => handleChange("areaZone", e.target.value)}
                    disabled={disabled}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Landmark
                </label>
                <input
                    type="text"
                    value={fields.landmark}
                    onChange={(e) => handleChange("landmark", e.target.value)}
                    disabled={disabled}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    City / Town *
                </label>
                <input
                    type="text"
                    value={fields.cityTown}
                    onChange={(e) => handleChange("cityTown", e.target.value)}
                    disabled={disabled}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.cityTown ? "border-red-500" : "border-gray-300"
                        }`}
                />
                {errors.cityTown && (
                    <p className="text-red-500 text-sm mt-1">{errors.cityTown}</p>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                </label>
                <input
                    type="text"
                    value={fields.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    disabled={disabled}
                    className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 ${errors.state ? "border-red-500" : "border-gray-300"
                        }`}
                />
                {errors.state && (
                    <p className="text-red-500 text-sm mt-1">{errors.state}</p>
                )}
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Alternate Mobile
                </label>
                <input
                    type="tel"
                    value={fields.alternateMobile}
                    onChange={(e) =>
                        handleChange(
                            "alternateMobile",
                            e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                    }
                    disabled={disabled}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
            </div>
        </div>
    );
};

const RemoveModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    itemName: string;
}> = ({ isOpen, onClose, onConfirm, itemName }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-auto">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Confirm Removal</h3>
                <p className="text-gray-600 mb-6">
                    Are you sure you want to remove "{itemName}" from your cart?
                </p>
                <div className="flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                        Remove
                    </button>
                </div>
            </div>
        </div>
    );
};

const CartItemCard: React.FC<{
    item: CartItem;
    onUpdateQuantity: (id: number, newQuantity: number) => void;
    onUpdateSelectedServices: (id: number, newSelections: ServiceType[]) => void;
    onRemove: (id: number) => void;
}> = ({ item, onUpdateQuantity, onUpdateSelectedServices, onRemove }) => {
    const unitPrice = calculateUnitServicePrice(item.service, item.selected_services);
    const subtotal = item.quantity * unitPrice;
    const isServiceMissing = !item.service;

    const availableServices: { key: ServiceType; name: string; price: number }[] =
        useMemo(() => {
            const services: { key: ServiceType; name: string; price: number }[] = [];
            if (item.service) {
                if (item.service.installation_price && item.service.installation_price > 0) {
                    services.push({
                        key: "installation",
                        name: "Installation",
                        price: item.service.installation_price,
                    });
                }
                if (item.service.dismantling_price && item.service.dismantling_price > 0) {
                    services.push({
                        key: "dismantling",
                        name: "Dismantling",
                        price: item.service.dismantling_price,
                    });
                }
                if (item.service.repair_price && item.service.repair_price > 0) {
                    services.push({
                        key: "repair",
                        name: "Repair",
                        price: item.service.repair_price,
                    });
                }
            }
            return services;
        }, [item.service]);

    const handleServiceToggle = (key: ServiceType, isChecked: boolean) => {
        let newSelections = Array.isArray(item.selected_services)
            ? [...item.selected_services]
            : [];
        if (isChecked) {
            if (!newSelections.includes(key)) newSelections.push(key);
        } else {
            newSelections = newSelections.filter((k) => k !== key);
        }
        onUpdateSelectedServices(item.id, newSelections);
    };

    return (
        <div
            className="flex flex-col p-4 sm:p-6 bg-white rounded-2xl shadow-xl border-l-4 transition-all duration-300 relative h-full"
            style={{ borderLeftColor: isServiceMissing ? "#f59e0b" : PRIMARY_COLOR }}
        >
            <button
                onClick={() => onRemove(item.id)}
                disabled={item.isUpdating}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1 sm:p-2 bg-gray-100 text-gray-500 rounded-full hover:bg-red-50 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition z-10"
                title="Remove Item"
            >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start w-full min-w-0 pr-8 sm:pr-12">
                <div className="flex-shrink-0 relative w-20 h-20 sm:w-24 sm:h-24 mr-4 sm:mr-6 border rounded-xl overflow-hidden shadow-md">
                    {item.service?.image_url ? (
                        <Image
                            src={item.service.image_url}
                            alt={item.service.service_name || "Service Image"}
                            fill
                            style={{ objectFit: "cover" }}
                        />
                    ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                            <Package className="w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                    )}
                </div>

                <div className="flex-1 min-w-0 pt-1">
                    <h3 className="text-lg sm:text-xl font-extrabold text-gray-900 truncate mb-1">
                        {item.service?.service_name || "Service Not Found"}
                    </h3>

                    <p className="text-sm font-semibold text-gray-600 mb-2">
                        Base Price:{" "}
                        <span className="font-extrabold text-base sm:text-lg" style={{ color: ACCENT_COLOR }}>
                            ₹{unitPrice.toFixed(2)}
                        </span>
                    </p>

                    {availableServices.length > 0 && (
                        <div className="bg-white p-2 sm:p-3 rounded-lg border border-gray-200 mt-3 shadow-inner">
                            <p className="text-xs sm:text-sm font-bold text-gray-700 mb-2 flex items-center">
                                <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-1 text-gray-500" /> Choose Options:
                            </p>
                            <div className="flex flex-wrap gap-x-4 sm:gap-x-6 gap-y-2 text-xs sm:text-sm text-gray-600">
                                {availableServices.map((detail) => (
                                    <label key={detail.key} className="flex items-center space-x-1 sm:space-x-2 cursor-pointer transition hover:text-gray-800">
                                        <input
                                            type="checkbox"
                                            checked={item.selected_services?.includes(detail.key) || false}
                                            onChange={(e) => handleServiceToggle(detail.key, e.target.checked)}
                                            disabled={item.isUpdating || isServiceMissing}
                                            className="form-checkbox h-3 w-3 sm:h-4 sm:w-4 border-gray-300 rounded focus:ring-0"
                                            style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                                        />
                                        <span className="font-medium">{detail.name}</span>
                                        <span className="text-xs text-gray-500"> (₹{detail.price.toFixed(2)})</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}

                    {item.selected_services?.includes("repair") && (
                        <div className="mt-2 flex items-start gap-2 text-xs text-gray-500">
                            <Info className="w-4 h-4 mt-[2px]" />
                            <span>
                                Inspection fee only. Repair cost will be quoted after on-site assessment.
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full mt-4 sm:mt-6 pt-4 border-t border-gray-100 gap-4">
                <div className="flex items-center space-x-2 sm:space-x-3">
                    <span className="text-xs sm:text-sm font-semibold text-gray-700">Quantity:</span>
                    <div className="flex items-center space-x-1 border border-gray-300 rounded-full p-1 bg-gray-50">
                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1 || item.isUpdating || !item.service}
                            className="p-1 text-gray-600 hover:bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>

                        <span className="text-sm sm:text-base font-extrabold w-6 text-center text-gray-900">
                            {item.isUpdating ? (
                                <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 animate-spin mx-auto" style={{ color: PRIMARY_COLOR }} />
                            ) : (
                                item.quantity
                            )}
                        </span>

                        <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            disabled={item.isUpdating || !item.service}
                            className="p-1 text-gray-600 hover:bg-gray-200 rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                    </div>
                </div>

                <div className="text-left sm:text-right flex flex-col sm:items-end">
                    <p className="text-sm sm:text-lg text-gray-500 font-medium">Item Subtotal:</p>
                    <p className="text-2xl sm:text-3xl font-extrabold" style={{ color: PRIMARY_COLOR }}>
                        ₹{subtotal.toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default function CartPage() {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const router = useRouter();
    const [isPincodeValid, setIsPincodeValid] = useState(true);
    const [addressErrors, setAddressErrors] = useState<{ [key: string]: string }>({});
    const [submitAttempted, setSubmitAttempted] = useState(false);
    const [serviceablePincodes, setServiceablePincodes] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false); // Added for payment loading

    // Updated to use ServiceAddress type (matches modal)
    const [addressFields, setAddressFields] = useState<ServiceAddress>({
        fullName: "",
        mobile: "",
        alternateMobile: "",
        flatHousePlot: "",
        floor: "",
        buildingApartment: "",
        streetLocality: "",
        areaZone: "",
        landmark: "",
        cityTown: "",
        state: "",
        pincode: "",
    });

    const [removeModal, setRemoveModal] = useState<{
        isOpen: boolean;
        itemId: number | null;
        itemName: string;
    }>({ isOpen: false, itemId: null, itemName: "" });

    const fetchServiceablePincodes = useCallback(async () => {
        try {
            const { data, error } = await supabase.from("service_pincodes").select("pincode");
            if (error) throw error;
            setServiceablePincodes(data?.map((row: any) => row.pincode) || []);
        } catch (err: any) {
            console.error("Failed to fetch serviceable pincodes:", err);
            setServiceablePincodes([]);
        }
    }, []);

    useEffect(() => {
        fetchServiceablePincodes();
    }, [fetchServiceablePincodes]);

    const fetchCartItems = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const user = sessionData?.session?.user;
            if (!user) throw new Error("User not logged in");

            const { data, error } = await supabase
                .from("cart_items")
                .select("*, service:services(*)")
                .eq("user_id", user.id);

            if (error) throw error;
            setCartItems(data || []);
        } catch (err: any) {
            setError(err.message || "Failed to load cart.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCartItems();
    }, [fetchCartItems]);

    const cartSubtotal = useMemo(() => {
        return cartItems.reduce((sum, item) => {
            const unitPrice = calculateUnitServicePrice(item.service, item.selected_services);
            return sum + item.quantity * unitPrice;
        }, 0);
    }, [cartItems]);

    const taxAmount = Math.round(cartSubtotal * TAX_RATE);
    const cartTotal = cartSubtotal + taxAmount;

    // Updated validation to match modal
    const validateAddress = (f: ServiceAddress) => {
        const errors: { [key: string]: string } = {};

        if (!f.fullName?.trim()) errors.fullName = "Customer name is required.";
        if (!f.mobile || f.mobile.replace(/\D/g, "").length < 10)
            errors.mobile = "Valid 10-digit mobile number is required.";
        if (!f.flatHousePlot?.trim()) errors.flatHousePlot = "Flat / House / Plot No is required.";
        if (!f.streetLocality?.trim()) errors.streetLocality = "Street / Locality is required.";
        if (!f.cityTown?.trim()) errors.cityTown = "City / Town is required.";
        if (!f.state?.trim()) errors.state = "State is required.";

        const pincode = f.pincode?.trim();
        if (pincode) {
            if (!/^\d{6}$/.test(pincode)) {
                errors.pincode = "Must be 6 digits.";
            } else if (!serviceablePincodes.includes(pincode)) {
                errors.pincode = "Service not available in this pincode.";
            }
        } else {
            errors.pincode = "Check if the service is available in your location.";
        }

        return errors;
    };

    // Unified handleSubmit (matches modal)
    const handleSubmit = async (payment_id?: string, order_id?: string) => {
        try {
            const { data: sessionData } = await supabase.auth.getSession();
            const user = sessionData?.session?.user;
            if (!user) throw new Error("User not logged in");

            const userId = user.id;
            const userEmail = user.email;

            const now = new Date();
            const bookingDate = now.toISOString().split("T")[0]; // e.g., "2023-10-01"
            const bookingTime = now.toISOString().slice(11, 19); // e.g., "14:30:00"

            const fullAddress = `
            ${addressFields.flatHousePlot}${addressFields.floor ? ", Floor " + addressFields.floor : ""}
            ${addressFields.buildingApartment ? ", " + addressFields.buildingApartment : ""}
            ${addressFields.streetLocality}
            ${addressFields.areaZone ? ", " + addressFields.areaZone : ""}
            ${addressFields.landmark ? ", Near " + addressFields.landmark : ""}
            ${addressFields.cityTown}, ${addressFields.state} - ${addressFields.pincode}
        `.replace(/\n/g, " ").trim();

            const bookingRows = cartItems.map((item) => ({
                user_id: userId,
                customer_name: addressFields.fullName.slice(0, 255), // TEMP: Truncate if needed
                customer_mobile: addressFields.mobile, // Already 10 digits
                date: bookingDate,
                booking_time: bookingTime,
                status: payment_id ? "Paid" : "Pending",
                service_name: (item.service?.service_name || "Service").slice(0, 255), // TEMP: Truncate
                service_types: Array.isArray(item.selected_services) ? item.selected_services : [],
                total_price: item.quantity * calculateUnitServicePrice(item.service, item.selected_services),
                address: fullAddress.slice(0, 500), // TEMP: Truncate long addresses
                service_id: item.service_id,
                payment_id: payment_id || null,
                razorpay_order_id: order_id || null,
            }));

            const { data, error: bookingError } = await supabase
                .from("bookings")
                .insert(bookingRows)
                .select();
            const generatedOrderNo = data?.[0]?.order_no;

            if (bookingError) throw bookingError;

            console.log("Booking inserted:", data);

            const servicesBooked = cartItems.map((i) => i.service?.service_name || "Unknown Service").join(", ");

            await supabase.from("cart_items").delete().eq("user_id", userId);
            setCartItems([]);

            toast({
                title: "Booking confirmed",
                description: "Your service has been booked successfully.",
                variant: "success",
            });

            if (userEmail) {
                await fetch("/api/send-email", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: userEmail,
                        name: addressFields.fullName,
                        service: servicesBooked,
                        date: bookingDate,
                        time: bookingTime,
                        amount: cartTotal,
                        payment_id: payment_id || null,
                        razorpay_order_id: order_id || null,
                    }),
                });
            }

            router.push("/site/order-tracking");

        } catch (err: any) {
            console.error("Booking insert failed:", err?.message || err);
            toast({
                title: "Payment successful, booking failed",
                description: "Please contact support with payment ID: " + (payment_id || "N/A"),
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };
    // Updated Razorpay payment (matches modal)
    const handleRazorpayPayment = useCallback(async () => {
        setSubmitAttempted(true);

        if (cartItems.length === 0) {
            toast({ title: "Cart empty", description: "Add items before checkout.", variant: "destructive" });
            return;
        }

        const errors = validateAddress(addressFields);
        setAddressErrors(errors);

        const hasInvalidItems = cartItems.some((it) => !it.service || !it.selected_services?.length);
        if (Object.keys(errors).length > 0 || hasInvalidItems) {
            if (hasInvalidItems) {
                toast({
                    title: "Selection missing",
                    description: "Please select service options for all items.",
                    variant: "destructive",
                });
            }
            return;
        }

        setIsSubmitting(true);

        try {
            await loadRazorpay();
        } catch {
            toast({ title: "Payment Error", description: "Failed to load Razorpay.", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        const orderRes = await fetch("/api/razorpay/create-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: cartTotal * 100 }),
        });

        const orderData = await orderRes.json();

        if (!orderRes.ok) {
            toast({ title: "Order failed", description: orderData.error || "Order creation failed", variant: "destructive" });
            setIsSubmitting(false);
            return;
        }

        const options = {
            key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
            amount: orderData.amount,
            currency: "INR",
            name: "Insta Fit Core",
            order_id: orderData.id,
            description: "Service Booking Payment",
            prefill: { name: addressFields.fullName, contact: addressFields.mobile },
            theme: { color: PRIMARY_COLOR },

            handler: async function (response: any) {
                await verifyAndSavePayment({
                    payment_id: response.razorpay_payment_id,
                    order_id: response.razorpay_order_id,
                    signature: response.razorpay_signature,
                });
            },
        };

        const razorpay = new (window as any).Razorpay(options);
        razorpay.open();
    }, [cartItems, cartTotal, addressFields, toast, router, serviceablePincodes]);

    // Added verifyAndSavePayment (matches modal)
    const verifyAndSavePayment = async ({ payment_id, order_id, signature }: any) => {
        const res = await fetch("/api/razorpay/verify-payment", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ payment_id, order_id, signature }),
        });

        const data = await res.json();

        if (!data?.success) {
            throw new Error(data?.error || "Payment verification failed");
        }

        await handleSubmit(payment_id, order_id);
    };

    // Handle on-site payment (no payment_id, order_id)
    const handleOnSitePayment = useCallback(async () => {
        setSubmitAttempted(true);

        if (cartItems.length === 0) {
            toast({ title: "Cart empty", description: "Add items before checkout.", variant: "destructive" });
            return;
        }

        const errors = validateAddress(addressFields);
        setAddressErrors(errors);

        const hasInvalidItems = cartItems.some((it) => !it.service || !it.selected_services?.length);
        if (Object.keys(errors).length > 0 || hasInvalidItems) {
            if (hasInvalidItems) {
                toast({
                    title: "Selection missing",
                    description: "Please select service options for all items.",
                    variant: "destructive",
                });
            }
            return;
        }

        setIsSubmitting(true);
        await handleSubmit(); // No payment_id, order_id for on-site
    }, [cartItems, addressFields, toast, router, serviceablePincodes]);

   const handleUseMyLocation = () => {
  if (!navigator.geolocation) {
    toast({
      title: "Not supported",
      description: "Geolocation is not supported on this device.",
      variant: "destructive",
    });
    return;
  }

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      try {
        const { latitude, longitude } = position.coords;

        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              Accept: "application/json",
              "User-Agent": "InstaFitCore/1.0",
            },
          }
        );

        const data = await res.json();

        if (!data?.address) throw new Error();

        const addr = data.address;

        setAddressFields((prev) => ({
          ...prev,
          streetLocality: addr.road || "",
          areaZone: addr.suburb || addr.neighbourhood || "",
          cityTown: addr.city || addr.town || addr.village || "",
          state: addr.state || "",
          pincode: addr.postcode || "",
        }));

        toast({
          title: "Location detected",
          description: "Address filled successfully.",
          variant: "success",
        });
      } catch {
        toast({
          title: "Failed",
          description: "Unable to detect address from location.",
          variant: "destructive",
        });
      }
    },
    (error) => {
      let msg = "Location access failed.";

      if (error.code === 1)
        msg = "Please allow location permission in browser settings.";
      if (error.code === 2)
        msg = "Location unavailable.";
      if (error.code === 3)
        msg = "Location request timed out.";

      toast({
        title: "Location Error",
        description: msg,
        variant: "destructive",
      });
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    }
  );
};


    useEffect(() => {
        const errors = validateAddress(addressFields);
        setAddressErrors(errors);

        const pincode = addressFields.pincode.replace(/\D/g, "");
        setIsPincodeValid(!!pincode && serviceablePincodes.includes(pincode));
    }, [addressFields, serviceablePincodes]);

    const handleUpdateSelectedServices = useCallback(
        async (itemId: number, newSelections: ServiceType[]) => {
            setCartItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, isUpdating: true } : it)));
            const { error } = await supabase.from("cart_items").update({ selected_services: newSelections }).eq("id", itemId);
            if (error) {
                toast({ title: "Update failed", description: error.message, variant: "destructive" });
            }
            setCartItems((prev) =>
                prev.map((it) => (it.id === itemId ? { ...it, selected_services: newSelections, isUpdating: false } : it))
            );
        },
        [toast]
    );

    const handleUpdateQuantity = useCallback(
        async (itemId: number, newQuantity: number) => {
            if (newQuantity < 1) return;
            setCartItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, isUpdating: true } : it)));
            try {
                const { error } = await supabase.from("cart_items").update({ quantity: newQuantity }).eq("id", itemId);
                if (error) throw error;
                setCartItems((prev) =>
                    prev.map((it) => (it.id === itemId ? { ...it, quantity: newQuantity, isUpdating: false } : it))
                );
            } catch (error) {
                toast({ title: "Update failed", description: "Retrying...", variant: "destructive" });
                setCartItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, isUpdating: false } : it)));
            }
        },
        [toast]
    );

    const handleRemoveItem = useCallback(
        async (itemId: number) => {
            const item = cartItems.find((it) => it.id === itemId);
            if (!item) return;

            setRemoveModal({
                isOpen: true,
                itemId,
                itemName: item.service?.service_name || "this item",
            });
        },
        [cartItems]
    );

    const confirmRemoveItem = useCallback(async () => {
        const { itemId } = removeModal;
        if (!itemId) return;

        setCartItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, isUpdating: true } : it)));
        const { error } = await supabase.from("cart_items").delete().eq("id", itemId);
        if (error) {
            toast({ title: "Remove failed", description: error.message, variant: "destructive" });
            setCartItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, isUpdating: false } : it)));
        } else {
            setCartItems((prev) => prev.filter((it) => it.id !== itemId));
            toast({ title: "Removed", description: "Item removed from cart.", variant: "default" });
        }
        setRemoveModal({ isOpen: false, itemId: null, itemName: "" });
    }, [removeModal, toast]);

    if (loading)
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-20">
                <Loader2 className={`animate-spin h-12 w-12 mb-4`} style={{ color: PRIMARY_COLOR }} />
                <p className="text-xl font-medium text-gray-600">Loading your cart...</p>
            </div>
        );

    if (error)
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-20">
                <div className="p-8 bg-red-50 border border-red-300 text-red-700 rounded-xl flex flex-col items-center shadow-lg max-w-2xl mx-auto">
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

    if (cartItems.length === 0)
        return (
            <div className="text-center py-24 bg-white rounded-2xl shadow-2xl max-w-4xl mx-auto mt-12 border-t-4" style={{ borderColor: PRIMARY_COLOR }}>
                <Package className="w-16 h-16 text-slate-400 mx-auto mb-6" />
                <p className="text-slate-700 text-2xl font-bold mb-3">Your cart is empty.</p>
                <p className="text-slate-500 text-lg mb-6">Looks like you haven't added any services yet.</p>
                <a
                    href="/site/services"
                    className={`inline-block mt-4 px-8 py-3 text-white font-semibold rounded-full shadow-xl transition duration-300 hover:scale-[1.02]`}
                    style={{ backgroundColor: PRIMARY_COLOR }}
                >
                    Explore Services
                    <ChevronRight className="w-5 h-5 inline ml-2" />
                </a>
            </div>
        );

    return (
        <div className="min-h-screen" style={{ backgroundColor: LIGHT_BG }}>
            <div className="max-w-6xl mx-auto px-4 py-12 sm:py-16">
                {/* HEADER */}
                <div className="flex items-center bg-white p-4 sm:p-6 lg:p-8 rounded-3xl shadow-2xl mb-6 sm:mb-10 border-t-8" style={{ borderColor: PRIMARY_COLOR }}>
                    <ShoppingCart className={`w-8 h-8 sm:w-10 sm:h-10 mr-4`} style={{ color: PRIMARY_COLOR }} />
                    <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">Your Service Cart ({cartItems.length})</h1>
                </div>

                {/* Cart Items */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl mb-8 border border-gray-100">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 border-b-2 pb-2 mb-6" style={{ borderColor: PRIMARY_COLOR }}>
                        <Package className="w-5 h-5 inline-block mr-2" style={{ color: PRIMARY_COLOR }} /> Items in Cart
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                </div>

                {/* Address */}
                <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-xl mb-8 border border-gray-100">
                    <div className="flex items-center justify-between border-b-2 pb-2 mb-6" style={{ borderColor: PRIMARY_COLOR }}>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
                            <MapPin className="w-5 h-5 inline-block mr-2" style={{ color: PRIMARY_COLOR }} />
                            Service Address
                        </h2>

                        <button
                            type="button"
                            onClick={handleUseMyLocation}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg text-white shadow-md hover:opacity-90 transition"
                            style={{ backgroundColor: PRIMARY_COLOR }}
                        >
                            <MapPin className="w-4 h-4" />
                            Use My Location
                        </button>
                    </div>

                    <AddressForm
                        fields={addressFields}
                        setFields={setAddressFields}
                        errors={{
                            ...(submitAttempted ? addressErrors : {}),
                            pincode: addressErrors.pincode,
                        }}
                        disabled={cartItems.some((it) => it.isUpdating)}
                    />
                </div>

                {/* Summary */}
                <div className="p-6 sm:p-8 rounded-2xl shadow-2xl" style={{ backgroundColor: BORDER_COLOR, border: `2px solid ${PRIMARY_COLOR}` }}>
                    <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 border-b pb-3 text-gray-800 flex items-center">
                        <IndianRupee className="w-5 h-5 mr-2" style={{ color: ACCENT_COLOR }} /> Payment Details
                    </h2>

                    <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8 text-lg font-medium">
                        <div className="flex justify-between text-gray-700">
                            <p>Items Total</p>
                            <p className="font-extrabold text-gray-900">₹{cartSubtotal.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <p>Taxes & Fees (18% GST)</p>
                            <p className="font-bold">₹{taxAmount.toFixed(2)}</p>
                        </div>
                        <div className="flex justify-between text-gray-700">
                            <p>Discount</p>
                            <p className="font-bold text-red-600">- ₹0.00</p>
                        </div>
                    </div>

                    <div className="flex justify-between items-center text-2xl sm:text-3xl font-extrabold border-t-2 border-gray-500 pt-4">
                        <p>Total Payable</p>
                        <p style={{ color: PRIMARY_COLOR }} className="flex items-center">₹{cartTotal.toFixed(2)}</p>
                    </div>

                    {/* Payment Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 mt-6 sm:mt-8">
                        <button
                            onClick={handleRazorpayPayment}
                            disabled={
                                cartItems.length === 0 ||
                                cartItems.some((it) => !it.selected_services?.length) ||
                                !isPincodeValid ||
                                cartItems.some((it) => it.isUpdating) ||
                                isSubmitting
                            }
                            className={`flex-1 py-3 sm:py-4 text-white text-lg sm:text-xl font-bold rounded-xl shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-[1.01] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed`}
                            style={{ backgroundColor: PRIMARY_COLOR }}
                        >
                            {isSubmitting ? <><Loader2 className="animate-spin w-5 h-5 mr-2" />Processing...</> : "Pay Now"}
                            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
                        </button>

                        <button
                            onClick={handleOnSitePayment}
                            disabled={
                                cartItems.length === 0 ||
                                cartItems.some((it) => !it.selected_services?.length) ||
                                !isPincodeValid ||
                                cartItems.some((it) => it.isUpdating) ||
                                isSubmitting
                            }
                            className={`flex-1 py-3 sm:py-4 text-white text-lg sm:text-xl font-bold rounded-xl shadow-xl transition-all duration-300 flex items-center justify-center hover:scale-[1.01] hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed`}
                            style={{ backgroundColor: ACCENT_COLOR }}
                        >
                            {isSubmitting ? <><Loader2 className="animate-spin w-5 h-5 mr-2" />Processing...</> : "On-Site Payment"}
                            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
                        </button>
                    </div>

                    <div className="mt-4 sm:mt-6 p-3 text-xs sm:text-sm rounded-lg text-gray-600 bg-white border border-gray-200 flex items-center">
                        <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-2 flex-shrink-0" />
                        <span className="font-medium">Prices are subject to final service inspection.</span>
                    </div>
                </div>
            </div>

            <RemoveModal
                isOpen={removeModal.isOpen}
                onClose={() => setRemoveModal({ isOpen: false, itemId: null, itemName: "" })}
                onConfirm={confirmRemoveItem}
                itemName={removeModal.itemName}
            />
        </div>
    );
}