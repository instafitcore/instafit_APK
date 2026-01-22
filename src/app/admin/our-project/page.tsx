"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Image from "next/image";
import {
  Plus,
  Trash2,
  FolderOpen,
  UploadCloud,
  X,
  Loader2,
  Edit3,
  AlertTriangle,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Project {
  id: number;
  title: string;
  description: string;
  media_url: string; // Comma-separated URLs for multiple media
  media_type: string; // Comma-separated types for multiple media
  created_at: string;
}

export default function OurProjectPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [uploading, setUploading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  // Open modal for editing
  const openEditModal = (project: Project) => {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description);
    setFiles([]); // Files are optional during edit
    setIsModalOpen(true);
  };

  // Reset form when closing modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
    setTitle("");
    setDescription("");
    setFiles([]);
  };

  const fetchProjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("our_projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error) setProjects(data || []);
    setLoading(false);
  };

  const handleFileUpload = async (files: File[]) => {
    const urls: string[] = [];
    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("project_media") // Updated bucket name
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("project_media").getPublicUrl(filePath);
      urls.push(data.publicUrl);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return alert("Title is required");

    setUploading(true);
    try {
      let media_url = editingProject?.media_url || "";
      let media_type = editingProject?.media_type || "";

      if (files.length > 0) {
        const urls = await handleFileUpload(files);
        media_url = urls.join(","); // Store as comma-separated
        media_type = files.map((file) => (file.type.startsWith("video") ? "video" : "image")).join(",");
      }

      if (editingProject) {
        // UPDATE EXISTING
        const { error } = await supabase
          .from("our_projects")
          .update({ title, description, media_url, media_type })
          .eq("id", editingProject.id);
        if (error) throw error;
      } else {
        // INSERT NEW
        if (files.length === 0) throw new Error("At least one media file is required for new projects");
        const { error } = await supabase.from("our_projects").insert([
          { title, description, media_url, media_type },
        ]);
        if (error) throw error;
      }

      closeModal();
      fetchProjects();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  };

  const deleteProject = async () => {
    if (!deleteConfirmId) return;
    const { error } = await supabase.from("our_projects").delete().eq("id", deleteConfirmId);
    if (!error) {
      fetchProjects();
      setDeleteConfirmId(null);
    }
  };

  // Helper to get media arrays from comma-separated strings
  const getMediaUrls = (media_url: string) => media_url ? media_url.split(",") : [];
  const getMediaTypes = (media_type: string) => media_type ? media_type.split(",") : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-8 py-10">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Our Projects</h1>
            <p className="text-slate-500 mt-1 text-lg">Manage your portfolio and case studies</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-[#8ed26b] hover:bg-[#7ac65d] text-white px-6 py-3 rounded-2xl font-bold transition shadow-lg hover:shadow-xl active:scale-95"
          >
            <Plus size={20} />
            Add New Project
          </button>
        </div>

        {/* DELETE CONFIRMATION MODAL */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDeleteConfirmId(null)}></div>
            <div className="relative bg-white p-8 rounded-[2rem] shadow-2xl max-w-sm w-full text-center animate-in zoom-in duration-200">
              <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">Are you sure?</h3>
              <p className="text-slate-500 mt-2">This action cannot be undone. This project will be permanently removed.</p>
              <div className="flex gap-3 mt-8">
                <button onClick={() => setDeleteConfirmId(null)} className="flex-1 px-4 py-3 rounded-xl font-bold text-slate-400 hover:bg-slate-100 transition">Cancel</button>
                <button onClick={deleteProject} className="flex-1 px-4 py-3 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 transition shadow-lg shadow-rose-100">Delete</button>
              </div>
            </div>
          </div>
        )}

        {/* ADD/EDIT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !uploading && closeModal()}></div>
            <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-center px-8 py-6 border-b border-slate-100">
                <h2 className="text-2xl font-bold text-slate-800">{editingProject ? "Edit Project" : "Add New Project"}</h2>
                <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-5">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Project Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-[#8ed26b] transition"
                    placeholder="e.g. Modern Home Renovation"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none h-28 resize-none transition"
                    placeholder="Briefly describe the project scope..."
                  />
                </div>

                <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[#8ed26b] transition bg-slate-50">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={(e) => setFiles(Array.from(e.target.files || []))}
                    className="hidden"
                    id="media-upload"
                  />
                  <label htmlFor="media-upload" className="cursor-pointer">
                    <UploadCloud className="mx-auto text-slate-400 mb-2" size={32} />
                    <p className="font-bold text-slate-600 text-sm">
                      {files.length > 0 ? `${files.length} file(s) selected` : editingProject ? "Keep current or upload new" : "Click to upload media"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-tighter">Images or Videos (Multiple Allowed)</p>
                  </label>
                </div>

                <button
                  disabled={uploading}
                  type="submit"
                  className="w-full bg-[#8ed26b] py-4 rounded-2xl text-white font-bold hover:bg-[#7ac65d] transition flex justify-center items-center gap-2 shadow-lg"
                >
                  {uploading ? (
                    <><Loader2 className="animate-spin" size={20}/> Saving...</>
                  ) : (
                    editingProject ? "Update Changes" : "Publish Now"
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* PROJECTS GRID */}
        {loading ? (
          <div className="flex justify-center py-40">
            <Loader2 className="animate-spin w-12 h-12 text-[#8ed26b]" />
          </div>
        ) : projects.length === 0 ? (
          <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-24 text-center">
            <FolderOpen className="mx-auto text-slate-300" size={60} />
            <p className="mt-4 font-bold text-slate-500 text-xl">No projects found</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8">
            {projects.map((p) => {
              const mediaUrls = getMediaUrls(p.media_url);
              const mediaTypes = getMediaTypes(p.media_type);
              return (
                <ProjectCard key={p.id} project={p} mediaUrls={mediaUrls} mediaTypes={mediaTypes} onEdit={openEditModal} onDelete={setDeleteConfirmId} />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Separate component for each project card with auto-scrolling media
function ProjectCard({ project, mediaUrls, mediaTypes, onEdit, onDelete }: { project: Project; mediaUrls: string[]; mediaTypes: string[]; onEdit: (p: Project) => void; onDelete: (id: number) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (mediaUrls.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mediaUrls.length);
    }, 2000); // Auto-scroll every 2 seconds
    return () => clearInterval(interval);
  }, [mediaUrls.length]);

  const currentUrl = mediaUrls[currentIndex] || "";
  const currentType = mediaTypes[currentIndex] || "image";

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300">
      <div className="relative h-60 bg-slate-100">
        {currentType === "video" ? (
          <video src={currentUrl} className="h-full w-full object-cover" autoPlay muted loop />
        ) : (
          <Image src={currentUrl} alt={project.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
        )}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-700">
          {currentType} {mediaUrls.length > 1 && `(${currentIndex + 1}/${mediaUrls.length})`}
        </div>
      </div>

      <div className="p-6 flex-1">
        <h3 className="font-bold text-xl mb-2 text-slate-800">{project.title}</h3>
        <p className="text-slate-500 text-sm line-clamp-3 italic leading-relaxed">
          {project.description || "No description provided."}
        </p>
      </div>

      <div className="px-6 pb-6 mt-auto flex gap-3">
        <button
          onClick={() => onEdit(project)}
          className="flex-1 flex items-center justify-center gap-2 text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition border border-slate-200"
        >
          <Edit3 size={16} /> Edit
        </button>
        <button
          onClick={() => onDelete(project.id)}
          className="flex-1 flex items-center justify-center gap-2 text-rose-500 font-bold py-3 rounded-xl hover:bg-rose-50 transition border border-rose-100"
        >
          <Trash2 size={16} /> Delete
        </button>
      </div>
    </div>
  );
}