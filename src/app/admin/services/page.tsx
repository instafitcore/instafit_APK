"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase-client";
import { 
  Search, 
  User, 
  Phone, 
  X, 
  Calendar, 
  DollarSign, 
  Clock, 
  Filter, 
  AlertTriangle, 
  Loader2, 
  RefreshCw, 
  CheckCircle, 
  Clock as PendingIcon, 
  Truck, 
  Wrench 
} from "lucide-react";

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
  payment_status?: string;
  created_at: string;
  address: string | null;
  employee_name?: string | null;
  employee_phone?: string | null;
};

// Define the authoritative list of status options and their order
const STATUS_OPTIONS = [
  "Pending",
  "Confirmed", 
  "Arriving Today",
  "Work Done"
];

// Helper function for status colors and icons
const getStatusConfig = (status: string) => {
  switch (status) {
    case "Pending":
      return { 
        classes: "bg-yellow-100 text-yellow-800 border-yellow-300", 
        icon: PendingIcon 
      };
    case "Confirmed":
      return { 
        classes: "bg-blue-100 text-blue-800 border-blue-300", 
        icon: CheckCircle 
      };
    case "Arriving Today":
      return { 
        classes: "bg-purple-100 text-purple-800 border-purple-300", 
        icon: Truck 
      };
    case "Work Done":
      return { 
        classes: "bg-green-100 text-green-800 border-green-300", 
        icon: Wrench 
      };
    default:
      return { 
        classes: "bg-gray-100 text-gray-800 border-gray-300", 
        icon: PendingIcon 
      };
  }
};

// A list of all unique service types across all bookings for the filter dropdown
const ALL_SERVICE_TYPES = ["Installation", "Dismantle", "Repair", "Maintenance", "Cleanup"]; 

