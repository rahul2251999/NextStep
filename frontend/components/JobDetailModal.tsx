"use client"

import { useState, useEffect } from "react"
import { X, Briefcase, Building, FileText, MessageSquare, Mail, FileEdit, TrendingUp, Copy, Check, Sparkles, AlertCircle, ChevronDown } from "lucide-react"
import axios from "axios"

interface JobDetailModalProps {
  jobId: number
  isOpen: boolean
  onClose: () => void
  onUpdate: () => void
}

interface JobDetail {
  job_id: number
  title: string
  company: string | null
  description_text: string
  application_status: string
  resume_id: number | null
  posted_at: string
  match_score: number | null
  recruiter_message: string | null
  referral_message: string | null
  resume_suggestions: any | null
}

export default function JobDetailModal({ jobId, isOpen, onClose, onUpdate }: JobDetailModalProps) {
  const [loading, setLoading] = useState(true)
  const [jobDetail, setJobDetail] = useState<JobDetail | null>(null)
  const [activeTab, setActiveTab] = useState<"jd" | "linkedin" | "email" | "resume">("jd")
  const [copied, setCopied] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState(false)

  const statusOptions = [
    { value: "applied", label: "Applied" },
    { value: "interviewing", label: "Interviewing" },
    { value: "offer_received", label: "Offer Received" },
    { value: "rejected", label: "Rejected" },
  ]

  useEffect(() => {
    if (isOpen && jobId) {
      fetchJobDetail()
    }
  }, [isOpen, jobId])

  const fetchJobDetail = async () => {
    try {
      const tokenResponse = await fetch("/api/auth/token")
      if (!tokenResponse.ok) return

      const tokenData = await tokenResponse.json()
      const token = tokenData.token || ""

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/job/${jobId}/details`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setJobDetail(response.data)
    } catch (error) {
      console.error("Failed to fetch job details", error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error("Failed to copy", error)
    }
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!jobDetail || newStatus === jobDetail.application_status) return

    setUpdatingStatus(true)
    try {
      const response = await axios.patch(
        `/api/job/${jobId}/status`,
        { application_status: newStatus },
        { timeout: 10000 }
      )

      // Update local state
      setJobDetail({ ...jobDetail, application_status: newStatus })
      
      // Refresh the job list
      onUpdate()
    } catch (error: any) {
      console.error("Failed to update status", error)
      alert(error.response?.data?.error || "Failed to update status. Please try again.")
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="glass-dark rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-8 border-b border-white/5">
          <div className="flex-1">
            {loading ? (
              <div className="space-y-3">
                <div className="h-8 bg-white/5 animate-pulse rounded-xl w-1/2"></div>
                <div className="h-4 bg-white/5 animate-pulse rounded-lg w-1/3"></div>
              </div>
            ) : jobDetail ? (
              <>
                <h2 className="text-3xl font-bold text-white mb-2">{jobDetail.title}</h2>
                <div className="flex flex-wrap items-center gap-6 text-slate-400">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-white/5">
                      <Building className="h-4 w-4" />
                    </div>
                    <span className="font-semibold text-slate-300">{jobDetail.company || "Unknown Enterprise"}</span>
                  </div>
                  {jobDetail.match_score !== null && (
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                        <TrendingUp className="h-4 w-4" />
                      </div>
                      <span className="font-bold text-orange-400">
                        {jobDetail.match_score}% Optimization
                      </span>
                    </div>
                  )}
                  {/* Status Dropdown */}
                  <div className="relative">
                    <select
                      value={jobDetail.application_status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      disabled={updatingStatus}
                      className="appearance-none bg-black/60 border border-white/20 rounded-lg px-4 py-2 pr-8 text-sm text-white hover:border-white/30 focus:outline-none focus:border-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value} className="bg-black text-white">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-500 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/5 flex gap-2 px-8 py-2">
          {[
            { id: "jd", label: "Intel", icon: FileText },
            { id: "linkedin", label: "InMail", icon: MessageSquare },
            { id: "email", label: "Email", icon: Mail },
            { id: "resume", label: "Payload", icon: FileEdit },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-4 rounded-2xl transition-all flex items-center gap-3 text-sm font-bold ${activeTab === tab.id
                ? "bg-white/5 text-white shadow-inner"
                : "text-slate-500 hover:text-slate-300 hover:bg-white/[0.02]"
                }`}
            >
              <tab.icon className={`h-4 w-4 ${activeTab === tab.id ? "text-orange-400" : ""}`} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {loading ? (
            <div className="space-y-6">
              <div className="h-4 bg-white/5 animate-pulse rounded-lg w-full"></div>
              <div className="h-4 bg-white/5 animate-pulse rounded-lg w-5/6"></div>
              <div className="h-4 bg-white/5 animate-pulse rounded-lg w-4/6"></div>
              <div className="h-4 bg-white/5 animate-pulse rounded-lg w-full"></div>
            </div>
          ) : jobDetail ? (
            <div className="animate-fade-in-up">
              {/* Job Description Tab */}
              {activeTab === "jd" && (
                <div className="space-y-6">
                  <div className="prose prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-slate-300 leading-relaxed font-medium">
                      {jobDetail.description_text}
                    </div>
                  </div>
                </div>
              )}

              {/* LinkedIn Message Tab */}
              {activeTab === "linkedin" && (
                <div className="space-y-6">
                  {jobDetail.recruiter_message ? (
                    <div className="relative group">
                      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 whitespace-pre-wrap text-slate-300 leading-relaxed font-medium transition-all group-hover:border-white/10 group-hover:bg-white/[0.04]">
                        {jobDetail.recruiter_message}
                      </div>
                      <button
                        onClick={() => copyToClipboard(jobDetail.recruiter_message!, "linkedin")}
                        className="absolute top-4 right-4 p-3 bg-black/40 hover:bg-black/60 rounded-xl transition-all border border-white/5 backdrop-blur-md"
                        title="Copy to clipboard"
                      >
                        {copied === "linkedin" ? (
                          <Check className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <Copy className="h-5 w-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="size-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                        <MessageSquare className="h-8 w-8 text-slate-600" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No Intel Generated</h3>
                      <p className="text-slate-500 max-w-sm">LinkedIn outreach templates are generated during the analysis phase. Head to settings to ensure your API keys is active.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Email Tab */}
              {activeTab === "email" && (
                <div className="space-y-6">
                  {jobDetail.recruiter_message ? (
                    <div className="relative group">
                      <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 whitespace-pre-wrap text-slate-300 leading-relaxed font-medium transition-all group-hover:border-white/10 group-hover:bg-white/[0.04]">
                        {jobDetail.recruiter_message}
                      </div>
                      <button
                        onClick={() => copyToClipboard(jobDetail.recruiter_message!, "email")}
                        className="absolute top-4 right-4 p-3 bg-black/40 hover:bg-black/60 rounded-xl transition-all border border-white/5 backdrop-blur-md"
                        title="Copy to clipboard"
                      >
                        {copied === "email" ? (
                          <Check className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <Copy className="h-5 w-5 text-slate-400" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="size-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                        <Mail className="h-8 w-8 text-slate-600" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">No Template Found</h3>
                      <p className="text-slate-500 max-w-sm">Direct outreach templates can be generated in the optimization dashboard.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Resume Suggestions Tab */}
              {activeTab === "resume" && (
                <div className="space-y-6">
                  {jobDetail.resume_suggestions ? (
                    <div className="grid gap-6">
                      {jobDetail.resume_suggestions.improvements && Array.isArray(jobDetail.resume_suggestions.improvements) ? (
                        jobDetail.resume_suggestions.improvements.map((improvement: any, idx: number) => (
                          <div key={idx} className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] transition-all group">
                            <div className="flex gap-4">
                              <div className="size-10 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
                                <Sparkles className="h-5 w-5 text-orange-400" />
                              </div>
                              <div className="space-y-3">
                                <div className="p-4 bg-red-500/5 rounded-2xl border border-red-500/10">
                                  <p className="text-sm text-red-500 line-through font-medium opacity-60">
                                    {improvement.original_bullet}
                                  </p>
                                </div>
                                <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
                                  <p className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                                    {improvement.improved_bullet}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6">
                          <pre className="whitespace-pre-wrap text-sm text-slate-400 font-mono">
                            {JSON.stringify(jobDetail.resume_suggestions, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                      <div className="size-16 rounded-3xl bg-white/5 flex items-center justify-center mb-6">
                        <FileEdit className="h-8 w-8 text-slate-600" />
                      </div>
                      <h3 className="text-xl font-bold text-white mb-2">Awaiting Optimization</h3>
                      <p className="text-slate-500 max-w-sm">Sync your resume with this application to see tailored improvements.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertCircle className="h-10 w-10 text-rose-500 mb-4" />
              <p className="text-slate-400 font-bold">Failed to decrypt application details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

