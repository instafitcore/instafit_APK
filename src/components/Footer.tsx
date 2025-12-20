"use client";

import React from 'react';
import { Mail, Phone } from "lucide-react";

const BRAND_ACCENT = "#8ed26b";
const LOGO_PATH = "/footerlogo.png";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-20 pb-10 mt-20 border-t border-gray-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6">

        {/* --- MAIN GRID (Top Section) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16 mb-16">

          {/* --- 1. COMPANY INFO --- */}
          <div>
            <div className="mb-4">
              <img src={LOGO_PATH} alt="InstaFitCore Logo" className="h-12 md:h-16 lg:h-20 w-auto" />
            </div>
            <p className="text-gray-400 text-sm leading-6">
              "Professional installation, dismantling, and repair" services delivered by certified & trained technicians.
            </p>
            <p className="mt-3 text-sm font-medium" style={{ color: BRAND_ACCENT }}>
              Making furniture installation simple, fast, and reliable.
            </p>
          </div>

          {/* --- 2. QUICK LINKS --- */}
          <div>
            <h5 className="text-white text-xl font-bold mb-5 border-b border-gray-700 pb-2">Navigation</h5>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li><a href="/site/services" className="hover:text-white transition-colors hover:pl-2 block">» Services</a></li>
              <li><a href="/site/career" className="hover:text-white transition-colors hover:pl-2 block">» Career</a></li>
              <li><a href="/site/about" className="hover:text-white transition-colors hover:pl-2 block">» About Us</a></li>
              <li><a href="/site/contact" className="hover:text-white transition-colors hover:pl-2 block">» Contact Us</a></li>
            </ul>
          </div>

          {/* --- 3. SERVICES LIST --- */}
          <div>
            <h5 className="text-white text-xl font-bold mb-5 border-b border-gray-700 pb-2">Services</h5>
            <ul className="space-y-3 text-gray-400 text-sm">
              <li className="text-gray-200 font-medium">» Furniture</li>
              <li className="ml-4"><a href="/site/services?typeId=1" className="hover:text-white transition-colors hover:pl-2 block">» Installation</a></li>
              <li className="ml-4"><a href="/site/services?typeId=2" className="hover:text-white transition-colors hover:pl-2 block">» Dismantling</a></li>
              <li className="ml-4 mb-2"><a href="/site/services?typeId=3" className="hover:text-white transition-colors hover:pl-2 block">» Repair</a></li>
              <li><a href="/site/services?category=modular-furniture" className="hover:text-white transition-colors hover:pl-2 block">» Modular Furniture</a></li>
              <li><a href="/site/book?type=b2b" className="hover:text-white transition-colors hover:pl-2 block font-medium">» B2B Requirement</a></li>
            </ul>
          </div>

          {/* --- 4. CONTACT INFO --- */}
          <div>
            <h5 className="text-white text-xl font-bold mb-5 border-b border-gray-700 pb-2">Get in Touch</h5>
            <div className="space-y-4 text-sm">
              <p className="flex items-start gap-3">
                <Mail className="w-5 h-5 shrink-0" style={{ color: BRAND_ACCENT }} />
                <span><span className="font-semibold text-gray-100">Support:</span><br /><a href="mailto:Customersupport@instafitcore.com">Customersupport@instafitcore.com</a></span>
              </p>
              <p className="flex items-start gap-3">
                <Phone className="w-5 h-5 shrink-0" style={{ color: BRAND_ACCENT }} />
                <span><span className="font-semibold text-gray-100">Toll Free:</span><br />+91 7411443233</span>
              </p>
            </div>
          </div>
        </div>

        {/* --- CENTERED NEED HELP BOX --- */}
        <div className="w-full max-w-4xl mx-auto bg-gray-800/60 border border-gray-700 rounded-full px-8 py-3 shadow-xl flex flex-wrap items-center justify-between gap-4">
          <span className="font-bold text-white whitespace-nowrap">Need Support?</span>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-gray-300">
              <Mail className="w-4 h-4" style={{ color: BRAND_ACCENT }} />
              <a href="mailto:support@instafitcore.com" className="hover:text-white transition-colors text-sm">support@instafitcore.com</a>
            </div>
          </div>

          <div className="hidden md:block h-4 w-[1px] bg-gray-700"></div>

          <p className="text-xs text-gray-400">
            <span className="font-bold text-white mr-1">Team InstaFitCore</span>
            <span className="italic text-gray-500">— Fast, Reliable Furniture Services</span>
          </p>
        </div>

      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-800 mt-16 pt-8">
        <p className="text-center text-xs text-gray-500 leading-relaxed px-6">
          You are receiving this email because a login attempt was made on your InstaFitCore account.
          <br />
          © {new Date().getFullYear()} InstaFitCore Solutions Private Limited. All rights reserved.
        </p>
        <p className="text-center text-xs text-gray-500 leading-relaxed px-6">Note: Designed and Developed by Rakvih</p>
      </div>
    </footer>
  );
}