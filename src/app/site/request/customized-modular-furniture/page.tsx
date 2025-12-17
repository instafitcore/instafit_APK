"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";

export default function CustomizedModularFurniturePage() {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const [form, setForm] = useState<any>({
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
    furniture_requirement_details: "",
    material_finish_preference: "",
    measurements_available: false,
    expected_timeline: "",
    approximate_budget_range: "",
    additional_notes: "",
  });

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    setForm({ ...form, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase
      .from("customized_modular_furniture_requests")
      .insert([form]);

    setLoading(false);

    if (error) {
      toast({
        title: "❌ Error",
        description: "Failed to submit request",
        variant: "destructive",
      });
      console.error(error);
    } else {
      toast({
        title: "Success submitted",
        description: "Request submitted successfully",
        variant: "success",
      });
      setForm({
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
        furniture_requirement_details: "",
        material_finish_preference: "",
        measurements_available: false,
        expected_timeline: "",
        approximate_budget_range: "",
        additional_notes: "",
      });
    }
  };

  return (
    <section className="max-w-5xl mx-auto px-6 py-12 bg-gray-50">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Customized Modular Furniture
        </h1>
        <p className="text-gray-600 mt-2">
          Submit your requirement and our team will contact you shortly.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-10 bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100"
      >
        {/* CUSTOMER DETAILS */}
        <Section title="Customer Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input
                name="full_name"
                required
                value={form.full_name}
                onChange={handleChange}
                className="input"
              />
            </Field>

            <Field label="Mobile Number" required>
              <input
                name="mobile_number"
                required
                value={form.mobile_number}
                onChange={handleChange}
                className="input"
              />
            </Field>

            <Field label="Email ID" required>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                className="input"
              />
            </Field>
          </div>
        </Section>

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

        {/* FURNITURE REQUIREMENT */}
        <Section title="Furniture Requirement">
          <Field label="Requirement Details" required>
            <textarea
              name="furniture_requirement_details"
              required
              value={form.furniture_requirement_details}
              onChange={handleChange}
              className="input h-24"
            />
          </Field>

          <Field label="Material / Finish Preference">
            <input
              name="material_finish_preference"
              value={form.material_finish_preference}
              onChange={handleChange}
              className="input"
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              name="measurements_available"
              checked={form.measurements_available}
              onChange={handleChange}
              className="accent-[#8ed26b]"
            />
            Measurements Available
          </label>

          <Field label="Expected Timeline (Select Date)" required>
            <input
              type="date"
              name="expected_timeline"
              required
              value={form.expected_timeline}
              onChange={handleChange}
              className="input"
              min={new Date().toISOString().split("T")[0]} // prevent past dates
            />
          </Field>

          <Field label="Approximate Budget Range" required>
            <input
              name="approximate_budget_range"
              required
              value={form.approximate_budget_range}
              onChange={handleChange}
              className="input"
            />
          </Field>

          <Field label="Additional Notes / Special Instructions">
            <textarea
              name="additional_notes"
              value={form.additional_notes}
              onChange={handleChange}
              className="input h-20"
            />
          </Field>
        </Section>

        <button
          disabled={loading}
          className="w-full py-3 bg-[#8ed26b] text-white font-semibold rounded-xl shadow-md hover:bg-green-600 transition-all duration-300"
        >
          {loading ? "Submitting..." : "Submit Requirement"}
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
