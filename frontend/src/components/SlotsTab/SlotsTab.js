import api from "@/utils/api";
import { useEffect, useState } from "react";
import { Clock, Calendar, CheckCircle } from "lucide-react";

/* ── HELPERS ── */
const formatDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const isToday = (dateStr) => {
  const d = new Date(dateStr);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
};

const sortByDateTime = (a, b) => {
  const dateA = new Date(a.date);
  const dateB = new Date(b.date);
  if (dateA.getTime() !== dateB.getTime()) return dateA - dateB;
  return a.startTime.localeCompare(b.startTime);
};

/* ── SLOT CARD (mobile) ── */
function SlotCard({ slot, today }) {
  return (
    <div
      className={`flex items-center justify-between gap-4 border rounded-2xl px-5 py-4 transition-all duration-200 hover:shadow-sm ${
        today
          ? "border-[#005F5A]/20 bg-[#E6F4F3]/40 hover:border-[#005F5A]/40"
          : "border-gray-100 bg-white hover:border-[#005F5A]/20"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${today ? "bg-[#005F5A]" : "bg-gray-100"}`}>
          <Calendar size={16} className={today ? "text-white" : "text-gray-500"} />
        </div>
        <div>
          <p className={`text-xs font-medium ${today ? "text-[#005F5A]" : "text-gray-400"}`}>
            {formatDate(slot.date)}
          </p>
          <p className="text-sm font-bold text-gray-900 mt-0.5">
            {slot.startTime} – {slot.endTime}
          </p>
        </div>
      </div>
      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full shrink-0">
        Standard
      </span>
    </div>
  );
}

