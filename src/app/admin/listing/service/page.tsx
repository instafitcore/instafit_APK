"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { supabase } from "@/lib/supabase-client";
import { Pencil, Trash2, Search, Filter, Plus, ImageIcon, Upload } from "lucide-react";
import { useAdminToast } from "@/components/AdminToast";

type ServiceItem = {
  id: number;
  category: string;
  subcategory: string;
  service_name: string;
  image_url?: string | null;
  installation_price?: number | null;
  dismantling_price?: number | null;
  repair_price?: number | null;
};

type Subcategory = {
  id: number;
  category: string;
  subcategory: string;
};

export default function ServicesAdminPage() {
  const { addToast } = useAdminToast();

  const [services, setServices] = useState<ServiceItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterSubcategory, setFilterSubcategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ServiceItem | null>(null);

  const [serviceCategory, setServiceCategory] = useState("");
  const [serviceSubcategory, setServiceSubcategory] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [installationPrice, setInstallationPrice] = useState<number | "">(0);
  const [dismantlingPrice, setDismantlingPrice] = useState<number | "">(0);
  const [repairPrice, setRepairPrice] = useState<number | "">(0);
  const [serviceImage, setServiceImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [editItem, setEditItem] = useState<ServiceItem | null>(null);
  const [initialEditItem, setInitialEditItem] = useState<ServiceItem | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const convertToBase64 = (file: File) =>
    new Promise<string | null>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string | null);
      reader.onerror = reject;
    });

  const fetchServices = async (
    q: string = "",
    catFilter: string = "All",
    subFilter: string = "All"
  ) => {
    setLoading(true);
    try {
      let query = supabase.from("services").select("*").order("id", { ascending: false });

      if (q.trim()) query = query.ilike("service_name", `%${q}%`);
      if (catFilter !== "All") query = query.eq("category", catFilter);
      if (subFilter !== "All") query = query.eq("subcategory", subFilter);

      const { data, error } = await query;
      if (error) throw error;
      setServices(data || []);
    } catch (err: any) {
      console.error(err);
      addToast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await supabase.from("categories").select("category");
      setCategories(data?.map((c) => c.category) || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSubcategories = async () => {
    try {
      const { data } = await supabase.from("subcategories").select("id, category, subcategory");
      setSubcategories(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchServices();
    fetchCategories();
    fetchSubcategories();
  }, []);

  const validateService = (
    category: string,
    subcategory: string,
    name: string,
    inst: number | "",
    dis: number | "",
    rep: number | ""
  ) => {
    if (!category || !subcategory || !name) {
      addToast("Please fill required fields: Category, Subcategory, and Service Name!", "error");
      return false;
    }
    if (!inst && !dis && !rep) {
      addToast("At least one price must be provided!", "error");
      return false;
    }
    return true;
  };

  const handleAddService = async () => {
    if (!validateService(serviceCategory, serviceSubcategory, serviceName, installationPrice, dismantlingPrice, repairPrice)) return;

    // Check for duplicate service name
    try {
      const { data } = await supabase.from("services").select("id").eq("service_name", serviceName);
      if (data && data.length > 0) {
        addToast("Service name already exists!", "error");
        return;
      }
    } catch (err: any) {
      addToast("Error checking service name: " + err.message, "error");
      return;
    }

    setSubmitting(true);
    try {
      const img = serviceImage ? await convertToBase64(serviceImage) : null;

      const { error } = await supabase.from("services").insert([
        {
          category: serviceCategory,
          subcategory: serviceSubcategory,
          service_name: serviceName,
          installation_price: installationPrice || null,
          dismantling_price: dismantlingPrice || null,
          repair_price: repairPrice || null,
          image_url: img,
        },
      ]);

      if (error) throw error;

      addToast("Service added successfully!", "success");
      setAddModalOpen(false);
      setServiceCategory("");
      setServiceSubcategory("");
      setServiceName("");
      setInstallationPrice(0);
      setDismantlingPrice(0);
      setRepairPrice(0);
      setServiceImage(null);
      setPreview(null);
      fetchServices(search, filterCategory, filterSubcategory);
    } catch (err: any) {
      addToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (item: ServiceItem) => {
    setEditItem({ ...item });
    setInitialEditItem({ ...item });
    setPreview(item.image_url || null);
    setImageFile(null);
    setEditModalOpen(true);
  };

  const hasChanges = () => {
    if (!editItem || !initialEditItem) return false;
    return (
      editItem.category !== initialEditItem.category ||
      editItem.subcategory !== initialEditItem.subcategory ||
      editItem.service_name !== initialEditItem.service_name ||
      editItem.installation_price !== initialEditItem.installation_price ||
      editItem.dismantling_price !== initialEditItem.dismantling_price ||
      editItem.repair_price !== initialEditItem.repair_price ||
      imageFile !== null
    );
  };

  const handleUpdateService = async () => {
    if (!editItem) return;
    if (!validateService(editItem.category, editItem.subcategory, editItem.service_name, editItem.installation_price || 0, editItem.dismantling_price || 0, editItem.repair_price || 0)) return;

    // Check for duplicate service name
    try {
      const { data } = await supabase.from("services").select("id").eq("service_name", editItem.service_name).neq("id", editItem.id);
      if (data && data.length > 0) {
        addToast("Service name already exists!", "error");
        return;
      }
    } catch (err: any) {
      addToast("Error checking service name: " + err.message, "error");
      return;
    }

    setSubmitting(true);
    try {
      let updatedImage = editItem.image_url;
      if (imageFile) updatedImage = await convertToBase64(imageFile);

      const { error } = await supabase
        .from("services")
        .update({
          category: editItem.category,
          subcategory: editItem.subcategory,
          service_name: editItem.service_name,
          installation_price: editItem.installation_price,
          dismantling_price: editItem.dismantling_price,
          repair_price: editItem.repair_price,
          image_url: updatedImage,
        })
        .eq("id", editItem.id);

      if (error) throw error;

      addToast("Service updated successfully!", "success");
      setEditModalOpen(false);
      setImageFile(null);
      setPreview(null);
      fetchServices(search, filterCategory, filterSubcategory);
    } catch (err: any) {
      addToast(`Update failed: ${err.message}`, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteModal = (item: ServiceItem) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteService = async () => {
    if (!itemToDelete) return;
    setDeletingId(itemToDelete.id);
    const { error } = await supabase.from("services").delete().eq("id", itemToDelete.id);
    if (error) addToast(`Delete failed: ${error.message}`, "error");
    else addToast("Deleted successfully!", "success");

    fetchServices(search, filterCategory, filterSubcategory);
    setDeletingId(null);
    setDeleteModalOpen(false);
    setItemToDelete(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Service Management</h1>
        <button
          onClick={() => setAddModalOpen(true)}
          className="bg-[#8ed26b] hover:bg-[#6ebb53] text-white px-4 py-2 rounded-xl shadow-lg transition flex items-center gap-2"
        >
          <Plus size={18} /> Add New Service
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search services..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                fetchServices(e.target.value, filterCategory, filterSubcategory);
              }}
              className="w-full pl-10 pr-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-[#8ed26b]"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-xl flex items-center gap-2"
          >
            <Filter size={18} /> Filters
          </button>
        </div>
        {showFilters && (
          <div className="flex gap-3 flex-wrap">
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setFilterSubcategory("All");
                fetchServices(search, e.target.value, "All");
              }}
              className="flex-1 min-w-[150px] px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-[#8ed26b] bg-white"
            >
              <option value="All">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <select
              value={filterSubcategory}
              onChange={(e) => {
                setFilterSubcategory(e.target.value);
                fetchServices(search, filterCategory, e.target.value);
              }}
              disabled={filterCategory === "All"}
              className="flex-1 min-w-[150px] px-4 py-2 border rounded-xl shadow-sm focus:ring-2 focus:ring-[#8ed26b] bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="All">All Subcategories</option>
              {subcategories
                .filter((sc) => sc.category === filterCategory)
                .map((sc) => (
                  <option key={sc.id} value={sc.subcategory}>
                    {sc.subcategory}
                  </option>
                ))}
            </select>
          </div>
        )}
        <div className="text-right text-sm text-gray-600">
          Total Services: {loading ? "..." : services.length}
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-4 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))
          : services.length > 0
          ? services.map((s) => (
              <div key={s.id} className="bg-white rounded-xl shadow-md hover:shadow-lg transition p-4">
                <div className="relative h-40 bg-gray-100 rounded-xl overflow-hidden mb-4">
                  {s.image_url ? (
                    <img src={s.image_url} alt={s.service_name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      <ImageIcon size={48} />
                    </div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">{s.service_name}</h3>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Category:</strong> {s.category}
                </p>
                <p className="text-sm text-gray-600 mb-3">
                  <strong>Subcategory:</strong> {s.subcategory}
                </p>
                <div className="text-sm text-gray-700 space-y-1 mb-4">
                  <p>Installation: {s.installation_price || "-"}</p>
                  <p>Dismantling: {s.dismantling_price || "-"}</p>
                  <p>Repair: {s.repair_price || "-"}</p>
                </div>
                <div className="flex justify-between gap-2">
                  <button
                    onClick={() => openEditModal(s)}
                    className="flex-1 bg-[#8ed26b]/20 text-[#8ed26b] px-3 py-2 rounded-lg hover:bg-[#8ed26b]/30 flex items-center justify-center gap-1"
                  >
                    <Pencil size={16} /> Edit
                  </button>

                  <button
                    onClick={() => openDeleteModal(s)}
                    disabled={deletingId === s.id}
                    className="flex-1 bg-red-100 text-red-600 px-3 py-2 rounded-lg hover:bg-red-200 disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    <Trash2 size={16} /> {deletingId === s.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))
          : (
            <div className="col-span-full text-center py-12 text-gray-500">
              <ImageIcon size={64} className="mx-auto mb-4 opacity-50" />
              No services found.
            </div>
          )}
      </div>

      {/* ====== ADD MODAL (Horizontal Popup) ====== */}
{addModalOpen && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 flex gap-6 relative">
      {/* Left: Form */}
      <div className="flex-1">
        <button
          onClick={() => setAddModalOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">Add New Service</h2>

        <form className="grid grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">Category *</label>
            <select
              value={serviceCategory}
              onChange={(e) => {
                setServiceCategory(e.target.value);
                setServiceSubcategory(""); // Reset subcategory
              }}
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#8ed26b]"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">Subcategory *</label>
            <select
              value={serviceSubcategory}
              onChange={(e) => setServiceSubcategory(e.target.value)}
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#8ed26b]"
              disabled={!serviceCategory}
            >
              <option value="">Select Subcategory</option>
              {subcategories
                .filter((sc) => sc.category === serviceCategory)
                .map((sc) => (
                  <option key={sc.id} value={sc.subcategory}>
                    {sc.subcategory}
                  </option>
                ))}
            </select>
          </div>

          {/* Service Name */}
          <div className="col-span-2 space-y-2">
            <label className="block font-medium text-gray-700">Service Name *</label>
            <input
              type="text"
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#8ed26b]"
            />
          </div>

          {/* Prices */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">Installation</label>
            <input
              type="number"
              value={installationPrice}
              onChange={(e) => setInstallationPrice(Number(e.target.value))}
              className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-[#8ed26b]"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">Dismantling</label>
            <input
              type="number"
              value={dismantlingPrice}
              onChange={(e) => setDismantlingPrice(Number(e.target.value))}
              className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-[#8ed26b]"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">Repair</label>
            <input
              type="number"
              value={repairPrice}
              onChange={(e) => setRepairPrice(Number(e.target.value))}
              className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-[#8ed26b]"
            />
          </div>
        </form>
      </div>

      {/* Right: Image Upload & Submit */}
      <div className="w-64 flex-shrink-0 flex flex-col items-center justify-start">
        <label className="block font-medium text-gray-700 mb-2">Image</label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-[#8ed26b] transition bg-gray-50 w-full"
          onClick={() => document.getElementById("add-image-input")?.click()}
        >
          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-gray-600">Click to upload</p>
          <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
          <input
            id="add-image-input"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setServiceImage(file || null);
              if (file) setPreview(URL.createObjectURL(file));
            }}
            className="hidden"
          />
        </div>

        {preview && (
          <img
            src={preview}
            alt="preview"
            className="mt-4 w-40 h-40 object-cover rounded-xl border"
          />
        )}

        <button
          type="button"
          onClick={handleAddService}
          disabled={submitting}
          className="mt-4 w-full bg-[#8ed26b] text-white py-2 rounded-xl font-semibold hover:bg-[#6ebb53] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? "Adding..." : "Add Service"}
        </button>
      </div>
    </div>
  </div>
)}


      {/* ====== EDIT MODAL INLINE ====== */}
     {/* ====== EDIT MODAL (Horizontal Popup) ====== */}
{editModalOpen && editItem && (
  <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 relative flex gap-6">
      {/* Left: Form */}
      <div className="flex-1">
        <button
          onClick={() => setEditModalOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Service</h2>

        <form className="grid grid-cols-2 gap-4">
          {/* Category */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">Category *</label>
            <select
              value={editItem.category}
              onChange={(e) =>
                setEditItem({ ...editItem, category: e.target.value, subcategory: "" })
              }
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#8ed26b]"
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategory */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">Subcategory *</label>
            <select
              value={editItem.subcategory}
              onChange={(e) => setEditItem({ ...editItem, subcategory: e.target.value })}
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#8ed26b]"
              disabled={!editItem.category}
            >
              <option value="">Select Subcategory</option>
              {subcategories
                .filter((sc) => sc.category === editItem.category)
                .map((sc) => (
                  <option key={sc.id} value={sc.subcategory}>
                    {sc.subcategory}
                  </option>
                ))}
            </select>
          </div>

          {/* Service Name */}
          <div className="col-span-2 space-y-2">
            <label className="block font-medium text-gray-700">Service Name *</label>
            <input
              type="text"
              value={editItem.service_name}
              onChange={(e) => setEditItem({ ...editItem, service_name: e.target.value })}
              className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#8ed26b]"
            />
          </div>

          {/* Prices */}
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">Installation</label>
            <input
              type="number"
              value={editItem.installation_price || ""}
              onChange={(e) =>
                setEditItem({ ...editItem, installation_price: Number(e.target.value) })
              }
              className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-[#8ed26b]"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">Dismantling</label>
            <input
              type="number"
              value={editItem.dismantling_price || ""}
              onChange={(e) =>
                setEditItem({ ...editItem, dismantling_price: Number(e.target.value) })
              }
              className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-[#8ed26b]"
            />
          </div>
          <div className="space-y-2">
            <label className="block font-medium text-gray-700">Repair</label>
            <input
              type="number"
              value={editItem.repair_price || ""}
              onChange={(e) =>
                setEditItem({ ...editItem, repair_price: Number(e.target.value) })
              }
              className="w-full border rounded-xl p-2 focus:ring-2 focus:ring-[#8ed26b]"
            />
          </div>
        </form>
      </div>

      {/* Right: Image Upload */}
      <div className="w-60 flex-shrink-0 flex flex-col items-center justify-start">
        <label className="block font-medium text-gray-700 mb-2">Image</label>
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center cursor-pointer hover:border-[#8ed26b] transition bg-gray-50 w-full"
          onClick={() => document.getElementById("edit-image-input")?.click()}
        >
          <Upload className="mx-auto mb-2 text-gray-400" size={32} />
          <p className="text-gray-600">Click to upload</p>
          <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
          <input
            id="edit-image-input"
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              setImageFile(file || null);
              if (file) setPreview(URL.createObjectURL(file));
            }}
            className="hidden"
          />
        </div>
        {preview && (
          <img
            src={preview}
            alt="preview"
            className="mt-4 w-40 h-40 object-cover rounded-xl border"
          />
        )}

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleUpdateService}
          disabled={submitting || !hasChanges()}
          className="mt-4 w-full bg-[#8ed26b] text-white py-2 rounded-xl font-semibold hover:bg-[#6ebb53] transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {submitting ? "Updating..." : "Update Service"}
        </button>
      </div>
    </div>
  </div>
)}


      {/* ====== DELETE MODAL INLINE ====== */}
      {deleteModalOpen && itemToDelete && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-6 rounded-3xl shadow-2xl w-full max-w-sm relative text-center">
            <h2 className="text-xl font-bold mb-4 text-gray-800">Delete Service</h2>
            <p className="mb-6 text-gray-600">Are you sure you want to delete "{itemToDelete.service_name}"?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-6 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteService}
                disabled={deletingId === itemToDelete.id}
                className="px-6 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId === itemToDelete.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
