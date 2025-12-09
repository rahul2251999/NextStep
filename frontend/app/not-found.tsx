"use client"

import Link from "next/link"
import { useState } from "react"

export default function NotFound() {
  const [hovered, setHovered] = useState(false)
  
  return (
    <div className="min-h-screen flex items-center justify-center p-8" style={{ backgroundColor: '#0a0a0a' }}>
      <div className="text-center max-w-md">
        <h2 className="text-4xl font-bold mb-4" style={{ color: '#fafafa' }}>404</h2>
        <h3 className="text-2xl font-semibold mb-4" style={{ color: '#fafafa' }}>Page Not Found</h3>
        <p className="mb-6" style={{ color: '#a3a3a3' }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 rounded-lg transition-colors"
          style={{ 
            backgroundColor: hovered ? '#0284c7' : '#0ea5e9', 
            color: '#ffffff' 
          }}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

