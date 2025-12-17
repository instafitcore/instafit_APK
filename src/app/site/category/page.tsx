"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase-client";
import { ChevronRight, LayoutGrid, Loader2, ArrowLeft } from "lucide-react";

type Category = {
  id: number;
  category: string;
  image_url: string | null;
  description: string | null;
};

export default function AllCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllCategories = async () => {
      const { data } = await supabase
        .from("categories")
        .select("id, category, image_url, description")
        .eq("is_active", true)
        .order("category", { ascending: true });

      setCategories(data || []);
      setLoading(false);
    };
    fetchAllCategories();
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfdfb]">
      {/* HERO BANNER */}
      <div className="relative h-[220px] md:h-[300px] w-full overflow-hidden">
        <Image
          src="/banner4.jpg"
          alt="Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none drop-shadow-lg">
            Our <span className="text-[#8ed26b]">Specialties</span>
          </h1>
          <p className="text-white/80 text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] mt-3 drop-shadow-md">
            Professional Solutions for Your Lifestyle
          </p>
        </div>
      </div>

      {/* CATEGORY GRID */}
      <div className="max-w-7xl mx-auto px-4 py-8 md:py-12">
        {/* Navigation & Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div className="flex items-center gap-2 border-l-4 border-[#8ed26b] pl-3">
            <h1 className="text-sm md:text-lg font-black text-black uppercase tracking-[0.15em]">
              Choose a Category
            </h1>
          </div>

          <Link
            href="/site"
            className="flex items-center gap-1.5 text-gray-400 font-bold text-[9px] uppercase tracking-widest hover:text-[#8ed26b] transition-colors w-fit"
          >
            <ArrowLeft className="w-3 h-3" /> Back to home
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#8ed26b]" />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/site/category/${cat.id}`}
                className="group relative flex flex-col bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
              >
                {/* Image Section */}
                <div className="relative w-full h-40 md:h-44 overflow-hidden rounded-t-2xl bg-gray-100">
                  {cat.image_url ? (
                    <Image
                      src={cat.image_url}
                      alt={cat.category}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-300">
                      <LayoutGrid className="w-8 h-8" />
                    </div>
                  )}
                </div>

                {/* Text Content */}
                <div className="flex flex-col flex-1 p-4">
                  <h3 className="text-sm md:text-base font-black text-gray-700 group-hover:text-[#8ed26b] transition-colors uppercase italic leading-tight">
                    {cat.category}
                  </h3>
                  <p className="text-gray-500 text-[10px] md:text-xs mt-1 line-clamp-3 leading-relaxed">
                    {cat.description || `Explore our high-quality ${cat.category} options.`}
                  </p>
                </div>

                {/* Chevron */}
                <div className="absolute top-2 right-2 w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 group-hover:bg-[#8ed26b] group-hover:text-white transition-all duration-300">
                  <ChevronRight className="w-5 h-5" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
