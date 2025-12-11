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
// --- Allowed Service Pincodes ---
const ALLOWED_PINCODES = [
  "560091","560037","560016","560065","560024","560094","560092","560001","560051",
  "560025","560030","560002","560060","560059","560034","560018","560068","560099",
  "560062","560070","560098","560088","560054","560022","560010","560079","560055",
  "560072","560003","560004","560083","560089","560066","560075","560017","560047",
  "560080","560084","560026","560074","560050","560100","560076","560029","560041",
  "560013","560009","560096","560086","560008","560032","560067","560049","560090",
  "560007","560036","560300","560045","560043","560005","560053","560102","560027",
  "560078","560011","560015","560012","560021","560056","560071","560063","560113",
  "560035","560095","560111","560082","560081","560097","560040","560020","560048",
  "560103","560093","560038","560033","560042","560085","560061","560057","560023"
];
// --- Type Definitions ---
type ServiceItem = {
  id: number;
  service_name: string;
  installation_price: number | null;
  dismantling_price: number | null;
  repair_price: number | null;
};

type Props = {
  service: ServiceItem;
  isOpen: boolean;
  onClose: () => void;
  isLoading: boolean;
  userEmail: string; // ✅ Add this
};


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
  address?: Record<keyof ServiceAddress, string> | string;
};

const SERVICE_TYPES = [
  { key: "Installation", label: "Installation", priceKey: "installation_price" as keyof ServiceItem },
  { key: "Dismantle", label: "Dismantle", priceKey: "dismantling_price" as keyof ServiceItem },
  { key: "Repair", label: "Repair", priceKey: "repair_price" as keyof ServiceItem },
];

