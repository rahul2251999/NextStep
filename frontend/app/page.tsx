"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function Home() {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Show content immediately, don't wait for session
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0a0a0a' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#0ea5e9' }}></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a', minHeight: '100vh' }}>
      <nav className="border-b" style={{ backgroundColor: '#0a0a0a', borderColor: '#262626', borderBottomWidth: '1px' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold" style={{ color: '#0ea5e9' }}>NextStep</h1>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <>
                  <span style={{ color: '#a3a3a3' }}>{session.user?.email}</span>
                  <Link
                    href="/dashboard"
                    className="px-4 py-2 rounded-md hover:opacity-90"
                    style={{ backgroundColor: '#0ea5e9', color: '#ffffff' }}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => signOut()}
                    style={{ color: '#a3a3a3' }}
                    className="px-4 py-2 hover:opacity-80"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 rounded-md hover:opacity-90"
                  style={{ backgroundColor: '#0ea5e9', color: '#ffffff' }}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold tracking-tight mb-4" style={{ color: '#fafafa' }}>
            AI-Powered Job Search
          </h1>
          <p className="text-xl mb-8" style={{ color: '#a3a3a3' }}>
            Optimize your resume, match with jobs, and land your dream position
          </p>
          {session ? (
            <Link
              href="/dashboard"
              className="inline-block px-8 py-3 rounded-md text-lg font-semibold hover:opacity-90"
              style={{ backgroundColor: '#0ea5e9', color: '#ffffff' }}
            >
              Go to Dashboard
            </Link>
          ) : (
            <Link
              href="/auth/signin"
              className="inline-block px-8 py-3 rounded-md text-lg font-semibold hover:opacity-90"
              style={{ backgroundColor: '#0ea5e9', color: '#ffffff' }}
            >
              Get Started
            </Link>
          )}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 rounded-lg border shadow-sm" style={{ backgroundColor: '#171717', borderColor: '#262626', borderWidth: '1px' }}>
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#fafafa' }}>Resume Analysis</h3>
            <p style={{ color: '#a3a3a3' }}>
              Upload your resume and get AI-powered insights on how to improve
              it
            </p>
          </div>
          <div className="p-6 rounded-lg border shadow-sm" style={{ backgroundColor: '#171717', borderColor: '#262626', borderWidth: '1px' }}>
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#fafafa' }}>Job Matching</h3>
            <p style={{ color: '#a3a3a3' }}>
              See how well your resume matches job descriptions using semantic
              similarity
            </p>
          </div>
          <div className="p-6 rounded-lg border shadow-sm" style={{ backgroundColor: '#171717', borderColor: '#262626', borderWidth: '1px' }}>
            <h3 className="text-xl font-semibold mb-3" style={{ color: '#fafafa' }}>Smart Messages</h3>
            <p style={{ color: '#a3a3a3' }}>
              Generate personalized emails for recruiters
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}


