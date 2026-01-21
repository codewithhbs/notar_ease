import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Terms & Conditions
          </h1>
          <p className="mt-4 text-gray-700 leading-relaxed">
            These Terms & Conditions (“Terms”) govern your access to and use of
            the website and services provided by <strong>Omm Documentation</strong>.
            By accessing or using our platform, you agree to be bound by these Terms.
            If you do not agree, please do not use our services.
          </p>
        </div>

        {/* Section 1 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            1. About Omm Documentation
          </h2>
          <p className="text-gray-700">
            Omm Documentation provides an online platform that facilitates
            electronic notarisation of documents through registered and
            authorised notaries, in accordance with applicable laws.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            2. Eligibility
          </h2>
          <p className="text-gray-700">
            By using our services, you represent and warrant that:
          </p>
          <ul className="list-disc pl-6 mt-3 text-gray-700 space-y-1">
            <li>You are at least 18 years of age or have attained the age of majority in your jurisdiction</li>
            <li>You have the legal capacity to enter into binding agreements</li>
            <li>All information provided by you is accurate and complete</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            3. User Responsibilities
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Ensure the authenticity and legality of documents submitted for notarisation</li>
            <li>Provide accurate personal and identification details</li>
            <li>Maintain confidentiality of account credentials</li>
            <li>Use the platform only for lawful purposes</li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            4. Services & Limitations
          </h2>
          <p className="text-gray-700">
            Omm Documentation acts as a technology facilitator and does not
            provide legal advice. The notarisation is performed by authorised
            notaries, and Omm Documentation shall not be responsible for the
            content, legality, or enforceability of documents.
          </p>
        </section>

        {/* Section 5 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            5. Payments & Refunds
          </h2>
          <p className="text-gray-700">
            Fees for notarisation services are displayed on the platform.
            Payments must be made in advance. Refunds, if any, shall be
            governed by our Refund Policy and applicable laws.
          </p>
        </section>

        {/* Section 6 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            6. Intellectual Property
          </h2>
          <p className="text-gray-700">
            All content, trademarks, logos, and software on this platform are
            the property of Omm Documentation or its licensors. You may not
            copy, modify, distribute, or reproduce any content without prior
            written permission.
          </p>
        </section>

        {/* Section 7 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            7. Data Protection & Privacy
          </h2>
          <p className="text-gray-700">
            Your use of the platform is also governed by our Privacy Policy,
            which explains how we collect, use, and protect your personal data.
          </p>
        </section>

        {/* Section 8 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            8. Limitation of Liability
          </h2>
          <p className="text-gray-700">
            To the maximum extent permitted by law, Omm Documentation shall not
            be liable for any indirect, incidental, or consequential damages
            arising out of your use of the platform or services.
          </p>
        </section>

        {/* Section 9 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            9. Termination
          </h2>
          <p className="text-gray-700">
            We reserve the right to suspend or terminate your access to the
            platform at our discretion, without prior notice, if you violate
            these Terms or applicable laws.
          </p>
        </section>

        {/* Section 10 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            10. Governing Law & Jurisdiction
          </h2>
          <p className="text-gray-700">
            These Terms shall be governed by and construed in accordance with
            the laws of India. Courts located in India shall have exclusive
            jurisdiction over any disputes.
          </p>
        </section>

        {/* Section 11 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            11. Changes to Terms
          </h2>
          <p className="text-gray-700">
            Omm Documentation may update these Terms from time to time. Continued
            use of the platform after changes indicates acceptance of the revised Terms.
          </p>
        </section>

        {/* Section 12 */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            12. Contact Information
          </h2>
          <p className="text-gray-700">
            For any questions or concerns regarding these Terms, please contact us at:
          </p>
          <p className="mt-2 font-semibold text-gray-900">
            hello@ommdocumentation.com
          </p>
        </section>

      </div>
    </div>
  );
}
