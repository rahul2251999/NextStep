import { getSession } from "next-auth/react"

export async function getAuthToken(): Promise<string | null> {
  const session = await getSession()
  if (!session) {
    return null
  }
  
  // NextAuth stores the JWT in the session
  // We need to get it from the JWT callback
  // For now, we'll use a workaround by getting it from the session
  // In production, you might want to store the token in a cookie or use a different approach
  
  // The token should be available in the session if configured properly
  // For this implementation, we'll need to modify NextAuth to include the token
  // For now, return a placeholder - the backend will need to handle this differently
  // or we can use NextAuth's getToken function
  
  try {
    // Try to get token from NextAuth
    const { getToken } = await import("next-auth/jwt")
    // This requires the request object, which we don't have in client components
    // So we'll need a different approach
    
    // Alternative: Create an API route that returns the token
    const response = await fetch("/api/auth/token")
    if (response.ok) {
      const data = await response.json()
      return data.token
    }
  } catch (e) {
    console.error("Failed to get token:", e)
  }
  
  return null
}

