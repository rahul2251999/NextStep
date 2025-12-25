"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import { Key, ArrowRight, Plus, Columns, FileText, TrendingUp, Search, Settings, LogOut, User } from "lucide-react"
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
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import JobDetailModal from "@/components/JobDetailModal"
import ResumeUploadModal from "@/components/ResumeUploadModal"
import AddJobModal from "@/components/AddJobModal"
import Link from "next/link"
import { signOut } from "next-auth/react"

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
    if (sessionStatus === "authenticated") {
      fetchApiConfig()
      fetchJobs()
      fetchResumes()
    }
  }, [sessionStatus])

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

  const handleStatusChange = async (jobId: number, newStatus: string) => {
    try {
      await axios.patch(
        `/api/job/${jobId}/status`,
        { application_status: newStatus },
        { timeout: 10000 }
      )
      // Refresh the jobs list
      fetchJobs()
    } catch (error: any) {
      console.error("Failed to update status", error)
      alert(error.response?.data?.error || "Failed to update status. Please try again.")
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

  // Calculate stats - must be before early returns to follow Rules of Hooks
  const stats = useMemo(() => {
    const total = jobs.length
    const applied = jobs.filter((j) => j.application_status === "applied").length
    const interviewing = jobs.filter((j) => j.application_status === "interviewing").length
    const offerReceived = jobs.filter((j) => j.application_status === "offer_received").length
    const rejected = jobs.filter((j) => j.application_status === "rejected").length
    const avgMatch =
      jobs.filter((j) => j.match_score !== null).length > 0
        ? Math.round(
            jobs
              .filter((j) => j.match_score !== null)
              .reduce((sum, j) => sum + (j.match_score || 0), 0) /
              jobs.filter((j) => j.match_score !== null).length
          )
        : 0

    return { total, applied, interviewing, offerReceived, rejected, avgMatch }
  }, [jobs])

  if (sessionStatus === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-white"></div>
      </div>
    )
  }

  if (!session) {
    router.push("/")
    return null
  }

  return (
    <div className="min-h-screen bg-black relative">
      {/* Background Pattern */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-10 pointer-events-none" />
      
      {/* Floating Top Bar - Left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-4 left-4 z-50"
      >
        <Link
          href="/dashboard"
          className="glass rounded-full border border-white/10 bg-black/40 px-4 py-2.5 text-foreground hover:bg-white/5 backdrop-blur-xl transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-black font-bold text-sm">
            NS
          </div>
          <span className="hidden sm:block text-sm font-semibold text-white">NextStep</span>
        </Link>
      </motion.div>

      {/* Floating Top Bar - Right */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed top-4 right-4 z-50 flex items-center gap-3"
      >
        <Link
          href="/dashboard/settings"
          className="glass rounded-full border border-white/10 bg-black/40 p-3 text-foreground hover:bg-white/5 backdrop-blur-xl transition-all hover:scale-105 shadow-lg"
          title="Settings"
        >
          <Settings className="h-4 w-4 text-white" />
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="glass rounded-full border border-white/10 bg-black/40 px-3 py-2 text-foreground hover:bg-white/5 backdrop-blur-xl transition-all hover:scale-105 flex items-center gap-2 shadow-lg">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                <User className="h-4 w-4 text-white" />
              </div>
              <span className="hidden sm:block text-sm font-medium max-w-[120px] truncate text-white">
                {session?.user?.email || session?.user?.name || "User"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="glass-dark border-white/10 rounded-2xl backdrop-blur-xl w-56 bg-black/80">
            <DropdownMenuLabel className="p-4">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-white">
                  {session?.user?.name || "User"}
                </p>
                <p className="text-xs text-slate-400 truncate">
                  {session?.user?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem asChild className="text-white hover:bg-white/10">
              <Link href="/dashboard/settings" className="flex items-center gap-2 cursor-pointer w-full">
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-white/5" />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-red-400 focus:text-red-400 focus:bg-red-500/10 hover:bg-red-500/10"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </motion.div>
      
      {/* Main Content - Add padding top to avoid overlap with floating bars */}
      <div className="relative mx-auto max-w-7xl px-6 pt-24 pb-8 md:px-10">

        <main className="space-y-8">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between"
          >
            <div>
              <h1 className="mb-2 text-4xl font-bold tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
                Job Application Dashboard
              </h1>
              <p className="text-sm text-slate-400">Track roles, documents, and outreach in one place.</p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button
                onClick={() => setShowResumeModal(true)}
                variant="outline"
                className="glass rounded-2xl border-white/10 bg-black/40 text-foreground hover:bg-white/5 backdrop-blur-xl"
              >
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                Resumes ({resumes.length}/5)
              </Button>
              <Button
                onClick={() => setShowAddJobModal(true)}
                className="rounded-2xl bg-white px-4 font-semibold text-black shadow-lg shadow-white/10 transition-transform hover:translate-y-[-1px] active:translate-y-[1px] hover:bg-white/90"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Application
              </Button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="relative overflow-hidden backdrop-blur-xl bg-white/5 border-white/10 shadow-xl hover:bg-white/10 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
              <CardHeader className="relative pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Total Applications</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-white">{stats.total}</div>
                <div className="flex items-center gap-1 text-sm text-green-400 mt-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Active tracking</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden backdrop-blur-xl bg-white/5 border-white/10 shadow-xl hover:bg-white/10 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10" />
              <CardHeader className="relative pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Avg Match Score</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold text-white">{stats.avgMatch}%</div>
                <div className="flex items-center gap-1 text-sm text-green-400 mt-1">
                  <TrendingUp className="w-4 h-4" />
                  <span>Quality matches</span>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden backdrop-blur-xl bg-white/5 border-white/10 shadow-xl hover:bg-white/10 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-orange-500/10" />
              <CardHeader className="relative pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">In Progress</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Interviewing</span>
                    <span className="font-semibold text-white">{stats.interviewing}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Applied</span>
                    <span className="font-semibold text-white">{stats.applied}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden backdrop-blur-xl bg-white/5 border-white/10 shadow-xl hover:bg-white/10 transition-all">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
              <CardHeader className="relative pb-2">
                <CardTitle className="text-sm font-medium text-slate-400">Results</CardTitle>
              </CardHeader>
              <CardContent className="relative">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Offers</span>
                    <span className="font-semibold text-green-400">{stats.offerReceived}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Rejected</span>
                    <span className="font-semibold text-red-400">{stats.rejected}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* API Warning */}
          {!apiConfig.hasApiKey && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="glass-dark rounded-2xl border border-white/10 bg-black/60 p-8 backdrop-blur-xl"
            >
              <div className="flex items-start gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/5 text-muted-foreground">
                  <Key className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">Connect your AI provider</h3>
                  <p className="max-w-2xl text-sm text-muted-foreground">
                    Add an API key so NextStep can tailor resumes, draft outreach, and prepare interview notes for each role.
                  </p>
                  <Link
                    href="/dashboard/settings"
                    className="inline-flex items-center text-sm font-medium text-foreground underline-offset-4 hover:underline"
                  >
                    Open settings
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          )}

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col gap-4 sm:flex-row sm:items-center"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Search by company..."
                value={companyFilter}
                onChange={(e) => setCompanyFilter(e.target.value)}
                className="glass h-12 rounded-2xl border-white/10 bg-black/40 pl-10 text-foreground focus:ring-white/20 backdrop-blur-xl"
              />
            </div>

            <div className="flex gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="glass h-12 rounded-2xl border-white/10 bg-black/40 px-6 backdrop-blur-xl">
                    <span className="mr-2 text-xs uppercase tracking-[0.16em] text-muted-foreground">Status</span>
                    <span className="text-sm font-medium text-foreground capitalize">{statusFilter}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-dark border-white/10 rounded-2xl backdrop-blur-xl">
                  <DropdownMenuLabel className="p-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                    Application Filter
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  {["all", "applied", "interviewing", "offer_received", "rejected"].map((status) => (
                    <DropdownMenuCheckboxItem
                      key={status}
                      checked={statusFilter === status}
                      onCheckedChange={() => setStatusFilter(status)}
                      className="p-4 capitalize text-foreground hover:bg-white/5"
                    >
                      {status.replace("_", " ")}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="glass h-12 w-12 rounded-2xl border-white/10 bg-black/40 p-0 backdrop-blur-xl">
                    <Columns className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="glass-dark w-56 rounded-2xl border-white/10 backdrop-blur-xl">
                  <DropdownMenuLabel className="p-4 text-[10px] uppercase tracking-widest text-muted-foreground">
                    Layout Controls
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5" />
                  {allColumns.map((column) => (
                    <DropdownMenuCheckboxItem
                      key={column}
                      className="p-4 capitalize text-foreground"
                      checked={visibleColumns.has(column)}
                      onCheckedChange={() => toggleColumn(column)}
                    >
                      {column === "job_id" ? "Actions" : column.replace("_", " ")}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </motion.div>

          {/* Data Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="glass-dark rounded-2xl border border-white/10 bg-black/50 p-6 backdrop-blur-3xl shadow-2xl"
          >
            <JobDataTable
              jobs={filteredJobs}
              visibleColumns={visibleColumns}
              onJobClick={setSelectedJob}
              onStatusChange={handleStatusChange}
            />
          </motion.div>
        </main>

        {/* Modals */}
        <ResumeUploadModal
          isOpen={showResumeModal}
          onClose={() => {
            setShowResumeModal(false)
            fetchResumes()
          }}
          resumesCount={resumes.length}
        />

        <AddJobModal
          isOpen={showAddJobModal}
          onClose={() => setShowAddJobModal(false)}
          onSuccess={() => {
            setShowAddJobModal(false)
            fetchJobs()
          }}
          resumes={resumes}
        />

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
    </div>
  )
}
