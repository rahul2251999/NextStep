import { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import axios from "axios"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    // Get authentication token
    const tokenData = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    
    if (!tokenData) {
      return res.status(401).json({ error: "Not authenticated" })
    }

    // Create JWT token for backend
    const jwt = require("jsonwebtoken")
    const backendToken = jwt.sign(
      {
        sub: tokenData.id || tokenData.sub,
        email: tokenData.email,
        name: tokenData.name,
      },
      process.env.NEXTAUTH_SECRET || "",
      { expiresIn: "1h" }
    )

    // Forward request to backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
    const response = await axios.post(
      `${apiUrl}/api/job/submit`,
      req.body,
      {
        headers: {
          Authorization: `Bearer ${backendToken}`,
          "Content-Type": "application/json",
        },
        timeout: 30000,
      }
    )

    return res.status(200).json(response.data)
  } catch (error: any) {
    console.error("Job submit error:", error)
    
    if (error.response) {
      return res.status(error.response.status).json({
        error: error.response.data?.detail || 
               error.response.data?.error || 
               error.response.data?.message ||
               "Failed to submit job"
      })
    }
    
    return res.status(500).json({ 
      error: error.message || "Failed to submit job" 
    })
  }
}

