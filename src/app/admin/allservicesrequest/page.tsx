"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import {
    Loader2, X, Mail, Phone, User, Calendar,
    ChevronRight, ClipboardList, Building2,
    Truck, ChefHat, Armchair, Search, FileText, Download
} from "lucide-react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SERVICES = [
    {
        key: "customized_modular_furniture_requests",
        label: "Furniture",
        icon: <Armchair className="w-4 h-4" />,
        nameKey: "full_name",
        emailKey: "email",
        phoneKey: "mobile_number",
    },
    {
        key: "customized_modular_kitchen_requests",
        label: "Modular Kitchen",
        icon: <ChefHat className="w-4 h-4" />,
        nameKey: "full_name",
        emailKey: "email",
        phoneKey: "mobile_number",
    },
    {
        key: "packer_and_movers_requests",
        label: "Packers & Movers",
        icon: <Truck className="w-4 h-4" />,
        nameKey: "full_name",
        emailKey: "email",
        phoneKey: "mobile_number",
    },
    {
        key: "b2b_service_requirement_requests",
        label: "B2B Services",
        icon: <Building2 className="w-4 h-4" />,
        nameKey: "contact_person_name",
        emailKey: "official_email",
        phoneKey: "mobile_number",
    },
];

const STATUS_OPTIONS = ["New", "In Progress", "Contacted", "Closed"];

