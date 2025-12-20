import Image from "next/image";

const WHATSAPP_PHONE = '7411443233';
const PRESET_MESSAGE = 'Hello, I am interested in your services and would like more details.';
const whatsappLink = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(PRESET_MESSAGE)}`;

export default function FloatingWhatsApp() {
  return (
    <a 
      href={whatsappLink}
      target="_blank" 
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-2xl transition-transform duration-300 hover:scale-110 flex items-center justify-center cursor-pointer"
      aria-label="Chat with us on WhatsApp"
    >
      <Image 
        src="/whats.svg"
        alt="WhatsApp"
        width={50}
        height={50}
      />
    </a>
  );
}
