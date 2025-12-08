"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import {
  Layers,
  List,
  Wrench,
  BookOpenCheck,
  Star,
  RefreshCw,
} from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalCategories: 0,
    totalSubcategories: 0,
    totalServices: 0,
    totalBookings: 0,
    totalReviews: 0,
  });

  const [recentBookings, setRecentBookings] = useState<any[]>([]);

  const fetchDashboardData = async () => {
    try {
      const [
        { count: categoryCount },
        { count: subcategoryCount },
        { count: serviceCount },
        { count: bookingCount },
        { count: reviewCount },
        { data: recent },
      ] = await Promise.all([
        supabase.from("categories").select("*", { count: "exact" }),
        supabase.from("subcategories").select("*", { count: "exact" }),
        supabase.from("services").select("*", { count: "exact" }),
        supabase.from("bookings").select("*", { count: "exact" }),
        supabase.from("service_reviews").select("*", { count: "exact" }),
        supabase
          .from("bookings")
          .select("*")
          .order("id", { ascending: false })
          .limit(5),
      ]);

      setStats({
        totalCategories: categoryCount || 0,
        totalSubcategories: subcategoryCount || 0,
        totalServices: serviceCount || 0,
        totalBookings: bookingCount || 0,
        totalReviews: reviewCount || 0,
      });

      setRecentBookings(recent || []);
    } catch (err: any) {
      console.error("Failed to fetch dashboard data:", err.message);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="bg-[#f5f7fa] min-h-screen p-8 space-y-12">

      {/* HEADER CARD */}
      <div className="bg-white backdrop-blur-xl shadow-xl p-8 rounded-3xl border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-gray-500 mt-1 text-lg">
            Welcome back! Here is your platform summary.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-5 py-3 rounded-xl 
          bg-[#e8f5e1] text-[#4b9b3d] hover:bg-[#d4edce] font-semibold transition"
        >
          <RefreshCw size={18} />
          Refresh
        </button>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
        <StatCard
          title="Categories"
          value={stats.totalCategories}
          icon={<Layers size={28} />}
          gradient="from-blue-500 to-blue-700"
        />
        <StatCard
          title="Subcategories"
          value={stats.totalSubcategories}
          icon={<List size={28} />}
          gradient="from-purple-500 to-purple-700"
        />
        <StatCard
          title="Services"
          value={stats.totalServices}
          icon={<Wrench size={28} />}
          gradient="from-orange-400 to-orange-600"
        />
        <StatCard
          title="Bookings"
          value={stats.totalBookings}
          icon={<BookOpenCheck size={28} />}
          gradient="from-green-500 to-green-700"
        />
        <StatCard
          title="Reviews"
          value={stats.totalReviews}
          icon={<Star size={28} />}
          gradient="from-yellow-400 to-yellow-600"
        />
      </div>

      {/* RECENT BOOKINGS */}
      <div className="bg-white shadow-xl rounded-3xl p-10 border border-gray-100">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Recent Bookings
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-100 text-gray-700 text-sm border-b">
              <tr>
                <th className="p-4 text-left">Customer</th>
                <th className="p-4 text-left">Service</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Price</th>
              </tr>
            </thead>

            <tbody className="text-gray-700">
              {recentBookings.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-gray-500 font-medium"
                  >
                    No recent bookings found.
                  </td>
                </tr>
              )}

              {recentBookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-4">{b.customer_name}</td>
                  <td className="p-4">{b.service_name}</td>
                  <td className="p-4">
                    {new Date(b.date).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-sm font-semibold rounded-full ${
                        b.status === "Work Done" || b.status === "Completed"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                  <td className="p-4">₹{b.total_price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/*-----------------------
      STAT CARD
------------------------*/
function StatCard({ title, value, icon, gradient }) {
  return (
    <div className="p-7 bg-white rounded-3xl shadow-lg border border-gray-100 hover:shadow-2xl hover:-translate-y-1 transition-all">
      <div className="flex items-center gap-5">
        <div
          className={`w-16 h-16 flex items-center justify-center rounded-xl text-white shadow-md bg-gradient-to-br ${gradient}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <p className="text-4xl font-extrabold text-gray-900 leading-tight">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
