import { useEffect, useMemo, useState } from "react";
import api from "../../components/api/api";
import {
    CTableDataCell,
    CTableRow,
    CSpinner,
    CBadge,
    CFormInput,
    CFormSelect,
    CPagination,
    CPaginationItem,
} from "@coreui/react";
import Table from "../../components/Table/Table";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const ITEMS_PER_PAGE = 5;

const AllMeetings = () => {
    const [meetings, setMeetings] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // 🔍 search & filter states
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);

    const fetchMeetings = async () => {
        try {
            setLoading(true);
            const res = await api.get("/api/admin/get-all-meetings");
            setMeetings(res.data.meetings || []);
        } catch (error) {
            console.log("Internal server error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMeetings();
    }, []);

    const handleDeleteMeeting = async (id) => {
        try {
            const res = await api.delete(`/api/admin/delete-meeting/${id}`);
            toast.success(res.data.message);
            fetchMeetings();
        } catch (error) {
            console.log("Internal server error", error)
        }
    }

    const confirmDelete = (id) => {
        Swal.fire({
            title: "Delete Meeting?",
            text: "This action cannot be undone!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            confirmButtonText: "Yes, delete",
        }).then((result) => {
            if (result.isConfirmed) {
                handleDeleteMeeting(id);
            }
        });
    };


    // 🔍 FILTER + SEARCH
    const filteredMeetings = useMemo(() => {
        return meetings.filter((m) => {
            const searchText = search.toLowerCase();

            const matchesSearch =
                m.meetingTitle?.toLowerCase().includes(searchText) ||
                m.userId?.name?.toLowerCase().includes(searchText) ||
                m.advocateId?.name?.toLowerCase().includes(searchText);

            const matchesStatus =
                statusFilter === "all" || m.status === statusFilter;

            return matchesSearch && matchesStatus;
        });
    }, [meetings, search, statusFilter]);

    // 📄 PAGINATION
    const totalPages = Math.ceil(filteredMeetings.length / ITEMS_PER_PAGE);
    const paginatedMeetings = filteredMeetings.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    const heading = [
        "S.No",
        "Meeting",
        "User",
        "Advocate",
        "Amount",
        "Status",
        "Document",
        "Signed",
        "Actions",
    ];

    return (
        <>
            {/* 🔍 SEARCH + FILTER UI */}
            <div className="d-flex gap-3 mb-3">
                <CFormInput
                    placeholder="Search by meeting, user or advocate..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                    }}
                />

                <CFormSelect
                    style={{ maxWidth: "200px" }}
                    value={statusFilter}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                >
                    <option value="all">All Status</option>
                    <option value="ended">Ended</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="cancelled">Cancelled</option>
                </CFormSelect>
            </div>

            {/* 🌀 LOADING */}
            {loading ? (
                <div className="spin-style">
                    <CSpinner color="primary" variant="grow" />
                </div>
            ) : (
                <>
                    {/* 📊 TABLE */}
                    <Table
                        heading="All Meetings"
                        tableHeading={heading}
                        tableContent={paginatedMeetings.map((meeting, index) => (
                            <CTableRow key={meeting._id}>
                                <CTableDataCell>
                                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                                </CTableDataCell>

                                <CTableDataCell>
                                    <strong>{meeting.meetingTitle}</strong>
                                    <p className="mb-0 text-muted text-sm">
                                        {meeting.meetingDescription}
                                    </p>
                                </CTableDataCell>

                                <CTableDataCell>
                                    <strong>{meeting.userId?.name}</strong>
                                    <p className="mb-0 text-muted text-sm">
                                        {meeting.userId?.email}
                                    </p>
                                </CTableDataCell>

                                <CTableDataCell>
                                    {meeting.advocateId ? (
                                        <>
                                            <strong>{meeting.advocateId?.name}</strong>
                                            <p className="mb-0 text-muted text-sm">
                                                {meeting.advocateId?.email}
                                            </p>
                                        </>
                                    ) : (
                                        <p>Advocate not assigned</p>
                                    )}
                                </CTableDataCell>

                                <CTableDataCell>
                                    ₹{meeting.amount} {meeting.currency}
                                </CTableDataCell>

                                <CTableDataCell>
                                    <CBadge
                                        color={
                                            meeting.status === "ended"
                                                ? "success"
                                                : meeting.status === "cancelled"
                                                    ? "danger"
                                                    : "warning"
                                        }
                                    >
                                        {meeting.status}
                                    </CBadge>
                                </CTableDataCell>

                                <CTableDataCell>
                                    {meeting.documentUrl?.pdf ? (
                                        <a
                                            href={meeting.documentUrl.pdf}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                        >
                                            View PDF
                                        </a>
                                    ) : (
                                        "N/A"
                                    )}
                                </CTableDataCell>

                                <CTableDataCell>
                                    <CBadge color={meeting.isSigned ? "success" : "danger"}>
                                        {meeting.isSigned ? "Signed" : "Not Signed"}
                                    </CBadge>
                                </CTableDataCell>
                                <CTableDataCell>
                                    <div className="d-flex gap-2">
                                        {/* 👁 View */}
                                        <button
                                            className="btn btn-sm btn-primary"
                                            onClick={() => navigate(`/meetings/meeting-detail/${meeting._id}`)}
                                        >
                                            View
                                        </button>

                                        {/* 🗑 Delete */}
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => confirmDelete(meeting._id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </CTableDataCell>

                            </CTableRow>
                        ))}
                    />

                    {/* 📄 PAGINATION */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-end mt-3">
                            <CPagination>
                                <CPaginationItem
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                >
                                    Prev
                                </CPaginationItem>

                                {[...Array(totalPages)].map((_, i) => (
                                    <CPaginationItem
                                        key={i}
                                        active={currentPage === i + 1}
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </CPaginationItem>
                                ))}

                                <CPaginationItem
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                >
                                    Next
                                </CPaginationItem>
                            </CPagination>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default AllMeetings;
