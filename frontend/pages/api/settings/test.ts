import type { NextApiRequest, NextApiResponse } from "next"
import { getToken } from "next-auth/jwt"
import jwt from "jsonwebtoken"
import axios from "axios"

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
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

        // Forward request to backend
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
        const response = await axios.post(
            `${backendUrl}/api/settings/test`,
            req.body,
            {
                headers: {
                    Authorization: `Bearer ${backendToken}`,
                    "Content-Type": "application/json",
                },
                timeout: 15000,
            }
        )

        return res.status(200).json(response.data)
    } catch (error: any) {
        console.error("Test connection error:", error)
        
        if (error.response) {
            // Backend returned an error
            return res.status(error.response.status).json({
                success: false,
                error: error.response.data?.detail || error.response.data?.error || "Connection test failed",
            })
        } else if (error.request) {
            // Request was made but no response received
            return res.status(503).json({
                success: false,
                error: "Cannot reach server. Please check if the backend is running.",
            })
        } else {
            // Something else happened
            return res.status(500).json({
                success: false,
                error: error.message || "An unexpected error occurred",
            })
        }
    }
}

