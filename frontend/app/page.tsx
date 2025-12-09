"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { HeroSection } from "@/components/ui/hero-with-product-mockup"
import { ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"

export default function Home() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const handleGetStarted = () => {
    if (session) {
      router.push("/dashboard")
    } else {
      router.push("/auth/signin")
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Hero Section with integrated navigation */}
      <HeroSection
        title="AI-Powered Job Search & Resume Optimization"
        description="Transform your job search with intelligent resume matching, personalized LinkedIn messages, and AI-powered resume improvements. Get hired faster with NextStep."
        primaryButtonText={session ? "Go to Dashboard" : "Get Started"}
        primaryButtonIcon={<ArrowRight size={20} />}
        showMockups={true}
        onButtonClick={handleGetStarted}
        session={session}
        onSignOut={signOut}
      />
    </div>
  )
}
