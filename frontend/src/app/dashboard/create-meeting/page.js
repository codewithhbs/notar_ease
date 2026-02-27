"use client";
import { useEffect, useState } from "react";
import api from "@/utils/api";
import { toast } from "react-toastify";
import { Plus, Trash2, Upload, FileText, User, Mail, Phone, Hash, CreditCard, ChevronRight } from "lucide-react";

function SectionCard({ title, subtitle, icon: Icon, children, accent = false }) {
  return (
    <div className="bg-white rounded-3xl border border-[#005F5A]/10 shadow-sm overflow-hidden">
      <div className={`h-1 ${accent ? "bg-gradient-to-r from-[#C9A84C] to-[#E8C56A]" : "bg-gradient-to-r from-[#005F5A] to-[#00A896]"}`} />
      <div className="p-8">
        <div className="flex items-center gap-3 mb-6">
          {Icon && (
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent ? "bg-[#FBF5E6]" : "bg-[#E6F4F3]"}`}>
              <Icon size={18} className={accent ? "text-[#C9A84C]" : "text-[#005F5A]"} />
            </div>
          )}
          <div>
            <h2 className="text-base font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
              {title}
            </h2>
            {subtitle && <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#005F5A] focus:ring-2 focus:ring-[#005F5A]/10 transition-all duration-200 bg-gray-50 focus:bg-white";

const labelClass = "block text-[10px] font-bold tracking-[0.08em] uppercase text-[#005F5A] mb-1.5";

const Page = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);

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

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (!u) return;
    const parsedUser = JSON.parse(u);
    setUser(parsedUser);
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
        signingMode: "adhaarESign",
        isDefault: true,
        idProof: null,
      },
    ]);
  }, []);

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
        name: "", email: "", CountryCode: "+91", MobileNo: "",
        DOB: "", Gender: "", PageNo: [], signPosition: "bottom-left",
        signingMode: "adhaarESign", isDefault: false, idProof: null,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) { toast.error("PDF is required"); return; }
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
      signatories.forEach((s, i) => {
        const { isDefault, idProof, ...payload } = s;
        Object.entries(payload).forEach(([k, v]) => {
          fd.append(`signatories[${i}][${k}]`, Array.isArray(v) ? JSON.stringify(v) : v);
        });
        if (idProof) fd.append(`signatories[${i}][idProof]`, idProof);
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
      toast.error(err.response?.data?.message || "Server error");
    } finally {
      setLoading(false);
    }
  };

  const signingModes = [
    { value: "adhaarESign", label: "Aadhaar eSign", desc: "Sign using your Aadhaar-linked mobile OTP" },
    { value: "dsc", label: "Digital Signature Certificate (DSC)", desc: "Sign using a USB-based DSC token" },
    { value: "NEKYC", label: "NE-KYC", desc: "For NRIs — sign using passport-based video KYC" },
  ];

  const checkboxes = [
    { name: "pdfReadCheckbox", label: "I have read and prepared the PDF as per the guide." },
    { name: "dateOfAppointmentCheckbox", label: "The PDF is dated for the appointment." },
    { name: "readyForSigningCheckbox", label: "The PDF is ready for signing." },
    { name: "electronicSignatureCheckbox", label: "The PDF is electronically signed." },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 font-sans">

      {/* Page Header */}
      <div className="mb-10">
        <p className="text-[#00A896] text-xs font-bold tracking-[0.15em] uppercase mb-1">Dashboard</p>
        <h1 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
          Create Meeting
        </h1>
        <p className="text-sm text-gray-500 mt-1">Fill in the details below to schedule your notarization meeting.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Meeting Info ── */}
        <SectionCard title="Meeting Information" subtitle="Provide a name and description for this meeting" icon={FileText}>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Meeting Name *</label>
              <input
                name="meetingTitle"
                placeholder="e.g. Property Sale Agreement"
                value={form.meetingTitle}
                onChange={handleChange}
                required
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Meeting Description</label>
              <textarea
                name="meetingDescription"
                placeholder="Brief description of the document or purpose..."
                value={form.meetingDescription}
                onChange={handleChange}
                rows={3}
                className={inputClass}
              />
            </div>
          </div>
        </SectionCard>

        {/* ── Signing Mode ── */}
        <SectionCard title="Signing Mode" subtitle="Choose how signatories will sign the document" icon={CreditCard}>
          <div className="space-y-3">
            {signingModes.map(({ value, label, desc }) => (
              <label
                key={value}
                className={`flex items-start gap-4 p-4 rounded-2xl border cursor-pointer transition-all duration-200 ${
                  form.signingMode === value
                    ? "border-[#005F5A] bg-[#E6F4F3]"
                    : "border-gray-200 hover:border-[#005F5A]/40 hover:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="signingMode"
                  value={value}
                  checked={form.signingMode === value}
                  onChange={handleChange}
                  className="mt-1 accent-[#005F5A]"
                />
                <div>
                  <p className={`text-sm font-semibold ${form.signingMode === value ? "text-[#005F5A]" : "text-gray-800"}`}>
                    {label}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </label>
            ))}
            <p className="text-xs text-gray-500 leading-relaxed pt-1">
              The signatories will have the option(s) to sign the document based on your choice above.
            </p>
          </div>
        </SectionCard>

        {/* ── Signatories ── */}
        <SectionCard title="Signatories" subtitle="Add the people who need to sign this document" icon={User}>
          <div className="space-y-4">

            {/* Info bar */}
            <div className="flex items-center gap-2 bg-[#E6F4F3] border border-[#005F5A]/15 rounded-xl px-4 py-3">
              <div className="w-2 h-2 bg-[#005F5A] rounded-full shrink-0" />
              <p className="text-xs text-[#005F5A] font-medium">
                Organizer is a default signatory. Name, email and mobile cannot be edited.
              </p>
            </div>

            {signatories.map((s, i) => (
              <div
                key={i}
                className={`border rounded-2xl p-6 space-y-4 ${
                  s.isDefault ? "border-[#005F5A]/20 bg-[#E6F4F3]/30" : "border-gray-200"
                }`}
              >
                {/* Row header */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-[#005F5A] text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {i + 1}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {s.isDefault ? "You (Organizer)" : `Signatory ${i + 1}`}
                    </span>
                    {s.isDefault && (
                      <span className="text-[10px] bg-[#005F5A] text-white px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                        Default
                      </span>
                    )}
                  </div>
                  {!s.isDefault && (
                    <button
                      type="button"
                      onClick={() => removeSignatory(i)}
                      className="flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                    >
                      <Trash2 size={13} /> Remove
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Name */}
                  <div>
                    <label className={labelClass}><User size={10} className="inline mr-1" />Name</label>
                    <input
                      placeholder="Full name"
                      value={s.name}
                      onChange={(e) => updateSignatory(i, "name", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className={labelClass}><Mail size={10} className="inline mr-1" />Email</label>
                    <input
                      placeholder="email@example.com"
                      value={s.email}
                      onChange={(e) => updateSignatory(i, "email", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {/* Mobile */}
                  <div>
                    <label className={labelClass}><Phone size={10} className="inline mr-1" />Mobile Number</label>
                    <input
                      type="tel"
                      placeholder="+91 9810262804"
                      value={s.MobileNo}
                      onChange={(e) => updateSignatory(i, "MobileNo", e.target.value)}
                      className={inputClass}
                    />
                  </div>

                  {/* Page Numbers */}
                  <div>
                    <label className={labelClass}><Hash size={10} className="inline mr-1" />Page Numbers</label>
                    <input
                      type="text"
                      placeholder="e.g. 1,2,5"
                      value={s.pageNoInput}
                      onBlur={() => updateSignatory(i, "pageNoInput", s.PageNo.join(","))}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!/^[0-9,]*$/.test(value)) return;
                        updateSignatory(i, "pageNoInput", value);
                        const pages = value.split(",").map((p) => Number(p)).filter((p) => !isNaN(p) && p > 0);
                        updateSignatory(i, "PageNo", pages);
                      }}
                      className={inputClass}
                    />
                    <p className="text-[10px] text-gray-400 mt-1">Comma separated page numbers</p>
                  </div>

                  {/* Signing Mode */}
                  <div>
                    <label className={labelClass}>Signing Mode</label>
                    <select
                      value={s.signingMode}
                      onChange={(e) => updateSignatory(i, "signingMode", e.target.value)}
                      className={inputClass}
                    >
                      <option value="adhaarESign">Aadhaar eSign</option>
                      <option value="dsc">DSC</option>
                      <option value="NEKYC">NE-KYC</option>
                    </select>
                  </div>

                  {/* ID Proof */}
                  <div>
                    <label className={labelClass}>
                      {form.signingMode === "NEKYC"
                        ? "Passport (Image / PDF)"
                        : form.signingMode === "dsc"
                        ? "DSC Certificate (Image / PDF)"
                        : "Aadhaar Card (Image / PDF)"}
                    </label>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (!file) return;
                        const isImage = file.type.startsWith("image/");
                        const isPdf = file.type === "application/pdf";
                        if (!isImage && !isPdf) { toast.error("Only Image or PDF files allowed"); return; }
                        if (file.size > 5 * 1024 * 1024) { toast.error("Max file size is 5MB"); return; }
                        updateSignatory(i, "idProof", file);
                      }}
                      className="w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-[#E6F4F3] file:text-[#005F5A] hover:file:bg-[#005F5A] hover:file:text-white file:transition-colors file:cursor-pointer border border-gray-200 rounded-xl px-3 py-2.5 bg-gray-50 cursor-pointer"
                    />
                    {s.idProof && (
                      <div className="mt-2">
                        {s.idProof.type.startsWith("image/") ? (
                          <img src={URL.createObjectURL(s.idProof)} alt="preview" className="h-20 w-32 object-cover border border-gray-200 rounded-xl" />
                        ) : (
                          <iframe src={URL.createObjectURL(s.idProof)} title="PDF Preview" className="h-32 w-full border border-gray-200 rounded-xl" />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add button */}
            <button
              type="button"
              onClick={addSignatory}
              className="flex items-center gap-2 px-5 py-2.5 border-2 border-dashed border-[#005F5A]/30 text-[#005F5A] text-sm font-semibold rounded-xl hover:border-[#005F5A] hover:bg-[#E6F4F3] transition-all duration-200 w-full justify-center"
            >
              <Plus size={16} /> Add Another Signatory
            </button>
          </div>
        </SectionCard>

        {/* ── Document Preparation ── */}
        <SectionCard title="Document Preparation" subtitle="Confirm your document is ready before uploading" icon={FileText} accent>
          <div className="space-y-3">
            {checkboxes.map(({ name, label }) => (
              <label
                key={name}
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all duration-150 ${
                  form[name]
                    ? "border-[#005F5A]/30 bg-[#E6F4F3]/60"
                    : "border-gray-200 hover:border-[#005F5A]/20"
                }`}
              >
                <input
                  type="checkbox"
                  name={name}
                  checked={form[name]}
                  onChange={handleChange}
                  className="mt-0.5 accent-[#005F5A] shrink-0"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
            <p className="text-xs text-[#005F5A] font-semibold flex items-center gap-1.5 pt-1">
              <ChevronRight size={12} />
              Before uploading, please check our Document Preparation Guide.
            </p>
          </div>
        </SectionCard>

        {/* ── PDF Upload ── */}
        <div className={`transition-opacity duration-300 ${!canUploadPDF ? "opacity-40 pointer-events-none" : ""}`}>
          <SectionCard title="Upload Document" subtitle="Upload the PDF document to be notarized" icon={Upload}>
            <div className="space-y-4">
              <label
                className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-10 cursor-pointer transition-all duration-200 ${
                  canUploadPDF
                    ? "border-[#005F5A]/30 hover:border-[#005F5A] hover:bg-[#E6F4F3]/40"
                    : "border-gray-200 cursor-not-allowed"
                }`}
              >
                <input
                  type="file"
                  accept="application/pdf"
                  disabled={!canUploadPDF}
                  className="hidden"
                  onChange={(e) => setPdfFile(e.target.files[0])}
                />
                <div className="w-14 h-14 bg-[#E6F4F3] rounded-2xl flex items-center justify-center mb-4">
                  <Upload size={24} className="text-[#005F5A]" />
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  {pdfFile ? pdfFile.name : "Click to upload PDF"}
                </p>
                <p className="text-xs text-gray-400 mt-1">Only PDF files are supported</p>
              </label>

              {pdfFile && (
                <div className="border border-gray-200 rounded-2xl overflow-hidden h-[400px]">
                  <iframe
                    src={URL.createObjectURL(pdfFile)}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                </div>
              )}
            </div>
          </SectionCard>
        </div>

        {/* ── Terms ── */}
        <label
          className={`flex items-start gap-4 bg-white border rounded-2xl p-6 cursor-pointer transition-all duration-200 overflow-hidden ${
            form.agreedToTermsCheckbox ? "border-[#005F5A]/30" : "border-gray-200"
          }`}
        >
          <div className={`h-1 absolute top-0 left-0 right-0 ${form.agreedToTermsCheckbox ? "bg-gradient-to-r from-[#005F5A] to-[#00A896]" : "bg-gray-200"}`} />
          <input
            type="checkbox"
            name="agreedToTermsCheckbox"
            checked={form.agreedToTermsCheckbox}
            onChange={handleChange}
            className="mt-1 accent-[#005F5A] shrink-0"
          />
          <p className="text-sm text-gray-700 leading-relaxed">
            I hereby confirm that if the PDF contains affidavits, the signatories are
            aware of the contents of accompanying pleadings / documents, which are
            ready to produce before the notary, if requested, during the appointment.
          </p>
        </label>

        {/* ── Submit ── */}
        <div className="flex justify-end pb-6">
          <button
            type="submit"
            disabled={loading || !form.agreedToTermsCheckbox}
            className="flex items-center gap-2 px-10 py-4 bg-gradient-to-br from-[#005F5A] to-[#004845] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#005F5A]/25 hover:shadow-[#005F5A]/45 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Creating...
              </>
            ) : (
              <>Create Meeting <ChevronRight size={15} /></>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default Page;