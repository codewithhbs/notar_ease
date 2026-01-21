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

const AllDemoMeetings = () => {
  const [allDemoMeeting, setAllDemoMeeting] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  /* ---------------- TABLE HEADINGS ---------------- */
  const heading = [
    "S.No",
    "Meeting Title",
    "User Name",
    "Email",
    "Phone",
    "Date",
    "Time Slot",
    "Meet Link",
    // "Status",
    "Created At",
    "Action",
  ];

  /* ---------------- FETCH DATA ---------------- */
  const fetchAllDemoMeetings = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(
        "/api/meetingDemo/get-all-demo-meetings"
      );
      setAllDemoMeeting(data?.data || []);
    } catch (error) {
      console.log("Internal server error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDemoMeetings();
  }, []);

  /* ---------------- SEARCH FILTER ---------------- */
  const filteredMeetings = useMemo(() => {
    if (!search) return allDemoMeeting;

    return allDemoMeeting.filter((m) =>
      [
        m.meetingTitle,
        m.userName,
        m.userLast,
        m.userEmail,
        m.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search, allDemoMeeting]);

  /* ---------------- PAGINATION ---------------- */
  const totalPages = Math.ceil(filteredMeetings.length / PAGE_SIZE);

  const paginatedMeetings = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredMeetings.slice(start, start + PAGE_SIZE);
  }, [filteredMeetings, page]);

  /* ---------------- DELETE ---------------- */
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This demo meeting will be deleted",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
    });

    if (!result.isConfirmed) return;

    try {
      await api.delete(`/api/meetingDemo/delete-demo-meeting/${id}`);
      toast.success("Demo meeting deleted");
      fetchAllDemoMeetings();
    } catch {
      toast.error("Failed to delete");
    }
  };

  /* ---------------- PAGE CHANGE ---------------- */
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
          placeholder="Search demo meetings..."
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
            heading="All Demo Meetings"
            tableHeading={heading}
            tableContent={
              paginatedMeetings.length > 0 ? (
                paginatedMeetings.map((meeting, index) => (
                  <CTableRow key={meeting._id}>
                    <CTableDataCell>
                      {(page - 1) * PAGE_SIZE + index + 1}
                    </CTableDataCell>

                    <CTableDataCell>
                      {meeting.meetingTitle}
                    </CTableDataCell>

                    <CTableDataCell>
                      {meeting.userName} {meeting.userLast}
                    </CTableDataCell>

                    <CTableDataCell>
                      {meeting.userEmail}
                    </CTableDataCell>

                    <CTableDataCell>
                      {meeting.userNumber}
                    </CTableDataCell>

                    <CTableDataCell>
                      {dayjs(meeting?.timeSlotId?.date).format(
                        "DD MMM YYYY"
                      )}
                    </CTableDataCell>

                    <CTableDataCell>
                      {meeting?.timeSlotId?.startTime} -{" "}
                      {meeting?.timeSlotId?.endTime}
                    </CTableDataCell>

                    <CTableDataCell>
                      {meeting.meetLink ? (
                        <a
                          href={meeting.meetLink}
                          target="_blank"
                          rel="noreferrer"
                          className="fw-bold text-primary"
                        >
                          Join
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </CTableDataCell>

                    {/* <CTableDataCell>
                      <span
                        className={`badge ${
                          meeting.status === "pending"
                            ? "bg-warning"
                            : "bg-success"
                        }`}
                      >
                        {meeting.status}
                      </span>
                    </CTableDataCell> */}

                    <CTableDataCell>
                      {dayjs(meeting.createdAt).format(
                        "DD MMM YYYY, hh:mm A"
                      )}
                    </CTableDataCell>

                    <CTableDataCell>
                      <button
                        className="btn btn-sm btn-danger text-white"
                        onClick={() => handleDelete(meeting._id)}
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
                    No demo meetings found
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
                  className={`btn btn-sm ${
                    page === i + 1
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

export default AllDemoMeetings;