/* ── SECTION LABEL ── */
function SectionLabel({ today, count }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className={`w-2 h-2 rounded-full ${today ? "bg-[#005F5A]" : "bg-gray-300"}`} />
      <span className={`text-[10px] font-bold tracking-[0.15em] uppercase ${today ? "text-[#005F5A]" : "text-gray-400"}`}>
        {today ? "Today" : "Upcoming"}
      </span>
      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${today ? "bg-[#E6F4F3] text-[#005F5A]" : "bg-gray-100 text-gray-500"}`}>
        {count}
      </span>
    </div>
  );
}

export default function SlotsTab() {
  const [allTimeSlots, setAllTimeSlots] = useState([]);

  const fetchTimeSlots = async () => {
    try {
      const response = await api.get("/api/advocate/get-all-time-slots");
      if (response.data.success) {
        setAllTimeSlots(response.data.timeSlots);
      }
    } catch (error) {
      console.log("Internal server error", error);
    }
  };

  useEffect(() => { fetchTimeSlots(); }, []);

  const sortedSlots = [...allTimeSlots].sort(sortByDateTime);
  const todaySlots = sortedSlots.filter((slot) => isToday(slot.date));
  const laterSlots = sortedSlots.filter((slot) => !isToday(slot.date));

  return (
    <div className="space-y-6 font-sans">

      {/* ── Header ── */}
      <div>
        <p className="text-[#00A896] text-xs font-bold tracking-[0.15em] uppercase mb-1">Dashboard</p>
        <h2
          className="text-2xl sm:text-3xl font-extrabold text-gray-900"
          style={{ fontFamily: "'Georgia', serif" }}
        >
          Available Timeslots
        </h2>
      </div>

      {/* ── Main Card ── */}
      <div className="bg-white rounded-3xl border border-[#005F5A]/10 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#005F5A] to-[#00A896]" />

        {/* Info bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E6F4F3] rounded-xl flex items-center justify-center">
            <Clock size={15} className="text-[#005F5A]" />
          </div>
          <p className="text-sm text-gray-500">
            Below are the currently available timeslots for notary services.
          </p>
          {allTimeSlots.length > 0 && (
            <span className="ml-auto text-xs font-semibold bg-[#E6F4F3] text-[#005F5A] px-3 py-1.5 rounded-full shrink-0">
              {allTimeSlots.length} slot{allTimeSlots.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── EMPTY STATE ── */}
        {allTimeSlots.length === 0 && (
          <div className="text-center py-16 px-6">
            <div className="w-16 h-16 bg-[#E6F4F3] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Clock size={28} className="text-[#005F5A]" />
            </div>
            <p
              className="text-lg font-bold text-gray-700 mb-1"
              style={{ fontFamily: "'Georgia', serif" }}
            >
              No slots available
            </p>
            <p className="text-sm text-gray-400">Check back later for available timeslots.</p>
          </div>
        )}

        {/* ── MOBILE VIEW ── */}
        {allTimeSlots.length > 0 && (
          <div className="md:hidden p-5 space-y-6">
            {todaySlots.length > 0 && (
              <div>
                <SectionLabel today count={todaySlots.length} />
                <div className="space-y-3">
                  {todaySlots.map((slot) => (
                    <SlotCard key={slot._id} slot={slot} today />
                  ))}
                </div>
              </div>
            )}

            {laterSlots.length > 0 && (
              <div>
                <SectionLabel today={false} count={laterSlots.length} />
                <div className="space-y-3">
                  {laterSlots.map((slot) => (
                    <SlotCard key={slot._id} slot={slot} today={false} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── DESKTOP TABLE ── */}
        {allTimeSlots.length > 0 && (
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr className="bg-gradient-to-r from-[#005F5A] to-[#007A73] text-white text-xs">
                  <th className="px-6 py-3.5 text-left font-semibold tracking-[0.06em] uppercase">Date</th>
                  <th className="px-6 py-3.5 text-left font-semibold tracking-[0.06em] uppercase">Time Slot</th>
                  <th className="px-6 py-3.5 text-left font-semibold tracking-[0.06em] uppercase">Type</th>
                </tr>
              </thead>

              <tbody className="text-sm divide-y divide-gray-50">

                {/* TODAY group */}
                {todaySlots.length > 0 && (
                  <>
                    <tr className="bg-[#E6F4F3]/60">
                      <td colSpan={3} className="px-6 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#005F5A] rounded-full" />
                          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-[#005F5A]">Today</span>
                          <span className="text-[10px] font-semibold bg-[#005F5A] text-white px-2 py-0.5 rounded-full">
                            {todaySlots.length}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {todaySlots.map((slot) => (
                      <tr
                        key={slot._id}
                        className="hover:bg-[#E6F4F3]/30 transition-colors duration-150 group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-[#005F5A] rounded-xl flex items-center justify-center shrink-0">
                              <Calendar size={14} className="text-white" />
                            </div>
                            <span className="font-medium text-gray-800">{formatDate(slot.date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Clock size={13} className="text-[#005F5A]" />
                            <span className="font-semibold">{slot.startTime} – {slot.endTime}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                            <CheckCircle size={10} /> Standard
                          </span>
                        </td>
                      </tr>
                    ))}
                  </>
                )}

                {/* LATER group */}
                {laterSlots.length > 0 && (
                  <>
                    <tr className="bg-gray-50/80">
                      <td colSpan={3} className="px-6 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                          <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-gray-400">Upcoming</span>
                          <span className="text-[10px] font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                            {laterSlots.length}
                          </span>
                        </div>
                      </td>
                    </tr>
                    {laterSlots.map((slot) => (
                      <tr
                        key={slot._id}
                        className="hover:bg-gray-50 transition-colors duration-150"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
                              <Calendar size={14} className="text-gray-400" />
                            </div>
                            <span className="font-medium text-gray-700">{formatDate(slot.date)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock size={13} className="text-gray-400" />
                            <span className="font-semibold">{slot.startTime} – {slot.endTime}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full">
                            <CheckCircle size={10} /> Standard
                          </span>
                        </td>
                      </tr>
                    ))}
                  </>
                )}

              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}