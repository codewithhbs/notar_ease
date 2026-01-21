import React, { useState } from "react";
import Form from "../../components/Form/Form";
import {
  CCol,
  CFormInput,
  CFormLabel,
  CButton,
} from "@coreui/react";
import toast from "react-hot-toast";
import api from "../../components/api/api";

const AddAdminTimeSlot = () => {
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post(
        "/api/advocate/add-time-slot",
        formData
      );

      toast.success(res?.data?.message || "Time slot added");

      setFormData({
        date: "",
        startTime: "",
        endTime: "",
      });
    } catch (error) {
        console.log("Internal server error", error)
      toast.error(
        error?.response?.data?.message ||
          "Internal server error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      heading="Add Time Slot"
      btnText="Back"
      btnURL="/admin/all-time-slots"
      onSubmit={handleSubmit}
      formContent={
        <>
          {/* Date */}
          <CCol md={6}>
            <CFormLabel>Date</CFormLabel>
            <CFormInput
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </CCol>

          {/* Start Time */}
          <CCol md={3}>
            <CFormLabel>Start Time</CFormLabel>
            <CFormInput
              type="time"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
          </CCol>

          {/* End Time */}
          <CCol md={3}>
            <CFormLabel>End Time</CFormLabel>
            <CFormInput
              type="time"
              name="endTime"
              value={formData.endTime}
              onChange={handleChange}
              required
            />
          </CCol>

          {/* Submit */}
          <CCol xs={12} className="mt-3">
            <CButton type="submit" disabled={loading}>
              {loading ? "Please wait..." : "Add Time Slot"}
            </CButton>
          </CCol>
        </>
      }
    />
  );
};

export default AddAdminTimeSlot;
