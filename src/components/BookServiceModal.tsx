"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Calendar, Clock, MapPin, DollarSign, Zap, Loader2, CheckCircle, AlertTriangle, X } from "lucide-react";

// --- Configuration & Styling ---
const PRIMARY_COLOR = "#8ed26b"; // The requested green color
const ACCENT_COLOR = "#10b981"; // Tailwind emerald-500 for secondary success/price (kept for visual contrast)
const LIGHT_BG = "#f5f7fa";
const BORDER_COLOR = "#e6f6dc"; // Lightest shade of the green for borders

// --- Type Definitions ---

// In BookServiceModal.tsx

type ServiceItem = {
    id: number; // 💡 ADDED: The primary key of the services table
    service_name: string;
    installation_price: number | null;
    dismantling_price: number | null;
    repair_price: number | null;
};

type Props = {
    service: ServiceItem;
    isOpen: boolean;
    onClose: () => void;
};

// Map service keys to human-readable labels and price keys
const SERVICE_TYPES = [
    { key: "Installation", label: "Installation", priceKey: "installation_price" as keyof ServiceItem },
    { key: "Dismantle", label: "Dismantle", priceKey: "dismantling_price" as keyof ServiceItem },
    { key: "Repair", label: "Repair", priceKey: "repair_price" as keyof ServiceItem },
];

// --- Main Component ---

export default function BookServiceModal({ service, isOpen, onClose }: Props) {
    const [serviceTypes, setServiceTypes] = useState<string[]>([]);
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [address, setAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const [errors, setErrors] = useState<{ date?: string; time?: string; serviceTypes?: string; address?: string }>({});

    const today = new Date();
    const minDate = today.toISOString().split("T")[0];

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen) {
            setServiceTypes([]);
            setDate("");
            setTime("");
            setAddress("");
            setErrors({});
            setSubmissionStatus('idle');
        }
    }, [isOpen]);

    // Calculate total price based on selected services
    // Calculation from your code:
