"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
// Assuming you have a file named 'supabase-client.ts' in your lib directory
// with a configured Supabase client instance.
import { supabase } from "@/lib/supabase-client"; 

// ====================================================================
// 1. TYPE DEFINITIONS
// ====================================================================
type Category = {
  id: number;
  category: string;
  subcategory: string;
  image_url: string | null;
};

type Service = {
  id: number;
  service_name: string;
  category: string;
  subcategory: string;
  image_url: string | null;
  installation_price: number | null;
  dismantling_price: number | null;
  repair_price: number | null;
  created_at: string;
};

type Slide = {
  id: number;
  img: string;
  title: string;
  subtitle: string;
  cta: { text: string; href: string };
};

type WhyChooseUsItem = {
  iconSrc: string;
  alt: string;
  title: string;
  description: string;
};

type FAQItem = {
    question: string;
    answer: string;
};

// ====================================================================
// 2. STATIC DATA
// ====================================================================

const SLIDES_DATA: Slide[] = [
  {
    id: 1,
    img: "/pi.jpg",
    title: "Explore Ourr Services",
    subtitle: "Professional, Reliable, and Hassle-Free Solutions",
    cta: { text: "Services", href: "/site/services" },
  },
  {
    id: 2,
    img: "/pi2.jpg",
    title: "Learn About Us",
    subtitle: "Know More About Our Expertise and Values",
    cta: { text: "About Us", href: "/site/about" },
  },
  {
    id: 3,
    img: "/pic3.jpg",
    title: "Get in Touch",
    subtitle: "Contact Us for Any Queries or Bookings",
    cta: { text: "Contact Us", href: "/site/contact" },
  },
];

const WHY_CHOOSE_US_DATA: WhyChooseUsItem[] = [
  {
    iconSrc: "/expert-tech.png",
    alt: "Expert Technicians",
    title: "Expert Technicians",
    description:
      "Certified professionals with years of experience in furniture installation and home services.",
  },
  {
    iconSrc: "/quick-reliable.png",
    alt: "Quick & Reliable",
    title: "Quick & Reliable",
    description:
      "Fast booking and on-time service delivery to minimize your wait and maximize convenience.",
  },
  {
    iconSrc: "/customer-satisfaction.png",
    alt: "Customer Satisfaction",
    title: "Customer Satisfaction",
    description:
      "100% satisfaction guarantee with transparent pricing and excellent customer support.",
  },
];

const FAQ_DATA: FAQItem[] = [
    {
        question: "How do I book an installation service?",
        answer: "You can book directly through our 'Services' page. Simply select the type of service (e.g., Installation), find your furniture type, and follow the steps to schedule a time and location.",
    },
    {
        question: "What areas do your services cover?",
        answer: "We currently cover all major metropolitan areas and surrounding suburbs. Please enter your zip code during the booking process to confirm service availability in your specific location.",
    },
    {
        question: "Are your technicians certified?",
        answer: "Yes, all our technicians are fully certified, trained, and insured. They specialize in a wide range of furniture assembly and home repair tasks, ensuring high-quality results every time.",
    },
    {
        question: "What is your cancellation policy?",
        answer: "You can cancel or reschedule your service appointment up to 24 hours in advance without any fee. Cancellations made within 24 hours may incur a small charge.",
    },
];

const BRAND_COLOR = "#8ed26b";

