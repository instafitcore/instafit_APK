"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, List, Folder, Layers, LogOut, MessageSquare } from "lucide-react";
import { ClipboardCheck } from "lucide-react";
import { MessageCircle } from "lucide-react";
export default function AdminSidebar() {
  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", path: "/admin", icon: <LayoutDashboard size={20} /> },

    {
      name: "Listing",
      icon: <List size={20} />,
      children: [
        { name: "Category", path: "/admin/listing/category", icon: <Folder size={18} /> },
        { name: "Subcategory", path: "/admin/listing/subcategory", icon: <Folder size={18} /> },
        { name: "Service", path: "/admin/listing/service", icon: <Layers size={18} /> },
      ],
    },

    { name: "Bookings", path: "/admin/bookings", icon: <ClipboardCheck size={20} /> },

    { name: "Reviews", path: "/admin/reviews", icon: <MessageCircle size={20} /> },];

  const renderMenu = (items: any[]) =>
    items.map((item) => (
      <div key={item.name}>
        {!item.children ? (
          <Link
            href={item.path!}
            className={`
              flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium
              transition-all
              ${pathname === item.path
                ? "bg-white text-gray-900 shadow-lg"
                : "hover:bg-gray-700 hover:translate-x-1"
              }
            `}
          >
            {item.icon}
            {item.name}
          </Link>
        ) : (
          <>
            <div className="flex items-center gap-3 px-5 py-2 text-gray-300 font-semibold text-sm mb-1">
              {item.icon}
              {item.name}
            </div>

            <div className="ml-6 flex flex-col gap-2">
              {item.children.map((sub) => (
                <Link
                  key={sub.path}
                  href={sub.path}
                  className={`
                    flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all
                    ${pathname === sub.path
                      ? "bg-gray-200 text-gray-900 shadow-sm"
                      : "text-gray-300 hover:bg-gray-700 hover:translate-x-1"
                    }
                  `}
                >
                  {sub.icon}
                  {sub.name}
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    ));

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white p-6 flex flex-col shadow-2xl h-screen sticky top-0">

      <div className="mb-10 flex justify-center">
        <img src="/insta.png" alt="Instafit Core" className="w-50 h-20 shadow-md" />
      </div>

      <h2 className="text-2xl font-bold tracking-wide mb-6 text-center text-white">Admin Panel</h2>

      <nav className="flex flex-col gap-3 border-t border-gray-700 pt-4">
        {renderMenu(menu)}
      </nav>

      <button
        onClick={() => {
          document.cookie = "admin_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
          window.location.href = "/login";
        }}
        className="mt-auto bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg"
      >
        <LogOut size={18} />
        Logout
      </button>
    </aside>
  );
}
