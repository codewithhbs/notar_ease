import api from "@/utils/api";
import React, { useEffect, useState } from "react";
import { Plus, Trash2, Clock, Calendar, X } from "lucide-react";

const TimeSlot = () => {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    startTime: "",
    endTime: "",
  });

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/advocate/get-time-slot");
      setSlots(res.data.timeSlot || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSlots(); }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleAddSlot = async (e) => {
    e.preventDefault();
    await api.post("/api/advocate/add-time-slot", formData);
    setOpenModal(false);
    setFormData({ date: "", startTime: "", endTime: "" });
    fetchSlots();
  };

  const handleDelete = async (id) => {
    await api.delete(`/api/advocate/delete-time-slot/${id}`);
    setSlots((prev) => prev.filter((s) => s._id !== id));
  };

  const normalizeDate = (date) => new Date(date).toISOString().split("T")[0];
  const today = normalizeDate(new Date());
  const tomorrow = normalizeDate(new Date(Date.now() + 86400000));

  const groups = {
    Today:    slots.filter((s) => normalizeDate(s.date) === today),
    Tomorrow: slots.filter((s) => normalizeDate(s.date) === tomorrow),
    Later:    slots.filter((s) => normalizeDate(s.date) > tomorrow),
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString("en-US", { weekday: "short" });
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "long" });
    const year = date.getFullYear();
    const suffix =
      day % 10 === 1 && day !== 11 ? "st" :
      day % 10 === 2 && day !== 12 ? "nd" :
      day % 10 === 3 && day !== 13 ? "rd" : "th";
    return `${dayName} ${day}${suffix} ${month} ${year}`;
  };

  const groupMeta = {
    Today:    { dot: "bg-[#005F5A]", label: "text-[#005F5A]", count: "bg-[#E6F4F3] text-[#005F5A]", cardBg: "bg-[#E6F4F3]/30 border-[#005F5A]/15 hover:border-[#005F5A]/30", iconBg: "bg-[#005F5A]", iconColor: "text-white", dateColor: "text-[#005F5A]" },
    Tomorrow: { dot: "bg-[#C9A84C]", label: "text-[#8B6914]", count: "bg-[#FBF5E6] text-[#8B6914]",  cardBg: "bg-[#FBF5E6]/40 border-[#C9A84C]/20 hover:border-[#C9A84C]/40", iconBg: "bg-[#FBF5E6]", iconColor: "text-[#C9A84C]", dateColor: "text-[#8B6914]" },
    Later:    { dot: "bg-gray-300",  label: "text-gray-400",  count: "bg-gray-100 text-gray-500",      cardBg: "bg-white border-gray-100 hover:border-[#005F5A]/15",            iconBg: "bg-gray-100",    iconColor: "text-gray-400",  dateColor: "text-gray-400" },
  };

  const inputClass =
    "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-[#005F5A] focus:ring-2 focus:ring-[#005F5A]/10 transition-all duration-200 bg-gray-50 focus:bg-white";

  const totalSlots = slots.length;

  return (
    <div className="mx-auto font-sans">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <p className="text-[#00A896] text-xs font-bold tracking-[0.15em] uppercase mb-1">Dashboard</p>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-gray-900"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            Time Slots
          </h1>
        </div>

        <button
          onClick={() => setOpenModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#005F5A] to-[#004845] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#005F5A]/20 hover:shadow-[#005F5A]/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          <Plus size={16} /> Add Time Slot
        </button>
      </div>

      {/* ── Main Card ── */}
      <div className="bg-white rounded-3xl border border-[#005F5A]/10 shadow-sm overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#005F5A] to-[#00A896]" />

        {/* Info bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-[#E6F4F3] rounded-xl flex items-center justify-center">
            <Clock size={15} className="text-[#005F5A]" />
          </div>
          <p className="text-sm text-gray-500">Manage your available notary time slots.</p>
          {totalSlots > 0 && (
            <span className="ml-auto text-xs font-semibold bg-[#E6F4F3] text-[#005F5A] px-3 py-1.5 rounded-full shrink-0">
              {totalSlots} slot{totalSlots !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div className="p-6 space-y-8">

          {/* Loading */}
          {loading && (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-100 rounded-2xl p-5 animate-pulse">
                  <div className="flex justify-between items-center">
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-32" />
                      <div className="h-4 bg-gray-100 rounded w-40" />
                    </div>
                    <div className="h-8 w-16 bg-gray-100 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && slots.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-[#E6F4F3] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Calendar size={28} className="text-[#005F5A]" />
              </div>
              <p
                className="text-lg font-bold text-gray-700 mb-1"
                style={{ fontFamily: "'Georgia', serif" }}
              >
                No slots added yet
              </p>
              <p className="text-sm text-gray-400 mb-6">Click "Add Time Slot" to create your first slot.</p>
              <button
                onClick={() => setOpenModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-[#005F5A] to-[#004845] text-white text-sm font-semibold rounded-xl shadow-md shadow-[#005F5A]/20 hover:shadow-[#005F5A]/40 hover:-translate-y-0.5 transition-all duration-200"
              >
                <Plus size={15} /> Add Time Slot
              </button>
            </div>
          )}

          {/* Slot Groups */}
          {!loading &&
            Object.entries(groups).map(([title, list]) =>
              list.length > 0 ? (
                <div key={title}>
                  {/* Group label */}
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className={`w-2 h-2 rounded-full ${groupMeta[title].dot}`} />
                    <span className={`text-[10px] font-bold tracking-[0.15em] uppercase ${groupMeta[title].label}`}>
                      {title}
                    </span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${groupMeta[title].count}`}>
                      {list.length}
                    </span>
                  </div>

                  {/* Slot Cards */}
                  <div className="space-y-3">
                    {list.map((slot) => (
                      <div
                        key={slot._id}
                        className={`flex items-center justify-between gap-4 border rounded-2xl px-5 py-4 transition-all duration-200 hover:shadow-sm ${groupMeta[title].cardBg}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${groupMeta[title].iconBg}`}>
                            <Calendar size={16} className={groupMeta[title].iconColor} />
                          </div>
                          <div>
                            <p className={`text-xs font-medium ${groupMeta[title].dateColor}`}>
                              {formatDate(slot.date)}
                            </p>
                            <p className="text-sm font-bold text-gray-900 mt-0.5 flex items-center gap-1.5">
                              <Clock size={12} className="text-gray-400" />
                              {slot.startTime} – {slot.endTime}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDelete(slot._id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all duration-150"
                        >
                          <Trash2 size={13} /> Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null
            )}
        </div>
      </div>

      {/* ── MODAL ── */}
      {openModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="h-1 bg-gradient-to-r from-[#005F5A] to-[#00A896]" />

            <div className="p-7">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E6F4F3] rounded-xl flex items-center justify-center">
                    <Plus size={18} className="text-[#005F5A]" />
                  </div>
                  <h3
                    className="text-lg font-bold text-gray-900"
                    style={{ fontFamily: "'Georgia', serif" }}
                  >
                    Add Time Slot
                  </h3>
                </div>
                <button
                  onClick={() => setOpenModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all duration-150"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleAddSlot} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.08em] uppercase text-[#005F5A] mb-1.5">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                    className={inputClass}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.08em] uppercase text-[#005F5A] mb-1.5">
                      Start Time
                    </label>
                    <input
                      type="time"
                      name="startTime"
                      required
                      value={formData.startTime}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold tracking-[0.08em] uppercase text-[#005F5A] mb-1.5">
                      End Time
                    </label>
                    <input
                      type="time"
                      name="endTime"
                      required
                      value={formData.endTime}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setOpenModal(false)}
                    className="flex-1 px-4 py-3 text-sm font-semibold border border-gray-200 rounded-xl text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-all duration-150"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 text-sm font-semibold bg-gradient-to-br from-[#005F5A] to-[#004845] text-white rounded-xl shadow-md shadow-[#005F5A]/20 hover:shadow-[#005F5A]/40 hover:-translate-y-0.5 transition-all duration-200"
                  >
                    Save Slot
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimeSlot;