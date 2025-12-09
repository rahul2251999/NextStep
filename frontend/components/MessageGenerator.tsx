"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface MessageGeneratorProps {
  resumeId: number
  jobId: number
}

export default function MessageGenerator({
  resumeId,
  jobId,
}: MessageGeneratorProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)

  // Recruiter message fields
  const [recipientName, setRecipientName] = useState("")
  const [recipientEmail, setRecipientEmail] = useState("")

  const generateRecruiterMessage = async () => {
    if (!session) return

    setLoading(true)
    setError(null)
    setEmailSent(false)

    try {
      // Get token from NextAuth
      const tokenResponse = await fetch("/api/auth/token")
      const tokenData = await tokenResponse.json()
      const token = tokenData.token || session.user?.id || ""
      
      const response = await apiClient.generateRecruiterMessage(
        resumeId,
        jobId,
        recipientName || undefined,
        recipientEmail || undefined,
        token
      )
      setMessage(response.message)
      setEmailSent(response.email_sent || false)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate message")
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (message) {
      navigator.clipboard.writeText(message)
      alert("Message copied to clipboard!")
    }
  }

  return (
    <Card className="border" style={{ backgroundColor: '#171717', borderColor: '#262626' }}>
      <CardHeader style={{ borderBottom: '1px solid #262626' }}>
        <CardTitle style={{ color: '#fafafa' }}>Recruiter Email</CardTitle>
        <CardDescription style={{ color: '#a3a3a3' }}>
          Generate and send a personalized email to recruiters
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="recipient-name">Recruiter Name (optional)</Label>
          <Input
            id="recipient-name"
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="e.g., John Doe"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="recipient-email">Recruiter Email</Label>
          <Input
            id="recipient-email"
            type="email"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            placeholder="recruiter@company.com"
          />
          <p className="text-xs" style={{ color: '#a3a3a3' }}>
            Leave empty to only generate message without sending
          </p>
        </div>
        <Button
          onClick={generateRecruiterMessage}
          disabled={loading}
          className="w-full"
          size="lg"
        >
          {loading ? "Generating..." : "Generate & Send Email"}
        </Button>
      </div>

      {error && (
        <div className="mt-4 p-4 border rounded-lg" style={{ backgroundColor: '#7f1d1d', borderColor: '#991b1b' }}>
          <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
        </div>
      )}

      {emailSent && (
        <div className="mt-4 p-4 border rounded-lg" style={{ backgroundColor: '#064e3b', borderColor: '#065f46' }}>
          <p className="text-sm font-semibold" style={{ color: '#6ee7b7' }}>
            ✓ Email sent successfully to {recipientEmail}
          </p>
        </div>
      )}

      {message && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold" style={{ color: '#fafafa' }}>Generated Message</h3>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
            >
              Copy
            </Button>
          </div>
          <div className="p-4 border rounded-lg" style={{ backgroundColor: '#262626', borderColor: '#404040' }}>
            <p className="whitespace-pre-wrap" style={{ color: '#fafafa' }}>{message}</p>
          </div>
        </div>
      )}
      </CardContent>
    </Card>
  )
}


