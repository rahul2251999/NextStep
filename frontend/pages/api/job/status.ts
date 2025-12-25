import type { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import jwt from "jsonwebtoken"
import axios from "axios"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "PATCH") {
        return res.status(405).json({ error: "Method not allowed" })
    }

    try {
        // Get NextAuth session token
        const tokenData = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
        
        if (!tokenData) {
            return res.status(401).json({ error: "Unauthorized" })
        }

        // Create JWT for backend
        const backendToken = jwt.sign(
            {
                email: tokenData.email,
                sub: tokenData.sub,
            },
            process.env.JWT_SECRET || "your-secret-key",
            { expiresIn: "1h" }
        )

        // Extract job_id from query
        const { job_id } = req.query
        if (!job_id || typeof job_id !== "string") {
            return res.status(400).json({ error: "Job ID is required" })
        }

        // Forward request to backend
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const response = await axios.patch(
            `${backendUrl}/api/job/${job_id}/status`,
            req.body,
            {
                headers: {
                    Authorization: `Bearer ${backendToken}`,
                    "Content-Type": "application/json",
                },
                timeout: 10000,
            }
        )

        return res.status(200).json(response.data)
    } catch (error: any) {
        console.error("Update job status error:", error)
        
        if (error.response) {
            // Backend returned an error
            return res.status(error.response.status).json({
                error: error.response.data?.detail || error.response.data?.error || "Failed to update status",
            })
        } else if (error.request) {
            // Request was made but no response received
            return res.status(503).json({
                error: "Cannot reach server. Please check if the backend is running.",
            })
        } else {
            // Something else happened
            return res.status(500).json({
                error: error.message || "An unexpected error occurred",
            })
        }
    }
}

