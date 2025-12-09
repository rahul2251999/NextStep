import axios from "axios"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  // Token will be added by the component using getSession
  return config
})

export interface ResumeUploadResponse {
  resume_id: number
  parse_summary: {
    name?: string
    education_count: number
    experience_count: number
  }
}

export interface JobSubmitResponse {
  job_id: number
  status: string
}

export interface MatchScoreResponse {
  job_id: number
  resume_id: number
  score: number
  missing_skills: string[]
  details?: {
    skills_match: number
    experience_match: number
    overall_fit: number
  }
}

export interface ResumeImprovement {
  original_bullet: string
  improved_bullet: string
}

export interface ResumeImproveResponse {
  resume_id: number
  improvements: ResumeImprovement[]
  new_bullets: string[]
}

export interface MessageResponse {
  message: string
  email_sent?: boolean
}

export const apiClient = {
  // Resume endpoints
  uploadResume: async (file: File, token: string): Promise<ResumeUploadResponse> => {
    const formData = new FormData()
    formData.append("resume", file)
    const response = await api.post("/api/resume/upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    })
    return response.data
  },

  // Job endpoints
  submitJob: async (
    jobData: { job_title: string; company: string; description: string },
    token: string
  ): Promise<JobSubmitResponse> => {
    const response = await api.post("/api/job/submit", jobData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  getMatchScore: async (
    resumeId: number,
    jobId: number,
    token: string
  ): Promise<MatchScoreResponse> => {
    const response = await api.get("/api/match-score", {
      params: { resume_id: resumeId, job_id: jobId },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },

  // Resume improvement
  improveResume: async (
    resumeId: number,
    jobId: number,
    aiContentPercentage: number,
    token: string
  ): Promise<ResumeImproveResponse> => {
    const response = await api.post(
      "/api/resume/improve",
      {
        resume_id: resumeId,
        job_id: jobId,
        ai_content_percentage: aiContentPercentage,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  },

  // Message generation
  generateRecruiterMessage: async (
    resumeId: number,
    jobId: number,
    recipientName?: string,
    recipientEmail?: string,
    token?: string
  ): Promise<MessageResponse> => {
    const response = await api.post(
      "/api/message/recruiter",
      {
        resume_id: resumeId,
        job_id: jobId,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    )
    return response.data
  },

  // User history
  getUserHistory: async (token: string) => {
    const response = await api.get("/api/user/history", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    return response.data
  },
}

export default api