// =========================================================================
// BOOKINGS PAGE COMPONENT
// =========================================================================

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filtered, setFiltered] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [paymentFilter, setPaymentFilter] = useState("All Payment Status");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("All Service Types");

  // --- MODAL STATE ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [employeeName, setEmployeeName] = useState("");
  const [employeePhone, setEmployeePhone] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [modalError, setModalError] = useState("");
  // -------------------

  // Fetches initial data
  const fetchBookings = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setRefreshing(true);
    else setLoading(true);
    
    try {
      const { data, error } = await supabase
        .from("bookings")
        .select("*")
        .order("id", { ascending: false });

      if (!error) {
        // Ensure service_types is an array for type safety
        const normalizedData = (data || []).map(b => ({
          ...b,
          service_types: b.service_types || []
        }));
        setBookings(normalizedData);
        setFiltered(normalizedData);
      } else {
        console.error("Error fetching bookings:", error);
        setBookings([]);
        setFiltered([]);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setBookings([]);
      setFiltered([]);
    }
    
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // Filter/Search Logic
  useEffect(() => {
    let results = bookings;
    
    if (search.trim() !== "") {
      results = results.filter(
        (b) =>
          b.customer_name.toLowerCase().includes(search.toLowerCase()) ||
          b.service_name.toLowerCase().includes(search.toLowerCase()) ||
          b.address?.toLowerCase().includes(search.toLowerCase()) ||
          b.employee_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter !== "All Status") {
      results = results.filter((b) => b.status === statusFilter);
    }

    if (paymentFilter !== "All Payment Status") {
      results = results.filter((b) => b.payment_status === paymentFilter);
    }

    if (serviceTypeFilter !== "All Service Types") {
      results = results.filter((b) => b.service_types.includes(serviceTypeFilter));
    }

    setFiltered(results);
  }, [search, statusFilter, paymentFilter, serviceTypeFilter, bookings]);

  // Status Change Handler (opens modal if 'Arriving Today')
  const handleStatusChange = (id: number, status: string) => {
    if (status === "Arriving Today") {
      const booking = bookings.find(b => b.id === id);
      
      setEmployeeName(booking?.employee_name || "");
      setEmployeePhone(booking?.employee_phone || "");

      setSelectedBookingId(id);
      setNewStatus(status);
      setModalError(""); 
      setIsModalOpen(true);
    } else {
      // For all other status changes, update immediately
      updateStatus(id, status);
    }
  };

  // Function to handle modal submission
  const assignEmployeeAndProceed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBookingId) return;

    if (!employeeName.trim() || !employeePhone.trim()) {
      setModalError("Employee Name and Phone are required to set status to 'Arriving Today'.");
      return;
    }

    setModalError("");
    await updateStatus(selectedBookingId, newStatus, employeeName, employeePhone);
  };

  // Core Update Function
  const updateStatus = async (
    id: number,
    status: string,
    name: string | null = null,
    phone: string | null = null
  ) => {
    setUpdating(true);

    const updateData: {
      status: string;
      employee_name?: string | null;
      employee_phone?: string | null;
    } = { status };

    if (name !== null) updateData.employee_name = name;
    if (phone !== null) updateData.employee_phone = phone;

    try {
      const { error } = await supabase
        .from("bookings")
        .update(updateData)
        .eq("id", id);

      if (!error) {
        // Local State Update
        setBookings((prev) =>
          prev.map((b) =>
            b.id === id
              ? {
                  ...b,
                  status: status,
                  employee_name: name ?? b.employee_name, 
                  employee_phone: phone ?? b.employee_phone, 
                }
              : b
          )
        );
        // If coming from modal, close it
        if (isModalOpen) {
          setIsModalOpen(false);
          setSelectedBookingId(null);
          setEmployeeName("");
          setEmployeePhone("");
          setNewStatus("");
        }
      } else {
        console.error("Error updating booking:", error);
        alert("Failed to update booking status. Please try again.");
      }
    } catch (err) {
      console.error("Unexpected error during update:", err);
      alert("An unexpected error occurred. Please try again.");
    }
    setUpdating(false);
  };

  // Helper function to determine if an option should be disabled
  const isStatusDisabled = (currentStatus: string, option: string): boolean => {
    const currentIndex = STATUS_OPTIONS.indexOf(currentStatus);
    const optionIndex = STATUS_OPTIONS.indexOf(option);
    
    // Disable any option whose index is less than the current status index (i.e., previous steps)
    // This ensures the workflow progresses forward only.
    return optionIndex < currentIndex;
  };

  const uniqueServiceTypes = useMemo(() => {
    const types = new Set<string>();
    bookings.forEach(b => b.service_types.forEach(t => types.add(t)));
    return Array.from(types).sort();
  }, [bookings]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter(b => b.status === "Pending").length;
    const confirmed = bookings.filter(b => b.status === "Confirmed").length;
    const arriving = bookings.filter(b => b.status === "Arriving Today").length;
    const completed = bookings.filter(b => b.status === "Work Done").length;
    const paid = bookings.filter(b => b.payment_status === "Paid").length;
    const totalRevenue = bookings.reduce((sum, b) => sum + b.total_price, 0);

    return { total, pending, confirmed, arriving, completed, paid, totalRevenue };
  }, [bookings]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Booking Management Dashboard
            </h1>
            <p className="text-gray-600">Manage and track all service bookings efficiently</p>
          </div>
          <button
            onClick={() => fetchBookings(true)}
            disabled={refreshing}
            className="mt-4 sm:mt-0 flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{summaryMetrics.total}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{summaryMetrics.pending}</p>
              </div>
              <PendingIcon className="w-8 h-8 text-yellow-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Paid</p>
                <p className="text-2xl font-bold text-green-600">{summaryMetrics.paid}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500" />
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{summaryMetrics.totalRevenue.toFixed(2)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>
        </div>

        {/* Filter Card */}
        <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center gap-2">
            <Filter className="w-5 h-5" /> 
            Filters & Search
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search bookings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            >
              <option>All Status</option>
              {STATUS_OPTIONS.map(s => <option key={`filter-${s}`}>{s}</option>)}
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            >
              <option>All Payment Status</option>
              <option>Paid</option>
              <option>Unpaid</option>
            </select>

            {/* Service Type Filter */}
            <select
              value={serviceTypeFilter}
              onChange={(e) => setServiceTypeFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
            >
              <option>All Service Types</option>
              {uniqueServiceTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Price / Payment
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Address
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employee
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin mr-3 text-blue-500" />
                        <span className="text-gray-500 text-lg">Loading bookings...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-gray-500 text-lg">
                        No bookings found matching your filters.
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((b) => {
                    const statusConfig = getStatusConfig(b.status);
                    return (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {b.customer_name}
                              </div>
                                                            <div className="text-sm text-gray-500">
                                Types: {b.service_types.join(", ")}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-medium">{b.service_name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                            {b.date}
                          </div>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="w-4 h-4 mr-1 text-gray-400" />
                            {b.booking_time}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="text-lg font-bold text-green-600">₹{b.total_price.toFixed(2)}</div>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            b.payment_status === 'Paid' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {b.payment_status || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 max-w-xs truncate">
                            {b.address || "Address Not Provided"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {b.employee_name ? (
                            <div>
                              <div className="flex items-center text-sm text-gray-900">
                                <User className="w-4 h-4 mr-1 text-gray-400" />
                                {b.employee_name}
                              </div>
                              <div className="flex items-center text-sm text-blue-600 mt-1">
                                <Phone className="w-4 h-4 mr-1" />
                                {b.employee_phone}
                              </div>
                            </div>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Not Assigned
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <select
                              value={b.status}
                              onChange={(e) => handleStatusChange(b.id, e.target.value)}
                              className={`border text-sm px-3 py-1.5 rounded-lg font-medium shadow-sm outline-none transition-all duration-200 ${getStatusConfig(b.status).classes}`}
                              disabled={updating}
                            >
                              {STATUS_OPTIONS.map((statusOption) => (
                                <option
                                  key={statusOption}
                                  value={statusOption}
                                  disabled={isStatusDisabled(b.status, statusOption)}
                                  className={isStatusDisabled(b.status, statusOption) ? "text-gray-400" : "text-gray-900"}
                                >
                                  {statusOption}
                                </option>
                              ))}
                            </select>
                            {updating && <Loader2 className="w-4 h-4 animate-spin ml-2 text-blue-500" />}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Employee Assignment Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsModalOpen(false)}></div>
              </div>

              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <User className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Assign Employee & Confirm
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Enter the service professional's details to confirm that they are <strong>Arriving Today</strong> for Booking ID: <strong>{selectedBookingId}</strong>.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <form onSubmit={assignEmployeeAndProceed}>
                  <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <div className="flex-1">
                      <div className="space-y-4">
                        {/* Employee Name Input */}
                        <div>
                          <label htmlFor="employeeName" className="block text-sm font-medium text-gray-700 mb-1">
                            Employee Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="employeeName"
                            type="text"
                            value={employeeName}
                            onChange={(e) => setEmployeeName(e.target.value)}
                            placeholder="e.g., Jane Smith"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            required
                          />
                        </div>

                        {/* Employee Phone Input */}
                        <div>
                          <label htmlFor="employeePhone" className="block text-sm font-medium text-gray-700 mb-1">
                            Employee Phone Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="employeePhone"
                            type="tel"
                            value={employeePhone}
                            onChange={(e) => setEmployeePhone(e.target.value)}
                            placeholder="e.g., 9876543210"
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                            required
                          />
                        </div>
                      </div>

                      {modalError && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center">
                            <AlertTriangle className="w-4 h-4 text-red-500 mr-2" />
                            <p className="text-sm font-medium text-red-600">{modalError}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 flex items-center"
                      disabled={updating}
                    >
                      {updating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                      Confirm & Set Status to "{newStatus}"
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsModalOpen(false)}
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      disabled={updating}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
