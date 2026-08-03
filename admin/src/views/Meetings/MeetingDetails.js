import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../components/api/api";
import {
  CCard,
  CCardBody,
  CRow,
  CCol,
  CBadge,
  CSpinner,
  CButton,
  CListGroup,
  CListGroupItem,
  CFormSelect,
  CFormInput,
  CFormLabel,
} from "@coreui/react";
import toast from "react-hot-toast";

const PAYMENT_STATUS_OPTIONS = ["pending", "success", "failed", "refunded"];

const MeetingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // editable payment fields
  const [paymentStatus, setPaymentStatus] = useState("pending");
  const [transactionId, setTransactionId] = useState("");
  const [paidAt, setPaidAt] = useState("");

  const fetchMeetingDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/admin/get-meeting/${id}`);
      const m = res.data.meeting;
      setMeeting(m);
      setPaymentStatus(m.payment?.status || "pending");
      setTransactionId(m.payment?.transactionId || "");
      setPaidAt(m.payment?.paidAt ? m.payment.paidAt.slice(0, 10) : "");
    } catch (error) {
      console.log("Error fetching meeting details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetingDetails();
  }, [id]);

  const handleUpdatePayment = async () => {
    try {
      setSaving(true);
      const res = await api.put(`/api/admin/update-payment-details/${id}`, {
        paymentStatus,
        transactionId,
        paidAt: paidAt || undefined,
      });
      toast.success(res.data.message || "Payment updated");
      // setMeeting(res.data.meeting || meeting);
      fetchMeetingDetails(); // Refresh meeting details after update
    } catch (error) {
      console.log("Error updating payment", error);
      toast.error(error?.response?.data?.message || "Failed to update payment");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="spin-style">
        <CSpinner color="primary" />
      </div>
    );
  }

  if (!meeting) return null;

  return (
    <>
      {/* 🔙 BACK */}
      <div className="mb-3">
        <CButton color="secondary" onClick={() => navigate(-1)}>
          ← Back
        </CButton>
      </div>

      {/* 🧾 MEETING INFO */}
      <CCard className="mb-4">
        <CCardBody>
          <h4>{meeting.meetingTitle}</h4>
          <p className="text-muted">{meeting.meetingDescription}</p>

          <div className="d-flex gap-3 flex-wrap">
            <CBadge color="info">{meeting.signingMode}</CBadge>
            <CBadge color={meeting.status === "ended" ? "success" : "warning"}>
              {meeting.status}
            </CBadge>
            <CBadge color={meeting.isSigned ? "success" : "danger"}>
              {meeting.isSigned ? "Signed" : "Not Signed"}
            </CBadge>
          </div>
        </CCardBody>
      </CCard>

      <CRow>
        {/* 👤 USER */}
        <CCol md={6}>
          <CCard className="mb-4">
            <CCardBody>
              <h5>User Details</h5>
              <p><strong>Name:</strong> {meeting.userId?.name}</p>
              <p><strong>Email:</strong> {meeting.userId?.email}</p>
              <p><strong>Phone:</strong> {meeting.userId?.phone}</p>
              <p><strong>Country:</strong> {meeting.userId?.country}</p>
            </CCardBody>
          </CCard>
        </CCol>

        {/* ⚖ ADVOCATE */}
        <CCol md={6}>
          <CCard className="mb-4">
            <CCardBody>
              <h5>Advocate Details</h5>
              <p><strong>Name:</strong> {meeting.advocateId?.name}</p>
              <p><strong>Email:</strong> {meeting.advocateId?.email}</p>
              <p><strong>Phone:</strong> {meeting.advocateId?.phone}</p>
              <p><strong>Jurisdiction:</strong> {meeting.advocateId?.advocateJurisdiction}</p>
              <p><strong>Reg No:</strong> {meeting.advocateId?.advocateRegistrationNo}</p>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* ✍ SIGNATORIES */}
      <CCard className="mb-4">
        <CCardBody>
          <h5>Signatories ({meeting.signatoryCount})</h5>
          <CListGroup>
            {meeting.signatories.map((s, index) => (
              <CListGroupItem key={s._id}>
                <strong>{index + 1}. {s.name}</strong>  
                <div className="text-muted">
                  {s.email} | {s.MobileNo} | Page {s.PageNo} | {s.signPosition}
                </div>
              </CListGroupItem>
            ))}
          </CListGroup>
        </CCardBody>
      </CCard>

      <CRow>
        {/* 💰 PAYMENT */}
        <CCol md={6}>
          <CCard className="mb-4">
            <CCardBody>
              <h5>Payment</h5>
              <p><strong>Amount:</strong> ₹{meeting.amount} {meeting.currency}</p>
              <p><strong>Method:</strong> {meeting.payment?.method}</p>

              <CFormLabel className="mt-2">Payment Status</CFormLabel>
              <CFormSelect
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="mb-2"
              >
                {PAYMENT_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </CFormSelect>

              <CFormLabel>Transaction ID</CFormLabel>
              <CFormInput
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="razorpay payment id"
                className="mb-2"
              />

              <CFormLabel>Paid At</CFormLabel>
              <CFormInput
                type="date"
                value={paidAt}
                onChange={(e) => setPaidAt(e.target.value)}
                className="mb-3"
              />

              <CButton color="success" size="sm" disabled={saving} onClick={handleUpdatePayment}>
                {saving ? "Saving..." : "Save Payment Details"}
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>

        {/* 📄 DOCUMENTS */}
        <CCol md={6}>
          <CCard className="mb-4">
            <CCardBody>
              <h5>Documents</h5>

              {meeting.documentUrl?.pdf && (
                <p>
                  <a href={meeting.documentUrl.pdf} target="_blank" rel="noreferrer">
                    View Original PDF
                  </a>
                </p>
              )}

              {/* {meeting.signedDocumentUrl && (
                <p>
                  <a href={meeting.signedDocumentUrl} target="_blank" rel="noreferrer">
                    View Signed Document
                  </a>
                </p>
              )} */}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  );
};

export default MeetingDetails;
