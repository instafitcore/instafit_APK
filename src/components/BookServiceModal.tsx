"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Calendar, Clock, MapPin, Zap, Loader2, AlertTriangle, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/Toast";

// --- Styling ---
const PRIMARY_COLOR = "#8ed26b";
const ACCENT_COLOR = "#10b981";
const LIGHT_BG = "#f5f7fa";
const BORDER_COLOR = "#e6f6dc";

// --- Type Definitions ---
type ServiceItem = {
  id: number;
  service_name: string;
  installation_price: number | null;
  dismantling_price: number | null;
  repair_price: number | null;
  preferred_timings?: string[];
};

interface Props {
  service: ServiceItem;
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;      // ✅ Add this
  isLoading?: boolean;    // ✅ Optional, since you might not always pass it
}


// --- New Address Type Definition (Mirroring the uploaded image) ---
type ServiceAddress = {
  fullName: string;
  mobile: string;
  alternateMobile: string; // Optional
  flatHousePlot: string;
  floor: string;
  buildingApartment: string;
  streetLocality: string;
  areaZone: string;
  landmark: string; // Optional
  cityTown: string;
  state: string;
  pincode: string;
};

// --- Initial State for Address ---
const initialAddressState: ServiceAddress = {
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
};

// --- Structured Error Type ---
type FormErrors = {
  date?: string;
  time?: string;
  serviceTypes?: string;
  address?: Partial<Record<keyof ServiceAddress, string>> | string;
};

const SERVICE_TYPES = [
  { key: "Installation", label: "Installation", priceKey: "installation_price" as keyof ServiceItem },
  { key: "Dismantle", label: "Dismantle", priceKey: "dismantling_price" as keyof ServiceItem },
  { key: "Repair", label: "Repair", priceKey: "repair_price" as keyof ServiceItem },
];

// --- Tax Rate (Assuming 18% GST for services in India) ---
const TAX_RATE = 0.18;

