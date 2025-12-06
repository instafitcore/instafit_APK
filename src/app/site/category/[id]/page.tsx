"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase-client";
import { ArrowRight, List, Package } from "lucide-react"; 

// Define a brand accent color for visual coherence
const BRAND_COLOR = "#22c55e"; // A bright, professional green

type Category = {
    id: number;
    category: string;
    subcategory: string;
    image_url: string | null;
    subcategory_image_url: string | null;
    description: string | null;
};

type Subcategory = {
    id: number;
    name: string;
    image_url: string | null;
    category_id: number;
    description: string | null;
};

export default function CategoryPage() {
    const params = useParams();
    const categoryId = Number(params.id);

    const [category, setCategory] = useState<Category | null>(null);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function load() {
            const { data: cat } = await supabase
                .from("categories")
                .select("*")
                .eq("id", categoryId)
                .single();

            setCategory(cat);

            if (cat) {
                // Fetch subcategories from NEW subcategories table
                const { data: subs } = await supabase
                    .from("subcategories")
                    .select("*")
                    .eq("category", cat.category)
                    .order("id", { ascending: true });

                setSubcategories(
                    (subs || []).map((sub: any) => ({
                        id: sub.id,
                        name: sub.subcategory,
                        image_url: sub.image_url,
                        category_id: sub.id,
                        description: sub.description,
                    }))
                );
            } else {
                setSubcategories([]);
            }

            setLoading(false);
        }

        load();
    }, [categoryId]);


    // --- LOADING STATE ---
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl font-medium text-gray-600 flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5 mr-3 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading Category Details...
                </div>
            </div>
        );
    }

    // --- NOT FOUND STATE ---
    if (!category) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-2xl font-semibold text-red-500 p-8 bg-white shadow-lg rounded-xl">
                    Category Not Found 😔
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* --------------------------------------------- */}
            {/* CATEGORY HEADER WITH PROMINENT IMAGE */}
            {/* --------------------------------------------- */}
            <header className="w-full bg-white border-b border-gray-200 shadow-sm">
                <div className="w-full max-w-7xl mx-auto px-6 pt-12 pb-6">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 flex items-center">
                        <List className="inline-block w-8 h-8 mr-3" style={{ color: BRAND_COLOR }} />
                        {category.category}
                    </h1>

                    <p className="mt-4 text-lg md:text-xl text-gray-600 max-w-4xl leading-relaxed">
                        {category.description || "Discover a range of tailored services and expert solutions for all your needs in this category."}
                    </p>
                </div>
                
                {/* HIGHLIGHTED BANNER SECTION 
                  - Increased height (h-[400px]) 
                  - Full opacity
                  - Stronger shadow (shadow-2xl) 
                */}
                <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-12">
                    {category.image_url && (
                        <div className="relative w-full h-[400px] rounded-3xl overflow-hidden shadow-2xl transition-all duration-500">
                            <Image
                                src={category.image_url}
                                alt={category.category}
                                fill
                                sizes="100vw"
                                className="object-cover" // Ensure full visibility (no opacity)
                                priority
                            />
                            {/* Added a subtle gradient to keep text readable if needed, but the image is prominent */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                        </div>
                    )}
                </div>
            </header>
            
            <hr className="border-gray-200" />
            
            {/* --------------------------------------------- */}
            {/* SUBCATEGORIES LIST */}
            {/* --------------------------------------------- */}
            <div className="max-w-7xl mx-auto px-6 py-16">
                <h2 className="text-3xl font-extrabold text-gray-900 mb-8 flex items-center">
                    <Package className="w-6 h-6 mr-2" style={{ color: BRAND_COLOR }} />
                    Available Service Options
                </h2>

                {subcategories.length === 0 ? (
                    <div className="p-8 border border-gray-200 bg-white rounded-xl shadow-lg">
                        <p className="text-lg text-gray-500">
                            No specific **subcategories** are defined for **{category.category}** yet. You may proceed directly to booking services.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {subcategories.map((sub) => (
                            <Link
                                key={sub.id}
                                href={`/site/services/${sub.id}?category=${encodeURIComponent(
                                    category.category
                                )}&subcategory=${encodeURIComponent(sub.name)}`}
                                className="group flex items-center p-6 bg-white border border-gray-200 rounded-xl shadow-md hover:shadow-xl hover:border-gray-300 transition-all duration-300 transform hover:translate-y-[-2px]"
                            >
                                {/* IMAGE/ICON AREA (Fixed Size) */}
                                <div className="relative flex-shrink-0 h-24 w-24 rounded-lg overflow-hidden bg-gray-100 mr-6">
                                    {sub.image_url ? (
                                        <Image
                                            src={sub.image_url}
                                            alt={sub.name}
                                            fill
                                            sizes="96px"
                                            className="object-cover group-hover:opacity-80 transition-opacity duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Package className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>

                                {/* TEXT CONTENT AREA */}
                                <div className="flex-grow">
                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-black transition-colors">
                                        {sub.name}
                                    </h3>
                                    <p className="text-base text-gray-600 mt-1 line-clamp-2">
                                        {sub.description || "Click to view pricing, details, and booking options for this specific service."}
                                    </p>
                                </div>
                                
                                {/* CALL TO ACTION ARROW */}
                                <div className="flex-shrink-0 ml-6">
                                    <ArrowRight className="w-6 h-6 text-gray-400 group-hover:text-blue-600 transition-all duration-300 group-hover:translate-x-1" />
                                </div>

                            </Link>
                        ))}
                    </div>
                )}
            </div>

        </div>
    );
}