'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/utils/api'
import { toast } from 'react-toastify'

const Page = () => {
  const { id } = useParams()

  const [meeting, setMeeting] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploadingIndex, setUploadingIndex] = useState(null)

  const [showSignerModal, setShowSignerModal] = useState(false)

  const [signerForm, setSignerForm] = useState({
    name: '',
    email: '',
    CountryCode: '+91',
    MobileNo: '',
    DOB: '',
    Gender: '',
    PageNo: [],          // 👈 backend ke liye
    pageInput: '',       // 👈 UI ke liye ( "1,2,3" )
    signPosition: 'bottom-right',
  })

  const formatMeetingDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatMeetingTime = (date) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };



  /* ================= AUTH ================= */
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'))
    if (!storedUser) {
      localStorage.clear()
      window.location.href = '/login'
      return
    }
    setUser(storedUser)
  }, [])

  const isDisabled = (field) => {
    return Boolean(signerForm[field])
  }


  /* ================= FETCH ================= */
  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await api.get(`/api/meeting/get-meeting/${id}`)
        setMeeting(res.data.meeting)
      } catch {
        toast.error('Unable to load meeting')
      } finally {
        setLoading(false)
      }
    }
    if (id) fetchMeeting()
  }, [id])

  useEffect(() => {
    if (meeting?.advocateId) {
      const adv = meeting.advocateId

      setSignerForm(prev => ({
        ...prev,
        name: adv.name || '',
        email: adv.email || '',
        MobileNo: adv.phone || '',
        CountryCode: '+91',
      }))
    }
  }, [meeting])


  /* ================= JOIN LOGIC ================= */
  const canJoin = () => {
    if (!meeting?.startTime) return false
    const diffMin =
      (new Date(meeting.startTime).getTime() - Date.now()) / 60000
    return diffMin <= 10
  }

  const canJoinMeeting = canJoin()

  const handleJoin = async () => {
    try {
      toast.loading('Connecting…', { toastId: 'join' })
      const res = await api.get(`/api/meeting/join-meeting/${id}`)

      toast.update('join', {
        render: 'Meeting joined',
        type: 'success',
        isLoading: false,
      })

      if (res.data?.meetLink) {
        window.open(res.data.meetLink, '_blank')
      }
    } catch (err) {
      console.log("error", err)
      toast.update('join', {
        render: err.response?.data?.message || 'Unable to join meeting',
        type: 'error',
        isLoading: false,
      })
    }
  }

  /* ================= SEND FOR SIGN ================= */
  const handleSendForSign = async () => {
    try {
      toast.loading('Sending document for signing...', { toastId: 'sign' })

      const res = await api.post(
        `/api/meeting/send-document-for-sign/${id}`
      )

      toast.update('sign', {
        render: res.data?.message || 'Document sent for signing',
        type: 'success',
        isLoading: false,
      })
    } catch (err) {
      console.log("error", err)
      toast.update('sign', {
        render: err.response?.data?.message || 'Failed to send document',
        type: 'error',
        isLoading: false,
      })
    }
  }

  /* ================= SIGN FLOW ================= */
  const handleSignerSubmit = async () => {
    try {
      toast.loading('Processing...', { toastId: 'signer' })

      // 1️⃣ Add signer
      const addSignerRes = await api.post(
        `/api/meeting/adv-sign-detail/${id}`,
        signerForm
      )

      // ✅ success true hone par hi next API
      if (addSignerRes.data?.success === true) {
        await api.post(`/api/meeting/sign-document-for-notary/${id}`)
      }

      // 2️⃣ Send document for sign
      await api.post(`/api/meeting/send-document-for-sign/${id}`)

      toast.update('signer', {
        render: 'Document sent for signing',
        type: 'success',
        isLoading: false,
      })

      setMeeting(prev => ({ ...prev, isSigned: true }))
      setShowSignerModal(false)

    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.message

      // 🔥 signer already exists case
      if (status === 400 && message === 'Signer already exists') {
        try {
          await api.post(`/api/meeting/send-document-for-sign/${id}`)

          toast.update('signer', {
            render: 'Signer already existed. Document sent for signing.',
            type: 'success',
            isLoading: false,
          })

          setMeeting(prev => ({ ...prev, isSigned: true }))
          setShowSignerModal(false)
          return
        } catch (sendErr) {
          toast.update('signer', {
            render:
              sendErr.response?.data?.message ||
              'Failed to send document',
            type: 'error',
            isLoading: false,
          })
          return
        }
      }

      // ❌ other errors
      toast.update('signer', {
        render: message || 'Failed',
        type: 'error',
        isLoading: false,
      })
    }
  }

  /* ================= SIGNER DOC UPLOAD ================= */
  const handleFaceImageUpload = async (file, signerIndex) => {
    if (!file) return

    try {
      setUploadingIndex(signerIndex)

      const fd = new FormData()
      fd.append('faceImage', file) // 👈 multer field
      fd.append('signerIndex', signerIndex)

      const res = await api.put(
        `/api/meeting/upload-face-image-of-signer/${id}`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      toast.success('Signer document uploaded')

      setMeeting(prev => {
        const updated = { ...prev }
        updated.signatories[signerIndex] = res.data.signer
        return updated
      })
    } catch (err) {
      console.log("error", err)
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingIndex(null)
    }
  }

  /* ================= SIGNER DOC UPLOAD ================= */
  const handleSignerDocUpload = async (file, signerIndex) => {
    if (!file) return

    try {
      setUploadingIndex(signerIndex)

      const fd = new FormData()
      fd.append('doc', file) // 👈 multer field
      fd.append('signerIndex', signerIndex)

      const res = await api.put(
        `/api/meeting/upload-doc-of-signer/${id}`,
        fd,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      )

      toast.success('Signer document uploaded')

      setMeeting(prev => {
        const updated = { ...prev }
        updated.signatories[signerIndex] = res.data.signer
        return updated
      })
    } catch (err) {
      console.log("error", err)
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally {
      setUploadingIndex(null)
    }
  }

  if (loading || !meeting || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-100">
        <p className="text-gray-500">Loading meeting file…</p>
      </div>
    )
  }

  const isUser = user.role === 'user'
  const counterpart = isUser ? meeting.advocateId : meeting.userId

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-neutral-100 px-4 py-6">
      <div className="max-w-5xl mx-auto bg-white rounded-xl border">

        {/* ================= HEADER ================= */}
        <div className="p-6 border-b">
          <h1 className="text-2xl font-semibold">{meeting.meetingTitle}</h1>
          <p className="text-gray-600 mt-1">{meeting.meetingDescription}</p>
        </div>

        {/* ================= DETAILS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-2">
              CASE DETAILS
            </h2>
            <p><strong>Amount:</strong> ₹{meeting.amount}</p>
            <p><strong>Signing Mode:</strong> {meeting.signingMode}</p>
            <p><strong>Signatories:</strong> {meeting.signatoryCount}</p>

            <p>
              <strong>Meeting Date:</strong>{" "}
              {meeting.startTime
                ? formatMeetingDate(meeting.startTime)
                : "Not scheduled"}
            </p>

            <p>
              <strong>Meeting Time:</strong>{" "}
              {meeting.startTime
                ? formatMeetingTime(meeting.startTime)
                : "Not scheduled"}
            </p>

          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-500 mb-2">
              {isUser ? 'NOTARY DETAILS' : 'USER DETAILS'}
            </h2>
            <p><strong>Name:</strong> {counterpart.name}</p>
            <p><strong>Email:</strong> {counterpart.email}</p>
          </div>
        </div>

        {/* ================= SIGNATORIES ================= */}
        <div className="p-6 border-t">
          <h2 className="text-sm font-semibold text-gray-500 mb-4">
            SIGNATORIES
          </h2>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead className="bg-gray-50">
                <tr>
                  <th className="border px-3 py-2">Name</th>
                  <th className="border px-3 py-2">Email</th>
                  <th className="border px-3 py-2">Mobile</th>
                  <th className="border px-3 py-2">Page</th>
                  <th className="border px-3 py-2">Position</th>
                  <th className="border px-3 py-2">Id Proof</th>
                  <th className="border px-3 py-2">Face Image</th>
                  <th className="border px-3 py-2">Document</th>
                </tr>
              </thead>

              <tbody>
                {meeting.signatories.map((sig, index) => (
                  <tr key={sig._id || index} className="text-center">
                    <td className="border px-3 py-2">{sig.name}</td>
                    <td className="border px-3 py-2">{sig.email}</td>
                    <td className="border px-3 py-2">
                      {sig.CountryCode} {sig.MobileNo}
                    </td>
                    <td className="border px-3 py-2">{sig.PageNo.map(Number).join(", ")}</td>
                    <td className="border px-3 py-2">{sig.signPosition}</td>
                    <td className="border px-3 py-2 space-y-2">
                      <a target='_blank' href={sig.idProof?.image}>
                        {sig.idProof?.image ? (
                          <img
                            src={sig.idProof.image}
                            alt="Signer IdProof"
                            className="w-16 h-16 object-cover rounded border mx-auto"
                          />
                        ) : (
                          <span className="text-xs text-gray-400 block">
                            No document
                          </span>
                        )}
                      </a>
                    </td>

                    {/* DOCUMENT COLUMN */}
                    <td className="border px-3 py-2 space-y-2">
                      <a target='_blank' href={sig.faceImage?.image}>
                        {sig.faceImage?.image ? (
                          <img
                            src={sig.faceImage.image}
                            alt="Signer Doc"
                            className="w-16 h-16 object-cover rounded border mx-auto"
                          />
                        ) : (
                          <span className="text-xs text-gray-400 block">
                            No document
                          </span>
                        )}
                      </a>

                      {!isUser && (
                        <label className="block">
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            disabled={uploadingIndex === index}
                            onChange={(e) =>
                              handleFaceImageUpload(
                                e.target.files[0],
                                index
                              )
                            }
                          />
                          <span className="text-xs text-indigo-600 underline cursor-pointer">
                            {uploadingIndex === index
                              ? 'Uploading...'
                              : sig.faceImage?.image
                                ? 'Replace'
                                : 'Upload'}
                          </span>
                        </label>
                      )}
                    </td>

                    {/* DOCUMENT COLUMN */}
                    <td className="border px-3 py-2 space-y-2">
                      <a target='_blank' href={sig.doc?.image}>
                        {sig.doc?.image ? (
                          <img
                            src={sig.doc.image}
                            alt="Signer Doc"
                            className="w-16 h-16 object-cover rounded border mx-auto"
                          />
                        ) : (
                          <span className="text-xs text-gray-400 block">
                            No document
                          </span>
                        )}
                      </a>

                      {!isUser && (
                        <label className="block">
                          <input
                            type="file"
                            hidden
                            accept="image/*"
                            disabled={uploadingIndex === index}
                            onChange={(e) =>
                              handleSignerDocUpload(
                                e.target.files[0],
                                index
                              )
                            }
                          />
                          <span className="text-xs text-indigo-600 underline cursor-pointer">
                            {uploadingIndex === index
                              ? 'Uploading...'
                              : sig.doc?.image
                                ? 'Replace'
                                : 'Upload'}
                          </span>
                        </label>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ================= JOIN ================= */}
        <div className="p-6 border-t flex justify-between items-center gap-4">
          <a
            href={meeting.documentUrl?.pdf}
            target="_blank"
            className="text-indigo-600 underline text-sm"
          >
            View Main Document
          </a>

          <div className="flex gap-3">
            {/* NOTARY ONLY */}
            {!isUser && (
              <button
                onClick={() => setShowSignerModal(true)}
                disabled={meeting.isSigned}
                className={`px-6 py-3 rounded text-white
    ${meeting.isSigned
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700'}
  `}
              >
                {meeting.isSigned ? 'Already Sent for Signing' : 'Sign Document'}
              </button>


            )}

            <button
              onClick={handleJoin}
              disabled={!canJoinMeeting || meeting.isMeetingEnded}
              className={`px-6 py-3 rounded text-white
    ${(!canJoinMeeting || meeting.isMeetingEnded)
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
                }
  `}
            >
              {meeting.isMeetingEnded
                ? 'Meeting Ended'
                : !canJoinMeeting
                  ? 'Waiting for meeting time'
                  : 'Join Meeting'}
            </button>

          </div>
        </div>

      </div>
      {showSignerModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg rounded-lg p-6">

            <h2 className="text-lg font-semibold mb-4">
              Advocate Signer Details
            </h2>

            {/* NAME */}
            <input
              placeholder="Name"
              value={signerForm.name}
              disabled={isDisabled('name')}
              className="w-full border p-2 mb-3 rounded bg-gray-50"
            />

            {/* EMAIL */}
            <input
              placeholder="Email"
              value={signerForm.email}
              disabled={isDisabled('email')}
              className="w-full border p-2 mb-3 rounded bg-gray-50"
            />

            {/* COUNTRY CODE */}
            <input
              placeholder="Country Code"
              value={signerForm.CountryCode}
              disabled
              className="w-full border p-2 mb-3 rounded bg-gray-50"
            />

            {/* MOBILE */}
            <input
              placeholder="Mobile Number"
              value={signerForm.MobileNo}
              disabled={isDisabled('MobileNo')}
              className="w-full border p-2 mb-3 rounded bg-gray-50"
            />

            {/* DOB */}
            <input
              type="date"
              value={signerForm.DOB}
              onChange={e =>
                setSignerForm({ ...signerForm, DOB: e.target.value })
              }
              className="w-full border p-2 mb-3 rounded"
            />

            {/* GENDER */}
            <select
              value={signerForm.Gender}
              onChange={e =>
                setSignerForm({ ...signerForm, Gender: e.target.value })
              }
              className="w-full border p-2 mb-3 rounded"
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>

            {/* PAGE NO */}
            <input
              type="text"
              placeholder="Enter page numbers (e.g. 1,2,3)"
              value={signerForm.pageInput}
              onChange={(e) => {
                const value = e.target.value

                const pagesArray = [
                  ...new Set(
                    value
                      .split(',')
                      .map(p => Number(p.trim()))
                      .filter(n => !isNaN(n) && n > 0)
                  )
                ]

                setSignerForm({
                  ...signerForm,
                  pageInput: value,   // UI ke liye
                  PageNo: pagesArray, // backend ke liye
                })
              }}
              className="w-full border p-2 mb-3 rounded"
            />



            {/* SIGN POSITION */}
            <select
              value={signerForm.signPosition}
              onChange={e =>
                setSignerForm({ ...signerForm, signPosition: e.target.value })
              }
              className="w-full border p-2 mb-4 rounded"
            >
              <option value="bottom-left">Bottom Left</option>
              <option value="bottom-right">Bottom Right</option>
              <option value="bottom-center">Bottom Center</option>
              {/*<option value="top-left">Top Left</option>
              <option value="top-right">Top Right</option>
              <option value="center">Center</option>*/}
            </select>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSignerModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>
              <button
                onClick={handleSignerSubmit}
                className="px-4 py-2 bg-indigo-600 text-white rounded"
              >
                Continue & Sign
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  )
}

export default Page
