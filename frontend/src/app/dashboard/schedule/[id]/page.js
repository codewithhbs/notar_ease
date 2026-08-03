'use client'

import api from '@/utils/api'
import { useParams } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { toast } from "react-toastify";

const Page = () => {
  const { id } = useParams()

  const [step, setStep] = useState(1)
  const [checkingMeeting, setCheckingMeeting] = useState(true)
  const [timeSlots, setTimeSlots] = useState([])
  const [groupedSlots, setGroupedSlots] = useState({})
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [availableAdvocates, setAvailableAdvocates] = useState([])
  const [selectedAdvocate, setSelectedAdvocate] = useState(null)

  /* ================== LOAD RAZORPAY ================== */
  useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)
    return () => document.body.removeChild(script)
  }, [])

  /* ================== CHECK ACTUAL MEETING STATUS ON LOAD ==================
     Without this, `step` always starts at 1 (Payment) even if the meeting is
     already paid - e.g. after a UPI payment where the browser tab gets
     paused/reloaded mid app-switch and the Razorpay success handler never
     fires. Money is deducted, DB gets updated by the webhook, but the user
     lands back here and sees "Pay & Continue" again, which looks like it's
     asking them to pay a second time even though it isn't. */
  useEffect(() => {
    const checkMeetingStatus = async () => {
      try {
        const res = await api.get(`/api/meeting/get-meeting/${id}`)
        const meeting = res.data.meeting

        if (meeting?.isPaid) {
          if (meeting.advocateId) {
            // already fully booked, nothing left to do here
            window.location.href = `/dashboard/view-meeting/${id}`
            return
          } else if (meeting.timeSlotId) {
            setSelectedSlot(meeting.timeSlotId)
            setStep(2)
            await fetchSlots()
            const slotRes = await api.post('/api/advocate/check-slot', {
              date: meeting.timeSlotId.date,
              startTime: meeting.timeSlotId.startTime,
              endTime: meeting.timeSlotId.endTime,
            })
            setAvailableAdvocates(slotRes.data.timeSlots)
          } else {
            setStep(2)
            await fetchSlots()
          }
        }
      } catch (error) {
        console.log("Could not verify meeting status", error)
      } finally {
        setCheckingMeeting(false)
      }
    }

    checkMeetingStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  /* ================== FETCH SLOTS ================== */
  const fetchSlots = async () => {
    const res = await api.get('/api/advocate/get-all-time-slots')
    setTimeSlots(res.data.timeSlots)
    groupSlots(res.data.timeSlots)
  }

  /* ================== GROUP TODAY / TOMORROW / LATER ================== */
  const groupSlots = (slots) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(today.getDate() + 1)

    const grouped = { Today: [], Tomorrow: [], Later: [] }

    slots.forEach(slot => {
      const slotDate = new Date(slot.date)
      slotDate.setHours(0, 0, 0, 0)

      if (slotDate.getTime() === today.getTime()) grouped.Today.push(slot)
      else if (slotDate.getTime() === tomorrow.getTime()) grouped.Tomorrow.push(slot)
      else grouped.Later.push(slot)
    })

    setGroupedSlots(grouped)
  }

  /* ================== PAYMENT ================== */
  const handlePayment = async () => {
    try {
      toast.loading("Checking payment status...", { toastId: "payment" });

      const res = await api.post(`/api/meeting/create-payment/${id}`);

      // Already paid
      if (res.data?.message == "Meeting already paid") {
        toast.update("payment", {
          render: "Payment already completed ✅",
          type: "success",
          isLoading: false,
        });

        setStep(2);
        fetchSlots();
        return;
      }

      toast.dismiss("payment");

      const { razorpayOrderId, amount, currency, razorPayKey } = res.data;

      const options = {
        key: razorPayKey,
        amount: amount * 100,
        currency,
        name: "Omm Documentation",
        description: "Meeting Scheduling Payment",
        order_id: razorpayOrderId,

        handler: function (response) {
          toast.loading("Verifying payment...", { toastId: "verify" });

          api.post("/api/meeting/check-status", response)
            .then((responseData) => {
              if (responseData.data.success) {
                toast.update("verify", {
                  render: "Payment successful 🎉",
                  type: "success",
                  isLoading: false,
                });

                setStep(2);
                fetchSlots();
              } else {
                toast.update("verify", {
                  render: "Payment failed ❌",
                  type: "error",
                  isLoading: false,
                });
              }
            })
            .catch(() => {
              toast.update("verify", {
                render: "Payment verification failed ❌",
                type: "error",
                isLoading: false,
              });
            });
        },

        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
          },
        },
      };

      new window.Razorpay(options).open();

    } catch (error) {
      toast.dismiss("payment");
      console.log("Intrernal server error", error)

      if (error?.response?.data?.message === "Meeting already paid") {
        toast.success("Payment already completed ✅");
        setStep(2);
        fetchSlots();
      } else {
        toast.error(error?.response?.data?.message || "Something went wrong. Try again.");
      }
    }
  };

  /* ================== CHECK SLOT ================== */
  const checkSlot = async (slot) => {
    setSelectedSlot(slot);

    toast.loading("Checking availability...", { toastId: "slot" });

    const res = await api.post('/api/advocate/check-slot', {
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });

    toast.update("slot", {
      render: "Advocates found 👨‍⚖️",
      type: "success",
      isLoading: false,
    });

    setAvailableAdvocates(res.data.timeSlots);
  };

  /* ================== ALLOT ADVOCATE ================== */
  const allotAdvocate = async () => {
    if (!selectedSlot || !selectedAdvocate) {
      toast.warn("Please select slot & advocate");
      return;
    }

    toast.loading("Confirming advocate...", { toastId: "confirm" });

    await api.put(`/api/meeting/update-time-slot/${id}`, {
      timeSlotId: selectedSlot._id,
    });

    toast.update("confirm", {
      render: "Advocate allotted successfully ✅",
      type: "success",
      isLoading: false,
    });
    window.location.href = `/dashboard/view-meeting/${id}`
  };

  if (checkingMeeting) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Checking your meeting status...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">

        {/* ================= STEPS HEADER ================= */}
        <div className="flex items-center justify-between mb-10">
          {["Payment", "Select Slot", "Choose Advocate"].map((label, index) => {
            const stepNo = index + 1
            return (
              <div key={label} className="flex-1 flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold 
                ${step >= stepNo ? "bg-green-600 text-white" : "bg-gray-300 text-gray-600"}`}
                >
                  {stepNo}
                </div>
                <span
                  className={`ml-3 font-medium ${step >= stepNo ? "text-green-600" : "text-gray-500"
                    }`}
                >
                  {label}
                </span>
                {stepNo !== 3 && (
                  <div className="flex-1 h-0.5 mx-4 bg-gray-300" />
                )}
              </div>
            )
          })}
        </div>

        {/* ================= STEP 1 : PAYMENT ================= */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <h2 className="text-3xl font-bold mb-3">Complete Your Payment</h2>
            <p className="text-gray-600 mb-8 max-w-xl mx-auto">
              Secure your meeting by completing the payment. Once paid, you can
              choose a time slot and an advocate for your consultation.
            </p>

            <button
              onClick={handlePayment}
              className="
    w-full sm:w-auto
    bg-green-600 hover:bg-green-700
    text-white
    px-6 sm:px-10
    py-4
    rounded-xl
    text-base sm:text-lg
    font-semibold
  "
            >
              Pay & Continue →
            </button>

          </div>
        )}

        {/* ================= STEP 2 : TIME SLOTS ================= */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Select a Time Slot</h2>

            {Object.entries(groupedSlots).map(([label, slots]) =>
              slots.length > 0 && (
                <div key={label} className="mb-8">
                  <h3 className="text-lg font-semibold mb-4">{label}</h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {slots.map(slot => {
                      const isActive = selectedSlot?._id === slot._id
                      return (
                        <button
                          key={slot._id}
                          onClick={() => checkSlot(slot)}
                          className={`border rounded-xl p-3 sm:p-4 text-sm sm:text-base text-left transition shadow-sm
                          ${isActive
                              ? "border-green-600 bg-green-50 shadow-md"
                              : "hover:border-green-500 hover:bg-gray-50"
                            }`}
                        >
                          <p className="font-semibold">
                            {new Date(slot.date).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {slot.startTime} – {slot.endTime}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* ================= STEP 3 : ADVOCATES ================= */}
        {selectedSlot && availableAdvocates.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
            <h2 className="text-2xl font-bold mb-6">Choose an Advocate</h2>

            <div className="space-y-4">
              {availableAdvocates.map(slot => {
                const isSelected = selectedAdvocate === slot.advocateId._id
                return (
                  <label
                    key={slot._id}
                    className={`flex items-center gap-4 p-4 sm:p-5 border rounded-xl cursor-pointer transition
                    ${isSelected
                        ? "border-green-600 bg-green-50 shadow"
                        : "hover:border-green-500"
                      }`}
                  >
                    <input
                      type="radio"
                      name="advocate"
                      checked={isSelected}
                      onChange={() => setSelectedAdvocate(slot.advocateId._id)}
                      className="accent-green-600"
                    />

                    <div>
                      <p className="font-semibold text-lg">
                        {slot.advocateId.name} {slot.advocateId.familyName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {slot.advocateId.email}
                      </p>
                    </div>
                  </label>
                )
              })}
            </div>

            <div className="sticky bottom-0 bg-white p-4 border-t sm:static sm:border-0">
              <button
                disabled={!selectedAdvocate}
                onClick={allotAdvocate}
                className="
      w-full sm:w-auto
      bg-green-600 hover:bg-green-700
      text-white
      px-6 sm:px-8
      py-4
      rounded-xl
      font-semibold
      disabled:opacity-50
    "
              >
                Confirm Advocate →
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  )

}

export default Page
