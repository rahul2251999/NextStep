"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface JobDescriptionInputProps {
  onJobSubmit: (jobId: number) => void
}

export default function JobDescriptionInput({
  onJobSubmit,
}: JobDescriptionInputProps) {
  const { data: session } = useSession()
  const [jobTitle, setJobTitle] = useState("")
  const [company, setCompany] = useState("")
  const [description, setDescription] = useState("")
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
      // Get token from NextAuth
      const tokenResponse = await fetch("/api/auth/token")
      const tokenData = await tokenResponse.json()
      const token = tokenData.token || session.user?.id || ""
      
      const response = await apiClient.submitJob(
        {
          job_title: jobTitle,
          company: company || "Unknown",
          description: description,
        },
        token
      )
      onJobSubmit(response.job_id)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to submit job description")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="border" style={{ backgroundColor: '#171717', borderColor: '#262626' }}>
      <CardHeader style={{ borderBottom: '1px solid #262626' }}>
        <CardTitle style={{ color: '#fafafa' }}>Job Description</CardTitle>
        <CardDescription style={{ color: '#a3a3a3' }}>
          Enter the job description you want to match against your resume.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="job-title">Job Title *</Label>
            <Input
              id="job-title"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior Software Engineer"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input
              id="company"
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g., Tech Corp"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              rows={10}
              className="flex min-h-[80px] w-full rounded-md border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ 
                borderColor: '#404040', 
                backgroundColor: '#171717',
                color: '#fafafa'
              }}
              required
            />
          </div>

          {error && (
            <div className="p-4 border rounded-lg" style={{ backgroundColor: '#7f1d1d', borderColor: '#991b1b' }}>
              <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={submitting}
            className="w-full"
            size="lg"
          >
            {submitting ? "Submitting..." : "Submit Job Description"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}


