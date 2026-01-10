"use client";

import { useEffect, useState, ChangeEvent } from "react";
import { supabase } from "@/lib/supabase-client";
import { Pencil, Trash2, Search } from "lucide-react";
import { useAdminToast } from "@/components/AdminToast";

const GREEN = "#8ed26b";

type CategoryItem = {
  id: number;
  category: string;
  description?: string | null;
  image_url?: string | null;
};

export default function CategoryAdminPage() {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const { addToast } = useAdminToast();

  const [categoryName, setCategoryName] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<CategoryItem | null>(null);
  const [originalEditItem, setOriginalEditItem] = useState<CategoryItem | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<CategoryItem | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);


  // Fetch categories
  const fetchCategories = async (q = "", filter = "All") => {
    setLoading(true);

    let query = supabase
      .from("categories")
      .select("id, category, description, image_url")
      .order("id", { ascending: false })
      .limit(50);

    if (q.trim()) query = query.ilike("category", `%${q}%`);
    if (filter !== "All") query = query.eq("category", filter);

    const { data, error } = await query;

    if (!error) setCategories(data || []);
    setLoading(false);
  };


  useEffect(() => {
    fetchCategories(debouncedSearch, filterCategory);
  }, [debouncedSearch, filterCategory]);


  const uniqueCategories = Array.from(new Set(categories.map((c) => c.category))).sort();


  const uploadCategoryImage = async (file: File) => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `categories/${fileName}`;

    const { error } = await supabase.storage
      .from("category-images")
      .upload(filePath, file);

    if (error) throw error;

    const { data } = supabase.storage
      .from("category-images")
      .getPublicUrl(filePath);

    return data.publicUrl;
  };


  // Add new category
 const handleAddCategory = async (e: React.FormEvent) => {
  e.preventDefault();
  setSubmitting(true);

  if (!categoryName.trim()) {
    addToast("Category name is required.", "error");
    setSubmitting(false);
    return;
  }

  if (!description.trim()) {
    addToast("Description is required.", "error");
    setSubmitting(false);
    return;
  }

  if (!imageFile) {
    addToast("Category image is required.", "error");
    setSubmitting(false);
    return;
  }

  const duplicate = categories.find(
    (c) => c.category.toLowerCase() === categoryName.trim().toLowerCase()
  );
  if (duplicate) {
    addToast("This category already exists.", "error");
    setSubmitting(false);
    return;
  }

  try {
    const imageUrl = await uploadCategoryImage(imageFile);

    const { error } = await supabase.from("categories").insert([
      {
        category: categoryName,
        description,
        image_url: imageUrl,
      },
    ]);

    if (error) {
      addToast(`Failed: ${error.message}`, "error");
      return;
    }

    addToast("Category added successfully!", "success");

    setCategoryName("");
    setDescription("");
    setImageFile(null);
    setPreview(null);

    fetchCategories();
  } catch (err: any) {
    addToast(err.message || "Something went wrong", "error");
  } finally {
    setSubmitting(false);
  }
};


  // Edit modal helpers
  const openEditModal = (item: CategoryItem) => {
    setEditItem(item);
    setOriginalEditItem({ ...item });
    setPreview(item.image_url || null);
    setEditModalOpen(true);
  };

  const isEditChanged = () => {
    if (!editItem || !originalEditItem) return false;
    return (
      editItem.category.trim() !== originalEditItem.category?.trim() ||
      (editItem.description ?? "") !== (originalEditItem.description ?? "") ||
      preview !== originalEditItem.image_url
    );
  };

  // Delete modal helpers
  const openDeleteModal = (item: CategoryItem) => {
    setDeleteItem(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteCategory = async () => {
    if (!deleteItem) return;
    setDeletingId(deleteItem.id);
    await supabase.from("categories").delete().eq("id", deleteItem.id);
    fetchCategories(search, filterCategory);
    addToast("Category deleted successfully!", "success");
    setDeletingId(null);
    setDeleteModalOpen(false);
    setDeleteItem(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Category Management</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT SIDE: List & Search */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow-md p-5 rounded-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full">
              <Search className="text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}

                className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#8ed26b] outline-none"
              />
            </div>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}

              className="px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8ed26b] bg-white"
            >
              <option value="All">All Categories</option>
              {uniqueCategories.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <span className="px-4 py-2 bg-[#8ed26b]/20 text-[#8ed26b] rounded-xl font-semibold">
              {loading ? "..." : categories.length}
            </span>
          </div>

          {/* CATEGORY CARDS */}
          {loading ? (
            <p className="text-center py-10">Loading...</p>
          ) : categories.length === 0 ? (
            <p className="text-center py-10 bg-white rounded-xl shadow">No categories found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {categories.map((c) => (
                <div
                  key={c.id}
                  className="bg-white shadow-lg rounded-2xl overflow-hidden hover:shadow-2xl transition"
                >
                  <div className="h-40 bg-gray-100">
                    {c.image_url ? (
                      <img src={c.image_url} className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <h2 className="text-xl font-semibold text-gray-800">{c.category}</h2>
                    {c.description && <p className="text-gray-600">{c.description}</p>}

                    <div className="flex justify-between mt-4">
                      <button
                        onClick={() => openEditModal(c)}
                        className="flex items-center gap-1 px-4 py-2 bg-[#8ed26b]/20 text-[#8ed26b] rounded-xl hover:bg-[#8ed26b]/30"
                      >
                        <Pencil size={16} /> Edit
                      </button>

                      <button
                        disabled={deletingId === c.id}
                        onClick={() => openDeleteModal(c)}
                        className="flex items-center gap-1 px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 disabled:opacity-50"
                      >
                        <Trash2 size={16} /> {deletingId === c.id ? "..." : "Delete"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT SIDE: Add Form */}
        <form
          onSubmit={handleAddCategory}
          className="bg-white shadow-xl rounded-3xl p-7 space-y-5 h-[600px] overflow-y-auto"
        >
          <h2 className="text-xl font-bold text-gray-800">Add New Category</h2>

          <div>
            <label className="font-medium text-gray-700">Category Name</label>
            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#8ed26b] outline-none"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-[#8ed26b] outline-none"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700">Category Image</label>
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
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-[#8ed26b] hover:bg-[#6ebb53] text-white py-3 rounded-xl font-semibold transition"
          >
            {submitting ? "Saving..." : "Add Category"}
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

              <h2 className="text-2xl font-bold mb-4 text-gray-800">Edit Category</h2>

              <div className="space-y-3">
                <div>
                  <label className="block font-medium text-gray-700 mb-1">Category Name</label>
                  <input
                    type="text"
                    value={editItem.category}
                    onChange={(e) => setEditItem({ ...editItem, category: e.target.value })}
                    className="w-full border rounded-xl p-3 focus:ring-2 focus:ring-[#8ed26b]"
                  />
                </div>

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

            {/* Right: Image Upload + Buttons */}
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

                  // Check duplicate excluding current item
                  const duplicate = categories.find(
                    (c) =>
                      c.category.toLowerCase() === editItem.category.trim().toLowerCase() &&
                      c.id !== editItem.id
                  );
                  if (duplicate) {
                    addToast("This category name already exists.", "error");
                    return;
                  }

                  let updatedImage = editItem.image_url;

                  if (imageFile) {
                    updatedImage = await uploadCategoryImage(imageFile);
                  }

                  await supabase
                    .from("categories")
                    .update({
                      category: editItem.category,
                      description: editItem.description,
                      image_url: updatedImage,
                    })
                    .eq("id", editItem.id);

                  fetchCategories(search, filterCategory);
                  setEditModalOpen(false);
                  addToast("Category updated successfully!", "success");
                }}
                disabled={!isEditChanged()}
                className={`w-full py-2 rounded-xl text-white ${isEditChanged() ? "bg-[#8ed26b] hover:bg-[#6ebb53]" : "bg-gray-300 cursor-not-allowed"
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

      {/* DELETE MODAL */}
      {deleteModalOpen && deleteItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 p-4">
          <div className="bg-white p-7 rounded-2xl w-full max-w-md shadow-2xl relative text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Delete Category</h2>
            <p className="mb-6">Are you sure you want to delete <strong>{deleteItem.category}</strong>?</p>

            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="px-5 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600"
              >
                {deletingId === deleteItem.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
