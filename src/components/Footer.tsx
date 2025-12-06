"use client";

import React from 'react';
// Import the Image component for better performance if this is a Next.js project
// import Image from 'next/image'; // Assuming 'next/image' is available

// Define the brand color for accents (a strong, modern green)
const BRAND_ACCENT = "#8ed26b";
const BRAND_HOVER = "#a3d97f";

// Logo details
const LOGO_PATH = "/logoInstaFitCore.jpg"; // Path relative to the 'public' directory

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-20 pb-10 mt-20 border-t border-gray-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-16">

        {/* --- 1. COMPANY INFO & MISSION --- */}
        <div>
          {/* LOGO ADDED HERE */}
          <div className="mb-4">
            {/* Using standard <img> for simplicity and wide compatibility.
              If using Next.js, consider replacing this with the next/image component 
              for automatic optimization and sizing, e.g.,
              <Image src={LOGO_PATH} alt="InstaFitCore Logo" width={150} height={40} />
            */}
            <img
              src={LOGO_PATH}
              alt="InstaFitCore Logo"
              className="h-12 md:h-16 lg:h-20 w-auto" />
          </div>

          <p className="text-gray-400 text-sm leading-6">
            "Professional installation, dismantling, and repair" services delivered by certified & trained technicians.
          </p>
          <p className="mt-3 text-sm font-medium" style={{ color: BRAND_ACCENT }}>
            Making furniture installation simple, fast, and reliable.
          </p>

          {/* Social Media Placeholder */}
          <div className="mt-6 flex space-x-4">
            <a href="#" aria-label="Facebook" className="text-gray-400 hover:text-white transition-colors duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12c0 5.099 3.123 9.423 7.5 11.237v-7.91h-2.775V12H7.5V9.75c0-2.72 1.674-4.218 4.086-4.218 1.17 0 2.41.208 2.41.208V7.5h-1.237c-1.205 0-1.58.75-1.58 1.516V12h2.75l-.44 2.327h-2.31V23.237C17.877 21.423 21 17.099 21 12c0-6.627-5.373-12-12-12z" /></svg>
            </a>
            <a href="#" aria-label="Twitter" className="text-gray-400 hover:text-white transition-colors duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 5.865a8.384 8.384 0 01-2.37.643 4.192 4.192 0 001.83-2.274 8.36 8.36 0 01-2.613 1.002 4.175 4.175 0 00-7.098 3.81 11.85 11.85 0 01-8.6-4.34 4.176 4.176 0 001.29 5.56 4.167 4.167 0 01-1.888-.52v.053a4.183 4.183 0 003.34 4.103 4.165 4.165 0 01-1.88.07 4.18 4.18 0 003.89 2.903A8.37 8.37 0 012 18.158a11.855 11.855 0 006.427 1.88c7.714 0 11.93-6.4 11.93-11.93 0-.18-.004-.36-.013-.538A8.498 8.498 0 0022 5.865z" /></svg>
            </a>
            <a href="#" aria-label="LinkedIn" className="text-gray-400 hover:text-white transition-colors duration-300">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.75 0-.96.784-1.75 1.75-1.75s1.75.79 1.75 1.75c0 .96-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.618c0-1.346-.503-2.01-1.57-2.01-.84 0-1.342.484-1.57 1.054V19h-3V8h3v1.272c.42-.746 1.13-1.272 2.515-1.272 2.148 0 3.985 1.347 3.985 4.298V19z" /></svg>
            </a>
          </div>
        </div>

        {/* --- 2. QUICK LINKS --- */}
        <div>
          <h5 className="text-white text-xl font-bold mb-5 border-b border-gray-700 pb-2">Navigation</h5>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><a href="/site/services" className="hover:text-white transition-colors hover:pl-2 block">» Services</a></li>
            <li><a href="/site/book" className="hover:text-white transition-colors hover:pl-2 block">» Book Request</a></li>
            <li><a href="/site/about" className="hover:text-white transition-colors hover:pl-2 block">» About Us</a></li>
            <li><a href="/site/contact" className="hover:text-white transition-colors hover:pl-2 block">» Contact Us</a></li>
          </ul>
          <h5 className="text-white text-xl font-bold mt-8 mb-5 border-b border-gray-700 pb-2">Legal</h5>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li><a href="/site/terms" className="hover:text-white transition-colors hover:pl-2 block">» Terms & Conditions</a></li>
            <li><a href="/site/privacy" className="hover:text-white transition-colors hover:pl-2 block">» Privacy Policy</a></li>
          </ul>
        </div>

        {/* --- 3. SERVICES LIST --- */}
        <div>
          <h5 className="text-white text-xl font-bold mb-5 border-b border-gray-700 pb-2">Service Categories</h5>
          <ul className="space-y-3 text-gray-400 text-sm">
            <li className="transition-colors hover:text-white block hover:translate-x-1 duration-200">Furniture Installation</li>
            <li className="transition-colors hover:text-white block hover:translate-x-1 duration-200">Furniture Dismantling</li>
            <li className="transition-colors hover:text-white block hover:translate-x-1 duration-200">Furniture Repair</li>
            <li className="transition-colors hover:text-white block hover:translate-x-1 duration-200">Modular Kitchen Setup</li>
            <li className="transition-colors hover:text-white block hover:translate-x-1 duration-200">Packing & Relocation Support</li>
          </ul>
        </div>

        {/* --- 4. CONTACT INFO --- */}
        <div>
          <h5 className="text-white text-xl font-bold mb-5 border-b border-gray-700 pb-2">Get in Touch</h5>

          <div className="space-y-5 text-sm">
            <p className="flex items-start">
              <svg className="w-5 h-5 mr-3 mt-1" style={{ color: BRAND_ACCENT }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
              <span>
                <span className="font-semibold text-gray-100">Customer Support:</span><br />
                <a href="mailto:Customersupport@instafitcore.com" className="hover:text-white transition-colors">Customersupport@instafitcore.com</a>
              </span>
            </p>

            <p className="flex items-start">
              <svg className="w-5 h-5 mr-3 mt-1" style={{ color: BRAND_ACCENT }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.336 17c-.77 1.333.192 3 1.732 3z" /></svg>
              <span>
                <span className="font-semibold text-gray-100">Grievance:</span><br />
                <a href="mailto:Grienvance@instafitcore.com" className="hover:text-white transition-colors">Grienvance@instafitcore.com</a>
              </span>
            </p>

            <p className="flex items-start">
              <svg className="w-5 h-5 mr-3 mt-1" style={{ color: BRAND_ACCENT }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              <span>
                <span className="font-semibold text-gray-100">Head Office:</span><br />
                G7 Kemps Green View, Ayyappanagar, KR Puram, Bangalore
              </span>
            </p>

            <p className="flex items-start">
              <svg className="w-5 h-5 mr-3 mt-1" style={{ color: BRAND_ACCENT }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
              <span className="text-gray-400">
                <span className="font-semibold text-gray-100">Toll Free No:</span><br />
                Yet to register
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer Bottom (Copyright) */}
      <div className="border-t border-gray-800 mt-16 pt-6">
        <p className="text-center text-gray-500 text-xs tracking-wide">
          © {new Date().getFullYear()} **InstaFitCore Solutions Private Limited**. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}