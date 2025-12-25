"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState, useEffect, useMemo } from "react"
import axios from "axios"
import { Key, Shield, Save, AlertCircle, CheckCircle, ArrowLeft, Sparkles, Eye, EyeOff, TestTube, ExternalLink, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { motion } from "framer-motion"
import Link from "next/link"

// Available models for each provider
const PROVIDER_MODELS: Record<string, Array<{ value: string; label: string; description?: string }>> = {
    openai: [
        { value: "gpt-4o", label: "GPT-4o", description: "Latest and most capable (May 2024)" },
        { value: "gpt-4o-mini", label: "GPT-4o Mini", description: "Faster and cheaper (May 2024)" },
        { value: "o1-preview", label: "O1 Preview", description: "Advanced reasoning model (Jan 2025)" },
        { value: "o1-mini", label: "O1 Mini", description: "Fast reasoning model (Jan 2025)" },
        { value: "gpt-4-turbo", label: "GPT-4 Turbo", description: "High performance" },
        { value: "gpt-4-turbo-preview", label: "GPT-4 Turbo Preview", description: "Preview version" },
        { value: "gpt-4-0125-preview", label: "GPT-4 (0125)", description: "January 2025 preview" },
        { value: "gpt-4-1106-preview", label: "GPT-4 (1106)", description: "November 2024 preview" },
        { value: "gpt-4", label: "GPT-4", description: "Standard GPT-4" },
        { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo", description: "Fast and affordable" },
    ],
    anthropic: [
        { value: "claude-3-5-sonnet-20241022", label: "Claude 3.5 Sonnet (Oct 2024)", description: "Latest - Most capable" },
        { value: "claude-3-5-haiku-20241022", label: "Claude 3.5 Haiku (Oct 2024)", description: "Latest - Fast and efficient" },
        { value: "claude-3-5-sonnet-20240620", label: "Claude 3.5 Sonnet (Jun 2024)", description: "Previous version" },
        { value: "claude-3-opus-20240229", label: "Claude 3 Opus", description: "Most powerful" },
        { value: "claude-3-sonnet-20240229", label: "Claude 3 Sonnet", description: "Balanced performance" },
        { value: "claude-3-haiku-20240307", label: "Claude 3 Haiku", description: "Fast and efficient" },
    ],
    gemini: [
        { value: "gemini-2.0-flash-exp", label: "Gemini 2.0 Flash (Experimental)", description: "Latest experimental model" },
        { value: "gemini-1.5-pro-latest", label: "Gemini 1.5 Pro (Latest)", description: "Most capable - latest version" },
        { value: "gemini-1.5-flash-latest", label: "Gemini 1.5 Flash (Latest)", description: "Fast - latest version" },
        { value: "gemini-1.5-pro", label: "Gemini 1.5 Pro", description: "Most capable" },
        { value: "gemini-1.5-flash", label: "Gemini 1.5 Flash", description: "Fast and efficient" },
        { value: "gemini-pro", label: "Gemini Pro", description: "Standard model" },
    ],
}

const PROVIDER_INFO: Record<string, { name: string; getKeyUrl: string; description: string }> = {
    openai: {
        name: "OpenAI",
        getKeyUrl: "https://platform.openai.com/api-keys",
        description: "Powerful language models including GPT-4 and GPT-3.5",
    },
    anthropic: {
        name: "Anthropic Claude",
        getKeyUrl: "https://console.anthropic.com/settings/keys",
        description: "Advanced AI assistant with strong reasoning capabilities",
    },
    gemini: {
        name: "Google Gemini",
        getKeyUrl: "https://aistudio.google.com/app/apikey",
        description: "Google's latest AI models with multimodal capabilities",
    },
}

// Helper function to get default model for each provider (always returns the latest)
function getDefaultModel(provider: string): string {
    const models = PROVIDER_MODELS[provider]
    if (!models || models.length === 0) return "gpt-4o"
    // Return the first model (which should be the latest)
    return models[0].value
}

export default function SettingsPage() {
    const { data: session, status: sessionStatus } = useSession()
    const router = useRouter()
    const [apiKey, setApiKey] = useState("")
    const [provider, setProvider] = useState("openai")
    const [model, setModel] = useState("gpt-4o")
    const [apiKeyMasked, setApiKeyMasked] = useState("")
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [showApiKey, setShowApiKey] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null)

    // Update model when provider changes
    useEffect(() => {
        const models = PROVIDER_MODELS[provider]
        if (models && !models.some(m => m.value === model)) {
            setModel(getDefaultModel(provider))
        }
    }, [provider])

    const availableModels = useMemo(() => {
        return PROVIDER_MODELS[provider] || []
    }, [provider])

    const providerInfo = PROVIDER_INFO[provider] || PROVIDER_INFO.openai

    useEffect(() => {
        if (sessionStatus === "authenticated") {
            fetchSettings()
        }
    }, [sessionStatus])

    const fetchSettings = async () => {
        try {
            const tokenResponse = await fetch("/api/auth/token")
            const tokenData = await tokenResponse.json()
            const token = tokenData.token || ""

            const response = await axios.get(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/settings`,
                { headers: { Authorization: `Bearer ${token}` } }
            )

            setApiKeyMasked(response.data.api_key_masked || "")
            setProvider(response.data.ai_provider || "openai")
            setModel(response.data.model_preference || getDefaultModel(response.data.ai_provider || "openai"))
        } catch (error) {
            console.error("Failed to fetch settings", error)
        } finally {
            setLoading(false)
        }
    }

    const handleTestConnection = async () => {
        if (!apiKey.trim()) {
            setTestResult({ success: false, message: "Please enter an API key first" })
            return
        }

        setTesting(true)
        setTestResult(null)

        try {
            // Use Next.js API route proxy
            const response = await axios.post(
                "/api/settings/test",
                {
                    ai_provider: provider,
                    api_key: apiKey.trim(),
                    model_preference: model,
                },
                { timeout: 15000 }
            )

            if (response.data.success) {
                setTestResult({ success: true, message: response.data.message || "Connection successful! Your API key is working." })
            } else {
                setTestResult({ success: false, message: response.data.error || "Connection test failed." })
            }
        } catch (error: any) {
            const errorMsg = error.response?.data?.error || 
                           error.response?.data?.detail || 
                           error.message || 
                           "Connection failed. Please check your API key."
            setTestResult({ success: false, message: errorMsg })
        } finally {
            setTesting(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage(null)
        setTestResult(null)

        try {
            const tokenResponse = await fetch("/api/auth/token")
            const tokenData = await tokenResponse.json()
            const token = tokenData.token || ""

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/settings`,
                {
                    ai_provider: provider,
                    api_key: apiKey.trim() || undefined,
                    model_preference: model,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            )

            setMessage({ type: "success", text: "Settings saved successfully!" })
            setApiKey("")
            fetchSettings()
        } catch (error: any) {
            setMessage({
                type: "error",
                text: error.response?.data?.detail || "Failed to save settings. Please try again.",
            })
        } finally {
            setSaving(false)
        }
    }

    if (sessionStatus === "loading" || loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-t-2 border-white"></div>
            </div>
        )
    }

    if (!session) {
        router.push("/")
        return null
    }

    return (
        <div className="min-h-screen bg-black relative">
            {/* Background Pattern */}
            <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-10 pointer-events-none" />
            
            {/* Floating Top Bar - Left */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="fixed top-4 left-4 z-50"
            >
                <Link
                    href="/dashboard"
                    className="glass rounded-full border border-white/10 bg-black/40 px-4 py-2.5 text-foreground hover:bg-white/5 backdrop-blur-xl transition-all hover:scale-105 flex items-center gap-2 shadow-lg"
                >
                    <ArrowLeft className="h-4 w-4 text-white" />
                    <span className="hidden sm:block text-sm font-semibold text-white">Back</span>
                </Link>
            </motion.div>

            <div className="relative mx-auto max-w-4xl px-6 pt-20 pb-8 md:px-8">
                <main className="space-y-4">
                    {/* Header Section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-4"
                    >
                        <h1 className="mb-1 text-2xl font-bold text-white">
                            AI Provider Settings
                        </h1>
                        <p className="text-xs text-slate-400">Configure your AI provider API key</p>
                    </motion.div>

                    {/* Settings Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 }}
                        className="glass-dark rounded-xl border border-white/10 bg-black/50 p-4 backdrop-blur-3xl shadow-2xl"
                    >
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-white">Configuration</h2>
                        </div>
                        <div>
                                <form onSubmit={handleSave} className="space-y-4">
                                    {/* Provider Selection */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="provider" className="text-xs font-medium text-slate-400">
                                            AI Provider
                                        </Label>
                                    <div className="relative">
                                        <select
                                                id="provider"
                                            value={provider}
                                                onChange={(e) => {
                                                    setProvider(e.target.value)
                                                    setModel(getDefaultModel(e.target.value))
                                                }}
                                                className="flex h-10 w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-black/40 px-3 pr-8 text-sm text-white transition-all hover:border-white/20 focus:ring-1 focus:ring-white/20 backdrop-blur-xl"
                                            >
                                                {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                                                    <option key={key} value={key} className="bg-black text-white">
                                                        {info.name}
                                                    </option>
                                                ))}
                                        </select>
                                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                                                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </div>
                                        </div>
                                        <Link
                                            href={providerInfo.getKeyUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1"
                                        >
                                            Get API key <ExternalLink className="h-3 w-3" />
                                        </Link>
                                </div>

                                    {/* Model Selection */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="model" className="text-xs font-medium text-slate-400">
                                            Model
                                        </Label>
                                        <div className="relative">
                                            <select
                                                id="model"
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                                className="flex h-10 w-full cursor-pointer appearance-none rounded-lg border border-white/10 bg-black/40 px-3 pr-8 text-sm text-white transition-all hover:border-white/20 focus:ring-1 focus:ring-white/20 backdrop-blur-xl"
                                            >
                                                {availableModels.map((modelOption) => (
                                                    <option key={modelOption.value} value={modelOption.value} className="bg-black text-white">
                                                        {modelOption.label}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                                                <svg className="h-3.5 w-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                </div>
                                </div>
                            </div>

                                    {/* API Key Input */}
                                    <div className="space-y-1.5">
                                        <Label htmlFor="api-key" className="text-xs font-medium text-slate-400">
                                            API Key
                                        </Label>
                                <div className="relative">
                                    <Input
                                                id="api-key"
                                                type={showApiKey ? "text" : "password"}
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                                placeholder={apiKeyMasked ? `Current: ${apiKeyMasked}` : `Enter ${providerInfo.name} API key...`}
                                                className="h-10 rounded-lg border-white/10 bg-black/40 px-3 pr-20 text-sm text-white placeholder:text-slate-600 focus:ring-1 focus:ring-white/20 backdrop-blur-xl"
                                            />
                                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowApiKey(!showApiKey)}
                                                    className="p-1.5 hover:bg-white/5 rounded transition-colors"
                                                    title={showApiKey ? "Hide" : "Show"}
                                                >
                                                    {showApiKey ? (
                                                        <EyeOff className="h-3.5 w-3.5 text-slate-400" />
                                                    ) : (
                                                        <Eye className="h-3.5 w-3.5 text-slate-400" />
                                                    )}
                                                </button>
                                            </div>
                                </div>
                            </div>

                                    {/* Test Connection */}
                                    {apiKey.trim() && (
                                        <div className="space-y-1.5">
                                            <Button
                                                type="button"
                                                onClick={handleTestConnection}
                                                disabled={testing || !apiKey.trim()}
                                                variant="outline"
                                                className="w-full h-9 rounded-lg border-white/10 bg-black/40 text-white hover:bg-white/10 backdrop-blur-xl text-xs"
                                            >
                                                <TestTube className="h-3.5 w-3.5 mr-1.5" />
                                                {testing ? "Testing..." : "Test Connection"}
                                            </Button>
                                            {testResult && (
                                                <div className={`p-2 rounded-lg border flex items-start gap-2 text-xs ${
                                                    testResult.success
                                                        ? "bg-green-500/10 border-green-500/20 text-green-400"
                                                        : "bg-red-500/10 border-red-500/20 text-red-400"
                                                }`}>
                                                    {testResult.success ? (
                                                        <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                    ) : (
                                                        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                                    )}
                                                    <p className="text-xs">{testResult.message}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Messages */}
                            {message && (
                                        <div className={`p-2.5 rounded-lg border flex items-center gap-2 text-xs ${
                                            message.type === "success"
                                                ? "bg-green-500/10 border-green-500/20 text-green-400"
                                                : "bg-red-500/10 border-red-500/20 text-red-400"
                                        }`}>
                                            {message.type === "success" ? (
                                                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                            ) : (
                                                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                            )}
                                            <p className="text-xs font-medium">{message.text}</p>
                                </div>
                            )}

                                    {/* Save Button */}
                                    <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                            className="w-full h-9 rounded-lg bg-white font-medium text-black text-sm transition-all hover:bg-white/90"
                                        >
                                            {saving ? (
                                                <>
                                                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-black border-t-transparent mr-1.5" />
                                                    Saving...
                                                </>
                                            ) : (
                                                <>
                                                    <Save className="h-3.5 w-3.5 mr-1.5" />
                                                    Save Settings
                                                </>
                                            )}
                                </Button>
                                    </div>
                        </form>
                        </div>
                    </motion.div>

                    {/* Security Info */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="glass-dark rounded-xl border border-white/10 bg-black/50 p-3 backdrop-blur-3xl shadow-2xl"
                    >
                        <div className="flex items-start gap-2.5">
                            <Shield className="h-3.5 w-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                            <div>
                                <h3 className="text-xs font-medium text-white mb-1">Security & Privacy</h3>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    API keys are encrypted and only used for generating resume improvements and messages.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </main>
                </div>
        </div>
    )
}
