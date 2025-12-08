"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabase-client";
import { Package, Clock, CheckCircle, MapPin, Wrench, Calendar, DollarSign, Home, Loader2, ListOrdered, ChevronRight, Hash, User, RefreshCw, Star, X } from "lucide-react";
import { useToast } from "@/components/Toast";

// --- Configuration ---
const ACCENT_COLOR = "#8ed26b"; // Your desired green
const LIGHT_ACCENT_BG = "#e6f6dc"; // Lightest green background
const DARK_ACCENT_TEXT = "#4c9746"; // Dark green text/icon

// --- Utility Functions for Formatting ---

const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" });
  } catch { return dateString; }
};

const formatTime = (timeString: string) => {
  try {
    const [hours, minutes] = timeString.split(':');
    const date = new Date();
    date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch { return timeString; }
};

// --- Main Component Types ---

type Booking = {
  id: number;
  user_id: string | null;
  customer_name: string;
  service_name: string;
  service_types: string[];
  date: string;
  booking_time: string;
  total_price: number;
  status: string;
  address: string | null;
};

// UPDATED: Added serviceDetails
type ReviewData = {
  rating: number;
  employeeName: string;
  serviceDetails: string;
  images: string[];
};


// --- Helper Functions for Status Styling ---

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
        icon: status === "Confirmed" ? CheckCircle : (status === "Arriving Today" ? MapPin : Wrench),
        stepIndex: ["Pending", "Confirmed", "Arriving Today", "Work Done"].indexOf(status)
      };
    default:
      return { text: "text-gray-700", bg: "bg-gray-100", icon: Hash, stepIndex: -1 };
  }
};

// =========================================================================
//                             Review Modal Component - UPDATED
// =========================================================================

type ReviewModalProps = {
  order: Booking;
  onClose: () => void;
  // UPDATED: onSubmit now returns a Promise<boolean> to indicate success/failure
  onSubmit: (data: ReviewData) => Promise<boolean>;
};

