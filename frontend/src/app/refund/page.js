import React from "react";

export default function Page() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-10">

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900">
            Refund & Cancellation Policy
          </h1>
          <p className="mt-4 text-gray-700 leading-relaxed">
            This Refund & Cancellation Policy explains the circumstances under which
            refunds or cancellations may be requested for services provided by
            <strong> Omm Documentation</strong>.
          </p>
        </div>

        {/* Section 1 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            1. Nature of Services
          </h2>
          <p className="text-gray-700">
            Omm Documentation provides online electronic notarisation services
            facilitated through authorised notaries. Due to the nature of these
            services, certain requests may become non-refundable once processing
            has begun.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            2. Cancellation Policy
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              You may request cancellation of a notarisation request before the
              notarisation process has started.
            </li>
            <li>
              Once a document has been reviewed, verified, or notarised by a notary,
              cancellation may not be possible.
            </li>
            <li>
              Cancellation requests must be submitted by contacting our support team.
            </li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="mb-8">
          <h2 className="text-2 font-semibold text-gray-900 mb-3">
            3. Refund Policy
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>
              Refunds may be issued if the service has not been initiated or if
              notarisation could not be completed due to a technical error
              attributable to Omm Documentation.
            </li>
            <li>
              No refunds shall be provided once notarisation has been successfully
              completed.
            </li>
            <li>
              Any applicable refunds will be processed to the original payment
              method used at the time of transaction.
            </li>
          </ul>
        </section>

        {/* Section 4 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            4. Processing of Refunds
          </h2>
          <p className="text-gray-700">
            Approved refunds, where applicable, will typically be processed within
            <strong> 7 to 10 business days</strong>. The actual time for the amount to
            reflect in your account may depend on your bank or payment provider.
          </p>
        </section>

        {/* Section 5 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            5. Non-Refundable Situations
          </h2>
          <ul className="list-disc pl-6 text-gray-700 space-y-2">
            <li>Incorrect or incomplete information provided by the user</li>
            <li>Failure to attend a scheduled notarisation session</li>
            <li>Change of mind after service initiation</li>
            <li>Delays caused due to user unavailability or non-cooperation</li>
          </ul>
        </section>

        {/* Section 6 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            6. Disputes & Chargebacks
          </h2>
          <p className="text-gray-700">
            In case of any dispute regarding payments, we encourage you to contact
            us first for resolution. Unauthorised chargebacks may result in
            suspension of your account.
          </p>
        </section>

        {/* Section 7 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            7. Policy Updates
          </h2>
          <p className="text-gray-700">
            Omm Documentation reserves the right to modify or update this Refund &
            Cancellation Policy at any time. Changes will be effective upon posting
            on the website.
          </p>
        </section>

        {/* Section 8 */}
        <section>
          <h2 className="text-2xl font-semibold text-gray-900 mb-3">
            8. Contact Us
          </h2>
          <p className="text-gray-700">
            For any questions or refund-related requests, please contact us at:
          </p>
          <p className="mt-2 font-semibold text-gray-900">
            omdocument33@gmail.com
          </p>
          <p className="mt-2 text-gray-600">
            We aim to respond within 3-5 working days.
          </p>
        </section>

      </div>
    </div>
  );
}
