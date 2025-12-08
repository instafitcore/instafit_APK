"use client";

import { createContext, useContext, ReactNode, useState } from "react";
import { X } from "lucide-react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: number;
  message: string;
  type: ToastType;
};

type ToastContextType = {
  addToast: (message: string, type?: ToastType) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useAdminToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useAdminToast must be used within ToastProvider");
  return context;
};

export const AdminToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (message: string, type: ToastType = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed top-5 right-5 flex flex-col gap-2 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`flex items-center justify-between gap-3 px-4 py-2 rounded-lg shadow-md text-white transition-all
              ${toast.type === "success" ? "bg-green-500" : ""}
              ${toast.type === "error" ? "bg-red-500" : ""}
              ${toast.type === "info" ? "bg-blue-500" : ""}
            `}
          >
            <span>{toast.message}</span>
            <button onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}>
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};
