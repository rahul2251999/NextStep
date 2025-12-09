"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState, useEffect, useMemo } from "react"
import { Settings, Key, AlertCircle, ArrowRight, Plus, ListFilter, Columns, X, FileText, Upload } from "lucide-react"
import axios from "axios"
import { JobDataTable, Job } from "@/components/ui/job-data-table"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import JobDetailModal from "@/components/JobDetailModal"

interface ApiConfig {
  hasApiKey: boolean
  provider: string
  model: string | null
  loading: boolean
}

const allColumns: (keyof Job)[] = [
  "title",
  "company",
  "application_status",
  "match_score",
  "posted_at",
  "job_id",
]

export default function Dashboard() {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const [apiConfig, setApiConfig] = useState<ApiConfig>({
    hasApiKey: false,
    provider: "openai",
    model: null,
    loading: true,
  })
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [showAddJobModal, setShowAddJobModal] = useState(false)
  const [companyFilter, setCompanyFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof Job>>(new Set(allColumns))
  const [showResumeModal, setShowResumeModal] = useState(false)
  const [resumes, setResumes] = useState<Array<{ resume_id: number; name: string; uploaded_at: string }>>([])

  useEffect(() => {
    if (session && sessionStatus !== "loading") {
      fetchApiConfig()
      fetchJobs()
      fetchResumes()
    }
  }, [session, sessionStatus])

  const fetchApiConfig = async () => {
    try {
      const tokenResponse = await fetch("/api/auth/token")
      if (!tokenResponse.ok) return

      const tokenData = await tokenResponse.json()
      const token = tokenData.token || session?.accessToken || (session?.user as any)?.id || ""

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/settings`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setApiConfig({
        hasApiKey: !!response.data.api_key_masked,
        provider: response.data.ai_provider || "openai",
        model: response.data.model_preference || null,
        loading: false,
      })
    } catch (error) {
      console.error("Failed to fetch API config", error)
      setApiConfig((prev) => ({ ...prev, loading: false }))
    }
  }

  const fetchJobs = async () => {
    try {
      const tokenResponse = await fetch("/api/auth/token")
      if (!tokenResponse.ok) return

      const tokenData = await tokenResponse.json()
      const token = tokenData.token || session?.accessToken || (session?.user as any)?.id || ""

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/job/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setJobs(response.data)
    } catch (error) {
      console.error("Failed to fetch jobs", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchResumes = async () => {
    try {
      const tokenResponse = await fetch("/api/auth/token")
      if (!tokenResponse.ok) return

      const tokenData = await tokenResponse.json()
      const token = tokenData.token || session?.accessToken || (session?.user as any)?.id || ""

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/resume/list`,
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setResumes(response.data)
    } catch (error) {
      console.error("Failed to fetch resumes", error)
    }
  }

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const companyMatch =
        companyFilter === "" ||
        (job.company && job.company.toLowerCase().includes(companyFilter.toLowerCase()))
      const statusMatch = statusFilter === "all" || job.application_status === statusFilter
      return companyMatch && statusMatch
    })
  }, [companyFilter, statusFilter, jobs])

  const toggleColumn = (column: keyof Job) => {
    setVisibleColumns((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(column)) {
        newSet.delete(column)
      } else {
        newSet.add(column)
      }
      return newSet
    })
  }

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0a0a0a" }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: "#0ea5e9" }}></div>
      </div>
    )
  }

  if (!session) {
    router.push("/")
    return null
  }

  return (
    <div className="space-y-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Job Applications</h1>
        <p className="text-muted-foreground">
              Manage your job applications and track their status
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowResumeModal(true)}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium border border-input bg-background hover:bg-accent transition-colors"
            >
              <FileText className="h-4 w-4 mr-2" />
              {resumes.length > 0 ? `Resumes (${resumes.length}/5)` : "Add Resume"}
            </button>
            <button
              onClick={() => setShowAddJobModal(true)}
              className="inline-flex items-center px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Job
            </button>
          </div>
        </div>
      </div>

      {/* API Configuration Card */}
      {!apiConfig.hasApiKey && (
        <div className="bg-card border border-yellow-500/50 rounded-lg p-6 shadow-sm bg-yellow-500/5">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="p-2 rounded-lg bg-yellow-500/10">
                <AlertCircle className="h-5 w-5 text-yellow-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <Key className="h-4 w-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold text-foreground">AI API Configuration</h3>
                </div>
                <p className="text-sm text-yellow-600 dark:text-yellow-400 mb-2">
                  Configure your AI API key to enable resume improvements and message generation.
                </p>
                <Link
                  href="/dashboard/settings"
                  className="inline-flex items-center text-sm text-primary hover:underline"
                >
                  Configure API Settings
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 gap-4">
          <Input
            placeholder="Filter by company..."
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="max-w-xs"
          />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <ListFilter className="h-4 w-4" />
                <span>Status</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem
                checked={statusFilter === "all"}
                onCheckedChange={() => setStatusFilter("all")}
              >
                All
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "applied"}
                onCheckedChange={() => setStatusFilter("applied")}
              >
                Applied
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "interviewing"}
                onCheckedChange={() => setStatusFilter("interviewing")}
              >
                Interviewing
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "offer_received"}
                onCheckedChange={() => setStatusFilter("offer_received")}
              >
                Offer Received
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={statusFilter === "rejected"}
                onCheckedChange={() => setStatusFilter("rejected")}
              >
                Rejected
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Columns className="h-4 w-4" />
              <span>Columns</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {allColumns.map((column) => (
              <DropdownMenuCheckboxItem
                key={column}
                className="capitalize"
                checked={visibleColumns.has(column)}
                onCheckedChange={() => toggleColumn(column)}
              >
                {column === "job_id"
                  ? "Actions"
                  : column.replace("_", " ")}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Job Data Table */}
      <JobDataTable
        jobs={filteredJobs}
        visibleColumns={visibleColumns}
        onJobClick={setSelectedJob}
      />

      {/* Add Resume Modal */}
      {showResumeModal && (
        <ResumeUploadModal
          isOpen={showResumeModal}
          onClose={() => {
            setShowResumeModal(false)
            fetchResumes()
          }}
          resumesCount={resumes.length}
        />
      )}

      {/* Add Job Modal */}
      {showAddJobModal && (
        <AddJobModal
          isOpen={showAddJobModal}
          onClose={() => setShowAddJobModal(false)}
          onSuccess={() => {
            setShowAddJobModal(false)
            fetchJobs()
          }}
          resumes={resumes}
        />
      )}

      {/* Job Detail Modal */}
      {selectedJob && (
        <JobDetailModal
          jobId={selectedJob.job_id}
          isOpen={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          onUpdate={() => {
            fetchJobs()
            setSelectedJob(null)
            }}
          />
        )}
    </div>
  )
}

// Resume Upload Modal Component
function ResumeUploadModal({
  isOpen,
  onClose,
  resumesCount,
}: {
  isOpen: boolean
  onClose: () => void
  resumesCount: number
}) {
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      if (
        !selectedFile.type.includes("pdf") &&
        !selectedFile.name.endsWith(".docx")
      ) {
        setError("Please upload a PDF or DOCX file")
        return
      }
      setFile(selectedFile)
      setError(null)
    }
  }

  const handleUpload = async () => {
    if (!file || !session) return

    if (resumesCount >= 5) {
      setError("Maximum 5 resumes allowed. Please delete an existing resume first.")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const tokenResponse = await fetch("/api/auth/token")
      if (!tokenResponse.ok) return

      const tokenData = await tokenResponse.json()
      const token = tokenData.token || session?.accessToken || (session?.user as any)?.id || ""

      const formData = new FormData()
      formData.append("resume", file)

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/resume/upload`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )

      setFile(null)
      onClose()
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.error || "Failed to upload resume")
    } finally {
      setUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-lg shadow-xl max-w-md w-full overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Upload Resume</h2>
            <p className="text-muted-foreground text-sm">
              Add a resume to your profile ({resumesCount}/5)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="resume-file" className="text-sm font-medium">
              Resume File (PDF or DOCX)
            </label>
            <input
              id="resume-file"
              type="file"
              accept=".pdf,.docx"
              onChange={handleFileChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
            />
            {file && (
              <p className="text-sm text-muted-foreground">
                Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </p>
            )}
          </div>

          {error && (
            <div className="p-4 border border-red-500/50 bg-red-500/10 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-md text-sm font-medium border border-input hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || uploading || resumesCount >= 5}
              className="flex-1 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {uploading ? "Uploading..." : "Upload Resume"}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Add Job Modal Component
function AddJobModal({
  isOpen,
  onClose,
  onSuccess,
  resumes,
}: {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  resumes: Array<{ resume_id: number; name: string; uploaded_at: string }>
}) {
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
      const tokenResponse = await fetch("/api/auth/token")
      const tokenData = await tokenResponse.json()
      const token = tokenData.token || session?.accessToken || (session?.user as any)?.id || ""

      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/job/submit`,
        {
          job_title: jobTitle,
          company: company || "Unknown",
          description: description,
          resume_id: selectedResumeId || null,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      // Reset form
      setJobTitle("")
      setCompany("")
      setDescription("")
      setSelectedResumeId(null)
      onSuccess()
    } catch (err: any) {
      setError(err.response?.data?.detail || err.response?.data?.error || "Failed to submit job")
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between p-6 border-b">
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-1">Add New Job</h2>
            <p className="text-muted-foreground text-sm">
              Enter job details to add it to your applications
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="space-y-2">
            <label htmlFor="job-title" className="text-sm font-medium">
              Job Title *
            </label>
            <input
              id="job-title"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="company" className="text-sm font-medium">
              Company
            </label>
            <input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Tech Corp"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {resumes.length > 0 && (
            <div className="space-y-2">
              <label htmlFor="resume" className="text-sm font-medium">
                Resume Used (Optional)
              </label>
              <select
                id="resume"
                value={selectedResumeId || ""}
                onChange={(e) => setSelectedResumeId(e.target.value ? parseInt(e.target.value) : null)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="">No resume selected</option>
                {resumes.map((resume) => (
                  <option key={resume.resume_id} value={resume.resume_id}>
                    {resume.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Select the resume you used to apply for better match score and suggestions
              </p>
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">
              Job Description *
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={12}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            />
          </div>

          {error && (
            <div className="p-4 border border-red-500/50 bg-red-500/10 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 rounded-md text-sm font-medium border border-input hover:bg-accent transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {submitting ? "Adding..." : "Add Job"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
