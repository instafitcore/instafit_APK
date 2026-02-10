"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase-client";
import {
  Package,
  Clock,
  CheckCircle,
  MapPin,
  Wrench,
  Calendar,
  IndianRupee, Home,
  Loader2,// Example usage in your React component:
  Hash,
  User,
  Star,
  X,
  Search,
  Image as ImageIcon,
} from "lucide-react";
// Ensure you have a Toast component implementation at this path
import { useToast } from "@/components/Toast";

// --- Configuration ---
const ACCENT_COLOR = "#8ed26b"; // Your desired green
const LIGHT_ACCENT_BG = "#e6f6dc"; // Lightest green background
const DARK_ACCENT_TEXT = "#4c9746"; // Dark green text/icon
const STORAGE_BUCKET_NAME = 'service-reviews'; // MUST MATCH BUCKET NAME CREATED IN STEP 2

// --- Utility Functions ---
const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  } catch {
    return dateString;
  }
};

const formatTime = (timeString: string) => {
  try {
    const [hours, minutes] = timeString.split(":");
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return timeString;
  }
};

// --- Types ---
type Booking = {
  id: number;
  order_no: string;
  user_id: string | null;
  customer_name: string;
  service_name: string;
  service_types: string[];
  date: string;
  booking_time: string;
  total_price: number;
  status: string;
  address: string | null;
  employee_name: string | null;
  employee_phone: string | null;
  payment_id: string | null; // Added for payment status
};

// --- Status Helper (omitted for brevity) ---
const getStatusDetails = (status: string) => {
  switch (status) {
    case "Pending":
      return { text: "text-orange-600", bg: "bg-orange-100", icon: Clock, stepIndex: 0 };
    case "Confirmed":
    case "Arriving Today":
    case "Work Done":
      return {
        text: `text-[${DARK_ACCENT_TEXT}]`,
        bg: `bg-[${LIGHT_ACCENT_BG}]`,
        icon: status === "Confirmed" ? CheckCircle : status === "Arriving Today" ? MapPin : Wrench,
        stepIndex: ["Pending", "Confirmed", "Arriving Today", "Work Done"].indexOf(status),
      };
    default:
      return { text: "text-gray-700", bg: "bg-gray-100", icon: Hash, stepIndex: -1 };
  }
};

// --- Payment Status Helper ---
const getPaymentStatusDetails = (paymentId: string | null) => {
  if (paymentId) {
    return { text: "text-green-600", bg: "bg-green-100", label: "Paid" };
  } else {
    return { text: "text-red-600", bg: "bg-red-100", label: "On Site Payment" };
  }
};

// ============================
// Review Modal Component
// ============================
type ReviewModalProps = {
  order: Booking;
  onClose: () => void;
  onSubmit: (data: ReviewSubmitData) => Promise<boolean>;
};

type ReviewSubmitData = {
  rating: number;
  employeeName: string;
  serviceDetails: string;
  imageFiles: File[];
};

// ... existing code ...

