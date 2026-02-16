import api from "@/utils/api";
import { Plus, Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MeetingsTab({ openModal }) {
  const [allMeetings, setAllMeetings] = useState([]);
  const [loading, setLoading] = useState(false);

  // pagination + sorting
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [sort, setSort] = useState("desc"); // desc | asc
  const [total, setTotal] = useState(0);
  const [user, setUser] = useState({});
  const isNotary = user?.role === "notary";

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    // const token = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      // sessionStorage.removeItem('user');
      window.location.href = "/login";
    }
    setUser(user);

  }, [])

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const res = await api.get(
        `/api/meeting/get-all-meetings?page=${page}&limit=${limit}&sort=${sort}`
      );

      setAllMeetings(res.data.meetings || []);
      setTotal(res.data.total || res.data.meetings?.length || 0);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [page, sort]);

  const meetingStatusConfig = {
    scheduled: {
      user: {
        label: "Schedule Meeting",
        href: (id) => `/dashboard/schedule/${id}`,
        className: "bg-indigo-600 hover:bg-indigo-700",
      },
      notary: {
        label: "Waiting for User",
        href: null,
        className: "bg-gray-400 cursor-not-allowed",
      },
    },

    payment_pending: {
      user: {
        label: "Schedule Meeting",
        href: (id) => `/dashboard/schedule/${id}`,
        className: "bg-indigo-600 hover:bg-indigo-700",
      },
      notary: {
        label: "Waiting for Payment",
        href: null,
        className: "bg-gray-400 cursor-not-allowed",
      },
    },

    paid: {
      user: {
        label: "Schedule Meeting",
        href: (id) => `/dashboard/schedule/${id}`,
        className: "bg-green-600 hover:bg-green-700",
      },
      notary: {
        label: "Waiting for Payment",
        href: null,
        className: "bg-gray-400 cursor-not-allowed",
      },
    },

    live: {
      user: {
        label: "Join Meeting",
        href: (id) => `/dashboard/view-meeting/${id}`,
        className: "bg-green-600 hover:bg-green-700",
      },
      notary: {
        label: "Join Meeting",
        href: (id) => `/dashboard/view-meeting/${id}`,
        className: "bg-green-600 hover:bg-green-700",
      },
    },

    ended: {
      user: {
        label: "Meeting Ended",
        href: (id) => `/dashboard/view-meeting/${id}`,
        className: "bg-red-700 hover:bg-red-800",
      },
      notary: {
        label: "Meeting Ended",
        href: (id) => `/dashboard/view-meeting/${id}`,
        className: "bg-red-700 hover:bg-red-800",
      },
    },

    payment_failed: {
      user: {
        label: "Retry Payment",
        href: (id) => `/dashboard/schedule/${id}`,
        className: "bg-orange-500 hover:bg-orange-600",
      },
      notary: {
        label: "Payment Failed",
        href: null,
        className: "bg-gray-400",
      },
    },
  };

  const totalPages = Math.ceil(total / limit);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

  const signingModeLabel = (mode) => {
    if (mode === "adhaarESign") return "Aadhaar eSign";
    if (mode === "dsc") return "DSC";
    if (mode === "NEKYC") return "NE-KYC";
    return "-";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-2xl sm:text-3xl font-bold">Meetings</h2>
        {!isNotary && (
          <Link
            href={'/dashboard/create-meeting'}
            className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-indigo-700"
          >
            <Plus className="w-4 h-4" /> Create Meeting
          </Link>
        )}
      </div>

      {/* Sort + Count */}
      <div className="bg-white rounded-xl border shadow">
        <div className="p-4 sm:p-6 border-b flex flex-col sm:flex-row justify-between gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => {
                setPage(1);
                setSort(e.target.value);
              }}
              className="border rounded px-2 py-1"
            >
              <option value="desc">Created Date ↓</option>
              <option value="asc">Created Date ↑</option>
            </select>
          </div>

          <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">
            {total} meeting{total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-5">
          {loading && <p className="text-center">Loading meetings...</p>}

          {!loading && allMeetings.length === 0 && (
            <p className="text-center text-gray-500">No meetings found</p>
          )}

          {!loading &&
            allMeetings.map((meeting) => (
              <div
                key={meeting._id}
                className="border rounded-xl p-5 sm:p-6"
              >
                <div className="flex flex-col lg:flex-row gap-6 justify-between">
                  {/* Left */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-xl sm:text-2xl font-bold">
                        {meeting.meetingTitle}
                      </h3>
                      <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium capitalize">
                        {meeting.status || "pending"}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-3">
                      {meeting.meetingDescription || "—"}
                    </p>

                    <span className="text-indigo-600 text-sm font-medium">
                      {signingModeLabel(meeting.signingMode)}
                    </span>

                    <div className="mt-4 text-sm text-gray-500 space-y-1">
                      <div>Created At: {formatDate(meeting.createdAt)}</div>
                      {/* <div>Meeting Date: Not finalised</div> */}
                      <div>Signatories: {meeting.signatories?.length || 0}</div>
                      <div>
                        Documents: {meeting.documentUrl?.pdf ? 1 : 0}
                      </div>
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-end">
                    {(() => {
                      const statusConfig = meetingStatusConfig[meeting.status];
                      if (!statusConfig) return null;

                      const roleConfig = isNotary ? statusConfig.notary : statusConfig.user;
                      if (!roleConfig) return null;

                      // Disabled button
                      if (!roleConfig.href) {
                        return (
                          <button
                            
                            className={`
          px-6 py-2.5 rounded-lg
          text-white font-medium
          ${roleConfig.className}
          opacity-70
        `}
                          >
                            {roleConfig.label}
                          </button>
                        );
                      }

                      // Active link
                      return (
                        <Link
                          href={roleConfig.href(meeting._id)}
                          className={`
        px-6 py-2.5 rounded-lg
        text-white font-medium
        transition
        ${roleConfig.className}
      `}
                        >
                          {roleConfig.label}
                        </Link>
                      );
                    })()}

                  </div>

                </div>
              </div>
            ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t flex justify-center gap-3">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Prev
            </button>

            <span className="px-4 py-2 text-sm">
              Page {page} of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="px-4 py-2 border rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
