"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast"; // Import your toast hook

export default function CustomizedModularKitchenPage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast(); // Initialize toast

  const initialForm = {
    full_name: "",
    mobile_number: "",
    email: "",
    flat_no: "",
    floor: "",
    building_name: "",
    street: "",
    area: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    kitchen_layout_description: "",
    kitchen_space_size_details: "",
    property_type_status: "",
    material_finish_preference: "",
    storage_design_expectations: "",
    appliances_to_be_integrated: "",
    expected_timeline: "",
    budget_expectation: "",
    site_visit_required: false,
    site_visit_date: "",
    additional_notes: "",
  };

  const [form, setForm] = useState<any>(initialForm);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("customized_modular_kitchen_requests")
      .insert([{ ...form, budget_expectation: Number(form.budget_expectation) }]);

    setLoading(false);

    if (error) {
      console.error(error);
      toast({
        title: "❌ Error submitting request",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Kitchen consultation request submitted",
        variant: "success",
      });
      setForm(initialForm);
    }
  };

  // Minimum date = tomorrow
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  return (
    <section className="max-w-5xl mx-auto px-6 py-12 bg-gray-50">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Customized Modular Kitchen
        </h1>
        <p className="text-gray-600 mt-2">
          Request a consultation and our experts will reach out to you.
        </p>
      </div>

      <form className="space-y-10 bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100" onSubmit={handleSubmit}>
        {/* CUSTOMER DETAILS */}
        <Section title="Customer Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input name="full_name" required className="input" value={form.full_name} onChange={handleChange} />
            </Field>

            <Field label="Mobile Number" required>
              <input name="mobile_number" required className="input" value={form.mobile_number} onChange={handleChange} />
            </Field>

            <Field label="Email ID" required>
              <input type="email" name="email" required className="input" value={form.email} onChange={handleChange} />
            </Field>
          </div>
        </Section>

        {/* ADDRESS DETAILS */}
        <Section title="Address Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Flat / House / Plot No" required>
              <input name="flat_no" required className="input" value={form.flat_no} onChange={handleChange} />
            </Field>

            <Field label="Floor" required>
              <input name="floor" required className="input" value={form.floor} onChange={handleChange} />
            </Field>

            <Field label="Building / Apartment Name" required>
              <input name="building_name" required className="input" value={form.building_name} onChange={handleChange} />
            </Field>

            <Field label="Street / Locality" required>
              <input name="street" required className="input" value={form.street} onChange={handleChange} />
            </Field>

            <Field label="Area / Zone" required>
              <input name="area" required className="input" value={form.area} onChange={handleChange} />
            </Field>

            <Field label="Landmark (Optional)">
              <input name="landmark" className="input" value={form.landmark} onChange={handleChange} />
            </Field>

            <Field label="City / Town" required>
              <input name="city" required className="input" value={form.city} onChange={handleChange} />
            </Field>

            <Field label="State" required>
              <input name="state" required className="input" value={form.state} onChange={handleChange} />
            </Field>

            <Field label="Pincode" required>
              <input name="pincode" required className="input" value={form.pincode} onChange={handleChange} />
            </Field>
          </div>
        </Section>

        {/* KITCHEN DETAILS */}
        <Section title="Kitchen Details">
          <Field label="Kitchen Layout / Shape Description">
            <textarea name="kitchen_layout_description" className="input h-24" value={form.kitchen_layout_description} onChange={handleChange} />
          </Field>

          <Field label="Kitchen Space / Size Details">
            <textarea name="kitchen_space_size_details" className="input h-20" value={form.kitchen_space_size_details} onChange={handleChange} />
          </Field>

          <Field label="Property Type & Status" required>
            <input name="property_type_status" required className="input" value={form.property_type_status} onChange={handleChange} />
          </Field>

          <Field label="Material & Finish Preference">
            <input name="material_finish_preference" className="input" value={form.material_finish_preference} onChange={handleChange} />
          </Field>

          <Field label="Storage & Design Expectations">
            <textarea name="storage_design_expectations" className="input h-20" value={form.storage_design_expectations} onChange={handleChange} />
          </Field>

          <Field label="Appliances to be Integrated">
            <input name="appliances_to_be_integrated" className="input" value={form.appliances_to_be_integrated} onChange={handleChange} />
          </Field>
        </Section>

        {/* TIMELINE & BUDGET */}
        <Section title="Timeline & Budget">
          <Field label="Expected Timeline" required>
            <input name="expected_timeline" required className="input" value={form.expected_timeline} onChange={handleChange} />
          </Field>

          <Field label="Budget Expectation" required>
            <input type="number" name="budget_expectation" required className="input" value={form.budget_expectation} onChange={handleChange} />
          </Field>
        </Section>

        {/* SITE VISIT */}
        <Section title="Site Visit">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" name="site_visit_required" className="accent-[#8ed26b]" checked={form.site_visit_required} onChange={handleChange} />
            Site Visit Required
          </label>

          <Field label="Preferred Site Visit Date">
            <input
              type="date"
              name="site_visit_date"
              className="input"
              value={form.site_visit_date}
              onChange={handleChange}
              min={tomorrow} // Restrict to tomorrow onwards
            />
          </Field>
        </Section>

        {/* NOTES */}
        <Section title="Additional Notes">
          <textarea name="additional_notes" className="input h-20" value={form.additional_notes} onChange={handleChange} />
        </Section>

        <button
          disabled={loading}
          className="w-full py-3 bg-[#8ed26b] text-white font-semibold rounded-xl shadow-md hover:bg-green-600 transition-all duration-300"
        >
          {loading ? "Submitting..." : "Request Modular Kitchen Consultation"}
        </button>
      </form>
    </section>
  );
}

/* ================= REUSABLE COMPONENTS ================= */
const Section = ({ title, children }: any) => (
  <div className="space-y-4">
    <h2 className="text-[#8ed26b] text-lg md:text-xl font-bold border-l-4 border-[#8ed26b] pl-3 mb-4">
      {title}
    </h2>
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

/* ================= INPUT STYLES ================= */
const input = `input w-full border border-gray-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#8ed26b] focus:border-[#8ed26b] transition-all`;
