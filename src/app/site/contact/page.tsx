"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, Star, LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

// --- CUSTOM COLOR CONSTANTS ---
const ACCENT_COLOR = "text-[#8ed26b]";
const BG_ACCENT = "bg-[#8ed26b]";
const HOVER_ACCENT = "hover:bg-[#76c55d]";
const LIGHT_BG = "bg-[#f2faee]";

// --- ContactInfoCard Props ---
type ContactInfoCardProps = {
  icon: LucideIcon;
  title: string;
  content: string | React.ReactNode; // safer than JSX.Element
  link?: string;
};


const ContactInfoCard: React.FC<ContactInfoCardProps> = ({ icon: Icon, title, content, link }) => (
  <div className="flex items-start space-x-4">
    <div className={`p-3 rounded-full ${LIGHT_BG} ${ACCENT_COLOR}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-600">
        {link ? (
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

export default function ContactPage() {
  // Contact form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  // Testimonial state
  const [testimonialName, setTestimonialName] = useState("");
  const [testimonialMessage, setTestimonialMessage] = useState("");
  const [rating, setRating] = useState(0);

  // UI states
  const [success, setSuccess] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  // --- Contact form submission ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from("contact_messages").insert([
      { name, email, message },
    ]);

    setLoading(false);

    if (error) {
      alert("Something went wrong. Please try again.");
      console.error(error);
      return;
    }

    setSuccess(true);
    setName("");
    setEmail("");
    setMessage("");

    setTimeout(() => setSuccess(false), 5000);
  };

  // --- Testimonial submission ---
  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      alert("Please select a rating");
      return;
    }

    const { error } = await supabase.from("testimonials").insert([
      { name: testimonialName, message: testimonialMessage, rating },
    ]);

    if (error) {
      alert("Failed to submit review.");
      console.error(error);
      return;
    }

    setTestSuccess(true);
    setTestimonialName("");
    setTestimonialMessage("");
    setRating(0);

    setTimeout(() => setTestSuccess(false), 4500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className={`relative h-64 md:h-72 ${BG_ACCENT} flex items-center justify-center shadow-lg`}>
        <div className="text-center px-4">
          <p className="text-[#c7e5b5] text-sm md:text-base uppercase tracking-widest font-medium mb-2">
            Ready to Connect?
          </p>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight">
            Let's Talk
          </h1>
        </div>
      </section>

      {/* MAIN CONTENT */}
      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT CARD */}
          <div className="lg:col-span-1 space-y-10 p-6 rounded-2xl bg-white shadow-lg border border-gray-100">
            <h2 className={`text-3xl font-bold ${ACCENT_COLOR}`}>Get Our Details</h2>
            <p className="text-gray-600">Need immediate assistance? Find our contact channels below.</p>

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

          {/* CONTACT FORM */}
          <div className="lg:col-span-2 bg-white p-6 md:p-10 rounded-2xl shadow-xl border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Enquiry</h2>

            {success && (
              <div className="mb-6 p-4 bg-green-100 text-green-700 font-medium rounded-lg border border-green-200">
                🥳 Your message has been sent successfully!
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Your Name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#f2faee] focus:border-[#8ed26b]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Email</label>
                <input
                  type="email"
                  required
                  placeholder="Your Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#f2faee] focus:border-[#8ed26b]"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">Message</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Your Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-[#f2faee] focus:border-[#8ed26b]"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full flex items-center justify-center space-x-3 ${BG_ACCENT} text-white font-semibold py-3 rounded-xl ${HOVER_ACCENT}`}
              >
                {loading ? "Sending..." : <><Send className="w-5" /> <span>Send Message</span></>}
              </button>
            </form>
          </div>
        </div>

        {/* MAP */}
        <div className="max-w-7xl mx-auto px-4 mt-14">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Find Our Location</h3>
          <div className="w-full h-72 md:h-80 rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.8050151135087!2d77.72891557484227!3d13.005833887324216!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bae11424d3979f3%3A0x4cea90e1c13c4c5!2sG7%20Kemps%20Green%20View%2C%20Ayyappanagar%2C%20Krishnarajapura%2C%20Bengaluru%2C%20Karnataka%20560016!5e0!3m2!1sen!2sin!4v1709397770000!5m2!1sen!2sin"
              className="w-full h-full"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        {/* TESTIMONIAL FORM */}
        <div className="max-w-4xl mx-auto px-4 mt-16 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
          <h3 className="text-3xl font-bold mb-6 text-gray-800">Share Your Experience</h3>

          {testSuccess && (
            <div className="p-4 bg-green-100 text-green-700 font-medium rounded-lg mb-4">
              Thank you for your valuable feedback!
            </div>
          )}

          <form onSubmit={handleTestimonialSubmit} className="space-y-6">
            <input
              type="text"
              placeholder="Your Name"
              required
              value={testimonialName}
              onChange={(e) => setTestimonialName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#8ed26b]"
            />

            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={30}
                  className={`cursor-pointer transition ${rating >= star ? "text-yellow-400" : "text-gray-300"}`}
                  fill={rating >= star ? "currentColor" : "none"}
                  stroke="currentColor"
                  onClick={() => setRating(star)}
                />
              ))}
            </div>

            <textarea
              rows={4}
              placeholder="Write your testimonial..."
              required
              value={testimonialMessage}
              onChange={(e) => setTestimonialMessage(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-[#8ed26b]"
            />

            <button
              type="submit"
              className={`w-full py-3 rounded-xl text-white font-semibold ${BG_ACCENT} ${HOVER_ACCENT}`}
            >
              Submit Review
            </button>
          </form>
        </div>
      </section>

      {/* CTA */}
      <section className={`py-14 ${BG_ACCENT} text-center`}>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
          Need Installation Right Away?
        </h2>
        <p className="text-[#c7e5b5] mb-6 px-4 max-w-2xl mx-auto">
          Skip the message and head straight to booking.
        </p>

        <Link
          href="/site/services"
          className="inline-block px-10 py-4 bg-white text-[#8ed26b] font-bold rounded-full hover:bg-teal-50 shadow-lg"
        >
          Book a Service Now →
        </Link>
      </section>
    </div>
  );
}
