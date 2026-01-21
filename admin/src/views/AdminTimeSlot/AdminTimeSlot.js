import React, { useEffect, useState } from "react";
import api from "../../components/api/api";
import {
    CTableDataCell,
    CTableRow,
    CSpinner,
} from "@coreui/react";
import Table from "../../components/Table/Table";
import Swal from "sweetalert2";
import toast from "react-hot-toast";

const AdminTimeSlot = () => {
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchTimeSlots = async () => {
        try {
            const res = await api.get("/api/advocate/get-time-slot");
            setTimeSlots(res.data?.timeSlot || []);
        } catch (error) {
            console.log("Internal server error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTimeSlots();
    }, []);

    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This time slot will be permanently deleted",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it!",
        });

        if (!result.isConfirmed) return;

        try {
            const res = await api.delete(`/api/advocate/delete-time-slot/${id}`);
            toast.success(res.data.message || "Time slot deleted");
            fetchTimeSlots(); // 🔁 refresh list
        } catch (error) {
            toast.error(
                error?.response?.data?.message || "Failed to delete time slot"
            );
        }
    };


    const heading = [
        "S.No",
        // "Advocate ID",
        "Date",
        "Start Time",
        "End Time",
        "Created At",
        "Action",
    ];

    return (
        <>
            {loading ? (
                <div className="spin-style">
                    <CSpinner color="primary" variant="grow" />
                </div>
            ) : (
                <Table
                    heading="All Time Slots"
                    tableHeading={heading}
                    btnText="Add Time Slot"
                    btnURL="/admin/add-time-slot"
                    tableContent={
                        timeSlots.length > 0 ? (
                            timeSlots.map((slot, index) => (
                                <CTableRow key={slot?._id}>
                                    {/* S.No */}
                                    <CTableDataCell>{index + 1}</CTableDataCell>

                                    {/* Advocate ID */}
                                    {/* <CTableDataCell>
                                        {slot?.advocateId ?? "N/A"}
                                    </CTableDataCell> */}

                                    {/* Date */}
                                    <CTableDataCell>
                                        {slot?.date
                                            ? new Date(slot.date).toLocaleDateString()
                                            : "N/A"}
                                    </CTableDataCell>

                                    {/* Start Time */}
                                    <CTableDataCell>
                                        {slot?.startTime ?? "N/A"}
                                    </CTableDataCell>

                                    {/* End Time */}
                                    <CTableDataCell>
                                        {slot?.endTime ?? "N/A"}
                                    </CTableDataCell>

                                    {/* Created At */}
                                    <CTableDataCell>
                                        {slot?.createdAt
                                            ? new Date(slot.createdAt).toLocaleString()
                                            : "N/A"}
                                    </CTableDataCell>

                                    {/* ACTION */}
                                    <CTableDataCell>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDelete(slot._id)}
                                        >
                                            Delete
                                        </button>
                                    </CTableDataCell>
                                </CTableRow>
                            ))
                        ) : (
                            <CTableRow>
                                <CTableDataCell colSpan={heading.length} className="text-center text-muted">
                                    No time slots found
                                </CTableDataCell>
                            </CTableRow>
                        )
                    }
                />
            )}
        </>
    );
};

export default AdminTimeSlot;
