"use client";

import React from "react";
import { CheckCircle, Users, ArrowRight, Target } from "lucide-react";

const ACCENT_COLOR = "text-teal-600";
const BG_ACCENT = "bg-teal-600";
const HOVER_ACCENT = "hover:bg-teal-700";
const ICON_BG = "bg-teal-50";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">

      {/* Hero / Banner */}
      <section
        className="relative h-96 flex items-center justify-center overflow-hidden border-b border-gray-100 shadow-inner"
        style={{ backgroundImage: "url('/hero-bg.jpg')", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/30"></div>
        <div className="relative z-10 text-center max-w-4xl px-4">
          <h1 className="text-6xl font-extrabold text-white leading-tight tracking-tight">
            Our Commitment to Excellence
          </h1>
          <p className="text-xl text-white/90 mt-4 font-light">
            Discover the heart of InstaFitCore Solutions and our promise to you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 space-y-24">

        {/* Who We Are */}
        <div className="text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 ${ICON_BG} rounded-full mb-6 ring-4 ring-teal-100`}>
            <Users className={`w-8 h-8 ${ACCENT_COLOR}`} />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Who We Are</h2>
          <p className="text-gray-700 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
            At <span className={`font-semibold ${ACCENT_COLOR}`}>InstaFitCore Solutions Pvt Ltd.</span>, we revolutionize furniture installation and assembly for homes and offices. Certified professionals deliver precise, reliable service for all furniture types. Leveraging technology, every project is executed with excellence, on time, and with unmatched care.
          </p>
        </div>

        {/* Our Mission */}
        <div className="bg-white rounded-3xl p-10 md:p-16 shadow-xl border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">Our Mission</h2>
            <p className="text-gray-700 text-lg max-w-3xl mx-auto leading-relaxed">
              To simplify furniture setup through <strong>trust, technology, and transparency</strong>. We empower customers with peace of mind, delivering these core tenets:
            </p>
          </div>

          {/* Mission Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 max-w-5xl mx-auto">
            {[
              { title: "Professional & Punctual Service", desc: "Every time, without fail, by certified experts." },
              { title: "Fair & Transparent Pricing", desc: "Clear, upfront costs with no hidden fees." },
              { title: "Real-Time Updates & Digital Invoices", desc: "Stay informed every step of the way." },
              { title: "Empowering Skilled Technicians", desc: "Building better livelihoods and opportunities." },
            ].map((item, idx) => (
              <div key={idx} className="flex items-start space-x-4 p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition duration-200">
                <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-gray-800">{item.title}</h3>
                  <p className="text-gray-500 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-gray-500 mt-12 italic text-base">
            We're not just assembling furniture — we're crafting comfort and reliability.
          </p>
        </div>

        {/* Why Choose Us */}
        <div>
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Why Choose Us</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Certified Technicians", desc: "Background-verified experts ensuring top-tier service.", img: "/certified.png" },
              { title: "Transparent Pricing", desc: "Clear, upfront costs with no surprises.", img: "/trade.png" },
              { title: "Same-Day Service", desc: "Urgent needs met quickly with reliable scheduling.", img: "/Same Day Delivery.png" },
              { title: "Quick & Reliable", desc: "Fast, dependable service for all furniture needs.", img: "/quick-reliable.png" },
            ].map((card, idx) => (
              <div
                key={idx}
                className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col items-center"
              >
                <div className="w-16 h-16 mb-4 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  <img src={card.img} alt={card.title} className="object-cover w-full h-full" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800 text-center">{card.title}</h3>
                <p className="text-gray-600 text-center">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Vision */}
        {/* Our Vision */}
        <div className="bg-gray-50 rounded-3xl p-8 md:p-12 shadow-inner border border-gray-100 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-50 rounded-full mb-6 ring-4 ring-indigo-100">
            <Target className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Our Vision</h2>
          <p className="text-gray-700 text-lg md:text-xl max-w-4xl mx-auto leading-relaxed">
            To become India’s most trusted on-demand platform for furniture assembly, installation, and service, connecting customers, retailers, and professionals through technology and transparency.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center mt-6">
          <a
            href="/site/services"
            className="inline-flex items-center px-10 py-4 bg-[#8ed26b] text-white font-semibold rounded-full transition-all duration-300 hover:bg-[#76c55d] hover:scale-[1.02] shadow-xl"
          >
            Explore Our Services
            <ArrowRight className="w-5 h-5 ml-2" />
          </a>
        </div>

      </div>
    </div>
  );
}
