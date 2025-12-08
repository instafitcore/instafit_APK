"use client";

import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

// --- Types ---
type ToastVariant = "success" | "destructive" | "default" | "info";

type ToastProps = {
  id: number;
  title: string;
  description?: string;
  variant?: ToastVariant;
};

type ToastContextType = {
  toast: (toast: Omit<ToastProps, "id">) => void;
};

// --- Context ---
const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- Component: ToastItem (for better separation) ---
const ToastItem: React.FC<ToastProps & { onClose: (id: number) => void }> = ({
  id,
  title,
  description,
  variant = "default",
  onClose,
}) => {
  const getVariantStyles = (v: ToastVariant) => {
    switch (v) {
      case "success":
        // Using a similar vibrant green for consistency with the new default color
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          border: "border-green-600",
        };
      case "destructive":
        return {
          icon: <AlertCircle className="w-5 h-5 text-red-500" />,
          border: "border-red-500",
        };
      case "info":
        return {
          icon: <Info className="w-5 h-5 text-blue-500" />,
          border: "border-blue-500",
        };
      case "default":
      default:
        // --- MODIFIED DEFAULT STYLES: USING #8ed26b ---
        // Since Tailwind doesn't have a direct class for this custom hex,
        // we'll approximate the shades and use a utility class if you have one,
        // or stick to a predefined Tailwind green that is close for demonstration.
        // If you define `bg-custom-green`, `text-custom-green`, etc., in your
        // Tailwind config, you can use those.
        // For standard Tailwind, I'll use `green-400` which is a suitable light green.
        // For the absolute custom color, you might need inline styles or custom config.
        
        // Let's use Tailwind's custom inline style feature for the exact color for the border:
        return {
          icon: <Info className="w-5 h-5" style={{ color: "#8ed26b" }} />,
          border: "border-l-4", // We'll add the custom border color inline below
          customBorderColor: "#8ed26b",
        };
    }
  };

  const { icon, border, customBorderColor } = getVariantStyles(variant);
  
  // Custom styles for the border if a custom color is specified
  const borderStyle = customBorderColor ? { borderLeftColor: customBorderColor } : {};

  return (
    <div
      key={id}
      className={`flex items-start gap-3 p-4 bg-white ${border} rounded-lg shadow-2xl max-w-xs w-full
        transform transition-all duration-500 ease-out animate-slide-in-right opacity-100`}
      style={{ ...borderStyle }} // Apply custom border color here
    >
      {/* Icon Section */}
      <div className="mt-1 flex-shrink-0">
        {icon}
      </div>

      {/* Content Section */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{title}</p>
        {description && (
          <p className="text-sm text-gray-600 mt-0.5 whitespace-normal">{description}</p>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onClose(id)}
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

// --- Provider Component ---
export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((toast: Omit<ToastProps, "id">) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, ...toast }]);

    setTimeout(() => {
      removeToast(id);
    }, 3000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      <div className="fixed bottom-5 right-5 flex flex-col gap-3 z-[9999]">
        {toasts.map(t => (
          <ToastItem key={t.id} {...t} onClose={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// --- Hook: useToast ---
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};