// --- Reusable Input Component for cleaner JSX ---
const InputField = ({ label, type = "text", value, onChange, error, className = "", maxLength }: {
  label: string;
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
      className={`w-full border rounded-lg px-4 py-2 focus:ring-2 transition text-sm ${error ? 'border-red-500' : 'border-gray-300'}`}
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

  const router = useRouter();
  const { toast } = useToast();

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

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

  const totalPrice = serviceTypes.reduce((sum, type) => {
    const option = SERVICE_TYPES.find(opt => opt.key === type);
    const price = option ? +(service[option.priceKey] || 0) : 0;
    return sum + price;
  }, 0);

  const toggleService = (type: string) => {
    setServiceTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]);
    setErrors(prev => {
      const { serviceTypes, ...rest } = prev;
      return rest;
    });
  };

  const toggleAllServices = () => {
    const availableTypes = SERVICE_TYPES.filter(opt => service[opt.priceKey]! > 0).map(opt => opt.key);
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
      !ALLOWED_PINCODES.includes(address.pincode.trim())
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
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not logged in");

      await loadRazorpay();

      const options = {
        key: "rzp_test_RpvE2nM5XUTYN7", // Replace with your Razorpay Key
        amount: totalPrice * 100,
        currency: "INR",
        name: "Insta Fit Core",
        description: `Payment for ${service.service_name}`,
        handler: async (response: any) => {
          await handleSubmit(response.razorpay_payment_id);
        },
        prefill: {
          email: userData.user.email,
          contact: address.mobile || userData.user.phone || "9999999999", // Use validated mobile
        },
      };

      const rzp = new (window as any).Razorpay(options);

      rzp.on('payment.failed', function (response: any) {
        console.error("Payment failed:", response.error);
        toast({
          title: "Payment failed",
          description: response.error.description || "Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
      });

      rzp.open();

    } catch (err) {
      console.error(err);
      toast({
        title: "Payment Error",
        description: "Unable to start payment. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  // --- Save booking after payment ---
  // --- Save booking after payment ---
  const handleSubmit = async (payment_id?: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not logged in");

      // Format the structured address into a single string for storage
      const formattedAddress =
        `${address.flatHousePlot}, Floor ${address.floor}, ${address.buildingApartment}, ${address.streetLocality}, ${address.areaZone}, ${address.cityTown}, ${address.state} - ${address.pincode}` +
        (address.landmark.trim() ? ` (Landmark: ${address.landmark})` : '');

      const { error } = await supabase.from("bookings").insert([
        {
          user_id: userData.user.id,
          // customer_mobile: address.mobile, <-- THIS LINE IS NOW REMOVED
          customer_name: address.fullName,
          service_id: service.id,
          service_name: service.service_name,
          service_types: serviceTypes || [],
          date,
          booking_time: time.includes(':') && time.split(':').length === 2 ? time + ':00' : time,
          total_price: totalPrice,
          address: formattedAddress,
          status: payment_id ? "Paid" : "Pending",
          payment_id: payment_id || null,
        },
      ]);

      if (error) {
        console.error("Supabase insert error:", error);
        // ... (rest of the error handling remains the same)
        setSubmissionStatus('error');
        toast({
          title: "Booking failed",
          description: "Please check the details and try again.",
          variant: "destructive",
        });
      } else {
        // ... (success handling remains the same)
        setSubmissionStatus('success');
        toast({
          title: "Booking successful!",
          description: `Your booking for ${service.service_name} has been confirmed.`,
          variant: "success",
        });
        onClose();
        router.push("/site/order-tracking");
      }

    } catch (err) {
      // ... (rest of the catch block remains the same)
      console.error("Booking failed:", err);
      setSubmissionStatus('error');
      toast({
        title: "Booking failed",
        description: "Unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const availableServices = SERVICE_TYPES.filter(opt => service[opt.priceKey]! > 0);
  // Type guard for nested address errors
  const addressErrors = typeof errors.address === 'object' ? errors.address : {};

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl p-6 sm:p-8 w-full max-w-lg mx-auto shadow-2xl relative transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">

        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 transition rounded-full hover:bg-gray-100" disabled={isSubmitting}>
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
            {availableServices.map(opt => (
              <label key={opt.key} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${serviceTypes.includes(opt.key) ? `bg-white border-2 shadow-md` : 'bg-white border-gray-200 hover:border-gray-400'}`} style={serviceTypes.includes(opt.key) ? { borderColor: PRIMARY_COLOR } : {}}>
                <div className="flex items-center space-x-3">
                  <input type="checkbox" checked={serviceTypes.includes(opt.key)} onChange={() => toggleService(opt.key)} className="form-checkbox h-5 w-5 rounded transition duration-150 ease-in-out" style={{ color: PRIMARY_COLOR, borderColor: PRIMARY_COLOR }} />
                  <span className="text-gray-800 font-medium">{opt.label}</span>
                </div>
                <span className="font-bold" style={{ color: ACCENT_COLOR }}>₹{service[opt.priceKey]}</span>
              </label>
            ))}
          </div>
          {errors.serviceTypes && <p className="text-red-500 mt-2 text-sm flex items-center"><AlertTriangle className="w-4 h-4 mr-1" />{errors.serviceTypes}</p>}
        </div>

        {/* Date & Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div>
            <label className="block mb-2 font-medium text-gray-700 flex items-center"><Calendar className="w-4 h-4 mr-1.5" style={{ color: PRIMARY_COLOR }} /> Date</label>
            <input type="date" value={date} min={minDate} onChange={e => { setDate(e.target.value); setErrors(prev => { const { date, ...rest } = prev; return rest; }); }} className={`w-full border rounded-lg px-4 py-3 focus:ring-2 transition ${errors.date ? 'border-red-500' : 'border-gray-300'}`} style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties} />
            {errors.date && <p className="text-red-500 mt-1 text-sm">{errors.date}</p>}
          </div>
          <div>
            <label className="block mb-2 font-medium text-gray-700 flex items-center"><Clock className="w-4 h-4 mr-1.5" style={{ color: PRIMARY_COLOR }} /> Time</label>
            <input type="time" value={time} onChange={e => { setTime(e.target.value); setErrors(prev => { const { time, ...rest } = prev; return rest; }); }} className={`w-full border rounded-lg px-4 py-3 focus:ring-2 transition ${errors.time ? 'border-red-500' : 'border-gray-300'}`} style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties} />
            {errors.time && <p className="text-red-500 mt-1 text-sm">{errors.time}</p>}
          </div>
        </div>

        {/* REF: Address Section - REPLACED WITH STRUCTURED FIELDS */}
        <div className="mb-8 p-4 rounded-xl border-2" style={{ backgroundColor: LIGHT_BG, borderColor: BORDER_COLOR }}>
          <label className="block mb-4 text-lg font-bold text-gray-700 flex items-center">
            <MapPin className="w-5 h-5 mr-2" style={{ color: PRIMARY_COLOR }} /> Service Address Details
          </label>

          {/* Contact Details */}
          <div className="space-y-4 mb-4">
            <InputField
              label="Customer Full Name"
              value={address.fullName}
              onChange={(e) => handleAddressChange("fullName", e.target.value)}
              error={addressErrors.fullName}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Mobile Number"
                type="tel"
                value={address.mobile}
                onChange={(e) => handleAddressChange("mobile", e.target.value)}
                error={addressErrors.mobile}
                maxLength={10}
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

          <hr className="my-6 border-gray-200" />

          {/* Location Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Flat / House / Plot No"
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
              label="Building / Apartment Name"
              value={address.buildingApartment}
              onChange={(e) => handleAddressChange("buildingApartment", e.target.value)}
              error={addressErrors.buildingApartment}
            />
            <InputField
              label="Street / Locality"
              value={address.streetLocality}
              onChange={(e) => handleAddressChange("streetLocality", e.target.value)}
              error={addressErrors.streetLocality}
            />
            <InputField
              label="Area / Zone"
              value={address.areaZone}
              onChange={(e) => handleAddressChange("areaZone", e.target.value)}
              error={addressErrors.areaZone}
            />
            <InputField
              label="Landmark (Optional)"
              value={address.landmark}
              onChange={(e) => handleAddressChange("landmark", e.target.value)}
            />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <InputField
                label="City / Town"
                value={address.cityTown}
                onChange={(e) => handleAddressChange("cityTown", e.target.value)}
                error={addressErrors.cityTown}
                className="col-span-1 sm:col-span-1"
              />
              <InputField
                label="State"
                value={address.state}
                onChange={(e) => handleAddressChange("state", e.target.value)}
                error={addressErrors.state}
                className="col-span-1 sm:col-span-1"
              />
              <InputField
                label="Pincode"
                value={address.pincode}
                onChange={(e) => handleAddressChange("pincode", e.target.value)}
                error={addressErrors.pincode}
                maxLength={6}
                className="col-span-1 sm:col-span-1"
              />
            </div>
          </div>
          {typeof errors.address === 'string' && <p className="text-red-500 mt-2 text-sm flex items-center"><AlertTriangle className="w-4 h-4 mr-1" />{errors.address}</p>}
        </div>

        {/* Total & Confirm */}
        <div className="p-4 rounded-xl shadow-lg flex items-center justify-between" style={{ backgroundColor: BORDER_COLOR, border: `1px solid ${PRIMARY_COLOR}` }}>
          <div className="flex flex-col">
            <p className="text-sm font-semibold text-gray-700">Estimated Total</p>
            <p className="text-3xl font-extrabold" style={{ color: ACCENT_COLOR }}>{totalPrice > 0 ? `₹${totalPrice}` : '₹0.00'}</p>
          </div>
          <button onClick={handleRazorpayPayment} disabled={isSubmitting || !isFormValid} className={`py-3 px-8 text-white font-bold rounded-lg shadow-md transition-all duration-300 flex items-center justify-center ${isSubmitting || !isFormValid ? 'bg-gray-400 cursor-not-allowed' : 'hover:scale-[1.02] hover:shadow-xl'}`} style={{ backgroundColor: PRIMARY_COLOR }}>
            {isSubmitting ? <><Loader2 className="animate-spin w-5 h-5 mr-2" />Booking...</> : "Confirm Booking"}
          </button>
        </div>

        {submissionStatus === 'error' && <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center"><AlertTriangle className="w-5 h-5 mr-2" /><span className="text-sm font-medium">Booking failed. Please check the details and try again.</span></div>}
      </div>
    </div>
  );
}