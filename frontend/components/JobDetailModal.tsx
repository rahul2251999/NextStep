"use client"

import { useState, useEffect } from "react"
import { X, Briefcase, Building, FileText, MessageSquare, Mail, FileEdit, TrendingUp, Copy, Check } from "lucide-react"
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div
        className="bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div className="flex-1">
            {loading ? (
              <div className="h-6 bg-muted animate-pulse rounded w-1/2"></div>
            ) : jobDetail ? (
              <>
                <h2 className="text-2xl font-bold text-foreground mb-1">{jobDetail.title}</h2>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{jobDetail.company || "No company"}</span>
                  </div>
                  {jobDetail.match_score !== null && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-4 w-4" />
                      <span className={`font-medium ${
                        jobDetail.match_score >= 80 ? "text-green-500" :
                        jobDetail.match_score >= 60 ? "text-yellow-500" :
                        "text-red-500"
                      }`}>
                        {jobDetail.match_score}% Match
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b flex gap-1 px-6">
          {[
            { id: "jd", label: "Job Description", icon: FileText },
            { id: "linkedin", label: "LinkedIn Message", icon: MessageSquare },
            { id: "email", label: "Email", icon: Mail },
            { id: "resume", label: "Resume Suggestions", icon: FileEdit },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-muted animate-pulse rounded w-full"></div>
              <div className="h-4 bg-muted animate-pulse rounded w-5/6"></div>
              <div className="h-4 bg-muted animate-pulse rounded w-4/6"></div>
            </div>
          ) : jobDetail ? (
            <>
              {/* Job Description Tab */}
              {activeTab === "jd" && (
                <div className="space-y-4">
                  <div className="prose dark:prose-invert max-w-none">
                    <div className="whitespace-pre-wrap text-foreground">
                      {jobDetail.description_text}
                    </div>
                  </div>
                </div>
              )}

              {/* LinkedIn Message Tab */}
              {activeTab === "linkedin" && (
                <div className="space-y-4">
                  {jobDetail.recruiter_message ? (
                    <div className="relative">
                      <div className="bg-card border rounded-lg p-4 whitespace-pre-wrap">
                        {jobDetail.recruiter_message}
                      </div>
                      <button
                        onClick={() => copyToClipboard(jobDetail.recruiter_message!, "linkedin")}
                        className="absolute top-2 right-2 p-2 hover:bg-muted rounded transition-colors"
                      >
                        {copied === "linkedin" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>LinkedIn message not generated yet.</p>
                      <p className="text-sm mt-2">Generate one from the resume improvement section.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Email Tab */}
              {activeTab === "email" && (
                <div className="space-y-4">
                  {jobDetail.recruiter_message ? (
                    <div className="relative">
                      <div className="bg-card border rounded-lg p-4 whitespace-pre-wrap">
                        {jobDetail.recruiter_message}
                      </div>
                      <button
                        onClick={() => copyToClipboard(jobDetail.recruiter_message!, "email")}
                        className="absolute top-2 right-2 p-2 hover:bg-muted rounded transition-colors"
                      >
                        {copied === "email" ? (
                          <Check className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Mail className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Email template not generated yet.</p>
                      <p className="text-sm mt-2">Generate one from the resume improvement section.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Resume Suggestions Tab */}
              {activeTab === "resume" && (
                <div className="space-y-4">
                  {jobDetail.resume_suggestions ? (
                    <div>
                      {jobDetail.resume_suggestions.improvements && Array.isArray(jobDetail.resume_suggestions.improvements) ? (
                        <div className="space-y-4">
                          {jobDetail.resume_suggestions.improvements.map((improvement: any, idx: number) => (
                            <div key={idx} className="bg-card border rounded-lg p-4">
                              <div className="mb-2">
                                <p className="text-sm text-muted-foreground line-through mb-1">
                                  Original: {improvement.original_bullet}
                                </p>
                                <p className="font-medium text-foreground">
                                  Improved: {improvement.improved_bullet}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-card border rounded-lg p-4">
                          <pre className="whitespace-pre-wrap text-sm">
                            {JSON.stringify(jobDetail.resume_suggestions, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileEdit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Resume suggestions not generated yet.</p>
                      <p className="text-sm mt-2">Generate suggestions from the resume improvement section.</p>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              Failed to load job details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

