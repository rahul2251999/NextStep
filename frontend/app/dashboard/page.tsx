"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import ResumeUpload from "@/components/ResumeUpload"
import JobDescriptionInput from "@/components/JobDescriptionInput"
import MatchScore from "@/components/MatchScore"
import ResumeImprovements from "@/components/ResumeImprovements"
import MessageGenerator from "@/components/MessageGenerator"

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [resumeId, setResumeId] = useState<number | null>(null)
  const [jobId, setJobId] = useState<number | null>(null)
  const [matchScore, setMatchScore] = useState<any>(null)
  const [step, setStep] = useState<"upload" | "job" | "results">("upload")

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#0ea5e9' }}></div>
      </div>
    )
  }

  if (!session) {
    router.push("/")
    return null
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <nav className="border-b" style={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderBottomWidth: '1px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <Link href="/" className="text-2xl font-bold" style={{ color: '#0ea5e9' }}>
              NextStep
            </Link>
            <span style={{ color: '#a3a3a3' }}>{session.user?.email}</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2" style={{ color: '#fafafa' }}>Dashboard</h1>
          <p style={{ color: '#a3a3a3' }}>
            Upload your resume and analyze job matches
          </p>
        </div>

        <div className="space-y-8">
          {step === "upload" && (
            <ResumeUpload
              onUploadSuccess={(id) => {
                setResumeId(id)
                setStep("job")
              }}
            />
          )}

          {step === "job" && resumeId && (
            <JobDescriptionInput
              onJobSubmit={(id) => {
                setJobId(id)
                setStep("results")
              }}
            />
          )}

          {step === "results" && resumeId && jobId && (
            <>
              <MatchScore
                resumeId={resumeId}
                jobId={jobId}
                onScoreLoaded={setMatchScore}
              />
              <ResumeImprovements
                resumeId={resumeId}
                jobId={jobId}
                matchScore={matchScore}
              />
              <MessageGenerator
                resumeId={resumeId}
                jobId={jobId}
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}



