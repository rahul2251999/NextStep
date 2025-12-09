"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ResumeUploadProps {
  onUploadSuccess: (resumeId: number) => void
}

export default function ResumeUpload({ onUploadSuccess }: ResumeUploadProps) {
  const { data: session } = useSession()
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parseSummary, setParseSummary] = useState<any>(null)

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

    setUploading(true)
    setError(null)

    try {
      // Get token from NextAuth
      const tokenResponse = await fetch("/api/auth/token")
      const tokenData = await tokenResponse.json()
      const token = tokenData.token || session.user?.id || ""
      
      const response = await apiClient.uploadResume(file, token)
      setParseSummary(response.parse_summary)
      onUploadSuccess(response.resume_id)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to upload resume")
    } finally {
      setUploading(false)
    }
  }

  return (
    <Card className="border" style={{ backgroundColor: '#171717', borderColor: '#262626' }}>
      <CardHeader style={{ borderBottom: '1px solid #262626' }}>
        <CardTitle style={{ color: '#fafafa' }}>Upload Your Resume</CardTitle>
        <CardDescription style={{ color: '#a3a3a3' }}>
          Upload your resume in PDF or DOCX format. We'll parse it and extract
          key information.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="resume-file">Resume File</Label>
          <Input
            id="resume-file"
            type="file"
            accept=".pdf,.docx"
            onChange={handleFileChange}
            className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
        </div>

        {file && (
          <div className="p-4 rounded-lg" style={{ backgroundColor: '#262626' }}>
            <p className="text-sm" style={{ color: '#fafafa' }}>
              Selected: <span className="font-medium">{file.name}</span>
            </p>
            <p className="text-xs mt-1" style={{ color: '#a3a3a3' }}>
              Size: {(file.size / 1024).toFixed(2)} KB
            </p>
          </div>
        )}

        {error && (
          <div className="p-4 border rounded-lg" style={{ backgroundColor: '#7f1d1d', borderColor: '#991b1b' }}>
            <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
          </div>
        )}

        {parseSummary && (
          <div className="p-4 border rounded-lg" style={{ backgroundColor: '#064e3b', borderColor: '#065f46' }}>
            <p className="text-sm font-semibold mb-2" style={{ color: '#6ee7b7' }}>
              Resume parsed successfully!
            </p>
            {parseSummary.name && (
              <p className="text-sm" style={{ color: '#6ee7b7' }}>
                Name: {parseSummary.name}
              </p>
            )}
            <p className="text-sm" style={{ color: '#6ee7b7' }}>
              Education entries: {parseSummary.education_count}
            </p>
            <p className="text-sm" style={{ color: '#6ee7b7' }}>
              Experience entries: {parseSummary.experience_count}
            </p>
          </div>
        )}

        <Button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full"
          size="lg"
        >
          {uploading ? "Uploading..." : "Upload Resume"}
        </Button>
        </div>
      </CardContent>
    </Card>
  )
}


