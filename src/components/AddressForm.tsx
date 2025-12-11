// AddressForm.tsx
import React from "react";
import {
    User,
    Phone,
    Home,
    MapPin,
    Building,
    AlertCircle,
} from "lucide-react";

export type AddressFields = {
    customer_name: string;
    mobile: string;
    alternate_mobile?: string;
    flat_no: string;
    floor?: string;
    building_name?: string;
    street: string;
    area_zone?: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
};

type Props = {
    fields: AddressFields;
    setFields: (f: AddressFields) => void;
    errors?: Partial<Record<keyof AddressFields, string>>;
    disabled?: boolean;
};

const PRIMARY_COLOR = "#8ED26B";
const ACCENT_COLOR = "#059669";

const inputClass = `w-full p-3 rounded-lg border-2 border-gray-200 focus:outline-none 
focus:ring-2 focus:border-transparent transition-all duration-200 
text-sm bg-gray-50 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed`;

const errorInputClass = `${inputClass} border-red-400 focus:ring-red-300`;

export default function AddressForm({ fields, setFields, errors = {}, disabled }: Props) {
    const onChange = (k: keyof AddressFields, v: string) =>
        setFields({ ...fields, [k]: v });

    const renderInput = (
        label: string,
        key: keyof AddressFields,
        icon: React.ReactNode,
        optional?: boolean,
        inputMode?: "text" | "numeric",
        maxLength?: number
    ) => (
        <label className="flex flex-col space-y-1">
            <span className="text-sm font-semibold text-gray-700 flex items-center">
                {icon}
                <span className="ml-2">{label}</span>
                {optional && (
                    <span className="ml-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        Optional
                    </span>
                )}
            </span>

            <input
                className={`${errors[key] ? errorInputClass : inputClass} 
                ${errors[key] ? "focus:ring-red-400" : "focus:ring-[#8ED26B]"}`}
                value={fields[key] || ""}
                onChange={(e) => onChange(key, e.target.value)}
                disabled={disabled}
                inputMode={inputMode}
                maxLength={maxLength}
                aria-label={label}
                aria-invalid={!!errors[key]}
            />

            {errors[key] && (
                <p className="text-xs text-red-600 mt-1 flex items-center animate-pulse">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors[key]}
                </p>
            )}
        </label>
    );

    return (
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 space-y-6">
            <h3 className="text-xl font-bold text-gray-800 flex items-center">
                <MapPin className="w-5 h-5 mr-2" style={{ color: PRIMARY_COLOR }} />
                Service Address
            </h3>

            {/* Contact Information */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">Contact Information</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderInput("Customer Full Name", "customer_name", <User className="w-4 h-4" style={{ color: ACCENT_COLOR }} />)}
                    {renderInput("Mobile Number", "mobile", <Phone className="w-4 h-4" style={{ color: ACCENT_COLOR }} />, false, "numeric", 10)}
                    {renderInput("Alternate Mobile", "alternate_mobile", <Phone className="w-4 h-4" style={{ color: ACCENT_COLOR }} />, true, "numeric", 10)}
                </div>
            </div>

            {/* Address Details */}
            <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-700 border-b pb-2">Address Details</h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {renderInput("Flat / House / Plot No", "flat_no", <Home className="w-4 h-4" style={{ color: ACCENT_COLOR }} />)}
                    {renderInput("Floor", "floor", <Building className="w-4 h-4" style={{ color: ACCENT_COLOR }} />, true)}
                    {renderInput("Building / Apartment Name", "building_name", <Building className="w-4 h-4" style={{ color: ACCENT_COLOR }} />, true)}
                    {renderInput("Street / Locality", "street", <MapPin className="w-4 h-4" style={{ color: ACCENT_COLOR }} />)}
                    {renderInput("Area / Zone", "area_zone", <MapPin className="w-4 h-4" style={{ color: ACCENT_COLOR }} />, true)}
                    {renderInput("Landmark", "landmark", <MapPin className="w-4 h-4" style={{ color: ACCENT_COLOR }} />, true)}
                    {renderInput("City / Town", "city", <MapPin className="w-4 h-4" style={{ color: ACCENT_COLOR }} />)}
                    {renderInput("State", "state", <MapPin className="w-4 h-4" style={{ color: ACCENT_COLOR }} />)}
                    {renderInput("Pincode", "pincode", <MapPin className="w-4 h-4" style={{ color: ACCENT_COLOR }} />, false, "numeric", 6)}
                </div>
            </div>
        </div>
    );
}
