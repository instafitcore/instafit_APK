"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { supabase } from "@/lib/supabase-client";
import { Pencil, Trash2, Search } from "lucide-react";
import { useAdminToast } from "@/components/AdminToast";

const GREEN = "#8ed26b";

type SubcategoryItem = {
  id: number;
  category: string;
  subcategory: string;
  description?: string | null;
  image_url?: string | null;
};

export default function SubcategoryAdminPage() {
  const [subcategories, setSubcategories] = useState<SubcategoryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [errors, setErrors] = useState<{ category?: string; subcategory?: string; image?: string }>({});

  const [categoryName, setCategoryName] = useState("");
  const [subcatName, setSubcatName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<SubcategoryItem | null>(null);
  const [originalEditItem, setOriginalEditItem] = useState<SubcategoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { addToast } = useAdminToast();

  // ---------------- FETCH CATEGORIES ----------------
  const fetchCategories = async () => {
    const { data } = await supabase.from("categories").select("category");
    const sorted = (data?.map(c => c.category) || []).sort((a, b) => a.localeCompare(b));
    setCategories(sorted);
  };

  // ---------------- FETCH SUBCATEGORIES ----------------
  const fetchSubcategories = async (q: string = "", filter: string = "All") => {
    setLoading(true);
    let query = supabase.from("subcategories").select("*").order("id", { ascending: false });

    if (q.trim()) query = query.ilike("subcategory", `%${q}%`);
    if (filter !== "All") query = query.eq("category", filter);

    const { data } = await query;
    setSubcategories(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    fetchSubcategories();
  }, []);

  const convertToBase64 = (file: File) =>
    new Promise<string | null>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string | null);
      reader.onerror = reject;
    });

  // ---------------- ADD SUBCATEGORY ----------------
  const handleAddSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrors({});

    if (!categoryName.trim()) {
      setErrors(prev => ({ ...prev, category: "Category is required." }));
      setSubmitting(false);
      return;
    }
    if (!subcatName.trim()) {
      setErrors(prev => ({ ...prev, subcategory: "Subcategory is required." }));
      setSubmitting(false);
      return;
    }
    if (!imageFile && !preview) {
      setErrors(prev => ({ ...prev, image: "Image is required." }));
      setSubmitting(false);
      return;
    }

    try {
      const img = imageFile ? await convertToBase64(imageFile) : preview;

      // Duplicate check
      const { data: existing } = await supabase
        .from("subcategories")
        .select("*")
        .eq("category", categoryName)
        .eq("subcategory", subcatName)
        .limit(1);

      if (existing && existing.length > 0) {
        addToast("This subcategory already exists under this category!", "error");
        setSubmitting(false);
        return;
      }

      const { error } = await supabase.from("subcategories").insert([
        { category: categoryName, subcategory: subcatName, description, image_url: img },
      ]);

      if (error) {
        addToast(`Failed: ${error.message}`, "error");
        return;
      }

      setCategoryName("");
      setSubcatName("");
      setDescription("");
      setImageFile(null);
      setPreview(null);

      fetchSubcategories();
      addToast("Subcategory added successfully!", "success");
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (item: SubcategoryItem) => {
    setEditItem(item);
    setOriginalEditItem({ ...item }); // keep original
    setPreview(item.image_url || null);
    setEditModalOpen(true);
  };

  const isEditChanged = () => {
    if (!editItem || !originalEditItem) return false;
    return (
      editItem.category !== originalEditItem.category ||
      editItem.subcategory !== originalEditItem.subcategory ||
      (editItem.description ?? "") !== (originalEditItem.description ?? "") ||
      preview !== originalEditItem.image_url
    );
  };

  const handleDeleteSubcategory = async (id: number) => {
    setDeletingId(id);
    const { error } = await supabase.from("subcategories").delete().eq("id", id);
    if (error) {
      addToast(`Failed: ${error.message}`, "error");
    } else {
      addToast("Subcategory deleted successfully!", "success");
      fetchSubcategories(search, filterCategory);
    }
    setDeletingId(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Subcategory Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">

          {/* SEARCH + FILTER BAR */}
          <div className="bg-white shadow-md p-5 rounded-2xl flex items-center justify-between gap-4">
            {/* Search Field */}
            <div className="flex items-center gap-3 w-full">
              <Search className="text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search subcategories..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  fetchSubcategories(e.target.value, filterCategory);
                }}
                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#8ed26b] outline-none"
              />
            </div>

            {/* Filter Dropdown */}
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                fetchSubcategories(search, e.target.value);
              }}
              className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8ed26b] bg-white"
            >
              <option value="All">All Categories</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Count */}
            <span className="px-4 py-2 bg-[#8ed26b]/20 text-[#8ed26b] rounded-xl font-semibold">
              {loading ? "..." : subcategories.length}
            </span>
          </div>

          {/* SUBCATEGORY CARDS */}
          {loading ? (
            <p className="text-center py-10">Loading...</p>
          ) : subcategories.length === 0 ? (
            <p className="text-center py-10 bg-white rounded-xl shadow">No subcategories found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {subcategories.map((sc) => (
                <div key={sc.id} className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition">
                  <div className="h-40 bg-gray-100">
                    {sc.image_url ? (
                      <img src={sc.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <h2 className="text-xl font-semibold text-gray-800">{sc.subcategory}</h2>
                    <p className="text-gray-500 text-sm">Category: {sc.category}</p>
                    {sc.description && <p className="text-gray-600">{sc.description}</p>}

                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => openEditModal(sc)}
                        className="flex items-center gap-1 px-4 py-2 bg-[#8ed26b]/20 text-[#8ed26b] rounded-xl hover:bg-[#8ed26b]/30"
                      >
                        <Pencil size={16} /> Edit
                      </button>

                      <button
                        disabled={deletingId === sc.id}
                        onClick={() => handleDeleteSubcategory(sc.id)}
                        className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 disabled:opacity-50"
                      >
                        <Trash2 size={16} /> {deletingId === sc.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE - ADD FORM */}
        <form
          onSubmit={handleAddSubcategory}
          className="bg-white shadow-xl rounded-3xl p-7 space-y-5 h-[700px] overflow-y-auto"
        >
          <h2 className="text-xl font-bold text-gray-800">Add New Subcategory</h2>

          {/* Category */}
          <div>
            <label className="font-medium text-gray-700">Select Category</label>
            <select
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#8ed26b] outline-none"
            >
              <option value="">Select Category</option>
              {categories.map((cat, idx) => (
                <option key={idx} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
          </div>

          {/* Subcategory Name */}
          <div>
            <label className="font-medium text-gray-700">Subcategory Name</label>
            <input
              type="text"
              value={subcatName}
              onChange={(e) => setSubcatName(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#8ed26b] outline-none"
            />
            {errors.subcategory && <p className="text-red-500 text-sm">{errors.subcategory}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#8ed26b] outline-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="font-medium text-gray-700">Image</label>
            <label className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex items-center justify-center cursor-pointer hover:border-[#8ed26b] relative">
              {preview ? (
                <img src={preview} className="absolute inset-0 w-full h-full object-cover rounded-xl" />
              ) : (
                <span className="text-gray-500">Upload Image</span>
              )}

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0] ?? null;
                  setImageFile(file);
                  if (file) setPreview(URL.createObjectURL(file));
                }}
              />
            </label>
            {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#8ed26b] hover:bg-[#6ebb53] text-white py-3 rounded-xl font-semibold transition"
          >
            {submitting ? "Saving..." : "Add Subcategory"}
          </button>
        </form>
      </div>

      {/* EDIT MODAL */}
      {editModalOpen && editItem && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl p-6 flex gap-6 relative">

            {/* Left: Form */}
            <div className="flex-1">
              <button
                onClick={() => setEditModalOpen(false)}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>

              <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Subcategory</h2>

              <div className="space-y-3">
                {/* Category */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={editItem.category}
                    onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#8ed26b]"
                  >
                    {categories.map((cat, idx) => (
                      <option key={idx} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Subcategory Name */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Subcategory Name</label>
                  <input
                    type="text"
                    value={editItem.subcategory}
                    onChange={(e) => setEditItem({ ...editItem, subcategory: e.target.value })}
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#8ed26b]"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={3}
                    value={editItem.description ?? ""}
                    onChange={(e) => setEditItem({ ...editItem, description: e.target.value })}
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#8ed26b]"
                  />
                </div>
              </div>
            </div>

            {/* Right: Image Upload + Update */}
            <div className="w-64 flex-shrink-0 flex flex-col items-center justify-start">
              <label className="border-2 border-dashed border-gray-300 rounded-xl h-40 w-full flex items-center justify-center cursor-pointer relative mb-4">
                {preview ? (
                  <img src={preview} className="absolute inset-0 w-full h-full object-cover rounded-xl" />
                ) : (
                  <span className="text-gray-500">Upload Image</span>
                )}

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0] ?? null;
                    setImageFile(file);
                    if (file) setPreview(URL.createObjectURL(file));
                  }}
                />
              </label>

              <button
                onClick={async () => {
                  if (!editItem) return;

                  let updatedImage = editItem.image_url;
                  if (imageFile) updatedImage = await convertToBase64(imageFile);

                  const { error } = await supabase.from("subcategories").update({
                    category: editItem.category,
                    subcategory: editItem.subcategory,
                    description: editItem.description,
                    image_url: updatedImage,
                  }).eq("id", editItem.id);

                  if (error) addToast(`Failed: ${error.message}`, "error");
                  else {
                    addToast("Subcategory updated successfully!", "success");
                    fetchSubcategories(search, filterCategory);
                    setEditModalOpen(false);
                  }
                }}
                disabled={!isEditChanged()}
                className={`mt-auto w-full py-2 rounded-xl text-white ${isEditChanged() ? "bg-[#8ed26b] hover:bg-[#6ebb53]" : "bg-gray-300 cursor-not-allowed"
                  }`}
              >
                Update
              </button>

              <button
                onClick={() => setEditModalOpen(false)}
                className="mt-3 w-full py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
