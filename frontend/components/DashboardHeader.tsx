"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { Sparkles, LogOut, LayoutDashboard, Settings } from "lucide-react"

export default function DashboardHeader() {
    const { data: session } = useSession()

    return (
        <header className="mb-12 flex items-center justify-between rounded-full border border-white/5 bg-black/30 px-4 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black shadow-lg shadow-black/40">
                        ns
                    </div>
                    <span className="hidden text-sm font-semibold uppercase tracking-[0.3em] text-muted-foreground/80 sm:block">
                        NextStep
                    </span>
                </Link>
                <nav className="hidden items-center gap-1 md:flex">
                    <Link
                        href="/dashboard"
                        className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white shadow-sm shadow-white/10 transition-all hover:bg-white/15"
                    >
                        <LayoutDashboard className="h-4 w-4" />
                        Cockpit
                    </Link>
                    <Link
                        href="/dashboard/settings"
                        className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium uppercase tracking-widest text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
                    >
                        <Settings className="h-4 w-4" />
                        Settings
                    </Link>
                </nav>
            </div>

            <div className="flex items-center gap-4">
                <div className="hidden lg:flex flex-col items-end">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                        Pilot
                    </span>
                    <span className="text-sm font-medium text-foreground">{session?.user?.email}</span>
                </div>
                <button
                    onClick={() => signOut()}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 shadow-sm shadow-black/40 transition-all hover:border-red-400/60 hover:bg-red-500/10 hover:text-red-300 hover:shadow-red-500/30"
                    title="Sign out"
                >
                    <LogOut className="h-4 w-4" />
                </button>
            </div>
        </header>
    )
}