const ReviewModal: React.FC<ReviewModalProps> = ({ order, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [employeeName, setEmployeeName] = useState("");
  const [serviceDetails, setServiceDetails] = useState(""); // NEW STATE
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

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
      serviceDetails
    });

    setIsSubmitting(false);

    if (!success) {
      // If onSubmit failed (e.g., Supabase error)
      setError("Failed to submit review. Please check your connection and try again.");
    }
  };

  const [images, setImages] = useState<File[]>([]);
  const MAX_IMAGES = 4;

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selectedFiles = Array.from(e.target.files);
    if (images.length + selectedFiles.length > MAX_IMAGES) {
      alert(`You can only upload up to ${MAX_IMAGES} images.`);
      return;
    }
    setImages((prev) => [...prev, ...selectedFiles]);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-70 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 sm:p-8 transform transition-all duration-300 scale-100">

        {/* Modal Header */}
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

          <p className="text-slate-600">How was the service for <strong>{order.service_name} (Order #{order.id})</strong>?</p>

          {/* Star Rating */}
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">Rating</label>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  onClick={() => setRating(star)}
                  className={`w-10 h-10 cursor-pointer transition-colors duration-150 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'fill-slate-200 text-slate-400'
                    }`}
                />
              ))}
            </div>
          </div>

          {/* Employee Name Input */}
          <div className="space-y-2">
            <label htmlFor="employee" className="text-sm font-semibold text-slate-700 block">
              Employee Name (who provided the service)
            </label>
            <input
              id="employee"
              type="text"
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              required
              placeholder="E.g., David or Technician 123"
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-offset-2 transition focus:ring-offset-0"
              style={{ borderColor: LIGHT_ACCENT_BG, focusRingColor: ACCENT_COLOR }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 block">
              Upload Images (Optional, max {MAX_IMAGES})
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full"
            />
            <div className="flex flex-wrap mt-2 gap-2">
              {images.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt="preview"
                    className="w-20 h-20 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>


          {/* Service Details Text Area (NEW) */}
          <div className="space-y-2">
            <label htmlFor="details" className="text-sm font-semibold text-slate-700 block">
              Tell us about the services done (Optional)
            </label>
            <textarea
              id="details"
              rows={3}
              value={serviceDetails}
              onChange={(e) => setServiceDetails(e.target.value)}
              placeholder="E.g., They were quick and fixed the issue perfectly. Very satisfied with the work."
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-offset-2 transition focus:ring-offset-0 resize-none"
              style={{ borderColor: LIGHT_ACCENT_BG, focusRingColor: ACCENT_COLOR }}
            />
          </div>

          {error && (
            <div className="text-red-600 bg-red-100 p-3 rounded-lg border border-red-300 font-medium">
              {error}
            </div>
          )}

          {/* Submit Button */}
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

// =========================================================================
//                             Main Component (MyOrdersPage) - UPDATED
// =========================================================================

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderToReview, setSelectedOrderToReview] = useState<Booking | null>(null);
  const [reviewedOrderIds, setReviewedOrderIds] = useState<number[]>([]); // NEW STATE to track reviewed orders
const { toast } = useToast();

  // NEW: Function to fetch which orders the user has already reviewed
  const fetchReviewStatus = async (userId: string) => {
    const { data, error } = await supabase
      .from('service_reviews')
      .select('booking_id')
      .eq('user_id', userId);

    if (data) {
      setReviewedOrderIds(data.map(review => review.booking_id));
    }
    if (error) {
      console.error("Error fetching review status:", error);
    }
  }

  // UPDATED: Fetch orders now calls fetchReviewStatus
  const fetchOrders = async () => {
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

    if (!fetchError) {
      setOrders(bookings || []);
    }

    // Fetch review status immediately after fetching orders
    await fetchReviewStatus(user.id);

    setLoading(false);
  };

  // Real-time subscription logic remains the same (important for updates!)
  useEffect(() => {
    const setup = async () => {
      await fetchOrders(); // Initial fetch

      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return;

      const user = data.user;

      const subscription = supabase
        .channel("bookings-updates-full")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "bookings",
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            const updatedOrder = payload.new as Booking;
            const deletedId = payload.old?.id;

            setOrders((prev) => {
              if (payload.eventType === "INSERT") {
                return [updatedOrder, ...prev];
              }
              if (payload.eventType === "UPDATE") {
                return prev.map((order) =>
                  order.id === updatedOrder.id ? updatedOrder : order
                );
              }
              if (payload.eventType === "DELETE") {
                return prev.filter((order) => order.id !== deletedId);
              }
              return prev;
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(subscription);
      };
    };

    setup();
  }, []);

  // --- Handlers for Review Modal ---

  const handleOpenReview = (order: Booking) => {
    setSelectedOrderToReview(order);
    setIsModalOpen(true);
  };

  const handleCloseReview = () => {
    setIsModalOpen(false);
    setSelectedOrderToReview(null);
  };

  // UPDATED: Supabase Submission Function
  const handleReviewSubmit = useCallback(async (reviewData: ReviewData): Promise<boolean> => {
    if (!selectedOrderToReview) return false;

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData?.user?.id;
    if (!userId) return false;

    const { error } = await supabase
      .from("service_reviews")
      .insert({
        booking_id: selectedOrderToReview.id,
        user_id: userId,
        rating: reviewData.rating,
        employee_name: reviewData.employeeName,
        service_details: reviewData.serviceDetails,
        images: reviewData.images,
      });

    if (error) {
      console.error("Supabase Review Insert Error:", error);
      toast({
        title: "Review Submission Failed",
        description: error.message,
        variant: "destructive",
      });
      return false;
    }

    setReviewedOrderIds(prev => [...prev, selectedOrderToReview.id]);
    handleCloseReview();

    // ✅ Show success toast
    toast({
      title: "Review Submitted Successfully!",
      description: `Thank you for your review for Order #${selectedOrderToReview.id}.`,
      variant: "success",
    });

    return true;
  }, [selectedOrderToReview, toast]);


  // --- Order Card Component (Updated to use reviewedOrderIds) ---

  const OrderCard = ({ order }: { order: Booking }) => {
    const { text, bg, icon: Icon, stepIndex } = getStatusDetails(order.status);
    const totalSteps = 4;
    const isCompleted = order.status === "Work Done";
    // UPDATED: Check against the state array
    const hasBeenReviewed = reviewedOrderIds.includes(order.id);

    const timelineSteps = [
      { label: "Booked & Pending", icon: Clock },
      { label: "Order Confirmed", icon: CheckCircle },
      { label: "Technician Arriving", icon: MapPin },
      { label: "Work Completed", icon: Package },
    ];

    return (
      <div
        className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 transition-all duration-300 transform hover:shadow-2xl"
        style={{ borderLeft: `6px solid ${ACCENT_COLOR}` }}
      >
        {/* Header and Status */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-6">
          <div className="flex items-center">
            <h2 className="text-2xl font-extrabold text-slate-900 leading-tight mr-4">{order.service_name}</h2>
            <span className={`px-3 py-1 text-xs font-bold rounded-full ${text} ${bg}`}>
              <Icon className="w-3 h-3 mr-1.5 inline-block" />
              {order.status}
            </span>
          </div>
          <p className="text-slate-500 mt-2 sm:mt-0 flex items-center text-sm">
            <Hash className="w-4 h-4 mr-1 text-slate-400" /> Order ID: <span className="font-mono ml-1 font-semibold">{order.id}</span>
          </p>
        </div>

        {/* Details and Timeline Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Column 1 & 2: Key Details */}
          <div className="md:col-span-2 space-y-4">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Date", value: formatDate(order.date), icon: Calendar },
                { label: "Time", value: formatTime(order.booking_time), icon: Clock },
                { label: "Price", value: `₹${order.total_price}`, icon: DollarSign, color: DARK_ACCENT_TEXT },
                { label: "Customer Name", value: order.customer_name, icon: User },
              ].map((item, index) => (
                <div key={index} className="flex items-center p-3 rounded-lg border border-slate-200">
                  <item.icon className={`w-5 h-5 mr-3 text-[${item.color || DARK_ACCENT_TEXT}]`} />
                  <div>
                    <p className="text-xs font-medium text-slate-500">{item.label}</p>
                    <p className={`font-bold text-slate-800 text-base ${item.color ? `text-[${item.color}]` : ''}`}>{item.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="font-bold text-sm text-slate-700 mb-2 flex items-center">
                <Wrench className="w-4 h-4 mr-2 text-slate-500" /> Service Types:
              </p>
              <div className="flex flex-wrap gap-2">
                {order.service_types.map((type, index) => (
                  <span key={index} className={`px-3 py-1 text-xs font-medium text-[${DARK_ACCENT_TEXT}] bg-white border border-[${LIGHT_ACCENT_BG}] rounded-full shadow-sm`}>{type}</span>
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

          {/* Column 3: Vertical Timeline & Review Button */}
          <div className="md:col-span-1 border-t md:border-t-0 md:border-l border-slate-200 pt-6 md:pt-0 md:pl-6">

            <h3 className={`font-bold text-lg mb-4 text-[${DARK_ACCENT_TEXT}]`}>Order Progress</h3>
            <div className="relative mb-6">
              {/* Vertical Connector Line */}
              <div
                className={`absolute top-0 left-5 h-full w-0.5 bg-[${LIGHT_ACCENT_BG}]`}
                style={{ height: `${(timelineSteps.length - 1) * 60 + 20}px` }}
              >
                <div
                  className={`absolute top-0 w-full bg-[${ACCENT_COLOR}] transition-all duration-700`}
                  style={{ height: `${(stepIndex / (totalSteps - 1)) * 100}%` }}
                />
              </div>

              {timelineSteps.map((step, i) => {
                const active = stepIndex >= i;
                const Icon = step.icon;

                return (
                  <div key={i} className="flex items-center mb-6 relative z-10">
                    <div
                      className={`p-1.5 rounded-full border-2 transition-all duration-300 flex-shrink-0 ${active
                        ? `border-[${ACCENT_COLOR}] bg-white text-[${ACCENT_COLOR}] shadow-md`
                        : "border-slate-300 bg-white text-slate-400"
                        }`}
                      style={{ marginLeft: '-1px' }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="ml-3">
                      <p className={`text-sm font-semibold transition-colors duration-300 ${active ? 'text-slate-800' : 'text-slate-500'}`}>
                        {step.label}
                      </p>
                      {i === stepIndex && (
                        <p className={`text-xs font-bold text-[${DARK_ACCENT_TEXT}] mt-0.5`}>Current Status</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* NEW: Review Button / Review Submitted Display */}
            {isCompleted && !hasBeenReviewed && (
              <button
                onClick={() => handleOpenReview(order)}
                className="w-full mt-4 py-3 flex items-center justify-center rounded-lg text-white font-bold transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.01] transform"
                style={{ backgroundColor: ACCENT_COLOR }}
              >
                <Star className="w-5 h-5 mr-2 fill-white" />
                Leave Review
              </button>
            )}
            {isCompleted && hasBeenReviewed && (
              <div className={`w-full mt-4 py-3 flex items-center justify-center rounded-lg text-[${DARK_ACCENT_TEXT}] font-bold bg-[${LIGHT_ACCENT_BG}] border border-dashed border-[${ACCENT_COLOR}]`}>
                <CheckCircle className="w-5 h-5 mr-2" />
                Review Submitted!
              </div>
            )}

          </div>
        </div>
      </div>
    );
  };

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12 sm:py-20">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between bg-white p-6 rounded-xl shadow-lg mb-10 border-t-4" style={{ borderColor: ACCENT_COLOR }}>
          <div className="flex items-center">
            <ListOrdered className={`w-8 h-8 mr-4`} style={{ color: ACCENT_COLOR }} />
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              My Service Bookings
            </h1>
          </div>
          <button
            onClick={fetchOrders}
            className={`flex items-center text-sm font-semibold text-slate-600 hover:text-[${DARK_ACCENT_TEXT}] transition-colors`}
          >
            <RefreshCw className="w-4 h-4 mr-1.5" />
            Refresh List
          </button>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-20 bg-white rounded-xl shadow-lg">
            <Loader2 className={`animate-spin h-10 w-10 mb-4`} style={{ color: ACCENT_COLOR }} />
            <p className="ml-4 text-slate-600 text-lg font-medium">Fetching your secure booking history...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-lg">
            <Package className="w-16 h-16 text-slate-400 mx-auto mb-6" />
            <p className="text-slate-600 text-xl font-medium">You haven't booked any services yet.</p>
            <a
              href="/book-service"
              className={`inline-block mt-4 px-6 py-3 text-white font-semibold rounded-full shadow-lg transition duration-300 hover:bg-[#76c55d]`}
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              Start Booking Now
              <ChevronRight className="w-4 h-4 inline ml-1" />
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>

      {/* Review Modal Render */}
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