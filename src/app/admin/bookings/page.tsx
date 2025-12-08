"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Search, User, Phone, X, Calendar, DollarSign, Clock } from "lucide-react";

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

// Helper function for status colors
const getStatusClasses = (status: string) => {
    switch (status) {
        case "Pending":
            return "bg-yellow-100 text-yellow-700 border-yellow-300";
        case "Confirmed":
            return "bg-blue-100 text-blue-700 border-blue-300";
        case "Arriving Today":
            return "bg-purple-100 text-purple-700 border-purple-300";
        case "Work Done":
            return "bg-green-100 text-green-700 border-green-300";
        default:
            return "bg-gray-100 text-gray-700 border-gray-300";
    }
};

// =========================================================================
// BOOKINGS PAGE COMPONENT
// =========================================================================

export default function BookingsPage() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [filtered, setFiltered] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

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
    const fetchBookings = async () => {
        const { data, error } = await supabase
            .from("bookings")
            .select("*")
            .order("id", { ascending: false });

        if (!error) {
            setBookings(data || []);
            setFiltered(data || []);
        }
        setLoading(false);
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
                    b.service_name.toLowerCase().includes(search.toLowerCase())
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
            // Pre-populate fields if employee is already assigned
            setEmployeeName(booking?.employee_name || "");
            setEmployeePhone(booking?.employee_phone || "");

            setSelectedBookingId(id);
            setNewStatus(status);
            setModalError(""); // Clear previous errors
            setIsModalOpen(true);
        } else {
            // For all other status changes, update immediately
            updateStatus(id, status);
        }
    };

    // Function to handle modal submission
    const assignEmployeeAndProceed = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedBookingId) return;

        if (!employeeName.trim() || !employeePhone.trim()) {
            setModalError("Employee Name and Phone are required to set status to 'Arriving Today'.");
            return;
        }

        updateStatus(selectedBookingId, newStatus, employeeName, employeePhone);

        // Close and reset modal state
        setIsModalOpen(false);
        setSelectedBookingId(null);
        setEmployeeName("");
        setEmployeePhone("");
        setNewStatus("");
    };

    // Core Update Function
    const updateStatus = async (
        id: number,
        status: string,
        name: string | null = null,
        phone: string | null = null
    ) => {
        const updateData: {
            status: string;
            employee_name?: string | null;
            employee_phone?: string | null;
        } = { status };

        // Only update employee fields if provided (i.e., coming from the modal)
        if (name !== null) updateData.employee_name = name;
        if (phone !== null) updateData.employee_phone = phone;

        // Supabase Update
        const { error } = await supabase
            .from("bookings")
            .update(updateData)
            .eq("id", id);

        // Local State Update
        if (!error) {
            setBookings((prev) =>
                prev.map((b) =>
                    b.id === id
                        ? {
                            ...b,
                            status: status,
                            employee_name: name ?? b.employee_name, // Use existing if not updated
                            employee_phone: phone ?? b.employee_phone, // Use existing if not updated
                        }
                        : b
                )
            );
        } else {
            console.error("Error updating booking:", error);
            alert("Failed to update booking status.");
        }
    };

    // Helper function to determine if an option should be disabled
    const isStatusDisabled = (currentStatus: string, option: string): boolean => {
        const currentIndex = STATUS_OPTIONS.indexOf(currentStatus);
        const optionIndex = STATUS_OPTIONS.indexOf(option);

        // Disable any option whose index is less than the current status index (i.e., previous steps)
        return optionIndex < currentIndex;
    };

    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <h1 className="text-4xl font-extrabold mb-8 text-gray-900 tracking-tight">
                Booking Management Dashboard
            </h1>


            {/* --- FILTER CARD --- */}
            <div className="bg-white shadow-lg rounded-xl p-6 border border-gray-100 mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-700">
                        Filter & Search
                    </h2>
                    <div className="text-sm text-gray-600">
                        Total Bookings: {loading ? "..." : bookings.length}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name or service..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border rounded-lg bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-shadow duration-200"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option>All Status</option>
                        {STATUS_OPTIONS.map(s => <option key={`filter-${s}`}>{s}</option>)}
                    </select>

                    {/* Payment Filter */}
                    <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option>All Payment Status</option>
                        <option>Paid</option>
                        <option>Unpaid</option>
                    </select>

                    {/* Service Type Filter */}
                    <select
                        value={serviceTypeFilter}
                        onChange={(e) => setServiceTypeFilter(e.target.value)}
                        className="border rounded-lg px-3 py-2 bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option>All Service Types</option>
                        <option>Installation</option>
                        <option>Dismantle</option>
                        <option>Repair</option>
                    </select>
                </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* --- TABLE --- */}
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-gray-600 text-sm font-bold uppercase tracking-wider">
                            <th className="p-4">Customer</th>
                            <th className="p-4">Service</th>
                            <th className="p-4">Date & Time</th>
                            <th className="p-4 text-right">Price</th>
                            <th className="p-4">Address</th>
                            <th className="p-4">Assigned Employee</th>
                            <th className="p-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-800 divide-y divide-gray-100">
                        {/* Loading/No Bookings logic */}
                        {loading || filtered.length === 0 ? (
                            <tr><td colSpan={7} className="p-10 text-center text-gray-500 text-lg">{loading ? "Loading bookings..." : "No bookings found matching filters."}</td></tr>
                        ) : (
                            filtered.map((b) => (
                                <tr key={b.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                                    <td className="p-4 font-semibold">
                                        {b.customer_name}
                                        <div className="text-xs text-gray-500 font-normal mt-0.5">Types: {b.service_types.join(", ")}</div>
                                    </td>
                                    <td className="p-4 font-medium">{b.service_name}</td>
                                    <td className="p-4 text-sm whitespace-nowrap">
                                        <div className="flex items-center space-x-1 text-gray-600">
                                            <Calendar className="w-3 h-3" /> <span>{b.date}</span>
                                        </div>
                                        <div className="flex items-center space-x-1 text-gray-600">
                                            <Clock className="w-3 h-3" /> <span className="font-medium">{b.booking_time}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 font-extrabold text-lg text-green-600 text-right whitespace-nowrap">
                                        ₹{b.total_price.toFixed(2)}
                                    </td>
                                    <td className="p-4 max-w-xs text-xs text-gray-500">{b.address || "Address Not Provided"}</td>

                                    {/* Employee Details Column */}
                                    <td className="p-4">
                                        {b.employee_name ? (
                                            <div className="text-sm space-y-1">
                                                <div className="flex items-center space-x-1 text-gray-700">
                                                    <User className="w-4 h-4" />
                                                    <span className="font-semibold">{b.employee_name}</span>
                                                </div>
                                                <div className="flex items-center space-x-1 text-blue-600">
                                                    <Phone className="w-4 h-4" />
                                                    <span className="text-xs">{b.employee_phone}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="text-red-500 font-medium text-xs border border-red-300 bg-red-50 px-2 py-0.5 rounded-full">Not Assigned</span>
                                        )}
                                    </td>

                                    {/* Status Dropdown with Controlled Flow */}
                                    <td className="p-4">
                                        <select
                                            value={b.status}
                                            onChange={(e) => handleStatusChange(b.id, e.target.value)}
                                            className={`border text-sm px-2 py-1.5 rounded-lg font-medium shadow-sm outline-none transition-all duration-200 ${getStatusClasses(b.status)}`}
                                        >
                                            {STATUS_OPTIONS.map((statusOption) => (
                                                <option
                                                    key={statusOption}
                                                    value={statusOption}
                                                    // DISABLES previous statuses in the workflow
                                                    disabled={isStatusDisabled(b.status, statusOption)}
                                                    className={isStatusDisabled(b.status, statusOption) ? "text-gray-400" : ""}
                                                >
                                                    {statusOption}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* --- EMPLOYEE ASSIGNMENT MODAL --- */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 transform transition-all scale-100 ease-out duration-300">

                        {/* Header */}
                        <div className="flex justify-between items-start border-b pb-4 mb-6">
                            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
                                <User className="w-6 h-6 mr-2 text-[#8ed26b]" /> Assign Employee & Confirm
                            </h3>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                                aria-label="Close modal"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={assignEmployeeAndProceed} className="space-y-5">
                            <p className="text-gray-600 mb-5">
                                Enter the service professional's details to confirm that they are <strong>Arriving Today</strong> for Booking ID: <strong>{selectedBookingId}</strong>.
                            </p>

                            {/* Employee Name Input */}
                            <div>
                                <label htmlFor="employeeName" className="block text-sm font-semibold text-gray-700 mb-1">
                                    Employee Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="employeeName"
                                    type="text"
                                    value={employeeName}
                                    onChange={(e) => setEmployeeName(e.target.value)}
                                    placeholder="e.g., Jane Smith"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8ed26b] focus:border-[#8ed26b] transition-shadow"
                                    required
                                />
                            </div>

                            {/* Employee Phone Input */}
                            <div>
                                <label htmlFor="employeePhone" className="block text-sm font-semibold text-gray-700 mb-1">
                                    Employee Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="employeePhone"
                                    type="tel"
                                    value={employeePhone}
                                    onChange={(e) => setEmployeePhone(e.target.value)}
                                    placeholder="e.g., 9876543210"
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#8ed26b] focus:border-[#8ed26b] transition-shadow"
                                    required
                                />
                            </div>

                            {/* Error Message */}
                            {modalError && (
                                <p className="mt-4 text-sm font-medium text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl flex items-center">
                                    <X className="w-4 h-4 mr-2" /> {modalError}
                                </p>
                            )}

                            {/* Buttons */}
                            <div className="mt-8 flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 bg-[#8ed26b] text-white font-medium rounded-xl shadow-md hover:bg-[#6ebb53] transition-colors disabled:opacity-50"
                                >
                                    Confirm & Set Status to "{newStatus}"
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}