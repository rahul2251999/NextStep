import { getToken } from "next-auth/jwt"
import { NextApiRequest, NextApiResponse } from "next"
import jwt from "jsonwebtoken"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" })
  }

  try {
    const tokenData = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
    
    if (!tokenData) {
      return res.status(401).json({ error: "Not authenticated" })
    }

    // Create a JWT token that the backend can verify
    // The backend expects a JWT with user info
    const jwtToken = jwt.sign(
      {
        sub: tokenData.id || tokenData.sub,
        email: tokenData.email,
        name: tokenData.name,
      },
      process.env.NEXTAUTH_SECRET || "",
      { expiresIn: "1h" }
    )

    return res.status(200).json({ token: jwtToken })
  } catch (error) {
    console.error("Token error:", error)
    return res.status(500).json({ error: "Failed to get token" })
  }
}

