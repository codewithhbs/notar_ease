import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../components/api/api";
import toast from "react-hot-toast";
import {
  CCard,
  CCardBody,
  CCardHeader,
  CRow,
  CCol,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CFormLabel,
  CFormCheck,
  CButton,
  CSpinner,
} from "@coreui/react";

const emptySignatory = (overrides = {}) => ({
  name: "",
  email: "",
  CountryCode: "+91",
  MobileNo: "",
  DOB: "",
  Gender: "",
  PageNo: "",
  signPosition: "bottom-left",
  signingMode: "adhaarESign",
  idProof: null,
  ...overrides,
});

// Admin equivalent of the client-side /dashboard/create-meeting flow.
// Reuses the exact same backend contract (POST /api/meeting/create) - the
// backend now allows an admin to pass userId explicitly to create a meeting
// on behalf of a chosen client (see meeting.controller.js createMeeting).
const CreateMeeting = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedUserId, setSelectedUserId] = useState("");
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
  });

  const [signatories, setSignatories] = useState([emptySignatory()]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true);
        const res = await api.get("/api/admin/users");
        setUsers((res.data.users || []).filter((u) => (u.role || "user") === "user"));
      } catch (error) {
        console.log("Error fetching users", error);
        toast.error("Could not load users");
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  const updateSignatory = (index, key, value) => {
    setSignatories((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [key]: value };
      return copy;
    });
  };

  const addSignatory = () => setSignatories((prev) => [...prev, emptySignatory()]);

  const removeSignatory = (index) => {
    setSignatories((prev) => prev.filter((_, i) => i !== index));
  };

  const canUploadPDF =
    form.pdfReadCheckbox &&
    form.dateOfAppointmentCheckbox &&
    form.readyForSigningCheckbox &&
    form.electronicSignatureCheckbox;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedUserId) {
      toast.error("Please select the client this meeting is for");
      return;
    }
    if (!pdfFile) {
      toast.error("PDF document is required");
      return;
    }
    if (!form.agreedToTermsCheckbox) {
      toast.error("Please confirm the terms checkbox");
      return;
    }

    try {
      setSubmitting(true);

      const fd = new FormData();
      fd.append("userId", selectedUserId); // admin override - backend honors this only for admin role
      fd.append("meetingTitle", form.meetingTitle);
      fd.append("meetingDescription", form.meetingDescription);
      fd.append("signingMode", form.signingMode);

      signatories.forEach((s, i) => {
        const { idProof, PageNo, ...rest } = s;
        Object.entries(rest).forEach(([k, v]) => {
          fd.append(`signatories[${i}][${k}]`, v ?? "");
        });
        const pageArray = String(PageNo)
          .split(",")
          .map((p) => Number(p.trim()))
          .filter((p) => !isNaN(p) && p > 0);
        fd.append(`signatories[${i}][PageNo]`, JSON.stringify(pageArray));
        if (idProof) fd.append(`signatories[${i}][idProof]`, idProof);
      });

      Object.entries(form).forEach(([k, v]) => {
        if (typeof v === "boolean") fd.append(k, v.toString());
      });

      fd.append("documentUrl", pdfFile);

      const res = await api.post("/api/meeting/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Meeting created successfully");
      const meetingId = res?.data?.meeting?._id;
      if (meetingId) {
        navigate(`/meetings/meeting-detail/${meetingId}`);
      }
    } catch (error) {
      console.log("Error creating meeting", error);
      toast.error(error?.response?.data?.message || "Failed to create meeting");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CCard className="mb-4">
      <CCardHeader>
        <strong>Create Meeting</strong>{" "}
        <span className="text-muted small">(on behalf of a client)</span>
      </CCardHeader>
      <CCardBody>
        <form onSubmit={handleSubmit}>
          {/* Client picker */}
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel>Client *</CFormLabel>
              {loadingUsers ? (
                <CSpinner size="sm" />
              ) : (
                <CFormSelect
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  required
                >
                  <option value="">-- Select client --</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email})
                    </option>
                  ))}
                </CFormSelect>
              )}
            </CCol>
          </CRow>

          {/* Meeting info */}
          <CRow className="mb-3">
            <CCol md={6}>
              <CFormLabel>Meeting Title *</CFormLabel>
              <CFormInput
                name="meetingTitle"
                value={form.meetingTitle}
                onChange={handleFormChange}
                required
              />
            </CCol>
            <CCol md={6}>
              <CFormLabel>Signing Mode</CFormLabel>
              <CFormSelect name="signingMode" value={form.signingMode} onChange={handleFormChange}>
                <option value="adhaarESign">Aadhaar eSign</option>
                <option value="dsc">DSC</option>
                <option value="NEKYC">NE-KYC</option>
              </CFormSelect>
            </CCol>
          </CRow>

          <CRow className="mb-4">
            <CCol md={12}>
              <CFormLabel>Meeting Description</CFormLabel>
              <CFormTextarea
                name="meetingDescription"
                rows={3}
                value={form.meetingDescription}
                onChange={handleFormChange}
              />
            </CCol>
          </CRow>

          {/* Signatories */}
          <h6 className="mb-3">Signatories</h6>
          {signatories.map((s, i) => (
            <CCard key={i} className="mb-3 border">
              <CCardBody>
                <CRow className="mb-2">
                  <CCol md={4}>
                    <CFormLabel>Name</CFormLabel>
                    <CFormInput
                      value={s.name}
                      onChange={(e) => updateSignatory(i, "name", e.target.value)}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Email</CFormLabel>
                    <CFormInput
                      type="email"
                      value={s.email}
                      onChange={(e) => updateSignatory(i, "email", e.target.value)}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Mobile Number</CFormLabel>
                    <CFormInput
                      value={s.MobileNo}
                      onChange={(e) => updateSignatory(i, "MobileNo", e.target.value)}
                    />
                  </CCol>
                </CRow>
                <CRow className="mb-2">
                  <CCol md={4}>
                    <CFormLabel>Page Numbers (comma separated)</CFormLabel>
                    <CFormInput
                      placeholder="e.g. 1,2,5"
                      value={s.PageNo}
                      onChange={(e) => updateSignatory(i, "PageNo", e.target.value)}
                    />
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>Sign Position</CFormLabel>
                    <CFormSelect
                      value={s.signPosition}
                      onChange={(e) => updateSignatory(i, "signPosition", e.target.value)}
                    >
                      {[
                        "bottom-left", "bottom-center", "bottom-right",
                        "top-left", "top-center", "top-right",
                        "middle-left", "middle-center", "middle-right",
                      ].map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </CFormSelect>
                  </CCol>
                  <CCol md={4}>
                    <CFormLabel>ID Proof</CFormLabel>
                    <CFormInput
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={(e) => updateSignatory(i, "idProof", e.target.files[0])}
                    />
                  </CCol>
                </CRow>
                {signatories.length > 1 && (
                  <CButton color="danger" variant="outline" size="sm" onClick={() => removeSignatory(i)}>
                    Remove Signatory
                  </CButton>
                )}
              </CCardBody>
            </CCard>
          ))}

          <CButton color="secondary" variant="outline" size="sm" className="mb-4" onClick={addSignatory}>
            + Add Signatory
          </CButton>

          {/* Document prep checkboxes */}
          <h6 className="mb-3">Document Preparation</h6>
          <div className="mb-3">
            <CFormCheck
              name="pdfReadCheckbox"
              checked={form.pdfReadCheckbox}
              onChange={handleFormChange}
              label="Document has been read and prepared as per the guide."
            />
            <CFormCheck
              name="dateOfAppointmentCheckbox"
              checked={form.dateOfAppointmentCheckbox}
              onChange={handleFormChange}
              label="Document is dated for the appointment."
            />
            <CFormCheck
              name="readyForSigningCheckbox"
              checked={form.readyForSigningCheckbox}
              onChange={handleFormChange}
              label="Document is ready for signing."
            />
            <CFormCheck
              name="electronicSignatureCheckbox"
              checked={form.electronicSignatureCheckbox}
              onChange={handleFormChange}
              label="Document is electronically signed (where applicable)."
            />
          </div>

          {/* PDF upload */}
          <CRow className="mb-4">
            <CCol md={6}>
              <CFormLabel>Upload PDF *</CFormLabel>
              <CFormInput
                type="file"
                accept="application/pdf"
                disabled={!canUploadPDF}
                onChange={(e) => setPdfFile(e.target.files[0])}
              />
              {!canUploadPDF && (
                <div className="text-danger small mt-1">
                  Complete all document confirmations above to enable upload.
                </div>
              )}
            </CCol>
          </CRow>

          <CFormCheck
            className="mb-4"
            name="agreedToTermsCheckbox"
            checked={form.agreedToTermsCheckbox}
            onChange={handleFormChange}
            label="I confirm the signatories are aware of the document contents and are ready to produce it before the notary if requested."
          />

          <CButton type="submit" color="success" disabled={submitting}>
            {submitting ? "Creating..." : "Create Meeting"}
          </CButton>
        </form>
      </CCardBody>
    </CCard>
  );
};

export default CreateMeeting;
