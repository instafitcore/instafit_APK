import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import { ToastProvider } from "@/components/Toast";

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
<div className="bg-gray-50 min-h-screen w-full">
  <div className="w-full">
    <Navbar />
    <main className="px-6 py-10">{children}</main>
    <FloatingWhatsApp />
    <Footer />
  </div>
</div>

    </ToastProvider>
  );
}
