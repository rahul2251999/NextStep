"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface ResumeImprovementsProps {
  resumeId: number
  jobId: number
  matchScore: any
}

export default function ResumeImprovements({
  resumeId,
  jobId,
  matchScore,
}: ResumeImprovementsProps) {
  const { data: session } = useSession()
  const [aiPercentage, setAiPercentage] = useState(50)
  const [loading, setLoading] = useState(false)
  const [improvements, setImprovements] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImprove = async () => {
    if (!session) return

    setLoading(true)
    setError(null)

    try {
      // Get token from NextAuth
      const tokenResponse = await fetch("/api/auth/token")
      const tokenData = await tokenResponse.json()
      const token = tokenData.token || session.user?.id || ""
      
      const response = await apiClient.improveResume(
        resumeId,
        jobId,
        aiPercentage,
        token
      )
      setImprovements(response)
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate improvements")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border" style={{ backgroundColor: '#171717', borderColor: '#262626' }}>
      <CardHeader style={{ borderBottom: '1px solid #262626' }}>
        <CardTitle style={{ color: '#fafafa' }}>Resume Improvements</CardTitle>
        <CardDescription style={{ color: '#a3a3a3' }}>
          Get AI-powered suggestions to improve your resume bullets following
          STAR/RIC format.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">

      <div className="mb-6 space-y-2">
        <Label>AI Content Percentage: {aiPercentage}%</Label>
        <input
          type="range"
          min="0"
          max="100"
          value={aiPercentage}
          onChange={(e) => setAiPercentage(Number(e.target.value))}
          className="w-full"
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: '#a3a3a3' }}>
          <span>No AI changes</span>
          <span>Full AI enhancement</span>
        </div>
      </div>

      <Button
        onClick={handleImprove}
        disabled={loading}
        className="w-full mb-6"
        size="lg"
      >
        {loading ? "Generating Improvements..." : "Generate Improvements"}
      </Button>

      {error && (
        <div className="p-4 border rounded-lg mb-6" style={{ backgroundColor: '#7f1d1d', borderColor: '#991b1b' }}>
          <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
        </div>
      )}

      {improvements && (
        <div className="space-y-6">
          {improvements.improvements && improvements.improvements.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4" style={{ color: '#fafafa' }}>Improved Bullets</h3>
              <div className="space-y-4">
                {improvements.improvements.map(
                  (item: any, idx: number) => (
                    <div
                      key={idx}
                      className="border rounded-lg p-4"
                      style={{ borderColor: '#404040', backgroundColor: '#262626' }}
                    >
                      <div className="mb-2">
                        <p className="text-sm font-medium" style={{ color: '#a3a3a3' }}>
                          Original:
                        </p>
                        <p style={{ color: '#fafafa' }}>{item.original_bullet}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#0ea5e9' }}>
                          Improved:
                        </p>
                        <p className="font-medium" style={{ color: '#fafafa' }}>
                          {item.improved_bullet}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          )}

          {improvements.new_bullets &&
            improvements.new_bullets.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#fafafa' }}>
                  Suggested New Bullets
                </h3>
                <div className="space-y-2">
                  {improvements.new_bullets.map((bullet: string, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 border rounded-lg"
                      style={{ backgroundColor: '#0c4a6e', borderColor: '#075985' }}
                    >
                      <p style={{ color: '#fafafa' }}>{bullet}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
      </CardContent>
    </Card>
  )
}


