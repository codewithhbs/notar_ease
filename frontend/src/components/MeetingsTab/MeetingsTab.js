import api from "@/utils/api";
import { Plus, Calendar, FileText, Users, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function MeetingsTab({ openModal }) {
  const [allMeetings, setAllMeetings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [sort, setSort] = useState("desc");
  const [total, setTotal] = useState(0);
  const [user, setUser] = useState({});
  const isNotary = user?.role === "notary";

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) { window.location.href = "/login"; }
    setUser(user);
  }, []);

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

  useEffect(() => { fetchMeetings(); }, [page, sort]);

  const meetingStatusConfig = {
    scheduled: {
      user:   { label: "Schedule Meeting",   href: (id) => `/dashboard/schedule/${id}`,     className: "bg-gradient-to-br from-[#005F5A] to-[#004845] hover:shadow-[#005F5A]/30 hover:shadow-md" },
      notary: { label: "Waiting for User",   href: null,                                      className: "bg-gray-300 cursor-not-allowed" },
    },
    payment_pending: {
      user:   { label: "Schedule Meeting",   href: (id) => `/dashboard/schedule/${id}`,     className: "bg-gradient-to-br from-[#005F5A] to-[#004845] hover:shadow-[#005F5A]/30 hover:shadow-md" },
      notary: { label: "Waiting for Payment",href: null,                                      className: "bg-gray-300 cursor-not-allowed" },
    },
    paid: {
      user:   { label: "Schedule Meeting",   href: (id) => `/dashboard/schedule/${id}`,     className: "bg-gradient-to-br from-green-600 to-green-700 hover:shadow-green-500/30 hover:shadow-md" },
      notary: { label: "Waiting for Payment",href: null,                                      className: "bg-gray-300 cursor-not-allowed" },
    },
    live: {
      user:   { label: "Join Meeting",       href: (id) => `/dashboard/view-meeting/${id}`, className: "bg-gradient-to-br from-green-500 to-green-700 hover:shadow-green-500/30 hover:shadow-md" },
      notary: { label: "Join Meeting",       href: (id) => `/dashboard/view-meeting/${id}`, className: "bg-gradient-to-br from-green-500 to-green-700 hover:shadow-green-500/30 hover:shadow-md" },
    },
    ended: {
      user:   { label: "Meeting Ended",      href: (id) => `/dashboard/view-meeting/${id}`, className: "bg-gradient-to-br from-red-600 to-red-800 hover:shadow-red-500/30 hover:shadow-md" },
      notary: { label: "Meeting Ended",      href: (id) => `/dashboard/view-meeting/${id}`, className: "bg-gradient-to-br from-red-600 to-red-800 hover:shadow-red-500/30 hover:shadow-md" },
    },
    payment_failed: {
      user:   { label: "Retry Payment",      href: (id) => `/dashboard/schedule/${id}`,     className: "bg-gradient-to-br from-orange-500 to-orange-600 hover:shadow-orange-500/30 hover:shadow-md" },
      notary: { label: "Payment Failed",     href: null,                                      className: "bg-gray-300 cursor-not-allowed" },
    },
  };

  const statusBadgeConfig = {
    scheduled:       "bg-blue-50 text-blue-700 border border-blue-200",
    payment_pending: "bg-amber-50 text-amber-700 border border-amber-200",
    paid:            "bg-emerald-50 text-emerald-700 border border-emerald-200",
    live:            "bg-green-50 text-green-700 border border-green-200 animate-pulse",
    ended:           "bg-red-50 text-red-700 border border-red-200",
    payment_failed:  "bg-orange-50 text-orange-700 border border-orange-200",
  };

  const totalPages = Math.ceil(total / limit);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });

  const signingModeLabel = (mode) => {
    if (mode === "adhaarESign") return "Aadhaar eSign";
    if (mode === "dsc") return "DSC";
    if (mode === "NEKYC") return "NE-KYC";
    return "-";
  };

  const signingModeBadge = (mode) => {
    if (mode === "adhaarESign") return "bg-[#E6F4F3] text-[#005F5A]";
    if (mode === "dsc") return "bg-gray-100 text-gray-700";
    if (mode === "NEKYC") return "bg-[#FBF5E6] text-[#8B6914]";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="space-y-6 font-sans">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-[#00A896] text-xs font-bold tracking-[0.15em] uppercase mb-1">Dashboard</p>
          <h2
            className="text-2xl sm:text-3xl font-extrabold text-gray-900"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Meetings
          </h2>
        </div>

        {!isNotary && (
          <Link
            href="/dashboard/create-meeting"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#005F5A] to-[#004845] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#005F5A]/20 hover:shadow-[#005F5A]/40 hover:-translate-y-0.5 transition-all duration-200"
          >
            <Plus size={16} /> Create Meeting
          </Link>
        )}
      </div>

      {/* ── Main Card ── */}
      <div className="bg-white rounded-3xl border border-[#005F5A]/10 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#005F5A] to-[#00A896]" />

        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown size={14} className="text-gray-400" />
            <span className="text-xs font-bold tracking-[0.08em] uppercase text-gray-500">Sort:</span>
            <select
              value={sort}
              onChange={(e) => { setPage(1); setSort(e.target.value); }}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-gray-50 focus:outline-none focus:border-[#005F5A] focus:ring-1 focus:ring-[#005F5A]/20 transition-all"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>

          <span className="text-xs font-semibold bg-[#E6F4F3] text-[#005F5A] px-3 py-1.5 rounded-full">
            {total} meeting{total !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Meeting List */}
        <div className="p-6 space-y-4">

          {/* Loading skeleton */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-6 animate-pulse">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="h-5 bg-gray-100 rounded w-2/5" />
                      <div className="h-3 bg-gray-100 rounded w-3/5" />
                      <div className="h-3 bg-gray-100 rounded w-1/4" />
                    </div>
                    <div className="h-9 w-32 bg-gray-100 rounded-xl self-end" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && allMeetings.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-[#E6F4F3] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar size={28} className="text-[#005F5A]" />
              </div>
              <p
                className="text-lg font-bold text-gray-700 mb-1"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                No meetings yet
              </p>
              <p className="text-sm text-gray-400">Create your first meeting to get started.</p>
            </div>
          )}

          {/* Meeting Cards */}
          {!loading && allMeetings.map((meeting, idx) => {
            const statusConfig = meetingStatusConfig[meeting.status];
            const roleConfig = isNotary ? statusConfig?.notary : statusConfig?.user;
            const badgeClass = statusBadgeConfig[meeting.status] || "bg-gray-100 text-gray-600 border border-gray-200";

            return (
              <div
                key={meeting._id}
                className="border border-gray-100 rounded-2xl p-5 sm:p-6 hover:border-[#005F5A]/20 hover:shadow-sm transition-all duration-200 group"
              >
                <div className="flex flex-col lg:flex-row gap-5 justify-between">

                  {/* Left */}
                  <div className="flex-1 min-w-0">
                    {/* Title + Status */}
                    <div className="flex flex-wrap items-center gap-2.5 mb-2">
                      <h3
                        className="text-lg font-bold text-gray-900 truncate"
                        style={{ fontFamily: "'Georgia', serif" }}
                      >
                        {meeting.meetingTitle}
                      </h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${badgeClass}`}>
                        {meeting.status?.replace(/_/g, " ") || "pending"}
                      </span>
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${signingModeBadge(meeting.signingMode)}`}>
                        {signingModeLabel(meeting.signingMode)}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-sm text-gray-500 mb-4 leading-relaxed line-clamp-2">
                      {meeting.meetingDescription || "—"}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-[#005F5A]" />
                        <span>Created {formatDate(meeting.createdAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Users size={12} className="text-[#005F5A]" />
                        <span>{meeting.signatories?.length || 0} signatories</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <FileText size={12} className="text-[#005F5A]" />
                        <span>{meeting.documentUrl?.pdf ? 1 : 0} document</span>
                      </div>
                    </div>
                  </div>

                  {/* Right — CTA */}
                  {roleConfig && (
                    <div className="flex items-end shrink-0">
                      {roleConfig.href ? (
                        <Link
                          href={roleConfig.href(meeting._id)}
                          className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all duration-200 ${roleConfig.className}`}
                        >
                          {roleConfig.label}
                        </Link>
                      ) : (
                        <button
                          disabled
                          className={`px-5 py-2.5 rounded-xl text-white text-sm font-semibold opacity-60 ${roleConfig.className}`}
                        >
                          {roleConfig.label}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:border-[#005F5A] hover:text-[#005F5A] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              <ChevronLeft size={15} /> Prev
            </button>

            <span className="text-xs text-gray-500 font-medium">
              Page <span className="text-[#005F5A] font-bold">{page}</span> of {totalPages}
            </span>

            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl text-gray-600 hover:border-[#005F5A] hover:text-[#005F5A] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}