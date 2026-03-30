"use client";

import React, { useEffect, useState } from "react";
import api from "@/utils/api";
import { toast } from "react-toastify";
import { User, Phone, MapPin, Globe, FileText, Shield, CheckCircle, Clock, Upload } from "lucide-react";

/* ── Reusable Input ── */
const Input = ({ label = "", icon: Icon, ...props }) => (
  <div>
    {label && (
      <label className="block text-[10px] font-bold tracking-[0.08em] uppercase text-[#005F5A] mb-1.5">
        {label}
      </label>
    )}
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
          <Icon size={15} />
        </div>
      )}
      <input
        {...props}
        value={props.value ?? ""}
        className={`w-full border border-gray-200 rounded-xl py-3 pr-4 text-sm text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#005F5A] focus:ring-2 focus:ring-[#005F5A]/10 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed ${Icon ? "pl-10" : "pl-4"}`}
      />
    </div>
  </div>
);

/* ── Section Card ── */
function SectionCard({ title, icon: Icon, children, accent = false }) {
  return (
    <div className="bg-white rounded-2xl border border-[#005F5A]/10 shadow-sm overflow-hidden">
      <div className={`h-1 ${accent ? "bg-gradient-to-r from-[#C9A84C] to-[#E8C56A]" : "bg-gradient-to-r from-[#005F5A] to-[#00A896]"}`} />
      <div className="p-6">
        <div className="flex items-center gap-2.5 mb-5">
          {Icon && (
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? "bg-[#FBF5E6]" : "bg-[#E6F4F3]"}`}>
              <Icon size={16} className={accent ? "text-[#C9A84C]" : "text-[#005F5A]"} />
            </div>
          )}
          <h3 className="text-sm font-bold text-gray-800" style={{ fontFamily: "'Georgia', serif" }}>
            {title}
          </h3>
        </div>
        {children}
      </div>
    </div>
  );
}

const ProfileUpdate = () => {
  const [loading, setLoading] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [role, setRole] = useState("user");
  const [existingPdf, setExistingPdf] = useState(null);
  const [isVerified, setIsVerified] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    familyName: "",
    phone: "",
    address: "",
    country: "IN",
    advocateRegistrationNo: "",
    advocateJurisdiction: "",
    advocateExpireDate: "",
  });

  const fetchUser = async () => {
    try {
      const res = await api.get("/api/auth/me");
      const user = res?.data?.user || {};
      setFormData({
        name: user?.name ?? "",
        familyName: user?.familyName ?? "",
        phone: user?.phone ?? "",
        address: user?.address ?? "",
        country: user?.country ?? "IN",
        advocateRegistrationNo: user?.advocateRegistrationNo ?? "",
        advocateJurisdiction: user?.advocateJurisdiction ?? "",
        advocateExpireDate: user?.advocateExpireDate ? user.advocateExpireDate.split("T")[0] : "",
      });
      setExistingPdf(user?.userIdImage?.pdf ?? null);
      setIsVerified(Boolean(user?.userIdImageVerify));
    } catch {
      toast.error("Failed to load profile");
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) return;
    const parsedUser = JSON.parse(user);
    setRole(parsedUser?.role || "user");
    fetchUser();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (!name) return;
    setFormData((prev) => ({ ...prev, [name]: value ?? "" }));
  };

  const handlePdfChange = (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") { toast.warn("Only PDF files are allowed"); return; }
    setPdfFile(file);
  };

  const updateUser = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData || {}).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") data.append(key, value);
      });
      if (pdfFile && !isVerified) data.append("userIdImage", pdfFile);
      await api.put("/api/auth/update_user_profile", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Profile updated successfully ✅");
      setPdfFile(null);
      fetchUser();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Profile update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center font-sans">
      <form onSubmit={updateUser} className="w-full space-y-5">

        {/* ── Page Header ── */}
        <div className="mb-2">
          <p className="text-[#00A896] text-xs font-bold tracking-[0.15em] uppercase mb-1">Dashboard</p>
          <h2
            className="text-2xl font-extrabold text-gray-900"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Update Profile
          </h2>
          <p className="text-sm text-gray-400 mt-1">Keep your information accurate and up to date.</p>
        </div>

        {/* ── Personal Info ── */}
        <SectionCard title="Personal Information" icon={User}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="First Name" name="name" icon={User} placeholder="John" value={formData.name} onChange={handleChange} />
              <Input label="Last Name" name="familyName" placeholder="Doe" value={formData.familyName} onChange={handleChange} />
            </div>
            <Input label="Phone" name="phone" icon={Phone} type="tel" placeholder="+91 9810262804" value={formData.phone} onChange={handleChange} />
            <Input label="Address" name="address" icon={MapPin} placeholder="Your address" value={formData.address} onChange={handleChange} />
            <Input label="Country" name="country" icon={Globe} placeholder="IN" value={formData.country} onChange={handleChange} />
          </div>
        </SectionCard>

        {/* ── Notary Details ── */}. 
        {role === "notary" && (
          <SectionCard title="Notary Details" icon={Shield} accent>
            <div className="space-y-4">
              <Input
                label="Registration Number"
                name="advocateRegistrationNo"
                placeholder="e.g. BAR/2021/001234"
                value={formData.advocateRegistrationNo}
                onChange={handleChange}
              />
              <Input
                label="Jurisdiction"
                name="advocateJurisdiction"
                placeholder="e.g. Delhi High Court"
                value={formData.advocateJurisdiction}
                onChange={handleChange}
              />
              <Input
                type="date"
                label="Registration Expiry Date"
                name="advocateExpireDate"
                value={formData.advocateExpireDate}
                onChange={handleChange}
              />
            </div>
          </SectionCard>
        )}

        {/* ── ID Document ── */}
        <SectionCard title="ID Document (PDF)" icon={FileText}>
          <div className="space-y-4">

            {/* Existing PDF status */}
            {existingPdf && (
              <div className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border ${isVerified ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"}`}>
                <a
                  href={existingPdf}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`text-sm font-semibold underline underline-offset-2 ${isVerified ? "text-emerald-700" : "text-amber-700"}`}
                >
                  View Uploaded PDF
                </a>
                {isVerified ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle size={13} /> Verified
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-600">
                    <Clock size={13} /> Pending Verification
                  </div>
                )}
              </div>
            )}

            {/* Upload zone */}
            <label
              className={`flex flex-col items-center justify-center border-2 border-dashed rounded-2xl px-6 py-8 transition-all duration-200 ${
                isVerified
                  ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                  : "border-[#005F5A]/25 hover:border-[#005F5A] hover:bg-[#E6F4F3]/40 cursor-pointer"
              }`}
            >
              <input
                type="file"
                accept="application/pdf"
                disabled={isVerified}
                onChange={handlePdfChange}
                className="hidden"
              />
              <div className="w-12 h-12 bg-[#E6F4F3] rounded-2xl flex items-center justify-center mb-3">
                <Upload size={20} className="text-[#005F5A]" />
              </div>
              {pdfFile ? (
                <p className="text-sm font-semibold text-[#005F5A]">{pdfFile.name}</p>
              ) : (
                <>
                  <p className="text-sm font-semibold text-gray-700">Click to upload PDF</p>
                  <p className="text-xs text-gray-400 mt-1">Only PDF files · Max 5MB</p>
                </>
              )}
            </label>

            {isVerified && (
              <p className="text-xs text-emerald-700 font-medium flex items-center gap-1.5">
                <CheckCircle size={12} /> Document verified. Upload is disabled.
              </p>
            )}
          </div>
        </SectionCard>

        {/* ── Submit ── */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-br from-[#005F5A] to-[#004845] text-white font-semibold text-sm rounded-xl shadow-lg shadow-[#005F5A]/25 hover:shadow-[#005F5A]/45 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
              Updating...
            </>
          ) : (
            "Update Profile"
          )}
        </button>

      </form>
    </div>
  );
};

export default ProfileUpdate;