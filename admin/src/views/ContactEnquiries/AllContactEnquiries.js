import React, { useEffect, useMemo, useState } from "react";
import api from "../../components/api/api";
import {
    CTableDataCell,
    CTableRow,
    CSpinner,
} from "@coreui/react";
import Table from "../../components/Table/Table";
import Swal from "sweetalert2";
import toast from "react-hot-toast";
import dayjs from "dayjs";

const PAGE_SIZE = 10;

const AllContactEnquiries = () => {
    const [allContactEnquiries, setAllContactEnquiries] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    /* ---------------- TABLE HEADINGS ---------------- */
    const heading = [
        "S.No",
        "Name",
        "Email",
        "Phone",
        "Message",
        "Created At",
        "Action",
    ];

    /* ---------------- FETCH DATA ---------------- */
    const fetchAllContactEnquiries = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(
                "/api/contact-enquiry/get-all-contact-enquiries"
            );
            //   console.log("data",data)
            setAllContactEnquiries(data?.data || []);
        } catch (error) {
            console.log("Internal server error", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllContactEnquiries();
    }, []);

    /* ---------------- SEARCH FILTER ---------------- */
    const filteredEnquiries = useMemo(() => {
        if (!search) return allContactEnquiries;

        return allContactEnquiries.filter((e) =>
            [e.name, e.email, e.phone, e.message]
                .join(" ")
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [search, allContactEnquiries]);

    /* ---------------- PAGINATION ---------------- */
    const totalPages = Math.ceil(filteredEnquiries.length / PAGE_SIZE);

    const paginatedEnquiries = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return filteredEnquiries.slice(start, start + PAGE_SIZE);
    }, [filteredEnquiries, page]);

    /* ---------------- DELETE ---------------- */
    const handleDelete = async (id) => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: "This contact enquiry will be deleted",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Yes, delete it",
        });

        if (!result.isConfirmed) return;

        try {
            await api.delete(
                `/api/contact-enquiry/delete-contact-enquiry/${id}`
            );
            toast.success("Contact enquiry deleted");
            fetchAllContactEnquiries();
        } catch {
            toast.error("Failed to delete");
        }
    };

    const changePage = (newPage) => {
        if (newPage < 1 || newPage > totalPages) return;
        setPage(newPage);
    };

    return (
        <>
            {/* 🔍 SEARCH BAR */}
            <div className="d-flex justify-content-end mb-3">
                <input
                    type="text"
                    placeholder="Search contact enquiries..."
                    className="form-control w-25"
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setPage(1);
                    }}
                />
            </div>

            {loading ? (
                <div className="spin-style">
                    <CSpinner color="primary" variant="grow" />
                </div>
            ) : (
                <>
                    <Table
                        heading="All Contact Enquiries"
                        tableHeading={heading}
                        tableContent={
                            paginatedEnquiries.length > 0 ? (
                                paginatedEnquiries.map((enquiry, index) => (
                                    <CTableRow key={enquiry._id}>
                                        {/* S.No */}
                                        <CTableDataCell>
                                            {(page - 1) * PAGE_SIZE + index + 1}
                                        </CTableDataCell>

                                        {/* Name */}
                                        <CTableDataCell>
                                            {enquiry.name}
                                        </CTableDataCell>

                                        {/* Email */}
                                        <CTableDataCell>
                                            {enquiry.email}
                                        </CTableDataCell>

                                        {/* Phone */}
                                        <CTableDataCell>
                                            {enquiry.phone}
                                        </CTableDataCell>

                                        {/* Message */}
                                        <CTableDataCell style={{ maxWidth: "300px" }}>
                                            <div className="text-truncate">
                                                {enquiry.message}
                                            </div>
                                        </CTableDataCell>

                                        {/* Created At */}
                                        <CTableDataCell>
                                            {dayjs(enquiry.createdAt).format(
                                                "DD MMM YYYY, hh:mm A"
                                            )}
                                        </CTableDataCell>

                                        {/* Action */}
                                        <CTableDataCell>
                                            <button
                                                className="btn btn-sm btn-danger text-white"
                                                onClick={() => handleDelete(enquiry._id)}
                                            >
                                                Delete
                                            </button>
                                        </CTableDataCell>
                                    </CTableRow>
                                ))
                            ) : (
                                <CTableRow>
                                    <CTableDataCell
                                        colSpan={heading.length}
                                        className="text-center text-muted"
                                    >
                                        No contact enquiries found
                                    </CTableDataCell>
                                </CTableRow>
                            )
                        }
                    />

                    {/* 📄 PAGINATION */}
                    {totalPages > 1 && (
                        <div className="d-flex justify-content-end gap-2 mt-3">
                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => changePage(page - 1)}
                                disabled={page === 1}
                            >
                                Prev
                            </button>

                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => changePage(i + 1)}
                                    className={`btn btn-sm ${page === i + 1
                                        ? "btn-primary"
                                        : "btn-outline-secondary"
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}

                            <button
                                className="btn btn-outline-secondary btn-sm"
                                onClick={() => changePage(page + 1)}
                                disabled={page === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}
        </>
    );
};

export default AllContactEnquiries;