const totalPrice = serviceTypes.reduce((sum, type) => {
    const option = SERVICE_TYPES.find(opt => opt.key === type);
    const price = option ? +(service[option.priceKey] || 0) : 0;
    return sum + price;
}, 0);

    const toggleService = (type: string) => {
        setServiceTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
        setErrors(prev => ({ ...prev, serviceTypes: undefined }));
    };

    const toggleAllServices = () => {
        const availableTypes = SERVICE_TYPES
            .filter(opt => service[opt.priceKey] && service[opt.priceKey]! > 0)
            .map(opt => opt.key);

        setServiceTypes(prev => prev.length === availableTypes.length ? [] : availableTypes);
    };

    // --- Validation Logic ---
    // --- Validation Logic (FIXED) ---
    const validateForm = () => {
        const newErrors: typeof errors = {};
        const now = new Date();
        const selectedDateTime = date && time ? new Date(`${date}T${time}:00`) : null;

        if (!date) {
            newErrors.date = "Please select a date.";
        }

        if (!time) {
            newErrors.time = "Please select a time.";
        }

        // Consolidated future date/time check
        if (selectedDateTime && selectedDateTime < now) {
            // If a valid date/time object was created but it is in the past
            newErrors.date = "The date and time must be in the future.";
            newErrors.time = "The date and time must be in the future.";
            // We set both errors to be explicit to the user
        }

        if (serviceTypes.length === 0) newErrors.serviceTypes = "Please select at least one service.";
        if (!address.trim()) newErrors.address = "Please enter your address.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Check if the form is valid for enabling the submit button
    const isFormValid = serviceTypes.length > 0 && date && time && address.trim() && Object.keys(errors).length === 0 && totalPrice > 0;

    // --- Submission Handler ---
    // --- Submission Handler ---
    const handleSubmit = async () => {
        if (!validateForm() || isSubmitting) return;

        setIsSubmitting(true);
        setSubmissionStatus('idle');

        try {
            const { data: userData, error: userError } = await supabase.auth.getUser();
            if (userError || !userData.user) {
                setSubmissionStatus('error');
                console.error("Authentication Error:", userError);
                alert("You must be logged in to book a service.");
                return;
            }

            const { error } = await supabase.from("bookings").insert([
                {
                    user_id: userData.user.id,
                    customer_name: userData.user.email || "Unknown Customer",
                    service_name: service.service_name,
                    service_id: service.id, // 🎯 CRITICAL FIX: Add service_id using the passed service.id
                    service_types: serviceTypes,
                    date,
                    booking_time: time,
                    total_price: totalPrice,
                    address,
                    status: "Pending",
                },
            ]);

            if (error) {
                // ... (rest of error handling)
            } else {
                // ... (rest of success handling)
            }
        } catch (e) {
            // ... (rest of catch block)
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const availableServices = SERVICE_TYPES.filter(opt => service[opt.priceKey] && service[opt.priceKey]! > 0);

    return (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg mx-auto shadow-2xl relative transform transition-all duration-300 scale-100">

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 transition rounded-full hover:bg-gray-100"
                    disabled={isSubmitting}
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 border-b pb-2">
                    Book <span style={{ color: PRIMARY_COLOR }}>{service.service_name}</span>
                </h2>
                <p className="text-gray-500 mb-6">Select details and confirm your service appointment.</p>

                {/* --- 1. Service Selection --- */}
                <div className="mb-8 p-4 rounded-xl border-2" style={{ backgroundColor: LIGHT_BG, borderColor: BORDER_COLOR }}>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-lg font-bold text-gray-700 flex items-center">
                            <Zap className="w-5 h-5 mr-2" style={{ color: PRIMARY_COLOR }} />
                            Choose Service Type(s)
                        </label>
                        {availableServices.length > 1 && (
                            <button
                                onClick={toggleAllServices}
                                className="text-sm font-semibold hover:underline"
                                style={{ color: PRIMARY_COLOR }}
                            >
                                {serviceTypes.length === availableServices.length ? "Deselect All" : "Select All"}
                            </button>
                        )}
                    </div>

                    <div className="space-y-3">
                        {availableServices.map(opt => (
                            <label
                                key={opt.key}
                                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${serviceTypes.includes(opt.key)
                                    ? `bg-white border-2 shadow-md`
                                    : 'bg-white border-gray-200 hover:border-gray-400'
                                    }`}
                                style={serviceTypes.includes(opt.key) ? { borderColor: PRIMARY_COLOR } : {}}
                            >
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={serviceTypes.includes(opt.key)}
                                        onChange={() => toggleService(opt.key)}
                                        className="form-checkbox h-5 w-5 rounded transition duration-150 ease-in-out"
                                        style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }}
                                    />
                                    <span className="text-gray-800 font-medium">{opt.label}</span>
                                </div>
                                <span className="font-bold" style={{ color: ACCENT_COLOR }}>
                                    ₹{service[opt.priceKey]}
                                </span>
                            </label>
                        ))}
                    </div>
                    {errors.serviceTypes && <p className="text-red-500 mt-2 text-sm flex items-center"><AlertTriangle className="w-4 h-4 mr-1" />{errors.serviceTypes}</p>}
                </div>

                {/* --- 2. Date and Time --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                    {/* Date Picker */}
                    <div>
                        <label className="block mb-2 font-medium text-gray-700 flex items-center">
                            <Calendar className="w-4 h-4 mr-1.5" style={{ color: PRIMARY_COLOR }} /> Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => { setDate(e.target.value); setErrors(prev => ({ ...prev, date: undefined })); }}
                            min={minDate}
                            className={`w-full border rounded-lg px-4 py-3 focus:ring-2 transition ${errors.date ? 'border-red-500' : 'border-gray-300'}`}
                            style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties}
                        />
                        {errors.date && <p className="text-red-500 mt-1 text-sm">{errors.date}</p>}
                    </div>
                    {/* Time Picker */}
                    <div>
                        <label className="block mb-2 font-medium text-gray-700 flex items-center">
                            <Clock className="w-4 h-4 mr-1.5" style={{ color: PRIMARY_COLOR }} /> Time
                        </label>
                        <input
                            type="time"
                            value={time}
                            onChange={e => { setTime(e.target.value); setErrors(prev => ({ ...prev, time: undefined })); }}
                            className={`w-full border rounded-lg px-4 py-3 focus:ring-2 transition ${errors.time ? 'border-red-500' : 'border-gray-300'}`}
                            style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties}
                        />
                        {errors.time && <p className="text-red-500 mt-1 text-sm">{errors.time}</p>}
                    </div>
                </div>

                {/* --- 3. Address --- */}
                <div className="mb-8">
                    <label className="block mb-2 font-medium text-gray-700 flex items-center">
                        <MapPin className="w-4 h-4 mr-1.5" style={{ color: PRIMARY_COLOR }} /> Address for Service
                    </label>
                    <textarea
                        value={address}
                        onChange={e => { setAddress(e.target.value); setErrors(prev => ({ ...prev, address: undefined })); }}
                        placeholder="Flat/House No., Street, Landmark, City, Pincode"
                        className={`w-full border rounded-lg px-4 py-3 focus:ring-2 transition ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                        style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties}
                        rows={3}
                    />
                    {errors.address && <p className="text-red-500 mt-1 text-sm">{errors.address}</p>}
                </div>

                {/* --- 4. Total Price & Submit (Footer Card Style) --- */}
                <div
                    className="p-4 rounded-xl shadow-lg flex items-center justify-between"
                    style={{ backgroundColor: BORDER_COLOR, border: `1px solid ${PRIMARY_COLOR}` }}
                >
                    <div className="flex flex-col">
                        <p className="text-sm font-semibold text-gray-700">Estimated Total</p>
                        <p className="text-3xl font-extrabold" style={{ color: ACCENT_COLOR }}>
                            {totalPrice > 0 ? `₹${totalPrice}` : '₹0.00'}
                        </p>
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={isSubmitting || !isFormValid}
                        className={`py-3 px-8 text-white font-bold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center ${isSubmitting || !isFormValid
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'hover:scale-[1.02] hover:shadow-xl'
                            }`}
                        style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                                Booking...
                            </>
                        ) : submissionStatus === 'success' ? (
                            <>
                                <CheckCircle className="w-5 h-5 mr-2" />
                                Confirmed!
                            </>
                        ) : (
                            "Confirm Booking"
                        )}
                    </button>
                </div>

                {submissionStatus === 'error' && (
                    <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2" />
                        <span className="text-sm font-medium">Booking failed. Please check the details and try again.</span>
                    </div>
                )}
            </div>
        </div>
    );
}