const ReviewModal: React.FC<ReviewModalProps> = ({ order, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  // Change this line to start with an empty string, allowing the user to input the employee name without pre-filling from potentially incorrect data
  const [employeeName, setEmployeeName] = useState("");
  const [serviceDetails, setServiceDetails] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const MAX_IMAGES = 4;
  const imageInputRef = useRef<HTMLInputElement>(null);


  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);

    const newFiles = selectedFiles.slice(0, MAX_IMAGES - images.length);

    if (images.length + selectedFiles.length > MAX_IMAGES) {
      toast({
        title: "Too many images",
        description: `You can only upload up to ${MAX_IMAGES} images.`,
        variant: "destructive",
      });
    }
    setImages((prev) => [...prev, ...newFiles]);

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!employeeName.trim() || rating === 0) {
      setError("Please provide a rating and the employee's name.");
      return;
    }

    setIsSubmitting(true);
    const success = await onSubmit({
      rating,
      employeeName: employeeName.trim(),
      serviceDetails,
      imageFiles: images
    });
    setIsSubmitting(false);

    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 sm:p-8 transform transition-all duration-300 scale-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
          <h3 className={`text-2xl font-bold text-slate-800 flex items-center`}>
            <Star className={`w-6 h-6 mr-3`} style={{ color: ACCENT_COLOR }} />
            Rate Your Service
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <p className="text-slate-600">
            How was the service for <strong>{order.service_name} (Order #{order.order_no})
</strong>?
          </p>

          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-10 h-10 cursor-pointer transition-colors duration-150 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "fill-slate-200 text-slate-400"
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Employee Name */}
          <input
            id="employee"
            type="text"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            required
            placeholder="E.g., David or Technician 123"
            className={`w-full p-3 border rounded-lg transition focus:ring-2 focus:ring-offset-2 focus:ring-green-400`}
            style={{ borderColor: LIGHT_ACCENT_BG }}
          />


          {/* Service Details */}
          <div className="space-y-2">
            <label htmlFor="details" className="text-sm font-semibold text-slate-700 block">
              Tell us about the services done (Optional)
            </label>
            <textarea
              id="details"
              rows={3}
              value={serviceDetails}
              onChange={(e) => setServiceDetails(e.target.value)}
              placeholder="E.g., They were quick and fixed the issue perfectly."
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition resize-none"
            />

          </div>

          {/* Image Upload Section */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block flex items-center">
              <ImageIcon className="w-4 h-4 mr-2" /> Add Photos (Max {MAX_IMAGES})
            </label>
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
              disabled={images.length >= MAX_IMAGES}
            />
            <div className="flex flex-wrap gap-3 pt-2">
              {images.map((file, index) => (
                <div key={index} className="relative w-20 h-20 border rounded-lg overflow-hidden shadow-sm">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-0.5 text-xs transition hover:bg-red-700 z-10"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-600 bg-red-100 p-3 rounded-lg border border-red-300 font-medium">{error}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-lg text-white font-bold text-lg transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            style={{ backgroundColor: ACCENT_COLOR }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="animate-spin w-5 h-5 mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Review"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// ============================
// Main MyOrdersPage Component
// ============================
export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderToReview, setSelectedOrderToReview] = useState<Booking | null>(null);
  const [reviewedOrderIds, setReviewedOrderIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  // Fetch reviewed orders (omitted for brevity)
  const fetchReviewStatus = async (userId: string) => { /* ... existing implementation ... */
    const { data, error } = await supabase.from("service_reviews").select("booking_id").eq("user_id", userId);
    if (data) setReviewedOrderIds(data.map((r) => r.booking_id));
    if (error) console.error("Error fetching review status:", error);
  };

  // Fetch bookings (omitted for brevity)
  const fetchOrders = async () => { /* ... existing implementation ... */
    const { data, error } = await supabase.auth.getUser();
    if (error || !data?.user) {
      setLoading(false);
      return;
    }

    const user = data.user;
    const { data: bookings, error: fetchError } = await supabase
      .from("bookings")
      .select("*")
      .eq("user_id", user.id)
      .order("id", { ascending: false });

    if (!fetchError) setOrders(bookings || []);
    await fetchReviewStatus(user.id);
    setLoading(false);
  };

useEffect(() => {
  const setup = async () => {
    await fetchOrders();
    const { data } = await supabase.auth.getUser();
    if (!data?.user) return;
    const user = data.user;

    const subscription = supabase
      .channel("bookings-updates-full")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const updatedOrder = payload.new as Booking;
          const deletedId = (payload.old as Booking | undefined)?.id;  // Fixed here

          setOrders((prev) => {
            if (payload.eventType === "INSERT") return [updatedOrder, ...prev];
            if (payload.eventType === "UPDATE")
              return prev.map((o) => (o.id === updatedOrder.id ? updatedOrder : o));
            if (payload.eventType === "DELETE")
              return prev.filter((o) => o.id !== deletedId);
            return prev;
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(subscription);
  };
  setup();
}, []);

  const handleOpenReview = (order: Booking) => {
    setSelectedOrderToReview(order);
    setIsModalOpen(true);
  };
  const handleCloseReview = () => {
    setIsModalOpen(false);
    setSelectedOrderToReview(null);
  };

  const handleReviewSubmit = useCallback(
    async (reviewData: ReviewSubmitData): Promise<boolean> => {
      if (!selectedOrderToReview) return false;
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData?.user?.id;
      if (!userId) {
        toast({ title: "Error", description: "User not logged in.", variant: "destructive" });
        return false;
      }

      let uploadedImageUrls: string[] = [];

      try {
        // 1. UPLOAD IMAGES TO SUPABASE STORAGE
        const uploadPromises = reviewData.imageFiles.map(async (file) => {
          const fileExtension = file.name.split('.').pop();
          const path = `reviews/${userId}/${selectedOrderToReview.id}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExtension}`;

          const { data: uploadData, error: uploadError } = await supabase.storage
            .from(STORAGE_BUCKET_NAME)
            .upload(path, file, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) throw new Error(`Upload failed for file ${file.name}: ${uploadError.message}`);

          // 2. GET PUBLIC URL
          const { data: urlData } = supabase.storage
            .from(STORAGE_BUCKET_NAME)
            .getPublicUrl(uploadData.path);

          return urlData.publicUrl;
        });

        // Wait for all uploads to complete
        uploadedImageUrls = await Promise.all(uploadPromises);

        // 3. INSERT REVIEW DATA INTO 'service_reviews' TABLE
        const { error: insertError } = await supabase.from("service_reviews").insert({
          booking_id: selectedOrderToReview.id,
          user_id: userId,
          rating: reviewData.rating,
          employee_name: reviewData.employeeName,
          service_details: reviewData.serviceDetails,
          images: uploadedImageUrls, // Stores the array of public URLs
          // status defaults to 'pending' in the SQL table
        });

        if (insertError) throw insertError;

        // 4. SUCCESS HANDLING
        setReviewedOrderIds((prev) => [...prev, selectedOrderToReview.id]);

        toast({
          title: "Review Submitted",
          description: `Thank you for reviewing Order #${selectedOrderToReview.id}. Review status: Pending.`,
          variant: "success",
        });
        return true;

      } catch (error: any) {
        console.error("Review Submission Error:", error);
        toast({
          title: "Review Failed",
          description: `Could not submit review: ${error.message || "An unknown error occurred."} (Check if storage bucket '${STORAGE_BUCKET_NAME}' exists)`,
          variant: "destructive"
        });
        return false;
      }
    },
    [selectedOrderToReview, toast]
  );

 const filteredOrders = orders.filter(
  (order) =>
    searchQuery === "" ||
    order.order_no?.includes(searchQuery)
);


  // --- OrderCard Component (Full) ---
  const OrderCard = ({ order }: { order: Booking }) => {
    const { text, bg, icon: Icon, stepIndex } = getStatusDetails(order.status);
    const isCompleted = order.status === "Work Done";
    const hasBeenReviewed = reviewedOrderIds.includes(order.id);
    const { text: paymentText, bg: paymentBg, label: paymentLabel } = getPaymentStatusDetails(order.payment_id);

    const timelineSteps = [
      { label: "Booked & Pending", icon: Clock },
      { label: "Order Confirmed", icon: CheckCircle },
      { label: "Technician Arriving", icon: MapPin },
      { label: "Work Completed", icon: Package },
    ];

    return (
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 transition-all duration-300 transform hover:shadow-2xl" style={{ borderLeft: `6px solid ${ACCENT_COLOR}` }}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center">
            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mr-4">{order.service_name}</h2>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${text} ${bg}`}>
              <Icon className="w-3 h-3 mr-1.5 inline-block" />
              {order.status}
            </span>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${paymentText} ${paymentBg} ml-2`}>
              {paymentLabel}
            </span>
          </div>
          <p className="text-slate-500 mt-2 sm:mt-0 flex items-center text-sm">
            <Hash className="w-4 h-4 mr-1 text-slate-400" /> Order ID: <span className="font-mono ml-1 font-semibold">{order.order_no}</span>
          </p>
        </div>

        {/* Details & Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Date", value: formatDate(order.date), icon: Calendar },
                { label: "Time", value: formatTime(order.booking_time), icon: Clock },
                { label: "Price", value: `₹${order.total_price}`, icon: IndianRupee },
                { label: "Customer Name", value: order.customer_name, icon: User },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center p-3 rounded-lg border border-slate-200">
                  <item.icon className={`w-5 h-5 mr-3 text-[${DARK_ACCENT_TEXT}]`} />
                  <div>
                    <p className="text-xs font-medium text-slate-500">{item.label}</p>
                    <p className="font-bold text-slate-800 text-base">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="font-bold text-sm text-slate-700 mb-2 flex items-center">
                <Wrench className="w-4 h-4 mr-2 text-slate-500" /> Service Types
              </p>
              <div className="flex flex-wrap gap-2">
                {order.service_types.map((type, i) => (
                  <span key={i} className={`px-3 py-1 text-xs font-medium text-[${DARK_ACCENT_TEXT}] bg-white border border-[${LIGHT_ACCENT_BG}] rounded-full shadow-sm`}>{type}</span>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="font-bold text-sm text-slate-700 mb-2 flex items-center">
                <Home className="w-4 h-4 mr-2 text-slate-500" /> Service Location:
              </p>
              <p className="text-slate-600 leading-relaxed pl-6 text-sm">{order.address || "Address not provided."}</p>
            </div>
          </div>

          <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-6">
            {/* Timeline Title */}
            <p className="text-sm font-semibold text-slate-700 mb-4">Order Timeline</p>

            {/* Timeline Steps */}
            <div className="space-y-4">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className="flex items-center space-x-3">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center ${idx <= stepIndex
                      ? `bg-[${ACCENT_COLOR}] text-white`
                      : "bg-slate-200 text-slate-400"
                      }`}
                  >
                    <step.icon className="w-4 h-4" />
                  </div>
                  <span
                    className={`text-sm ${idx <= stepIndex ? "font-semibold text-slate-800" : "text-slate-500"
                      }`}
                  >
                    {step.label}
                  </span>
                </div>
              ))}
            </div>

            {/* ⭐ Assigned Technician */}
            {order.status === "Arriving Today" &&
              (order.employee_name || order.employee_phone) && (
                <div className="mt-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="font-bold text-sm text-slate-700 mb-2 flex items-center">
                    <User className="w-4 h-4 mr-2 text-slate-500" /> Assigned Technician:
                  </p>

                  <div className="space-y-1 text-sm text-slate-600 pl-6">
                    {order.employee_name && (
                      <p><strong>Name:</strong> {order.employee_name}</p>
                    )}
                    {order.employee_phone && (
                      <p><strong>Phone:</strong> {order.employee_phone}</p>
                    )}
                  </div>
                </div>
              )}

            {/* Review button */}
            {isCompleted && !hasBeenReviewed && (
              <button
                onClick={() => handleOpenReview(order)}
                className="mt-6 w-full py-2 px-4 rounded-lg font-semibold text-white hover:brightness-110 transition"
                style={{ backgroundColor: ACCENT_COLOR }}
              >
                Review Order
              </button>
            )}

            {/* Already reviewed */}
            {hasBeenReviewed && (
              <p className="mt-6 text-sm font-semibold text-green-700">
                You have reviewed this order.
              </p>
            )}
          </div>

        </div>
      </div>
    );
  };


  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:py-20">
      <div className="max-w-6xl mx-auto space-y-6">
        <div
          className="flex flex-col sm:flex-row items-start sm:items-center bg-white p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl mb-6 sm:mb-10 border-t-4"
          style={{ borderColor: ACCENT_COLOR }}
        >
          {/* Icon */}
          <Search
            className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 mr-3 sm:mr-4"
            style={{ color: ACCENT_COLOR }}
          />

          {/* Title + Search Input */}
          <div className="w-full">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">
              My Orders ({orders.length})
            </h1>

            {/* Search Input */}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by Order ID"
                className="pl-10 pr-4 py-2 w-full border rounded-lg shadow-sm focus:outline-none focus:ring-2"
                style={{
                  borderColor: "#e2e8f0",
                  boxShadow: `0 0 0 2px transparent`,
                }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>



        {/* Orders List */}
        {loading ? (
          <p className="text-slate-600">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <p className="text-slate-600">No orders found.</p>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {isModalOpen && selectedOrderToReview && (
        <ReviewModal
          order={selectedOrderToReview}
          onClose={handleCloseReview}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}