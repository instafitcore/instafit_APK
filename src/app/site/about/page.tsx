"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-client";
import { CheckCircle, Users, ArrowRight, Target, Star } from "lucide-react";

const ACCENT_COLOR = "text-teal-600";
const ICON_BG = "bg-teal-50";

export default function AboutPage() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTestimonials() {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setTestimonials(data);
      setLoading(false);
    }

    fetchTestimonials();
  }, []);

  return (
    <div className="min-h-screen bg-white">

      {/* Hero / Banner */}
      <section
        className="relative h-64 sm:h-80 md:h-96 flex items-center justify-center overflow-hidden border-b border-gray-100 shadow-inner"
        style={{
          backgroundImage: "url('/hero-bg.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 text-center max-w-4xl px-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            Our Commitment to Excellence
          </h1>
          <p className="text-lg sm:text-xl text-white/90 mt-4 font-light">
            Discover the heart of InstaFitCore Solutions and our promise to you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 space-y-16 sm:space-y-20 lg:space-y-24">

        {/* Who We Are */}
        <div className="text-center">
          <div
            className={`inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 ${ICON_BG} rounded-full mb-4 sm:mb-6 ring-4 ring-teal-100`}
          >
            <Users className={`w-6 h-6 sm:w-8 sm:h-8 ${ACCENT_COLOR}`} />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Who We Are
          </h2>
          <p className="text-gray-700 text-base sm:text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
            At <span className={`font-semibold ${ACCENT_COLOR}`}>InstaFitCore Solutions Pvt Ltd.</span>, we revolutionize furniture installation and assembly for homes and offices. Certified professionals deliver precise, reliable service for all furniture types. Leveraging technology, every project is executed with excellence, on time, and with unmatched care.
          </p>
        </div>

        {/* Our Mission */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 lg:p-16 shadow-xl border border-gray-100">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4 sm:mb-6">
              Our Mission
            </h2>
            <p className="text-gray-700 text-base sm:text-lg max-w-3xl mx-auto leading-relaxed">
              To simplify furniture setup through{" "}
              <strong>trust, technology, and transparency</strong>. We empower customers with peace of mind, delivering these core tenets:
            </p>
          </div>

          {/* Mission Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 md:gap-x-12 md:gap-y-8 max-w-5xl mx-auto">
            {[
              { title: "Professional & Punctual Service", desc: "Every time, without fail, by certified experts." },
              { title: "Fair & Transparent Pricing", desc: "Clear, upfront costs with no hidden fees." },
              { title: "Real-Time Updates & Digital Invoices", desc: "Stay informed every step of the way." },
              { title: "Empowering Skilled Technicians", desc: "Building better livelihoods and opportunities." },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex items-start space-x-3 sm:space-x-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition duration-200"
              >
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-base">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-500 mt-8 sm:mt-12 italic text-sm sm:text-base">
            We're not just assembling furniture — we're crafting comfort and reliability.
          </p>
        </div>

        {/* ⭐⭐⭐⭐⭐ CUSTOMER REVIEWS SECTION */}
        <section className="bg-white rounded-2xl p-6 sm:p-10 shadow-xl border border-gray-100">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 text-center mb-10">
            What Our Customers Say
          </h2>

          {/* Loading state */}
          {loading && (
            <p className="text-center text-gray-500 text-sm sm:text-base py-6">
              Loading testimonials...
            </p>
          )}

          {/* Empty state */}
          {!loading && testimonials.length === 0 && (
            <p className="text-center text-gray-500 text-sm sm:text-base py-6">
              No testimonials yet.
            </p>
          )}

          {/* Testimonials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {testimonials.map((item) => (
              <div
                key={item.id}
                className="p-6 bg-gray-50 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition duration-200"
              >
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: item.rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                  “{item.message}”
                </p>
                <p className="mt-3 font-semibold text-gray-900 text-sm sm:text-base">
                  — {item.name}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Vision */}
        <div className="bg-gray-50 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-inner border border-gray-100 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-indigo-50 rounded-full mb-4 sm:mb-6 ring-4 ring-indigo-100">
            <Target className="w-6 h-6 sm:w-8 sm:h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
            Our Vision
          </h2>
          <p className="text-gray-700 text-base sm:text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
            To become India’s most trusted on-demand platform for furniture assembly, installation, and service, connecting customers, retailers, and professionals through technology and transparency.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mt-6">
          <a
            href="/site/services"
            className="inline-flex items-center px-6 sm:px-8 lg:px-10 py-3 sm:py-4 bg-[#8ed26b] text-white font-semibold rounded-full transition-all duration-300 hover:bg-[#76c55d] hover:scale-[1.02] shadow-xl text-sm sm:text-base"
          >
            Explore Our Services
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 ml-2" />
          </a>
        </div>
      </div>
    </div>
  );
}
