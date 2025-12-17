"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";

export default function B2BServiceRequirementPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

 const initialForm = {
  flat_no: "",
  floor: "",
  building_name: "",
  street: "",
  area: "",
  landmark: "",
  city: "",
  state: "",
  pincode: "",
};


  const [form, setForm] = useState<any>(initialForm);

  // Helper: get tomorrow's date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("b2b_service_requirement_requests")
      .insert([form]);

    setLoading(false);

    if (error) {
      toast({
        title: "❌ Submission Failed",
        description: "Error submitting B2B request",
        variant: "destructive",
      });
      console.error(error);
    } else {
      toast({
        title: "Request Submitted",
        description: "B2B service requirement submitted successfully",
        variant: "success",
      });
      setForm(initialForm);
    }
  };

  return (
    <section className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-2">
        B2B Service Requirement Request
      </h1>
      <p className="text-gray-500 mb-8">
        For Brands, Retailers, Corporates & Enterprises
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* COMPANY DETAILS */}
        <Section title="Company Details">
          <Field label="Company / Brand Name" required>
            <input
              name="company_name"
              required
              className="input"
              onChange={handleChange}
              value={form.company_name}
            />
          </Field>

          <Field label="Contact Person Name" required>
            <input
              name="contact_person_name"
              required
              className="input"
              onChange={handleChange}
              value={form.contact_person_name}
            />
          </Field>

          <Field label="Mobile Number" required>
            <input
              name="mobile_number"
              required
              className="input"
              onChange={handleChange}
              value={form.mobile_number}
            />
          </Field>

          <Field label="Official Email ID">
            <input
              type="email"
              name="official_email"
              className="input"
              onChange={handleChange}
              value={form.official_email}
            />
          </Field>
        </Section>

        {/* ADDRESS DETAILS */}
       {/* ADDRESS DETAILS */}
<Section title="Address Details">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <Field label="Flat / House / Plot No" required>
      <input
        name="flat_no"
        required
        value={form.flat_no}
        onChange={handleChange}
        className="input"
      />
    </Field>

    <Field label="Floor" required>
      <input
        name="floor"
        required
        value={form.floor}
        onChange={handleChange}
        className="input"
      />
    </Field>

    <Field label="Building / Apartment Name" required>
      <input
        name="building_name"
        required
        value={form.building_name}
        onChange={handleChange}
        className="input"
      />
    </Field>

    <Field label="Street / Locality" required>
      <input
        name="street"
        required
        value={form.street}
        onChange={handleChange}
        className="input"
      />
    </Field>

    <Field label="Area / Zone" required>
      <input
        name="area"
        required
        value={form.area}
        onChange={handleChange}
        className="input"
      />
    </Field>

    <Field label="Landmark (Optional)">
      <input
        name="landmark"
        value={form.landmark}
        onChange={handleChange}
        className="input"
      />
    </Field>

    <Field label="City / Town" required>
      <input
        name="city"
        required
        value={form.city}
        onChange={handleChange}
        className="input"
      />
    </Field>

    <Field label="State" required>
      <input
        name="state"
        required
        value={form.state}
        onChange={handleChange}
        className="input"
      />
    </Field>

    <Field label="Pincode" required>
      <input
        name="pincode"
        required
        value={form.pincode}
        onChange={handleChange}
        className="input"
      />
    </Field>
  </div>
</Section>


        {/* SERVICE DETAILS */}
        <Section title="Service Details">
          <Field label="Service Location / Coverage Area" required>
            <input
              name="service_coverage_area"
              placeholder="City, multiple locations, PAN-India, etc."
              required
              className="input"
              onChange={handleChange}
              value={form.service_coverage_area}
            />
          </Field>

          <Field label="Type of Business">
            <input
              name="business_type"
              placeholder="Retail brand, furniture brand, builder, corporate office, warehouse, etc."
              className="input"
              onChange={handleChange}
              value={form.business_type}
            />
          </Field>

          <Field label="Service Requirement Description" required>
            <textarea
              name="service_requirement_description"
              required
              className="input h-24"
              onChange={handleChange}
              value={form.service_requirement_description}
            />
          </Field>

          <Field label="Volume / Scale of Work">
            <textarea
              name="volume_scale_of_work"
              placeholder="Number of orders, stores, locations, or monthly volume"
              className="input h-20"
              onChange={handleChange}
              value={form.volume_scale_of_work}
            />
          </Field>

          <Field label="Furniture / Product Details">
            <textarea
              name="furniture_product_details"
              placeholder="Beds, wardrobes, sofas, modular units, etc."
              className="input h-20"
              onChange={handleChange}
              value={form.furniture_product_details}
            />
          </Field>

          {/* Preferred Service Date */}
          <Field label="Preferred Service Date">
            <input
              type="date"
              name="preferred_service_date"
              className="input"
              onChange={handleChange}
              value={form.preferred_service_date}
              min={getTomorrowDate()} // restrict from tomorrow
            />
          </Field>
        </Section>

        {/* NOTES */}
        <Section title="Additional Notes">
          <textarea
            name="additional_notes"
            className="input h-20"
            onChange={handleChange}
            value={form.additional_notes}
          />
        </Section>

        <button
          disabled={loading}
          className="w-full bg-[#8ed26b] hover:bg-green-600 text-white py-3 rounded-xl font-semibold"
        >
          {loading ? "Submitting..." : "Submit B2B Requirement"}
        </button>
      </form>
    </section>
  );
}

/* COMPONENTS */
const Section = ({ title, children }: any) => (
  <div className="space-y-4">
    <h2 className="text-[#8ed26b] text-lg md:text-xl font-bold border-l-4 border-[#8ed26b] pl-3 mb-4">{title}</h2>
    <div className="space-y-4">{children}</div>
  </div>
);

const Field = ({ label, required, children }: any) => (
  <div className="flex flex-col gap-1">
    <label className="text-gray-700 font-medium text-sm">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
  </div>
);

/* INPUT STYLES */
const input = `input w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8ed26b] focus:border-[#8ed26b] transition-all`;
