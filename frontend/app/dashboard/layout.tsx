"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { LayoutDashboard, Settings, LogOut, User, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const { data: session } = useSession()
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

    const navigation = [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { name: "API Settings", href: "/dashboard/settings", icon: Settings },
    ]

    return (
        <div className="min-h-screen bg-background">
            {/* Sidebar */}
            <div className={`hidden md:fixed md:inset-y-0 md:flex md:flex-col transition-all duration-300 ${
                sidebarCollapsed ? "md:w-16" : "md:w-64"
            }`}>
                <div className="flex min-h-0 flex-1 flex-col border-r bg-card relative">
                    {/* Toggle Button */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="absolute -right-3 top-16 z-10 h-6 w-6 rounded-full border bg-card shadow-md flex items-center justify-center hover:bg-accent transition-colors"
                    >
                        {sidebarCollapsed ? (
                            <ChevronRight className="h-4 w-4" />
                        ) : (
                            <ChevronLeft className="h-4 w-4" />
                        )}
                    </button>

                    <div className="flex h-16 flex-shrink-0 items-center px-4 border-b">
                        <Link href="/dashboard" className={`text-2xl font-bold text-primary transition-opacity ${
                            sidebarCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                        }`}>
                            NextStep
                        </Link>
                    </div>
                    <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                        <nav className="mt-5 flex-1 space-y-1 px-2">
                            {navigation.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <Link
                                        key={item.name}
                                        href={item.href}
                                        title={sidebarCollapsed ? item.name : ""}
                                        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                                            sidebarCollapsed ? "justify-center" : ""
                                        } ${
                                            isActive
                                                ? "bg-primary/10 text-primary"
                                                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                                        }`}
                                    >
                                        <item.icon
                                            className={`h-5 w-5 flex-shrink-0 ${
                                                sidebarCollapsed ? "" : "mr-3"
                                            } ${
                                                isActive ? "text-primary" : "text-muted-foreground group-hover:text-accent-foreground"
                                            }`}
                                            aria-hidden="true"
                                        />
                                        {!sidebarCollapsed && <span>{item.name}</span>}
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                    <div className="flex flex-shrink-0 border-t bg-card p-4">
                        <div className="group block w-full flex-shrink-0">
                            <div className={`flex items-center ${sidebarCollapsed ? "justify-center" : ""}`}>
                                <div className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                                    <User className="h-5 w-5 text-primary" />
                                </div>
                                {!sidebarCollapsed && (
                                    <div className="ml-3">
                                        <p className="text-sm font-medium text-foreground">
                                            {session?.user?.name || "User"}
                                        </p>
                                        <button
                                            onClick={() => signOut({ callbackUrl: "/" })}
                                            className="text-xs font-medium text-muted-foreground hover:text-primary flex items-center mt-1"
                                        >
                                            <LogOut className="mr-1 h-3 w-3" />
                                            Sign out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className={`flex flex-1 flex-col transition-all duration-300 ${
                sidebarCollapsed ? "md:pl-16" : "md:pl-64"
            }`}>
                <main className="flex-1">
                    <div className="py-6">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
