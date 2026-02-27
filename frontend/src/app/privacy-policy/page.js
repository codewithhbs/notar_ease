import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-10">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Privacy Policy
          </h1>
          <p className="mt-4 text-gray-700 leading-relaxed">
            This Privacy Policy explains how <strong>Omm Documentation</strong> collects,
            uses, stores, and protects your personal information when you access or use
            our website and online electronic notarisation services.
          </p>
        </div>

        {/* Section 1 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            1. Information We Collect
          </h2>

          <h3 className="text-lg font-semibold text-gray-800 mt-4">
            1.1 Personal Information
          </h3>
          <p className="text-gray-700 mt-2">
            When you use Omm Documentation, create an account, request notarisation,
            or submit documents, we may collect the following information:
          </p>
          <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-1">
            <li>Name</li>
            <li>Email address</li>
            <li>Phone number</li>
            <li>Address and contact details</li>
            <li>Identification documents (such as Aadhaar or other valid ID)</li>
            <li>Documents submitted for notarisation</li>
            <li>Photographs or videos captured or uploaded during notarisation</li>
            <li>Payment and transaction details</li>
            <li>Any other information voluntarily provided by you</li>
          </ul>

          <h3 className="text-lg font-semibold text-gray-800 mt-6">
            1.2 Usage Information
          </h3>
          <p className="text-gray-700 mt-2">
            We may automatically collect technical and usage-related information,
            including:
          </p>
          <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-1">
            <li>IP address</li>
            <li>Browser type and device information</li>
            <li>Pages visited and time spent on our website</li>
          </ul>
        </section>

        {/* Section 2 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            2. How We Use Your Information
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>To provide and manage our notarisation services</li>
            <li>To process requests, payments, and transactions</li>
            <li>To verify identity and prevent fraud</li>
            <li>To communicate with you regarding your account or requests</li>
            <li>To comply with legal and regulatory obligations</li>
            <li>To improve our platform, services, and user experience</li>
            <li>To send service-related updates and promotional communications (opt-out available)</li>
            <li>To display advertisements through third-party partners, where applicable</li>
          </ul>
          <p className="mt-4 text-gray-700">
            We retain personal information only for as long as necessary to fulfill
            business, legal, or regulatory requirements.
          </p>
        </section>

        {/* Section 3 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            3. Information Processing & Third-Party Services
          </h2>
          <p className="text-gray-700">
            To operate efficiently, Omm Documentation may use trusted third-party
            service providers. These providers process data in accordance with their
            own privacy policies.
          </p>

          <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-2">
            <li>
              <strong>eMudhra:</strong> Used for electronic signing of documents.
            </li>
            {/* <li>
              <strong>Amazon Web Services (AWS):</strong> Used for hosting, data storage,
              database management, and infrastructure services.
            </li> */}
            <li>
              <strong>Google Services:</strong> Used for communication, email services,
              and data storage.
            </li>
          </ul>

          <p className="mt-4 text-gray-700">
            Omm Documentation does not control the privacy practices of these third
            parties and recommends reviewing their respective privacy policies.
          </p>
        </section>

        {/* Section 4 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            4. Your Rights
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Request access, correction, or deletion of your personal information</li>
            <li>Request restriction or objection to processing of your data</li>
            <li>Withdraw consent where processing is based on consent</li>
          </ul>
          <p className="mt-4 text-gray-700">
            Requests may be submitted to <strong>omdocument33@gmail.com</strong>.
            Certain requests may be limited due to legal or regulatory obligations.
          </p>
        </section>

        {/* Section 5 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            5. Security
          </h2>
          <p className="text-gray-700">
            We implement reasonable technical and organizational safeguards to
            protect your personal information against unauthorized access, misuse,
            or disclosure.
          </p>
        </section>

        {/* Section 6 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            6. Cookies
          </h2>
          <p className="text-gray-700">
            We use cookies to enhance website functionality and user experience.
            You may manage cookie preferences through your browser settings.
          </p>
        </section>

        {/* Section 7 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            7. Changes to This Privacy Policy
          </h2>
          <p className="text-gray-700">
            This Privacy Policy may be updated periodically. Material changes will
            be communicated through appropriate channels where possible.
          </p>
        </section>

        {/* Section 8 */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            8. Contact Us
          </h2>
          <p className="text-gray-700">
            If you have any questions or concerns regarding this Privacy Policy,
            please contact us at:
          </p>
          <p className="mt-2 font-semibold text-gray-900">
            omdocument33@gmail.com
          </p>
          <p className="mt-2 text-gray-600">
            We typically respond within 3–5 working days.
          </p>
        </section>

      </div>
    </div>
  );
}
