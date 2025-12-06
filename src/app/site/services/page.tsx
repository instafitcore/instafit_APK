"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { supabase } from "@/lib/supabase-client";
import BookServiceModal from "@/components/BookServiceModal";
import { Wrench, Package, ListFilter, Bolt, Home, Filter, X } from "lucide-react";

// --- CUSTOM COLORS ---
const PRIMARY_COLOR = "#8ED26B";
const HOVER_COLOR = "#72b852";

// --- TYPES ---
type ServiceItem = {
  id: number;
  category: string;
  subcategory: string;
  service_name: string;
  image_url: string | null;
  installation_price: number | null;
  dismantling_price: number | null;
  repair_price: number | null;
};

type Subcategory = {
  id: number;
  category: string;
  subcategory: string;
  description: string | null;
  image_url: string | null;
};

// --- HELPER FUNCTIONS ---
const formatPrice = (price: number | null) =>
  price && price > 0 ? `₹${Math.floor(price)}` : null;

// Filter Button Component
const FilterButton: React.FC<{
  label: string;
  active: boolean;
  onClick: () => void;
}> = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1 ${active
        ? `bg-[${PRIMARY_COLOR}] text-white shadow-md hover:bg-[${HOVER_COLOR}]`
        : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
  >
    {label} {active && <X className="w-3 h-3" />}
  </button>
);

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [activePriceFilter, setActivePriceFilter] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ServiceItem | null>(null);

  // --- FETCH DATA ---
  const fetchData = useCallback(async () => {
    setLoading(true);

    const { data: subData, error: subError } = await supabase
      .from("subcategories")
      .select("*")
      .eq("is_active", true)
      .order("subcategory", { ascending: true });
    if (subError) console.error(subError.message);
    else setSubcategories(subData || []);

    const { data: serviceData, error: serviceError } = await supabase
      .from("services")
      .select("*")
      .order("service_name", { ascending: true });
    if (serviceError) console.error(serviceError.message);
    else setServices(serviceData || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- FILTER LOGIC ---
  const filteredServices = useMemo(() => {
    let list = [...services];
    if (selectedSubcategory) list = list.filter(s => s.subcategory === selectedSubcategory);
    if (activePriceFilter === "install") list = list.filter(s => s.installation_price && s.installation_price > 0);
    else if (activePriceFilter === "dismantle") list = list.filter(s => s.dismantling_price && s.dismantling_price > 0);
    else if (activePriceFilter === "repair") list = list.filter(s => s.repair_price && s.repair_price > 0);
    if (searchText) list = list.filter(s => s.service_name.toLowerCase().includes(searchText.toLowerCase()));
    return list;
  }, [services, selectedSubcategory, activePriceFilter, searchText]);

  const handleBookClick = (service: ServiceItem) => {
    setSelectedService(service);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className={`bg-[${PRIMARY_COLOR}] text-white py-16 px-6 text-center shadow-lg`}>
        <h1 className="text-4xl md:text-5xl font-extrabold flex items-center justify-center gap-3">
          <Bolt className="w-8 h-8" /> Premium Service Catalogue
        </h1>
        <p className="mt-3 text-lg opacity-90 max-w-2xl mx-auto">
          Find the perfect solution from our range of installation, repair, and dismantling services.
        </p>
      </header>


      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 py-12 px-4 sm:px-6 lg:px-8">
        {/* SIDEBAR */}
        <aside className="w-full lg:w-64 bg-white rounded-2xl shadow-xl p-5 h-fit sticky top-6">
          <h2 className="text-xl font-bold mb-5 flex items-center gap-2 text-gray-800">
            <Filter className="w-5 h-5 text-gray-600" /> Categories
          </h2>

          <ul className="space-y-1">
            <li>
              <button
                onClick={() => setSelectedSubcategory(null)}
                className={`w-full text-left px-4 py-2 rounded-xl transition-all font-medium border-2 ${selectedSubcategory === null
                    ? `bg-[${PRIMARY_COLOR}] text-white border-[${PRIMARY_COLOR}]`
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent"
                  } flex items-center gap-2`}
              >
                <Home className="w-4 h-4" /> All Services
              </button>
            </li>
            {subcategories.map(subcat => (
              <li key={subcat.id}>
                <button
                  onClick={() => setSelectedSubcategory(subcat.subcategory)}
                  className={`w-full text-left px-4 py-2 rounded-xl transition-all text-gray-700 ${selectedSubcategory === subcat.subcategory
                      ? `bg-[${PRIMARY_COLOR}] text-white font-semibold shadow-md`
                      : "hover:bg-gray-100"
                    }`}
                >
                  {subcat.subcategory}
                </button>
              </li>
            ))}
          </ul>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1">
          {/* FILTER BAR */}
          <div className="mb-8 p-4 bg-white rounded-xl shadow-md border border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <input
              type="text"
              placeholder="Search by service name..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className={`w-full md:w-1/3 p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[${PRIMARY_COLOR}] focus:border-[${PRIMARY_COLOR}] transition`}
            />

            <div className="flex space-x-2 overflow-x-auto py-1">
              <FilterButton label="Installation" active={activePriceFilter === "install"} onClick={() => setActivePriceFilter(activePriceFilter === "install" ? null : "install")} />
              <FilterButton label="Dismantling" active={activePriceFilter === "dismantle"} onClick={() => setActivePriceFilter(activePriceFilter === "dismantle" ? null : "dismantle")} />
              <FilterButton label="Repair" active={activePriceFilter === "repair"} onClick={() => setActivePriceFilter(activePriceFilter === "repair" ? null : "repair")} />
            </div>
          </div>

          {/* SERVICES GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7">
            {loading ? (
              <p className="text-center text-gray-600 col-span-full py-10">
                <ListFilter className="inline w-6 h-6 animate-spin text-gray-400 mr-2" /> Loading services...
              </p>
            ) : filteredServices.length === 0 ? (
              <div className="text-center text-gray-500 col-span-full p-10 bg-white rounded-xl shadow-inner">
                <p className="text-xl font-medium">No Services Found</p>
                <p className="mt-2 text-sm">Try adjusting your category or price filters.</p>
              </div>
            ) : (
              filteredServices.map(service => (
                <div key={service.id} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition duration-300 p-5 flex flex-col">
                  {/* IMAGE */}
                  <div className="w-full h-40 bg-gray-100 rounded-xl overflow-hidden mb-4">
                    {service.image_url ? (
                      <img src={service.image_url} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" alt={service.service_name} />
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400">
                        <Package className="w-8 h-8" />
                        <span className="text-xs mt-1">No Image Available</span>
                      </div>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-gray-900 flex-grow">{service.service_name}</h2>
                  <p className="text-sm text-gray-500 mb-4">{service.category} → {service.subcategory}</p>

                  {/* PRICES */}
                  <div className="mt-auto pt-4 border-t border-gray-100 text-gray-700 text-sm space-y-2">
                    {formatPrice(service.installation_price) && (
                      <p className="flex justify-between font-medium">
                        <span><Wrench className="inline w-4 h-4 mr-1 text-blue-500" /> Installation:</span>
                        <span className="font-bold text-lg text-green-600">{formatPrice(service.installation_price)}</span>
                      </p>
                    )}
                    {formatPrice(service.dismantling_price) && (
                      <p className="flex justify-between">
                        <span>Dismantling:</span>
                        <span className="font-semibold">{formatPrice(service.dismantling_price)}</span>
                      </p>
                    )}
                    {formatPrice(service.repair_price) && (
                      <p className="flex justify-between">
                        <span>Repair:</span>
                        <span className="font-semibold">{formatPrice(service.repair_price)}</span>
                      </p>
                    )}
                    {!formatPrice(service.installation_price) && !formatPrice(service.dismantling_price) && !formatPrice(service.repair_price) && (
                      <p className="text-center italic text-gray-400 text-xs pt-1">Contact for Pricing</p>
                    )}
                  </div>

                  {/* BOOK BUTTON */}
                  <button
                    onClick={() => handleBookClick(service)}
                    className={`mt-5 w-full bg-[${PRIMARY_COLOR}] text-white py-3 rounded-xl font-semibold shadow-md hover:bg-[${HOVER_COLOR}] transition`}
                  >
                    Book Now
                  </button>
                </div>
              ))
            )}
          </div>
        </main>
      </div>

      {/* BOOKING MODAL */}
      {selectedService && (
        <BookServiceModal service={selectedService} isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      )}
    </div>
  );
}
