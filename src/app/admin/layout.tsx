"use client";

import AdminSidebar from "@/components/AdminSidebar";
import { AdminToastProvider } from "@/components/AdminToast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-gray-100">

      <AdminSidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 px-6 py-4">
<AdminToastProvider>{children}</AdminToastProvider>
      </main>

    </div>
  );
}
