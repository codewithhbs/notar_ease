"use client";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { toast } from "react-toastify";

const Page = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

  /* =========================
     FORM STATE
  ========================= */
  const [form, setForm] = useState({
    meetingTitle: "",
    meetingDescription: "",
    signingMode: "adhaarESign",

    pdfReadCheckbox: false,
    dateOfAppointmentCheckbox: false,
    readyForSigningCheckbox: false,
    electronicSignatureCheckbox: false,
    agreedToTermsCheckbox: false,

    advocateId: "",
    timeSlotId: "",
    startTime: "",
    endTime: "",
  });

  const [signatories, setSignatories] = useState([]);

  /* =========================
     LOAD USER + DEFAULT SIGNER
  ========================= */
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) return;

    const parsedUser = JSON.parse(u);
    setUser(parsedUser);
    console.log("parsedUser", parsedUser)

    setSignatories([
      {
        name: parsedUser.name || "",
        email: parsedUser.email || "",
        CountryCode: "+91",
        MobileNo: parsedUser.phone || "",
        DOB: "",
        Gender: "",
        PageNo: [],
        signPosition: "bottom-left",
        isDefault: true,
        idProof: null, // 👈 added
      },
    ]);

  }, []);

  /* =========================
     HANDLERS
  ========================= */
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const updateSignatory = (index, key, value) => {
    const updated = [...signatories];
    updated[index][key] = value;
    setSignatories(updated);
  };

  const addSignatory = () => {
    setSignatories((prev) => [
      ...prev,
      {
        name: "",
        email: "",
        CountryCode: "+91",
        MobileNo: "",
        DOB: "",
        Gender: "",
        PageNo: [],
        signPosition: "bottom-left",
        isDefault: false,
        idProof: null,
      },
    ]);
  };

  const removeSignatory = (index) => {
    if (signatories[index].isDefault) return;
    setSignatories((prev) => prev.filter((_, i) => i !== index));
  };

  const canUploadPDF =
    form.pdfReadCheckbox &&
    form.dateOfAppointmentCheckbox &&
    form.readyForSigningCheckbox &&
    form.electronicSignatureCheckbox;

  /* =========================
     SUBMIT
  ========================= */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!pdfFile) {
      toast.error("PDF is required");
      return;
    }

    try {
      toast.loading("Meeting creating...", { toastId: "create" });
      setLoading(true);

      const fd = new FormData();
      fd.append("userId", user?._id);
      fd.append("meetingTitle", form.meetingTitle);
      fd.append("meetingDescription", form.meetingDescription);
      fd.append("signingMode", form.signingMode);
      fd.append("advocateId", form.advocateId);
      fd.append("timeSlotId", form.timeSlotId);
      fd.append("startTime", form.startTime);
      fd.append("endTime", form.endTime);

      // 🔥 Signatories (remove isDefault before sending)
      signatories.forEach((s, i) => {
        const { isDefault, idProof, ...payload } = s;

        Object.entries(payload).forEach(([k, v]) => {
          if (Array.isArray(v)) {
            fd.append(`signatories[${i}][${k}]`, JSON.stringify(v));
          } else {
            fd.append(`signatories[${i}][${k}]`, v);
          }
        });


        // 👇 send idProof as file
        if (idProof) {
          fd.append(`signatories[${i}][idProof]`, idProof);
        }
      });


      Object.entries(form).forEach(([k, v]) => {
        if (typeof v === "boolean") fd.append(k, v.toString());
      });

      fd.append("documentUrl", pdfFile);

      const res = await api.post("/api/meeting/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const meetingId = res?.data?.meeting?._id;

      toast.success("Meeting created successfully");
      window.location.href = `/dashboard/schedule/${meetingId}`;

    } catch (err) {
      console.log("Internal server error", err)
      toast.error(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-semibold mb-8">Create Meeting</h1>

      <form onSubmit={handleSubmit} className="space-y-10">

        {/* ================= Meeting Info ================= */}
        <section className="bg-white rounded-2xl border p-6 space-y-4">
          <h2 className="text-lg font-medium">Meeting Information</h2>

          <input
            name="meetingTitle"
            placeholder="Meeting Name *"
            value={form.meetingTitle}
            onChange={handleChange}
            required
            className="w-full border rounded-lg px-4 py-2"
          />

          <textarea
            name="meetingDescription"
            placeholder="Meeting Description"
            value={form.meetingDescription}
            onChange={handleChange}
            rows={3}
            className="w-full border rounded-lg px-4 py-2"
          />
        </section>

        {/* ================= Signing Mode ================= */}
        <section className="bg-white rounded-2xl border p-6 space-y-4">
          <h2 className="text-lg font-medium">Signing Mode</h2>

          {[
            ["adhaarESign", "Aadhaar eSign"],
            ["dsc", "Digital Signature Certificate (DSC)"],
            ["NEKYC", "NE-KYC"],
          ].map(([value, label]) => (
            <label key={value} className="flex gap-3 items-center text-sm">
              <input
                type="radio"
                name="signingMode"
                value={value}
                checked={form.signingMode === value}
                onChange={handleChange}
              />
              {label}
            </label>
          ))}

          <p className="text-sm text-gray-600 leading-relaxed">
            The signatories will have the option(s) to sign the document based on
            your choice of signing mode(s) above. For example, if you choose
            "Aadhaar eSign or DSC", then the signatories will have the option of
            signing using Aadhaar eSign or the USB token based DSC.
          </p>
        </section>

        {/* ================= Signatories ================= */}
        <section className="bg-white rounded-2xl border p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium">Signatories</h2>
            <button
              type="button"
              onClick={addSignatory}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg"
            >
              + Add Signatory
            </button>
          </div>

          <div className="bg-green-50 border rounded-lg p-3 text-sm">
            Organizer is a default signatory. Name, email and mobile cannot be edited.
          </div>

          {signatories.map((s, i) => (
            <div
              key={i}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 border rounded-xl p-4"
            >
              {/* Name */}
              <div className="space-y-1">
                <label
                  htmlFor={`name-${i}`}
                  className="text-xs font-medium text-gray-600"
                >
                  Name
                </label>
                {s.isDefault && (
                  <span className="text-xs text-green-600 block">
                    Organizer (Default Signer)
                  </span>
                )}
                <input
                  id={`name-${i}`}
                  placeholder="Name"
                  value={s.name}
                  // disabled={s.isDefault}
                  onChange={(e) => updateSignatory(i, "name", e.target.value)}
                  className="border rounded px-3 py-2 disabled:bg-gray-100 w-full"
                />
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label
                  htmlFor={`email-${i}`}
                  className="text-xs font-medium text-gray-600"
                >
                  Email
                </label>
                <input
                  id={`email-${i}`}
                  placeholder="Email"
                  value={s.email}
                  // disabled={s.isDefault}
                  onChange={(e) => updateSignatory(i, "email", e.target.value)}
                  className="border rounded px-3 py-2 disabled:bg-gray-100 w-full"
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-1">
                <label
                  htmlFor={`mobile-${i}`}
                  className="text-xs font-medium text-gray-600"
                >
                  Mobile Number
                </label>
                <input
                  id={`mobile-${i}`}
                  type="tel"
                  placeholder="Mobile No"
                  value={s.MobileNo}
                  // disabled={s.isDefault}
                  onChange={(e) => updateSignatory(i, "MobileNo", e.target.value)}
                  className="border rounded px-3 py-2 disabled:bg-gray-100 w-full"
                />
              </div>

              {/* Page Numbers */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  Page Numbers
                </label>

                <input
                  type="text"
                  placeholder="Enter page numbers (e.g. 1,2,5)"
                  value={s.pageNoInput}
                  onBlur={() => {
                    const clean = s.PageNo.join(",");
                    updateSignatory(i, "pageNoInput", clean);
                  }}
                  onChange={(e) => {
                    const value = e.target.value;

                    // allow only numbers & commas
                    if (!/^[0-9,]*$/.test(value)) return;

                    // update RAW input
                    updateSignatory(i, "pageNoInput", value);

                    // convert to number array (safe)
                    const pages = value
                      .split(",")
                      .map((p) => Number(p))
                      .filter((p) => !isNaN(p) && p > 0);

                    updateSignatory(i, "PageNo", pages);
                  }}
                  className="border rounded px-3 py-2 w-full"
                />

                <p className="text-xs text-gray-500">
                  Use comma separated page numbers
                </p>
              </div>



              {/* Sign Position + Remove */}
              <div className="space-y-1">
                <label
                  htmlFor={`position-${i}`}
                  className="text-xs font-medium text-gray-600"
                >
                  Sign Position
                </label>
                <select
                  id={`position-${i}`}
                  value={s.signPosition}
                  onChange={(e) =>
                    updateSignatory(i, "signPosition", e.target.value)
                  }
                  className="border rounded px-3 py-2 w-full"
                >
                  {/* <option value="bottom-right">Bottom Right</option> */}
                  {/* <option value="top-left">Top Left</option>
                  <option value="top-center">Top Center</option>
                  <option value="top-right">Top Right</option>
                  <option value="middle-left">Middle Left</option>
                  <option value="middle-center">Middle Center</option>
                  <option value="middle-right">Middle Right</option> */}
                  <option value="bottom-left">Bottom Left</option>
                  <option value="bottom-center">Bottom Center</option>
                </select>

                {!s.isDefault && (
                  <button
                    type="button"
                    onClick={() => removeSignatory(i)}
                    className="text-red-600 text-sm mt-1"
                  >
                    Remove Signer
                  </button>
                )}
              </div>
              {/* ID Proof Upload */}
              <div className="space-y-1">
                <label className="text-xs font-medium text-gray-600">
                  {form.signingMode === "NEKYC"
                    ? "Passport (Image)"
                    : "Aadhaar Card (Image)"}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    updateSignatory(i, "idProof", e.target.files[0])
                  }
                  className="border rounded px-3 py-2 w-full"
                />
              </div>

            </div>
          ))}

        </section>

        {/* ================= Document Preparation ================= */}
        <section className="bg-white rounded-2xl border p-6 space-y-3">
          <h2 className="text-lg font-medium">Document Preparation</h2>

          <label className="flex gap-3 text-sm">
            <input type="checkbox" name="pdfReadCheckbox"
              checked={form.pdfReadCheckbox} onChange={handleChange} />
            I have read and prepared the PDF as per the guide.
          </label>

          <label className="flex gap-3 text-sm">
            <input type="checkbox" name="dateOfAppointmentCheckbox"
              checked={form.dateOfAppointmentCheckbox} onChange={handleChange} />
            The PDF is dated for the appointment.
          </label>

          <label className="flex gap-3 text-sm">
            <input type="checkbox" name="readyForSigningCheckbox"
              checked={form.readyForSigningCheckbox} onChange={handleChange} />
            The PDF is ready for signing.
          </label>

          <label className="flex gap-3 text-sm">
            <input type="checkbox" name="electronicSignatureCheckbox"
              checked={form.electronicSignatureCheckbox} onChange={handleChange} />
            The PDF is electronically signed.
          </label>

          <p className="text-sm text-indigo-600 font-medium">
            Before uploading a document, please check our Document Preparation Guide.
          </p>
        </section>

        {/* ================= PDF Upload ================= */}
        <section
          className={`bg-white rounded-2xl border p-6 space-y-4 ${!canUploadPDF && "opacity-50"
            }`}
        >
          <h2 className="text-lg font-medium">Upload Document</h2>

          <label
            className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition
      ${canUploadPDF ? "hover:border-indigo-500" : "cursor-not-allowed"}
    `}
          >
            <input
              type="file"
              accept="application/pdf"
              disabled={!canUploadPDF}
              className="hidden"
              onChange={(e) => setPdfFile(e.target.files[0])}
            />

            <div className="text-center space-y-2">
              <p className="text-sm font-medium">
                {pdfFile ? pdfFile.name : "Click to upload PDF"}
              </p>
              <p className="text-xs text-gray-500">
                Only PDF files are supported
              </p>
            </div>
          </label>

          {/* PDF Preview */}
          {pdfFile && (
            <div className="border rounded-xl overflow-hidden h-[400px]">
              <iframe
                src={URL.createObjectURL(pdfFile)}
                className="w-full h-full"
                title="PDF Preview"
              />
            </div>
          )}
        </section>


        {/* ================= Terms ================= */}
        <label className="flex gap-3 items-start bg-white border rounded-2xl p-6 text-sm">
          <input type="checkbox" name="agreedToTermsCheckbox"
            checked={form.agreedToTermsCheckbox}
            onChange={handleChange} className="mt-1" />
          I hereby confirm that if the PDF contains affidavits, the signatories are
          aware of the contents of accompanying pleadings / documents, which are
          ready to produce before the notary, if requested, during the appointment.
        </label>

        {/* ================= Action ================= */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading || !form.agreedToTermsCheckbox}
            className="px-8 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Meeting"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Page;