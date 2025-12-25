"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  CheckCircle2,
  Flame,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Timer,
  Wand2,
  Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const highlights = [
  {
    icon: Wand2,
    title: "Resume Overhaul",
    body: "Tailor your resume to the JD with quantifiable wins and language that actually matches what they ask for.",
  },
  {
    icon: Target,
    title: "Signal-Aware Matching",
    body: "See how your experience maps to the role, where the gaps are, and what to emphasize in your story.",
  },
  {
    icon: MessageCircle,
    title: "Outreach That Lands",
    body: "Draft LinkedIn openers, follow-up emails, and short notes that sound like you—not a template.",
  },
]

const steps = [
  {
    icon: Sparkles,
    title: "Drop the details",
    body: "Paste the job description, add your resume, and optionally link your LinkedIn profile.",
  },
  {
    icon: Flame,
    title: "Tune your story",
    body: "Regenerate bullets, reorder wins, and align your pitch with the role and team you&apos;re targeting.",
  },
  {
    icon: CheckCircle2,
    title: "Reach out & prep",
    body: "Send LinkedIn messages, follow-up emails, and review a focused list of interview prep topics.",
  },
]

const stats = [
  { label: "Resume to first draft outreach", value: "9m" },
  { label: "Roles managed from one view", value: "25+" },
  { label: "Channels covered (resume, LinkedIn, email, prep)", value: "4" },
]

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()

  const handleGetStarted = () => {
    if (session) {
      router.push("/dashboard")
    } else {
      router.push("/auth/signin")
    }
  }

  return (
    <div className="relative min-h-screen selection:bg-orange-500/30">
      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -left-[10%] top-[5%] h-[500px] w-[500px] rounded-full bg-white/5 blur-[140px]" />
        <div className="absolute -right-[10%] bottom-[5%] h-[500px] w-[500px] rounded-full bg-slate-900 blur-[160px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 py-8 md:px-10">
        <header className="mb-20 flex items-center justify-between rounded-full border border-white/10 bg-black/40 px-6 py-3 backdrop-blur-xl">
          <Link href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-black shadow-lg shadow-black/40">
              ns
            </div>
            <span className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
              NextStep
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {["Process", "Features"].map((item) => (
              <Link
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            {session ? (
              <Button
                variant="ghost"
                className="rounded-full text-slate-400 hover:text-white"
                onClick={() => signOut()}
              >
                Sign out
              </Button>
            ) : (
              <Link
                href="/auth/signin"
                className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
              >
                Sign in
              </Link>
            )}
            <Button
              onClick={handleGetStarted}
              className="rounded-full bg-foreground px-6 font-semibold text-background transition-transform hover:translate-y-[-1px] active:translate-y-[1px]"
            >
              {session ? "Dashboard" : "Get Started"}
            </Button>
          </div>
        </header>

        <main className="space-y-32">
          {/* Hero Section */}
          <section className="pt-8 sm:pt-16">
            <div className="mx-auto flex max-w-5xl flex-col gap-10 sm:flex-row sm:items-center">
              {/* Text column */}
              <div className="flex-1 space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-muted-foreground" />
                  <span>AI for the boring parts of job search</span>
                </div>

                <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                  Land interviews faster,
                  <span className="block text-muted-foreground/80">
                    without rewriting your resume every time.
                  </span>
                </h1>

                <p className="max-w-xl text-base text-muted-foreground">
                  NextStep tailors your resume to each role, scores fit against the JD, and drafts recruiter-ready
                  outreach — so you spend less time tweaking and more time talking to humans.
                </p>

                <div className="flex flex-wrap items-center gap-4">
                  <Button
                    size="lg"
                    onClick={handleGetStarted}
                    className="group rounded-full bg-foreground px-7 py-5 text-sm font-medium text-background shadow-xl shadow-black/50 transition-transform hover:translate-y-[-1px] hover:shadow-[0_18px_60px_rgba(0,0,0,0.8)]"
                  >
                    {session ? "Open dashboard" : "Get started in minutes"}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>

                  <button
                    type="button"
                    onClick={handleGetStarted}
                    className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    See how it works
                  </button>
                </div>

                {/* Removed extra marketing badges for a cleaner hero */}
              </div>

              {/* Simple right column hint / stats */}
              <div className="flex-1">
                <div className="glass-dark rounded-3xl border border-white/10 bg-black/40 p-5 shadow-xl">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      Software engineer role
                    </span>
                    <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[11px] font-medium text-emerald-300">
                      All signals ready
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-foreground">Senior Software Engineer · Remote · Growth stage</p>
                    <p className="text-muted-foreground">
                      NextStep tailors your resume to this JD, drafts the first LinkedIn message and follow-up email, and
                      gives you a focused interview prep plan in one place.
                    </p>
                  </div>
                  <div className="mt-6 grid grid-cols-3 gap-3 text-xs">
                    <div className="rounded-2xl bg-white/5 px-3 py-2">
                      <div className="text-[11px] text-muted-foreground">Resume tailored</div>
                      <div className="text-sm font-semibold text-foreground">x1 click</div>
                    </div>
                    <div className="rounded-2xl bg-white/5 px-3 py-2">
                      <div className="text-[11px] text-muted-foreground">LinkedIn + email</div>
                      <div className="text-sm font-semibold text-foreground">auto-drafted</div>
                    </div>
                    <div className="rounded-2xl bg-white/5 px-3 py-2">
                      <div className="text-[11px] text-muted-foreground">Interview prep</div>
                      <div className="text-sm font-semibold text-foreground">ready to review</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Feature Grid */}
          <section className="grid gap-6 md:grid-cols-3">
            {highlights.map((item) => (
              <div
                key={item.title}
                className="glass-dark group space-y-4 rounded-[1.75rem] border border-white/10 bg-black/40 p-7 transition-transform hover:-translate-y-1"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 text-muted-foreground ring-1 ring-white/10">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.body}</p>
              </div>
            ))}
          </section>

          {/* Stats Bar */}
          <section className="flex flex-wrap justify-between gap-10 rounded-[1.75rem] border border-white/10 bg-black/40 px-8 py-10 backdrop-blur-sm">
            {stats.map((stat) => (
              <div key={stat.label} className="max-w-xs space-y-1">
                <div className="text-3xl font-semibold text-foreground">{stat.value}</div>
                <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </section>

          {/* Process Section */}
          <section id="process" className="space-y-12 pb-20">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
                From job description to outreach and prep in one pass
              </h2>
              <p className="text-sm text-muted-foreground">
                A simple flow that keeps everything in one place — resume, JD, outreach, and interview prep.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step, idx) => (
                <div key={step.title} className="relative group">
                  {idx < 2 && (
                    <div className="absolute top-1/2 -right-4 hidden lg:block text-slate-800">
                      <ArrowRight className="h-8 w-8" />
                    </div>
                  )}
                  <div className="glass-dark space-y-5 rounded-3xl border border-white/10 bg-black/40 p-7 text-center transition-transform group-hover:-translate-y-1">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 text-muted-foreground ring-1 ring-white/10">
                      <step.icon className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h4 className="text-base font-semibold text-foreground">{step.title}</h4>
                      <p className="text-sm text-muted-foreground">{step.body}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Minimal footer spacer (content intentionally removed) */}
        <div className="h-10" />
      </div>
    </div>
  )
}
