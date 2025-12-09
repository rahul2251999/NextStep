"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { apiClient } from "@/lib/api"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MatchScoreProps {
  resumeId: number
  jobId: number
  onScoreLoaded: (score: any) => void
}

export default function MatchScore({
  resumeId,
  jobId,
  onScoreLoaded,
}: MatchScoreProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [score, setScore] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchScore = async () => {
      if (!session) return

      setLoading(true)
      try {
        // Get token from NextAuth
        const tokenResponse = await fetch("/api/auth/token")
        const tokenData = await tokenResponse.json()
        const token = tokenData.token || session.user?.id || ""
        
        const response = await apiClient.getMatchScore(
          resumeId,
          jobId,
          token
        )
        setScore(response)
        onScoreLoaded(response)
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to get match score")
      } finally {
        setLoading(false)
      }
    }

    fetchScore()
  }, [resumeId, jobId, session, onScoreLoaded])

  if (loading) {
    return (
      <Card className="border" style={{ backgroundColor: '#171717', borderColor: '#262626' }}>
        <CardContent className="pt-6">
          <div className="animate-pulse">
            <div className="h-8 rounded w-1/4 mb-4" style={{ backgroundColor: '#262626' }}></div>
            <div className="h-32 rounded" style={{ backgroundColor: '#262626' }}></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border" style={{ backgroundColor: '#171717', borderColor: '#262626' }}>
        <CardContent className="pt-6">
          <div className="p-4 border rounded-lg" style={{ backgroundColor: '#7f1d1d', borderColor: '#991b1b' }}>
            <p className="text-sm" style={{ color: '#fca5a5' }}>{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!score) return null

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-destructive"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500/10"
    if (score >= 60) return "bg-yellow-500/10"
    return "bg-destructive/10"
  }

  return (
    <Card className="border" style={{ backgroundColor: '#171717', borderColor: '#262626' }}>
      <CardHeader style={{ borderBottom: '1px solid #262626' }}>
        <CardTitle style={{ color: '#fafafa' }}>Job Match Score</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">

      <div className="flex items-center justify-center mb-6">
        <div
          className={`w-32 h-32 rounded-full ${getScoreBg(
            score.score
          )} flex items-center justify-center`}
        >
          <span className={`text-4xl font-bold ${getScoreColor(score.score)}`}>
            {score.score}%
          </span>
        </div>
      </div>

      {score.details && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center">
            <p className="text-sm" style={{ color: '#a3a3a3' }}>Skills Match</p>
            <p className="text-2xl font-semibold" style={{ color: '#fafafa' }}>
              {score.details.skills_match}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm" style={{ color: '#a3a3a3' }}>Experience Match</p>
            <p className="text-2xl font-semibold" style={{ color: '#fafafa' }}>
              {score.details.experience_match}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm" style={{ color: '#a3a3a3' }}>Overall Fit</p>
            <p className="text-2xl font-semibold" style={{ color: '#fafafa' }}>
              {score.details.overall_fit}%
            </p>
          </div>
        </div>
      )}

      {score.missing_skills && score.missing_skills.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#fafafa' }}>Missing Skills</h3>
          <div className="flex flex-wrap gap-2">
            {score.missing_skills.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-3 py-1 border rounded-full text-sm"
                style={{ backgroundColor: '#451a03', color: '#fbbf24', borderColor: '#f59e0b' }}
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
      </CardContent>
    </Card>
  )
}


