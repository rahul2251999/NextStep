"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { X } from "lucide-react"
import axios from "axios"
import { apiClient } from "@/lib/api"

interface AddJobModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
    resumes: Array<{ resume_id: number; name: string; uploaded_at: string }>
}

export default function AddJobModal({
    isOpen,
    onClose,
    onSuccess,
    resumes,
}: AddJobModalProps) {
    const { data: session } = useSession()
    const [jobTitle, setJobTitle] = useState("")
    const [company, setCompany] = useState("")
    const [description, setDescription] = useState("")
    const [selectedResumeId, setSelectedResumeId] = useState<number | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!jobTitle.trim() || !description.trim() || !session) {
            setError("Please fill in all required fields")
            return
        }

        setSubmitting(true)
        setError(null)

        try {
            // Get authentication token
            const tokenResponse = await fetch("/api/auth/token")
            if (!tokenResponse.ok) {
                throw new Error("Failed to get authentication token")
            }
            const tokenData = await tokenResponse.json()
            const token = tokenData.token || session?.accessToken || (session?.user as any)?.id || ""

            if (!token) {
                setError("Authentication failed. Please try logging in again.")
                setSubmitting(false)
                return
            }

            // Use Next.js API route as proxy to avoid CORS issues
            const response = await axios.post(
                "/api/job/submit",
                {
                    job_title: jobTitle.trim(),
                    company: company.trim() || "Unknown",
                    description: description.trim(),
                    resume_id: selectedResumeId || null,
                },
                { 
                    headers: { 
                        "Content-Type": "application/json"
                    },
                    timeout: 30000
                }
            )

            // Reset form
            setJobTitle("")
            setCompany("")
            setDescription("")
            setSelectedResumeId(null)
            setError(null)
            
            // Call success callback
            onSuccess()
        } catch (err: any) {
            console.error("Error submitting job:", err)
            console.error("Error details:", {
                message: err.message,
                response: err.response?.data,
                status: err.response?.status,
                request: err.request,
                config: err.config?.url
            })
            
            if (err.response) {
                // Server responded with error status
                const errorMessage = err.response.data?.detail || 
                                   err.response.data?.error || 
                                   err.response.data?.message ||
                                   `Failed to submit job (${err.response.status})`
                setError(errorMessage)
            } else if (err.request) {
                // Request was made but no response received
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
                console.error("Request details:", {
                    url: err.config?.url,
                    method: err.config?.method,
                    headers: err.config?.headers
                })
                
                // Check if it's a CORS error
                if (err.message?.includes("CORS") || err.message?.includes("cors")) {
                    setError(
                        `CORS error: Cannot connect to ${apiUrl}. ` +
                        `Make sure the backend CORS allows requests from ${window.location.origin}`
                    )
                } else if (err.code === "ECONNREFUSED" || err.code === "ERR_NETWORK") {
                    setError(
                        `Cannot connect to backend at ${apiUrl}. ` +
                        `Please ensure:\n` +
                        `1. Backend is running: cd backend && source venv/bin/activate && uvicorn main:app --reload\n` +
                        `2. Backend is accessible: Open http://localhost:8000/health in your browser\n` +
                        `3. Check browser console (F12) for detailed error messages`
                    )
                } else {
                    setError(
                        `Network error: ${err.message || "Cannot reach server"}. ` +
                        `Check browser console (F12) for details.`
                    )
                }
            } else if (err.code === "ECONNREFUSED") {
                setError("Connection refused. Is the backend running on port 8000?")
            } else if (err.code === "ETIMEDOUT") {
                setError("Request timed out. The server may be slow or unresponsive.")
            } else if (err.message) {
                setError(err.message)
            } else {
                setError("Failed to submit job. Please try again.")
            }
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4 backdrop-blur-sm"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-job-title"
        >
            <div
                className="glass-dark rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up bg-black/80 border border-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between p-8 border-b border-white/5">
                    <div>
                        <h2 id="add-job-title" className="text-3xl font-bold text-white mb-2">Add New Job</h2>
                        <p className="text-slate-400 text-sm">
                            Enter job details to begin tracking and optimization.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/5 rounded-xl transition-colors text-slate-400"
                    >
                        <X className="h-6 w-6" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 space-y-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label htmlFor="job-title" className="text-sm font-semibold text-slate-300 ml-1">
                                Job Title <span className="text-orange-500">*</span>
                            </label>
                            <input
                                id="job-title"
                                type="text"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                placeholder="Senior Engineer"
                                className="flex h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all placeholder:text-slate-600 hover:border-white/20"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="company" className="text-sm font-semibold text-slate-300 ml-1">
                                Company
                            </label>
                            <input
                                id="company"
                                type="text"
                                value={company}
                                onChange={(e) => setCompany(e.target.value)}
                                placeholder="Google"
                                className="flex h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all placeholder:text-slate-600 hover:border-white/20"
                            />
                        </div>
                    </div>

                    {resumes.length > 0 && (
                        <div className="space-y-2">
                            <label htmlFor="resume" className="text-sm font-semibold text-slate-300 ml-1">
                                Target Resume
                            </label>
                            <select
                                id="resume"
                                value={selectedResumeId || ""}
                                onChange={(e) => setSelectedResumeId(e.target.value ? parseInt(e.target.value) : null)}
                                className="flex h-12 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all hover:border-white/20 appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-slate-900">No selective resume</option>
                                {resumes.map((resume) => (
                                    <option key={resume.resume_id} value={resume.resume_id} className="bg-slate-900">
                                        {resume.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label htmlFor="description" className="text-sm font-semibold text-slate-300 ml-1">
                            Job Description <span className="text-orange-500">*</span>
                        </label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Paste job details..."
                            rows={8}
                            className="flex w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-orange-500/40 transition-all placeholder:text-slate-600 hover:border-white/20 min-h-[200px]"
                            required
                        />
                    </div>

                    {error && (
                        <div className="p-4 border border-red-500/20 bg-red-500/5 rounded-2xl">
                            <p className="text-sm text-red-500 font-medium text-center">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-4 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold border border-white/10 text-slate-400 hover:bg-white/5 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-6 py-4 rounded-2xl text-sm font-bold bg-white text-black hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 transition-all shadow-xl shadow-orange-500/10"
                        >
                            {submitting ? "Adding..." : "Add Job App"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
