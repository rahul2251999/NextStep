"use client"

import { useEffect, useState } from "react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const [hovered, setHovered] = useState(false)
  
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="text-center max-w-md">
        <h2 className="text-2xl font-bold mb-4" style={{ color: '#fafafa' }}>Something went wrong!</h2>
        <p className="mb-4" style={{ color: '#a3a3a3' }}>
          {error.message || "An unexpected error occurred"}
        </p>
        {error.digest && (
          <p className="text-sm mb-4" style={{ color: '#737373' }}>Error ID: {error.digest}</p>
        )}
        <button
          onClick={reset}
          className="px-4 py-2 rounded-lg transition-colors"
          style={{ 
            backgroundColor: hovered ? '#0284c7' : '#0ea5e9', 
            color: '#ffffff' 
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          Try again
        </button>
      </div>
    </div>
  )
}

