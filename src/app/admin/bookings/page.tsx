"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { Search, User, Phone, X, Calendar, DollarSign, Clock } from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
{/* --- FILTER CARD --- */ }
import { ChevronDown, XCircle } from "lucide-react";

type Booking = {
    id: number;
    order_no: string;
    razorpay_order_id?: string | null;
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

    const downloadExcel = () => {
        const dataToExport = filtered.map(b => ({
            "Order No": b.order_no,
            Customer: b.customer_name,
            Service: b.service_name,
            Types: b.service_types.join(", "),
            Date: b.date,
            Time: b.booking_time,
            Price: b.total_price,
            Address: b.address || "N/A",
            Employee: b.employee_name || "Not Assigned",
            Phone: b.employee_phone || "N/A",
            Status: b.status,
            Payment: b.payment_status || "N/A",
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");

        XLSX.writeFile(workbook, "Bookings.xlsx");
    };
    const downloadPDF = () => {
        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text("Bookings Report", 14, 20);

        const tableData = filtered.map(b => [
            b.order_no,
            b.customer_name,
            b.service_name,
            b.date,
            b.booking_time,
            b.total_price,
            b.status
        ]);


        autoTable(doc, {
            head: [["Order No", "Customer", "Service", "Date", "Time", "Price", "Status"]],
            body: tableData,
            startY: 30,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [52, 152, 219] }
        });

        doc.save("Bookings.pdf");
    };


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
                    (b.customer_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
                    (b.service_name?.toLowerCase() || "").includes(search.toLowerCase()) ||
                    (b.order_no?.toLowerCase() || "").includes(search.toLowerCase())
            );


        }

        if (statusFilter !== "All Status") {
            results = results.filter((b) => b.status === statusFilter);
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
    const selectedBooking = bookings.find(b => b.id === selectedBookingId);


    return (
        <div className="p-8 min-h-screen bg-gray-50">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                    Booking Management Dashboard
                </h1>

                <div className="flex gap-3">
                    <button
                        onClick={downloadExcel}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium shadow hover:bg-green-700"
                    >
                        Download Excel
                    </button>

                    <button
                        onClick={downloadPDF}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium shadow hover:bg-red-700"
                    >
                        Download PDF
                    </button>
                </div>
            </div>


            {/* --- FILTER CARD --- */}
            <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100 mb-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 tracking-tight">
                        Filter & Search
                    </h2>
                    <div className="px-4 py-1.5 bg-gray-50 rounded-full text-sm font-semibold text-instafitcore-green-hover border border-gray-100">
                        Total Bookings: {loading ? "..." : bookings.length}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">

                    {/* 1. Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-instafitcore-green focus:border-instafitcore-green outline-none transition-all"
                        />
                    </div>

                    {/* 2. Status Filter with Down Arrow */}
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-instafitcore-green focus:border-instafitcore-green outline-none cursor-pointer text-gray-700"
                        >
                            <option>All Status</option>
                            {STATUS_OPTIONS.map((s) => (
                                <option key={`filter-${s}`} value={s}>{s}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none w-4 h-4" />
                    </div>

                    {/* 3. Service Type Filter with Down Arrow */}
                    <div className="relative">
                        <select
                            value={serviceTypeFilter}
                            onChange={(e) => setServiceTypeFilter(e.target.value)}
                            className="w-full appearance-none border border-gray-200 rounded-xl px-4 py-2.5 bg-white focus:ring-2 focus:ring-instafitcore-green focus:border-instafitcore-green outline-none cursor-pointer text-gray-700"
                        >
                            <option>All Service Types</option>
                            <option>Installation</option>
                            <option>Dismantle</option>
                            <option>Repair</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-3.5 text-gray-400 pointer-events-none w-4 h-4" />
                    </div>

                    {/* 4. Action Button */}
                    <button
                        onClick={() => {
                            setSearch("");
                            setStatusFilter("All Status");
                            setServiceTypeFilter("All Service Types");
                        }}
                        className="w-full py-2.5 text-gray-500 font-medium border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-700 transition-all flex items-center justify-center gap-2"
                    >
                        <XCircle size={18} />
                        Clear Filters
                    </button>
                </div>
            </div>

            <hr className="my-6 border-gray-200" />

            {/* --- TABLE --- */}
            <div className="bg-white rounded-xl shadow-2xl border border-gray-100 overflow-x-auto">
                <table className="min-w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr className="text-gray-600 text-sm font-bold uppercase tracking-wider">
                            <th className="p-4">Order No</th>

                            <th className="p-4">Customer</th>
                            <th className="p-4">Razorpay Order ID</th>

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
                            <tr><td colSpan={8} className="p-10 text-center text-gray-500 text-lg">{loading ? "Loading bookings..." : "No bookings found matching filters."}</td></tr>
                        ) : (
                            filtered.map((b) => (
                                <tr key={b.id} className="hover:bg-blue-50/50 transition-colors duration-150">
                                    <td className="p-4 font-mono text-sm text-gray-700 whitespace-nowrap">
                                        {b.order_no}
                                    </td>
                                    <td className="p-4 font-semibold">
                                        {b.customer_name}
                                        <div className="text-xs text-gray-500 font-normal mt-0.5">Types: {b.service_types.join(", ")}</div>
                                    </td>
                                    <td className="p-4 font-mono text-xs text-gray-600 whitespace-nowrap">
                                        {b.razorpay_order_id ? (
                                            b.razorpay_order_id
                                        ) : (
                                            <span className="text-gray-400 italic">Not Generated</span>
                                        )}
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
                                <p className="text-gray-600 mb-5">
                                    Assign employee for Order No:{" "}
                                    <strong className="font-mono">{selectedBooking?.order_no}</strong>
                                </p>
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