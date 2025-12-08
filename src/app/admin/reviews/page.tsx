"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import { Star, CheckCircle, XCircle, Clock, ImageIcon, Filter } from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Review {
  id: number;
  rating: number;
  employee_name: string;
  service_details: string | null;
  status: "pending" | "approved" | "rejected";
  created_at: string;
  images: string[] | null;
  bookings: {
    id: number;
    service_name: string;
  } | null;
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");

  // -------------------------------
  // FETCH REVIEWS
  // -------------------------------
  const fetchReviews = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("service_reviews")
      .select(
        `
        id,
        rating,
        employee_name,
        service_details,
        status,
        created_at,
        images,
        bookings (
          id,
          service_name
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      setReviews([]);
    } else {
      setReviews(data as Review[]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // -------------------------------
  // UPDATE STATUS (FULLY FIXED)
  // -------------------------------
  const updateStatus = async (id: number, newStatus: Review["status"]) => {
    // Optimistic UI
    setReviews((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

    // Actual DB update (FIXED with .select())
    const { data, error } = await supabase
      .from("service_reviews")
      .update({ status: newStatus })
      .eq("id", id)
      .select(); // THIS IS REQUIRED

    if (error) {
      console.error("Supabase update error:", error.message);

      // rollback UI
      fetchReviews();
      return;
    }

    if (!data || data.length === 0) {
      console.error("Update did not apply — RLS policy likely missing");

      // rollback UI
      fetchReviews();
      return;
    }

    // Success
    console.log("Status updated:", data);
  };

  // -------------------------------
  // BADGE
  // -------------------------------
  const getStatusBadge = (status: Review["status"]) => {
    const classes =
      status === "approved"
        ? "bg-green-100 text-green-700"
        : status === "rejected"
        ? "bg-red-100 text-red-700"
        : "bg-yellow-100 text-yellow-700";

    const Icon =
      status === "approved"
        ? CheckCircle
        : status === "rejected"
        ? XCircle
        : Clock;

    return (
      <span
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${classes}`}
      >
        <Icon size={14} /> {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  // -------------------------------
  // STARS
  // -------------------------------
  const renderStars = (rating: number) => (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={18}
          className={i < rating ? "text-yellow-500 fill-current" : "text-gray-300"}
        />
      ))}
    </div>
  );

  // -------------------------------
  // FILTER
  // -------------------------------
  const filteredReviews = reviews.filter(
    (r) => statusFilter === "all" || r.status === statusFilter
  );

  // -------------------------------
  // UI
  // -------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto mb-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-start mb-4 flex-wrap gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 mb-1">
                Service Review Dashboard
              </h1>
              <p className="text-gray-600 text-lg">
                Manage and moderate customer feedback.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Filter size={18} className="text-gray-500" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg bg-white"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Review Cards */}
        {loading ? (
          <p className="text-center text-lg">Loading...</p>
        ) : filteredReviews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
            <ImageIcon size={64} className="mx-auto mb-4 text-gray-400" />
            <p className="text-xl text-gray-500">No reviews found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredReviews.map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-2xl shadow-md p-6 flex flex-col"
              >
                <div className="flex flex-col items-center mb-4">
                  <h3 className="text-xl font-semibold text-gray-800 text-center mb-2">
                    {r.bookings?.service_name || "Unknown Service"}
                  </h3>
                  {getStatusBadge(r.status)}
                </div>

                {/* Images */}
                <div className="grid grid-cols-2 gap-2 mb-4">
                  {r.images?.length ? (
                    r.images.slice(0, 6).map((img, index) => (
                      <div
                        key={index}
                        className="w-full h-24 relative rounded-xl overflow-hidden"
                      >
                        <Image
                          src={img}
                          alt="Review Image"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))
                  ) : (
                    <div className="col-span-2 bg-gray-100 h-24 rounded-xl flex items-center justify-center text-gray-400">
                      <ImageIcon size={32} />
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mb-3">
                  {renderStars(r.rating)}
                  <p className="text-sm text-gray-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </p>
                </div>

                <p className="text-gray-600 text-sm italic mb-4 max-h-20 overflow-hidden">
                  "{r.service_details || "No review message"}"
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => updateStatus(r.id, "approved")}
                    disabled={r.status === "approved"}
                    className={`flex-1 py-2 px-4 rounded-xl font-medium ${
                      r.status === "approved"
                        ? "bg-green-200 text-green-700"
                        : "bg-[#8ed26b] text-white hover:bg-[#6ebb53]"
                    }`}
                  >
                    {r.status === "approved" ? "Approved" : "Approve"}
                  </button>

                  <button
                    onClick={() => updateStatus(r.id, "rejected")}
                    disabled={r.status === "rejected"}
                    className={`flex-1 py-2 px-4 rounded-xl font-medium ${
                      r.status === "rejected"
                        ? "bg-red-200 text-red-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {r.status === "rejected" ? "Rejected" : "Reject"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