// --- Reusable Input Component for cleaner JSX ---
const InputField = ({ label, type = "text", value, onChange, error, className = "", maxLength }: {
  label: React.ReactNode;
  type?: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>;
  error?: string;
  className?: string;
  maxLength?: number;
}) => (
  <div className={className}>
    <label className="block mb-1 text-sm font-medium text-gray-600">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className={`w-full border rounded-lg px-3 py-2 focus:ring-2 transition text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
      style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties}
      maxLength={maxLength}
    />
    {error && <p className="text-red-500 mt-1 text-xs flex items-center"><AlertTriangle className="w-3 h-3 mr-1" />{error}</p>}
  </div>
);

// --- Load Razorpay SDK ---
const loadRazorpay = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const scriptId = "razorpay-js";
    if (document.getElementById(scriptId)) return resolve();

    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay SDK failed to load."));
    document.body.appendChild(script);
  });
};

export default function BookServiceModal({ service, isOpen, onClose }: Props) {
  const [serviceTypes, setServiceTypes] = useState<string[]>([]);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  // REF: Address state updated to object
  const [address, setAddress] = useState<ServiceAddress>(initialAddressState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  // REF: Errors state updated to handle nested address errors
  const [errors, setErrors] = useState<FormErrors>({});
  const [allowedPincodes, setAllowedPincodes] = useState<string[]>([]);

  const router = useRouter();
  const { toast } = useToast();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDate = tomorrow.toISOString().split("T")[0];

  const [timings, setTimings] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setServiceTypes([]);
      setDate("");
      setTime("");
      // Reset address state
      setAddress(initialAddressState);
      setErrors({});
      setSubmissionStatus('idle');
    }
  }, [isOpen]);
  useEffect(() => {
    if (isOpen) {
      const fetchPincodes = async () => {
        try {
          const { data, error } = await supabase
            .from("service_pincodes") // Replace with your admin table name
            .select("pincode");      // Column name that stores pincodes

          if (error) throw error;

          if (data) {
            const pincodes = data.map((item: any) => item.pincode);
            setAllowedPincodes(pincodes);
          }
        } catch (err) {
          console.error("Failed to fetch pincodes:", err);
          toast({
            title: "Error",
            description: "Could not load allowed pincodes.",
            variant: "destructive",
          });
        }
      };

      fetchPincodes();
    }
  }, [isOpen]);

  useEffect(() => {
    if (service && service.id) {
      const fetchTimings = async () => {
        try {
          const { data, error } = await supabase
            .from("services")
            .select("preferred_timings")
            .eq("id", service.id)
            .single();

          if (error) throw error;
          if (data?.preferred_timings) setTimings(data.preferred_timings);
        } catch (err) {
          console.error("Failed to fetch timings:", err);
          toast({
            title: "Error",
            description: "Could not load available timings.",
            variant: "destructive",
          });
        }
      };

      fetchTimings();
    }
  }, [service]);

  useEffect(() => {
    const pin = address.pincode.trim();

    if (pin.length === 6) {
      if (!/^\d{6}$/.test(pin)) {
        toast({
          title: "Invalid Pincode",
          description: "Pincode must be 6 digits",
          variant: "destructive",
        });
      } else if (!allowedPincodes.includes(pin)) {
        toast({
          title: "Service Unavailable",
          description: "Sorry, service is not available in this pincode",
          variant: "destructive",
        });

        setErrors((prev) => ({
          ...prev,
          address: {
            ...(typeof prev.address === "object" ? prev.address : {}),
            pincode: "Service not available in this pincode",
          },
        }));
      } else {
        // Clear pincode error if valid
        setErrors((prev) => {
          if (typeof prev.address === "object") {
            const { pincode, ...rest } = prev.address;
            return { ...prev, address: rest };
          }
          return prev;
        });
      }
    }
  }, [address.pincode, allowedPincodes]);

  const autoFillAddress = () => {
    // 🚫 In-app browser detection
    const ua = navigator.userAgent || "";
    const isInApp =
      /FBAN|FBAV|Instagram|WhatsApp|Line|Twitter/i.test(ua);

    if (isInApp) {
      toast({
        title: "Location not supported",
        description: "Please open this page in Chrome or Safari to use location.",
        variant: "destructive",
      });
      return;
    }

    if (!navigator.geolocation) {
      toast({
        title: "Not supported",
        description: "Geolocation is not supported on this device.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Detecting location...",
      description: "Please allow location access",
    });

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

          if (!data?.address) throw new Error("No address found");

          const addr = data.address;

          setAddress((prev) => ({
            ...prev,
            streetLocality: addr.road || "",
            areaZone: addr.suburb || addr.neighbourhood || "",
            cityTown: addr.city || addr.town || addr.village || "",
            state: addr.state || "",
            pincode: addr.postcode || "",
          }));

          toast({
            title: "Address filled",
            description: "Location detected successfully",
            variant: "success",
          });
        } catch (err) {
          toast({
            title: "Failed",
            description: "Unable to fetch address from location",
            variant: "destructive",
          });
        }
      },
      (error) => {
        let message = "Unable to fetch location.";

        if (error.code === 1)
          message = "Location permission denied. Please enable it in browser settings.";
        else if (error.code === 2)
          message = "Location unavailable. Please try again outdoors.";
        else if (error.code === 3)
          message = "Location request timed out. Please retry.";

        toast({
          title: "Location Error",
          description: message,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true, // 🔥 REQUIRED FOR MOBILE
        timeout: 15000,           // 🔥 REQUIRED
        maximumAge: 0,            // 🔥 REQUIRED
      }
    );
  };


  const getFilteredTimings = () => {
    if (!date) return timings;

    const now = new Date();
    const selectedDate = new Date(date);

    // If selected date is in the future → allow all timings
    if (selectedDate.toDateString() !== now.toDateString()) {
      return timings;
    }

    // If selected date is today → filter past times
    const currentMinutes =
      now.getHours() * 60 + now.getMinutes();

    return timings.filter((t) => {
      const [hour, minute] = t.split(":").map(Number);
      const timingMinutes = hour * 60 + minute;
      return timingMinutes > currentMinutes;
    });
  };


  // Helper for address input changes
  const handleAddressChange = (field: keyof ServiceAddress, value: string) => {
    setAddress(prev => ({ ...prev, [field]: value }));
    // Clear specific address errors when input changes
    setErrors(prev => {
      if (prev.address && typeof prev.address !== 'string' && prev.address[field]) {
        const { [field]: removed, ...rest } = prev.address;
        if (Object.keys(rest).length === 0) {
          const { address, ...mainRest } = prev;
          return mainRest;
        }
        return { ...prev, address: rest as Record<keyof ServiceAddress, string> };
      }
      return prev;
    });
  };

  const subtotal = serviceTypes.reduce((sum, type) => {
    const option = SERVICE_TYPES.find(opt => opt.key === type);
    const price = option ? +(service[option.priceKey] || 0) : 0;
    return sum + price;
  }, 0);

  const taxAmount = Math.round(subtotal * TAX_RATE);
  const totalPrice = subtotal + taxAmount;

  const toggleService = (type: string) => {
    setServiceTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    setErrors(prev => {
      const { serviceTypes, ...rest } = prev;
      return rest;
    });
  };

  const toggleAllServices = () => {
    const availableTypes = SERVICE_TYPES
      .filter(opt => Number(service[opt.priceKey]) > 0) // <-- cast to number
      .map(opt => opt.key);
    setServiceTypes(prev => prev.length === availableTypes.length ? [] : availableTypes);
  };


  const validateForm = () => {
    const newErrors: FormErrors = {};
    const now = new Date();
    const selectedDateTime = date && time ? new Date(`${date}T${time}:00`) : null;

    // 1. Date & Time Validation
    if (!date) newErrors.date = "Please select a date.";
    if (!time) newErrors.time = "Please select a time.";
    if (selectedDateTime && selectedDateTime < now) {
      newErrors.date = "The date and time must be in the future.";
      newErrors.time = "The date and time must be in the future.";
    }

    // 2. Service Type Validation
    if (serviceTypes.length === 0) newErrors.serviceTypes = "Please select at least one service.";

    // 3. Address Validation (Detailed)
    const addressErrors: Partial<Record<keyof ServiceAddress, string>> = {};
    const requiredAddressFields: Array<keyof ServiceAddress> = [
      "fullName", "mobile", "flatHousePlot", "buildingApartment",
      "streetLocality", "areaZone", "cityTown", "state", "pincode",
    ];

    requiredAddressFields.forEach(field => {
      if (!address[field].trim()) {
        addressErrors[field] = "Required";
      }
    });

    if (address.mobile.trim() && !/^\d{10}$/.test(address.mobile.trim())) {
      addressErrors.mobile = "Must be 10 digits.";
    }

    if (address.pincode.trim() && !/^\d{6}$/.test(address.pincode.trim())) {
      addressErrors.pincode = "Must be 6 digits.";
    } else if (
      address.pincode.trim() &&
      !allowedPincodes.includes(address.pincode.trim())
    ) {
      addressErrors.pincode = "Service not available in this pincode.";
    }


    if (Object.keys(addressErrors).length > 0) {
      newErrors.address = addressErrors as Record<keyof ServiceAddress, string>;
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasNoErrors = Object.values(errors).every(err => !err || (typeof err === 'object' && Object.keys(err).length === 0));

  // The form is valid if all primary states are filled AND validation passes
  const isFormValid = serviceTypes.length > 0 && date && time && totalPrice > 0 && hasNoErrors &&
    // Basic check to ensure some address fields are present before full validation
    address.fullName.trim() && address.mobile.trim() && address.pincode.trim();

  // --- Razorpay Payment ---
  const handleRazorpayPayment = async () => {
    if (!validateForm() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      // 1️⃣ Get logged-in user
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not logged in");
      }

      // 2️⃣ Load Razorpay SDK safely
      const sdkLoaded = await loadRazorpay()
        .then(() => true)
        .catch(() => false);

      if (!sdkLoaded || !(window as any).Razorpay) {
        throw new Error("Razorpay SDK failed to load");
      }

      // 3️⃣ Create Razorpay order (SERVER)
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(totalPrice * 100), // ✅ integer
        }),
      });

      if (!orderRes.ok) {
        const errText = await orderRes.text();
        console.error("Order API failed:", errText);
        throw new Error("Order creation failed");
      }

      const order = await orderRes.json();

      if (!order?.id) {
        throw new Error("Invalid order response");
      }

      // 4️⃣ Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "Insta Fit Core",
        description: `Payment for ${service.service_name}`,

        handler: async (response: any) => {
          await verifyAndSavePayment({
            payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
            signature: response.razorpay_signature,
          });
        },

        prefill: {
          email: userData.user.email || "",
          contact: address.mobile || "9999999999",
        },

        theme: {
          color: "#8ed26b",
        },
      };

      // 5️⃣ Open Razorpay
      const rzp = new (window as any).Razorpay(options);

      rzp.on("payment.failed", (response: any) => {
        toast({
          title: "Payment failed",
          description: response.error.description || "Please try again",
          variant: "destructive",
        });
        setIsSubmitting(false);
      });

      // 🔥 MOST IMPORTANT FIX
      rzp.on("modal.closed", () => {
        setIsSubmitting(false);
        onClose(); // ✅ Close the modal normally even if user cancels
      });


      // ✅ OPEN ONLY ONCE
      rzp.open();


    } catch (err: any) {
      console.error("Razorpay start error:", err);
      toast({
        title: "Payment Error",
        description: err?.message || "Unable to start payment",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  // --- On-Site Payment (No Razorpay) ---
  const handleOnSitePayment = async () => {
    if (!validateForm() || isSubmitting) return;
    setIsSubmitting(true);
    await handleSubmit(); // No payment_id, order_id for on-site
  };

  // --- Save booking after payment ---
  // --- Save booking after payment ---
  const handleSubmit = async (payment_id?: string, order_id?: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not logged in");

      const formattedAddress =
        `${address.flatHousePlot}, Floor ${address.floor}, ${address.buildingApartment}, ${address.streetLocality}, ${address.areaZone}, ${address.cityTown}, ${address.state} - ${address.pincode}` +
        (address.landmark.trim() ? ` (Landmark: ${address.landmark})` : '');

      const { data: insertedData, error: insertError } = await supabase
        .from("bookings")
        .insert([
          {
            user_id: userData.user.id,
            customer_name: address.fullName,
            customer_mobile: address.mobile,
            service_id: service.id,
            service_name: service.service_name,
            service_types: serviceTypes,
            date,
            booking_time: `${to24HourTime(time)}:00`,
            total_price: totalPrice,
            address: formattedAddress,

            // ✅ SAVE BOTH
            status: payment_id ? "Paid" : "Pending",
            payment_id: payment_id || null,
            razorpay_order_id: order_id || null,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      setSubmissionStatus("success");

      const dbOrderNo = insertedData?.order_no || "N/A";

      toast({
        title: "Booking successful!",
        description: `Your booking is confirmed. Order No: ${dbOrderNo}`,
        variant: "success",
      });

      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userData.user.email,
          name: address.fullName,
          service: service.service_name,
          date,
          time,
          amount: totalPrice,
          orderId: dbOrderNo,
        }),
      });

      onClose();
      router.push("/site/order-tracking");

    } catch (err: any) {
      console.error("Booking failed:", err);
      setSubmissionStatus("error");
      toast({
        title: "Booking failed",
        description: err?.message || "Unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };


  const verifyAndSavePayment = async ({ payment_id, order_id, signature }: any) => {
    const res = await fetch("/api/razorpay/verify-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ payment_id, order_id, signature }),
    });

    const data = await res.json(); // now it will not fail

    if (!data?.success) {
      throw new Error(data?.error || "Payment verification failed");
    }

    await handleSubmit(payment_id, order_id);
  };

  if (!isOpen) return null;

  const availableServices = SERVICE_TYPES.filter(opt => Number(service[opt.priceKey]) > 0);
  // Type guard for nested address errors
  const addressErrors: Partial<Record<keyof ServiceAddress, string>> = typeof errors.address === 'object' && errors.address ? errors.address : {};
  const to24HourTime = (label: string) => {
    // "11:30 AM - 12:00 PM" → "11:30"
    const start = label.split(" - ")[0]; // "11:30 AM"
    const [time, modifier] = start.split(" "); // ["11:30", "AM"]

    let [hours, minutes] = time.split(":").map(Number);

    if (modifier === "PM" && hours !== 12) hours += 12;
    if (modifier === "AM" && hours === 12) hours = 0;

    return `${hours.toString().padStart(2, "0")}:${minutes}`;
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg mx-auto shadow-2xl relative transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">

        <button
          onClick={() => {
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 transition rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>


        <h2 className="text-3xl font-extrabold text-gray-900 mb-2 border-b pb-2">
          Book <span style={{ color: PRIMARY_COLOR }}>{service.service_name}</span>
        </h2>
        <p className="text-gray-500 mb-6">Select details and confirm your service appointment.</p>

        {/* Service Selection */}
        <div className="mb-8 p-4 rounded-xl border-2" style={{ backgroundColor: LIGHT_BG, borderColor: BORDER_COLOR }}>
          <div className="flex items-center justify-between mb-3">
            <label className="text-lg font-bold text-gray-700 flex items-center">
              <Zap className="w-5 h-5 mr-2" style={{ color: PRIMARY_COLOR }} /> Choose Service Type(s)
            </label>
            {availableServices.length > 1 && (
              <button onClick={toggleAllServices} className="text-sm font-semibold hover:underline" style={{ color: PRIMARY_COLOR }}>
                {serviceTypes.length === availableServices.length ? "Deselect All" : "Select All"}
              </button>
            )}
          </div>
          <div className="space-y-3">
            {availableServices.map(opt => {
              const isRepair = opt.key === "Repair";
              const isSelected = serviceTypes.includes(opt.key);

              return (
                <div key={opt.key}>
                  <label
                    className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all
        ${isSelected ? `bg-white border-2 shadow-md` : 'bg-white border-gray-200 hover:border-gray-400'}`}
                    style={isSelected ? { borderColor: PRIMARY_COLOR } : {}}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
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

                  {/* ✅ Repair info message */}
                  {isRepair && isSelected && (
                    <p className="mt-1 ml-9 text-sm text-gray-500">
                      Inspection fee only. Repair cost will be quoted after on-site assessment
                    </p>
                  )}
                </div>
              );
            })}

          </div>
          {errors.serviceTypes && <p className="text-red-500 mt-2 text-sm flex items-center"><AlertTriangle className="w-4 h-4 mr-1" />{errors.serviceTypes}</p>}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block mb-2 font-medium text-gray-700 flex items-center"><Calendar className="w-4 h-4 mr-1.5" style={{ color: PRIMARY_COLOR }} /> Date</label>
            <input type="date" value={date} min={minDate} onChange={e => {
              setDate(e.target.value);
              setTime(""); // reset invalid past time
              setErrors(prev => {
                const { date, time, ...rest } = prev;
                return rest;
              });
            }}
              className={`w-full border rounded-lg px-4 py-3 focus:ring-2 transition ${errors.date ? 'border-red-500' : 'border-gray-300'}`} style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties} />
            {errors.date && <p className="text-red-500 mt-1 text-sm">{errors.date}</p>}
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700 flex items-center">
              <Clock className="w-4 h-4 mr-1.5" style={{ color: PRIMARY_COLOR }} /> Time
            </label>
            <select
              value={time}
              onChange={(e) => {
                setTime(e.target.value);
                // Clear any existing error on change
                setErrors(prev => {
                  const { time, ...rest } = prev;
                  return rest;
                });
              }}
              className={`w-full border rounded-lg px-4 py-3 focus:ring-2 transition ${errors.time ? 'border-red-500' : 'border-gray-300'}`}
              style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties}
            >
              <option value="">Select Time</option>
              {getFilteredTimings().map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.time && <p className="text-red-500 mt-1 text-sm">{errors.time}</p>}
          </div>


        </div>

        {/* REF: Address Section - REPLACED WITH STRUCTURED FIELDS */}
        <div className="mb-8 p-4 rounded-xl border-2" style={{ backgroundColor: LIGHT_BG, borderColor: BORDER_COLOR }}>
          <div className="flex items-center justify-between mb-4">
            <label className="text-lg font-bold text-gray-700 flex items-center">
              <MapPin className="w-5 h-5 mr-2" style={{ color: PRIMARY_COLOR }} />
              Service Address Details
            </label>

            <button
              type="button"
              onClick={autoFillAddress}
              className="text-sm font-semibold px-3 py-1 rounded-lg border hover:bg-green-50"
              style={{ borderColor: PRIMARY_COLOR, color: PRIMARY_COLOR }}
            >
              Use My Location
            </button>
          </div>


          {/* Contact Details */}
          <div className="space-y-4 mb-4">
            <InputField
              label={<>Customer Full Name <span className="text-red-500">*</span></>}
              value={address.fullName}
              onChange={(e) => handleAddressChange("fullName", e.target.value)}
              error={addressErrors.fullName}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label={<>Mobile Number <span className="text-red-500">*</span></>}
                type="tel"
                value={address.mobile}
                onChange={(e) => handleAddressChange("mobile", e.target.value)}
                error={addressErrors.mobile}
                maxLength={10}
              />
              <InputField
                label={<>Pincode <span className="text-red-500">*</span></>}
                value={address.pincode}
                onChange={(e) =>
                  handleAddressChange("pincode", e.target.value.replace(/\D/g, ""))
                }
                error={addressErrors.pincode}
                maxLength={6}
              />
            </div>

            <hr className="my-6 border-gray-200" />

            {/* Location Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label={<>Flat / House / Plot No <span className="text-red-500">*</span></>}
                  value={address.flatHousePlot}
                  onChange={(e) => handleAddressChange("flatHousePlot", e.target.value)}
                  error={addressErrors.flatHousePlot}
                />
                <InputField
                  label="Floor"
                  value={address.floor}
                  onChange={(e) => handleAddressChange("floor", e.target.value)}
                  error={addressErrors.floor}
                />
              </div>
              <InputField
                label={<>Building / Apartment Name <span className="text-red-500">*</span></>}
                value={address.buildingApartment}
                onChange={(e) => handleAddressChange("buildingApartment", e.target.value)}
                error={addressErrors.buildingApartment}
              />

              <InputField
                label={<>Street / Locality <span className="text-red-500">*</span></>}
                value={address.streetLocality}
                onChange={(e) => handleAddressChange("streetLocality", e.target.value)}
                error={addressErrors.streetLocality}
              />
              <InputField
                label={<>Area / Zone <span className="text-red-500">*</span></>}
                value={address.areaZone}
                onChange={(e) => handleAddressChange("areaZone", e.target.value)}
                error={addressErrors.areaZone}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <InputField
                  label="Landmark (Optional)"
                  value={address.landmark}
                  onChange={(e) => handleAddressChange("landmark", e.target.value)}
                />
                <InputField
                  label={<>City / Town <span className="text-red-500">*</span></>}
                  value={address.cityTown}
                  onChange={(e) => handleAddressChange("cityTown", e.target.value)}
                  error={addressErrors.cityTown}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InputField
                  label={<>State <span className="text-red-500">*</span></>}
                  value={address.state}
                  onChange={(e) => handleAddressChange("state", e.target.value)}
                  error={addressErrors.state}
                />

                <InputField
                  label="Alternate Mobile (Optional)"
                  type="tel"
                  value={address.alternateMobile}
                  onChange={(e) => handleAddressChange("alternateMobile", e.target.value)}
                  maxLength={10}
                />
              </div>
            </div>
          </div>
          {typeof errors.address === 'string' && <p className="text-red-500 mt-2 text-sm flex items-center"><AlertTriangle className="w-4 h-4 mr-1" />{errors.address}</p>}
        </div>


        {/* Total & Confirm */}
        <div className="p-4 rounded-xl shadow-lg" style={{ backgroundColor: BORDER_COLOR, border: `1px solid ${PRIMARY_COLOR}` }}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col mb-4 sm:mb-0">
              <p className="text-sm font-semibold text-gray-700">Subtotal: ₹{subtotal}</p>
              <p className="text-sm font-semibold text-gray-700">Tax (18% GST): ₹{taxAmount}</p>
              <p className="text-lg font-extrabold" style={{ color: ACCENT_COLOR }}>Total: ₹{totalPrice}</p>
            </div>
            <div className="flex flex-col gap-2 w-full sm:w-auto">
              <button onClick={handleRazorpayPayment} disabled={isSubmitting || !isFormValid} className={`py-3 px-6 sm:px-8 text-white font-bold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center w-full sm:w-auto ${isSubmitting || !isFormValid ? 'bg-gray-400 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-xl'}`} style={{ backgroundColor: PRIMARY_COLOR }}>
                {isSubmitting ? <><Loader2 className="animate-spin w-5 h-5 mr-2" />Processing...</> : "Pay Now"}
              </button>
              <button onClick={handleOnSitePayment} disabled={isSubmitting || !isFormValid} className={`py-3 px-6 sm:px-8 text-white font-bold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center w-full sm:w-auto ${isSubmitting || !isFormValid ? 'bg-gray-400 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-xl'}`} style={{ backgroundColor: ACCENT_COLOR }}>
                {isSubmitting ? <><Loader2 className="animate-spin w-5 h-5 mr-2" />Processing...</> : "On-Site Payment"}
              </button>
            </div>
          </div>
        </div>

        {submissionStatus === 'error' && <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /><span className="text-sm font-medium">Booking failed. Please check the details and try again.</span></div>}
      </div>
    </div>
  );
}