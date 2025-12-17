"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { useToast } from "@/components/Toast";

export default function PackerAndMoversPage() {
  const [loading, setLoading] = useState(false);
const { toast } = useToast();

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
    move_from_address: "",
    move_to_address: "",
    property_details: "",
    moving_type_description: "",
    preferred_moving_date: "",
    items_details: "",
    services_required: "",
    special_handling_instructions: "",
    expected_completion_timeline: "",
    additional_notes: "",
  };

  const [form, setForm] = useState<any>(initialForm);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

 const handleSubmit = async (e: any) => {
  e.preventDefault();
  setLoading(true);

  const { error } = await supabase.from("packer_and_movers_requests").insert([form]);

  setLoading(false);

  if (error) {
    console.error(error);
    toast({
      title: "❌ Failed to submit request",
      description: error.message,
      variant: "destructive",
    });
  } else {
    toast({
      title: "Request submitted",
      variant: "success",
    });
    setForm(initialForm);
  }
};


  return (
    <section className="max-w-5xl mx-auto px-6 py-12 bg-gray-50">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800">
          Packers & Movers
        </h1>
        <p className="text-gray-600 mt-2">
          Submit your moving details and get a quote from our experts.
        </p>
      </div>

      <form
        className="space-y-10 bg-white p-8 md:p-12 rounded-2xl shadow-lg border border-gray-100"
        onSubmit={handleSubmit}
      >
        {/* CUSTOMER DETAILS */}
        <Section title="Customer Details">
          <Field label="Full Name" required>
            <input
              name="full_name"
              required
              className="input"
              value={form.full_name}
              onChange={handleChange}
            />
          </Field>

          <Field label="Mobile Number" required>
            <input
              name="mobile_number"
              required
              className="input"
              value={form.mobile_number}
              onChange={handleChange}
            />
          </Field>

          <Field label="Email ID" required>
            <input
              type="email"
              name="email"
              required
              className="input"
              value={form.email}
              onChange={handleChange}
            />
          </Field>
        </Section>

        {/* ADDRESS DETAILS */}
        <Section title="Address Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Flat / House / Plot No" required>
              <input
                name="flat_no"
                required
                className="input"
                value={form.flat_no}
                onChange={handleChange}
              />
            </Field>

            <Field label="Floor" required>
              <input
                name="floor"
                required
                className="input"
                value={form.floor}
                onChange={handleChange}
              />
            </Field>

            <Field label="Building / Apartment Name" required>
              <input
                name="building_name"
                required
                className="input"
                value={form.building_name}
                onChange={handleChange}
              />
            </Field>

            <Field label="Street / Locality" required>
              <input
                name="street"
                required
                className="input"
                value={form.street}
                onChange={handleChange}
              />
            </Field>

            <Field label="Area / Zone" required>
              <input
                name="area"
                required
                className="input"
                value={form.area}
                onChange={handleChange}
              />
            </Field>

            <Field label="Landmark (Optional)">
              <input
                name="landmark"
                className="input"
                value={form.landmark}
                onChange={handleChange}
              />
            </Field>

            <Field label="City / Town" required>
              <input
                name="city"
                required
                className="input"
                value={form.city}
                onChange={handleChange}
              />
            </Field>

            <Field label="State" required>
              <input
                name="state"
                required
                className="input"
                value={form.state}
                onChange={handleChange}
              />
            </Field>

            <Field label="Pincode" required>
              <input
                name="pincode"
                required
                className="input"
                value={form.pincode}
                onChange={handleChange}
              />
            </Field>
          </div>
        </Section>


        {/* MOVE DETAILS */}
        <Section title="Move Details">
          <Field label="Move From (Pickup Location)" required>
            <textarea
              name="move_from_address"
              required
              className="input h-20"
              value={form.move_from_address}
              onChange={handleChange}
            />
          </Field>

          <Field label="Move To (Drop Location)" required>
            <textarea
              name="move_to_address"
              required
              className="input h-20"
              value={form.move_to_address}
              onChange={handleChange}
            />
          </Field>

          <Field label="Property Details" required>
            <textarea
              name="property_details"
              required
              className="input h-20"
              value={form.property_details}
              onChange={handleChange}
            />
          </Field>

          <Field label="Moving Type Description" required>
            <textarea
              name="moving_type_description"
              required
              className="input h-20"
              value={form.moving_type_description}
              onChange={handleChange}
            />
          </Field>

         <Field label="Preferred Moving Date / Time">
  <input
    type="date"
    name="preferred_moving_date"
    className="input"
    value={form.preferred_moving_date}
    onChange={handleChange}
    min={new Date(Date.now() + 86400000).toISOString().split("T")[0]} // tomorrow's date
  />
</Field>


          <Field label="Items / Household Details" required>
            <textarea
              name="items_details"
              required
              className="input h-20"
              value={form.items_details}
              onChange={handleChange}
            />
          </Field>

          <Field label="Services Required" required>
            <textarea
              name="services_required"
              required
              className="input h-20"
              value={form.services_required}
              onChange={handleChange}
            />
          </Field>

          <Field label="Special Handling Instructions">
            <textarea
              name="special_handling_instructions"
              className="input h-20"
              value={form.special_handling_instructions}
              onChange={handleChange}
            />
          </Field>

          <Field label="Expected Completion Timeline">
            <input
              name="expected_completion_timeline"
              className="input"
              value={form.expected_completion_timeline}
              onChange={handleChange}
            />
          </Field>

          <Field label="Additional Notes">
            <textarea
              name="additional_notes"
              className="input h-20"
              value={form.additional_notes}
              onChange={handleChange}
            />
          </Field>
        </Section>

        <button
          disabled={loading}
          className="w-full py-3 bg-[#8ed26b] text-white font-semibold rounded-xl shadow-md hover:bg-green-600 transition-all duration-300"
        >
          {loading ? "Submitting..." : "Request Moving Quote"}
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
