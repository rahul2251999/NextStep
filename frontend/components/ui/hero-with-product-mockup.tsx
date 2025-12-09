"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Search, LayoutDashboard, TrendingUp, Settings, MessageSquare, Calendar, MoreHorizontal } from "lucide-react"
import Link from "next/link"

interface LandingPageProps {
  title?: string
  description?: string
  primaryButtonText?: string
  primaryButtonIcon?: React.ReactNode
  brandColor?: string
  accentColor?: string
  showMockups?: boolean
  logoComponent?: React.ReactNode
  onButtonClick?: () => void
  session?: any
  onSignOut?: () => void
}

export function HeroSection({
  title = "Transform your digital experience",
  description = "Streamline your daily tasks with fewer distractions and more focus.",
  primaryButtonText = "Get Started",
  primaryButtonIcon = <ArrowRight size={20} />,
  brandColor = "blue",
  accentColor = "purple",
  showMockups = true,
  logoComponent,
  onButtonClick,
  session,
  onSignOut,
}: LandingPageProps) {
  const handleClick = () => {
    if (onButtonClick) {
      onButtonClick()
    }
  }
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Integrated Navigation Bar */}
      <nav className="w-full border-b backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md" style={{ 
        borderColor: 'rgba(99, 102, 241, 0.2)', 
        background: 'linear-gradient(135deg, rgba(10, 10, 10, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
        boxShadow: '0 4px 20px rgba(99, 102, 241, 0.1)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <Link 
                href="/" 
                className="flex items-center gap-2 text-lg font-semibold transition-all duration-200 hover:scale-105"
                style={{ color: '#fafafa' }}
              >
                <div className="size-8 rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110" style={{ 
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
                }}>
                  <svg className="size-4" style={{ color: '#ffffff' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent font-bold">
                  NextStep
                </span>
              </Link>
            </div>
            <div className="flex items-center gap-3">
              {session ? (
                <>
                  <span className="text-sm hidden md:inline px-3 py-1 rounded-lg" style={{ 
                    color: '#c7d2fe',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                  }}>
                    {session.user?.email}
                  </span>
                  <Link
                    href="/dashboard"
                    className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{ 
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                      color: '#ffffff',
                      boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                      border: '1px solid rgba(139, 92, 246, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 6px 25px rgba(236, 72, 153, 0.5)'
                      e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)'
                      e.currentTarget.style.transform = 'translateY(0) scale(1)'
                    }}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={onSignOut}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                    style={{ 
                      color: '#f472b6',
                      background: 'rgba(236, 72, 153, 0.1)',
                      border: '1px solid rgba(236, 72, 153, 0.2)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(236, 72, 153, 0.2)'
                      e.currentTarget.style.color = '#fbbf24'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'rgba(236, 72, 153, 0.1)'
                      e.currentTarget.style.color = '#f472b6'
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/signin"
                  className="px-5 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{ 
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                    color: '#ffffff',
                    boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 6px 25px rgba(236, 72, 153, 0.5)'
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(99, 102, 241, 0.4)'
                    e.currentTarget.style.transform = 'translateY(0) scale(1)'
                  }}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="flex-1 p-4 md:p-6 lg:p-8 flex flex-col-reverse lg:flex-row gap-12 lg:gap-20 items-center justify-center">
      <div className="space-y-6 lg:space-y-8 max-w-2xl w-full">
        {/* Brand Label */}
        <div className="space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight" style={{
            background: 'linear-gradient(to right, #ffffff 0%, #e5e7eb 50%, #d1d5db 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            {title}
          </h1>
        </div>

        {/* Description */}
        <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-normal max-w-lg">
          {description}
        </p>

        {/* Actions */}
        <div className="pt-4">
          <Button
            size="lg"
            onClick={handleClick}
            className="cursor-pointer text-lg font-semibold px-8 py-6 rounded-xl flex items-center gap-3 transition-all duration-200"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)',
              color: '#ffffff',
              border: 'none',
              boxShadow: '0 8px 30px rgba(99, 102, 241, 0.4)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.5)'
              e.currentTarget.style.transform = 'translateY(-2px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(99, 102, 241, 0.4)'
              e.currentTarget.style.transform = 'translateY(0)'
            }}
          >
            {primaryButtonText}
            {primaryButtonIcon}
          </Button>
        </div>
      </div>

      {/* Right Side - Product Mockups */}
      {showMockups && (
        <div className="relative w-full max-w-lg mx-auto lg:mx-0">
          {/* Desktop Application Window */}
          <div className="max-sm:hidden relative bg-gray-900 rounded-2xl shadow-2xl border border-gray-800 overflow-hidden transform rotate-2 hover:rotate-1 transition-transform duration-300">
            {/* Application Header */}
            <div className="bg-gray-800/80 px-6 py-4 border-b border-gray-700">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-4 h-4 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M10 19l-7-7m0 0l7-7m-7 7h18"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <svg
                      className="w-4 h-4 text-gray-400"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="m14 5 7 7-7 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 max-w-xs">
                  <div className="bg-gray-900 rounded-full px-4 py-2 text-sm text-gray-400 border border-gray-700 flex items-center">
                    <Search size={14} className="mr-2" />
                    Search
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center">
                    <span className="text-gray-300 font-bold text-xs">⭐</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Application Content */}
            <div className="p-8 bg-gray-900 min-h-[320px]">
              <div className="flex items-center space-x-4 mb-8">
                {logoComponent || (
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ 
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.3)'
                  }}>
                    <span className="text-white font-bold text-lg">N</span>
                  </div>
                )}
                <span className="font-semibold text-white text-lg">NextStep</span>
              </div>

              <div className="space-y-8">
                <div className="space-y-3">
                  <h3 className="text-gray-400 font-medium">Quick Actions</h3>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full w-3/4 rounded-full" style={{ 
                      background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)'
                    }}></div>
                  </div>
                </div>

                {/* Feature Grid */}
                <div className="grid grid-cols-6 gap-4">
                  {[
                    { 
                      name: "Dashboard", 
                      color: "#3b82f6", 
                      gradient: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      icon: LayoutDashboard 
                    },
                    { 
                      name: "Analytics", 
                      color: "#10b981", 
                      gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                      icon: TrendingUp 
                    },
                    { 
                      name: "Settings", 
                      color: "#8b5cf6", 
                      gradient: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                      icon: Settings 
                    },
                    { 
                      name: "Messages", 
                      color: "#f59e0b", 
                      gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                      icon: MessageSquare 
                    },
                    { 
                      name: "Calendar", 
                      color: "#ef4444", 
                      gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                      icon: Calendar 
                    },
                    { 
                      name: "More", 
                      color: "#64748b", 
                      gradient: "linear-gradient(135deg, #64748b 0%, #475569 100%)",
                      icon: MoreHorizontal 
                    },
                  ].map((item, index) => {
                    const IconComponent = item.icon
                    return (
                      <div
                        key={index}
                        className="flex flex-col items-center space-y-2 group cursor-pointer"
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-all duration-200 group-hover:shadow-lg"
                          style={{ 
                            background: item.gradient,
                            boxShadow: `0 4px 12px ${item.color}40`
                          }}
                        >
                          <IconComponent className="w-5 h-5 text-white" strokeWidth={2.5} />
                        </div>
                        <span className="text-xs text-gray-400 text-center font-medium group-hover:text-gray-300 transition-colors">
                          {item.name}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Stacked Windows Behind */}
          <div className="absolute -top-4 -left-4 w-full h-full rounded-2xl shadow-xl transform rotate-6 -z-10 opacity-30" style={{
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.15) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.1)',
            backdropFilter: 'blur(10px)'
          }}></div>
          <div className="absolute -top-8 -left-8 w-full h-full rounded-2xl shadow-xl transform rotate-12 -z-20 opacity-20" style={{
            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.25) 0%, rgba(168, 85, 247, 0.2) 100%)',
            border: '1px solid rgba(139, 92, 246, 0.1)',
            backdropFilter: 'blur(10px)'
          }}></div>

          {/* Mobile App Mockup */}
          <div className="absolute -bottom-4 -right-20 md:-bottom-12 md:-right-12 w-56 h-[28rem] md:w-44 md:h-80 bg-gray-900 rounded-[2.5rem] p-2 shadow-2xl transform -rotate-12 hover:-rotate-6 transition-transform duration-300 border border-gray-800">
            <div className="w-full h-full bg-gray-900 rounded-[2rem] overflow-hidden border border-gray-700">
              {/* Phone Header */}
              <div className="bg-gray-800/50 px-6 py-3 flex justify-between items-center text-xs border-b border-gray-700">
                <span className="font-semibold text-white">9:41</span>
                <div className="flex items-center space-x-1">
                  <div className="w-4 h-2 bg-green-500 rounded-sm"></div>
                  <span className="text-gray-400 font-medium">100%</span>
                </div>
              </div>

              {/* Phone Content */}
              <div className="p-4 space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg" style={{ 
                    background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.3)'
                  }}></div>
                  <span className="text-sm font-semibold text-white">NextStep</span>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square bg-gray-800 rounded-xl hover:bg-gray-700 transition-colors cursor-pointer border border-gray-700"
                    ></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  )
}

