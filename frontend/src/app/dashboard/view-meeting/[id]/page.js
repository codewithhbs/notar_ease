'use client'

import React, { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import api from '@/utils/api'
import { toast } from 'react-toastify'
import { FileText, User, Calendar, Clock, Hash, MapPin, Upload, X, ChevronRight, Video } from 'lucide-react'

const inputClass = "w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 bg-gray-50 focus:bg-white focus:outline-none focus:border-[#005F5A] focus:ring-2 focus:ring-[#005F5A]/10 transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500"
const labelClass = "block text-[10px] font-bold tracking-[0.08em] uppercase text-[#005F5A] mb-1.5"

function SectionCard({ title, icon: Icon, children }) {
  return (
    <div className="bg-white rounded-3xl border border-[#005F5A]/10 shadow-sm overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-[#005F5A] to-[#00A896]" />
      <div className="p-6">
        {title && (
          <div className="flex items-center gap-2.5 mb-5">
            {Icon && (
              <div className="w-9 h-9 bg-[#E6F4F3] rounded-xl flex items-center justify-center">
                <Icon size={16} className="text-[#005F5A]" />
              </div>
            )}
            <h2 className="text-sm font-bold text-gray-800 tracking-[0.06em] uppercase" style={{ fontFamily: "'Georgia', serif" }}>
              {title}
            </h2>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

function DetailRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-3 border-b border-gray-50 last:border-0">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
      <span className="text-sm font-medium text-gray-800 text-right max-w-[60%]">{value || '—'}</span>
    </div>
  )
}

const Page = () => {
  const { id } = useParams()
  const [meeting, setMeeting] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [uploadingIndex, setUploadingIndex] = useState(null)
  const [showSignerModal, setShowSignerModal] = useState(false)

  const [signerForm, setSignerForm] = useState({
    name: '', email: '', CountryCode: '+91', MobileNo: '',
    DOB: '', Gender: '', PageNo: [], pageInput: '',
    signPosition: 'bottom-right', signingMode: 'adhaarESign',
  })

  const formatMeetingDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })

  const formatMeetingTime = (date) =>
    new Date(date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true })

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'))
    if (!storedUser) { localStorage.clear(); window.location.href = '/login'; return }
    setUser(storedUser)
  }, [])

  const isDisabled = (field) => Boolean(signerForm[field])

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const res = await api.get(`/api/meeting/get-meeting/${id}`)
        setMeeting(res.data.meeting)
      } catch { toast.error('Unable to load meeting') }
      finally { setLoading(false) }
    }
    if (id) fetchMeeting()
  }, [id])

  useEffect(() => {
    if (meeting?.advocateId) {
      const adv = meeting.advocateId
      setSignerForm(prev => ({ ...prev, name: adv.name || '', email: adv.email || '', MobileNo: adv.phone || '', CountryCode: '+91' }))
    }
  }, [meeting])

  const canJoin = () => {
    if (!meeting?.startTime) return false
    return (new Date(meeting.startTime).getTime() - Date.now()) / 60000 <= 10
  }
  const canJoinMeeting = canJoin()

  const handleJoin = async () => {
    try {
      toast.loading('Connecting…', { toastId: 'join' })
      const res = await api.get(`/api/meeting/join-meeting/${id}`)
      toast.update('join', { render: 'Meeting joined', type: 'success', isLoading: false })
      if (res.data?.meetLink) window.open(res.data.meetLink, '_blank')
    } catch (err) {
      toast.update('join', { render: err.response?.data?.message || 'Unable to join meeting', type: 'error', isLoading: false })
    }
  }

  const handleSignerSubmit = async () => {
    try {
      toast.loading('Processing...', { toastId: 'signer' })
      const addSignerRes = await api.post(`/api/meeting/adv-sign-detail/${id}`, signerForm)
      // if (addSignerRes.data?.success === true) await api.post(`/api/meeting/sign-document-for-notary/${id}`)
      if (addSignerRes.data?.success === true) await api.post(`/api/meeting/send-document-for-sign/${id}`)
      // await api.post(`/api/meeting/send-document-for-sign/${id}`)
      toast.update('signer', { render: 'Document sent for signing', type: 'success', isLoading: false })
      setMeeting(prev => ({ ...prev, isSigned: true }))
      setShowSignerModal(false)
    } catch (err) {
      const status = err.response?.status
      const message = err.response?.data?.message
      if (status === 400 && message === 'Signer already exists') {
        try {
          await api.post(`/api/meeting/send-document-for-sign/${id}`)
          toast.update('signer', { render: 'Signer already existed. Document sent for signing.', type: 'success', isLoading: false })
          setMeeting(prev => ({ ...prev, isSigned: true }))
          setShowSignerModal(false)
          return
        } catch (sendErr) {
          toast.update('signer', { render: sendErr.response?.data?.message || 'Failed to send document', type: 'error', isLoading: false })
          return
        }
      }
      toast.update('signer', { render: message || 'Failed', type: 'error', isLoading: false })
    }
  }

  const handleFaceImageUpload = async (file, signerIndex) => {
    if (!file) return
    try {
      setUploadingIndex(signerIndex)
      const fd = new FormData()
      fd.append('faceImage', file)
      fd.append('signerIndex', signerIndex)
      const res = await api.put(`/api/meeting/upload-face-image-of-signer/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Signer document uploaded')
      setMeeting(prev => { const updated = { ...prev }; updated.signatories[signerIndex] = res.data.signer; return updated })
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed') }
    finally { setUploadingIndex(null) }
  }

  const handleSignerDocUpload = async (file, signerIndex) => {
    if (!file) return
    try {
      setUploadingIndex(signerIndex)
      const fd = new FormData()
      fd.append('doc', file)
      fd.append('signerIndex', signerIndex)
      const res = await api.put(`/api/meeting/upload-doc-of-signer/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Signer document uploaded')
      setMeeting(prev => { const updated = { ...prev }; updated.signatories[signerIndex] = res.data.signer; return updated })
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed') }
    finally { setUploadingIndex(null) }
  }

  const handleStamp = async () => {
    try {
      toast.loading('Stamping...', { toastId: 'stamp' })
      await api.post(`/api/meeting/sign-document-for-notary/${id}`)
      toast.update('stamp', { render: 'Meeting stamped', type: 'success', isLoading: false })
    } catch (err) {
      console.log("Internal server error", err)
      toast.update('stamp', { render: err.response?.data?.message || 'Stamp failed', type: 'error', isLoading: false })
    }
  }

  if (loading || !meeting || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans">
        <div className="text-center">
          <div className="w-12 h-12 bg-[#E6F4F3] rounded-2xl flex items-center justify-center mx-auto mb-3 animate-pulse">
            <FileText size={22} className="text-[#005F5A]" />
          </div>
          <p className="text-sm text-gray-400">Loading meeting file…</p>
        </div>
      </div>
    )
  }

  const isUser = user.role === 'user'
  const counterpart = isUser ? meeting.advocateId : meeting.userId

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-5">

        {/* ── Page Header ── */}
        <div>
          <p className="text-[#00A896] text-xs font-bold tracking-[0.15em] uppercase mb-1">Meeting Details</p>
          <h1
            className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1"
            style={{ fontFamily: "'Georgia', serif" }}
          >
            {meeting.meetingTitle}
          </h1>
          {meeting.meetingDescription && (
            <p className="text-sm text-gray-500">{meeting.meetingDescription}</p>
          )}
        </div>

        {/* ── Details Grid ── */}
        <div className="grid md:grid-cols-2 gap-5">

          {/* Case Details */}
          <SectionCard title="Case Details" icon={FileText}>
            <div>
              <DetailRow label="Amount" value={`${meeting.currency === 'USD' ? '$' : '₹'}${meeting.amount}`} />
              <DetailRow label="Signing Mode" value={meeting.signingMode} />
              <DetailRow label="Signatories" value={meeting.signatoryCount} />
              <DetailRow
                label="Meeting Date"
                value={meeting.startTime ? formatMeetingDate(meeting.startTime) : 'Not scheduled'}
              />
              <DetailRow
                label="Meeting Time"
                value={meeting.startTime ? formatMeetingTime(meeting.startTime) : 'Not scheduled'}
              />
            </div>
          </SectionCard>

          {/* Counterpart Details */}
          <SectionCard title={isUser ? 'Notary Details' : 'User Details'} icon={User}>
            <div>
              <DetailRow label="Name" value={counterpart?.name} />
              <DetailRow label="Email" value={counterpart?.email} />
            </div>
          </SectionCard>
        </div>

        {/* ── Signatories ── */}
        <SectionCard title="Signatories" icon={User}>
          <div className="overflow-x-auto -mx-2">
            <table className="w-full min-w-[700px] text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#005F5A] to-[#007A73] text-white text-xs">
                  {['Name', 'Email', 'Mobile', 'Pages', 'Position', 'ID Proof', 'Face Image', 'Document'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold tracking-[0.05em] uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {meeting.signatories.map((sig, index) => (
                  <tr key={sig._id || index} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">{sig.name}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{sig.email}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{sig.CountryCode} {sig.MobileNo}</td>
                    <td className="px-4 py-3 text-gray-600">{sig.PageNo.map(Number).join(', ')}</td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-semibold bg-[#E6F4F3] text-[#005F5A] px-2 py-0.5 rounded-full whitespace-nowrap">
                        {sig.signPosition}
                      </span>
                    </td>

                    {/* ID Proof */}
                    <td className="px-4 py-3">
                      {sig.idProof?.image ? (() => {
                        const isPdf = sig.idProof.image.toLowerCase().endsWith('.pdf')
                        return (
                          <a href={sig.idProof.image} target="_blank" rel="noopener noreferrer">
                            {isPdf ? (
                              <div className="w-14 h-14 flex items-center justify-center border border-[#005F5A]/20 rounded-xl bg-[#E6F4F3] text-[10px] font-bold text-[#005F5A]">PDF</div>
                            ) : (
                              <img src={sig.idProof.image} alt="ID" className="w-14 h-14 object-cover rounded-xl border border-gray-200" />
                            )}
                          </a>
                        )
                      })() : (
                        <span className="text-[11px] text-gray-400">None</span>
                      )}
                    </td>

                    {/* Face Image */}
                    <td className="px-4 py-3 space-y-1.5">
                      <a target="_blank" href={sig.faceImage?.image}>
                        {sig.faceImage?.image ? (
                          <img src={sig.faceImage.image} alt="Face" className="w-14 h-14 object-cover rounded-xl border border-gray-200" />
                        ) : (
                          <span className="text-[11px] text-gray-400">None</span>
                        )}
                      </a>
                      {!isUser && (
                        <label className="block">
                          <input type="file" hidden accept="image/*" disabled={uploadingIndex === index}
                            onChange={(e) => handleFaceImageUpload(e.target.files[0], index)} />
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#005F5A] cursor-pointer hover:underline">
                            <Upload size={10} />
                            {uploadingIndex === index ? 'Uploading...' : sig.faceImage?.image ? 'Replace' : 'Upload'}
                          </span>
                        </label>
                      )}
                    </td>

                    {/* Document */}
                    <td className="px-4 py-3 space-y-1.5">
                      <a target="_blank" href={sig.doc?.image}>
                        {sig.doc?.image ? (
                          <img src={sig.doc.image} alt="Doc" className="w-14 h-14 object-cover rounded-xl border border-gray-200" />
                        ) : (
                          <span className="text-[11px] text-gray-400">None</span>
                        )}
                      </a>
                      {!isUser && (
                        <label className="block">
                          <input type="file" hidden accept="image/*" disabled={uploadingIndex === index}
                            onChange={(e) => handleSignerDocUpload(e.target.files[0], index)} />
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[#005F5A] cursor-pointer hover:underline">
                            <Upload size={10} />
                            {uploadingIndex === index ? 'Uploading...' : sig.doc?.image ? 'Replace' : 'Upload'}
                          </span>
                        </label>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        {/* ── Actions ── */}
        <div className="bg-white rounded-3xl border border-[#005F5A]/10 shadow-sm overflow-hidden">
          <div className="h-1 bg-gradient-to-r from-[#005F5A] to-[#00A896]" />
          <div className="px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <a
              href={meeting.documentUrl?.pdf}
              target="_blank"
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#005F5A] hover:underline"
            >
              <FileText size={15} /> View Main Document
            </a>

            <div className="flex flex-wrap gap-3">
              {/* Notary only — Sign Document */}
              {!isUser && (
                <button
                  onClick={() => setShowSignerModal(true)}
                  disabled={meeting.isSigned}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${meeting.isSigned
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-br from-[#005F5A] to-[#004845] text-white shadow-md shadow-[#005F5A]/20 hover:shadow-[#005F5A]/40 hover:-translate-y-0.5'
                    }`}
                >
                  {meeting.isSigned ? 'Already Sent for Signing' : <><ChevronRight size={15} /> Sign Document</>}
                </button>
              )}

              {/* Join Meeting */}
              <button
                onClick={handleJoin}
                disabled={!canJoinMeeting || meeting.isMeetingEnded}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${(!canJoinMeeting || meeting.isMeetingEnded)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-br from-green-600 to-green-700 text-white shadow-md shadow-green-600/20 hover:shadow-green-600/40 hover:-translate-y-0.5'
                  }`}
              >
                <Video size={15} />
                {meeting.isMeetingEnded ? 'Meeting Ended' : !canJoinMeeting ? 'Waiting for Meeting Time' : 'Join Meeting'}
              </button>

              {!isUser && meeting?.isSigned && (
                <button
                  onClick={handleStamp}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 
    bg-gradient-to-br from-[#5f1300] to-[#481400] text-white shadow-md shadow-[#005F5A]/20 
    hover:shadow-[#005F5A]/40 hover:-translate-y-0.5"
                >
                  <ChevronRight size={15} /> Close Meeting
                </button>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ── SIGNER MODAL ── */}
      {showSignerModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="h-1 bg-gradient-to-r from-[#005F5A] to-[#00A896]" />

            <div className="p-7">
              {/* Modal header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#E6F4F3] rounded-xl flex items-center justify-center">
                    <User size={18} className="text-[#005F5A]" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Georgia', serif" }}>
                    Advocate Signer Details
                  </h3>
                </div>
                <button
                  onClick={() => setShowSignerModal(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-xl border border-gray-200 text-gray-400 hover:text-gray-600 transition-all"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className={labelClass}>Name</label>
                  <input placeholder="Name" value={signerForm.name} disabled={isDisabled('name')} className={inputClass} />
                </div>

                {/* Email */}
                <div>
                  <label className={labelClass}>Email</label>
                  <input placeholder="Email" value={signerForm.email} disabled={isDisabled('email')} className={inputClass} />
                </div>

                {/* Country + Mobile */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className={labelClass}>Country Code</label>
                    <input value={signerForm.CountryCode} disabled className={inputClass} />
                  </div>
                  <div className="col-span-2">
                    <label className={labelClass}>Mobile</label>
                    <input placeholder="Mobile Number" value={signerForm.MobileNo} disabled={isDisabled('MobileNo')} className={inputClass} />
                  </div>
                </div>

                {/* DOB + Gender */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Date of Birth</label>
                    <input type="date" value={signerForm.DOB}
                      onChange={e => setSignerForm({ ...signerForm, DOB: e.target.value })}
                      className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Gender</label>
                    <select value={signerForm.Gender}
                      onChange={e => setSignerForm({ ...signerForm, Gender: e.target.value })}
                      className={inputClass}>
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                {/* Signing Mode */}
                <div>
                  <label className={labelClass}>Signing Mode</label>
                  <select value={signerForm.signingMode}
                    onChange={e => setSignerForm({ ...signerForm, signingMode: e.target.value })}
                    className={inputClass}>
                    <option value="adhaarESign">Aadhaar eSign</option>
                    <option value="dsc">DSC</option>
                    <option value="NEKYC">NEKYC</option>
                  </select>
                </div>

                {/* Page Numbers */}
                <div>
                  <label className={labelClass}>Page Numbers</label>
                  <input type="text" placeholder="e.g. 1,2,3" value={signerForm.pageInput}
                    onChange={(e) => {
                      const value = e.target.value
                      const pagesArray = [...new Set(value.split(',').map(p => Number(p.trim())).filter(n => !isNaN(n) && n > 0))]
                      setSignerForm({ ...signerForm, pageInput: value, PageNo: pagesArray })
                    }}
                    className={inputClass} />
                  <p className="text-[10px] text-gray-400 mt-1">Comma separated page numbers</p>
                </div>

                {/* Sign Position */}
                {/* <div>
                  <label className={labelClass}>Sign Position</label>
                  <select value={signerForm.signPosition}
                    onChange={e => setSignerForm({ ...signerForm, signPosition: e.target.value })}
                    className={inputClass}>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-center">Bottom Center</option>
                  </select>
                </div> */}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowSignerModal(false)}
                    className="flex-1 px-4 py-3 text-sm font-semibold border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-all">
                    Cancel
                  </button>
                  <button onClick={handleSignerSubmit}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold bg-gradient-to-br from-[#005F5A] to-[#004845] text-white rounded-xl shadow-md shadow-[#005F5A]/20 hover:shadow-[#005F5A]/40 hover:-translate-y-0.5 transition-all duration-200">
                    Continue & Sign <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Page