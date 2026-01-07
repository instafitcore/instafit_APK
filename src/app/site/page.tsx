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
// Define TypeScript interfaces for data structures used in the component
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

type Subcategory = {
  id: number;
  category: string;
  subcategory: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
  is_active: boolean;
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

// NEW: Testimonial Type (Matches Supabase Schema)
type TestimonialItem = {
  id: number;
  name: string;
  rating: number; // 1 to 5
  message: string;
  created_at: string;
  // We will use a default avatar or a generic title since those fields aren't in the new schema
};
// ====================================================================
// 2. STATIC DATA
// ====================================================================
// Static data arrays for slides, why choose us items, and FAQ items
const SLIDES_DATA: Slide[] = [
  {
    id: 1,
    img: "/pi.jpg",
    title: "What We Offer",
    subtitle: "Trusted, professional services designed for your convenience.",
    cta: { text: "Services", href: "/site/services" },
  },
  {
    id: 2,
    img: "/pi2.jpg",
    title: "Who We Are",
    subtitle: "Driven by expertise, guided by strong values, and committed to excellence.",
    cta: { text: "About Us", href: "/site/about" },
  },
  {
    id: 3,
    img: "/banner4.jpg",
    title: "Get in Touch",
    subtitle: "Reach out to us for service bookings, support, or general inquiries.",
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
  {
    iconSrc: "/end.png",
    alt: "End-to-End Service",
    title: "End-to-End Service",
    description:
      "From booking to completion, we manage everything so you don’t have to worry.",
  },
];

const FAQ_DATA: FAQItem[] = [
  {
    question: "How do I book an installation service?",
    answer:
      "You can book directly through our 'Services' page. Simply select the type of service (e.g., Installation), find your furniture type, and follow the steps to schedule a time and location.",
  },
  {
    question: "What areas do your services cover?",
    answer:
      "We currently cover all major metropolitan areas and surrounding suburbs. Please enter your zip code during the booking process to confirm service availability in your specific location.",
  },
  {
    question: "Are your technicians certified?",
    answer:
      "Yes, all our technicians are fully certified, trained, and insured. They specialize in a wide range of furniture assembly and home repair tasks, ensuring high-quality results every time.",
  },
  {
    question: "Do you provide warranty or service guarantee?",
    answer:
      "Yes, we ensure service quality and customer satisfaction. Any service-related concerns can be raised with our support team for quick resolution.",
  },
  {
    question: "How do I cancel or reschedule?",
    answer:
      "You can cancel or reschedule your booking by contacting our support team at least 2 hours before the scheduled service time.",
  },
];


// ====================================================================
// 3. SUBCATEGORY CARD SUB-COMPONENT (Inline)
// ====================================================================
// Component to render individual subcategory cards with image, title, category, and description
const SubcategoryCard: React.FC<{ subcategory: Subcategory }> = ({ subcategory }) => {
  // Placeholder component for when no image is available
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
   <div
  className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-[1.03] flex flex-col h-full"
>
  <div className="relative h-48 w-full bg-gray-200">
    {subcategory.image_url ? (
      <Image
        src={subcategory.image_url}
        alt={subcategory.subcategory}
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
      {subcategory.subcategory}
    </h3>

    <p className="text-xs text-green-600 font-medium mt-1 uppercase">
      {subcategory.category}
    </p>

    <p className="text-sm text-gray-500 mt-0 line-clamp-2">
      {subcategory.description || "No description available"}
    </p>
  </div>
</div>

  );
};

// ====================================================================
// 4. WHY CHOOSE US CARD SUB-COMPONENT (Inline)
// ====================================================================
// Component to render individual "Why Choose Us" cards with icon, title, and description
const WhyChooseUsCard: React.FC<WhyChooseUsItem> = ({
  iconSrc,
  alt,
  title,
  description,
}) => (
  <div className="bg-white rounded-3xl shadow-xl p-8 text-center transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl border-t-4 border-instafitcore-green">

    <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden bg-gradient-to-br from-instafitcore-green/20 to-instafitcore-green/50">
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
// Component for the hero carousel with auto-sliding, navigation, and indicators
const HeroCarousel: React.FC<{ slides: Slide[] }> = ({ slides }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideTimer = useRef<number | null>(null);

  // Function to start the auto-slide timer
  const startTimer = useCallback(() => {
    if (slideTimer.current) clearInterval(slideTimer.current);
    slideTimer.current = window.setInterval(() => {
      setCurrentSlide((s) => (s + 1) % slides.length);
    }, 5000);
  }, [slides.length]);

  // Effect to start timer on mount and clean up on unmount
  useEffect(() => {
    startTimer();
    return () => {
      if (slideTimer.current) clearInterval(slideTimer.current);
    };
  }, [startTimer]);

  // Function to go to a specific slide and reset timer
  const goToSlide = (i: number) => {
    startTimer(); // Reset timer on manual navigation
    setCurrentSlide(i);
  };

  // Function to navigate to next or previous slide
  const navigate = (direction: -1 | 1) => {
    const nextIndex = (currentSlide + direction + slides.length) % slides.length;
    goToSlide(nextIndex);
  };

  return (
    <section
      className="relative w-full h-[400px] sm:h-[500px] lg:h-[600px] overflow-hidden" // Improved height for mobile
      aria-live="polite"
    >
      {slides.map((slide, i) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ${currentSlide === i ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
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

          <div className="absolute z-20 left-6 md:left-20 top-1/2 -translate-y-1/2 max-w-lg text-left"> {/* Added text-left for better mobile stacking */}
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-2xl mb-2 sm:mb-4">
              {slide.title}
            </h1>
            <p className="text-md sm:text-lg md:text-xl text-white/90 drop-shadow-lg mb-4 sm:mb-6">
              {slide.subtitle}
            </p>
            <Link
              href={slide.cta.href}
              className="inline-block px-8 py-3 sm:px-10 sm:py-4 text-white font-semibold text-sm sm:text-base rounded-full shadow-xl transition-all duration-300 hover:scale-[1.03] bg-instafitcore-green hover:bg-instafitcore-green-hover"
            >
              {slide.cta.text}
            </Link>

          </div>
        </div>
      ))}

      {/* Slide Indicators */}
      <div className="absolute bottom-4 sm:bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-40">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => goToSlide(i)}
            className={`h-3 rounded-full transition-all ${currentSlide === i
              ? "w-8 sm:w-10 shadow-xl bg-instafitcore-green"
              : "w-3 opacity-70 bg-instafitcore-green/50"
              }`}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={currentSlide === i ? 'true' : 'false'}
          />

        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={() => navigate(-1)}
        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 rounded-full p-2 sm:p-3 transition-all backdrop-blur-sm"
        aria-label="Previous slide"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => navigate(1)}
        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 bg-black/30 hover:bg-black/50 rounded-full p-2 sm:p-3 transition-all backdrop-blur-sm"
        aria-label="Next slide"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </section>
  );
};

// ====================================================================
// 6. FAQ ACCORDION SUB-COMPONENT (Inline for interactivity)
// ====================================================================
// Component for the FAQ accordion with expandable questions and answers
const FAQAccordion: React.FC<{ items: FAQItem[] }> = ({ items }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Function to toggle the open state of an FAQ item
  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-12 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

        {/* LEFT SIDE IMAGE (Hidden on small screens to save space) */}
        <div className="md:flex justify-center hidden">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-100 w-full max-w-[500px] h-[500px] md:w-[600px] md:h-[600px]">
            <img
              src="/faq-img.png" // Replace with actual image
              alt="FAQ Illustration"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* RIGHT SIDE FAQ */}
        <div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 mb-3 sm:mb-4">
            Frequently Asked Questions
          </h2>

          <p className="text-gray-500 text-base sm:text-lg mb-8 sm:mb-10">
            Here are the answers to the most common questions our customers ask.
          </p>

          <div className="space-y-4 sm:space-y-5">
            {items.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <button
                  onClick={() => handleToggle(index)}
                  className="w-full flex justify-between items-center p-4 sm:p-6 text-left text-lg sm:text-xl font-semibold text-gray-800"
                >
                  {item.question}

                  <span
                    className={`transition-transform duration-300 ${openIndex === index ? "rotate-180" : ""
                      }`}
                  >
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </span>
                </button>

                {openIndex === index && (
                  <div className="px-4 sm:px-6 pb-4 sm:pb-6 text-gray-600 text-base sm:text-lg animate-fadeIn">
                    {item.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// ====================================================================
// 7. NEW: WHY INSTAFITCORE SECTION SUB-COMPONENT
// ====================================================================
// New section component for "Why InstaFitCore?" with image on left and text on right, no icons
const WhyInstaFitCoreSection: React.FC = () => (
  <section className="py-12 sm:py-20 bg-gradient-to-b from-white to-gray-50">
    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">

      {/* LEFT SIDE CONTENT */}
      <div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-800 mb-3 sm:mb-4">
          Why InstaFitCore?
        </h2>

        <p className="text-gray-500 text-base sm:text-lg mb-8 sm:mb-10">
          With <strong>InstaFitCore</strong>, managing your furniture and home service needs is simple, reliable, and hassle-free:        </p>

        <ul className="space-y-4 sm:space-y-5 text-gray-700 text-base sm:text-lg">
          <li className="flex items-start">
            <span className="text-green-600 mr-3">•</span>
            Book professional furniture installation, dismantling, and repair services with certified technicians
          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-3">•</span>
            Request customized modular furniture and modular kitchen solutions, designed to fit your space and lifestyle          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-3">•</span>
            Plan and manage relocations with trusted packers & movers, ensuring safe handling end to end          </li>
          <li className="flex items-start">
            <span className="text-green-600 mr-3">•</span>
            Track all your service requests in one place, with clear updates and transparency          </li>
        </ul>
      </div>

      {/* RIGHT SIDE IMAGE */}
      <div className="hidden md:flex justify-center">
        <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-100 w-full max-w-[420px] h-[380px]">
          <img
            src="/why-instafitcore-img.png"
            alt="Why InstaFitCore Illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

    </div>
  </section>
);


// ====================================================================
// 8. NEW: TESTIMONIAL SECTION SUB-COMPONENT (DYNAMIC)
// ====================================================================
// Component for star rating display
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = Array(5).fill(0).map((_, i) => (
    <svg
      key={i}
      className={`w-5 h-5 transition-colors duration-200 ${i < rating ? "text-yellow-400" : "text-gray-300"
        }`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.17c.969 0 1.371 1.24.588 1.81l-3.374 2.454a1 1 0 00-.364 1.118l1.287 3.968c.3.921-.755 1.688-1.54 1.118l-3.375-2.454a1 1 0 00-1.176 0l-3.375 2.454c-.784.57-1.838-.197-1.539-1.118l1.287-3.968a1 1 0 00-.364-1.118L2.091 9.394c-.783-.57-.381-1.81.588-1.81h4.17a1 1 0 00.95-.69l1.286-3.967z" />
    </svg>
  ));
  return <div className="flex justify-center mb-3">{stars}</div>;
};

// Component for individual testimonial cards
const TestimonialCard: React.FC<TestimonialItem> = ({ message, name, rating }) => (
  <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center text-center h-full">
    {/* Placeholder Avatar and Rating based on new schema */}
    <div className="w-16 h-16 sm:w-20 sm:h-20 relative mb-4">
      {/* Using a simple generic avatar icon */}
      <svg className="w-full h-full text-green-500 bg-green-100 rounded-full p-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" /></svg>
    </div>

    <StarRating rating={rating} />

    <blockquote className="text-gray-700 italic text-base flex-grow line-clamp-4">
      "{message}"
    </blockquote>
    <div className="mt-4 pt-4 border-t border-gray-100 w-full">
      <p className="font-bold text-gray-800 text-lg">{name}</p>
      <p className="text-sm text-green-600 mt-0">Happy Customer</p> {/* Generic title */}
    </div>
  </div>
);

// Main testimonial section component that fetches data from Supabase
const TestimonialSection: React.FC = () => {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Effect to fetch testimonials on component mount
  useEffect(() => {
    // Fetch logic as currently written
    const fetchTestimonials = async () => {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Testimonial fetch error:", error.message);
      } else {
        setTestimonials(data || []);
      }
      setLoading(false);
    };
    fetchTestimonials();
  }, []);

  // Show loading state while fetching
  if (loading) {
    // Simple loading state
    return <div className="text-center py-12 text-gray-500">Loading testimonials...</div>
  }

  // Don't render section if no testimonials
  if (testimonials.length === 0) {
    return null; // Don't render section if no data
  }

  // Render the testimonial section
  return (
    <section className="py-12 sm:py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-12 sm:mb-16">
          What Our Customers Say
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {testimonials.map((item) => (
            <TestimonialCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

// ====================================================================
// NEW: PROJECTS SLIDER COMPONENT (Horizontal Scroll)
// ====================================================================
const ProjectsSlider: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from("our_projects")
        .select("*")
        .order("created_at", { ascending: false });
      setProjects(data || []);
    };
    fetchProjects();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      // Scroll by one card width
      const scrollAmount = clientWidth > 768 ? 450 : 300; 
      const scrollTo = direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  if (projects.length === 0) return null;

  return (
    <section className="py-16 bg-white overflow-hidden">
      {/* CENTERED HEADER SECTION */}
      <div className="max-w-7xl mx-auto px-6 mb-12 text-center">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
          Our Latest Projects
        </h2>
        <p className="text-gray-500 mt-3 text-lg max-w-2xl mx-auto">
          See the transformations we've delivered for our clients.
        </p>
        
        {/* Centered Navigation Buttons */}
        <div className="flex justify-center gap-4 mt-8">
          <button 
            onClick={() => scroll("left")} 
            className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition shadow-sm bg-white"
            aria-label="Scroll left"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button 
            onClick={() => scroll("right")} 
            className="p-3 rounded-full border border-gray-200 hover:bg-gray-50 transition shadow-sm bg-white"
            aria-label="Scroll right"
          >
            <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* SCROLLABLE CONTAINER */}
      <div 
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto px-6 pb-10 no-scrollbar snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {projects.map((project) => (
          <div 
            key={project.id} 
            /* Same width for all cards */
            className="w-[300px] md:w-[450px] flex-shrink-0 snap-center group"
          >
            <div className="relative h-[300px] md:h-[400px] w-full rounded-[2rem] overflow-hidden shadow-lg bg-gray-100 border border-gray-100">
              
              {project.media_type === "video" ? (
                <video 
                  src={project.media_url} 
                  className="w-full h-full object-cover" 
                  autoPlay 
                  muted 
                  loop 
                  playsInline 
                />
              ) : (
                <Image 
                  src={project.media_url} 
                  alt={project.title} 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-700" 
                />
              )}

              {/* Overlay Text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-8">
                <p className="text-white/80 text-sm line-clamp-2 italic leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
// ====================================================================
// 9. MAIN HOME PAGE COMPONENT
// ====================================================================
// Main component for the home page, orchestrating all sections
export default function HomePage() {
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);

  const subScrollRef = useRef<HTMLDivElement>(null);

const scrollSub = (direction: "left" | "right") => {
  if (!subScrollRef.current) return;

  const scrollAmount = window.innerWidth >= 768 ? 320 : 240;

  subScrollRef.current.scrollBy({
    left: direction === "left" ? -scrollAmount : scrollAmount,
    behavior: "smooth",
  });
};

  // Fetch subcategories data on component mount
  useEffect(() => {
    const fetchSubcategories = async () => {
      // Changed limit to 4 as requested
      const { data, error } = await supabase
        .from("subcategories")
        .select("*")
        .eq("is_active", true)
        // Ordering by ID (or created_at) descending to get the "latest"
        .order("id", { ascending: false })
        .limit(15); // <<< LIMIT SET TO 4 as requested

      if (error) {
        console.error("Subcategory fetch error:", error.message);
      } else {
        // NOTE: A true "latest from each category" query is complex in SQL/Supabase.
        // This current logic gets the 4 absolute latest, which may or may not be from different categories.
        // For simple display, this fulfills the limit requirement.
        setSubcategories(data || []);
      }

      setLoading(false);
    };

    fetchSubcategories();
  }, []);

  // Show loading state while fetching subcategories
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-700 animate-pulse">Loading Services...</div>
      </div>
    );
  }

  // Main render return
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">

      {/* HERO CAROUSEL */}
      <HeroCarousel slides={SLIDES_DATA} />

      {/* --- WHY CHOOSE US --- */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-gray-800 mb-10 sm:mb-16">
            Why Choose Our Services?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">
            {WHY_CHOOSE_US_DATA.map((item, index) => (
              <WhyChooseUsCard key={index} {...item} />
            ))}
          </div>
        </div>
      </section>

      <hr className="max-w-6xl mx-auto border-gray-200" />

      {/* --- LATEST SUBCATEGORIES (Limited to 4) --- */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12">
            Explore Featured Subcategories
          </h2>

          {subcategories.length > 0 ? (
            // Grid layout set for 2 columns on small screens, 4 on large screens
           <div className="relative">
  {/* Scroll Buttons */}
  <button
    onClick={() => scrollSub("left")}
    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-3 rounded-full"
  >
    ◀
  </button>

  <button
    onClick={() => scrollSub("right")}
    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-20 bg-white shadow-lg p-3 rounded-full"
  >
    ▶
  </button>

  {/* Scroll Container */}
  <div
    ref={subScrollRef}
    className="flex gap-6 overflow-x-auto pb-6 px-2 snap-x snap-mandatory no-scrollbar"
  >
    {subcategories.map((sub) => (
      <div
        key={sub.id}
        className="w-[220px] sm:w-[260px] md:w-[300px] flex-shrink-0 snap-center"
      >
        <SubcategoryCard subcategory={sub} />
      </div>
    ))}
  </div>
</div>

          ) : (
            <p className="text-center text-gray-500 text-lg">No active subcategories found.</p>
          )}

          <div className="text-center mt-12">
            <Link
              href="/site/services"
              className="inline-block px-8 py-3 text-white font-bold rounded-full shadow-lg transition-all duration-300 hover:scale-105 bg-instafitcore-green hover:bg-instafitcore-green-hover"
            >
              View All Services
            </Link>

          </div>
        </div>
      </section>

      <hr className="max-w-6xl mx-auto border-gray-200" />

      {/* --- NEW: TESTIMONIALS SECTION (Dynamic from Supabase) --- */}
      <TestimonialSection />
      <hr className="max-w-6xl mx-auto border-gray-200" />
{/* --- NEW PROJECTS SLIDER SECTION --- */}
      <ProjectsSlider />

      <hr className="max-w-6xl mx-auto border-gray-200" />

      {/* --- CORE SERVICE TYPES (Installation, Dismantling, Repair) --- */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-800 mb-8 sm:mb-12">
            Core Service Offerings
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            {/* Installation */}
            <Link
              href="/site/services?typeId=1"
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white"
            >
              <div className="h-48 w-full relative">
                <Image
                  src="/installat.jpg" // Replace with actual image
                  alt="Furniture Installation"
                  fill
                  className="object-cover group-hover:scale-110 transition-all duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5 text-center">
                <h3 className="text-xl font-bold text-gray-800">Installation</h3>
                <p className="text-sm text-gray-500 mt-1">Professional assembly and installation of beds, wardrobes, sofas, cabinets, and more.</p>
              </div>
            </Link>

            {/* Dismantling */}
            <Link
              href="/site/services?typeId=2"
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white"
            >
              <div className="h-48 w-full relative">
                <Image
                  src="/dism.jpg" // Replace with actual image
                  alt="Furniture Dismantling"
                  fill
                  className="object-cover group-hover:scale-110 transition-all duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5 text-center">
                <h3 className="text-xl font-bold text-gray-800">Dismantling</h3>
                <p className="text-sm text-gray-500 mt-1">Safe and systematic dismantling of furniture for relocation, storage, or repairs.</p>
              </div>
            </Link>

            {/* Repair */}
            <Link
              href="/site/services?typeId=3"
              className="group relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-white"
            >
              <div className="h-48 w-full relative">
                <Image
                  src="/rep.jpeg" // Replace with actual image
                  alt="Furniture Repair"
                  fill
                  className="object-cover group-hover:scale-110 transition-all duration-300"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
              </div>
              <div className="p-5 text-center">
                <h3 className="text-xl font-bold text-gray-800">Repair</h3>
                <p className="text-sm text-gray-500 mt-1">Repair and restoration services to improve strength, functionality, and appearance.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <hr className="max-w-6xl mx-auto border-gray-200" />

      {/* --- PARTNERSHIP SECTION --- */}
      <section className="py-12 sm:py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-5xl mx-auto px-6 text-center">

          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
            Our Trusted Partners
          </h2>
          <p className="text-gray-600 text-base sm:text-lg mb-8 sm:mb-12 max-w-2xl mx-auto">
            We proudly collaborate with industry-leading companies to bring you reliable and high-quality services.
          </p>

          {/* Partner Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center">

            {/* SimplyLogistics */}
            <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 max-w-xs sm:max-w-sm w-full">
              <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200 shadow-inner overflow-hidden">
                <Image
                  src="/GETLOGO.png"
                  alt="Simply Logistics Logo"
                  width={160}
                  height={160}
                  className="object-contain p-4"
                />
              </div>
              <div className="mt-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Getsettax Consulting</h3>
                <p className="text-gray-500 mt-1">Accounting & Advisory</p>
                <span className="inline-block mt-4 bg-instafitcore-green/20 text-instafitcore-green text-sm font-semibold px-4 py-1.5 rounded-full border border-instafitcore-green">
                  Verified Partner
                </span>
              </div>
            </div>

            {/* Rakvih */}
            <div className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 p-6 sm:p-8 border border-gray-100 max-w-xs sm:max-w-sm w-full">
              <div className="w-32 h-32 sm:w-40 sm:h-40 mx-auto rounded-xl bg-gray-50 flex items-center justify-center border border-gray-200 shadow-inner overflow-hidden">
                <Image
                  src="/rakvih.jpeg"
                  alt="Rakvih Logo"
                  width={160}
                  height={160}
                  className="object-contain p-4"
                />
              </div>
              <div className="mt-6">
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800">Rakvih</h3>
                <p className="text-gray-500 mt-1">Digital and IT Solutions</p>
                <span className="inline-block mt-4 bg-instafitcore-green/20 text-instafitcore-green text-sm font-semibold px-4 py-1.5 rounded-full border border-instafitcore-green">
                  Verified Partner
                </span>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* --- NEW: WHY INSTAFITCORE SECTION --- */}
      <WhyInstaFitCoreSection />

      {/* --- FAQ SECTION --- */}
      <FAQAccordion items={FAQ_DATA} />

    </div>
  );
}