export default function AdminAllRequestsPage() {
    const [loading, setLoading] = useState(true);
    const [activeService, setActiveService] = useState(SERVICES[0]);
    const [rows, setRows] = useState<any[]>([]);
    const [selectedRow, setSelectedRow] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchData(activeService.key);
    }, [activeService]);

    const fetchData = async (table: string) => {
        setLoading(true);
        const { data } = await supabase
            .from(table)
            .select("*")
            .order("created_at", { ascending: false });

        setRows(data || []);
        setLoading(false);
    };

    const filteredRows = rows.filter(row =>
        row[activeService.nameKey]?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // --- EXPORT LOGIC ---
    const downloadExcel = () => {
        const dataToExport = filteredRows.map(row => ({
            ID: row.id,
            Customer: row[activeService.nameKey],
            Email: row[activeService.emailKey] || "N/A",
            Phone: row[activeService.phoneKey],
            Status: row.status || "New",
            Date: new Date(row.created_at).toLocaleDateString(),
        }));

        const worksheet = XLSX.utils.json_to_sheet(dataToExport);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Requests");
        XLSX.writeFile(workbook, `${activeService.label}_Requests.xlsx`);
    };

    const downloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.text(`${activeService.label} Requests Report`, 14, 20);

        const tableData = filteredRows.map(row => [
            row.id.toString().slice(0, 8),
            row[activeService.nameKey],
            row[activeService.emailKey] || "N/A",
            row[activeService.phoneKey],
            row.status || "New",
            new Date(row.created_at).toLocaleDateString()
        ]);

        autoTable(doc, {
            head: [["ID", "Name", "Email", "Phone", "Status", "Date"]],
            body: tableData,
            startY: 30,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [142, 210, 107] } // Matching your #8ed26b color
        });

        doc.save(`${activeService.label}_Requests.pdf`);
    };

    const updateStatus = async (id: string, status: string) => {
        const { error } = await supabase
            .from(activeService.key)
            .update({ status })
            .eq("id", id);

        if (!error) {
            setRows((prev) => prev.map((row) => (row.id === id ? { ...row, status } : row)));
        }
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "In Progress": return "bg-amber-50 text-amber-700 border-amber-100";
            case "Contacted": return "bg-blue-50 text-blue-700 border-blue-100";
            case "Closed": return "bg-emerald-50 text-emerald-700 border-emerald-100";
            default: return "bg-slate-50 text-slate-600 border-slate-100";
        }
    };

    return (
        <section className="p-4 md:p-8 bg-[#f9fafb] min-h-screen font-sans">
            <div className="max-w-7xl mx-auto">

                {/* ENHANCED HEADER SECTION */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                            Service Management
                        </h1>
                        <p className="text-slate-500 text-sm mt-1 font-medium">
                            Overseeing <span className="text-[#8ed26b] font-bold">{activeService.label}</span> requests
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        {/* Search Bar */}
                        <div className="relative min-w-[280px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search customers..."
                                className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-[#8ed26b] outline-none w-full shadow-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        {/* Export Buttons */}
                        <button
                            onClick={downloadExcel}
                            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-md shadow-emerald-100"
                        >
                            <Download className="w-4 h-4" /> Excel
                        </button>
                        <button
                            onClick={downloadPDF}
                            className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-rose-700 transition-all shadow-md shadow-rose-100"
                        >
                            <FileText className="w-4 h-4" /> PDF
                        </button>
                    </div>
                </div>

                {/* SERVICE NAVIGATION TABS */}
                <div className="flex flex-wrap gap-3 mb-10 bg-slate-100/60 p-2 rounded-2xl w-fit">
                    {SERVICES.map((service) => (
                        <button
                            key={service.key}
                            onClick={() => setActiveService(service)}
                            className={`flex items-center gap-3 px-6 py-3 rounded-xl 
        font-semibold text-base transition-all
        ${activeService.key === service.key
                                    ? "bg-white text-slate-900 shadow-md border border-slate-200 scale-[1.02]"
                                    : "text-slate-500 hover:text-slate-800 hover:bg-white/70"
                                }`}
                        >
                            <span className="text-[#8ed26b]">
                                {service.icon}
                            </span>

                            <span className="whitespace-nowrap">
                                {service.label}
                            </span>
                        </button>
                    ))}
                </div>


                {/* DATA TABLE */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-32 gap-3">
                            <Loader2 className="animate-spin text-[#8ed26b] w-10 h-10" />
                            <p className="text-slate-400 text-sm font-medium">Loading records...</p>
                        </div>
                    ) : filteredRows.length === 0 ? (
                        <div className="text-center py-24">
                            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <ClipboardList className="text-slate-300 w-10 h-10" />
                            </div>
                            <h3 className="text-slate-900 font-bold">No results found</h3>
                            <p className="text-slate-500 text-sm">Try adjusting your search or filters.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 border-b border-slate-100">
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Customer</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Contact Details</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Date Recieved</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest">Current Status</th>
                                        <th className="px-6 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredRows.map((row) => (
                                        <tr key={row.id} className="group hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-[#8ed26b]/10 text-[#8ed26b] flex items-center justify-center font-bold text-sm shrink-0">
                                                        {row[activeService.nameKey]?.charAt(0)}
                                                    </div>
                                                    <span className="font-bold text-slate-700 text-sm">
                                                        {row[activeService.nameKey]}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                                        <Mail className="w-3.5 h-3.5" /> {row[activeService.emailKey] || "N/A"}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium">
                                                        <Phone className="w-3.5 h-3.5" /> {row[activeService.phoneKey]}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-500 text-xs font-bold">
                                                {new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={row.status || "New"}
                                                    onChange={(e) => updateStatus(row.id, e.target.value)}
                                                    className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg border outline-none cursor-pointer transition-all ${getStatusStyles(row.status || "New")}`}
                                                >
                                                    {STATUS_OPTIONS.map((s) => (
                                                        <option key={s} value={s} className="bg-white text-slate-700">{s}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => setSelectedRow(row)}
                                                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:bg-[#8ed26b] hover:text-white transition-all"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL (REMAINING THE SAME) */}
            {selectedRow && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
                    <div className="bg-white max-w-2xl w-full rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                            <h2 className="text-xl font-bold text-slate-800">Request Details</h2>
                            <button onClick={() => setSelectedRow(null)} className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100"><X /></button>
                        </div>
                        <div className="p-8 grid grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                            {Object.entries(selectedRow).map(([key, value]) => (
                                <div key={key} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{key.replace(/_/g, ' ')}</p>
                                    <p className="text-sm font-semibold text-slate-700">{String(value || "—")}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}