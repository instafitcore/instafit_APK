"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";


export type AddressFields = {
  customer_name: string;
  mobile: string;
  alternate_mobile: string;
  flat_no: string;
  floor: string;
  building_name: string;
  street: string;
  area_zone: string;
  landmark: string;
  city: string;
  state: string;
  pincode: string;
};

type SidebarChild = {
  label: string;
  path: string;
};

type SidebarItem = {
  label: string;
  icon?: React.ReactNode;
  path?: string;
  children?: SidebarChild[];
};

const sidebarItems: SidebarItem[] = [
  {
    label: "Dashboard",
    path: "/admin/dashboard",
  },
  {
    label: "Orders",
    children: [
      { label: "All Orders", path: "/admin/orders" },
      { label: "Pending", path: "/admin/orders/pending" },
      { label: "Completed", path: "/admin/orders/completed" },
    ],
  },
  {
    label: "Services",
    children: [
      { label: "All Services", path: "/admin/services" },
      { label: "Add Service", path: "/admin/services/add" },
    ],
  },
  {
    label: "Users",
    children: [
      { label: "Customers", path: "/admin/users/customers" },
      { label: "Admins", path: "/admin/users/admins" },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (label: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  return (
    <aside className="w-64 h-screen bg-white shadow-lg p-4 flex flex-col">
      <h2 className="text-xl font-bold mb-6 text-gray-800">Admin Panel</h2>

      <nav className="flex flex-col gap-2">
        {sidebarItems.map((item) => {
          const isActive =
            item.path && pathname.startsWith(item.path);

          return (
            <div key={item.label}>
              {/* Parent Item */}
              <div
                onClick={() => item.children && toggleMenu(item.label)}
                className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition 
                  ${isActive ? "bg-green-100 text-green-700" : "hover:bg-gray-100"}
                `}
              >
                <span className="font-medium">{item.label}</span>

                {item.children && (
                  openMenus[item.label] ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )
                )}
              </div>

              {/* Children */}
              {item.children && openMenus[item.label] && (
                <div className="ml-6 flex flex-col gap-2">
                  {item.children.map((sub: SidebarChild) => (
                    <Link
                      key={sub.path}
                      href={sub.path}
                      className={`text-sm p-2 rounded-lg transition 
                        ${
                          pathname === sub.path
                            ? "bg-green-200 text-green-800"
                            : "hover:bg-gray-100 text-gray-700"
                        }
                      `}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
