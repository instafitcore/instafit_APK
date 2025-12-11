"use client";

import {
  DocumentTextIcon,
  ChevronRightIcon,
  CreditCardIcon,
  XMarkIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  HandRaisedIcon,
  EyeIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const PRIMARY_COLOR = "#8ED26B";

export default function TermsPage() {
  const sections = [
    {
      title: "1. Our Services",
      icon: DocumentTextIcon,
      content: (
        <>
          <p className="text-gray-700 mb-2">
            We provide on-demand furniture services including:
          </p>
          <ul className="list-disc ml-6 text-gray-700 space-y-1">
            <li>Installation and dismantling</li>
            <li>Furniture repair and polishing</li>
            <li>Packing and relocation support</li>
          </ul>
          <p className="text-gray-700 mt-2">
            All services are performed by trained professionals following safety and quality standards.
          </p>
        </>
      ),
    },
    {
      title: "2. Bookings",
      icon: ChevronRightIcon,
      content: (
        <ul className="list-disc ml-6 text-gray-700 space-y-1">
          <li>Bookings via website, WhatsApp, or phone.</li>
          <li>Booking confirmation via SMS/email.</li>
          <li>Provide accurate address & contact details.</li>
          <li>Time slots depend on technician availability.</li>
        </ul>
      ),
    },
    {
      title: "3. Charges & Payment",
      icon: CreditCardIcon,
      content: (
        <ul className="list-disc ml-6 text-gray-700 space-y-1">
          <li>Prices include labor only.</li>
          <li>Packing material: ₹200 per meter + ₹200 per item.</li>
          <li>Visit Charges: ₹199 if no work is done after inspection.</li>
          <li>Payments must be made immediately after completion.</li>
          <li>Taxes (GST) are additional.</li>
        </ul>
      ),
    },
    {
      title: "4. Cancellations & Rescheduling",
      icon: XMarkIcon,
      content: (
        <ul className="list-disc ml-6 text-gray-700 space-y-1">
          <li>Cancel/reschedule up to 2 hours before slot.</li>
          <li>Late cancellations may incur ₹199 charge.</li>
          <li>Rescheduling may occur due to safety, weather, or operations.</li>
        </ul>
      ),
    },
    {
      title: "5. Customer Responsibilities",
      icon: UserGroupIcon,
      content: (
        <ul className="list-disc ml-6 text-gray-700 space-y-1">
          <li>Ensure safe access to the work area.</li>
          <li>Remove fragile items before service.</li>
          <li>Ensure all required furniture parts are available.</li>
        </ul>
      ),
    },
    {
      title: "6. Liability",
      icon: ShieldCheckIcon,
      content: (
        <ul className="list-disc ml-6 text-gray-700 space-y-1">
          <li>Not liable for manufacturing defects or missing fittings.</li>
          <li>Not liable for damages due to pre-existing weaknesses.</li>
          <li>Not responsible for delays caused by third-party factors.</li>
        </ul>
      ),
    },
    {
      title: "7. Privacy & Data Protection",
      icon: LockClosedIcon,
      content: (
        <p className="text-gray-700">
          We collect minimal personal information needed to complete service requests.
        </p>
      ),
    },
    {
      title: "8. Professional Conduct",
      icon: HandRaisedIcon,
      content: (
        <ul className="list-disc ml-6 text-gray-700 space-y-1">
          <li>Technicians are trained and background-verified.</li>
          <li>Customers must treat staff respectfully.</li>
          <li>Misconduct may result in service termination.</li>
        </ul>
      ),
    },
    {
      title: "9. Intellectual Property",
      icon: EyeIcon,
      content: (
        <p className="text-gray-700">
          All website content belongs to InstaFitCore Pvt. Ltd. and cannot be reused without permission.
        </p>
      ),
    },
    {
      title: "10. Dispute Resolution",
      icon: DocumentTextIcon,
      content: (
        <p className="text-gray-700">
          All disputes fall under the jurisdiction of Bangalore, Karnataka, India.
        </p>
      ),
    },
    {
      title: "11. Updates",
      icon: ArrowPathIcon,
      content: (
        <p className="text-gray-700">
          Terms may be updated periodically with a revised date.
        </p>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* --- HEADER --- */}
        <div
          className="flex items-center bg-white p-4 sm:p-6 lg:p-8 rounded-3xl shadow-2xl mb-10 border-t-8"
          style={{ borderColor: PRIMARY_COLOR }}
        >
          <DocumentTextIcon
            className="w-10 h-10 mr-4 flex-shrink-0"
            style={{ color: PRIMARY_COLOR }}
          />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Terms & Conditions
          </h1>
        </div>

        {/* --- CONTENT CARD --- */}
        <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-xl space-y-10 border border-gray-100">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <section key={index} className="flex items-start space-x-4">
                <Icon
                  className="h-9 w-9 mt-1 flex-shrink-0"
                  style={{ color: PRIMARY_COLOR }}
                />
                <div>
                  <h3 className="text-xl font-bold mb-2 text-slate-900">
                    {section.title}
                  </h3>
                  {section.content}
                </div>
              </section>
            );
          })}

          {/* Footer */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              For any questions, contact:{" "}
              <a
                href="mailto:support@instafitcore.com"
                className="underline font-medium"
                style={{ color: PRIMARY_COLOR }}
              >
                support@instafitcore.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
