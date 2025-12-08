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
};

type Props = {
  service: ServiceItem;
  isOpen: boolean;
  onClose: () => void;
};

const SERVICE_TYPES = [
  { key: "Installation", label: "Installation", priceKey: "installation_price" as keyof ServiceItem },
  { key: "Dismantle", label: "Dismantle", priceKey: "dismantling_price" as keyof ServiceItem },
  { key: "Repair", label: "Repair", priceKey: "repair_price" as keyof ServiceItem },
];

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
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<{ date?: string; time?: string; serviceTypes?: string; address?: string }>({});
  const router = useRouter();
  const { toast } = useToast(); // <-- Use Toast here

  const today = new Date();
  const minDate = today.toISOString().split("T")[0];

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
    const newErrors: typeof errors = {};
    const now = new Date();
    const selectedDateTime = date && time ? new Date(`${date}T${time}:00`) : null;

    if (!date) newErrors.date = "Please select a date.";
    if (!time) newErrors.time = "Please select a time.";
    if (selectedDateTime && selectedDateTime < now) {
      newErrors.date = "The date and time must be in the future.";
      newErrors.time = "The date and time must be in the future.";
    }
    if (serviceTypes.length === 0) newErrors.serviceTypes = "Please select at least one service.";
    if (!address.trim()) newErrors.address = "Please enter your address.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const hasNoErrors = Object.values(errors).every(err => !err);
  const isFormValid = serviceTypes.length > 0 && date && time && address.trim() && hasNoErrors && totalPrice > 0;

  // --- Razorpay Payment ---
  const handleRazorpayPayment = async () => {
    if (!validateForm() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not logged in");

      await loadRazorpay();

      const options = {
        key: "rzp_test_RGGSp3xCsRNZnW", // Replace with your Razorpay Key
        amount: totalPrice * 100,
        currency: "INR",
        name: "Insta Fit Core",
        description: `Payment for ${service.service_name}`,
        handler: async (response: any) => {
          await handleSubmit(response.razorpay_payment_id, userData.user.email);
        },
        prefill: {
          email: userData.user.email,
          contact: userData.user.phone || "9999999999",
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
  const handleSubmit = async (payment_id?: string, customer_email?: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("User not logged in");

      const { error } = await supabase.from("bookings").insert([
        {
          user_id: userData.user.id,
          customer_name: customer_email || "Anonymous",
          service_id: service.id,
          service_name: service.service_name,
          service_types: serviceTypes || [],
          date,
          booking_time: time.includes(':') && time.split(':').length === 2 ? time + ':00' : time,
          total_price: totalPrice,
          address,
          status: payment_id ? "Paid" : "Pending",
          payment_id: payment_id || null,
        },
      ]);

      if (error) {
        console.error("Supabase insert error:", error);
        setSubmissionStatus('error');
        toast({
          title: "Booking failed",
          description: "Please check the details and try again.",
          variant: "destructive",
        });
      } else {
        setSubmissionStatus('success');
        toast({
          title: "Booking successful!",
          description: `Your booking for ${service.service_name} has been confirmed.`,
          variant: "success",
        });
        onClose();
        router.push("/site/order-tracking"); // Redirect after booking
      }

    } catch (err) {
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

        {/* Address */}
        <div className="mb-8">
          <label className="block mb-2 font-medium text-gray-700 flex items-center"><MapPin className="w-4 h-4 mr-1.5" style={{ color: PRIMARY_COLOR }} /> Address for Service</label>
          <textarea value={address} onChange={e => { setAddress(e.target.value); setErrors(prev => { const { address, ...rest } = prev; return rest; }); }} placeholder="Flat/House No., Street, Landmark, City, Pincode" className={`w-full border rounded-lg px-4 py-3 focus:ring-2 transition ${errors.address ? 'border-red-500' : 'border-gray-300'}`} style={{ '--tw-ring-color': PRIMARY_COLOR } as React.CSSProperties} rows={3}></textarea>
          {errors.address && <p className="text-red-500 mt-1 text-sm">{errors.address}</p>}
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
