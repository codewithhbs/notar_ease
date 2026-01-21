"use client";
import api from "@/utils/api";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { toast } from "react-toastify";
dayjs.extend(utc);

/* ---------------- STEP ANIMATION ---------------- */
const AnimatedStep = ({ children }) => {
    return (
        <div className="animate-[fadeSlide_0.35s_ease-out]">
            {children}
        </div>
    );
};

export default function DemoMeetingModal({ onClose }) {
    const [slots, setSlots] = useState([]);
    const [step, setStep] = useState(1);
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [currentMonth, setCurrentMonth] = useState(dayjs());
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        meetingTitle: "Demo Meeting",
        userName: "",
        userLast: "",
        userEmail: "",
        userNumber: "",
    });

    /* ---------------- FETCH SLOTS ---------------- */
    useEffect(() => {
        const fetchSlots = async () => {
            try {
                const res = await api.get("/api/advocate/get-admin-time-slot");
                setSlots(res.data?.timeSlots || []);
            } catch {
                setSlots([]);
            }
        };
        fetchSlots();
    }, []);

    /* ---------------- SLOT MAP (UTC SAFE) ---------------- */
    const slotMap = useMemo(() => {
        return slots.reduce((acc, s) => {
            const cleanDate = dayjs.utc(s.date).format("YYYY-MM-DD");
            if (!acc[cleanDate]) acc[cleanDate] = [];
            acc[cleanDate].push(s);
            return acc;
        }, {});
    }, [slots]);

    /* ---------------- CALENDAR LOGIC ---------------- */
    const startOfMonth = currentMonth.startOf("month");
    const daysInMonth = currentMonth.daysInMonth();
    const startDay = startOfMonth.day();

    const calendarDays = [];
    for (let i = 0; i < startDay; i++) calendarDays.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
        calendarDays.push(currentMonth.date(d));
    }

    const isPast = (date) =>
        dayjs.utc(date).isBefore(dayjs.utc(), "day");

    const hasSlot = (date) =>
        slotMap[dayjs.utc(date).format("YYYY-MM-DD")]?.length > 0;

    /* ---------------- SUBMIT ---------------- */
    const submitMeeting = async () => {
        if (!formData.userName || !formData.userEmail) {
            alert("Please fill all required fields");
            return;
        }

        try {
            // console.log("formData", formData)
            setLoading(true);
            await api.post("/api/meetingDemo/create-demo-meeting", {
                ...formData,
                timeSlotId: selectedSlot._id,
            });
            // alert("Demo booked successfully");
            toast.success("Demo booked successfully");
            onClose();
        } catch (error) {
            console.log("Internal server error", error)
            toast.error(error.response?.data?.message || "Something went wrong");
            // alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center px-4 py-6 sm:py-0 overflow-y-auto">

            <div className="bg-white w-full max-w-5xl rounded-3xl shadow-2xl overflow-hidden relative max-h-[90vh] sm:max-h-none">

                {/* ================= HEADER ================= */}
                <div className="flex justify-between items-center px-6 sm:px-8 py-4 sm:py-5 border-b bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
                    <div>
                        <h2 className="text-lg sm:text-2xl font-bold">
                            Omm Documentation – Online Demo Session
                        </h2>
                        <p className="text-xs sm:text-sm text-indigo-100">
                            Schedule a guided Google Meet demo with our experts
                        </p>
                    </div>
                    <button onClick={onClose}>
                        <X />
                    </button>
                </div>

                {/* ================= BODY ================= */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-0 sm:min-h-[520px]">

                    {/* LEFT INFO (DESKTOP ONLY) */}
                    <div className="hidden lg:flex flex-col justify-between bg-gradient-to-br from-indigo-50 to-blue-50 p-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">What to expect?</h3>
                            <ul className="space-y-4 text-sm text-gray-700">
                                <li>✔ Live Google Meet session</li>
                                <li>✔ Complete documentation walkthrough</li>
                                <li>✔ Real-time expert guidance</li>
                                <li>✔ Secure & compliant process</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl p-5 shadow-md">
                            <p className="text-sm text-gray-700">
                                <strong>Omm Documentation</strong> experts will personally guide
                                you step-by-step on Google Meet, ensuring a smooth demo
                                experience.
                            </p>
                        </div>
                    </div>

                    {/* RIGHT PANEL */}
                    <div className="col-span-2 p-5 sm:p-8 overflow-y-auto sm:overflow-visible">

                        {/* ================= STEP INDICATOR ================= */}
                        <div className="flex items-center justify-between mb-6">
                            {[1, 2, 3].map((s, i) => (
                                <div key={s} className="flex-1 flex items-center">
                                    <div
                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${step >= s ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-500"}`}
                                    >
                                        {s}
                                    </div>
                                    {i !== 2 && (
                                        <div
                                            className={`flex-1 h-[2px] mx-3
                        ${step > s ? "bg-indigo-600" : "bg-gray-200"}`}
                                        />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* ================= STEP 1 : CALENDAR ================= */}
                        {step === 1 && (
                            <AnimatedStep>
                                <div className="flex items-center justify-between mb-6">
                                    <button onClick={() => setCurrentMonth(m => m.subtract(1, "month"))}>
                                        <ChevronLeft />
                                    </button>
                                    <h3 className="font-semibold">{currentMonth.format("MMMM YYYY")}</h3>
                                    <button onClick={() => setCurrentMonth(m => m.add(1, "month"))}>
                                        <ChevronRight />
                                    </button>
                                </div>

                                <div className="grid grid-cols-7 text-xs text-center mb-2 text-gray-500">
                                    {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map(d => (
                                        <div key={d}>{d}</div>
                                    ))}
                                </div>

                                <div className="grid grid-cols-7 gap-3">
                                    {calendarDays.map((date, idx) => {
                                        if (!date) return <div key={idx} />;
                                        const past = isPast(date);
                                        const available = hasSlot(date);

                                        return (
                                            <button
                                                key={idx}
                                                disabled={past || !available}
                                                onClick={() => {
                                                    setSelectedDate(date.format("YYYY-MM-DD"));
                                                    setStep(2);
                                                }}
                                                className={`h-11 sm:h-12 rounded-full text-sm font-semibold
                          ${past ? "bg-gray-100 text-gray-400 line-through" : ""}
                          ${!past && !available ? "bg-red-50 text-red-400 line-through" : ""}
                          ${available && !past ? "bg-green-500 text-white hover:bg-green-600" : ""}
                        `}
                                            >
                                                {date.date()}
                                            </button>
                                        );
                                    })}
                                </div>
                            </AnimatedStep>
                        )}

                        {/* ================= STEP 2 : SLOTS ================= */}
                        {step === 2 && (
                            <AnimatedStep>
                                <h3 className="text-xl font-bold mb-1">Select a Time Slot</h3>
                                <p className="text-sm text-gray-600 mb-6">
                                    {dayjs(selectedDate).format("dddd, DD MMMM YYYY")}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {slotMap[selectedDate]?.map(slot => (
                                        <button
                                            key={slot._id}
                                            onClick={() => {
                                                setSelectedSlot(slot);
                                                setStep(3);
                                            }}
                                            className="border rounded-2xl p-5 text-left hover:border-indigo-600 hover:shadow-lg"
                                        >
                                            <p className="text-xs text-gray-500">Google Meet • 30 Minutes</p>
                                            <p className="text-lg font-bold mt-1">
                                                {dayjs(`1970-01-01 ${slot.startTime}`).format("hh:mm A")}
                                                {" – "}
                                                {dayjs(`1970-01-01 ${slot.endTime}`).format("hh:mm A")}
                                            </p>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => setStep(1)}
                                    className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm"
                                >
                                    ← Change Date
                                </button>
                            </AnimatedStep>
                        )}

                        {/* ================= STEP 3 : FORM ================= */}
                        {step === 3 && (
                            <AnimatedStep>
                                <h3 className="text-xl font-bold mb-6">Enter Your Details</h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        placeholder="First Name"
                                        className="border rounded-xl p-4"
                                        onChange={e => setFormData({ ...formData, userName: e.target.value })}
                                    />
                                    <input
                                        placeholder="Last Name"
                                        className="border rounded-xl p-4"
                                        onChange={e => setFormData({ ...formData, userLast: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        placeholder="Email Address"
                                        className="border rounded-xl p-4 mt-4"
                                        onChange={e => setFormData({ ...formData, userEmail: e.target.value })}
                                    />
                                    <input
                                        placeholder="Phone Number"
                                        className="border rounded-xl p-4 mt-4"
                                        onChange={e => setFormData({ ...formData, userNumber: e.target.value })}
                                    />
                                </div>

                                <div className="flex flex-col-reverse sm:flex-row gap-4 sm:justify-between mt-8">
                                    <button
                                        onClick={() => setStep(2)}
                                        className="px-4 py-2 rounded-full border text-sm"
                                    >
                                        ← Back to Time Slots
                                    </button>

                                    <button
                                        onClick={submitMeeting}
                                        disabled={loading}
                                        className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-8 py-3 rounded-xl font-bold"
                                    >
                                        {loading ? "Booking..." : "Confirm Demo Session"}
                                    </button>
                                </div>
                            </AnimatedStep>
                        )}

                    </div>
                </div>
            </div>
        </div>
    );
}
