"use client";

import React, { useState } from "react";
import Link from "next/link";
// Importing specific icons for better visual design
import { Mail, Phone, MapPin, Send } from "lucide-react";

// --- CUSTOM COLOR CONSTANTS ---
// Hex: #8ed26b (Bright Green)
const ACCENT_COLOR = "text-[#8ed26b]";
const BG_ACCENT = "bg-[#8ed26b]";
const HOVER_ACCENT = "hover:bg-[#76c55d]"; // Slightly darker shade for hover effect
const LIGHT_BG = "bg-[#f2faee]"; // Very light tint for icons
// --- END CUSTOM COLOR CONSTANTS ---

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      console.log({ name, email, message });
      setLoading(false);
      setSuccess(true);
      setName("");
      setEmail("");
      setMessage("");

      // Automatically hide success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };

  const ContactInfoCard = ({ icon: Icon, title, content, link }) => (
    <div className="flex items-start space-x-4">
      {/* Icon background is now the light tint of the new green */}
      <div className={`p-3 rounded-full ${LIGHT_BG} ${ACCENT_COLOR}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600">
          {link ? (
            // Link text color uses the new green accent
            <a href={link} className={`font-medium ${ACCENT_COLOR} hover:underline`}>
              {content}
            </a>
          ) : (
            content
          )}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Background uses the new green accent */}
      <section className={`relative h-72 ${BG_ACCENT} flex items-center justify-center shadow-lg`}>
        <div className="text-center">
          {/* Text is a lighter tint of the green accent */}
          <p className="text-[#c7e5b5] uppercase tracking-widest font-medium mb-2">Ready to Connect?</p>
          <h1 className="text-5xl md:text-6xl font-extrabold text-white">Let's Talk</h1>
        </div>
      </section>

      {/* Contact Form + Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-12">

          {/* Contact Information */}
          <div className="lg:col-span-1 space-y-10 p-6 rounded-2xl bg-white shadow-lg border border-gray-100 h-fit">
            {/* Title text color uses the new green accent */}
            <h2 className={`text-3xl font-bold ${ACCENT_COLOR}`}>Get Our Details</h2>
            <p className="text-gray-600">
              Need immediate assistance? Find our most important contact channels below.
            </p>

            <div className="space-y-6">
              <ContactInfoCard
                icon={Phone}
                title="Customer Support"
                content="customersupport@instafitcore.com"
                link="mailto:customersupport@instafitcore.com"
              />
              <ContactInfoCard
                icon={Mail}
                title="Grievance"
                content="grievance@instafitcore.com"
                link="mailto:grievance@instafitcore.com"
              />
              <ContactInfoCard
                icon={MapPin}
                title="Head Office"
                content={
                  <>
                    G7 Kemps Green View,<br />
                    Ayyappanagar, KR Puram,<br />
                    Bangalore, India
                  </>
                }
              />
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Send Us a Message</h2>

            {success && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 font-medium rounded-lg border border-green-200 animate-fadeIn">
                🥳 Your message has been sent successfully! We will get back to you shortly.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Full Name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className={`w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f2faee] focus:border-[#8ed26b] transition duration-200`}
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email Address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f2faee] focus:border-[#8ed26b] transition duration-200`}
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  className={`w-full px-5 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#f2faee] focus:border-[#8ed26b] transition duration-200`}
                  rows={6}
                  placeholder="How can we help you with your furniture needs?"
                />
              </div>

              {/* Submit Button - Uses the new BG_ACCENT and HOVER_ACCENT */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center space-x-3 ${BG_ACCENT} text-white font-semibold py-3 rounded-xl transition-all duration-300 shadow-lg ${HOVER_ACCENT} ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl'}`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Send Message</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Google Maps Embed */}
        <div className="max-w-7xl mx-auto px-6 lg:px-8 mt-12">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Find Our Location</h3>
            <div className="w-full h-80 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3888.978715232021!2d77.594566!3d12.971599!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae1670f1b8f6a3%3A0x4e6e948e0aaee77a!2sBangalore!5e0!3m2!1sen!2sin!4v1699439332923!5m2!1sen!2sin"
                className="w-full h-full border-0"
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Location Map"
              ></iframe>
            </div>
        </div>

      </section>

      {/* CTA Section - Background uses the new green accent */}
      <section className={`py-16 ${BG_ACCENT} shadow-inner`}>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Need Installation Right Away?
          </h2>
          {/* Text is a lighter tint of the green accent */}
          <p className="text-[#c7e5b5] mb-8 max-w-2xl mx-auto">
            Skip the message and head straight to booking. Our certified technicians are ready to serve you today.
          </p>

          {/* CTA Link - Text color uses the new green accent */}
          <Link
            href="/site/services"
            className={`inline-block px-10 py-4 bg-white ${ACCENT_COLOR} font-bold rounded-full hover:bg-teal-50 transition-all duration-300 shadow-2xl transform hover:scale-105`}
          >
            Book a Service Now →
          </Link>
        </div>
      </section>
    </div>
  );
}