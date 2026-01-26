"use client";

import Image from "next/image";

const WHATSAPP_PHONE = "917411443233";
const PRESET_MESSAGE = `Hello,
I would like to enquire about your furniture services.
Please connect with me to discuss my requirements and advise on the next steps.
Thank you.`;

const whatsappLink = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(
  PRESET_MESSAGE
)}`;

export default function FloatingWhatsApp() {
  return (
    <a
      href={whatsappLink}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="
        fixed
        right-4
        bottom-[calc(env(safe-area-inset-bottom)+3.5rem)]
        md:bottom-8
        z-[9999]
        w-16
        h-16
        rounded-full
        bg-white/80
        backdrop-blur-md
        shadow-2xl
        flex
        items-center
        justify-center
        hover:scale-110
        transition-transform
        duration-300
      "
    >
      <Image
        src="/whats.svg"
        alt="WhatsApp"
        width={34}
        height={34}
        priority
      />
    </a>
  );
}
