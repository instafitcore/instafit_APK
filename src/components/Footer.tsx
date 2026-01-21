"use client";

import React from 'react';
import { Mail, Phone, Facebook, Linkedin } from "lucide-react";

const LOGO_PATH = "/footerinstlogo.png";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 pt-20 pb-10 mt-20 border-t border-gray-800 shadow-2xl">
      <div className="max-w-7xl mx-auto px-6">

        {/* --- MAIN GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-x-10 gap-y-16 mb-16">

          {/* --- 1. COMPANY INFO --- */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <div className="mb-6">
              <img
                src={LOGO_PATH}
                alt="InstaFitCore Logo"
                className="h-16 md:h-20 lg:h-28 w-auto"
              />
            </div>

            <p className="text-gray-400 text-sm leading-6">
              "Professional installation, dismantling, and repair" services delivered by certified & trained technicians.
            </p>
            <p className="mt-3 text-sm font-medium text-instafitcore-green">
              Making furniture installation simple, fast, and reliable.
            </p>

            {/* ADDED SOCIALS */}
            <div className="flex gap-4 mt-6">
              <a href="https://www.facebook.com/profile.php?id=61585466767139" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full hover:bg-[#1877F2] hover:text-white transition-all">
                <Facebook size={20} />
              </a>
              <a href="https://www.linkedin.com/company/110891163/" target="_blank" rel="noopener noreferrer" className="p-2 bg-gray-800 rounded-full hover:bg-[#0A66C2] hover:text-white transition-all">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* --- 2 & 3. NAVIGATION & SERVICES (SAME ROW ON MOBILE) --- */}
          <div className="grid grid-cols-2 gap-4 lg:col-span-2">
            <div>
              <h5 className="text-white text-xl font-bold mb-5 border-b border-gray-700 pb-2">Navigation</h5>
              <ul className="space-y-3 text-gray-400 text-sm">
                <li><a href="/site/services" className="hover:text-instafitcore-green transition-colors hover:pl-2 block">» Services</a></li>
                <li><a href="/site/career" className="hover:text-instafitcore-green transition-colors hover:pl-2 block">» Career</a></li>
                <li><a href="/site/about" className="hover:text-instafitcore-green transition-colors hover:pl-2 block">» About Us</a></li>
                <li><a href="/site/contact" className="hover:text-instafitcore-green transition-colors hover:pl-2 block">» Contact Us</a></li>
              </ul>
            </div>

            <div>
              <h5 className="text-white text-xl font-bold mb-5 border-b border-gray-700 pb-2">Services</h5>
              <ul className="space-y-2 text-gray-400 text-xs md:text-sm">
                <li className="text-gray-200 font-medium">» Furniture</li>
                <li className="ml-2"><a href="/site/services?typeId=1" className="hover:text-instafitcore-green transition-colors block">» Installation</a></li>
                <li className="ml-2"><a href="/site/services?typeId=2" className="hover:text-instafitcore-green transition-colors block">» Dismantling</a></li>
                <li className="ml-2 mb-1"><a href="/site/services?typeId=3" className="hover:text-instafitcore-green transition-colors block">» Repair</a></li>
                <li><a href="/site/services?topLevel=Customized%20Modular%20Furniture" className="hover:text-instafitcore-green transition-colors block">» Modular Furniture</a></li>
                <li><a href="/site/services?topLevel=Relocation%20Services" className="hover:text-instafitcore-green transition-colors block">» Movers</a></li>
                <li><a href="/site/services?topLevel=Customized%20Modular%20Kitchen" className="hover:text-instafitcore-green transition-colors block">» Modular Kitchen</a></li>
                 <li><a href="/site/services?topLevel=B2B%20Services" className="hover:text-instafitcore-green transition-colors block">» B2B Services</a></li>
             </ul>
            </div>
          </div>

          {/* --- 4. MORE INFO + CONTACT --- */}
          <div>
            <h5 className="text-white text-xl font-bold mb-5 border-b border-gray-700 pb-2">More Info</h5>
            <ul className="space-y-3 text-gray-400 text-sm mb-6">
              <li><a href="/site/terms" className="hover:text-instafitcore-green transition-colors hover:pl-2 block">» Terms & Conditions</a></li>
              <li><a href="/site/privacy" className="hover:text-instafitcore-green transition-colors hover:pl-2 block">» Privacy Policy</a></li>
            </ul>

            <h5 className="text-white text-xl font-bold mb-5 border-b border-gray-700 pb-2">Get in Touch</h5>
            <div className="space-y-4 text-sm">
              <p className="flex items-start gap-3">
                <Mail className="w-5 h-5 shrink-0 text-instafitcore-green" />
                <span>
                  <span className="font-semibold text-gray-100">Support:</span><br />
                  <a href="mailto:Customersupport@instafitcore.com" className="hover:text-white break-all">Customersupport@instafitcore.com</a>
                </span>
              </p>
              <p className="flex items-start gap-3">
                <Phone className="w-5 h-5 shrink-0 text-instafitcore-green" />
                <span>
                  <span className="font-semibold text-gray-100">Contact:</span><br />
                  +91 7411443233
                </span>
              </p>
            </div>
          </div>

        </div>

        {/* --- CENTERED NEED HELP BOX (Responsive) --- */}
        <div className="w-full max-w-4xl mx-auto bg-gray-800/60 border border-gray-700 rounded-2xl md:rounded-full px-8 py-3 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4 text-center">
          <span className="font-bold text-white whitespace-nowrap">Need Support?</span>
          <div className="flex items-center gap-2 text-gray-300">
            <Mail className="w-4 h-4 text-instafitcore-green" />
            <a href="mailto:support@instafitcore.com" className="hover:text-white transition-colors text-sm">support@instafitcore.com</a>
          </div>
          <p className="text-xs text-gray-400">
            <span className="font-bold text-white mr-1">Team InstaFitCore</span>
          </p>
        </div>

      </div>

      {/* Footer Bottom */}
      <div className="border-t border-gray-800 mt-16 pt-8 flex flex-col md:flex-row justify-center items-center gap-4 text-xs text-gray-500 px-6 text-center">
        <p className="md:ml-4">
          © {new Date().getFullYear()} InstaFitCore Solutions Private Limited.
        </p>
        <p className="md:ml-4">
          Designed and Developed by{' '}
          <a href="https://rakvih.in" target="_blank" rel="noopener noreferrer" className="text-instafitcore-green hover:underline font-semibold">
            Rakvih
          </a>
        </p>
      </div>
    </footer>
  );
}