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
    <Card className="border border-border/60 bg-card/80">
      <CardHeader className="border-b border-border/60 pb-4">
        <CardTitle className="text-foreground text-lg tracking-tight">
          Recruiter Email
        </CardTitle>
        <CardDescription className="text-muted-foreground text-sm">
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
          <p className="text-xs text-muted-foreground">
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
        <div className="mt-4 rounded-2xl border border-destructive/40 bg-destructive/15 px-4 py-3">
          <p className="text-sm text-destructive-foreground/80">{error}</p>
        </div>
      )}

      {emailSent && (
        <div className="mt-4 rounded-2xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3">
          <p className="text-sm font-semibold text-emerald-100">
            ✓ Email sent successfully to {recipientEmail}
          </p>
        </div>
      )}

      {message && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-foreground">
              Generated Message
            </h3>
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="sm"
            >
              Copy
            </Button>
          </div>
          <div className="rounded-2xl border border-border/70 bg-background/60 p-4">
            <p className="whitespace-pre-wrap text-foreground/90">{message}</p>
          </div>
        </div>
      )}
      </CardContent>
    </Card>
  )
}


