"use client";

import {
  EyeIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  QrCodeIcon,
  HandRaisedIcon,
  LinkIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

const PRIMARY_COLOR = "#8ED26B";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">

        {/* --- HEADER --- */}
        <div
          className="flex items-center bg-white p-4 sm:p-6 lg:p-8 rounded-3xl shadow-2xl mb-10 border-t-8"
          style={{ borderColor: PRIMARY_COLOR }}
        >
          <EyeIcon
            className="w-10 h-10 mr-4 flex-shrink-0"
            style={{ color: PRIMARY_COLOR }}
          />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Privacy Policy
          </h1>
        </div>

        {/* --- CONTENT CARD --- */}
        <div className="bg-white p-8 lg:p-12 rounded-3xl shadow-xl space-y-12 border border-gray-100">

          {/* Effective Date */}
          <p className="text-center text-gray-600">
            <strong style={{ color: PRIMARY_COLOR }}>Effective Date:</strong>{" "}
            {new Date().toLocaleDateString()}
          </p>

          {/* Section Component */}
          {[
            {
              title: "1. Information We Collect",
              icon: EyeIcon,
              content: (
                <ul className="list-disc ml-6 text-gray-700 space-y-1">
                  <li>Name, phone number, email</li>
                  <li>Address and booking details</li>
                  <li>Payment information (not stored)</li>
                  <li>Device, usage & analytics data</li>
                </ul>
              ),
            },
            {
              title: "2. How We Use Your Information",
              icon: DocumentTextIcon,
              content: (
                <ul className="list-disc ml-6 space-y-1 text-gray-700">
                  <li>Provide and manage services</li>
                  <li>Send reminders, receipts & updates</li>
                  <li>Enhance user experience</li>
                  <li>Comply with legal obligations</li>
                </ul>
              ),
            },
            {
              title: "3. Data Security",
              icon: ShieldCheckIcon,
              content: (
                <p className="text-gray-700 leading-relaxed">
                  Your personal data is securely stored on encrypted servers and
                  can only be accessed by authorized personnel.
                </p>
              ),
            },
            {
              title: "4. Sharing of Information",
              icon: UserGroupIcon,
              content: (
                <p className="text-gray-700">
                  Shared only when legally required or when necessary for service
                  fulfillment (e.g., technician partners).
                </p>
              ),
            },
            {
              title: "5. Cookies",
              icon: QrCodeIcon,
              content: (
                <p className="text-gray-700">
                  Cookies help us improve website performance and offer a smoother
                  experience. You may disable them anytime.
                </p>
              ),
            },
            {
              title: "6. Your Rights",
              icon: HandRaisedIcon,
              content: (
                <p className="text-gray-700">
                  You may request your data to be corrected or deleted by
                  contacting:{" "}
                  <a
                    href="mailto:privacy@instafitcore.com"
                    className="font-medium underline"
                    style={{ color: PRIMARY_COLOR }}
                  >
                    privacy@instafitcore.com
                  </a>
                </p>
              ),
            },
            {
              title: "7. Third-Party Links",
              icon: LinkIcon,
              content: (
                <p className="text-gray-700">
                  We are not responsible for content, policies, or practices of
                  external websites linked from our platform.
                </p>
              ),
            },
            {
              title: "8. Policy Updates",
              icon: ArrowPathIcon,
              content: (
                <p className="text-gray-700">
                  Updates will be posted on this page with a new effective date.
                </p>
              ),
            },
          ].map((section, index) => {
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
              For questions, contact:{" "}
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