// ====================================================================
// 3. SERVICE CARD SUB-COMPONENT (Inline)
// ====================================================================

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
  const NoImagePlaceholder: React.FC = () => (
    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 p-4">
      <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span className="text-xs">No Image Available</span>
    </div>
  );

  return (
    <Link
      href={`/site/service/${service.id}`}
      className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-[1.03] flex flex-col h-full"
    >
      <div className="relative h-48 w-full bg-gray-200">
        {service.image_url ? (
          <Image
            src={service.image_url}
            alt={service.service_name}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-300"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <NoImagePlaceholder />
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-bold text-gray-800 line-clamp-2 min-h-[3rem]">
          {service.service_name}
        </h3>

        <p className="text-xs text-green-600 font-medium mt-1 uppercase">
          {service.category}
        </p>
        <p className="text-sm text-gray-500 mt-0">
          {service.subcategory}
        </p>

        <div className="mt-auto pt-3 border-t border-gray-100">
          {service.installation_price && (
            <p className="text-md font-bold" style={{ color: BRAND_COLOR }}>
              Install From: {service.installation_price}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
};

// ====================================================================
// 4. WHY CHOOSE US CARD SUB-COMPONENT (Inline)
// ====================================================================

const WhyChooseUsCard: React.FC<WhyChooseUsItem> = ({
  iconSrc,
  alt,
  title,
  description,
}) => (
  <div
    className="bg-white rounded-3xl shadow-xl p-8 text-center transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl border-t-4 border-transparent hover:border-t-4"
    style={{ borderTopColor: BRAND_COLOR }}
  >
    <div
      className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden"
      style={{
        background: `linear-gradient(to bottom right, ${BRAND_COLOR}20, ${BRAND_COLOR}50)`,
      }}
    >
      <Image
        src={iconSrc}
        alt={alt}
        width={48}
        height={48}
        className="object-contain filter drop-shadow-md"
      />
    </div>
    <h3 className="text-xl font-semibold mb-3 text-gray-800">{title}</h3>
    <p className="text-gray-600 text-sm">{description}</p>
  </div>
);

// ====================================================================
// 5. HERO CAROUSEL SUB-COMPONENT (Inline)
// ====================================================================

const HeroCarousel: React.FC<{ slides: Slide[] }> = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideTimer = useRef<number | null>(null);

  const startTimer = useCallback(() => {
    if (slideTimer.current) clearInterval(slideTimer.current);
    slideTimer.current = window.setInterval(() => {
      setCurrentSlide((s) => (s + 1) % slides.length);
    }, 5000);
  }, [slides.length]);

  useEffect(() => {
    startTimer();
    return () => {
      if (slideTimer.current) clearInterval(slideTimer.current);
    };
  }, [startTimer]);

  const goToSlide = (i: number) => {
    startTimer(); // Reset timer on manual navigation
    setCurrentSlide(i);
  };

  const navigate = (direction: -1 | 1) => {
    const nextIndex = (currentSlide + direction + slides.length) % slides.length;
    goToSlide(nextIndex);
  };

  return (
    <section 
      className="relative w-full h-[600px] overflow-hidden" 
      aria-live="polite"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ${
            currentSlide === i ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
          aria-hidden={currentSlide !== i}
        >
          <Image 
            src={slide.img} 
            alt={`Hero slide: ${slide.title}`} 
            fill 
            className="object-cover" 
            priority={i === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent"></div>

          <div className="absolute z-20 left-8 md:left-20 top-1/2 -translate-y-1/2 max-w-lg">
            <h1 className="text-4xl md:text-6xl font-bold text-white drop-shadow-2xl mb-4">
              {slide.title}
            </h1>
            <p className="text-lg md:text-xl text-white/90 drop-shadow-lg mb-6">
              {slide.subtitle}
            </p>
            <Link
              href={slide.cta.href}
              className="inline-block px-10 py-4 text-white font-semibold rounded-full shadow-xl transition-all duration-300 hover:scale-[1.03]"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              {slide.cta.text}
            </Link>
          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-40">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`h-3 rounded-full transition-all ${
              currentSlide === i ? "w-10 shadow-xl" : "w-3 opacity-70"
            }`}
            style={{ backgroundColor: BRAND_COLOR }}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={currentSlide === i ? 'true' : 'false'}
          />
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => navigate(-1)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 rounded-full p-3 transition-all backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => navigate(1)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 rounded-full p-3 transition-all backdrop-blur-sm"
        aria-label="Next slide"
      >
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
};


// ====================================================================
// 6. FAQ ACCORDION SUB-COMPONENT (Inline for interactivity)
// ====================================================================

const FAQAccordion: React.FC<{ items: FAQItem[] }> = ({ items }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const handleToggle = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6">
                <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
                    Frequently Asked Questions
                </h2>
                
                <div className="max-w-3xl mx-auto space-y-4">
                    {items.map((item, index) => (
                        <div 
                            key={index} 
                            className="bg-white rounded-lg shadow-md border border-gray-100 overflow-hidden"
                        >
                            <button
                                onClick={() => handleToggle(index)}
                                className="w-full text-left flex justify-between items-center p-5 font-semibold text-lg text-gray-800 hover:bg-gray-50 transition-colors"
                                aria-expanded={openIndex === index}
                                aria-controls={`faq-answer-${index}`}
                            >
                                {item.question}
                                <svg 
                                    className={`w-5 h-5 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : 'rotate-0'}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M19 9l-7 7-7-7" 
                                    />
                                </svg>
                            </button>
                            {openIndex === index && (
                                <div 
                                    id={`faq-answer-${index}`}
                                    className="p-5 pt-0 text-gray-600 animate-fadeIn"
                                >
                                    <p>{item.answer}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};


// ====================================================================
// 7. MAIN HOME PAGE COMPONENT
// ====================================================================

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch services data
  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("id", { ascending: false })
        .limit(8);

      if (error) {
        console.error("Service fetch error:", error.message);
      } else {
        setServices(data || []);
      }

      setLoading(false);
    };

    fetchServices();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-700 animate-pulse">Loading Services...</div>
      </div>
    );
  }

  return (
    // min-h-screen and flex flex-col help ensure good vertical space utilization
    <div className="min-h-screen flex flex-col bg-gray-50">
      
      {/* HERO CAROUSEL */}
      <HeroCarousel slides={SLIDES_DATA} />

      {/* --- WHY CHOOSE US --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-extrabold text-center text-gray-800 mb-16">
            Why Choose Our Services?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {WHY_CHOOSE_US_DATA.map((item, index) => (
              <WhyChooseUsCard key={index} {...item} />
            ))}
          </div>
        </div>
      </section>

      <hr className="max-w-6xl mx-auto border-gray-200" />

      {/* --- LATEST SERVICES --- */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Latest Services
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((srv) => (
              <ServiceCard key={srv.id} service={srv} />
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/site/services"
              className="inline-block px-8 py-4 text-white font-semibold rounded-full hover:scale-105 transition-all duration-300 shadow-lg"
              style={{ backgroundColor: BRAND_COLOR }}
            >
              View All Services
            </Link>
          </div>
        </div>
      </section>

      <hr className="max-w-6xl mx-auto border-gray-200" />

      {/* --- PROMO BANNER --- */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="relative h-80 md:h-96 rounded-3xl overflow-hidden shadow-2xl">
            <Image
              src="/promo.jpg"
              alt="Promo Banner"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 90vw"
            />

            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-center px-6 py-12 text-white">
              <h3 className="text-3xl md:text-5xl font-extrabold mb-4">
                Limited Time Offer!
              </h3>
              <p className="text-lg md:text-2xl mb-6">
                Up to 30% off on select services. Don’t miss out!
              </p>
              <Link
                href="/site/services"
                className="inline-block px-10 py-4 text-white font-bold rounded-full shadow-lg hover:scale-105 transition-all duration-300"
                style={{ backgroundColor: BRAND_COLOR }}
              >
                Shop Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      <hr className="max-w-6xl mx-auto border-gray-200" />


      {/* --- CORE SERVICE TYPES (Installation, Dismantling, Repair) --- */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
            Core Service Offerings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {/* Installation */}
            <Link
              href="/site/services?type=Installation"
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white"
            >
              <div className="h-48 w-full relative">
                <Image
                  src="/install.jpg"
                  alt="Furniture Installation"
                  fill
                  className="object-cover group-hover:scale-110 transition-all duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5 text-center">
                <h3 className="text-xl font-bold text-gray-800">Installation</h3>
                <p className="text-sm text-gray-500 mt-1">Quick assembly and setup.</p>
              </div>
            </Link>

            {/* Dismantling */}
            <Link
              href="/site/services?type=Dismantling"
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white"
            >
              <div className="h-48 w-full relative">
                <Image
                  src="/dismantle.jpg"
                  alt="Furniture Dismantling"
                  fill
                  className="object-cover group-hover:scale-110 transition-all duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5 text-center">
                <h3 className="text-xl font-bold text-gray-800">Dismantling</h3>
                <p className="text-sm text-gray-500 mt-1">Safe and efficient disassembly.</p>
              </div>
            </Link>

            {/* Repair */}
            <Link
              href="/site/services?type=Repair"
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white"
            >
              <div className="h-48 w-full relative">
                <Image
                  src="/repair.jpg"
                  alt="Furniture Repair"
                  fill
                  className="object-cover group-hover:scale-110 transition-all duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5 text-center">
                <h3 className="text-xl font-bold text-gray-800">Repair</h3>
                <p className="text-sm text-gray-500 mt-1">Restoration and fixing services.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <hr className="max-w-6xl mx-auto border-gray-200" />


      {/* --- PARTNERSHIP SECTION --- */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
            Our Trusted Partner
          </h2>
          <p className="text-gray-600 mb-12">
            We are proud to collaborate with industry-leading companies to deliver exceptional services.
          </p>

          <div className="flex flex-col items-center justify-center gap-6 sm:flex-row sm:justify-center sm:gap-12">
            <div className="flex flex-col items-center gap-3">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden border-2 border-gray-200">
                <Image
                  src="/simplylogistics-logo.jpeg"
                  alt="Simply Logistics Logo"
                  width={128}
                  height={128}
                  className="object-contain p-4"
                />
              </div>
              <span className="font-semibold text-gray-800 text-lg">SimplyLogistics</span>
              <p className="text-sm text-gray-500">Logistics and Supply Chain</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- NEW FAQ SECTION (To fill vertical space) --- */}
      <FAQAccordion items={FAQ_DATA} />

    </div>
  );
}