"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import axios from "axios"

// Helper function to get default model for each provider
function getDefaultModel(provider: string): string {
    switch (provider) {
        case "openai":
            return "gpt-4-turbo-preview"
        case "anthropic":
            return "claude-3-opus-20240229"
        case "gemini":
            return "gemini-pro"
        case "groq":
            return "llama-3-70b-8192"
        case "huggingface":
            return "mistralai/Mixtral-8x7B-Instruct-v0.1"
        default:
            return "gpt-4-turbo-preview"
    }
}

export default function SettingsPage() {
    const router = useRouter()
    const { data: session, status } = useSession()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        ai_provider: "openai",
        api_key: "",
        api_key_masked: "",
        model_preference: "gpt-4-turbo-preview",
    })
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (status === "loading") return
        if (!session) {
            router.push("/auth/signin")
            return
        }
        fetchSettings()
    }, [session, status, router])

    const fetchSettings = async () => {
        try {
            if (!session) return

            // Get token from NextAuth API route (same pattern as other components)
            const tokenResponse = await fetch("/api/auth/token")
            if (!tokenResponse.ok) {
                throw new Error("Failed to get authentication token")
            }
            const tokenData = await tokenResponse.json()
            const token = tokenData.token || session.accessToken || (session.user as any)?.id || ""

            if (!token) {
                router.push("/auth/signin")
                return
            }

            const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/settings`, {
                headers: { Authorization: `Bearer ${token}` },
            })

            setSettings({
                ai_provider: response.data.ai_provider || "openai",
                api_key: "", // Don't populate with masked key - let user enter new one
                api_key_masked: response.data.api_key_masked || "",
                model_preference: response.data.model_preference || getDefaultModel(response.data.ai_provider || "openai"),
            })
        } catch (error) {
            console.error("Failed to fetch settings", error)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setMessage("")

        try {
            if (!session) {
                router.push("/auth/signin")
                return
            }

            // Get token from NextAuth API route (same pattern as other components)
            const tokenResponse = await fetch("/api/auth/token")
            if (!tokenResponse.ok) {
                throw new Error("Failed to get authentication token")
            }
            const tokenData = await tokenResponse.json()
            const token = tokenData.token || session.accessToken || (session.user as any)?.id || ""

            await axios.put(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/api/settings`,
                {
                    ai_provider: settings.ai_provider,
                    api_key: settings.api_key.trim() || undefined, // Only send if user entered a new key
                    model_preference: settings.model_preference || undefined,
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            )
            setMessage("Settings saved successfully!")
            // Clear the input field and refresh to get updated masked key
            setSettings(prev => ({ ...prev, api_key: "" }))
            fetchSettings() // Refresh to get masked key back
        } catch (error) {
            console.error("Failed to save settings", error)
            setMessage("Failed to save settings. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    if (status === "loading" || loading) {
        return <div className="p-8 text-center">Loading settings...</div>
    }

    if (!session) {
        return null
    }

    return (
        <div className="container max-w-2xl py-10">
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">API Settings</h1>
                <p className="text-muted-foreground">
                    Configure your AI provider and API keys for resume improvements and message generation
                </p>
            </div>

            <div className="bg-card border rounded-lg p-6 shadow-sm">
                <h2 className="text-xl font-semibold mb-4">AI Provider Configuration</h2>
                <p className="text-muted-foreground mb-6">
                    Configure which AI provider you want to use for resume improvements and message generation.
                </p>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="provider" className="text-sm font-medium">
                            AI Provider
                        </label>
                        <select
                            id="provider"
                            value={settings.ai_provider}
                            onChange={(e) => {
                                const newProvider = e.target.value
                                setSettings({ 
                                    ...settings, 
                                    ai_provider: newProvider,
                                    model_preference: settings.model_preference || getDefaultModel(newProvider)
                                })
                            }}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="openai">OpenAI</option>
                            <option value="anthropic">Anthropic (Claude)</option>
                            <option value="gemini">Google Gemini</option>
                            <option value="groq">Groq</option>
                            <option value="huggingface">HuggingFace</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="apiKey" className="text-sm font-medium">
                            API Key
                        </label>
                        {settings.api_key_masked && !settings.api_key && (
                            <p className="text-xs text-muted-foreground mb-2">
                                Current key: {settings.api_key_masked} (enter new key to update)
                            </p>
                        )}
                        <input
                            id="apiKey"
                            type="password"
                            value={settings.api_key}
                            onChange={(e) => setSettings({ ...settings, api_key: e.target.value })}
                            placeholder={settings.api_key_masked ? "Enter new API key (leave blank to keep current)" : "sk-... or gsk_... or ..."}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <p className="text-xs text-muted-foreground">
                            Your API key is stored securely and only used for your requests. Leave blank to keep your existing key.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="model" className="text-sm font-medium">
                            Model Preference (Optional)
                        </label>
                        <input
                            id="model"
                            type="text"
                            value={settings.model_preference}
                            onChange={(e) => setSettings({ ...settings, model_preference: e.target.value })}
                            placeholder={
                                settings.ai_provider === "openai" ? "e.g. gpt-4-turbo-preview, gpt-4, gpt-3.5-turbo" :
                                settings.ai_provider === "anthropic" ? "e.g. claude-3-opus-20240229, claude-3-sonnet-20240229" :
                                settings.ai_provider === "gemini" ? "e.g. gemini-pro, gemini-pro-vision" :
                                settings.ai_provider === "groq" ? "e.g. llama-3-70b-8192, llama-3-8b-8192" :
                                settings.ai_provider === "huggingface" ? "e.g. mistralai/Mixtral-8x7B-Instruct-v0.1" :
                                "e.g. model-name"
                            }
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        />
                        <p className="text-xs text-muted-foreground">
                            {settings.ai_provider === "openai" && "Default: gpt-4-turbo-preview (best model)"}
                            {settings.ai_provider === "anthropic" && "Default: claude-3-opus-20240229 (best model)"}
                            {settings.ai_provider === "gemini" && "Default: gemini-pro"}
                            {settings.ai_provider === "groq" && "Default: llama-3-70b-8192 (best model)"}
                            {settings.ai_provider === "huggingface" && "Default: mistralai/Mixtral-8x7B-Instruct-v0.1 (best model)"}
                            {!settings.ai_provider && "Leave empty to use default model for selected provider"}
                        </p>
                    </div>

                    {message && (
                        <div className={`p-3 rounded-md text-sm ${message.includes("success") ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}>
                            {message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                    >
                        {saving ? "Saving..." : "Save Configuration"}
                    </button>
                </form>
            </div>
        </div>
    )
}
