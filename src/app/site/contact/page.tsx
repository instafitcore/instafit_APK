"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Mail, Phone, MapPin, Send, Star, LucideIcon } from "lucide-react";
import { supabase } from "@/lib/supabase-client";

// --- ContactInfoCard Props ---
type ContactInfoCardProps = {
  icon: LucideIcon;
  title: string;
  content: string | React.ReactNode;
  link?: string;
};

const ContactInfoCard: React.FC<ContactInfoCardProps> = ({ icon: Icon, title, content, link }) => (
 <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-lg transition">
  <div className="p-3 rounded-full bg-instafitcore-green/20 text-instafitcore-green flex items-center justify-center">
    <Icon className="w-6 h-6" />
  </div>
  <div className="flex-1">
    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
    <p className="text-gray-600 mt-1">
      {link ? (
        <a href={link} className="text-instafitcore-green font-medium hover:underline">
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [testimonialName, setTestimonialName] = useState("");
  const [testimonialMessage, setTestimonialMessage] = useState("");
  const [rating, setRating] = useState(0);

  const [success, setSuccess] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/send-enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setName(""); setEmail(""); setMessage("");
        setTimeout(() => setSuccess(false), 5000);
      } else {
        alert("Failed to send message. Try again later.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong!");
    } finally { setLoading(false); }
  };

  const handleTestimonialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { alert("Please select a rating"); return; }
    const { error } = await supabase.from("testimonials").insert([
      { name: testimonialName, message: testimonialMessage, rating },
    ]);
    if (error) { alert("Failed to submit review."); console.error(error); return; }
    setTestSuccess(true);
    setTestimonialName(""); setTestimonialMessage(""); setRating(0);
    setTimeout(() => setTestSuccess(false), 4500);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <section className="relative h-48 sm:h-56 md:h-64 bg-instafitcore-green flex items-center justify-center text-center px-4">
        <div className="max-w-2xl">
          <p className="text-white text-sm sm:text-base md:text-lg font-semibold uppercase tracking-wide mb-2">
            Ready to Connect?
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white leading-snug">
            Let's Talk
          </h1>
        </div>
      </section>


      {/* MAIN CONTENT */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12">
          {/* CONTACT INFO */}
          <div className="space-y-6 md:space-y-8">
            <h2 className="text-2xl md:text-3xl font-bold text-instafitcore-green">Contact Details</h2>
            <p className="text-gray-700">
              Need immediate assistance? Reach us through any of the channels below.
            </p>
            <div className="space-y-4">
              <ContactInfoCard
                icon={Phone}
                title="Customer Support"
                content="customersupport@instafitcore.com"
                link="mailto:customersupport@instafitcore.com"
              />
              <ContactInfoCard
                icon={Mail}
                title="Grievance"
                content="Feedback@instafitcore.com"
                link="mailto:Feedback@instafitcore.com"
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

          {/* ENQUIRY FORM */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-lg border border-gray-100">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4 md:mb-6">Send an Enquiry</h2>
            {success && (
              <div className="mb-4 md:mb-6 p-4 bg-green-100 text-green-700 font-medium rounded-lg border border-green-200">
                🥳 Your message has been sent successfully!
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
              <input
                type="text"
                placeholder="Full Name"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-instafitcore-green focus:border-instafitcore-green"
              />
              <input
                type="email"
                placeholder="Email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-instafitcore-green focus:border-instafitcore-green"
              />
              <textarea
                rows={5}
                placeholder="Your Message"
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-instafitcore-green focus:border-instafitcore-green"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-3 bg-instafitcore-green text-white font-semibold py-3 rounded-xl hover:bg-instafitcore-green-hover transition"
              >
                {loading ? "Sending..." : <><Send className="w-5" /> <span>Send Message</span></>}
              </button>
            </form>
          </div>
        </div>

        {/* MAP */}
        <div className="max-w-7xl mx-auto mt-8 md:mt-16 px-4">
          <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">Our Location</h3>
          <div className="w-full h-64 md:h-72 rounded-2xl md:rounded-3xl overflow-hidden shadow-md border border-gray-200">
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
        <div className="max-w-4xl mx-auto mt-8 md:mt-16 px-4 bg-white p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-lg border border-gray-100">
          <h3 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-gray-900">Share Your Experience</h3>
          {testSuccess && (
            <div className="p-4 mb-4 bg-green-100 text-green-700 font-medium rounded-lg border border-green-200">
              Thank you for your valuable feedback!
            </div>
          )}
          <form onSubmit={handleTestimonialSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              required
              value={testimonialName}
              onChange={(e) => setTestimonialName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-instafitcore-green"
            />
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={28}
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
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-instafitcore-green"
            />
            <button
              type="submit"
              className="w-full py-3 rounded-xl text-white font-semibold bg-instafitcore-green hover:bg-instafitcore-green-hover transition"
            >
              Submit Review
            </button>
          </form>
        </div>
      </section>

      {/* CTA */}
      <section className="py-8 md:py-14 bg-instafitcore-green text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-3">
            Need Services Right Away?
          </h2>
          <p className="text-white/90 sm:text-lg md:text-xl mb-4 md:mb-6">
            Skip the message and head straight to booking.
          </p>
          <Link
            href="/site/services"
            className="inline-block px-6 sm:px-8 py-3 sm:py-4 bg-white text-instafitcore-green font-bold rounded-full hover:bg-teal-50 shadow-md transition"
          >
            Book a Service Now →
          </Link>
        </div>
      </section>

    </div>
  );
}