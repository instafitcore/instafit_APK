"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";

// Replace with your actual client configuration if different
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * Utility function to format the ISO date string
 * @param {string} dateString
 * @returns {string} Formatted date
 */
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

/**
 * Defines the structure for a Review item including nested data
 */
interface Review {
  id: number;
  rating: number;
  employee_name: string;
  service_details: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  bookings: {
    id: number;
    service_name: string;
    services: {
      image_url: string | null;
    } | null;
  } | null;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("service_reviews")
      .select(`
        id,
        rating,
        employee_name,
        service_details,
        status,
        created_at,
        bookings (
          id,
          service_name,
          services (
            image_url 
          )
        )
      `)
      .order('created_at', { ascending: false }); // Show newest first

    if (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } else {
      setReviews(data || []);
    }

    setLoading(false);
  };

  const updateStatus = async (id: number, newStatus: string) => {
    // Optimistic UI update (optional, but improves perceived performance)
    setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus as Review['status'] } : r));

    const { error } = await supabase
      .from("service_reviews")
      .update({ status: newStatus })
      .eq("id", id);
      
    if (error) {
      console.error("Error updating status:", error);
      // Re-fetch or revert if the update fails
      fetchReviews(); 
    }
    // We don't need a full refetch on success unless we need to re-order/re-validate
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // --- Helper Components for Design ---

  const getStatusBadge = (status: Review['status']) => {
    let colorClass = "";
    let text = status.charAt(0).toUpperCase() + status.slice(1);
    
    switch (status) {
      case "approved":
        colorClass = "bg-green-100 text-green-800 border-green-500";
        break;
      case "rejected":
        colorClass = "bg-red-100 text-red-800 border-red-500";
        break;
      case "pending":
      default:
        colorClass = "bg-yellow-100 text-yellow-800 border-yellow-500";
        break;
    }

    return (
      <span className={`inline-block px-3 py-1 text-xs font-semibold rounded-full border ${colorClass}`}>
        {text}
      </span>
    );
  };

  const renderRating = (rating: number) => {
    const stars = "⭐".repeat(rating);
    const emptyStars = "☆".repeat(5 - rating);
    return (
      <div className="text-xl text-yellow-500">
        {stars}<span className="text-gray-300">{emptyStars}</span>
      </div>
    );
  };

  const renderReviewCard = (r: Review) => {
    const serviceName = r.bookings?.service_name || "Unknown Service";
    const imageUrl = r.bookings?.services?.image_url;
    const isApproved = r.status === "approved";
    const isRejected = r.status === "rejected";

    return (
      <div
        key={r.id}
        className="bg-white/70 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col border border-gray-100 transition-all hover:shadow-2xl"
      >
        {/* Review Header: Image, Service Name, and Status */}
        <div className="flex flex-col items-center mb-4 border-b pb-4">
          <div className="w-full h-40 relative rounded-xl overflow-hidden mb-3">
            {imageUrl ? (
              <Image
                src={imageUrl} 
                alt={serviceName}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-transform duration-300 hover:scale-[1.03]"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                
              </div>
            )}
          </div>
          
          <h2 className="text-2xl font-extrabold text-gray-800 text-center mb-2">
            {serviceName}
          </h2>
          {getStatusBadge(r.status)}
        </div>

        {/* Details Section */}
        <div className="flex justify-between items-center mb-4">
          {renderRating(r.rating)}
          <p className="text-sm text-gray-500">{formatDate(r.created_at)}</p>
        </div>

        {/* Metadata and Review Text */}
        <div className="mb-4">
          <p className="text-gray-700 text-sm mb-1">
            <strong>Reviewed By:</strong> User ID ({r.user_id?.substring(0, 8)}...)
          </p>
          <p className="text-gray-700 text-sm">
            <strong>Employee:</strong> {r.employee_name}
          </p>
        </div>

        <p className="text-gray-600 text-md italic flex-grow overflow-hidden max-h-24">
          &ldquo;{r.service_details || "No review message provided."}&rdquo;
        </p>

        {/* Action buttons - Sticky to the bottom */}
        <div className="mt-6 pt-4 border-t flex gap-3">
          <button
            onClick={() => updateStatus(r.id, "approved")}
            disabled={isApproved}
            className={`flex-1 font-medium py-2 rounded-lg transition ${
              isApproved 
                ? 'bg-green-500/50 text-white cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 text-white shadow-md'
            }`}
          >
            {isApproved ? 'Approved' : 'Approve'}
          </button>

          <button
            onClick={() => updateStatus(r.id, "rejected")}
            disabled={isRejected}
            className={`flex-1 font-medium py-2 rounded-lg transition ${
              isRejected 
                ? 'bg-red-500/50 text-white cursor-not-allowed' 
                : 'bg-red-600 hover:bg-red-700 text-white shadow-md'
            }`}
          >
            {isRejected ? 'Rejected' : 'Reject'}
          </button>
        </div>
      </div>
    );
  };

  // --- Main Render ---

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900">
          ✨ Service Review Dashboard
        </h1>
        <p className="text-gray-600 mt-2">Manage customer feedback for your services.</p>
      </header>
      
      <hr className="mb-8" />

      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <p className="ml-4 text-lg text-gray-700">Loading reviews...</p>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-lg shadow-lg">
          <p className="text-xl text-gray-500">No reviews found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {reviews.map(renderReviewCard)}
        </div>
      )}
    </div>
  );
}